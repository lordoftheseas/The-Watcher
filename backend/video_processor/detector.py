import base64, requests, io
from PIL import Image
import numpy as np

GEMINI_API_URL = "https://api.gemini.google.com/v1/vision/analyze"
API_KEY = "YOUR_GEMINI_API_KEY"

def frame_to_base64(frame):
    img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode('utf-8')

def analyze_frame(frame):
    payload = {
        "contents": [{
            "parts": [{"mime_type": "image/jpeg", "data": frame_to_base64(frame)}]
        }]
    }
    headers = {"Authorization": f"Bearer {API_KEY}"}
    response = requests.post(GEMINI_API_URL, json=payload, headers=headers)
    return response.json()
