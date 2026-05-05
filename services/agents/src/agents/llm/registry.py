"""
LLM provider registry.

Reads LLM_PROVIDER from the environment and returns the appropriate provider.
Also discovers third-party providers registered via entry points.

Usage:
  provider = get_provider()
  if provider:
      response = provider.complete(system=..., user=...)
"""
from __future__ import annotations

import importlib.metadata
import os
from typing import Optional

from dotenv import load_dotenv

from .base import LLMProvider
from .bedrock import BedrockProvider
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from .ollama_provider import OllamaProvider
from .gemini_provider import GeminiProvider

load_dotenv()

# Built-in providers mapped by their name
_BUILTIN: dict[str, type[LLMProvider]] = {
    "bedrock": BedrockProvider,
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    "ollama": OllamaProvider,
    "gemini": GeminiProvider,
}


def _discover_plugins() -> dict[str, type[LLMProvider]]:
    """Discovers third-party providers registered via entry points."""
    plugins: dict[str, type[LLMProvider]] = {}
    try:
        for ep in importlib.metadata.entry_points(group="fin_engine.llm_providers"):
            try:
                cls = ep.load()
                if isinstance(cls, type) and issubclass(cls, LLMProvider):
                    instance = cls()
                    plugins[instance.name] = cls
            except Exception:  # noqa: BLE001
                pass  # Skip broken plugins silently
    except Exception:  # noqa: BLE001
        pass
    return plugins


def get_provider() -> Optional[LLMProvider]:
    """
    Returns an initialized LLM provider based on LLM_PROVIDER env var.
    Returns None if LLM_PROVIDER is "none" or unset.
    """
    provider_name = os.getenv("LLM_PROVIDER", "none").lower().strip()

    if provider_name in ("none", "", "false", "0"):
        return None

    # Merge built-ins with plugins (plugins can override built-ins)
    all_providers: dict[str, type[LLMProvider]] = {**_BUILTIN, **_discover_plugins()}

    cls = all_providers.get(provider_name)
    if cls is None:
        available = ", ".join(sorted(all_providers.keys()))
        raise ValueError(
            f"Unknown LLM_PROVIDER: '{provider_name}'. "
            f"Available: {available}"
        )

    return cls()
