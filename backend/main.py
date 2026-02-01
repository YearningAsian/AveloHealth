"""
FastAPI Main Application
AveloHealth - Digital Health Diary Platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.api.routes import patients, ai_analysis, appointments, auth, dashboard, teli, providers
from app.core.config import settings
from app.db.snowflake_client import SnowflakeClient

load_dotenv()

# Initialize Snowflake connection on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for database connections"""
    # Startup
    print("🚀 Starting AveloHealth Backend...")
    try:
        snowflake_client = SnowflakeClient()
        await snowflake_client.connect()
        app.state.snowflake = snowflake_client
        print("✅ Snowflake connection established")
    except Exception as e:
        print(f"⚠️  Warning: Snowflake connection failed: {e}")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down AveloHealth Backend...")
    if hasattr(app.state, 'snowflake'):
        await app.state.snowflake.disconnect()
        print("✅ Snowflake connection closed")

# Create FastAPI app
app = FastAPI(
    title="AveloHealth API",
    description="Digital Health Diary - Track Your Health Journey",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(ai_analysis.router, prefix="/api/ai", tags=["AI Analysis"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(providers.router, prefix="/api/providers", tags=["Providers"])
app.include_router(teli.router, prefix="/api/teli", tags=["Teli AI"])

@app.get("/")
async def root():
    return {
        "message": "AveloHealth API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "snowflake": hasattr(app.state, 'snowflake'),
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }
