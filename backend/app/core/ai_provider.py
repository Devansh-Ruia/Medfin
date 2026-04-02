# This file exists because we have already switched LLM providers once
# and the second time should not require a grep-and-replace across the codebase

from abc import ABC, abstractmethod
from typing import AsyncGenerator


class AIProvider(ABC):
    """Base interface all LLM providers must implement."""

    @abstractmethod
    async def complete(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.3,
        max_tokens: int = 2048,
    ) -> str:
        """Return a complete response string."""
        ...

    @abstractmethod
    async def stream(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.3,
        max_tokens: int = 2048,
    ) -> AsyncGenerator[str, None]:
        """Yield response chunks for streaming."""
        ...


class GroqProvider(AIProvider):
    # Groq is the current provider -- swap this class out to change models globally

    def __init__(self, api_key: str, model: str):
        from groq import AsyncGroq
        self.client = AsyncGroq(api_key=api_key)
        self.model = model

    async def complete(self, system_prompt, user_message, temperature=0.3, max_tokens=2048) -> str:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content

    async def stream(self, system_prompt, user_message, temperature=0.3, max_tokens=2048):
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )
        async for chunk in response:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta


class GeminiProvider(AIProvider):
    # Gemini is retained for image OCR only
    # This stub exists so Gemini can be promoted to primary if needed without restructuring

    def __init__(self, api_key: str, model: str):
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model)

    async def complete(self, system_prompt, user_message, temperature=0.3, max_tokens=2048) -> str:
        response = self.model.generate_content(f"{system_prompt}\n\n{user_message}")
        return response.text

    async def stream(self, system_prompt, user_message, temperature=0.3, max_tokens=2048):
        # Gemini streaming is not used but must satisfy the interface
        result = await self.complete(system_prompt, user_message, temperature, max_tokens)
        yield result


def get_provider() -> AIProvider:
    # Provider selection is driven by config so changing models touches exactly one env variable
    import os
    provider_name = os.getenv("AI_PROVIDER", "groq").lower()

    if provider_name == "groq":
        return GroqProvider(
            api_key=os.getenv("GROQ_API_KEY", ""),
            model=os.getenv("AI_MODEL", "llama-3.3-70b-versatile"),
        )
    elif provider_name == "gemini":
        return GeminiProvider(
            api_key=os.getenv("GEMINI_API_KEY", ""),
            model=os.getenv("AI_MODEL", "gemini-1.5-flash"),
        )
    else:
        raise ValueError(f"Unknown AI_PROVIDER: {provider_name}")
