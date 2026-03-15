FROM python:3.11-slim
WORKDIR /app
# Root se backend folder ki requirements uthao
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Saara code copy karo
COPY . .
# Start command mein path sahi karo
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}