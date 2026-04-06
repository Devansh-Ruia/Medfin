import os
import json
import logging
import base64
import traceback
from typing import Optional, Dict, Any, List
from PIL import Image
import io

# Primary: AI Provider abstraction
from ..core.ai_provider import get_provider

# Prompt loader
from ..core.prompt_loader import load_prompt

# Search: Tavily
from tavily import TavilyClient

# Gemini (for image OCR) -- migrated from dead google-generativeai to google-genai
from google import genai
from google.genai import types
from ..core.config import settings

logger = logging.getLogger(__name__)

# Gemini is picky about mime types -- normalise before sending
# 'image/jpg' is not a valid MIME type despite browsers sending it
SUPPORTED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
}

MIME_ALIASES = {
    "image/jpg": "image/jpeg",
    "image/pjpeg": "image/jpeg",
    "image/x-png": "image/png",
}


def normalise_mime_type(mime_type: str) -> str:
    normalised = MIME_ALIASES.get(mime_type, mime_type)
    if normalised not in SUPPORTED_MIME_TYPES:
        logger.warning(f"Unsupported mime_type '{mime_type}', defaulting to image/jpeg")
        return "image/jpeg"
    return normalised


class AIService:
    def __init__(self):
        # Primary: AI Provider (Groq by default, configurable via AI_PROVIDER env var)
        try:
            self.provider = get_provider()
            self.provider_configured = True
        except Exception as e:
            logger.warning(f"AI provider initialization failed: {e}")
            self.provider = None
            self.provider_configured = False

        # Search: Tavily
        self.tavily_client = TavilyClient(api_key=settings.tavily_api_key) if settings.tavily_api_key else None

        # Gemini client for image OCR (new google-genai SDK)
        gemini_key = os.getenv("GOOGLE_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")
        if gemini_key:
            self._gemini_client = genai.Client(api_key=gemini_key)
            self.gemini_configured = True
        else:
            self._gemini_client = None
            self.gemini_configured = False

    def is_configured(self) -> bool:
        return self.provider_configured

    def vision_generate(self, prompt: str, image_base64: str, mime_type: str) -> str:
        """Generate content from an image using Gemini vision.
        Used by ai.py endpoints that need direct image OCR (upload-policy, upload-denial).
        """
        if not self.gemini_configured:
            raise Exception("Gemini not configured -- check GEMINI_API_KEY")

        mime_type = normalise_mime_type(mime_type)
        image_bytes = base64.b64decode(image_base64)
        response = self._gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt,
            ],
        )
        return response.text

    async def _call_provider(self, system_prompt: str, user_prompt: str, language_instruction: str = None) -> str:
        """Make a call to the configured AI provider."""
        if not self.provider:
            raise Exception("AI provider not configured")

        # Prepend language instruction to system prompt when provided
        effective_system_prompt = f"{language_instruction}\n\n{system_prompt}" if language_instruction else system_prompt

        return await self.provider.complete(
            system_prompt=effective_system_prompt,
            user_message=user_prompt,
            temperature=0.3,
            max_tokens=4096,
        )

    async def _call_provider_with_messages(self, messages: List[Dict], language_instruction: str = None) -> str:
        """Make a call with a full messages array. Extracts system+user for the provider interface."""
        if not self.provider:
            raise Exception("AI provider not configured")

        # Extract system prompt from messages
        system_parts = []
        user_parts = []
        for msg in messages:
            if msg["role"] == "system":
                system_parts.append(msg["content"])
            else:
                user_parts.append(msg["content"])

        system_prompt = "\n\n".join(system_parts)
        user_message = "\n\n".join(user_parts)

        if language_instruction:
            system_prompt = f"{language_instruction}\n\n{system_prompt}"

        return await self.provider.complete(
            system_prompt=system_prompt,
            user_message=user_message,
            temperature=0.3,
            max_tokens=4096,
        )

    def _needs_web_search(self, question: str) -> bool:
        """Determine if a question needs real-time web data."""
        web_indicators = [
            'best', 'top', 'ranking', 'recommend', 'compare',
            'average cost', 'how much does', 'cheapest', 'near me',
            'hospital', 'provider', 'doctor', 'clinic', 'reviews',
            'latest', 'recent', 'news', 'current',
            'which plan', 'best plan', 'best insurance',
            'where can i', 'find a',
        ]
        q = question.lower()
        return any(ind in q for ind in web_indicators)

    async def analyze_insurance_policy(self, policy_text: str) -> Dict[str, Any]:
        """Extract and analyze all parameters from an insurance policy."""

        system_prompt = load_prompt("policy_analysis")

        try:
            response_text = await self._call_provider(system_prompt, policy_text)

            # Try to extract JSON from response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                result = json.loads(response_text[start:end])
                return result
            else:
                logger.warning("Could not extract JSON from AI response")
                return {"error": "Could not parse policy analysis"}

        except Exception as e:
            logger.error(f"=== POLICY ANALYSIS FAILED ===")
            logger.error(f"Error: {type(e).__name__}: {e}")
            logger.error(f"Traceback:\n{traceback.format_exc()}")
            return {"error": str(e)}

    async def answer_policy_question(
        self,
        question: str,
        policy_data: Dict[str, Any],
        conversation_history: List[Dict[str, str]] = None,
        language_instruction: str = None
    ) -> Dict[str, Any]:
        """Answer questions about the insurance policy."""

        # Check if this question needs web search
        if self._needs_web_search(question):
            return await self.answer_with_web_search(question, policy_data, conversation_history, language_instruction=language_instruction)

        # Continue with policy-only logic
        system_prompt = load_prompt("ask_question")

        try:
            # Build messages array with conversation history
            messages = [{"role": "system", "content": system_prompt}]

            # Add policy context
            policy_context = f"INSURANCE POLICY DETAILS:\n{json.dumps(policy_data, indent=2)}"
            messages.append({"role": "system", "content": policy_context})

            # Add conversation history
            if conversation_history:
                for msg in conversation_history[-5:]:  # Last 5 messages for context
                    messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

            # Add current question
            messages.append({"role": "user", "content": question})

            response_text = await self._call_provider_with_messages(messages, language_instruction=language_instruction)

            # Try to extract JSON from response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                return json.loads(response_text[start:end])
            return {"answer": response_text, "confidence": 70}
        except Exception as e:
            return {"error": str(e)}

    async def answer_with_web_search(self, question: str, policy_data: Dict[str, Any], conversation_history: List[Dict[str, str]] = None, language_instruction: str = None) -> Dict[str, Any]:
        """Answer a question using Tavily web search + AI provider."""
        try:
            # Step 1: Search the web with Tavily
            search_context = ""
            sources = []

            if self.tavily_client:
                try:
                    search_results = self.tavily_client.search(
                        query=question,
                        search_depth="basic",
                        max_results=5,
                        include_answer=False,
                    )

                    # Build context from search results
                    for result in search_results.get("results", []):
                        title = result.get("title", "")
                        content = result.get("content", "")
                        url = result.get("url", "")

                        search_context += f"\n\nSOURCE: {title}\nURL: {url}\n{content}"
                        sources.append({"title": title, "url": url})

                except Exception as search_err:
                    logger.warning(f"Tavily search failed, proceeding without: {search_err}")

            # Step 2: Build prompt with search results as context
            policy_context = json.dumps(policy_data, indent=2) if policy_data else "No policy uploaded"

            system_prompt = """You are a healthcare financial advisor. Answer the user's question using the provided web search results AND their insurance policy details.

Rules:
- Use SPECIFIC names, numbers, rankings, and concrete data from the search results
- Do NOT be vague — cite specific information from the sources
- Relate the answer to the user's insurance policy when relevant
- If the search results don't fully answer the question, say so honestly
- Reference which sources your information comes from"""

            user_prompt = f"""USER'S INSURANCE POLICY:
{policy_context}

WEB SEARCH RESULTS:
{search_context if search_context else "No search results available."}

USER QUESTION: {question}"""

            # Step 3: Send to provider with search context
            messages = [{"role": "system", "content": system_prompt}]

            if conversation_history:
                for msg in conversation_history[-5:]:
                    messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

            messages.append({"role": "user", "content": user_prompt})

            response_text = await self._call_provider_with_messages(messages, language_instruction=language_instruction)

            # Try to parse as JSON first (in case provider returns structured response)
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                try:
                    result = json.loads(response_text[start:end])
                    result["sources"] = sources
                    result["search_grounded"] = bool(sources)
                    return result
                except json.JSONDecodeError:
                    pass

            return {
                "answer": response_text,
                "sources": sources,
                "search_grounded": bool(sources)
            }

        except Exception as e:
            logger.error(f"Web search answer failed: {e}")
            # Fall back to provider without search
            try:
                fallback = await self._call_provider(
                    "You are a healthcare financial advisor. Answer based on your knowledge.",
                    question,
                    language_instruction=language_instruction
                )
                return {"answer": fallback, "sources": [], "search_grounded": False}
            except Exception as fallback_err:
                return {"error": str(fallback_err), "search_grounded": False}

    def extract_text_from_image(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
        """Extract text from an image using Gemini OCR."""
        if not self.gemini_configured:
            raise Exception("Gemini not configured -- check GEMINI_API_KEY")

        mime_type = normalise_mime_type(mime_type)
        logger.info(f"Sending image to Gemini: {len(image_bytes)} bytes, mime_type={mime_type}")

        response = self._gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                "Extract all text from this medical bill. Include patient name, date of service, provider name, services rendered, charges, and any insurance information.",
            ],
        )
        return response.text

    def extract_text_from_pdf_image(self, pdf_bytes: bytes) -> str:
        """Extract text from a scanned/image PDF using Gemini document API."""
        if not self.gemini_configured:
            raise Exception("Gemini not configured -- check GEMINI_API_KEY")

        logger.info(f"Sending PDF to Gemini document API: {len(pdf_bytes)} bytes")
        response = self._gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
                "Extract all text from this medical bill PDF. Include patient name, date of service, provider name, services rendered, charges, and any insurance information.",
            ],
        )
        return response.text

    async def validate_bill_against_policy(self, bill_image_base64: str, policy_data: Dict[str, Any], language_instruction: str = None, mime_type: str = "image/jpeg", pre_extracted_text: str = None) -> Dict[str, Any]:
        """Validate a medical bill against insurance policy."""

        try:
            if pre_extracted_text:
                # Text already extracted (e.g. from PDF via PyPDF2)
                bill_text = pre_extracted_text
                logger.info(f"[bill-validation] Using pre-extracted text ({len(bill_text)} chars)")
            else:
                # Step 1: Decode base64 image
                logger.info("[bill-validation] Step 1: Decoding base64 image data")
                image_data = base64.b64decode(bill_image_base64)
                logger.info(f"[bill-validation] Decoded {len(image_data)} bytes of image data")

                # Step 2: Check Gemini is configured
                if not self.gemini_configured:
                    logger.error("[bill-validation] Gemini not configured - cannot process image")
                    return {"error": "Image processing requires Gemini configuration"}

                # Step 3: Call Gemini for OCR using new SDK
                logger.info("[bill-validation] Step 3: Calling Gemini (gemini-2.5-flash) for OCR")
                bill_text = self.extract_text_from_image(image_data, mime_type)
                logger.info(f"[bill-validation] Extracted {len(bill_text)} characters of bill text")

            # Step 5: Load prompt and call AI provider for analysis
            logger.info("[bill-validation] Step 5: Loading bill_validation prompt")
            system_prompt = load_prompt("bill_validation")
            logger.info(f"[bill-validation] Prompt loaded ({len(system_prompt)} chars)")

            bill_context = f"BILL TEXT:\n{bill_text}\n\nPOLICY DETAILS:\n{json.dumps(policy_data, indent=2)}"
            logger.info(f"[bill-validation] Step 6: Calling AI provider for analysis ({len(bill_context)} chars context)")
            response_text = await self._call_provider(system_prompt, bill_context, language_instruction=language_instruction)
            logger.info(f"[bill-validation] Provider response received ({len(response_text)} chars)")

            # Step 7: Parse JSON response
            logger.info("[bill-validation] Step 7: Parsing JSON from provider response")
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                result = json.loads(response_text[start:end])
                logger.info("[bill-validation] SUCCESS - bill validation complete")
                return result
            logger.error(f"[bill-validation] No JSON found in provider response: {response_text[:200]}")
            return {"error": "Could not parse bill validation"}

        except Exception as e:
            logger.error(f"=== BILL VALIDATION FAILED ===")
            logger.error(f"[bill-validation] Error at: {type(e).__name__}: {e}")
            logger.error(f"[bill-validation] Traceback:\n{traceback.format_exc()}")
            return {"error": str(e)}

    async def generate_appeal_letter(self, denial_info: Dict[str, Any], policy_data: Dict[str, Any], tone: str = "professional", language_instruction: str = None) -> Dict[str, Any]:
        """Generate an appeal letter for a denied claim."""

        base_prompt = load_prompt("appeal_letter")
        # Tone is dynamic, so prepend it to the loaded prompt
        system_prompt = f"Tone: {tone}\n\n{base_prompt}"

        try:
            context = f"DENIAL INFO:\n{json.dumps(denial_info, indent=2)}\n\nPOLICY DETAILS:\n{json.dumps(policy_data, indent=2)}"
            response_text = await self._call_provider(system_prompt, context, language_instruction=language_instruction)

            # Try to extract JSON from response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                return json.loads(response_text[start:end])
            return {"error": "Could not parse appeal letter"}

        except Exception as e:
            logger.error(f"=== APPEAL LETTER GENERATION FAILED ===")
            logger.error(f"Error: {type(e).__name__}: {e}")
            logger.error(f"Traceback:\n{traceback.format_exc()}")
            return {"error": str(e)}

    async def generate_pre_visit_checklist(self, visit_type: str, policy_data: Dict[str, Any], provider_info: Dict[str, Any] = None, language_instruction: str = None) -> Dict[str, Any]:
        """Generate a pre-visit checklist based on policy and visit type."""

        system_prompt = load_prompt("pre_visit")

        try:
            context = f"VISIT TYPE: {visit_type}\n\nPOLICY DETAILS:\n{json.dumps(policy_data, indent=2)}"
            if provider_info:
                context += f"\n\nPROVIDER INFO:\n{json.dumps(provider_info, indent=2)}"

            response_text = await self._call_provider(system_prompt, context, language_instruction=language_instruction)

            # Try to extract JSON from response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                return json.loads(response_text[start:end])
            return {"error": "Could not parse pre-visit checklist"}

        except Exception as e:
            logger.error(f"=== PRE-VISIT CHECKLIST GENERATION FAILED ===")
            logger.error(f"Error: {type(e).__name__}: {e}")
            logger.error(f"Traceback:\n{traceback.format_exc()}")
            return {"error": str(e)}

    async def recommend_policy_alternatives(
        self,
        current_policy: Dict[str, Any],
        user_needs: Dict[str, Any],
        language_instruction: str = None
    ) -> Dict[str, Any]:
        """Recommend optimizations or alternative policies."""

        system_prompt = load_prompt("policy_optimization")

        try:
            context = f"CURRENT POLICY:\n{json.dumps(current_policy, indent=2)}\n\nUSER NEEDS:\n{json.dumps(user_needs, indent=2)}"
            response_text = await self._call_provider(system_prompt, context, language_instruction=language_instruction)

            # Try to extract JSON from response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                return json.loads(response_text[start:end])
            return {"error": "Could not parse policy recommendations"}

        except Exception as e:
            logger.error(f"=== POLICY OPTIMIZATION FAILED ===")
            logger.error(f"Error: {type(e).__name__}: {e}")
            logger.error(f"Traceback:\n{traceback.format_exc()}")
            return {"error": str(e)}

# Module-level instantiation to maintain compatibility
gemini_service = AIService()
