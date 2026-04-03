from pydantic_settings import BaseSettings
from typing import List, Dict, Any
import os
import sys

class Settings(BaseSettings):
    # App
    app_name: str = "MedFin API"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = "production"
    
    # API
    api_v1_prefix: str = "/api/v1"
    
    # Security
    allowed_origins: List[str] = ["https://medfin-phi.vercel.app"]
    api_key_header: str = "X-API-Key"
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds
    
    # Email
    resend_api_key: str = os.getenv("RESEND_API_KEY", "")
    feedback_email: str = "ruiadevansh@gmail.com"
    
    # AI Services
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    tavily_api_key: str = os.getenv("TAVILY_API_KEY", "")
    
    # Logging
    log_level: str = "INFO"
    
    # Financial Guidelines (existing data)
    financial_guidelines: Dict[str, Any] = {
        "federal_poverty_level": {
            "2024": {
                "1": 15180,
                "2": 20440,
                "3": 25700,
                "4": 30960,
                "5": 36220,
                "6": 41480,
                "7": 46740,
                "8": 52000,
            }
        },
        "charity_care_income_thresholds": {
            "full_assistance": 2.0,
            "partial_assistance": 4.0,
        },
        "hardship_debt_to_income_ratio": {
            "mild": 0.10,
            "moderate": 0.20,
            "severe": 0.40,
        },
        "out_of_pocket_limits": {
            "private_individual": 9100,
            "private_family": 18200,
            "medicare": 8300,
        },
    }

    location_multipliers: Dict[str, float] = {
        "northeast": 1.25,
        "west": 1.20,
        "midwest": 0.95,
        "south": 0.90,
        "urban": 1.15,
        "rural": 0.85,
    }

    cost_estimate_defaults: Dict[str, Any] = {
        "confidence_interval": 0.15,
        "out_of_network_penalty": 1.5,
        "emergency_multiplier": 2.0,
    }

    class Config:
        env_file = ".env"

REQUIRED_VARS = ["GEMINI_API_KEY"]


def validate_env() -> None:
    """Exit with a clear message if required environment variables are missing."""
    missing = [v for v in REQUIRED_VARS if not os.getenv(v)]
    if missing:
        print(
            f"STARTUP FAILED: Missing required environment variables: {', '.join(missing)}\n"
            "Set these in your Render dashboard under Environment.",
            file=sys.stderr,
            flush=True,
        )
        sys.exit(1)


settings = Settings()
