"""
Google Gemini LLM provider.

Required environment variables:
  GEMINI_API_KEY
  LLM_MODEL   (default: gemini-1.5-flash)
"""
from __future__ import annotations

import os

from .base import LLMProvider

DEFAULT_MODEL = "gemini-1.5-flash"


class GeminiProvider(LLMProvider):
    @property
    def name(self) -> str:
        return "gemini"

    def complete(self, *, system: str, user: str, **kwargs: object) -> str:
        from google import genai  # type: ignore[import-untyped]
        from google.genai import types as genai_types  # type: ignore[import-untyped]

        client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
        model = os.getenv("LLM_MODEL", DEFAULT_MODEL)

        response = client.models.generate_content(
            model=model,
            config=genai_types.GenerateContentConfig(
                system_instruction=system,
                max_output_tokens=int(kwargs.get("max_tokens", 1024)),
            ),
            contents=user,
        )

        return str(response.text)
