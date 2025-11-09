"""
Test script for threat detection system
This script tests the detector module without requiring a running server
"""

import os
import cv2
import numpy as np
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_api_key():
    """Test if Gemini API key is configured"""
    print("🔑 Testing API Key Configuration...")
    api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
    
    if not api_key:
        print("❌ GOOGLE_GEMINI_API_KEY not found in environment")
        return False
    elif api_key == "your-gemini-api-key-here":
        print("⚠️  GOOGLE_GEMINI_API_KEY is set to default placeholder")
        print("   Please update your .env file with a real API key")
        print("   Get one from: https://makersuite.google.com/app/apikey")
        return False
    else:
        print(f"✓ API Key found: {api_key[:10]}...{api_key[-4:]}")
        return True

def create_test_frame():
    """Create a simple test frame"""
    print("\n📸 Creating test frame...")
    # Create a blank image with some text
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    frame[:] = (50, 50, 50)  # Gray background
    
    cv2.putText(frame, "Test Security Camera", (150, 240), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    print("✓ Test frame created (640x480)")
    return frame

def test_detector():
    """Test the detector module"""
    print("\n🔍 Testing Threat Detector...")
    
    try:
        from video_processor.detector import analyze_frame_for_threats
        print("✓ Detector module imported successfully")
        
        # Create test frame
        frame = create_test_frame()
        
        # Analyze frame
        print("\n🤖 Analyzing frame with Gemini AI...")
        print("   (This may take a few seconds...)")
        result = analyze_frame_for_threats(frame)
        
        print("\n📊 Analysis Result:")
        print(f"   Threat Detected: {result.get('threat_detected', 'N/A')}")
        print(f"   Threat Level: {result.get('threat_level', 'N/A')}")
        print(f"   Confidence: {result.get('confidence', 0):.2%}")
        print(f"   Description: {result.get('description', 'N/A')}")
        
        if result.get('details'):
            print(f"   Details:")
            for detail in result['details']:
                print(f"      • {detail}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Failed to import detector: {e}")
        return False
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        return False

def test_opencv():
    """Test OpenCV installation"""
    print("\n📷 Testing OpenCV...")
    try:
        import cv2
        print(f"✓ OpenCV version: {cv2.__version__}")
        return True
    except ImportError:
        print("❌ OpenCV not installed")
        print("   Install with: pip install opencv-python")
        return False

def test_gemini():
    """Test Gemini AI library"""
    print("\n🤖 Testing Gemini AI Library...")
    try:
        import google.generativeai as genai
        print("✓ google-generativeai library installed")
        return True
    except ImportError:
        print("❌ google-generativeai not installed")
        print("   Install with: pip install google-generativeai")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("🎯 Watcher Threat Detection System - Test Suite")
    print("=" * 60)
    
    tests = [
        ("API Key", test_api_key),
        ("OpenCV", test_opencv),
        ("Gemini AI", test_gemini),
        ("Detector", test_detector),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Unexpected error in {test_name}: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your threat detection system is ready.")
        print("\nNext steps:")
        print("1. Start the backend: ./start.sh or python main.py")
        print("2. Start the frontend: cd ../frontend && npm run dev")
        print("3. Navigate to Live Camera and click 'Start Camera'")
    else:
        print("\n⚠️  Some tests failed. Please fix the issues above.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
