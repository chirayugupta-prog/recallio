from fastapi import APIRouter, HTTPException
from app.services.ai_service import AIService
from app.db.supabase import supabase

router = APIRouter(prefix="/chat", tags=["AI Chat"])

@router.post("/ask")
async def ask_recallio(body: dict):
    question = body.get("question")
    user_id = body.get("user_id") 

    if not question:
        raise HTTPException(status_code=400, detail="Question is required")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")

    # 1. Search for relevant emails
    query_embedding = AIService.create_embedding(question)
    
    try:
        # match_docs_final function use kar rahe hain (1024 dims)
        search_res = supabase.rpc(
            "match_docs_final",
            {
                "query_embedding": query_embedding, 
                "match_threshold": 0.25, 
                "match_count": 8, 
                "p_user_id": user_id 
            }
        ).execute()
    except Exception as e:
        print(f"Chat Search Error: {e}")
        raise HTTPException(status_code=500, detail=f"Database search error")

    context_emails = search_res.data
    
    if not context_emails or len(context_emails) == 0:
        return {
            "answer": "Bhai, mujhe aapke emails mein isse related kuch nahi mila.",
            "sources": []
        }

    # 2. Prepare context for LLM
    context_text = "\n\n".join([
        f"Subject: {e['title']}\nContent: {e.get('content', '')[:1500]}" 
        for e in context_emails
    ])

    # 3. Get the answer from Groq
    answer = AIService.generate_answer(question, context_text)

    # 4. Final Response with Links
    return {
        "answer": answer,
        "sources": [
            {
                "title": e['title'], 
                "source": e.get('source', 'Gmail'),
                # Is link se user seedha us email par pahunch jayega
                "url": f"https://mail.google.com/mail/u/0/#inbox/{e['source_id']}"
            } 
            for e in context_emails
        ]
    }