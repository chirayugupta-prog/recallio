from fastapi import Header, HTTPException, status
from app.db.supabase import supabase

async def get_current_user(authorization: str = Header(None)):
    """
    Dependency to verify the Supabase JWT. 
    In production, you use this to ensure only logged-in users hit your API.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header",
        )
    
    # Example: Verify token with supabase.auth.get_user(token)
    # For now, we just pass the auth string through
    return authorization

async def get_google_token(authorization: str = Header(None)):
    """
    Extracts the Google Provider Token from the header.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Google Provider Token",
        )
    return authorization.split(" ")[1]