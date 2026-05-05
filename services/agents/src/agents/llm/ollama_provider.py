"""
Ollama LLM provider (local, no API key).

Required environment variables:
  OLLAMA_BASE_URL  (default: http://localhost:11434)
  OLLAMA_MODEL     (default: llama3) or LLM_MODEL
"""
from __future__ import annotations

import json
import os

import httpx

from .base import LLMProvider

DEFAULT_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "llama3"


class OllamaProvider(LLMProvider):
    @property
    def name(self) -> str:
        return "ollama"

    def complete(self, *, system: str, user: str, **kwargs: object) -> str:
        base_url = os.getenv("OLLAMA_BASE_URL", DEFAULT_BASE_URL).rstrip("/")
        model = os.getenv("LLM_MODEL") or os.getenv("OLLAMA_MODEL", DEFAULT_MODEL)

        payload = {
            "model": model,
            "stream": False,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }

        response = httpx.post(
            f"{base_url}/api/chat",
            json=payload,
            timeout=120.0,
        )
        response.raise_for_status()
        data: dict = response.json()
        return str(data["message"]["content"])
