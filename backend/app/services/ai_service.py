import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()

VOYAGE_KEY = os.getenv("VOYAGE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

class AIService:
    @staticmethod
    def create_embedding(text: str):
        """Single embedding for SEARCH (Dimension: 1024)."""
        if not VOYAGE_KEY:
            print("CRITICAL: VOYAGE_API_KEY missing in .env")
            return None
        
        url = "https://api.voyageai.com/v1/embeddings"
        headers = {"Authorization": f"Bearer {VOYAGE_KEY}", "Content-Type": "application/json"}
        payload = {"input": [text], "model": "voyage-3"}
        
        # Simple Retry for Search
        for attempt in range(3):
            try:
                res = requests.post(url, headers=headers, json=payload, timeout=30)
                if res.status_code == 200:
                    return res.json()['data'][0]['embedding']
                elif res.status_code == 429:
                    print(f"Rate limited on search. Retrying in {attempt + 2}s...")
                    time.sleep(attempt + 2)
                else:
                    print(f"Voyage Error: {res.status_code}")
                    return None
            except Exception as e:
                print(f"Embedding Exception: {str(e)}")
                return None
        return None

    @staticmethod
    def create_embeddings_batch(texts: list):
        """Batch embeddings for INGESTION with Auto-Retry logic."""
        if not VOYAGE_KEY or not texts:
            return None
        
        url = "https://api.voyageai.com/v1/embeddings"
        headers = {"Authorization": f"Bearer {VOYAGE_KEY}", "Content-Type": "application/json"}
        payload = {"input": texts, "model": "voyage-3"}
        
        # Backoff Retry Logic: Try 3 times if Rate Limited
        for attempt in range(3):
            try:
                print(f"Sending batch of {len(texts)} to Voyage AI (Attempt {attempt + 1})...")
                res = requests.post(url, headers=headers, json=payload, timeout=120)
                
                if res.status_code == 200:
                    return [item['embedding'] for item in res.json()['data']]
                elif res.status_code == 429:
                    wait_time = (attempt + 1) * 30 # Wait 30s, then 60s
                    print(f"Voyage 429 Error. Sleeping {wait_time}s before retry...")
                    time.sleep(wait_time)
                else:
                    print(f"Voyage Batch Error: {res.status_code} - {res.text}")
                    return None
            except Exception as e:
                print(f"Batch Embedding Exception: {str(e)}")
                time.sleep(5)
                
        return None

    @staticmethod
    def generate_answer(question: str, context: str):
        if not GROQ_API_KEY: 
            print("CRITICAL: GROQ_API_KEY missing in .env")
            return "Error: No Groq Key"
            
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are Recallio, a neural email assistant. Answer based ONLY on the provided email context. If the answer isn't there, politely say you don't have that information indexed yet."},
                {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
            ]
        }
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=30)
            if res.status_code == 200:
                return res.json()['choices'][0]['message']['content']
            elif res.status_code == 429:
                return "System is a bit busy (Rate Limit). Please try asking again in a few seconds."
            else:
                return "Groq AI is currently unavailable."
        except Exception as e:
            return "Sorry, I couldn't generate an answer due to a connection issue."