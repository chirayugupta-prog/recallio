import re

def clean_text(text: str):
    """
    Database mein save karne se pehle extra kachra saaf karta hai, 
    par HTML tags ko nahi chhedta taaki EmailViewer sahi se render kare.
    """
    if not text:
        return ""
    
    # Sirf extra spaces aur newlines ko handle karein
    # HTML tags ko yahan se mat hatana (re.sub(r'<.*?>', '', text) hata diya hai)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def clean_for_ai(text: str):
    """
    Ye function sirf Embedding aur AI processing ke liye use hoga.
    Ye HTML tags aur URLs ko puri tarah saaf kar deta hai.
    """
    if not text:
        return ""
    
    # Remove HTML tags
    text = re.sub(r'<.*?>', '', text)
    # Remove URLs
    text = re.sub(r'http\S+', '', text)
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^a-zA-Z0-9\s.,!?]', '', text)
    # Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def format_email_date(date_str: str):
    """Helper to make Gmail dates look pretty."""
    return date_str