# EmailJS Email Delivery - How It Works

## 📧 Where Do Emails Go?

### The Recipient Email Configuration

**Yes, emails are ALWAYS sent to YOUR personal email (aramtel@gmail.com)** because of how EmailJS is configured.

### How EmailJS Works

```
Your App → EmailJS Service → Your Email Service (Gmail) → aramtel@gmail.com
```

### Where is the recipient configured?

The recipient email address is configured in **TWO places**:

1. **EmailJS Dashboard - Email Template Settings**
2. **EmailJS Dashboard - Email Service Settings**

---

## 🔧 How to Configure Recipient Email

### Method 1: Template Configuration (Recommended)

1. Go to https://dashboard.emailjs.com/
2. Click **"Email Templates"** in sidebar
3. Select your template
4. Look for **"Settings"** or **"To Email"** field at the top
5. This field shows: `aramtel@gmail.com`
6. To change it:
   - Update the email address
   - Click **"Save"**

### Method 2: Dynamic Recipients (Advanced)

You can make the recipient dynamic by using a template variable:

1. In EmailJS template settings, set "To Email" to: `{{to_email}}`
2. In your code, pass the recipient email:

```javascript
const templateParams = {
  to_email: 'security@company.com', // Dynamic recipient
  threat_level: 'DANGER',
  description: 'Threat detected',
  // ... other params
}
```

### Method 3: Multiple Recipients

To send to multiple emails, use comma separation:

```
aramtel@gmail.com, security@company.com, admin@company.com
```

---

## 📊 Current Email Flow

### What Happens Now:

1. **Detection occurs** in LiveCamera
2. **Analysis data** from Gemini:
   ```json
   {
     "threat_level": "warning",
     "description": "Suspicious activity detected",
     "confidence": 0.87,
     "objects_detected": ["person", "weapon"],
     "people_count": 2,
     "recommended_action": "Alert security",
     "details": ["Detail 1", "Detail 2"]
   }
   ```

3. **EmailJS formats parameters**:
   ```javascript
   {
     threat_level: "WARNING",
     threat_emoji: "⚠️",
     description: "Suspicious activity detected",
     confidence: "87.0%",
     objects_detected: "person, weapon",
     people_count: "2",
     recommended_action: "Alert security",
     details: "Detail 1\n• Detail 2",
     timestamp: "11/9/2025, 10:30:45 PM",
     camera_name: "Live Camera"
   }
   ```

4. **EmailJS sends to**: `aramtel@gmail.com` (configured in template)

5. **Email arrives** with formatted HTML content

---

## ✅ Email Format Validation

### The code now validates:

1. **Threat data is valid object**: Checks if data exists and is an object
2. **Arrays are properly joined**: Converts arrays to comma-separated strings
3. **Handles both array and string formats**: Works with either format
4. **Logs all data**: Console shows exactly what's being sent

### Validation Added:

```javascript
// Validates threat data exists
if (!threatData || typeof threatData !== 'object') {
  return { success: false, error: 'Invalid threat data format' }
}

// Handles array details
if (Array.isArray(threatData.details)) {
  detailsText = threatData.details.join('\n• ')
}

// Handles array objects
if (Array.isArray(threatData.objects_detected)) {
  objectsText = threatData.objects_detected.join(', ')
}
```

### Console Logging:

Now you'll see two logs when email is sent:

```javascript
📧 Raw threat data received: { threat_level: 'warning', ... }
📧 Formatted email parameters: { threat_level: 'WARNING', ... }
```

This helps debug any parsing issues!

---

## 🐛 Checking If Parsing Works

### Test 1: Check Browser Console

1. Open LiveCamera page
2. Open DevTools (F12) → Console tab
3. Start camera
4. Wait for detection
5. Look for these logs:

```
📧 Raw threat data received: {...}
📧 Formatted email parameters: {...}
✅ Email sent successfully: {...}
```

### Test 2: Verify Email Content

When you receive the email, check:

- ✅ **Threat Level**: Shows "DANGER" or "WARNING"
- ✅ **Emoji**: Shows 🚨 or ⚠️
- ✅ **Description**: Readable text
- ✅ **Confidence**: Shows percentage (e.g., "87.0%")
- ✅ **Objects**: Comma-separated list
- ✅ **People Count**: Number
- ✅ **Action**: Readable recommendation
- ✅ **Details**: Bullet-point list
- ✅ **Timestamp**: Date and time

### Test 3: Check for Errors

If parsing fails, you'll see:

```
❌ Invalid threat data: undefined
```

Or:

```
❌ Failed to send email: [error message]
```

---

## 📝 Email Template Format

### Your EmailJS Template Should Have:

```html
Subject: 🚨 {{threat_emoji}} Threat Alert: {{threat_level}}

Body:
🎥 Watcher Security Alert

Threat Level: {{threat_level}}
Camera: {{camera_name}}
Time: {{timestamp}}

📝 Description:
{{description}}

👁️ Objects Detected:
{{objects_detected}}

👥 People Count: {{people_count}}

🎯 Confidence: {{confidence}}

⚡ Recommended Action:
{{recommended_action}}

📋 Additional Details:
• {{details}}
```

---

## 🔄 Data Flow Example

### High-Threat Detection:

```
1. GEMINI ANALYSIS:
{
  "threat_level": "danger",
  "description": "Person with weapon detected",
  "confidence": 0.95,
  "objects_detected": ["person", "weapon", "vehicle"],
  "people_count": 2,
  "recommended_action": "Alert security immediately",
  "details": [
    "Multiple armed individuals observed",
    "Suspicious vehicle in parking area",
    "Potential robbery in progress"
  ]
}

2. EMAILJS FORMATTING:
{
  threat_level: "DANGER",
  threat_emoji: "🚨",
  description: "Person with weapon detected",
  confidence: "95.0%",
  objects_detected: "person, weapon, vehicle",
  people_count: "2",
  recommended_action: "Alert security immediately",
  details: "Multiple armed individuals observed\n• Suspicious vehicle in parking area\n• Potential robbery in progress",
  timestamp: "11/9/2025, 10:30:45 PM",
  camera_name: "Live Camera"
}

3. EMAIL SENT TO:
aramtel@gmail.com ← Configured in EmailJS template

4. EMAIL CONTENT:
Subject: 🚨 🚨 Threat Alert: DANGER

Body shows formatted HTML with all details
```

---

## 🎯 Quick Answers

### Q: Why does it always go to aramtel@gmail.com?
**A**: Because that's configured in your EmailJS template settings.

### Q: Can I send to a different email?
**A**: Yes, update the "To Email" field in your EmailJS template.

### Q: Can I send to multiple emails?
**A**: Yes, use comma-separated emails in template settings.

### Q: Is the JSON parsing correctly?
**A**: Yes, the updated code validates and formats all data properly.

### Q: How do I test parsing?
**A**: Check browser console for the two log messages showing raw and formatted data.

### Q: What if objects_detected is a string, not array?
**A**: The code now handles both formats automatically.

---

## 🔍 Debugging Checklist

When an email is sent, verify in console:

- [ ] See "📧 Raw threat data received" log
- [ ] See "📧 Formatted email parameters" log
- [ ] All fields have values (not undefined)
- [ ] Arrays are converted to strings
- [ ] Confidence is formatted as percentage
- [ ] Threat level is uppercase
- [ ] Emoji matches threat level
- [ ] See "✅ Email sent successfully" log
- [ ] Email arrives in inbox (check spam)
- [ ] Email content is properly formatted

---

## 💡 To Change Recipient Email

### Quick Steps:

1. Go to https://dashboard.emailjs.com/
2. Click **Email Templates**
3. Open your template (template_5rdmes5)
4. Find **"Settings"** section at top
5. Change **"To Email"** from `aramtel@gmail.com` to desired email
6. Click **"Save"**
7. Test by triggering a detection

No code changes needed - EmailJS handles it!

---

**Summary**: Emails go to aramtel@gmail.com because that's configured in EmailJS template. The JSON parsing is now validated and properly formatted. Check browser console logs to verify data flow.
