FROM python:3.11-slim

WORKDIR /app

# Sabse pehle requirements install karo
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Baaki saara backend code copy karo
COPY . .

# Railway automatically PORT variable deta hai
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}