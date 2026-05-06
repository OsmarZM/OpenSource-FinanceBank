FROM python:3.12-slim

WORKDIR /app

RUN pip install uv --no-cache-dir

COPY pyproject.toml ./

# Install only runtime deps (no dev)
RUN uv pip install --system \
    boto3 \
    openai \
    anthropic \
    google-genai \
    httpx \
    python-dotenv \
    fastapi \
    "uvicorn[standard]"

COPY src/ ./src/

EXPOSE 8000

# HTTP mode by default (docker); stdio mode available via: python -m agents
CMD ["uvicorn", "agents.server:app", "--host", "0.0.0.0", "--port", "8000"]
