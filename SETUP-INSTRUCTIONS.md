# 🎯 Admin CMS Setup - Your Next Steps

## ✅ What I've Completed So Far

1. ✅ Installed Supabase SDK
2. ✅ Created database connection configuration
3. ✅ Built admin login page (`/admin/login`)
4. ✅ Built authentication system
5. ✅ Created admin dashboard placeholder
6. ✅ Added route protection (only logged-in users can access `/admin/*`)

## 📋 What You Need to Do Now (10 minutes)

### Step 1: Create Database Tables in Supabase

I've prepared a SQL script that will create the database tables. You need to run it in Supabase:

**Instructions:**

1. **Go to your Supabase Dashboard**
   - Open: https://app.supabase.com
   - Click on your project: `travel-portfolio`

2. **Open SQL Editor**
   - Look in the left sidebar
   - Click the **"SQL Editor"** icon (looks like `</>`  or database icon)
   - Click **"+ New query"** button

3. **Copy the SQL Script**
   - Open the file: `supabase-setup.sql` (in your project root folder)
   - Copy ALL the SQL code (Ctrl/Cmd + A, then Ctrl/Cmd + C)

4. **Paste and Run**
   - Paste the SQL into the Supabase SQL Editor
   - Click **"Run"** button (bottom right, or press Ctrl/Cmd + Enter)
   - Wait 2-3 seconds

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - This means the tables were created!

6. **Check Tables Were Created**
   - In left sidebar, click **"Table Editor"**
   - You should now see two tables:
     - `albums`
     - `photos`
   - If you see these, SUCCESS! ✅

---

### Step 2: Create Storage Buckets for Images

Now we need to create two "buckets" (folders) to store your photos:

**Instructions:**

1. **Go to Storage**
   - In Supabase dashboard left sidebar
   - Click **"Storage"** icon

2. **Create First Bucket: album-covers**
   - Click **"New bucket"** button
   - Name: `album-covers`
   - Public bucket: **YES** (toggle ON)
   - Click **"Create bucket"**

3. **Create Second Bucket: photos**
   - Click **"New bucket"** button again
   - Name: `photos`
   - Public bucket: **YES** (toggle ON)
   - Click **"Create bucket"**

4. **Verify**
   - You should see both buckets listed:
     - album-covers
     - photos

---

### Step 3: Create Your Admin Account

Now create your login account:

**Instructions:**

1. **Go to Authentication**
   - In Supabase dashboard left sidebar
   - Click **"Authentication"** icon
   - Click **"Users"** tab

2. **Add New User**
   - Click **"Add user"** button (top right)
   - Select **"Create new user"**

3. **Fill in Your Details**
   - **Email:** (your email address - this will be your login)
   - **Password:** (create a strong password - save it!)
   - **Auto Confirm User:** YES (toggle ON)
   - Click **"Create user"**

4. **Save Your Login Info**
   - Write down your email and password somewhere safe
   - You'll use these to login to `/admin/login`

---

## 🎉 Test Your Login!

Once you've completed all 3 steps above:

1. **Open your website** (should still be running at http://localhost:5173)
2. **Go to:** http://localhost:5173/admin/login
3. **Login with:**
   - Email: (the email you just created)
   - Password: (the password you just created)
4. **Click "Login"**

If successful, you'll see the admin dashboard! 🎉

---

## ❓ Troubleshooting

**Problem: "Invalid email or password" error**
- Solution: Make sure you checked "Auto Confirm User" when creating the account
- OR: Check your email for confirmation link and click it

**Problem: SQL script shows errors**
- Solution: Make sure you copied the ENTIRE script
- Try running it again (it's safe to run multiple times)

**Problem: Can't find SQL Editor**
- Solution: Look for icon that looks like `</>` or "SQL" in left sidebar
- Alternative: Type "SQL" in the search bar at top

**Problem: Buckets already exist**
- Solution: That's fine! Just make sure they're set to "public"

---

## 📞 What to Tell Me

Once you've completed these steps, please reply with:

✅ "Tables created successfully"
✅ "Storage buckets created"
✅ "Admin account created"
✅ "I can login at /admin/login"

OR if you have issues:

❌ "Step X failed: [describe what happened]"

Then I'll continue building the album management features!
