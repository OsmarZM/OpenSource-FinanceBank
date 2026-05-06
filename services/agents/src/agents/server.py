"""
FinEngine OSS — Agents HTTP server
===================================
FastAPI wrapper around the existing JSON-RPC agents sidecar.
Allows Next.js (and other HTTP clients) to call the LLM without
spawning a child process or piping stdio.

Endpoints:
  GET  /health                → health check + provider info
  POST /analyze               → generate AI insights from EngineResult

Usage:
  uv run uvicorn agents.server:app --reload --port 8000

Docker:
  docker compose --profile ai up
"""
from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from .insights import generate_insights  # noqa: E402
from .llm.registry import get_provider   # noqa: E402

app = FastAPI(
    title="FinEngine Agents",
    version="0.1.0",
    description="LLM-powered financial insight generation via AWS Bedrock (Claude Haiku 4.5)",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    """EngineResult payload from TypeScript core."""
    period: dict[str, Any] = {}
    totalIncome: float = 0.0
    totalExpenses: float = 0.0
    balance: float = 0.0
    savingsRate: float = 0.0
    byCategory: list[dict[str, Any]] = []
    transactions: list[dict[str, Any]] = []
    patterns: list[dict[str, Any]] = []
    insights: list[dict[str, Any]] = []
    monthly: list[dict[str, Any]] = []


class AnalyzeResponse(BaseModel):
    insights: list[dict[str, Any]]
    provider: str
    model: str


@app.get("/health")
def health() -> dict[str, Any]:
    provider = get_provider()
    model = (
        os.getenv("BEDROCK_MODEL_ID")
        or os.getenv("LLM_MODEL")
        or "anthropic.claude-haiku-4-5-20251022-v1:0"
    )
    return {
        "status": "ok",
        "provider": provider.name if provider else "none",
        "model": model,
        "llm_provider_env": os.getenv("LLM_PROVIDER", "none"),
    }


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(body: AnalyzeRequest) -> AnalyzeResponse:
    """
    Generate AI insights for a FinEngine EngineResult.

    Requires LLM_PROVIDER=bedrock and AWS credentials in environment.
    Returns an empty insights list if LLM_PROVIDER=none (no error).
    """
    provider = get_provider()
    model = (
        os.getenv("BEDROCK_MODEL_ID")
        or os.getenv("LLM_MODEL")
        or "anthropic.claude-haiku-4-5-20251022-v1:0"
    )

    try:
        insights = generate_insights(body.model_dump())
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return AnalyzeResponse(
        insights=insights,
        provider=provider.name if provider else "none",
        model=model,
    )
