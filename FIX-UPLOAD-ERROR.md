# 🔧 Fix Upload Error

## The Problem

You're getting "Error: new row violates row-level security policy" when creating albums.

This is because the storage buckets need permission policies so you can upload images.

---

## ✅ Quick Fix (2 minutes)

### Step 1: Go to Supabase SQL Editor

1. Open: https://app.supabase.com
2. Click your project: `travel-portfolio`
3. Left sidebar → Click **"SQL Editor"** icon
4. Click **"+ New query"**

### Step 2: Run the Fix Script

1. Open the file: **`storage-policies-fix.sql`** (in your project folder)
2. Copy ALL the SQL code (Ctrl/Cmd + A, then Ctrl/Cmd + C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl/Cmd + Enter)
5. You should see: **"Success. No rows returned"**

### Step 3: Try Creating Album Again

1. Go back to: http://localhost:5173/admin/albums/create
2. Fill in the form
3. Upload a cover image
4. Click "Create Album"
5. Should work now! ✅

---

## 🤔 What This Fix Does

The SQL script adds "policies" (permission rules) that allow:
- **Everyone** can view/read images (public website visitors)
- **Only you** (authenticated admin) can upload/edit/delete images

This is a security feature in Supabase that we forgot to set up for the storage buckets.

---

## ❓ Still Not Working?

If you still get the error after running the SQL script:

1. Make sure you're logged in to the admin (not logged out)
2. Try logging out and back in
3. Check the SQL script ran successfully (should say "Success")
4. Let me know and I'll help troubleshoot!

---

**This is a one-time fix. After running it once, uploads will work forever!** ✅
