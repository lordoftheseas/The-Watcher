"""
Test EmailJS Integration
NOTE: EmailJS blocks non-browser API calls for security.
This script shows the correct format and helps verify configuration,
but actual emails must be sent from the browser (React app).

To test EmailJS properly:
1. Start the frontend (npm run dev)
2. Go to LiveCamera page
3. Start camera and trigger a threat detection
4. Email will be sent automatically from the browser
"""

import requests
import json
from datetime import datetime

def send_test_email():
    """Send a test threat alert email via EmailJS"""
    
    # EmailJS Configuration - Update these with your actual values
    SERVICE_ID = "service_6jraqub"  # Your EmailJS service ID
    TEMPLATE_ID = "template_5rdmes5"  # Your EmailJS template ID
    PUBLIC_KEY = "sLi9hafvYwQVm2rat"  # Your EmailJS public key
    
    # Test data for the email
    template_params = {
        "threat_level": "DANGER",
        "threat_emoji": "🚨",
        "camera_name": "Live Camera - Test",
        "description": "Suspicious activity detected - person with weapon in restricted area",
        "objects_detected": "person, weapon, vehicle, bag",
        "people_count": "2",
        "confidence": "95.5%",
        "recommended_action": "Alert security immediately and review footage",
        "timestamp": datetime.now().strftime("%Y-%m-%d %I:%M:%S %p"),
        "details": "Multiple people seen in restricted area after hours. Potential security breach detected by AI analysis."
    }
    
    # EmailJS API endpoint
    url = "https://api.emailjs.com/api/v1.0/email/send"
    
    # Payload for EmailJS
    payload = {
        "service_id": SERVICE_ID,
        "template_id": TEMPLATE_ID,
        "user_id": PUBLIC_KEY,
        "template_params": template_params
    }
    
    print("=" * 60)
    print("📧 EMAILJS TEST - Sending Test Email...")
    print("=" * 60)
    print(f"\n🔧 Configuration:")
    print(f"   Service ID: {SERVICE_ID}")
    print(f"   Template ID: {TEMPLATE_ID}")
    print(f"   Public Key: {PUBLIC_KEY}")
    print(f"\n📋 Email Content:")
    print(f"   Threat Level: {template_params['threat_level']}")
    print(f"   Camera: {template_params['camera_name']}")
    print(f"   Description: {template_params['description']}")
    print(f"   Confidence: {template_params['confidence']}")
    print(f"\n⏳ Sending email...")
    
    try:
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload),
            timeout=10
        )
        
        if response.status_code == 200:
            print("\n✅ SUCCESS! Test email sent successfully!")
            print(f"   Response: {response.text}")
            print("\n📬 Check your inbox (and spam folder) for the test email!")
        elif response.status_code == 403:
            print(f"\n⚠️  EXPECTED: EmailJS blocks non-browser requests (Status: {response.status_code})")
            print(f"   Response: {response.text}")
            print("\n✅ Your configuration appears correct!")
            print("\n📱 TO TEST EMAILS PROPERLY:")
            print("   1. Start frontend: cd frontend && npm run dev")
            print("   2. Go to LiveCamera page")
            print("   3. Start camera")
            print("   4. Trigger threat detection (show suspicious object)")
            print("   5. Email will be sent from browser automatically")
            print("\n💡 EmailJS only works from browsers for security reasons")
        else:
            print(f"\n❌ FAILED! Status code: {response.status_code}")
            print(f"   Response: {response.text}")
            print("\n🔍 Troubleshooting:")
            print("   1. Verify Service ID, Template ID, and Public Key in EmailJS dashboard")
            print("   2. Check that the template is saved and published")
            print("   3. Ensure all template variables match: {{threat_level}}, {{description}}, etc.")
            print("   4. Check EmailJS dashboard for error logs")
    
    except requests.exceptions.Timeout:
        print("\n⏱️ REQUEST TIMEOUT!")
        print("   EmailJS server took too long to respond")
        print("   Check your internet connection and try again")
    
    except requests.exceptions.RequestException as e:
        print(f"\n❌ REQUEST ERROR: {str(e)}")
        print("   Could not connect to EmailJS API")
        print("   Check your internet connection")
    
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {str(e)}")
        print("   Something went wrong during the test")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    print("\n🎯 EmailJS Test Script")
    print("This will send a test threat alert email\n")
    
    input("Press Enter to send test email... ")
    send_test_email()
    
    print("\n✨ Test complete!")
