# nh3 is a Rust-backed HTML sanitizer -- faster and safer than bleach which is unmaintained
import nh3


def sanitize_text(value: str, max_length: int = 5000) -> str:
    if not isinstance(value, str):
        raise ValueError("Expected string input")
    # Strip all HTML tags -- no user input in this app should ever contain markup
    cleaned = nh3.clean(value, tags=set())
    # Truncate after sanitizing so stripping tags does not hide length limit evasion
    return cleaned[:max_length].strip()


def sanitize_short(value: str) -> str:
    # For field values like service descriptions and claim numbers
    return sanitize_text(value, max_length=500)
