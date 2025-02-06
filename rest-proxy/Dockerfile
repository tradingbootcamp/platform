FROM python:3.12-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY . .

RUN uv sync --frozen --no-cache

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]