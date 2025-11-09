import os
import base64
import io
import cv2
import numpy as np
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
if GOOGLE_GEMINI_API_KEY:
    genai.configure(api_key=GOOGLE_GEMINI_API_KEY)

def frame_to_pil_image(frame):
    """Convert OpenCV frame (BGR) to PIL Image (RGB)"""
    if frame is None:
        return None
    # Convert BGR to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb_frame)

def analyze_frame_for_threats(frame):
    """
    Analyze a video frame for potential security threats using Gemini Vision API
    
    Args:
        frame: OpenCV frame (numpy array in BGR format)
        
    Returns:
        dict: Analysis result with threat_detected (bool), threat_level (str), 
              description (str), and confidence (float)
    """
    try:
        if not GOOGLE_GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY == "your-gemini-api-key-here":
            return {
                "threat_detected": False,
                "threat_level": "safe",
                "description": "Gemini API key not configured",
                "confidence": 0.0,
                "details": []
            }
        
        # Convert frame to PIL Image
        pil_image = frame_to_pil_image(frame)
        if pil_image is None:
            return {
                "threat_detected": False,
                "threat_level": "safe",
                "description": "Invalid frame",
                "confidence": 0.0,
                "details": []
            }
        
        # Initialize Gemini model
        # Using gemini-2.5-flash for fast, cost-effective image analysis
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Comprehensive threat detection prompt
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

Respond in the following JSON format:
{
    "threat_detected": true/false,
    "threat_level": "safe/warning/danger",
    "description": "Brief description of what you see",
    "confidence": 0.0-1.0,
    "details": ["specific detail 1", "specific detail 2", ...]
}

Rules:
- threat_level: "safe" (no threats), "warning" (suspicious but not immediate), "danger" (immediate threat)
- confidence: Your confidence in the assessment (0.0 to 1.0)
- Be conservative - don't raise false alarms for normal activities
- Focus on security-relevant observations"""
        
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
        except json.JSONDecodeError:
            # If JSON parsing fails, return a safe default with the raw text
            return {
                "threat_detected": False,
                "threat_level": "safe",
                "description": response_text[:200],  # First 200 chars
                "confidence": 0.5,
                "details": ["Analysis completed but format unexpected"]
            }
        
        # Validate and normalize the result
        result.setdefault("threat_detected", False)
        result.setdefault("threat_level", "safe")
        result.setdefault("description", "No description provided")
        result.setdefault("confidence", 0.0)
        result.setdefault("details", [])
        
        return result
        
    except Exception as e:
        print(f"Error analyzing frame: {str(e)}")
        return {
            "threat_detected": False,
            "threat_level": "safe",
            "description": f"Error during analysis: {str(e)}",
            "confidence": 0.0,
            "details": []
        }

def analyze_frame(frame):
    """
    Legacy function name for backwards compatibility
    """
    return analyze_frame_for_threats(frame)
