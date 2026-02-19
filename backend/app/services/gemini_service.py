import os
import json
import logging
import base64
import traceback
from typing import Optional, Dict, Any, List
from PIL import Image
import io

# Primary: Groq
from groq import Groq

# Fallback: Gemini (only for search-grounded queries)
import google.generativeai as genai
from ..core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # Primary: Groq
        self.groq_client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None
        
        # Fallback: Gemini (only for search-grounded queries)
        gemini_key = os.getenv("GOOGLE_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")
        if gemini_key:
            genai.configure(api_key=gemini_key)
            self.gemini_configured = True
        else:
            self.gemini_configured = False
        
        self.model_name = "llama-3.3-70b-versatile"  # Groq model
    
    def is_configured(self) -> bool:
        return self.groq_client is not None
    
    def _call_groq(self, system_prompt: str, user_prompt: str, messages: List[Dict] = None) -> str:
        """Make a call to Groq API."""
        if not self.groq_client:
            raise Exception("Groq client not configured")
        
        if messages:
            # Use provided messages array
            response = self.groq_client.chat.completions.create(
                messages=messages,
                model=self.model_name,
                temperature=0.3,
                max_tokens=4096,
            )
        else:
            # Use system/user prompt format
            response = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=self.model_name,
                temperature=0.3,
                max_tokens=4096,
            )
        return response.choices[0].message.content
    
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
        
        system_prompt = """You are an expert insurance analyst. Analyze this insurance policy document and extract parameters in a FLAT JSON structure.

IMPORTANT: Return a flat JSON object with these EXACT keys. Do NOT use nested objects.

MONETARY VALUES: Return as NUMBERS (e.g., 500, not "$500")

Required keys:
- individual_deductible: number
- family_deductible: number
- individual_oop_max: number
- family_oop_max: number
- primary_care_copay: number
- specialist_copay: number
- urgent_care_copay: number
- er_copay: number
- prescription_copay: number
- coinsurance: number (as decimal, e.g., 0.2 for 20%)
- has_hsa: boolean
- has_fsa: boolean
- network_type: string ("PPO", "HMO", "EPO", "POS")
- referral_required: boolean
- preauth_required: boolean
- mental_health_coverage: boolean
- preventive_care_coverage: boolean
- maternity_coverage: boolean
- dental_coverage: boolean
- vision_coverage: boolean
- prescription_coverage: boolean
- out_of_network_coverage: boolean
- emergency_coverage: boolean
- urgent_care_coverage: boolean

If a value is not found in policy, use null for numbers and false for booleans."""

        try:
            response_text = self._call_groq(system_prompt, policy_text)
            
            # Try to extract JSON from response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                result = json.loads(response_text[start:end])
                return result
            else:
                logger.warning("Could not extract JSON from Groq response")
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
        conversation_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Answer questions about the insurance policy."""
        
        # Check if this question needs web search
        if self._needs_web_search(question):
            return await self.answer_with_web_search(question, policy_data, conversation_history)
        
        # Continue with policy-only logic using Groq
        system_prompt = """You are an expert insurance advisor helping a patient understand their insurance policy. Be helpful, clear, and specific.

Provide a clear, helpful answer that:
1. Directly answers their question using policy details
2. Cites specific numbers/limits from their policy when relevant
3. Explains any medical billing terms in simple language
4. Warns about any gotchas or things to watch out for
5. Suggests follow-up questions they might want to ask

If the question involves cost estimation, provide:
- Estimated cost breakdown
- What they'll pay vs insurance
- Whether deductible applies
- Any prior authorization needed

Return as JSON:
{
  "answer": "detailed answer text",
  "relevant_policy_details": ["list of relevant policy points"],
  "estimated_costs": {} or null if not applicable,
  "warnings": ["any important warnings"],
  "follow_up_questions": ["suggested follow-up questions"],
  "confidence": 1-100
}"""

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

            response_text = self._call_groq("", "", messages)
            
            # Try to extract JSON from response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                return json.loads(response_text[start:end])
            return {"answer": response_text, "confidence": 70}
        except Exception as e:
            return {"error": str(e)}

    async def answer_with_web_search(self, question: str, policy_data: Dict[str, Any], conversation_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """Answer a question that may need general/external knowledge, using Groq."""
        try:
            policy_context = json.dumps(policy_data, indent=2) if policy_data else "No policy uploaded"

            system_prompt = """You are a healthcare financial advisor with broad knowledge of the US healthcare system, hospitals, insurance plans, and medical costs.

When answering questions about recommendations, rankings, or comparisons:
- Give SPECIFIC names, numbers, and concrete recommendations
- Do NOT be vague — provide actual hospital names, plan names, cost figures
- Draw on your knowledge of major healthcare systems, hospital rankings, average procedure costs, and insurance market data
- Explain how the answer relates to the user's specific insurance policy if relevant
- Note that your information may not reflect the very latest changes

The user has this insurance policy:
""" + policy_context

            messages = [{"role": "system", "content": system_prompt}]

            if conversation_history:
                for msg in conversation_history[-5:]:
                    messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

            messages.append({"role": "user", "content": question})

            response_text = self._call_groq("", "", messages)

            # Try to parse as JSON first
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                try:
                    return json.loads(response_text[start:end])
                except json.JSONDecodeError:
                    pass

            return {
                "answer": response_text,
                "sources": [],
                "search_grounded": False
            }
        except Exception as e:
            logger.error(f"Web search fallback failed: {e}")
            return {"error": str(e), "search_grounded": False}

    async def validate_bill_against_policy(self, bill_image_base64: str, policy_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a medical bill against insurance policy."""
        
        try:
            # Decode and process image (keep existing logic for now)
            image_data = base64.b64decode(bill_image_base64)
            image = Image.open(io.BytesIO(image_data))
            
            # For now, use Gemini for OCR since Groq vision models might be different
            if not self.gemini_configured:
                return {"error": "Image processing requires Gemini configuration"}
            
            # Use Gemini for OCR
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content([
                "Extract all text from this medical bill. Include patient name, date of service, provider name, services rendered, charges, and any insurance information.",
                image
            ])
            
            bill_text = response.text
            
            # Now use Groq for analysis
            system_prompt = """You are a medical billing expert. Analyze this medical bill against insurance policy and identify potential issues.

Extract these details from bill:
- patient_name: string
- date_of_service: string
- provider_name: string
- services: array of objects with service_name, charge_code, amount
- total_charge: number
- insurance_paid: number
- patient_responsibility: number

Then validate against policy:
- in_network_status: "in_network", "out_of_network", or "unknown"
- coverage_determination: "fully_covered", "partially_covered", "not_covered", or "needs_review"
- estimated_patient_cost: number
- potential_savings: array of strings with optimization suggestions
- warnings: array of strings with billing concerns

Return as JSON with all these fields."""

            bill_context = f"BILL TEXT:\n{bill_text}\n\nPOLICY DETAILS:\n{json.dumps(policy_data, indent=2)}"
            response_text = self._call_groq(system_prompt, bill_context)
            
            # Try to extract JSON from response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                return json.loads(response_text[start:end])
            return {"error": "Could not parse bill validation"}
                
        except Exception as e:
            logger.error(f"=== BILL VALIDATION FAILED ===")
            logger.error(f"Error: {type(e).__name__}: {e}")
            logger.error(f"Traceback:\n{traceback.format_exc()}")
            return {"error": str(e)}

    async def generate_appeal_letter(self, denial_info: Dict[str, Any], policy_data: Dict[str, Any], tone: str = "professional") -> Dict[str, Any]:
        """Generate an appeal letter for a denied claim."""
        
        system_prompt = f"""You are a healthcare insurance appeals specialist. Write a compelling appeal letter for a denied claim.

Tone: {tone}

Include these elements:
1. Clear statement of what was denied and why
2. Reference to specific policy provisions that support coverage
3. Medical necessity justification
4. Request for reconsideration with specific action requested
5. Professional closing with contact information

Structure the letter properly with:
- Patient information
- Claim details
- Appeal argument
- Supporting evidence
- Requested resolution

Return as JSON:
{{
  "letter": {{
    "patient_name": "name",
    "claim_number": "number",
    "date_of_service": "date",
    "provider": "provider name",
    "denial_reason": "reason",
    "letter_body": "full letter text",
    "supporting_documents": ["list of suggested documents"]
  }},
  "success_probability": 1-100,
  "next_steps": ["list of recommended actions"]
}}"""

        try:
            context = f"DENIAL INFO:\n{json.dumps(denial_info, indent=2)}\n\nPOLICY DETAILS:\n{json.dumps(policy_data, indent=2)}"
            response_text = self._call_groq(system_prompt, context)
            
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

    async def generate_pre_visit_checklist(self, visit_type: str, policy_data: Dict[str, Any], provider_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate a pre-visit checklist based on policy and visit type."""
        
        system_prompt = """You are a healthcare navigation specialist. Create a comprehensive pre-visit checklist for a medical appointment.

Generate a checklist that includes:
1. Insurance verification steps
2. Required documents and ID
3. Payment preparation (copays, deductibles)
4. Pre-authorization requirements
5. Questions to ask the provider
6. Post-visit follow-up actions

Tailor the checklist based on:
- Visit type (primary care, specialist, urgent care, etc.)
- Insurance policy requirements
- Provider network status

Return as JSON:
{
  "checklist": {
    "before_visit": ["list of tasks before appointment"],
    "bring_to_visit": ["list of documents/items to bring"],
    "questions_to_ask": ["list of questions for provider"],
    "payment_prep": ["list of payment-related preparations"],
    "after_visit": ["list of follow-up actions"]
  },
  "estimated_costs": {
    "copay": number,
    "coinsurance": number,
    "deductible_remaining": number
  },
  "network_status": "in_network" or "out_of_network",
  "authorization_required": boolean
}"""

        try:
            context = f"VISIT TYPE: {visit_type}\n\nPOLICY DETAILS:\n{json.dumps(policy_data, indent=2)}"
            if provider_info:
                context += f"\n\nPROVIDER INFO:\n{json.dumps(provider_info, indent=2)}"
            
            response_text = self._call_groq(system_prompt, context)
            
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
        user_needs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Recommend optimizations or alternative policies."""
        
        system_prompt = """You are an expert insurance advisor. Analyze this patient's current insurance policy and their healthcare needs to provide optimization recommendations.

Provide comprehensive recommendations:

1. **Current Policy Analysis**:
   - Is this policy appropriate for their needs?
   - Are they overpaying for coverage they don't use?
   - Are they underinsured for their actual healthcare usage?

2. **Cost Optimization**:
   - Ways to reduce premiums while maintaining coverage
   - HSA/FSA optimization strategies
   - Network optimization (staying in-network)
   - Generic medication alternatives

3. **Coverage Optimization**:
   - Gaps in current coverage vs their needs
   - Riders or add-ons they should consider
   - Coverage they're paying for but not using

4. **Alternative Plan Types**:
   - HMO vs PPO vs EPO recommendations
   - High-deductible plan options
   - Medicare/Medicaid considerations if applicable

Return as JSON:
{
  "current_plan_rating": 1-100,
  "fit_for_needs": "assessment of how well current plan fits",
  "annual_potential_savings": number,
  "optimizations": [
    {
      "category": "premiums|coverage|network|medications",
      "recommendation": "specific recommendation",
      "potential_savings": number,
      "effort_level": "low|medium|high"
    }
  ],
  "alternative_plans": [
    {
      "plan_type": "HMO|PPO|EPO|HDHP",
      "provider": "suggested insurance company",
      "estimated_monthly_premium": number,
      "pros": ["list of advantages"],
      "cons": ["list of disadvantages"]
    }
  ]
}"""

        try:
            context = f"CURRENT POLICY:\n{json.dumps(current_policy, indent=2)}\n\nUSER NEEDS:\n{json.dumps(user_needs, indent=2)}"
            response_text = self._call_groq(system_prompt, context)
            
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
