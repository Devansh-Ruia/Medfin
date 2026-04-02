# This file exists because an LLM prompt is a first-class artifact, not a string literal
# Versioned files mean billing code updates do not require a Python deploy

import re
from functools import lru_cache
from pathlib import Path

PROMPTS_DIR = Path(__file__).parent.parent.parent / "prompts"


@lru_cache(maxsize=None)
def load_prompt(name: str) -> str:
    # lru_cache means each prompt file is read from disk exactly once per process lifetime
    path = PROMPTS_DIR / f"{name}.txt"
    if not path.exists():
        raise FileNotFoundError(f"Prompt file not found: {path}")
    content = path.read_text(encoding="utf-8")
    # Strip the metadata header -- everything above the delimiter is for humans, not the model
    delimiter = "# --- PROMPT BELOW THIS LINE ---"
    if delimiter in content:
        content = content.split(delimiter, 1)[1].strip()
    return content


def get_prompt_version(name: str) -> str:
    # Returns the version string for logging and debugging purposes
    path = PROMPTS_DIR / f"{name}.txt"
    if not path.exists():
        return "unknown"
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("# version:"):
            return line.split(":", 1)[1].strip()
    return "unknown"
