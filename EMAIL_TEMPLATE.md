# EmailJS Template Configuration

## New Simple Email Template

This template matches the report generation format and keeps things clean and professional.

### Template Settings

**Subject Line (Simple - No Emojis):**
```
Alert: Threat Detected - {{description}}
```

**From Name:**
```
Watcher Security System
```

**Reply To:**
```
noreply@watcher.security
```

**To Email:**
```
aramtel@gmail.com
```
(Or your preferred email address)

---

## Email Body Template

Copy this template into your EmailJS dashboard:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f44336;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
        }
        .section {
            margin-bottom: 15px;
            padding: 10px;
            background-color: white;
            border-left: 4px solid #f44336;
        }
        .label {
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
        }
        .value {
            color: #333;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #777;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>🚨 Threat Detection Alert</h2>
        <p>{{camera_name}} - {{timestamp}}</p>
    </div>
    
    <div class="content">
        <div class="section">
            <div class="label">Description:</div>
            <div class="value">{{description}}</div>
        </div>
        
        <div class="section">
            <div class="label">Threat Level:</div>
            <div class="value">{{threat_level}}</div>
        </div>
        
        <div class="section">
            <div class="label">Objects Detected:</div>
            <div class="value">{{objects_detected}}</div>
        </div>
        
        <div class="section">
            <div class="label">People Count:</div>
            <div class="value">{{people_count}}</div>
        </div>
        
        <div class="section">
            <div class="label">Confidence:</div>
            <div class="value">{{confidence}}</div>
        </div>
        
        <div class="section">
            <div class="label">Recommended Action:</div>
            <div class="value">{{recommended_action}}</div>
        </div>
    </div>
    
    <div class="footer">
        <p>This is an automated alert from your Watcher Security System.</p>
        <p>Timestamp: {{timestamp}}</p>
    </div>
</body>
</html>
```

---

## Alternative: Plain Text Template

If you prefer a simpler plain text email:

```
🚨 THREAT DETECTION ALERT 🚨

Camera: {{camera_name}}
Time: {{timestamp}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESCRIPTION
{{description}}

THREAT LEVEL
{{threat_level}}

OBJECTS DETECTED
{{objects_detected}}

PEOPLE COUNT
{{people_count}}

CONFIDENCE
{{confidence}}

RECOMMENDED ACTION
{{recommended_action}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated alert from Watcher Security System.
```

---

## Setup Instructions

1. **Go to EmailJS Dashboard:**
   - Visit: https://dashboard.emailjs.com/
   - Navigate to: Email Templates

2. **Edit Your Template (template_5rdmes5):**
   - Click on your existing template
   - Replace the content with the HTML template above
   - Or create a new template with this content

3. **Configure Subject Line:**
   - In the "Subject" field, enter:
     ```
     Alert: Threat Detected - {{description}}
     ```
   - This will create subjects like:
     - "Alert: Threat Detected - Person gesturing with hand in the shape of a gun"
     - "Alert: Threat Detected - Suspicious activity detected near entrance"

4. **Save Template:**
   - Click "Save" to apply changes
   - Test the template using the "Test" button

5. **Update Template ID (if you created a new template):**
   - Copy the new template ID
   - Update your `.env` file:
     ```
     VITE_EMAILJS_TEMPLATE_ID=your_new_template_id
     ```

---

## Template Variables Reference

These variables are sent from `emailService.js`:

| Variable | Example Value | Description |
|----------|--------------|-------------|
| `description` | "Person gesturing with hand in the shape of a gun" | Display description (shown in LiveCamera) |
| `threat_level` | "WARNING" | Uppercase threat level |
| `objects_detected` | "person, hand" | Comma-separated list of objects |
| `people_count` | "1" | Number of people detected |
| `confidence` | "85%" | Detection confidence percentage |
| `recommended_action` | "Monitor individual and assess for signs of distress" | Action to take |
| `timestamp` | "11/9/2025, 3:45:23 PM" | Date and time of detection |
| `camera_name` | "Live Camera" | Camera identifier |

---

## What Changed

### Before (Old Template)
- Used emojis in subject: "🚨 THREAT ALERT"
- Used `threat_emoji` variable
- Used `details` array with bullet points
- More complex formatting

### After (New Template)
- Simple subject: "Alert: Threat Detected - {description}"
- No emojis in subject line (optional in body)
- Uses same data as report generation
- Clean, professional format
- Matches the display format exactly

---

## Testing

After updating the template, test it:

1. **Start the camera in LiveCamera page**
2. **Wait for a detection** (any threat level will trigger demo email)
3. **Check browser console** for these logs:
   ```
   📧 Detection data received for email: {...}
   📧 Email template parameters: {...}
   ✅ Email sent successfully: {...}
   ```
4. **Check your email** (aramtel@gmail.com) for the alert
5. **Verify format** matches the template above

---

## Example Email

**Subject:** Alert: Threat Detected - Person gesturing with hand in the shape of a gun

**Body:**
```
🚨 Threat Detection Alert
Live Camera - 11/9/2025, 3:45:23 PM

Description:
Person gesturing with hand in the shape of a gun

Threat Level:
WARNING

Objects Detected:
person, hand

People Count:
1

Confidence:
85%

Recommended Action:
Monitor individual and assess for signs of distress or potential self-harm. Consider involving mental health professionals.
```

This format matches exactly what you see in the LiveCamera display and what's saved in reports!
