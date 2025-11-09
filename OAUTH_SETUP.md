# OAuth Setup Guide for Watcher

## Error: "Unsupported provider: provider is not enabled"

This error occurs because OAuth providers (Google, GitHub) are not enabled in your Supabase project.

---

## 🔧 How to Enable Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if prompted:
   - User Type: **External**
   - App name: **Watcher**
   - User support email: Your email
   - Developer contact: Your email
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Watcher App**
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     https://your-supabase-project.supabase.co
     ```
   - Authorized redirect URIs:
     ```
     https://your-supabase-project.supabase.co/auth/v1/callback
     ```
7. Copy the **Client ID** and **Client Secret**

### Step 2: Enable Google OAuth in Supabase

1. Open your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle it **ON**
6. Enter your Google OAuth credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
7. Click **Save**

---

## 🔧 How to Enable GitHub OAuth

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the details:
   - Application name: **Watcher**
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL:
     ```
     https://your-supabase-project.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it

### Step 2: Enable GitHub OAuth in Supabase

1. Open your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **GitHub** in the list
5. Toggle it **ON**
6. Enter your GitHub OAuth credentials:
   - **Client ID**: Paste from GitHub
   - **Client Secret**: Paste from GitHub
7. Click **Save**

---

## 🎯 Quick Fix: Disable OAuth Buttons (Temporary)

If you don't want to set up OAuth right now, I'll hide the OAuth buttons in the UI.

### Option 1: Comment Out OAuth Buttons

The OAuth buttons are currently visible in:
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/SignUp.jsx`

I can temporarily hide them for you.

### Option 2: Use Email/Password Only

Your email/password authentication is already working! You can:
1. Sign up with email and password
2. Login with email and password
3. Enable OAuth later when you're ready

---

## 🔍 Verify OAuth is Working

After enabling OAuth providers:

1. Go to your app's login page
2. Click the **Google** or **GitHub** button
3. Complete the OAuth flow
4. Should redirect back to your app and create a user profile automatically

---

## 📝 Important Notes

### Redirect URLs
- Local development: `http://localhost:5173/auth/callback`
- Production: Update with your actual domain

### Supabase Project URL
Replace `your-supabase-project` with your actual Supabase project reference:
- Find it in Supabase Dashboard → Settings → API
- Format: `xxxxxxxxxxxxx.supabase.co`

### AuthCallback Component
Your `AuthCallback.jsx` component already handles OAuth callbacks correctly.

---

## ❓ Common Issues

### Issue: "Invalid redirect URI"
**Solution**: Make sure the redirect URI in Google/GitHub exactly matches the one in Supabase.

### Issue: "OAuth provider not enabled"
**Solution**: Toggle the provider ON in Supabase Authentication settings.

### Issue: "Invalid client ID or secret"
**Solution**: Double-check you copied the correct credentials from Google Cloud Console or GitHub.

### Issue: "Unauthorized client"
**Solution**: In Google Cloud Console, make sure your OAuth consent screen is published (at least for testing).

---

## 🚀 Recommended Approach

**For Development:**
1. Use email/password authentication (already working)
2. Set up OAuth later when deploying to production

**For Production:**
1. Enable Google OAuth (most users prefer it)
2. Optionally enable GitHub OAuth
3. Update redirect URLs with your production domain

---

Would you like me to temporarily hide the OAuth buttons until you set them up?
