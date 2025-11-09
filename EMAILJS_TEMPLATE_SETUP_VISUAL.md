# 📧 EmailJS Email Template Setup - Step-by-Step Visual Guide

## Overview
This guide shows you exactly how to create the email template in the EmailJS website with screenshots descriptions and copy-paste ready code.

---

## Step 1: Access Email Templates

1. Go to [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)
2. Log in to your EmailJS account
3. In the left sidebar, click **"Email Templates"**
4. Click the **"Create New Template"** button (blue button in top right)

---

## Step 2: Template Settings

You'll see a screen with three main sections:

### A. Template Settings (Top Section)

**Template Name:** 
```
Watcher Threat Alert
```
*(This is just for your reference, users won't see it)*

**Send To Email:**
```
your-email@example.com
```
*(Replace with YOUR actual email where you want to receive alerts)*

**From Name:**
```
Watcher Security System
```

**From Email:**
```
noreply@watcherapp.com
```
*(Can be any email - this is just the display name)*

**Reply To:**
```
your-email@example.com
```
*(Optional - where replies go if someone replies to the alert)*

---

## Step 3: Subject Line

In the **"Subject"** field, paste this:

```
🚨 {{threat_emoji}} Threat Alert: {{threat_level}} - {{camera_name}}
```

**What this does:**
- Shows emoji based on threat level (⚠️ or 🚨)
- Displays threat level (WARNING or DANGER)
- Shows which camera detected it

**Example output:**
```
🚨 🚨 Threat Alert: DANGER - Live Camera
```

---

## Step 4: Email Content

You'll see two tabs: **"Content"** and **"Preview"**

### Click the **"Content"** tab

You'll see a text editor with default content. **DELETE ALL** the existing content.

Then paste this COMPLETE HTML template:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
        }
        .threat-badge {
            display: inline-block;
            font-size: 32px;
            font-weight: bold;
            margin: 15px 0;
            padding: 15px 30px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            backdrop-filter: blur(10px);
        }
        .content {
            padding: 30px;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .info-label {
            font-weight: 600;
            color: #667eea;
            font-size: 14px;
            margin-bottom: 5px;
            display: block;
        }
        .info-value {
            color: #333;
            font-size: 16px;
            word-wrap: break-word;
        }
        .alert-box {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .alert-box strong {
            color: #856404;
            display: block;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .details-list {
            color: #856404;
            line-height: 1.8;
            margin: 10px 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            color: #6c757d;
            font-size: 13px;
        }
        .timestamp-box {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            .header {
                padding: 30px 20px;
            }
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🎥 Watcher Security Alert</h1>
            <div class="threat-badge">
                {{threat_emoji}} {{threat_level}}
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <!-- Camera Info -->
            <div class="info-box">
                <span class="info-label">📹 CAMERA</span>
                <div class="info-value">{{camera_name}}</div>
            </div>
            
            <!-- Description -->
            <div class="info-box">
                <span class="info-label">📝 DESCRIPTION</span>
                <div class="info-value">{{description}}</div>
            </div>
            
            <!-- Objects Detected -->
            <div class="info-box">
                <span class="info-label">👁️ OBJECTS DETECTED</span>
                <div class="info-value">{{objects_detected}}</div>
            </div>
            
            <!-- People Count -->
            <div class="info-box">
                <span class="info-label">👥 PEOPLE COUNT</span>
                <div class="info-value">{{people_count}}</div>
            </div>
            
            <!-- Confidence -->
            <div class="info-box">
                <span class="info-label">🎯 CONFIDENCE SCORE</span>
                <div class="info-value">{{confidence}}</div>
            </div>
            
            <!-- Recommended Action -->
            <div class="info-box">
                <span class="info-label">⚡ RECOMMENDED ACTION</span>
                <div class="info-value">{{recommended_action}}</div>
            </div>
            
            <!-- Timestamp -->
            <div class="timestamp-box">
                <span class="info-label">🕐 DETECTED AT</span>
                <div class="info-value">{{timestamp}}</div>
            </div>
            
            <!-- Additional Details -->
            <div class="alert-box">
                <strong>📋 ADDITIONAL DETAILS:</strong>
                <div class="details-list">• {{details}}</div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>🔔 This is an automated security alert from your Watcher CCTV system.</strong></p>
            <p>Please review the footage and take appropriate action if needed.</p>
            <p style="margin-top: 15px; color: #999;">
                Do not reply to this email. This is an automated notification.
            </p>
        </div>
    </div>
</body>
</html>
```

---

## Step 5: Test the Template

After pasting the HTML:

1. Click the **"Preview"** tab to see how it looks
2. Scroll through to check the design
3. Click **"Check Template"** button (if available)
4. Click **"Save"** button (top right)

---

## Step 6: Test Email Send

1. After saving, you'll see a **"Test It"** section
2. Fill in test values for each variable:

```
threat_level: DANGER
threat_emoji: 🚨
description: Suspicious activity detected - person with weapon
confidence: 95.5%
objects_detected: person, weapon, vehicle
people_count: 2
recommended_action: Alert security immediately
details: Multiple people seen in restricted area
timestamp: 2025-11-09 10:30:45 PM
camera_name: Live Camera
```

3. Click **"Send Test Email"** button
4. Check your inbox (and spam folder) for the test email
5. Verify it looks good!

---

## Step 7: Copy Template ID

After saving successfully:

1. Look at the top of the template page
2. You'll see **Template ID**: `template_xxxxxxx`
3. **COPY this Template ID**
4. Add it to your `frontend/.env` file:

```env
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
```

---

## Template Variables Explained

The template uses these variables (automatically filled by the code):

| Variable | What It Shows | Example |
|----------|---------------|---------|
| `{{threat_level}}` | Threat severity | DANGER, WARNING |
| `{{threat_emoji}}` | Visual indicator | 🚨, ⚠️ |
| `{{camera_name}}` | Camera identifier | Live Camera |
| `{{description}}` | AI analysis | "Suspicious activity detected" |
| `{{objects_detected}}` | Objects in scene | "person, weapon, vehicle" |
| `{{people_count}}` | Number of people | 2 |
| `{{confidence}}` | Accuracy score | 95.5% |
| `{{recommended_action}}` | What to do | "Alert security immediately" |
| `{{timestamp}}` | When detected | 2025-11-09 10:30:45 PM |
| `{{details}}` | Extra info | Additional analysis details |

---

## Troubleshooting Template

### Template not saving?
- Make sure you filled in "Send To Email"
- Subject line is required
- Check for any red error messages

### Variables not showing in test?
- Variables must be exactly: `{{variable_name}}`
- No spaces: `{{ name }}` ❌ `{{name}}` ✅
- Case sensitive: `{{Threat_Level}}` ❌ `{{threat_level}}` ✅

### Email looks broken?
- Paste the ENTIRE HTML template (all lines)
- Don't modify the HTML structure
- Make sure no characters were cut off

### Test email not arriving?
- Check spam folder
- Verify "Send To Email" is correct
- Try sending test again
- Check EmailJS dashboard for errors

---

## Quick Checklist

Before leaving EmailJS:

- ✅ Template created and saved
- ✅ Test email sent and received
- ✅ Template ID copied
- ✅ All variables tested and working
- ✅ Email looks professional
- ✅ Template ID added to `.env` file

---

## What the Final Email Looks Like

### Subject Line:
```
🚨 🚨 Threat Alert: DANGER - Live Camera
```

### Email Body:
```
┌─────────────────────────────────────┐
│   🎥 Watcher Security Alert         │
│                                     │
│        🚨 DANGER                    │
└─────────────────────────────────────┘

📹 CAMERA
Live Camera

📝 DESCRIPTION  
Suspicious activity detected - person with weapon

👁️ OBJECTS DETECTED
person, weapon, vehicle

👥 PEOPLE COUNT
2

🎯 CONFIDENCE SCORE
95.5%

⚡ RECOMMENDED ACTION
Alert security immediately

🕐 DETECTED AT
2025-11-09 10:30:45 PM

📋 ADDITIONAL DETAILS:
• Multiple people seen in restricted area

──────────────────────────────────────
🔔 This is an automated security alert
Please review the footage and take action
──────────────────────────────────────
```

---

## Next Steps

After template setup is complete:

1. ✅ Template created
2. ✅ Template ID copied
3. → Add to `.env` file
4. → Restart frontend server
5. → Test with live camera
6. → Check email inbox!

---

**Need Help?**
- Full guide: `EMAILJS_SETUP.md`
- Quick setup: `EMAILJS_QUICK_SETUP.md`
- EmailJS Docs: https://www.emailjs.com/docs/
