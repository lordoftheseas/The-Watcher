-- ============================================
-- Watcher App - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    organization TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- 2. Create threat_logs table
CREATE TABLE IF NOT EXISTS public.threat_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    camera_id TEXT NOT NULL,
    threat_type TEXT NOT NULL,
    confidence_score FLOAT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    location TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'false_positive'))
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_threat_logs_user_id ON public.threat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_threat_logs_camera_id ON public.threat_logs(camera_id);
CREATE INDEX IF NOT EXISTS idx_threat_logs_timestamp ON public.threat_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_threat_logs_status ON public.threat_logs(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for user_profiles

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. Create RLS Policies for threat_logs

-- Allow users to view their own threat logs
CREATE POLICY "Users can view own threat logs"
    ON public.threat_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own threat logs
CREATE POLICY "Users can insert own threat logs"
    ON public.threat_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own threat logs
CREATE POLICY "Users can update own threat logs"
    ON public.threat_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 6. Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to run the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to auto-update updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Verification Queries
-- ============================================

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'threat_logs');

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'threat_logs');

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table IN ('user_profiles', 'users');
