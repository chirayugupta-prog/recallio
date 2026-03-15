from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # These must match the names in your .env file
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # Defaults provided if not in .env
    OLLAMA_URL: str = "http://localhost:11434"
    PROJECT_NAME: str = "Recallio"
    
    # This tells Pydantic where to find the env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()