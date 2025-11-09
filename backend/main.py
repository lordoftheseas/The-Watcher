from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from io import BytesIO
from PIL import Image
import os
from dotenv import load_dotenv

from video_processor.detector import analyze_frame_for_threats

# Load environment variables
load_dotenv()

app = FastAPI(title="Watcher Security System API")

# Configure CORS
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

@app.get("/")
async def root():
    return {
        "message": "Watcher Security System API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "gemini_api_configured": bool(os.getenv("GOOGLE_GEMINI_API_KEY"))
    }

@app.post("/api/analyze-frame")
async def analyze_frame_endpoint(file: UploadFile = File(...)):
    """
    Analyze a single frame from the live camera feed for threats
    
    Accepts an image file and returns threat analysis
    """
    try:
        # Read the uploaded file
        contents = await file.read()
        
        # Convert to OpenCV format
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Analyze the frame for threats
        analysis_result = analyze_frame_for_threats(frame)
        
        return JSONResponse(content={
            "success": True,
            "analysis": analysis_result
        })
        
    except Exception as e:
        print(f"Error in analyze_frame_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-frame-base64")
async def analyze_frame_base64(data: dict):
    """
    Analyze a frame sent as base64 string
    
    Accepts: {"image": "base64_string"}
    """
    try:
        import base64
        
        # Extract base64 image
        image_data = data.get("image", "")
        
        # Remove data URL prefix if present
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        
        # Convert to OpenCV format
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Analyze the frame
        analysis_result = analyze_frame_for_threats(frame)
        
        return JSONResponse(content={
            "success": True,
            "analysis": analysis_result
        })
        
    except Exception as e:
        print(f"Error in analyze_frame_base64: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/threat-detections")
async def save_threat_detection(data: dict):
    """
    Save a threat detection to the database
    
    Requires authentication token in headers
    Only saves warnings and danger level threats with confidence >= 0.7
    """
    try:
        from supabase import create_client
        
        # Get Supabase client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not supabase_url or not supabase_key:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        supabase = create_client(supabase_url, supabase_key)
        
        # Extract auth token from header
        auth_token = data.get("auth_token")
        if not auth_token:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Verify token and get user
        user_response = supabase.auth.get_user(auth_token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        
        user_id = user_response.user.id
        
        # Extract detection data
        detection = data.get("detection", {})
        threat_level = detection.get("threat_level", "safe")
        confidence = detection.get("confidence", 0.0)
        
        # Only save warnings/danger with sufficient confidence
        if threat_level in ["warning", "danger"] and confidence >= 0.7:
            # Insert into database
            result = supabase.table("threat_detections").insert({
                "user_id": user_id,
                "camera_name": data.get("camera_name", "Live Camera"),
                "threat_detected": detection.get("threat_detected", False),
                "threat_level": threat_level,
                "description": detection.get("description", ""),
                "confidence": confidence,
                "details": detection.get("details", []),
                "image_url": data.get("image_url"),
            }).execute()
            
            return JSONResponse(content={
                "success": True,
                "message": "Threat detection saved",
                "id": result.data[0]["id"] if result.data else None
            })
        else:
            return JSONResponse(content={
                "success": True,
                "message": "Detection not saved (low confidence or safe level)"
            })
        
    except Exception as e:
        print(f"Error in save_threat_detection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/threat-detections")
async def get_threat_detections(auth_token: str, limit: int = 50):
    """
    Get threat detection history for the authenticated user
    
    Returns only warnings and danger level threats
    """
    try:
        from supabase import create_client
        
        # Get Supabase client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not supabase_url or not supabase_key:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        supabase = create_client(supabase_url, supabase_key)
        
        # Verify token and get user
        user_response = supabase.auth.get_user(auth_token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        
        user_id = user_response.user.id
        
        # Query threat detections
        result = supabase.table("threat_detections")\
            .select("*")\
            .eq("user_id", user_id)\
            .in_("threat_level", ["warning", "danger"])\
            .order("timestamp", desc=True)\
            .limit(limit)\
            .execute()
        
        return JSONResponse(content={
            "success": True,
            "detections": result.data
        })
        
    except Exception as e:
        print(f"Error in get_threat_detections: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
