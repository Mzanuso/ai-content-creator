import os
from typing import List

from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    """
    Application settings that are loaded from environment variables.
    """
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Content Creator"
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://localhost:3000"]
    
    # Firebase settings
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "video-content-creator-4bb16")
    FIREBASE_SERVICE_ACCOUNT: str = os.getenv("FIREBASE_SERVICE_ACCOUNT", "")
    
    # OpenAI settings - Prendi la chiave dall'ambiente
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # GoAPI settings - Prendi la chiave dall'ambiente 
    GOAPI_API_KEY: str = os.getenv("GOAPI_API_KEY", "")
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Redis settings
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create singleton instance
settings = Settings()



# Create singleton instance
settings = Settings()
