import os
import base64
import io
import cv2
import numpy as np
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv
import time
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
if GOOGLE_GEMINI_API_KEY:
    genai.configure(api_key=GOOGLE_GEMINI_API_KEY)

# Statistics tracking
api_calls_made = 0

def frame_to_pil_image(frame):
    """Convert OpenCV frame (BGR) to PIL Image (RGB)"""
    if frame is None:
        return None
    # Convert BGR to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb_frame)

def frame_to_base64(frame):
    """Convert OpenCV frame to base64 encoded JPEG string"""
    if frame is None:
        return None
    
    # Convert BGR to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb_frame)
    
    # Convert to JPEG bytes
    buffer = io.BytesIO()
    pil_image.save(buffer, format='JPEG', quality=85)
    buffer.seek(0)
    
    # Encode to base64
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f"data:image/jpeg;base64,{img_base64}"

def analyze_frame_for_threats(frame):
    """
    Direct Gemini AI threat analysis - no heuristics preprocessing
    
    Analyzes every frame with Gemini AI for comprehensive threat detection.
    Captures frame image when any threat is detected for evidence.
    
    Args:
        frame: OpenCV frame (numpy array in BGR format)
        
    Returns:
        dict: Analysis result with threat_detected (bool), threat_level (str), 
              description (str), confidence (float), and image_data (base64)
    """
    global api_calls_made
    
    try:
        if not GOOGLE_GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY == "your-gemini-api-key-here":
            return {
                "threat_detected": False,
                "threat_level": "safe",
                "description": "Gemini API key not configured",
                "confidence": 0.0,
                "details": [],
                "image_data": None
            }
        
        # Convert frame to PIL Image
        pil_image = frame_to_pil_image(frame)
        if pil_image is None:
            return {
                "threat_detected": False,
                "threat_level": "safe",
                "description": "Invalid frame",
                "confidence": 0.0,
                "details": [],
                "image_data": None
            }
        
        # Capture the frame for potential evidence
        image_data = frame_to_base64(frame)
        
        # Gemini AI Analysis
        api_calls_made += 1
        print(f"🤖 Analyzing frame with Gemini AI (Total calls: {api_calls_made})")
        
        # Initialize Gemini model
        # Using gemini-2.0-flash-exp for fast, accurate image analysis
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Comprehensive threat detection prompt with JSON response requirement
        prompt = """You are an advanced security surveillance AI. Analyze this image for potential security threats or suspicious activities.

Look for:
1. Weapons (guns, knives, suspicious objects)
2. Suspicious behavior (fighting, breaking in, theft attempts)
3. Fire or smoke
4. Unauthorized access attempts
5. People in restricted areas
6. Vandalism or property damage
7. Medical emergencies (people falling, injured)
8. Unusual gatherings or crowds
9. Abandoned suspicious packages or bags
10. Any other security concerns

CRITICAL: Respond ONLY with valid JSON in this EXACT format (no markdown, no code blocks):
{{
    "threat_detected": true,
    "threat_level": "warning",
    "description": "Brief description of what you see",
    "confidence": 0.85,
    "details": ["specific detail 1", "specific detail 2", "specific detail 3"],
    "objects_detected": ["object1", "object2"],
    "people_count": 2,
    "recommended_action": "Brief action recommendation"
}}

Rules:
- threat_level: "safe" (no threats), "warning" (suspicious but not immediate), "danger" (immediate threat)
- confidence: Your confidence in the assessment (0.0 to 1.0)
- details: Array of 3-5 specific observations
- objects_detected: Array of notable objects seen in the scene
- people_count: Number of people visible
- recommended_action: Brief action suggestion
- Be conservative - don't raise false alarms for normal activities
- Focus on security-relevant observations
- Return ONLY valid JSON, no other text"""
        
        # Generate response
        response = model.generate_content([prompt, pil_image])
        
        # Parse response
        response_text = response.text.strip()
        
        # Try to extract JSON from the response
        import json
        
        # Remove markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        try:
            result = json.loads(response_text)
        except json.JSONDecodeError as e:
            # If JSON parsing fails, return a safe default with the raw text
            print(f"⚠️ JSON parsing failed: {e}")
            print(f"   Raw response: {response_text[:200]}")
            return {
                "threat_detected": False,
                "threat_level": "safe",
                "description": response_text[:200],  # First 200 chars
                "confidence": 0.5,
                "details": ["Analysis completed but format unexpected"],
                "image_data": image_data
            }
        
        # Validate and normalize the result
        result.setdefault("threat_detected", False)
        result.setdefault("threat_level", "safe")
        result.setdefault("description", "No description provided")
        result.setdefault("confidence", 0.0)
        result.setdefault("details", [])
        result.setdefault("objects_detected", [])
        result.setdefault("people_count", 0)
        result.setdefault("recommended_action", "Monitor the situation")
        
        # Include the captured frame with all detections
        result["image_data"] = image_data
        
        print(f"✅ AI Analysis complete: {result['threat_level']} (confidence: {result['confidence']:.2f})")
        print(f"   Objects: {result.get('objects_detected', [])}")
        print(f"   People: {result.get('people_count', 0)}")
        print(f"   Action: {result.get('recommended_action', 'N/A')}")
        
        return result
        
    except Exception as e:
        print(f"Error analyzing frame: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "threat_detected": False,
            "threat_level": "safe",
            "description": f"Error during analysis: {str(e)}",
            "confidence": 0.0,
            "details": [],
            "image_data": None
        }

def analyze_frame(frame):
    """
    Legacy function name for backwards compatibility
    """
    return analyze_frame_for_threats(frame)
