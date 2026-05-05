"""
Abstract base class for all LLM providers.

To add a new provider:
  1. Create a new file in this directory (e.g., my_provider.py)
  2. Subclass LLMProvider and implement complete()
  3. Register via entry point "fin_engine.llm_providers" in pyproject.toml
     OR add to BUILTIN_PROVIDERS in registry.py
"""
from __future__ import annotations

from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Pluggable LLM provider interface."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique identifier for this provider (e.g., 'bedrock', 'openai')."""

    @abstractmethod
    def complete(self, *, system: str, user: str, **kwargs: object) -> str:
        """
        Sends a prompt and returns the model's text response.

        Args:
            system: System/persona instructions.
            user:   User message content.
            **kwargs: Provider-specific options (temperature, max_tokens, etc.)

        Returns:
            The model's raw text response.
        """
