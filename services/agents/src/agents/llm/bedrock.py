"""
AWS Bedrock LLM provider.

Authentication:
  AWS_BEARER_TOKEN_BEDROCK  â€” Bedrock API key (required for OpenAI models)
  AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY â€” IAM credentials (Anthropic models)

Environment variables:
  AWS_REGION         (default: us-west-2)
  BEDROCK_MODEL_ID   Bedrock model ID

Model routing:
  - openai.*  â†’ bedrock-mantle.{region}.api.aws/v1  (OpenAI Chat Completions format)
  - anthropic.* â†’ bedrock-runtime.{region}.amazonaws.com  (Invoke API, Anthropic format)
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any

from .base import LLMProvider

DEFAULT_MODEL = "openai.gpt-oss-safeguard-20b"
DEFAULT_REGION = "us-west-2"

DEFAULT_INPUT_PRICE_PER_M = 1.00
DEFAULT_OUTPUT_PRICE_PER_M = 5.00


def _is_openai_model(model_id: str) -> bool:
    return model_id.startswith("openai.")


@dataclass
class UsageStats:
    input_tokens: int = 0
    output_tokens: int = 0
    model: str = ""

    @property
    def estimated_cost_usd(self) -> float:
        return (
            self.input_tokens / 1_000_000 * DEFAULT_INPUT_PRICE_PER_M
            + self.output_tokens / 1_000_000 * DEFAULT_OUTPUT_PRICE_PER_M
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.input_tokens + self.output_tokens,
            "estimated_cost_usd": round(self.estimated_cost_usd, 6),
            "model": self.model,
        }


class BedrockProvider(LLMProvider):
    """AWS Bedrock provider.

    OpenAI models â†’ bedrock-mantle.{region}.api.aws/v1  (OpenAI Chat Completions)
    Anthropic models â†’ bedrock-runtime.{region}.amazonaws.com  (Invoke API)
    """

    def __init__(self) -> None:
        self.last_usage: UsageStats | None = None

    @property
    def name(self) -> str:
        return "bedrock"

    def complete(self, *, system: str, user: str, **kwargs: object) -> str:
        model_id = (
            os.getenv("BEDROCK_MODEL_ID") or
            os.getenv("LLM_MODEL") or
            DEFAULT_MODEL
        )
        bearer_token = os.getenv("AWS_BEARER_TOKEN_BEDROCK")

        if _is_openai_model(model_id):
            if not bearer_token:
                raise RuntimeError(
                    "AWS_BEARER_TOKEN_BEDROCK is required for OpenAI models on Bedrock. "
                    "Generate one at: Bedrock Console â†’ API Keys"
                )
            text, usage = self._complete_openai_mantle(bearer_token, model_id, system, user, kwargs)
        else:
            # Anthropic-style invoke
            invoke_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": int(kwargs.get("max_tokens", 1024)),
                "system": system,
                "messages": [{"role": "user", "content": user}],
            }
            if bearer_token:
                text, usage = self._invoke_bearer(bearer_token, model_id, invoke_body)
            else:
                text, usage = self._invoke_boto3(model_id, invoke_body)

        self.last_usage = usage
        return text

    # -------------------------------------------------------------------------
    # OpenAI models via bedrock-mantle endpoint (Chat Completions format)
    # -------------------------------------------------------------------------
    def _complete_openai_mantle(
        self,
        token: str,
        model_id: str,
        system: str,
        user: str,
        kwargs: Any,
    ) -> tuple[str, UsageStats]:
        import httpx

        region = os.getenv("AWS_REGION", DEFAULT_REGION)
        base_url = f"https://bedrock-mantle.{region}.api.aws/v1"
        url = f"{base_url}/chat/completions"

        body: dict[str, Any] = {
            "model": model_id,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "max_tokens": int(kwargs.get("max_tokens", 2048)),
            "temperature": float(kwargs.get("temperature", 1)),
        }

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        resp = httpx.post(url, json=body, headers=headers, timeout=60)
        if resp.status_code != 200:
            raise RuntimeError(
                f"Bedrock Mantle request failed ({resp.status_code}): {resp.text[:400]}"
            )

        result: dict[str, Any] = resp.json()

        # Extract text â€” reasoning-only responses have content=null
        choice = result["choices"][0]["message"]
        content = choice.get("content")
        if not content:
            # Fallback: extract from reasoning field if present
            content = choice.get("reasoning", "")

        usage_raw = result.get("usage", {})
        return str(content), UsageStats(
            input_tokens=usage_raw.get("prompt_tokens", 0),
            output_tokens=usage_raw.get("completion_tokens", 0),
            model=model_id,
        )

    # -------------------------------------------------------------------------
    # Anthropic models via bedrock-runtime Invoke API
    # -------------------------------------------------------------------------
    def _invoke_bearer(
        self, token: str, model_id: str, body: dict[str, Any]
    ) -> tuple[str, UsageStats]:
        import httpx

        region = os.getenv("AWS_REGION", DEFAULT_REGION)
        url = f"https://bedrock-runtime.{region}.amazonaws.com/model/{model_id}/invoke"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        resp = httpx.post(url, json=body, headers=headers, timeout=60)
        if resp.status_code != 200:
            raise RuntimeError(
                f"Bedrock Invoke request failed ({resp.status_code}): {resp.text[:400]}"
            )
        result: dict[str, Any] = resp.json()
        text = str(result["content"][0]["text"])
        usage_raw: dict[str, int] = result.get("usage", {})
        return text, UsageStats(
            input_tokens=usage_raw.get("input_tokens", 0),
            output_tokens=usage_raw.get("output_tokens", 0),
            model=model_id,
        )

    def _invoke_boto3(
        self, model_id: str, body: dict[str, Any]
    ) -> tuple[str, UsageStats]:
        import boto3  # type: ignore[import-untyped]

        region = os.getenv("AWS_REGION", DEFAULT_REGION)
        client = boto3.client("bedrock-runtime", region_name=region)
        response = client.invoke_model(
            modelId=model_id,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json",
        )
        result: dict[str, Any] = json.loads(response["body"].read())
        text = str(result["content"][0]["text"])
        usage_raw: dict[str, int] = result.get("usage", {})
        return text, UsageStats(
            input_tokens=usage_raw.get("input_tokens", 0),
            output_tokens=usage_raw.get("output_tokens", 0),
            model=model_id,
        )

