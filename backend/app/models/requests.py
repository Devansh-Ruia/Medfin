from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
import re


class AskQuestionRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)
    policy_data: Dict[str, Any] = Field(...)
    conversation_history: Optional[List[Dict[str, str]]] = Field(
        default=None, max_length=50
    )

    @field_validator("question")
    @classmethod
    def question_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError("Question cannot be blank")
        return v.strip()


class OptimizePolicyRequest(BaseModel):
    policy_data: Dict[str, Any] = Field(...)
    user_needs: Dict[str, Any] = Field(...)


class AppealLetterRequest(BaseModel):
    denial_info: Dict[str, Any] = Field(...)
    policy_data: Dict[str, Any] = Field(...)
    tone: str = Field("professional", max_length=50)

    @field_validator("tone")
    @classmethod
    def tone_must_be_valid(cls, v):
        valid_tones = ["professional", "emphatic", "detailed", "concise"]
        if v not in valid_tones:
            raise ValueError(f"Invalid tone. Must be one of: {valid_tones}")
        return v


class PreVisitRequest(BaseModel):
    visit_type: str = Field(..., max_length=100)
    policy_data: Dict[str, Any] = Field(...)
    provider_info: Optional[Dict[str, Any]] = None

    @field_validator("visit_type")
    @classmethod
    def visit_type_must_be_valid(cls, v):
        valid_types = [
            "primary_care", "specialist", "emergency",
            "urgent_care", "surgery", "imaging", "lab_work",
        ]
        normalized = v.lower().strip().split("/")[0].strip().replace(" ", "_")
        if normalized in valid_types:
            return normalized
        for vt in valid_types:
            if vt in normalized or normalized in vt:
                return vt
        raise ValueError(f"Invalid visit type. Must be one of: {valid_types}")
