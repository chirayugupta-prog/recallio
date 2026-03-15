from fastapi import APIRouter, Header, HTTPException, Query
from app.services.gmail_service import GmailService

router = APIRouter(prefix="/gmail", tags=["Gmail"])

@router.get("/emails")
async def list_emails(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = authorization.split(" ")[1]
    return GmailService.get_recent_messages(token)

@router.get("/email/{message_id}")
async def get_email_details(message_id: str, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = authorization.split(" ")[1]
    return GmailService.fetch_single_email(message_id, token)

# Humne user_id ko Query parameter mein add kar diya hai
@router.get("/ingest")
async def ingest_to_db(user_id: str, authorization: str = Header(None)):
    """Fetch emails and save them to Supabase with the specific user_id"""
    if not authorization:
        raise HTTPException(status_code=401, detail="No token provided")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    token = authorization.split(" ")[1]
    
    # Ab service ko token aur user_id dono milenge
    result = await GmailService.ingest_emails(token, user_id)
    return result