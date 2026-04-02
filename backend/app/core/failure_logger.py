# This file exists because every AI failure is a feature request in disguise
# We log patterns, not content -- no PHI, no policy text, no bill data ever touches this

import json
import logging
import os
from datetime import datetime, timezone
from enum import Enum


class FailureType(str, Enum):
    AI_ERROR = "ai_error"                        # Provider returned an error
    PARSE_ERROR = "parse_error"                  # Could not parse AI response
    UNSUPPORTED_FORMAT = "unsupported_format"    # Document format not recognized
    LOW_CONFIDENCE = "low_confidence"            # AI flagged uncertainty
    RATE_LIMITED = "rate_limited"                # Provider rate limit hit
    TIMEOUT = "timeout"                          # Request timed out


# Structured logger -- outputs JSON lines for easy parsing by log aggregators
failure_logger = logging.getLogger("medfin.failures")
failure_logger.setLevel(logging.WARNING)

handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(message)s"))
failure_logger.addHandler(handler)


def log_failure(
    failure_type: FailureType,
    endpoint: str,
    error_message: str,
    context: dict = None,
) -> None:
    # context must never contain user data, document content, or any PHI
    # only structural metadata: file type, file size, prompt name, model used
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": failure_type.value,
        "endpoint": endpoint,
        "error": error_message,
        "prompt_version": context.get("prompt_version") if context else None,
        "model": os.getenv("AI_MODEL", "unknown"),
        "provider": os.getenv("AI_PROVIDER", "unknown"),
        "file_type": context.get("file_type") if context else None,
        "file_size_kb": context.get("file_size_kb") if context else None,
    }
    failure_logger.warning(json.dumps(record))


def log_ai_error(endpoint: str, error: Exception, context: dict = None) -> None:
    log_failure(FailureType.AI_ERROR, endpoint, str(error), context)


def log_parse_error(endpoint: str, raw_response_length: int, context: dict = None) -> None:
    # We log response length, not content -- length alone tells us if the model truncated
    ctx = {**(context or {}), "response_length": raw_response_length}
    log_failure(FailureType.PARSE_ERROR, endpoint, "Failed to parse AI response", ctx)


def log_unsupported_format(endpoint: str, file_type: str, file_size_kb: float) -> None:
    log_failure(
        FailureType.UNSUPPORTED_FORMAT,
        endpoint,
        f"Unsupported file format: {file_type}",
        {"file_type": file_type, "file_size_kb": file_size_kb},
    )


def log_rate_limit(endpoint: str, provider: str) -> None:
    log_failure(FailureType.RATE_LIMITED, endpoint, f"Rate limited by {provider}")
