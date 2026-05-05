"""
OpenAI LLM provider.

Required environment variables:
  OPENAI_API_KEY
  LLM_MODEL   (default: gpt-4o-mini)
"""
from __future__ import annotations

import os

from .base import LLMProvider

DEFAULT_MODEL = "gpt-4o-mini"


class OpenAIProvider(LLMProvider):
    @property
    def name(self) -> str:
        return "openai"

    def complete(self, *, system: str, user: str, **kwargs: object) -> str:
        from openai import OpenAI  # type: ignore[import-untyped]

        client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
        model = os.getenv("LLM_MODEL", DEFAULT_MODEL)

        response = client.chat.completions.create(
            model=model,
            max_tokens=int(kwargs.get("max_tokens", 1024)),
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )

        return response.choices[0].message.content or ""
