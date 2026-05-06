"""
AWS Bedrock LLM provider.

Required environment variables:
  AWS_REGION                  (default: us-east-1)
  AWS_ACCESS_KEY_ID           AWS credentials (standard boto3 env vars)
  AWS_SECRET_ACCESS_KEY       AWS credentials
  BEDROCK_MODEL_ID            Bedrock model ID (default: Claude Haiku 4.5)

Default model: anthropic.claude-haiku-4-5-20251022-v1:0 (Claude Haiku 4.5)
Approximate cost: ~$1.00/M input tokens, ~$5.00/M output tokens.
"""
from __future__ import annotations

import json
import os

from .base import LLMProvider

# Claude Haiku 4.5 — fast and cost-effective for financial insights
DEFAULT_MODEL = "anthropic.claude-haiku-4-5-20251022-v1:0"


class BedrockProvider(LLMProvider):
    @property
    def name(self) -> str:
        return "bedrock"

    def complete(self, *, system: str, user: str, **kwargs: object) -> str:
        import boto3  # type: ignore[import-untyped]

        region = os.getenv("AWS_REGION", "us-east-1")
        # Prefer BEDROCK_MODEL_ID, fall back to LLM_MODEL for backwards compat
        model_id = os.getenv("BEDROCK_MODEL_ID") or os.getenv("LLM_MODEL", DEFAULT_MODEL)

        client = boto3.client("bedrock-runtime", region_name=region)

        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": int(kwargs.get("max_tokens", 1024)),
            "system": system,
            "messages": [{"role": "user", "content": user}],
        }

        response = client.invoke_model(
            modelId=model_id,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json",
        )

        result: dict = json.loads(response["body"].read())
        return str(result["content"][0]["text"])
