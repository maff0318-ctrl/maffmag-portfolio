# Admin Dashboard - Quick Summary

## What You're Getting

A password-protected admin panel where you can:
- ✅ Create, edit, and delete travel albums
- ✅ Upload photos with drag-and-drop (multiple at once)
- ✅ Add bilingual captions (English + 繁體中文)
- ✅ Reorder albums and photos easily
- ✅ See changes on your website immediately

## How It Works

```
YOU → Login at /admin → Manage Content → Public Website Updates Instantly
```

**Technology:** Supabase (cloud database + file storage) + Your existing Vue 3 website

## Login Information

- **URL:** `https://your-website.com/admin/login`
- **Email:** (your email)
- **Password:** (your password)

## Main Features

### 1. Create New Album
Click "➕ Create Album" → Fill form:
- Album title (English + Chinese)
- Location (e.g., "Kyoto")
- Continent (dropdown: Asia, Europe, etc.)
- Year (e.g., 2023)
- Upload cover photo
- Click "Create"

### 2. Upload Photos to Album
Go to album → Click "📸 Upload Photos":
- Drag multiple photos from your computer
- OR click to browse and select files
- Wait for upload to complete
- Done! Photos appear in album

### 3. Add Photo Captions
Click ✏️ on any photo → Fill in:
- Caption (English): "Temple at sunset"
- Caption (繁體中文): "夕陽下的寺廟"
- Description (optional longer text)
- Click "Save"

### 4. Reorder Items
- Use ⬆️ and ⬇️ buttons to move albums/photos
- Changes show on website immediately
- Album order = homepage order
- Photo order = story order in album

### 5. Delete Items
- Click 🗑️ on any album or photo
- Confirm deletion (type album name for albums)
- **WARNING:** Cannot be undone!

## Cost

**Option 1 (Free):**
- Supabase Free Tier: $0/month
- Good for: 1GB photos (~1000-2000 photos)
- Limitation: Pauses after 7 days no use (auto-resumes)

**Option 2 (Recommended):**
- Supabase Pro: $25/month
- Good for: 100GB photos (~100,000 photos)
- Benefits: No pausing, daily backups, faster

## Security

✅ Only you can login (password protected)  
✅ Public visitors can only view, never edit  
✅ Database enforces read-only for everyone except you  
✅ Automatic logout after 7 days inactivity  

## Quick Tips

1. **Always upload high quality photos** (at least 1920px wide)
2. **Add captions right after upload** so you don't forget the story
3. **Double-check before deleting** - deletions are permanent!
4. **Use "Save & Next"** when captioning to speed up workflow
5. **Logout when done** if using shared computer

## Getting Help

**Something not working?**
1. Take screenshot of error
2. Note what you were trying to do
3. Contact your developer with details

**Common Fixes:**
- Can't login → Use "Forgot password" link
- Upload stuck → Check internet, refresh, try again
- Changes not showing → Wait 5 sec, hard refresh (Ctrl+Shift+R)

## What's Next

After your developer builds this system:
1. You'll get login credentials
2. They'll show you a quick demo (10 min)
3. You can start managing content yourself
4. No more asking developer to update photos!

**Freedom to manage your own website! 🎉**
