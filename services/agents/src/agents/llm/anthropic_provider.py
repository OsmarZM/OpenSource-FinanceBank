"""
Anthropic (direct) LLM provider.

Required environment variables:
  ANTHROPIC_API_KEY
  LLM_MODEL   (default: claude-3-5-sonnet-20241022)
"""
from __future__ import annotations

import os

from .base import LLMProvider

DEFAULT_MODEL = "claude-3-5-sonnet-20241022"


class AnthropicProvider(LLMProvider):
    @property
    def name(self) -> str:
        return "anthropic"

    def complete(self, *, system: str, user: str, **kwargs: object) -> str:
        import anthropic  # type: ignore[import-untyped]

        client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        model = os.getenv("LLM_MODEL", DEFAULT_MODEL)

        message = client.messages.create(
            model=model,
            max_tokens=int(kwargs.get("max_tokens", 1024)),
            system=system,
            messages=[{"role": "user", "content": user}],
        )

        return str(message.content[0].text)
