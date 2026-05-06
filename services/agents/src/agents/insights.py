"""
LLM-powered insight generation.

Takes an EngineResult dict (from TypeScript core) and returns
a list of Insight dicts using the configured LLM provider.
"""
from __future__ import annotations

import json
import uuid
from typing import Any

from .llm.registry import get_provider

_SYSTEM_PROMPT = """
Você é um consultor financeiro pessoal especializado em finanças domésticas brasileiras.
Analise os dados financeiros fornecidos e gere insights práticos, claros e acionáveis em português.
Seja direto e objetivo — o usuário quer saber O QUE está acontecendo e O QUE fazer.
Retorne APENAS um JSON array com objetos Insight, sem markdown, sem texto extra.
""".strip()

_USER_PROMPT_TEMPLATE = """
Dados financeiros do período {period_from} a {period_to}:

- Receita total: R$ {total_income:.2f}
- Despesas totais: R$ {total_expenses:.2f}
- Saldo: R$ {balance:.2f}
- Taxa de poupança: {savings_pct:.1f}%

Gastos por categoria:
{category_breakdown}

Padrões detectados:
{patterns}

Gere de 3 a 6 insights financeiros no seguinte formato JSON:
[
  {{
    "id": "<uuid>",
    "level": "info" | "success" | "warning" | "danger",
    "message": "<mensagem curta, até 80 chars>",
    "detail": "<detalhe adicional opcional>",
    "category": "<categoria relacionada, se aplicável>"
  }}
]
"""


def _format_categories(by_category: list[dict[str, Any]]) -> str:
    lines = []
    for cat in by_category[:8]:
        lines.append(f"  - {cat.get('category', '?')}: R$ {cat.get('total', 0):.2f} ({cat.get('percentage', 0):.1f}%)")
    return "\n".join(lines) if lines else "  (nenhum dado)"


def _format_patterns(patterns: list[dict[str, Any]]) -> str:
    if not patterns:
        return "  (nenhum padrão detectado)"
    lines = []
    for p in patterns[:5]:
        lines.append(f"  - {p.get('label', '')}: {p.get('description', '')}")
    return "\n".join(lines)


def generate_insights(
    engine_result: dict[str, Any],
) -> tuple[list[dict[str, Any]], dict[str, Any] | None]:
    """
    Generates AI insights from an EngineResult dict.

    Returns:
        (insights, usage_stats) where usage_stats is None if LLM_PROVIDER=none.
    """
    provider = get_provider()
    if provider is None:
        return [], None

    total_income: float = engine_result.get("totalIncome", 0)
    total_expenses: float = engine_result.get("totalExpenses", 0)
    balance: float = engine_result.get("balance", 0)
    savings_rate: float = engine_result.get("savingsRate", 0)
    by_category: list[dict[str, Any]] = engine_result.get("byCategory", [])
    patterns: list[dict[str, Any]] = engine_result.get("patterns", [])
    period: dict[str, str] = engine_result.get("period", {})

    user_prompt = _USER_PROMPT_TEMPLATE.format(
        period_from=period.get("from", "?"),
        period_to=period.get("to", "?"),
        total_income=total_income,
        total_expenses=total_expenses,
        balance=balance,
        savings_pct=savings_rate * 100,
        category_breakdown=_format_categories(by_category),
        patterns=_format_patterns(patterns),
    )

    raw = provider.complete(system=_SYSTEM_PROMPT, user=user_prompt)

    # Parse JSON response — strip any accidental markdown fences
    raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    insights: list[dict[str, Any]] = json.loads(raw)

    # Ensure each insight has a unique id
    for insight in insights:
        if not insight.get("id"):
            insight["id"] = f"llm-{uuid.uuid4().hex[:8]}"

    # Extract usage stats if the provider supports it (BedrockProvider)
    usage: dict[str, Any] | None = None
    if hasattr(provider, "last_usage") and provider.last_usage is not None:
        usage = provider.last_usage.to_dict()

    return insights, usage
