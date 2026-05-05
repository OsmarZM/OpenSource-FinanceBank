"""
AWS Bedrock LLM provider.

Required environment variables:
  AWS_REGION                  (default: us-east-1)
  AWS_BEARER_TOKEN_BEDROCK    Bearer token for Bedrock API key auth
  LLM_MODEL                   Bedrock model ID (default below)

Default model: anthropic.claude-3-5-sonnet-20241022-v2:0
"""
from __future__ import annotations

import json
import os

from .base import LLMProvider

DEFAULT_MODEL = "anthropic.claude-3-5-sonnet-20241022-v2:0"


class BedrockProvider(LLMProvider):
    @property
    def name(self) -> str:
        return "bedrock"

    def complete(self, *, system: str, user: str, **kwargs: object) -> str:
        import boto3  # type: ignore[import-untyped]

        region = os.getenv("AWS_REGION", "us-east-1")
        model_id = os.getenv("LLM_MODEL", DEFAULT_MODEL)

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
