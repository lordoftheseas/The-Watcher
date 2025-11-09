#!/bin/bash

# Watcher Backend Startup Script

echo "🚀 Starting Watcher Security System Backend..."
echo ""

# Check if we're in the backend directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: main.py not found. Please run this script from the backend directory."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating from example..."
    echo "Please configure your API keys in .env"
fi

# Check for Gemini API key
if ! grep -q "GOOGLE_GEMINI_API_KEY=your-gemini-api-key-here" .env 2>/dev/null; then
    echo "✓ Gemini API key configured"
else
    echo "⚠️  Warning: Gemini API key not configured. Please update GOOGLE_GEMINI_API_KEY in .env"
fi

echo ""
echo "Starting FastAPI server..."
echo "API will be available at: http://localhost:8000"
echo "API docs available at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
