# How to Connect Your Tokyo Album to the Footprints Map

Tokyo is already pre-configured in the map! You just need to make sure your album's **Location** field is set to exactly `Tokyo`.

---

## 🎯 Quick Fix (2 Minutes)

### Step 1: Open Admin Dashboard
1. Go to: **http://localhost:5173/admin**
2. Login with your email: `maff0318@gmail.com`

### Step 2: Edit Your Tokyo Album
1. Click **"Albums"** in the admin menu
2. Find your "Tokyo, Japan" album
3. Click **"Edit"** button

### Step 3: Update the Location Field
1. In the **Location** field, change from:
   - ❌ `Tokyo, Japan` 
   
   To exactly:
   - ✅ `Tokyo`

2. Keep everything else the same (Year, Title, photos, etc.)
3. Click **"Save"**

### Step 4: Check the Map
1. Go to: **http://localhost:5173/footprints**
2. You should now see a pin with your "M" logo in Tokyo! 📍
3. Click the pin → Your Tokyo album will appear in the sidebar

---

## ✅ Why This Works

The map matches albums to cities using the **exact Location field value**:

- **Pre-configured city:** `Tokyo` (coordinates: 35.6762, 139.6503)
- **Your album needs:** Location = `Tokyo` (exact spelling, no extra text)

The map will automatically:
- ✅ Show Tokyo pin on the map
- ✅ Display your album when the pin is clicked
- ✅ Show photo count and album details

---

## 📝 Location Field Rules

### ✅ Correct Format:
- `Tokyo` → Works perfectly
- `Kyoto` → Works perfectly
- `Seoul` → Works perfectly

### ❌ Won't Work:
- `Tokyo, Japan` → Too specific (includes country)
- `tokyo` → Wrong capitalization
- `TOKYO` → Wrong capitalization
- `Toyko` → Typo

---

## 🌍 Pre-Configured Cities

Your map already has these cities ready:
1. Tokyo
2. Kyoto
3. Seoul
4. Hong Kong
5. Bangkok
6. Singapore
7. Paris
8. London
9. New York
10. Los Angeles
11. Sydney
12. Melbourne

Just use these **exact names** in the Location field!

---

## 🔧 If You Have Multiple Tokyo Albums

If you create more Tokyo albums later:
- **Album 1:** Location = `Tokyo`, Year = `2024`
- **Album 2:** Location = `Tokyo`, Year = `2023`

The map will automatically:
- Show **one Tokyo pin** with a `+2` counter
- When clicked, show **both albums** in the sidebar

---

## ✨ Quick Test Checklist

- [ ] Location field = `Tokyo` (exact spelling)
- [ ] Album has at least 1 photo uploaded
- [ ] Album is saved
- [ ] Footprints page refreshed
- [ ] Tokyo pin appears on map (Japan area, east Asia)
- [ ] Clicking pin shows your album

---

**That's it!** Your Tokyo album will be connected to the map as soon as you update the Location field to `Tokyo`. 🗾✨
