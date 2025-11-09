-- ============================================
-- Fix User Profile Creation Trigger
-- Run this in Supabase SQL Editor to fix database update issue
-- ============================================

-- 1. Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Recreate the function with proper error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert into user_profiles table
    INSERT INTO public.user_profiles (user_id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Log for debugging (optional - comment out in production)
    RAISE LOG 'Created user profile for user_id: %', NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't prevent user creation
        RAISE LOG 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 5. Verify the trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
    AND trigger_schema = 'public'
    OR event_object_schema = 'auth';

-- 6. Test query - Check existing user profiles
SELECT 
    up.id,
    up.user_id,
    up.email,
    up.full_name,
    up.created_at,
    au.email as auth_email,
    au.raw_user_meta_data->>'full_name' as meta_full_name
FROM public.user_profiles up
FULL OUTER JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at DESC NULLS LAST
LIMIT 10;

-- 7. Backfill existing users who don't have profiles (optional)
-- Uncomment the following lines if you want to create profiles for existing users
/*
INSERT INTO public.user_profiles (user_id, email, full_name)
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name'
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
*/

-- 8. Verify RLS policies are correct
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
