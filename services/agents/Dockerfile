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
    python-dotenv

COPY src/ ./src/

CMD ["python", "-m", "agents"]
