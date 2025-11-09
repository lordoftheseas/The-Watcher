#!/bin/bash

# Quick Start Script for Watcher Backend
echo "🚀 Starting Watcher Backend Server..."
echo ""

# Check if we're in the backend directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: main.py not found. Are you in the backend directory?"
    echo "   Run: cd backend"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "   Copy .env.example to .env and configure it"
    exit 1
fi

# Check for GOOGLE_GEMINI_API_KEY
if ! grep -q "GOOGLE_GEMINI_API_KEY=" .env; then
    echo "⚠️  Warning: GOOGLE_GEMINI_API_KEY not found in .env"
fi

# Check Python version
if ! command -v python3.13 &> /dev/null; then
    echo "⚠️  Warning: python3.13 not found, trying python3..."
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python3.13"
fi

# Kill any existing uvicorn process
echo "🔍 Checking for existing servers..."
pkill -f "uvicorn main:app" 2>/dev/null && echo "   Stopped existing server"

# Start the server
echo "✅ Starting server on http://0.0.0.0:8000"
echo "   Press Ctrl+C to stop"
echo ""

$PYTHON_CMD -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
