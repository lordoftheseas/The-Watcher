from dotenv import load_dotenv
import os
from typing import Optional, List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
from auth import router as auth_router

load_dotenv()

# Note: Database tables are created via schema.sql in Supabase SQL Editor
# See DATABASE_SETUP.md for instructions

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("✅ Watcher API started successfully")
    print("📝 Database tables: Run backend/schema.sql in Supabase SQL Editor")
    print("🔗 API Docs: http://localhost:8000/docs")
    yield
    print("� Shutting down Watcher API")

app = FastAPI(
    title="Watcher API",
    description="Real-time crime detection monitoring system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware - Allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router
app.include_router(auth_router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Watcher API - Real-time Crime Detection System",
        "status": "running",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


