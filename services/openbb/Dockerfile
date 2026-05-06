FROM python:3.12-slim

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy project metadata first (layer caching)
COPY pyproject.toml ./

# Install dependencies (no project code yet — cache layer)
RUN uv pip install --system --no-cache-dir \
    "fastapi>=0.115.0" \
    "uvicorn[standard]>=0.32.0" \
    "openbb>=4.3.0" \
    "openbb-equity>=1.3.0" \
    "openbb-currency>=1.2.0" \
    "openbb-index>=1.2.0" \
    "openbb-news>=1.0.0" \
    "httpx>=0.27.0" \
    "python-dotenv>=1.0.0" \
    "supabase>=2.9.0"

# Copy source
COPY src/ ./src/

EXPOSE 8001

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]
