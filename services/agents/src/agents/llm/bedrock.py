"""
AWS Bedrock LLM provider.

Authentication (in order of priority):
  1. AWS_BEARER_TOKEN_BEDROCK  — Bedrock API key (no IAM needed)
  2. AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY — standard IAM credentials

Other environment variables:
  AWS_REGION                  (default: us-east-1)
  BEDROCK_MODEL_ID            Bedrock model ID (default: Claude Haiku 4.5)

Pricing (Claude Haiku 4.5):
  Input:  $1.00 / 1M tokens
  Output: $5.00 / 1M tokens
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from typing import Any

from .base import LLMProvider

# Claude Haiku 4.5 — fast and cost-effective for financial insights
DEFAULT_MODEL = "anthropic.claude-haiku-4-5-20251022-v1:0"

# Pricing per million tokens (USD)
HAIKU_INPUT_PRICE_PER_M = 1.00
HAIKU_OUTPUT_PRICE_PER_M = 5.00


@dataclass
class UsageStats:
    input_tokens: int = 0
    output_tokens: int = 0
    model: str = ""

    @property
    def estimated_cost_usd(self) -> float:
        return (
            self.input_tokens / 1_000_000 * HAIKU_INPUT_PRICE_PER_M
            + self.output_tokens / 1_000_000 * HAIKU_OUTPUT_PRICE_PER_M
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
    """AWS Bedrock provider — supports both Bearer Token (API key) and IAM auth."""

    def __init__(self) -> None:
        self.last_usage: UsageStats | None = None

    @property
    def name(self) -> str:
        return "bedrock"

    def complete(self, *, system: str, user: str, **kwargs: object) -> str:
        model_id = os.getenv("BEDROCK_MODEL_ID") or os.getenv("LLM_MODEL", DEFAULT_MODEL)
        bearer_token = os.getenv("AWS_BEARER_TOKEN_BEDROCK")

        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": int(kwargs.get("max_tokens", 1024)),
            "system": system,
            "messages": [{"role": "user", "content": user}],
        }

        if bearer_token:
            text, usage = self._complete_bearer(bearer_token, model_id, body)
        else:
            text, usage = self._complete_boto3(model_id, body)

        self.last_usage = usage
        return text

    # -------------------------------------------------------------------------
    # Bearer Token auth (Bedrock API key — no IAM required)
    # -------------------------------------------------------------------------
    def _complete_bearer(
        self, token: str, model_id: str, body: dict[str, Any]
    ) -> tuple[str, UsageStats]:
        import httpx  # already in pyproject deps

        region = os.getenv("AWS_REGION", "us-east-1")
        url = (
            f"https://bedrock-runtime.{region}.amazonaws.com"
            f"/model/{model_id}/invoke"
        )
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        resp = httpx.post(url, json=body, headers=headers, timeout=60)
        if resp.status_code != 200:
            raise RuntimeError(
                f"Bedrock Bearer request failed ({resp.status_code}): {resp.text[:400]}"
            )

        result: dict[str, Any] = resp.json()
        text = str(result["content"][0]["text"])
        usage_raw: dict[str, int] = result.get("usage", {})

        return text, UsageStats(
            input_tokens=usage_raw.get("input_tokens", 0),
            output_tokens=usage_raw.get("output_tokens", 0),
            model=model_id,
        )

    # -------------------------------------------------------------------------
    # IAM credentials auth (boto3 — existing behaviour)
    # -------------------------------------------------------------------------
    def _complete_boto3(
        self, model_id: str, body: dict[str, Any]
    ) -> tuple[str, UsageStats]:
        import boto3  # type: ignore[import-untyped]

        region = os.getenv("AWS_REGION", "us-east-1")
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

