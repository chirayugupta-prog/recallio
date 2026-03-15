from fastapi import APIRouter, HTTPException, Query
from app.db.supabase import supabase
from app.services.ai_service import AIService

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("")
async def search_emails(
    query: str = Query(..., min_length=1),
    user_id: str = Query(..., min_length=1)
):
    try:
        # 1. Create Voyage embedding (1024 dimensions)
        query_embedding = AIService.create_embedding(query)

        if not query_embedding:
            return await keyword_fallback(query, user_id)

        # 2. Call the NEW final function
        search_res = supabase.rpc(
            "match_docs_final", 
            {
                "query_embedding": query_embedding,
                "match_threshold": 0.3, # Balanced threshold for Voyage
                "match_count": 10,
                "p_user_id": user_id
            }
        ).execute()

        if not search_res.data:
            print("No semantic matches, falling back to keywords.")
            return await keyword_fallback(query, user_id)

        return search_res.data

    except Exception as e:
        print(f"Search Error: {e}")
        return await keyword_fallback(query, user_id)

async def keyword_fallback(query: str, user_id: str):
    try:
        # Dono title aur content mein search maro
        res = supabase.table("documents") \
            .select("*") \
            .eq("user_id", user_id) \
            .or_(f"title.ilike.%{query}%,content.ilike.%{query}%") \
            .limit(15) \
            .execute()
        return res.data or []
    except Exception as e:
        print(f"Fallback Error: {e}")
        return []