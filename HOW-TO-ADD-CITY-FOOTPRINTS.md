# How to Add a New City to Footprints Map

This guide explains how to add new cities to your interactive Footprints map so they connect to your albums.

---

## 🎯 Quick Answer

**The footprints map automatically shows cities from your albums!** You don't need to manually add cities to the code anymore. Just make sure your album's `location` field matches one of the pre-configured cities.

---

## 📍 Two Ways to Add Cities

### Method 1: Use Pre-Configured Cities (Easiest)

The map already has 12 major cities pre-configured. When you create an album in the Admin Dashboard, simply use one of these exact location names:

#### Pre-Configured Cities:
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

#### Step-by-Step:
1. Go to Admin Dashboard: http://localhost:5173/admin
2. Click "Albums" → "Create New Album"
3. In the **Location** field, type one of the cities above (exact spelling)
4. Fill in other details (Year, Title, etc.)
5. Save the album
6. Go to Footprints page → the city will automatically appear on the map!

**Example:**
- Location: `Tokyo`
- Year: `2024`
- The map will show Tokyo with your album connected to it

---

### Method 2: Add a Brand New City (Requires Code Edit)

If you want to add a city that's NOT in the pre-configured list (like "Osaka", "Barcelona", etc.), you need to add it to the code once, then you can use it forever.

#### Step-by-Step:

**1. Find the coordinates of your new city**
   - Go to Google Maps
   - Search for your city
   - Right-click on the location → Click the coordinates (e.g., `35.6762, 139.6503`)
   - Copy the numbers

**2. Open the Footprints code file**
   - File path: `src/views/FootprintsView.vue`
   - Find this section (around line 22-35):

```javascript
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Kyoto': { lat: 35.0116, lng: 135.7681 },
  'Seoul': { lat: 37.5665, lng: 126.9780 },
  // ... more cities
}
```

**3. Add your new city**
   - Add a new line with your city's name and coordinates:

```javascript
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Kyoto': { lat: 35.0116, lng: 135.7681 },
  'Seoul': { lat: 37.5665, lng: 126.9780 },
  'Hong Kong': { lat: 22.3193, lng: 114.1694 },
  'Bangkok': { lat: 13.7563, lng: 100.5018 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'London': { lat: 51.5074, lng: -0.1278 },
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Melbourne': { lat: -37.8136, lng: 144.9631 },
  'Osaka': { lat: 34.6937, lng: 135.5023 },        // ← NEW CITY
  'Barcelona': { lat: 41.3851, lng: 2.1734 },      // ← NEW CITY
}
```

**4. Save the file**
   - The dev server will automatically reload

**5. Create an album with the new city**
   - Go to Admin → Create Album
   - Location: `Osaka` (exact spelling as in the code)
   - The new city will appear on the map!

---

## 🔗 How Albums Connect to Cities

The map automatically connects albums to cities by matching the **Location** field:

### Example 1: Single Album in a City
- **Album 1**: Location = "Tokyo"
- **Map shows**: Tokyo pin with "M" logo
- **Click pin**: Shows that one Tokyo album

### Example 2: Multiple Albums in Same City
- **Album 1**: Location = "Kyoto", Year = "2023"
- **Album 2**: Location = "Kyoto", Year = "2021"
- **Map shows**: Kyoto pin with "M" logo + "+2" counter
- **Click pin**: Shows both Kyoto albums (2023 and 2021)

---

## ⚠️ Important Rules

### ✅ DO:
- Use **exact spelling** for city names (case-sensitive!)
  - ✅ `Tokyo` (correct)
  - ❌ `tokyo` (won't work)
  - ❌ `TOKYO` (won't work)
- Use consistent city names across all albums
- Use city names, not country names
  - ✅ `Paris` (correct)
  - ❌ `France` (won't work)

### ❌ DON'T:
- Use different spellings for the same city
  - Bad example: `New York`, `NYC`, `New York City` (map treats these as 3 different places)
  - Good example: Always use `New York`
- Use regions or provinces
  - ❌ `California` → Use `Los Angeles` instead
  - ❌ `Kansai` → Use `Kyoto` or `Osaka` instead

---

## 📊 Testing Your Setup

1. **Create a test album:**
   - Admin → Create Album
   - Location: `Tokyo`
   - Year: `2024`
   - Title: `Test Album`
   - Upload at least 1 photo

2. **Check the Footprints page:**
   - Navigate to Footprints
   - You should see a pin in Tokyo
   - Click the pin → sidebar shows your test album

3. **If the pin doesn't appear:**
   - Check spelling (must be exact: `Tokyo` not `tokyo`)
   - Make sure Tokyo is in the `cityCoordinates` list
   - Refresh the page
   - Check browser console for errors (F12)

---

## 🌍 Pro Tips

### Tip 1: Find Exact Coordinates
For best map accuracy, use this format:
```javascript
'Rome': { lat: 41.9028, lng: 12.4964 },
```

### Tip 2: Group Nearby Cities
If you have multiple albums in nearby cities (e.g., Kyoto + Osaka), they'll show as separate pins even though they're close. This is correct behavior!

### Tip 3: Cluster Counter
The "+3" or "+4" counter appears automatically when you have multiple albums in the same city. You don't need to configure this.

### Tip 4: Bilingual Location Names
In your Admin Dashboard, use **English** city names for the Location field:
- Location field: `Tokyo` (for map coordinates)
- Album titles: Use bilingual (Tokyo 2024 / 東京 2024)

The map uses the Location field to find coordinates, so stick to English names in that field.

---

## 🆘 Common Issues

### Issue 1: "My city doesn't show on the map"
**Solution:** Check that:
1. The album has photos uploaded
2. The Location field exactly matches a city in `cityCoordinates`
3. The page is refreshed after creating the album

### Issue 2: "Pin is in the wrong location"
**Solution:** 
- Double-check the coordinates in `cityCoordinates`
- Use Google Maps to get accurate lat/lng
- Remember: lat comes first, lng second

### Issue 3: "Albums don't appear in sidebar when I click the pin"
**Solution:**
- Make sure the album's Location field exactly matches the city name
- Check that photos are uploaded (albums without photos may not display)
- Clear browser cache and refresh

---

## 📝 Quick Reference: Add New City Checklist

- [ ] Find city coordinates from Google Maps
- [ ] Open `src/views/FootprintsView.vue`
- [ ] Add city to `cityCoordinates` object (around line 22)
- [ ] Use exact spelling with proper capitalization
- [ ] Save file (dev server auto-reloads)
- [ ] Create album with that exact city name
- [ ] Check Footprints page

---

## 🎉 You're Done!

Now you can:
- ✅ Create albums in the Admin Dashboard
- ✅ Set the Location to any pre-configured city
- ✅ See your albums automatically appear on the Footprints map
- ✅ Add new cities to the map when needed

**Remember:** The map is automatic! Just match your album locations to the city names in the code, and everything connects automatically.

---

**Need Help?** 
- Check the browser console (F12) for error messages
- Make sure the dev server is running: `npm run dev`
- Verify your album has photos uploaded
