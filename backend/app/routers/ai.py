from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
import base64
import json
import logging
import traceback
import io
import PyPDF2
from PIL import Image
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..services.gemini_service import gemini_service
from ..security import (
    limiter, validate_file, validate_upload, sanitize_input,
    validate_question_input, log_security_event,
    RATE_LIMITS
)
from ..core.failure_logger import log_ai_error, log_parse_error, log_unsupported_format
from ..core.prompt_loader import get_prompt_version

router = APIRouter(tags=["ai"])

LANGUAGE_INSTRUCTIONS = {
    "en": "Respond in English.",
    "es": "Responde siempre en español formal.",
    "fr": "Réponds toujours en français formel.",
    "zh": "请始终用简体中文回复。",
    "hi": "हमेशा औपचारिक हिंदी में जवाब दें।",
}

def get_language_instruction(request: Request) -> str:
    locale = request.headers.get("X-Language", "en")
    return LANGUAGE_INSTRUCTIONS.get(locale, LANGUAGE_INSTRUCTIONS["en"])

class PolicyTextRequest(BaseModel):
    policy_text: str

    @validator('policy_text')
    def validate_policy_text(cls, v):
        if not v or not v.strip():
            raise ValueError('Policy text cannot be empty')
        if len(v.strip()) < 100:
            raise ValueError('Policy text too short to be valid')
        if len(v) > 50000:  # 50KB limit
            raise ValueError('Policy text too long')
        return sanitize_input(v)

class QuestionRequest(BaseModel):
    question: str
    policy_data: Dict[str, Any]
    conversation_history: Optional[List[Dict[str, str]]] = None

    @validator('question')
    def validate_question(cls, v):
        if not v or not v.strip():
            raise ValueError('Question cannot be empty')
        if len(v.strip()) < 3:
            raise ValueError('Question too short')
        if len(v) > 1000:
            raise ValueError('Question too long')
        return sanitize_input(v)

class BillValidationRequest(BaseModel):
    bill_image_base64: str
    policy_data: Dict[str, Any]

    @validator('bill_image_base64')
    def validate_base64(cls, v):
        if not v:
            raise ValueError('Bill image cannot be empty')
        # Basic base64 validation
        try:
            base64.b64decode(v)
        except Exception:
            raise ValueError('Invalid base64 format')
        return v

class OptimizationRequest(BaseModel):
    policy_data: Dict[str, Any]
    user_needs: Dict[str, Any]

class PreVisitRequest(BaseModel):
    visit_type: str
    policy_data: Dict[str, Any]
    provider_info: Optional[Dict[str, Any]] = None

    @validator('visit_type')
    def validate_visit_type(cls, v):
        valid_types = ['primary_care', 'specialist', 'emergency', 'urgent_care', 'surgery', 'imaging', 'lab_work']

        # Normalize: lowercase, strip, replace spaces/slashes with underscores
        normalized = v.lower().strip().split('/')[0].strip().replace(' ', '_')

        # Try to match against valid types
        if normalized in valid_types:
            return normalized

        # Fuzzy match: check if any valid type is contained in input
        for vt in valid_types:
            if vt in normalized or normalized in vt:
                return vt

        raise ValueError(f'Invalid visit type. Must be one of: {valid_types}')

class AppealRequest(BaseModel):
    denial_info: Dict[str, Any]
    policy_data: Dict[str, Any]
    tone: str = "professional"

    @validator('tone')
    def validate_tone(cls, v):
        valid_tones = ['professional', 'emphatic', 'detailed', 'concise']
        if v not in valid_tones:
            raise ValueError(f'Invalid tone. Must be one of: {valid_tones}')
        return v

@router.get("/health")
async def ai_health():
    """Check if AI service is configured."""
    return {
        "status": "ok",
        "ai_configured": gemini_service.is_configured(),
        "model": "gemini-2.5-flash" if gemini_service.is_configured() else None
    }

@router.get("/models")
async def list_models():
    """List available Gemini models."""
    try:
        # Since we're using the new SDK through gemini_service, return the model we're using
        if gemini_service.is_configured():
            return {
                "models": [
                    {
                        "name": "gemini-2.5-flash",
                        "display_name": "Gemini 2.5 Flash",
                        "description": "Fast and efficient multimodal model",
                        "input_token_limit": 1048576,  # 1M tokens
                        "supported_generation_methods": ["generateContent"]
                    }
                ]
            }
        else:
            return {"models": [], "error": "AI service not configured"}
    except Exception as e:
        return {"error": str(e)}

@router.post("/analyze-policy")
@limiter.limit("10/minute")
async def analyze_policy(request: Request, body: PolicyTextRequest):
    """Analyze insurance policy text and extract all parameters."""
    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")

    try:
        result = await gemini_service.analyze_insurance_policy(body.policy_text)
        if "error" in result:
            log_security_event("ai_analysis_failed", {"error": result["error"]}, request)
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_ai_error(
            endpoint="/api/v1/ai/analyze-policy",
            error=e,
            context={"prompt_version": get_prompt_version("policy_analysis")},
        )
        log_security_event("ai_analysis_error", {"error": str(e)}, request)
        raise HTTPException(status_code=500, detail="Policy analysis failed")

@router.post("/upload-policy")
@limiter.limit("10/minute")
async def upload_policy(request: Request, file: UploadFile = File(...)):
    """Upload and analyze a policy document (PDF or image)."""
    import logging
    logger = logging.getLogger(__name__)

    logger.info(f"Received file upload: {file.filename}, content_type: {file.content_type}")

    # Validate file security
    validation_result = validate_file(file)
    if not validation_result['valid']:
        log_security_event("file_upload_rejected", validation_result, request)
        raise HTTPException(status_code=400, detail=validation_result['error'])

    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")

    # Validate file type
    filename = file.filename.lower() if file.filename else ""
    allowed_extensions = ('.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp')

    if not filename.endswith(allowed_extensions):
        log_unsupported_format(
            endpoint="/api/v1/ai/upload-policy",
            file_type=file.content_type or "unknown",
            file_size_kb=0,
        )
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    try:
        content = await file.read()
        validate_upload(file, content)
        logger.info(f"Read {len(content)} bytes from file")

        policy_text = ""

        # Extract text based on file type
        if filename.endswith('.pdf'):
            logger.info("Processing PDF file")
            try:
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
                for page in pdf_reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        policy_text += extracted + "\n"
                logger.info(f"Extracted {len(policy_text)} characters from PDF")
            except Exception as pdf_error:
                logger.error(f"PDF extraction failed: {pdf_error}")
                raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(pdf_error)}")
        else:
            # For images, use Gemini's vision capability through gemini_service
            logger.info("Processing image file")
            try:
                from PIL import Image
                image = Image.open(io.BytesIO(content))
                logger.info(f"Image size: {image.size}, format: {image.format}")

                # Convert image to base64 for gemini_service
                import base64
                image_buffer = io.BytesIO()
                image.save(image_buffer, format=image.format or 'PNG')
                image_base64 = base64.b64encode(image_buffer.getvalue()).decode('utf-8')

                # Use gemini_service to extract text from image
                text_extraction_prompt = "Extract all text from this insurance policy document. Return only the extracted text, nothing else."

                policy_text = gemini_service.vision_generate(
                    text_extraction_prompt,
                    image_base64,
                    f"image/{(image.format or 'PNG').lower()}",
                )
                logger.info(f"Extracted {len(policy_text)} characters from image")
            except Exception as img_error:
                logger.error(f"Image processing failed: {img_error}")
                raise HTTPException(status_code=400, detail=f"Failed to process image: {str(img_error)}")

        if not policy_text or len(policy_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from the document. Please ensure it's a clear policy document."
            )

        # Analyze the extracted text
        logger.info("Analyzing policy text with AI")
        result = await gemini_service.analyze_insurance_policy(policy_text)

        if "error" in result:
            logger.error(f"AI analysis failed: {result['error']}")
            raise HTTPException(status_code=500, detail=result["error"])

        logger.info("Policy analysis complete")
        return {
            "policy_data": result,
            "extracted_text_length": len(policy_text),
            "source_file": file.filename
        }

    except HTTPException:
        raise
    except Exception as e:
        log_ai_error(
            endpoint="/api/v1/ai/upload-policy",
            error=e,
            context={
                "prompt_version": get_prompt_version("policy_analysis"),
                "file_type": file.content_type,
                "file_size_kb": round(len(content) / 1024, 1) if 'content' in dir() else None,
            },
        )
        logger.error(f"Unexpected error processing policy: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process policy: {str(e)}")

@router.post("/ask-question")
@limiter.limit("30/minute")
async def ask_policy_question(request: Request, body: QuestionRequest):
    """Ask a question about the insurance policy."""
    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")

    try:
        language_instruction = get_language_instruction(request)
        result = await gemini_service.answer_policy_question(
            body.question,
            body.policy_data,
            body.conversation_history,
            language_instruction=language_instruction
        )
        if "error" in result:
            log_security_event("question_failed", {"error": result["error"]}, request)
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_ai_error(
            endpoint="/api/v1/ai/ask-question",
            error=e,
            context={"prompt_version": get_prompt_version("ask_question")},
        )
        log_security_event("question_error", {"error": str(e)}, request)
        raise HTTPException(status_code=500, detail="Failed to process question")

@router.post("/validate-bill")
@limiter.limit("10/minute")
async def validate_bill(request: Request, body: BillValidationRequest):
    """Validate a bill image against the policy."""
    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")

    try:
        language_instruction = get_language_instruction(request)
        result = await gemini_service.validate_bill_against_policy(
            body.bill_image_base64,
            body.policy_data,
            language_instruction=language_instruction
        )
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_ai_error(
            endpoint="/api/v1/ai/validate-bill",
            error=e,
            context={"prompt_version": get_prompt_version("bill_validation")},
        )
        raise HTTPException(status_code=500, detail="Bill validation failed. Please try again.")

@router.post("/upload-bill")
@limiter.limit("10/minute")
async def upload_bill(
    request: Request,
    file: UploadFile = File(...),
    policy_data: str = Form(...)
):
    """Upload a bill image and validate against policy."""
    logger = logging.getLogger(__name__)

    logger.info(f"=== UPLOAD BILL START ===")
    logger.info(f"Filename: {file.filename}, Content-Type: {file.content_type}")
    logger.info(f"Gemini configured: {gemini_service.gemini_configured}, Provider configured: {gemini_service.provider_configured}")

    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")

    if not gemini_service.gemini_configured:
        raise HTTPException(
            status_code=503,
            detail="Image processing requires Gemini configuration. Check GEMINI_API_KEY."
        )

    # Validate file before reading
    validation_result = validate_file(file)
    if not validation_result['valid']:
        log_security_event("file_upload_rejected", validation_result, request)
        raise HTTPException(status_code=400, detail=validation_result['error'])

    # Read file content
    try:
        content = await file.read()
    except Exception as e:
        logger.error(f"Failed to read uploaded bill: {e}")
        raise HTTPException(status_code=400, detail="Could not read the uploaded file.")

    # Validate content type, size, and emptiness
    if file.content_type not in {"image/jpeg", "image/png", "image/webp", "application/pdf"}:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {file.content_type}")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds 10MB limit.")

    # Parse policy data
    try:
        policy = json.loads(policy_data)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid policy data JSON: {str(e)}")

    try:
        logger.info(f"Bill upload: filename={file.filename}, content_type={file.content_type}, size={len(content)}")
        language_instruction = get_language_instruction(request)
        logger.info(f"Language instruction: {language_instruction[:50] if language_instruction else 'None'}")

        if file.content_type == "application/pdf":
            # Try PyPDF2 first -- faster and does not use Gemini quota
            try:
                reader = PyPDF2.PdfReader(io.BytesIO(content))
                extracted_text = "\n".join(
                    page.extract_text() or "" for page in reader.pages
                ).strip()
                logger.info(f"PyPDF2 extracted {len(extracted_text)} chars from bill PDF")
            except Exception as e:
                logger.warning(f"PyPDF2 failed on bill PDF: {e}, falling back to Gemini")
                extracted_text = ""

            if not extracted_text:
                # Gemini document fallback for scanned/image PDFs
                extracted_text = gemini_service.extract_text_from_pdf_image(content)

            image_base64 = base64.b64encode(content).decode('utf-8')
            result = await gemini_service.validate_bill_against_policy(
                image_base64, policy, language_instruction=language_instruction,
                pre_extracted_text=extracted_text,
            )
        else:
            # Image path -- JPEG, PNG, WebP
            image_base64 = base64.b64encode(content).decode('utf-8')
            logger.info(f"Base64 length: {len(image_base64)} chars")
            logger.info("Calling gemini_service.validate_bill_against_policy...")

            result = await gemini_service.validate_bill_against_policy(
                image_base64, policy, language_instruction=language_instruction,
                mime_type=file.content_type,
            )

        logger.info(f"Service returned result type: {type(result).__name__}, keys: {list(result.keys()) if isinstance(result, dict) else 'N/A'}")

        if isinstance(result, dict) and "error" in result:
            logger.error(f"Service returned error: {result['error']}")
            raise HTTPException(status_code=500, detail=result["error"])

        logger.info("=== UPLOAD BILL SUCCESS ===")
        return result

    except HTTPException:
        raise
    except Exception as e:
        log_ai_error(
            endpoint="/api/v1/ai/upload-bill",
            error=e,
            context={
                "prompt_version": get_prompt_version("bill_validation"),
                "file_type": file.content_type,
                "file_size_kb": round(len(content) / 1024, 1),
            },
        )
        logger.error(f"Bill validation failed: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Bill validation failed. Check that the image is clear and try again."
        )

@router.post("/optimize-policy")
@limiter.limit("10/minute")
async def optimize_policy(request: Request, body: OptimizationRequest):
    """Get optimization recommendations for the policy."""
    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")

    try:
        language_instruction = get_language_instruction(request)
        result = await gemini_service.recommend_policy_alternatives(
            body.policy_data,
            body.user_needs,
            language_instruction=language_instruction
        )
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_ai_error(
            endpoint="/api/v1/ai/optimize-policy",
            error=e,
            context={"prompt_version": get_prompt_version("policy_optimization")},
        )
        raise HTTPException(status_code=500, detail="Policy optimization failed. Please try again.")

@router.post("/pre-visit-checklist")
@limiter.limit("10/minute")
async def generate_pre_visit_checklist(request: Request, body: PreVisitRequest):
    """Generate a pre-visit checklist for a specific medical visit type."""
    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")

    try:
        language_instruction = get_language_instruction(request)
        result = await gemini_service.generate_pre_visit_checklist(
            body.visit_type,
            body.policy_data,
            body.provider_info,
            language_instruction=language_instruction
        )
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_ai_error(
            endpoint="/api/v1/ai/pre-visit-checklist",
            error=e,
            context={"prompt_version": get_prompt_version("pre_visit")},
        )
        raise HTTPException(status_code=500, detail="Pre-visit checklist generation failed. Please try again.")

@router.post("/generate-appeal")
@limiter.limit("10/minute")
async def generate_appeal_letter(request: Request, body: AppealRequest):
    """Generate an appeal letter for a denied claim."""
    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")

    try:
        language_instruction = get_language_instruction(request)
        result = await gemini_service.generate_appeal_letter(
            body.denial_info,
            body.policy_data,
            body.tone,
            language_instruction=language_instruction
        )
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_ai_error(
            endpoint="/api/v1/ai/generate-appeal",
            error=e,
            context={"prompt_version": get_prompt_version("appeal_letter")},
        )
        raise HTTPException(status_code=500, detail="Appeal letter generation failed. Please try again.")

@router.post("/upload-denial")
@limiter.limit("10/minute")
async def upload_denial_letter(
    request: Request,
    file: UploadFile = File(...),
    policy_data: str = Form(...),
    tone: str = Form("professional")
):
    """Upload a denial letter and generate appeal letter."""
    import logging
    logger = logging.getLogger(__name__)

    try:
        logger.info(f"[upload-denial] Starting upload process")
        logger.info(f"[upload-denial] File: {file.filename}, Type: {file.content_type}")

        if not gemini_service.is_configured():
            logger.error("[upload-denial] AI service not configured")
            raise HTTPException(status_code=503, detail="AI service not configured")

        import json
        policy = json.loads(policy_data)
        logger.info(f"[upload-denial] Policy data parsed successfully")

        content = await file.read()
        validate_upload(file, content)
        logger.info(f"[upload-denial] Read {len(content)} bytes from file")

        # Reset file pointer if needed
        await file.seek(0)

        logger.info(f"Denial upload: filename={file.filename}, content_type={file.content_type}, size={len(content)}")

        # First extract denial info from the uploaded document
        denial_extraction_prompt = """Extract the following information from this denial letter:
        - denial_date (when the denial was sent)
        - service_description (what was denied)
        - service_date (date of service)
        - amount_denied (numeric value)
        - denial_reason (why they denied it)
        - denial_code (if provided)
        - insurer_name (insurance company name)
        - claim_number (if provided)

        Return as JSON with these exact keys. Use null for any missing information."""

        if file.content_type == "application/pdf":
            # PyPDF2 handles text-based PDFs without using Gemini quota
            try:
                reader = PyPDF2.PdfReader(io.BytesIO(content))
                extracted_text = "\n".join(
                    page.extract_text() or "" for page in reader.pages
                ).strip()
                logger.info(f"PyPDF2 extracted {len(extracted_text)} chars from denial letter PDF")
            except Exception as e:
                logger.warning(f"PyPDF2 failed on denial PDF: {e}, falling back to Gemini")
                extracted_text = ""

            if not extracted_text:
                # Scanned/image PDF -- fall back to Gemini document extraction
                extracted_text = gemini_service.extract_text_from_pdf_image(content)

            logger.info("[upload-denial] Parsing denial info from extracted PDF text...")
            text = await gemini_service._call_provider(
                system_prompt="You extract structured data from insurance denial letters. Return only valid JSON.",
                user_prompt=denial_extraction_prompt + "\n\nDenial letter text:\n" + extracted_text
            )
        else:
            # Image path (photographed denial letter)
            image_base64 = base64.b64encode(content).decode()
            logger.info("[upload-denial] Extracting denial information with vision model...")
            text = gemini_service.vision_generate(
                denial_extraction_prompt,
                image_base64,
                file.content_type,
            )
        logger.info(f"[upload-denial] Vision response received: {len(text)} characters")

        start = text.find('{')
        end = text.rfind('}') + 1
        if start != -1 and end > start:
            denial_info = json.loads(text[start:end])
            logger.info(f"[upload-denial] Successfully parsed denial info: {denial_info}")
        else:
            logger.error(f"[upload-denial] Could not extract denial information")
            raise Exception("Could not extract denial information")

        logger.info("[upload-denial] Generating appeal letter...")
        # Generate appeal letter
        language_instruction = get_language_instruction(request)
        result = await gemini_service.generate_appeal_letter(
            denial_info,
            policy,
            tone,
            language_instruction=language_instruction
        )

        logger.info(f"[upload-denial] Appeal letter generated successfully")

        if "error" in result:
            logger.error(f"[upload-denial] Error in appeal generation: {result['error']}")
            raise HTTPException(status_code=500, detail=result["error"])

        # Include extracted denial info in response
        result["extracted_denial_info"] = denial_info
        logger.info("[upload-denial] Upload process completed successfully")
        return result

    except HTTPException as e:
        logger.error(f"[upload-denial] HTTP Exception: {type(e).__name__}: {str(e)}")
        raise
    except Exception as e:
        log_ai_error(
            endpoint="/api/v1/ai/upload-denial",
            error=e,
            context={
                "prompt_version": get_prompt_version("appeal_letter"),
                "file_type": file.content_type,
                "file_size_kb": round(len(content) / 1024, 1) if 'content' in dir() else None,
            },
        )
        logger.error(f"[upload-denial] FAILED: {type(e).__name__}: {str(e)}")
        logger.exception("[upload-denial] Full traceback:")
        raise HTTPException(status_code=500, detail=f"Failed to process denial letter: {str(e)}")
