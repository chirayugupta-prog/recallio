from supabase import create_client, Client
from app.core.config import settings

# Initialize the Supabase client using settings from your .env
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def insert_document(data: dict):
    """
    Helper function to insert email metadata and embeddings into Supabase.
    """
    return supabase.table("documents").insert(data).execute()