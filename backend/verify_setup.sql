-- Quick Database Verification Script
-- Run this in Supabase SQL Editor to check if everything is set up correctly
-- ============================================

-- 1. Check if user_profiles table exists
SELECT 'user_profiles table exists' as check_name, 
       EXISTS (
           SELECT FROM information_schema.tables 
           WHERE table_schema = 'public' 
           AND table_name = 'user_profiles'
       ) as result;

-- 2. Check if trigger exists
SELECT 'Trigger exists' as check_name,
       COUNT(*) > 0 as result
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 3. Check if function exists
SELECT 'Function exists' as check_name,
       EXISTS (
           SELECT FROM pg_proc 
           WHERE proname = 'handle_new_user'
       ) as result;

-- 4. Check RLS policies count
SELECT 'RLS policies exist' as check_name,
       COUNT(*) >= 3 as result
FROM pg_policies
WHERE tablename = 'user_profiles';

-- 5. View all users and their profiles
SELECT 
    au.id as user_id,
    au.email as auth_email,
    au.created_at as user_created,
    au.raw_user_meta_data->>'full_name' as meta_name,
    up.id as profile_id,
    up.email as profile_email,
    up.full_name as profile_name,
    up.created_at as profile_created,
    CASE 
        WHEN up.id IS NULL THEN '❌ NO PROFILE'
        ELSE '✅ HAS PROFILE'
    END as status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;

-- 6. Count users without profiles
SELECT 
    'Users without profiles' as check_name,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.id IS NULL;

-- 7. Show trigger details
SELECT 
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 8. Show RLS policies
SELECT 
    policyname,
    cmd as command,
    permissive,
    roles
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- ============================================
-- EXPECTED RESULTS:
-- ✅ All checks should return TRUE
-- ✅ Trigger should show: AFTER INSERT on auth.users
-- ✅ At least 3 RLS policies should exist
-- ✅ All users should have profiles (status = '✅ HAS PROFILE')
-- ✅ Users without profiles count should be 0
-- ============================================
