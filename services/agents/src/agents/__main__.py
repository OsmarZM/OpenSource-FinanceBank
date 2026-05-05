"""
Entry point for the agents sidecar.

Protocol: JSON-RPC 2.0 over stdio (newline-delimited JSON).
Each request has: { "id": str, "method": "generate_insights", "params": { "result": EngineResult } }
Each response has: { "id": str, "result": Insight[] } | { "id": str, "error": str }

Usage:
  python -m agents
"""
from __future__ import annotations

import json
import sys
from typing import Any

from .insights import generate_insights


def _write(obj: dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(obj) + "\n")
    sys.stdout.flush()


def main() -> None:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            request: dict[str, Any] = json.loads(line)
        except json.JSONDecodeError as exc:
            _write({"id": None, "error": f"Invalid JSON: {exc}"})
            continue

        req_id = request.get("id")
        method = request.get("method")
        params = request.get("params", {})

        if method == "generate_insights":
            try:
                engine_result = params.get("result", {})
                insights = generate_insights(engine_result)
                _write({"id": req_id, "result": insights})
            except Exception as exc:  # noqa: BLE001
                _write({"id": req_id, "error": str(exc)})

        elif method == "ping":
            _write({"id": req_id, "result": "pong"})

        else:
            _write({"id": req_id, "error": f"Unknown method: {method}"})


if __name__ == "__main__":
    main()
