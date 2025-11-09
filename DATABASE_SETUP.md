# 🔧 Database Setup Instructions

## Problem You're Experiencing:
- ✅ Supabase auth works (users created, emails sent)
- ❌ Custom tables not created (user_profiles, threat_logs)
- ❌ Connection error prevents SQLModel from creating tables

## Solution: Create Tables in Supabase Dashboard

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://app.supabase.com
2. Click on **SQL Editor** in the left sidebar (icon looks like `</>`)

### Step 2: Run the Schema SQL

1. Click **New Query**
2. Copy the entire contents of `backend/schema.sql`
3. Paste it into the SQL editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

You should see success messages for each table/policy/trigger created.

### Step 3: Verify Tables Were Created

1. Go to **Table Editor** in left sidebar
2. You should now see:
   - ✅ `user_profiles` table
   - ✅ `threat_logs` table

### Step 4: Check Existing Users

Since you already created some test accounts, let's check them:

1. Go to **Authentication** → **Users** in Supabase dashboard
2. You'll see your users listed there (in auth.users)

### Step 5: Create Profiles for Existing Users (Optional)

If you have existing users WITHOUT profiles, run this in SQL Editor:

```sql
-- Create profiles for existing users who don't have one
INSERT INTO public.user_profiles (user_id, email, full_name)
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles);
```

### Step 6: Test the Setup

1. **Create a new user** from your frontend
2. Check in Supabase:
   - Go to **Authentication** → **Users** (should see user)
   - Go to **Table Editor** → **user_profiles** (should see profile automatically created)

## How It Works Now:

### Automatic Profile Creation:
When a user signs up, a **database trigger** automatically creates their profile:
```
User signs up → auth.users (Supabase) → Trigger → user_profiles (Your table)
```

### What Each Table Does:

**auth.users** (Supabase built-in):
- Email, password, OAuth data
- Email confirmation status
- Last sign in time
- Managed by Supabase

**user_profiles** (Your custom table):
- Extended user info
- Organization, role, etc.
- You can query/update this

**threat_logs** (Your custom table):
- Store camera detections
- Link to users
- Track threat status

## Troubleshooting:

### "User created but no profile"
- Check if trigger is active: See verification queries in schema.sql
- Manually run the INSERT query above

### "Permission denied"
- Check RLS policies are created
- Make sure you're authenticated when querying

### "Still can't connect from Python"
- That's OK! The database tables are created now
- Python backend uses Supabase client for auth (doesn't need direct DB connection)
- SQLModel was only for creating tables (now done manually)

## Next Steps:

1. ✅ Run the schema.sql in Supabase
2. ✅ Test signup/login from frontend
3. ✅ Check user_profiles table gets populated
4. 🎉 Start building your app features!
