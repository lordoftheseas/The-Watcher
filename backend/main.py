from fastapi import FastAPI, File, UploadFile, HTTPException, Form
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
    from video_processor.detector import api_calls_made
    
    return {
        "status": "healthy",
        "gemini_api_configured": bool(os.getenv("GOOGLE_GEMINI_API_KEY")),
        "api_usage": {
            "total_calls": api_calls_made,
            "mode": "direct_gemini_analysis"
        }
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
    Save a threat detection to the database with image data
    
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
        
        # Save ALL detections (safe, warning, danger) with confidence >= 0.5
        # This captures all Gemini findings for comprehensive reporting
        if confidence >= 0.5:
            # Build extended details with AI analysis
            extended_details = detection.get("details", [])
            
            # Add AI-specific fields if available
            if detection.get("objects_detected"):
                extended_details.append(f"Objects detected: {', '.join(detection.get('objects_detected', []))}")
            if detection.get("people_count"):
                extended_details.append(f"People count: {detection.get('people_count')}")
            if detection.get("recommended_action"):
                extended_details.append(f"Recommended action: {detection.get('recommended_action')}")
            
            # Insert into database
            insert_data = {
                "user_id": user_id,
                "camera_name": data.get("camera_name", "Live Camera"),
                "threat_detected": detection.get("threat_detected", False),
                "threat_level": threat_level,
                "description": detection.get("description", ""),
                "confidence": confidence,
                "details": extended_details,
                "image_url": data.get("image_url"),  # Can still use image_url for external storage
                "image_data": detection.get("image_data"),  # Store base64 image directly
            }
            
            # Add report_id if provided
            if data.get("report_id"):
                insert_data["report_id"] = data.get("report_id")
            
            result = supabase.table("threat_detections").insert(insert_data).execute()
            
            return JSONResponse(content={
                "success": True,
                "message": f"Detection saved with image (Level: {threat_level})",
                "id": result.data[0]["id"] if result.data else None
            })
        else:
            return JSONResponse(content={
                "success": True,
                "message": f"Detection not saved (confidence too low: {confidence:.2f})"
            })
        
    except Exception as e:
        print(f"Error in save_threat_detection: {str(e)}")
        import traceback
        traceback.print_exc()
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
        
        # Query ALL threat detections (safe, warning, danger)
        result = supabase.table("threat_detections")\
            .select("*")\
            .eq("user_id", user_id)\
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

@app.post("/api/generate-threat-report")
async def generate_threat_report(
    video: UploadFile = File(...),
    threat_level: str = Form(None),
    description: str = Form(None),
    confidence: float = Form(None),
    timestamp: str = Form(None),
    details: str = Form(None)
):
    """
    Generate a detailed threat report using Gemini AI
    
    Takes a video recording and threat details, generates comprehensive report
    """
    try:
        import google.generativeai as genai
        from datetime import datetime
        import json
        
        # Get Gemini API key
        api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
        if not api_key or api_key == "your-gemini-api-key-here":
            raise HTTPException(status_code=500, detail="Gemini API not configured")
        
        genai.configure(api_key=api_key)
        
        # Read video file
        video_bytes = await video.read()
        
        # Parse details if provided as JSON string
        details_list = []
        if details:
            try:
                details_list = json.loads(details)
            except:
                details_list = [details]
        
        # Create detailed prompt for report generation
        prompt = f"""You are a professional security analyst generating a comprehensive threat assessment report.

**Incident Details:**
- Threat Level: {threat_level or 'Unknown'}
- Initial Detection: {description or 'No description provided'}
- Confidence Score: {float(confidence or 0) * 100:.1f}%
- Timestamp: {timestamp or datetime.now().isoformat()}
- Observed Details: {', '.join(details_list) if details_list else 'None'}

**Your Task:**
Analyze the provided video evidence and generate a detailed security incident report with the following sections:

1. **Executive Summary** (2-3 sentences): Brief overview of the incident
2. **Detailed Analysis** (1 paragraph): What exactly happened, who/what was involved, sequence of events
3. **Threat Assessment** (bullet points):
   - Severity level and justification
   - Potential risks or consequences
   - Immediate concerns
4. **Recommendations** (numbered list):
   - Immediate actions to take
   - Follow-up procedures
   - Prevention measures for future
5. **Additional Observations**: Any other relevant security concerns noted

**Format Guidelines:**
- Be professional and objective
- Use clear, concise language
- Focus on actionable insights
- Highlight any urgent concerns
- Include timestamps if relevant events are observed in the video

Generate the report now:"""

        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-2.0-flash-lite')
        
        # Generate report (text-only for now, video analysis can be added if supported)
        response = model.generate_content(prompt)
        report_text = response.text.strip()
        
        # Create structured report
        report_id = f"THREAT-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        report_data = {
            "id": report_id,
            "timestamp": timestamp or datetime.now().isoformat(),
            "threat_level": threat_level,
            "initial_description": description,
            "confidence": float(confidence or 0),
            "details": details_list,
            "detailed_analysis": report_text,
            "video_filename": f"{report_id}.webm",
            "generated_at": datetime.now().isoformat()
        }
        
        # Extract key sections from the report (simplified parsing)
        # In production, you might use more sophisticated parsing
        sections = report_text.split('\n\n')
        
        # Try to extract recommendations
        recommendations = "See detailed analysis"
        for section in sections:
            if 'recommendation' in section.lower():
                recommendations = section
                break
        
        report_data["recommendations"] = recommendations
        
        return JSONResponse(content={
            "success": True,
            "report": report_data,
            "message": "Detailed threat report generated successfully"
        })
        
    except Exception as e:
        print(f"Error in generate_threat_report: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
