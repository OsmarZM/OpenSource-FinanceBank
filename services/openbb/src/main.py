"""
FinEngine OSS — OpenBB Market Data Sidecar
==========================================
FastAPI server exposing market data via OpenBB Platform and
a custom backend compatible with OpenBB Workspace.

Endpoints:
  GET  /health                         → health check
  GET  /quote/{symbol}                 → real-time quote
  GET  /historical/{symbol}            → OHLCV series
  GET  /index/{name}                   → index price history
  GET  /fx/{pair}                      → FX pair history
  GET  /news/{symbol}                  → company news
  POST /portfolio/value                → portfolio market value

  OpenBB Workspace protocol:
  GET  /widgets.json                   → widget definitions
  GET  /data/transactions              → last session transactions
  GET  /data/by-category               → spending breakdown
  GET  /data/monthly                   → monthly aggregates

Usage:
  uv run uvicorn main:app --reload --port 8001
"""
from __future__ import annotations

import os
from datetime import date, timedelta
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(
    title="FinEngine OpenBB Sidecar",
    version="0.1.0",
    description="Market data bridge between OpenBB Platform and FinEngine dashboard",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Lazy OpenBB import (avoid slow startup if not used) ─────────────────────
_obb: Any = None


def get_obb() -> Any:
    global _obb  # noqa: PLW0603
    if _obb is None:
        from openbb import obb as _openbb  # type: ignore[import-untyped]
        _obb = _openbb
    return _obb


# ─── Supabase client (optional — only for /data/* endpoints) ─────────────────
_supabase: Any = None


def get_supabase() -> Any | None:
    global _supabase  # noqa: PLW0603
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        return None
    if _supabase is None:
        from supabase import create_client  # type: ignore[import-untyped]
        _supabase = create_client(url, key)
    return _supabase


# ─── Models ──────────────────────────────────────────────────────────────────
class Holding(BaseModel):
    symbol: str
    quantity: float


class PortfolioRequest(BaseModel):
    holdings: list[Holding]


# ─── Health ──────────────────────────────────────────────────────────────────
@app.get("/health")
def health() -> dict[str, str]:
    try:
        import openbb  # type: ignore[import-untyped]
        version = openbb.__version__
    except Exception:  # noqa: BLE001
        version = "unknown"
    return {"status": "ok", "openbb_version": version}


# ─── Market data endpoints ───────────────────────────────────────────────────
@app.get("/quote/{symbol}")
def get_quote(symbol: str) -> dict[str, Any]:
    """Current quote for a symbol (e.g. PETR4.SA, AAPL)."""
    try:
        obb = get_obb()
        result = obb.equity.price.quote(symbol=symbol, provider="yfinance")
        data = result.to_dict()["results"]
        if not data:
            raise HTTPException(status_code=404, detail=f"No quote found for {symbol}")
        return {"symbol": symbol, "quote": data[0]}
    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.get("/historical/{symbol}")
def get_historical(
    symbol: str,
    from_date: str = Query(default=None, alias="from"),
    to_date: str = Query(default=None, alias="to"),
    interval: str = Query(default="1d"),
) -> dict[str, Any]:
    """OHLCV historical data for a symbol."""
    end = to_date or str(date.today())
    start = from_date or str(date.today() - timedelta(days=90))
    try:
        obb = get_obb()
        result = obb.equity.price.historical(
            symbol=symbol, start_date=start, end_date=end,
            interval=interval, provider="yfinance",
        )
        return {
            "symbol": symbol,
            "from": start,
            "to": end,
            "data": result.to_dict()["results"],
        }
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.get("/index/{name}")
def get_index(
    name: str,
    from_date: str = Query(default=None, alias="from"),
    to_date: str = Query(default=None, alias="to"),
) -> dict[str, Any]:
    """
    Market index price history.
    Common names: ^BVSP (IBOV), ^GSPC (S&P500), ^DJI, ^IXIC (NASDAQ).
    """
    end = to_date or str(date.today())
    start = from_date or str(date.today() - timedelta(days=90))
    try:
        obb = get_obb()
        result = obb.index.price.historical(
            symbol=name, start_date=start, end_date=end, provider="yfinance",
        )
        return {"index": name, "from": start, "to": end, "data": result.to_dict()["results"]}
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.get("/fx/{pair}")
def get_fx(
    pair: str,
    from_date: str = Query(default=None, alias="from"),
    to_date: str = Query(default=None, alias="to"),
) -> dict[str, Any]:
    """
    FX pair history.
    Examples: USDBRL, EURBRL, EURUSD.
    """
    end = to_date or str(date.today())
    start = from_date or str(date.today() - timedelta(days=30))
    try:
        obb = get_obb()
        # OpenBB expects base/quote split
        base = pair[:3].upper()
        quote = pair[3:].upper()
        result = obb.currency.price.historical(
            symbol=f"{base}/{quote}", start_date=start, end_date=end, provider="yfinance",
        )
        return {"pair": pair, "from": start, "to": end, "data": result.to_dict()["results"]}
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.get("/news/{symbol}")
def get_news(symbol: str, limit: int = Query(default=10, le=50)) -> dict[str, Any]:
    """Recent news articles for a company symbol."""
    try:
        obb = get_obb()
        result = obb.news.company(symbol=symbol, limit=limit, provider="yfinance")
        return {"symbol": symbol, "news": result.to_dict()["results"]}
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.post("/portfolio/value")
def get_portfolio_value(body: PortfolioRequest) -> dict[str, Any]:
    """
    Returns current market value for a portfolio.
    POST body: { "holdings": [{ "symbol": "PETR4.SA", "quantity": 100 }] }
    """
    if not body.holdings:
        return {"totalValue": 0.0, "positions": []}

    obb = get_obb()
    positions: list[dict[str, Any]] = []
    total = 0.0

    for holding in body.holdings:
        try:
            res = obb.equity.price.quote(symbol=holding.symbol, provider="yfinance")
            data = res.to_dict()["results"]
            if data:
                price: float = float(data[0].get("last_price") or data[0].get("close") or 0)
                value = price * holding.quantity
                total += value
                positions.append({
                    "symbol": holding.symbol,
                    "quantity": holding.quantity,
                    "lastPrice": price,
                    "value": round(value, 2),
                })
        except Exception as e:  # noqa: BLE001
            positions.append({
                "symbol": holding.symbol,
                "quantity": holding.quantity,
                "error": str(e),
            })

    return {"totalValue": round(total, 2), "positions": positions}


# ─── OpenBB Workspace protocol ───────────────────────────────────────────────
@app.get("/widgets.json")
def widgets_manifest() -> list[dict[str, Any]]:
    """
    OpenBB Workspace custom backend widget definitions.
    See: https://docs.openbb.co/workspace/custom-backend
    """
    base_url = os.getenv("OPENBB_SELF_URL", "http://localhost:8001")
    return [
        {
            "id": "finengine_transactions",
            "name": "FinEngine — Transactions",
            "description": "Latest transactions from the most recent FinEngine analysis session",
            "category": "Finance",
            "endpoint": f"{base_url}/data/transactions",
            "gridData": {"w": 20, "h": 9},
            "params": [],
        },
        {
            "id": "finengine_by_category",
            "name": "FinEngine — Spending by Category",
            "description": "Spending breakdown by category from latest analysis session",
            "category": "Finance",
            "endpoint": f"{base_url}/data/by-category",
            "gridData": {"w": 10, "h": 9},
            "params": [],
        },
        {
            "id": "finengine_monthly",
            "name": "FinEngine — Monthly Summary",
            "description": "Monthly income vs expenses from latest analysis session",
            "category": "Finance",
            "endpoint": f"{base_url}/data/monthly",
            "gridData": {"w": 10, "h": 9},
            "params": [],
        },
    ]


@app.get("/data/transactions")
def data_transactions() -> list[dict[str, Any]]:
    """Latest transactions from the most recent Supabase analysis session."""
    sb = get_supabase()
    if sb is None:
        return []
    try:
        sessions = sb.table("analysis_sessions").select("id").order("created_at", desc=True).limit(1).execute()
        if not sessions.data:
            return []
        session_id = sessions.data[0]["id"]
        rows = sb.table("transactions").select("*").eq("session_id", session_id).execute()
        return rows.data or []
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.get("/data/by-category")
def data_by_category() -> list[dict[str, Any]]:
    """Spending by category from latest session's result_json."""
    sb = get_supabase()
    if sb is None:
        return []
    try:
        sessions = (
            sb.table("analysis_sessions")
            .select("result_json")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not sessions.data:
            return []
        result_json: dict[str, Any] = sessions.data[0].get("result_json") or {}
        return result_json.get("byCategory", [])
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.get("/data/monthly")
def data_monthly() -> list[dict[str, Any]]:
    """Monthly income/expenses from latest session's result_json."""
    sb = get_supabase()
    if sb is None:
        return []
    try:
        sessions = (
            sb.table("analysis_sessions")
            .select("result_json")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not sessions.data:
            return []
        result_json: dict[str, Any] = sessions.data[0].get("result_json") or {}
        return result_json.get("monthly", [])
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(e)) from e
