# Database Trigger Setup Instructions

## Problem
User profiles are not being automatically created in the `user_profiles` table when new users sign up.

## Solution
The database trigger needs to be properly configured in Supabase. Follow these steps:

### Step 1: Run the Fix Script in Supabase

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the file `backend/fix_trigger.sql`
4. Copy all the SQL code from that file
5. Paste it into the Supabase SQL Editor
6. Click **Run** to execute the script

This will:
- Drop and recreate the trigger function with proper error handling
- Set up the trigger to fire when new users sign up
- Grant necessary permissions
- Provide verification queries to check if everything is working

### Step 2: Verify the Trigger is Working

After running the fix script, you should see output from the verification queries showing:
- The trigger `on_auth_user_created` exists
- Existing user profiles (if any)
- RLS policies are properly configured

### Step 3: Test User Registration

1. Try creating a new account through the signup form
2. After successful signup, go back to Supabase SQL Editor
3. Run this query to check if the profile was created:

```sql
SELECT * FROM public.user_profiles 
ORDER BY created_at DESC 
LIMIT 5;
```

You should see the new user's profile with their email and full name.

### Step 4: Backfill Existing Users (Optional)

If you have existing users without profiles, uncomment and run this section from `fix_trigger.sql`:

```sql
INSERT INTO public.user_profiles (user_id, email, full_name)
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name'
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
```

## Frontend Changes Made

### 1. Dashboard.jsx
- Added state management for user data
- Fetches current user on component mount
- Displays actual user name and email in the sidebar
- Shows user initials in the avatar
- Handles auth state changes (redirects to login if signed out)
- Added loading state while fetching user

### 2. supabase.js
- Added `ensureUserProfile()` function as a backup to create profiles manually
- Added `getUserProfile()` function to fetch profile data from the database
- These act as a safety net if the trigger fails

### 3. SignUp.jsx
- Now calls `ensureUserProfile()` after successful signup
- This ensures a profile is created even if the trigger doesn't fire
- Provides better error handling

## How It Works Now

1. **User signs up** → Supabase creates user in `auth.users` table
2. **Trigger fires** → `handle_new_user()` function automatically creates profile in `user_profiles` table
3. **Backup check** → Frontend also calls `ensureUserProfile()` to verify profile exists
4. **Dashboard loads** → Fetches user data and displays name/email

## Troubleshooting

### If profiles still aren't being created:

1. **Check RLS policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

2. **Check trigger exists:**
```sql
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';
```

3. **Check permissions:**
```sql
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'user_profiles';
```

4. **Check Supabase logs:**
   - Go to your Supabase dashboard
   - Navigate to **Database** → **Logs**
   - Look for any errors related to the trigger

### Common Issues:

- **Permission denied**: Run the GRANT statements from `fix_trigger.sql`
- **Trigger not firing**: Make sure it's on `auth.users` table, not `public.users`
- **Function not found**: Recreate the function with SECURITY DEFINER
- **RLS blocking inserts**: The policies in the schema allow users to insert their own profiles

## Testing Checklist

- [ ] Run `fix_trigger.sql` in Supabase SQL Editor
- [ ] Verify trigger exists with verification queries
- [ ] Create a new test account
- [ ] Check if profile appears in `user_profiles` table
- [ ] Login and verify Dashboard shows correct name/email
- [ ] Test logout functionality
- [ ] Test with Google/GitHub OAuth (if enabled)

## Additional Notes

- User name and email are now extracted from `user.user_metadata.full_name` and `user.email`
- If no full name is provided, the email prefix (before @) is used as display name
- The avatar shows the first letter of the user's name
- All user data is fetched fresh on Dashboard mount and updates on auth state changes
