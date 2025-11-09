# Watcher - Supabase Setup Guide

## 📋 Prerequisites
- Supabase account (sign up at https://supabase.com)
- Google Cloud Console account (for Google OAuth)

## 🚀 Setup Instructions

### 1. Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: Watcher
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to you
4. Wait for the project to be created (~2 minutes)

### 2. Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

### 3. Configure Backend Environment

Update `/backend/.env` with your Supabase credentials:

```env
# Database Configuration
DATABASE_PASSWORD=your_database_password_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:3000
```

### 4. Configure Frontend Environment

Update `/frontend/.env` with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here

# API Configuration
VITE_API_URL=http://localhost:8000
```

### 5. Enable Email Authentication in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Configure email templates if needed (**Authentication** → **Email Templates**)

### 6. Set up Google OAuth

#### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

4. Create OAuth credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Add authorized JavaScript origins:
     ```
     http://localhost:3000
     https://your-project.supabase.co
     ```
   - Add authorized redirect URIs:
     ```
     https://your-project.supabase.co/auth/v1/callback
     ```
   - Click **Create**
   - **Copy** the **Client ID** and **Client Secret**

#### B. Configure Google OAuth in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Google provider** to ON
4. Enter:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
5. Copy the **Callback URL** shown (you already added this to Google Console)
6. Click **Save**

### 7. Set up GitHub OAuth (Optional)

#### A. Create GitHub OAuth App

1. Go to GitHub Settings → **Developer settings** → **OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Watcher
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `https://your-project.supabase.co/auth/v1/callback`
4. Click **Register application**
5. **Copy** the **Client ID**
6. Click **Generate a new client secret** and **copy** it

#### B. Configure GitHub OAuth in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **GitHub** and click to expand
3. Toggle **Enable GitHub provider** to ON
4. Enter:
   - **Client ID**: (from GitHub)
   - **Client Secret**: (from GitHub)
5. Click **Save**

### 8. Create Database Tables

The backend will automatically create these tables when you start the server:

- **user_profiles** - Extended user information
- **threat_logs** - Threat detection logs

If you need to manually create them or customize:

1. Go to **Database** → **SQL Editor** in Supabase
2. Run this SQL:

```sql
-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_logs ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Threat Logs RLS Policies
CREATE POLICY "Users can view own threat logs"
  ON threat_logs FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own threat logs"
  ON threat_logs FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
```

### 9. Start the Application

#### Backend:
```bash
cd backend
source .venv/bin/activate
uvicorn database:app --reload
```

#### Frontend:
```bash
cd frontend
npm run dev
```

## 🎯 Testing the Setup

1. **Email/Password Signup**:
   - Go to `http://localhost:3000/signup`
   - Fill in the form
   - Check your email for confirmation (if email confirmation is enabled)

2. **Email/Password Login**:
   - Go to `http://localhost:3000/login`
   - Enter credentials

3. **Google OAuth**:
   - Click "Continue with Google" button
   - You'll be redirected to Google login
   - After authentication, you'll be redirected back to the app

4. **GitHub OAuth**:
   - Click "Continue with GitHub" button
   - Authorize the app
   - You'll be redirected back after authentication

## 🔒 Security Best Practices

1. **Never commit** `.env` files to version control
2. **Keep service_role key secret** - never expose it in frontend code
3. **Enable Row Level Security (RLS)** on all tables in production
4. **Use HTTPS** in production
5. **Enable email confirmation** for production
6. **Set up proper CORS** policies in production

## 📚 API Endpoints

Once running, API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Available Endpoints:
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout current user
- `GET /auth/me` - Get current user info
- `POST /auth/refresh` - Refresh access token
- `GET /auth/google` - Get Google OAuth URL
- `GET /auth/github` - Get GitHub OAuth URL

## 🐛 Troubleshooting

### "Invalid credentials" error
- Check that SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Verify user exists in Supabase Authentication dashboard

### Google OAuth not working
- Verify redirect URIs match exactly in Google Console
- Check that Google+ API is enabled
- Ensure Client ID and Secret are correct in Supabase

### CORS errors
- Verify FRONTEND_URL in backend `.env` matches your frontend URL
- Check CORS middleware configuration in `database.py`

### Database connection issues
- Verify DATABASE_PASSWORD is correct
- Check connection string format
- Ensure Supabase project is running

## 📞 Support

For issues:
1. Check Supabase logs: **Logs Explorer** in dashboard
2. Check backend logs in terminal
3. Check browser console for frontend errors

## 🎉 You're Done!

Your Watcher app now has:
- ✅ Email/Password authentication
- ✅ Google OAuth sign-in
- ✅ GitHub OAuth sign-in (optional)
- ✅ Protected API endpoints
- ✅ Database tables for users and threats
- ✅ Row Level Security policies
