# backend/Dockerfile

# --- Stage 1: Builder ---
FROM python:3.12-slim as builder
WORKDIR /app
RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.in-project true
RUN poetry install --no-root

# --- Stage 2: Final ---
FROM python:3.12-slim
WORKDIR /app

RUN groupadd -r appuser && useradd --no-log-init -r -g appuser appuser
COPY --from=builder /app/.venv ./.venv
ENV PATH="/app/.venv/bin:$PATH"

# This is the important part:
COPY --chown=appuser:appuser ./src/app /app/app

USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]