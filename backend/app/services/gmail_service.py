import requests
import base64
import asyncio
import time
from app.db.supabase import supabase 
from app.services.ai_service import AIService
from app.services.utils import clean_text, clean_for_ai

class GmailService:
    @staticmethod
    def decode_body(data):
        if not data: return ""
        try:
            return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
        except: return ""

    @staticmethod
    def get_full_body(payload):
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/html':
                    return GmailService.decode_body(part['body'].get('data'))
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain':
                    return GmailService.decode_body(part['body'].get('data'))
            for part in payload['parts']:
                res = GmailService.get_full_body(part)
                if res: return res
        else:
            return GmailService.decode_body(payload.get('body', {}).get('data'))
        return ""

    @staticmethod
    def fetch_single_email(message_id: str, token: str):
        url = f"https://www.googleapis.com/gmail/v1/users/me/messages/{message_id}"
        headers = {"Authorization": f"Bearer {token}"}
        try:
            res = requests.get(url, headers=headers, params={"format": "full"})
            return res.json() if res.status_code == 200 else {"error": res.status_code}
        except Exception as e: return {"error": str(e)}

    @staticmethod
    async def ingest_emails(token: str, user_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        try:
            # 1. Fetch 50 most recent message IDs
            list_res = requests.get(
                "https://www.googleapis.com/gmail/v1/users/me/messages",
                headers=headers, 
                params={"maxResults": 50, "q": "category:updates"}
            ).json()
        except Exception as e: return {"status": "error", "message": str(e)}

        messages = list_res.get("messages", [])
        if not messages: return {"status": "success", "ingested": 0}

        # --- STEP 1: DUPLICATE CHECK (IDEMPOTENCY) ---
        # Fetch all existing source_ids for this user from DB
        try:
            existing_res = supabase.table("documents") \
                .select("source_id") \
                .eq("user_id", user_id) \
                .execute()
            existing_ids = {row['source_id'] for row in existing_res.data}
        except Exception as e:
            print(f"Supabase Fetch Error: {e}")
            existing_ids = set()

        # Filter out emails that are already in the DB
        new_messages = [m for m in messages if m['id'] not in existing_ids]
        
        if not new_messages:
            print("No new emails to index. Skipping Voyage AI.")
            return {"status": "success", "message": "All emails already indexed", "ingested": 0}

        print(f"Found {len(new_messages)} new emails. Fetching content...")

        email_data_list = []
        texts_to_embed = []

        # --- STEP 2: FETCH CONTENT ONLY FOR NEW EMAILS ---
        for msg in new_messages:
            full_msg = GmailService.fetch_single_email(msg['id'], token)
            if "error" in full_msg: continue
            
            payload = full_msg.get('payload', {})
            headers_list = payload.get('headers', [])
            subject = next((h['value'] for h in headers_list if h['name'].lower() == 'subject'), "No Subject")
            sender = next((h['value'] for h in headers_list if h['name'].lower() == 'from'), "Unknown")
            
            body = GmailService.get_full_body(payload) or full_msg.get("snippet", "")
            
            email_data_list.append({
                "source_id": msg['id'],
                "user_id": user_id,
                "title": subject,
                "content": clean_text(body),
                "metadata": {"subject": subject, "from": sender},
                "source": "Gmail"
            })
            texts_to_embed.append(f"Subject: {subject}\nContent: {clean_for_ai(body)[:1000]}")

        # --- STEP 3: CHUNKING & RATE LIMIT GUARD ---
        chunk_size = 10
        total_ingested = 0
        
        for i in range(0, len(texts_to_embed), chunk_size):
            chunk_texts = texts_to_embed[i : i + chunk_size]
            chunk_data = email_data_list[i : i + chunk_size]
            
            print(f"Embedding chunk {i//chunk_size + 1} with Voyage AI...")
            embeddings = AIService.create_embeddings_batch(chunk_texts)
            
            if embeddings:
                for j, email in enumerate(chunk_data):
                    try:
                        email["embedding"] = embeddings[j]
                        # Using upsert just in case, but filter already handled it
                        supabase.table("documents").upsert(email, on_conflict="source_id").execute()
                        total_ingested += 1
                    except Exception as e: print(f"DB Error: {e}")
                
                # --- INCREASED DELAY FOR FREE TIER ---
                if i + chunk_size < len(texts_to_embed):
                    print("Voyage Rate Limit Guard: Sleeping for 20 seconds...")
                    await asyncio.sleep(20) 
            else:
                print(f"Skipping chunk {i//chunk_size + 1} due to Voyage Error")

        return {"status": "success", "ingested": total_ingested}