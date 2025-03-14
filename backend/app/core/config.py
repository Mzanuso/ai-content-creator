import os
import json
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
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "https://localhost:3000", 
        "https://ai-content-creator-f7d53.web.app", 
        "https://ai-content-creator-f7d53.firebaseapp.com"
    ]
    
    # Firebase settings
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "ai-content-creator-f7d53")
    
    # The service account can be provided as a JSON string in an environment variable
    # or as a path to a file
    FIREBASE_SERVICE_ACCOUNT_JSON: str = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")
    FIREBASE_SERVICE_ACCOUNT_PATH: str = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "")
    
    @property
    def firebase_credentials(self):
        """Get Firebase credentials from environment or file."""
        if self.FIREBASE_SERVICE_ACCOUNT_JSON:
            try:
                return json.loads(self.FIREBASE_SERVICE_ACCOUNT_JSON)
            except json.JSONDecodeError:
                return None
        elif self.FIREBASE_SERVICE_ACCOUNT_PATH and os.path.exists(self.FIREBASE_SERVICE_ACCOUNT_PATH):
            try:
                with open(self.FIREBASE_SERVICE_ACCOUNT_PATH, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return None
        return None
    
    # OpenAI settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # GoAPI settings
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
