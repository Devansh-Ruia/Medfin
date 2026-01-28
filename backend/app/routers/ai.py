from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import base64
import PyPDF2
import io
from ..services.gemini_service import gemini_service

router = APIRouter(prefix="/ai", tags=["ai"])

class PolicyTextRequest(BaseModel):
    policy_text: str

class QuestionRequest(BaseModel):
    question: str
    policy_data: Dict[str, Any]
    conversation_history: Optional[List[Dict[str, str]]] = None

class BillValidationRequest(BaseModel):
    bill_image_base64: str
    policy_data: Dict[str, Any]

class OptimizationRequest(BaseModel):
    policy_data: Dict[str, Any]
    user_needs: Dict[str, Any]

@router.get("/health")
async def ai_health():
    """Check if AI service is configured."""
    return {
        "status": "ok",
        "ai_configured": gemini_service.is_configured(),
        "model": "gemini-1.5-flash" if gemini_service.is_configured() else None
    }

@router.post("/analyze-policy")
async def analyze_policy(request: PolicyTextRequest):
    """Analyze insurance policy text and extract all parameters."""
    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    result = await gemini_service.analyze_insurance_policy(request.policy_text)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.post("/upload-policy")
async def upload_policy(file: UploadFile = File(...)):
    """Upload and analyze a policy document (PDF or image)."""
    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    content = await file.read()
    
    # Extract text based on file type
    if file.filename.lower().endswith('.pdf'):
        # Extract text from PDF
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        policy_text = ""
        for page in pdf_reader.pages:
            policy_text += page.extract_text() + "\n"
    else:
        # For images, we'll use Gemini's vision capability
        image_base64 = base64.b64encode(content).decode()
        # Use vision model to extract text
        import google.generativeai as genai
        from PIL import Image
        image = Image.open(io.BytesIO(content))
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content([
            "Extract all text from this insurance policy document. Return only the extracted text, nothing else.",
            image
        ])
        policy_text = response.text
    
    # Now analyze the extracted text
    result = await gemini_service.analyze_insurance_policy(policy_text)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return {
        "policy_data": result,
        "extracted_text_length": len(policy_text),
        "source_file": file.filename
    }

@router.post("/ask-question")
async def ask_policy_question(request: QuestionRequest):
    """Ask a question about the insurance policy."""
    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    result = await gemini_service.answer_policy_question(
        request.question,
        request.policy_data,
        request.conversation_history
    )
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.post("/validate-bill")
async def validate_bill(request: BillValidationRequest):
    """Validate a bill image against the policy."""
    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    result = await gemini_service.validate_bill_against_policy(
        request.bill_image_base64,
        request.policy_data
    )
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.post("/upload-bill")
async def upload_bill(
    file: UploadFile = File(...),
    policy_data: str = Form(...)
):
    """Upload a bill image and validate against policy."""
    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    import json
    policy = json.loads(policy_data)
    
    content = await file.read()
    image_base64 = base64.b64encode(content).decode()
    
    result = await gemini_service.validate_bill_against_policy(image_base64, policy)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result

@router.post("/optimize-policy")
async def optimize_policy(request: OptimizationRequest):
    """Get optimization recommendations for the policy."""
    if not gemini_service.is_configured():
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    result = await gemini_service.recommend_policy_alternatives(
        request.policy_data,
        request.user_needs
    )
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result
