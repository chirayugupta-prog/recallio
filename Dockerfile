FROM python:3.11-slim

WORKDIR /app

# System dependencies (Minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

# Sirf backend ki requirements copy karo
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sirf backend ka code copy karo
COPY backend/ ./backend/

# Railway PORT
EXPOSE 8080

# Start command (Path dhyan se dekhna)
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}