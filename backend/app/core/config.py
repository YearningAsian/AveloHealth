"""
Application Configuration
HIPAA-compliant settings management
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AveloHealth CRM"
    DEBUG: bool = False
    
    # Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ENCRYPTION_KEY: str
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Snowflake Configuration
    SNOWFLAKE_ACCOUNT: str
    SNOWFLAKE_USER: str
    SNOWFLAKE_PASSWORD: str
    SNOWFLAKE_WAREHOUSE: str = "COMPUTE_WH"
    SNOWFLAKE_DATABASE: str = "AVELOHEALTH_DB"
    SNOWFLAKE_SCHEMA: str = "PUBLIC"
    
    # AI Services
    GEMINI_API_KEY: str
    TELI_AI_API_KEY: str
    TELI_AI_WEBHOOK_URL: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
