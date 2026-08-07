# Debug Footprints Map - Step by Step

## 🔍 Let's Debug Together

### Step 1: Open Browser Console
1. Press **F12** (or **Cmd+Option+I** on Mac)
2. Go to **Console** tab
3. Keep it open

### Step 2: Refresh the Footprints Page
1. Go to: http://localhost:5173/footprints
2. Watch the console for these messages:

**Expected console output:**
```
Loaded albums: [...]
Albums by city: {...}
Creating markers for cities: [...]
Creating marker for Tokyo with 1 albums
All markers created
```

### Step 3: What Each Message Means

#### ✅ Good Output Example:
```javascript
Loaded albums: [
  {
    id: "abc123",
    title: "Tokyo 2024",
    location: "Tokyo",  // ← MUST be exactly "Tokyo"
    year: "2024",
    photo_count: 5,
    cover_image: "https://..."
  }
]

Albums by city: {
  "Tokyo": [{ /* album data */ }]
}

Creating markers for cities: ["Tokyo"]
Creating marker for Tokyo with 1 albums
All markers created
```

#### ❌ Problem Output Example 1 - No Albums:
```javascript
Loaded albums: []
Albums by city: {}
Creating markers for cities: []
All markers created
```
**This means:** No albums in database OR albums not loading from Supabase

**Fix:** 
- Check Supabase connection in `.env`
- Create album in Admin Dashboard
- Make sure album has photos

#### ❌ Problem Output Example 2 - Wrong Location:
```javascript
Loaded albums: [
  {
    id: "abc123",
    title: "Tokyo 2024",
    location: "Tokyo, Japan",  // ← WRONG! Too specific
    ...
  }
]

Albums by city: {}  // ← Empty! Not grouped
Creating markers for cities: []
```

**This means:** Album location doesn't match city name exactly

**Fix:**
- Go to Admin → Edit Album
- Change Location from `Tokyo, Japan` to just `Tokyo`
- Save and refresh

### Step 4: Click the Marker

After you see markers created, click the pin on the map.

**Expected console output:**
```
Mouse over marker: Tokyo
Marker clicked! Tokyo [{ /* albums */ }]
Sidebar should open now. showSidebar: true
Connection line created
```

If you see these messages, the sidebar SHOULD open.

### Step 5: Common Issues

#### Issue A: "No console messages at all"
- Dev server not running → Run `npm run dev`
- Wrong page → Make sure you're on `/footprints`

#### Issue B: "Loaded albums: []"
**Two possibilities:**

**Possibility 1:** No albums exist
- Go to Admin: http://localhost:5173/admin
- Click "Albums"
- If empty, create a new album with Location = `Tokyo`

**Possibility 2:** Albums exist but not loading
- Check `.env` file has correct Supabase credentials
- Check browser Network tab for failed requests
- Try logging out and back into admin

#### Issue C: "Albums show but 'Albums by city: {}' is empty"
**The location field doesn't match:**
- Album location = `Tokyo, Japan` ← Won't work
- Album location = `tokyo` ← Won't work (lowercase)
- Album location = `TOKYO` ← Won't work (uppercase)
- Album location = `Tokyo` ← ✅ Works!

**Fix:**
1. Admin → Albums → Edit your Tokyo album
2. Change Location field to exactly: `Tokyo`
3. Save
4. Hard refresh Footprints page (Cmd+Shift+R)

#### Issue D: "Markers created but click does nothing"
**Check for click message:**
- Click the pin
- Look for: `Marker clicked! Tokyo [...]`

**If you see the message:**
- Sidebar should open
- Check if sidebar is hidden off-screen (browser zoom issue?)

**If you DON'T see the message:**
- Map tile is blocking clicks (z-index issue)
- This should be fixed in the latest code

### Step 6: Test the Exact Flow

1. **Clear console** (trash icon)
2. **Refresh page** (Cmd+R)
3. **Look for:** "Loaded albums: [...]" → Should show your album
4. **Look for:** "Albums by city: {...}" → Should show Tokyo grouping
5. **Look for:** "Creating marker for Tokyo..." → Should confirm marker creation
6. **Hover over pin** → Should see "Mouse over marker: Tokyo"
7. **Click pin** → Should see "Marker clicked! Tokyo [...]"
8. **Look for:** "Sidebar should open now. showSidebar: true"
9. **Look for:** "Connection line created"

If ALL of these appear, but you still don't see the sidebar, take a screenshot of:
- The full browser window
- The console messages
- Send both to me

---

## 🎯 Quick Fix Checklist

Before debugging, try these:

- [ ] Album exists in Admin Dashboard
- [ ] Album has at least 1 photo
- [ ] Location field = `Tokyo` (exact, no extra text)
- [ ] Album is saved
- [ ] Dev server is running (`npm run dev`)
- [ ] Hard refresh page (Cmd+Shift+R or Ctrl+Shift+R)
- [ ] Browser console is open (F12)
- [ ] No JavaScript errors in console (red text)

---

## 📸 What to Send Me

If it's still not working, send:

1. **Screenshot of browser console** after refreshing page
2. **Screenshot of Admin → Albums page** showing your Tokyo album
3. **Screenshot of the edit album form** showing the Location field value
4. **Any red error messages** from the console

This will help me see exactly what's happening! 🔍
