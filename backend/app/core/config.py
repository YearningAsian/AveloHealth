"""
Application Configuration
HIPAA-compliant settings management
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AveloHealth"
    DEBUG: bool = True
    
    # Security
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENCRYPTION_KEY: str = "your-encryption-key-change-in-production"
    
    # Auth0 Configuration
    AUTH0_DOMAIN: str = ""
    AUTH0_CLIENT_ID: str = ""
    AUTH0_CLIENT_SECRET: str = ""
    AUTH0_AUDIENCE: str = ""
    
    # Twilio Configuration
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_VERIFY_SERVICE_SID: str = ""
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Snowflake Configuration
    SNOWFLAKE_ACCOUNT: str = ""
    SNOWFLAKE_USER: str = ""
    SNOWFLAKE_PASSWORD: str = ""
    SNOWFLAKE_WAREHOUSE: str = "COMPUTE_WH"
    SNOWFLAKE_DATABASE: str = "AVELOHEALTH_DB"
    SNOWFLAKE_SCHEMA: str = "PUBLIC"
    
    # AI Services (Snowflake Cortex is used for AI - no external API keys needed)
    
    # Teli AI Configuration
    TELI_API_KEY: str = ""
    TELI_API_URL: str = "https://teli-hackathon--transfer-message-service-fastapi-app.modal.run"
    TELI_DEFAULT_PHONE: str = ""  # Default phone for testing
    TELI_ORG_ID: str = ""  # Teli organization ID
    TELI_USER_ID: str = ""  # Teli user ID
    TELI_SMS_AGENT_ID: str = ""  # Teli SMS agent ID for AI conversations
    TELI_VOICE_AGENT_ID: str = ""  # Teli voice agent ID for AI calls
    TELI_OUTBOUND_NUMBER: str = ""  # Default outbound number for calls/SMS
    TELI_SMS_NUMBER: str = ""  # Teli SMS sending number
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env

settings = Settings()
