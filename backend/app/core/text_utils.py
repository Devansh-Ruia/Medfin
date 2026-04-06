import re


def sanitize_extracted_text(text: str) -> str:
    """Remove control characters from PDF-extracted text before sending to AI."""
    if not text:
        return ""

    # Replace carriage returns with newlines
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove control characters except newline (\n=0x0A) and tab (\t=0x09)
    text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)

    # Collapse more than 3 consecutive newlines into 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def sanitize_ai_response(response: str) -> str:
    """Clean AI response text so it can be parsed as JSON."""
    if not response:
        return ""

    # Strip markdown code fences the AI sometimes wraps JSON in
    response = response.strip()
    if response.startswith("```"):
        response = re.sub(r"^```(?:json)?\n?", "", response)
        response = re.sub(r"\n?```$", "", response)

    # Remove control characters that break json.loads
    response = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", response)

    return response.strip()
