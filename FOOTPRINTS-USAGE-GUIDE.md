# Footprints Map - Quick Usage Guide

## 🎯 How to Use the Interactive Map

### Step 1: See the Pin Markers
- Pin markers appear on cities where you have albums
- Each pin shows your signature "M" logo
- Pins with multiple albums show a red number badge (e.g., "2", "3")

### Step 2: Interact with Pins
**IMPORTANT:** You need to **CLICK** the pin (not just hover)

- **Hover over pin**: Pin lifts up, shadow grows, cursor changes to pointer
- **Click the pin**: 
  - Sidebar slides in from the right
  - Connection line draws from pin to sidebar
  - Shows all albums from that city

### Step 3: View Albums
- Sidebar displays all albums from the clicked city
- Shows album cover image, title, year, photo count
- Click any album to view the full album page
- Click "View Full Journey →" to jump to that album

### Step 4: Close Sidebar
- Click the X button in the top-right of sidebar
- Connection line disappears automatically
- Click another pin to see different city's albums

---

## ❓ Troubleshooting

### "I don't see any pins on the map"
**Possible causes:**
1. **No albums created yet** → Create albums in Admin Dashboard first
2. **Album location doesn't match city name** → Check the Location field
3. **Albums have no photos** → Upload at least 1 photo to each album

**Solution:**
1. Go to Admin Dashboard: http://localhost:5173/admin
2. Check your albums
3. Make sure Location field = `Tokyo` (exact spelling, see pre-configured cities list)

### "I click the pin but nothing happens"
**Check browser console:**
1. Press **F12** (or Cmd+Option+I on Mac)
2. Go to **Console** tab
3. Refresh the page
4. Look for log messages:
   - "Loaded albums: [...]" → Shows your albums
   - "Albums by city: {...}" → Shows how albums are grouped

**If you see empty arrays `[]`:**
- Your albums are not loading from the database
- Check Supabase connection in `.env` file
- Make sure albums have photos uploaded

**If you see albums but no city grouping:**
- Check the "Albums by city" log
- Make sure your album's `location` field exactly matches a city name
- Example: `"Tokyo"` works, `"Tokyo, Japan"` doesn't work

### "Pin appears but sidebar doesn't open"
**Check:**
1. Open browser console (F12)
2. Click the pin
3. Look for JavaScript errors
4. Make sure you're clicking directly on the pin (not the map background)

### "Hover effect doesn't work"
**This is fixed now!** After the latest update:
- Hover over pin → Should lift up and shadow grows
- Cursor should change to pointer
- If not working, hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)

---

## 🗺️ Pre-Configured Cities

Your map has these cities ready. Just use the exact name in your album's Location field:

1. **Tokyo** (東京)
2. **Kyoto** (京都)
3. **Seoul** (首爾)
4. **Hong Kong** (香港)
5. **Bangkok** (曼谷)
6. **Singapore** (新加坡)
7. **Paris** (巴黎)
8. **London** (倫敦)
9. **New York** (紐約)
10. **Los Angeles** (洛杉磯)
11. **Sydney** (雪梨)
12. **Melbourne** (墨爾本)

---

## ✅ Quick Test Checklist

To verify your Tokyo album appears on the map:

- [ ] Tokyo album exists in Admin Dashboard
- [ ] Location field = `Tokyo` (exact spelling)
- [ ] Album has at least 1 photo uploaded
- [ ] Album is saved
- [ ] Footprints page refreshed (or hard refresh: Cmd+Shift+R)
- [ ] Pin appears on map in Japan region
- [ ] **Click pin** (not just hover)
- [ ] Sidebar slides in from right
- [ ] Tokyo album appears in sidebar with cover image
- [ ] Click album → navigates to album detail page

---

## 🔧 Debug Commands (Open Browser Console - F12)

After refreshing the Footprints page, check console for:

```
Loaded albums: [...] 
// Should show your albums array with location, title, etc.

Albums by city: {...}
// Should show: { "Tokyo": [...] } if your Tokyo album is set up correctly
```

If you see:
```
Loaded albums: []
Albums by city: {}
```
→ Albums are not loading. Check Supabase connection or create albums first.

---

## 📞 Still Having Issues?

1. **Check browser console** (F12) for errors
2. **Verify album Location field** matches exactly: `Tokyo`
3. **Hard refresh** the page: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. **Check dev server** is running: `npm run dev`
5. **Verify Supabase** connection in `.env` file

---

**Remember:** You need to **CLICK** the pin, not just hover over it! 📍
