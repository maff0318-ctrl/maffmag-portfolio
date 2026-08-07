# Multi-City Albums Guide

Your Footprints map now supports albums that cover multiple cities! 🗺️✨

---

## 🎯 How It Works

When you create an album with multiple cities, **separate pins will appear for each city**, and **both pins will show the same album** when clicked.

---

## ✍️ Location Field Formats

### **Single City** (Original)
```
Tokyo
Tokyo, Japan
```
→ Creates **1 pin** in Tokyo

---

### **Two Cities** (NEW!)
```
Kyoto & Osaka
Kyoto & Osaka, Japan
Kyoto and Osaka
Kyoto / Osaka
```
→ Creates **2 pins** (Kyoto + Osaka), both show the same album

---

### **Three or More Cities** (NEW!)
```
Tokyo & Kyoto & Osaka
Tokyo / Kyoto / Osaka, Japan
Paris and London and Rome
```
→ Creates **3 pins**, all show the same album

---

## 📝 Supported Separators

The map understands these separators:
- ✅ `&` (ampersand)
- ✅ `and` (word)
- ✅ `/` (slash)

### Examples:
- `Kyoto & Osaka` ✅
- `Tokyo and Kyoto` ✅
- `Paris / London` ✅
- `Tokyo & Kyoto & Osaka, Japan` ✅
- `New York and Los Angeles, USA` ✅

---

## 🗺️ Pre-Configured Cities

Make sure to use these **exact city names** (case-sensitive):

1. **Tokyo**
2. **Kyoto**
3. **Osaka** ← NEW!
4. **Seoul**
5. **Hong Kong**
6. **Bangkok**
7. **Singapore**
8. **Paris**
9. **London**
10. **New York**
11. **Los Angeles**
12. **Sydney**
13. **Melbourne**

---

## 💡 Real-World Examples

### Example 1: Kansai Region Trip
**Album Title:** "Kansai Autumn 2024"  
**Location:** `Kyoto & Osaka, Japan`  
**Photos:** 50 photos covering both cities

**Result:**
- 📍 Pin in **Kyoto** → Click shows "Kansai Autumn 2024"
- 📍 Pin in **Osaka** → Click shows "Kansai Autumn 2024"

---

### Example 2: US West Coast Road Trip
**Album Title:** "California Road Trip 2024"  
**Location:** `Los Angeles & San Francisco, USA`  
**Photos:** 80 photos

**Result:**
- 📍 Pin in **Los Angeles** → Click shows "California Road Trip 2024"
- ⚠️ No pin for San Francisco (not in pre-configured cities yet)

**Fix:** Add San Francisco coordinates to the code, or just use `Los Angeles`

---

### Example 3: Europe Tour
**Album Title:** "Europe Summer 2023"  
**Location:** `Paris & London, Europe`  
**Photos:** 100 photos

**Result:**
- 📍 Pin in **Paris** → Click shows "Europe Summer 2023"
- 📍 Pin in **London** → Click shows "Europe Summer 2023"

---

## ⚙️ How the Pins Work

### **Single-City Album:**
```
Location: "Tokyo, Japan"
```
→ 1 pin in Tokyo, shows 1 album

### **Multi-City Album:**
```
Location: "Kyoto & Osaka, Japan"
```
→ 2 pins (Kyoto + Osaka), both show the same album

### **Multiple Albums, Same City:**
```
Album 1: "Tokyo Summer 2024" (Location: Tokyo)
Album 2: "Tokyo Winter 2023" (Location: Tokyo)
```
→ 1 pin in Tokyo with badge **"2"**, shows both albums

### **Multi-City + Multiple Albums:**
```
Album 1: "Kansai Spring 2024" (Location: Kyoto & Osaka)
Album 2: "Kyoto Temples" (Location: Kyoto)
```
→ **Kyoto pin** with badge "2" (shows both albums)  
→ **Osaka pin** with badge "1" (shows only Album 1)

---

## 🧪 Testing Your Setup

### Step 1: Create a Multi-City Album
1. Go to Admin: http://localhost:5173/admin
2. Create New Album
3. **Location:** `Kyoto & Osaka, Japan`
4. **Title:** "Kansai Trip 2024"
5. Upload photos
6. Save

### Step 2: Check the Map
1. Go to Footprints: http://localhost:5173/footprints
2. Open browser console (F12)
3. Look for message:
   ```
   ✨ Multi-city album: "Kansai Trip 2024" pinned in Kyoto, Osaka
   ```

### Step 3: Test Pins
1. Click the **Kyoto pin** → Sidebar shows "Kansai Trip 2024"
2. Click the **Osaka pin** → Sidebar shows "Kansai Trip 2024"
3. ✅ Same album appears from both pins!

---

## ⚠️ Common Issues

### Issue 1: "City not found in coordinates"
**Console shows:**
```
⚠️ City "San Francisco" not found in coordinates
```

**Cause:** City not in the pre-configured list

**Fix:** Either:
- Use a pre-configured city instead
- Or add the city coordinates to the code (see `cityCoordinates` in `FootprintsView.vue`)

---

### Issue 2: "No pins appear"
**Possible causes:**
1. Typo in city name (e.g., `Kyoto` vs `kyoto`)
2. City not in pre-configured list
3. Album has no photos

**Check console for warnings:**
```
⚠️ City "kyoto" not found in coordinates (from location: "kyoto & Osaka")
```

**Fix:** Use exact capitalization: `Kyoto` not `kyoto`

---

### Issue 3: "Only one pin appears instead of two"
**Example:** Location = `Kyoto & Osaka`, but only Kyoto pin shows

**Check console:**
```
⚠️ City "Osaka" not found in coordinates
```

**Fix:** Make sure Osaka is in the `cityCoordinates` list (it is now!)

---

## ✅ Best Practices

### 1. **Use Consistent Separators**
- ✅ Recommended: `Kyoto & Osaka, Japan`
- ✅ Also works: `Kyoto and Osaka, Japan`
- ✅ Also works: `Kyoto / Osaka`

### 2. **Match Exact City Names**
- ✅ `Tokyo` (correct)
- ❌ `tokyo` (wrong - lowercase)
- ❌ `TOKYO` (wrong - uppercase)

### 3. **Keep It Simple**
- ✅ `Kyoto & Osaka` (2 cities, clear)
- ⚠️ `Kyoto & Osaka & Nara & Kobe` (4 cities, maybe too many?)

### 4. **Group Logically**
- ✅ Multi-city for trips covering multiple nearby cities
- ✅ Single-city for focused trips in one location

---

## 🎯 Quick Reference

| Location Format | Pins Created | Example |
|----------------|--------------|---------|
| `Tokyo` | 1 (Tokyo) | Single city trip |
| `Tokyo, Japan` | 1 (Tokyo) | Single city with country |
| `Kyoto & Osaka` | 2 (Kyoto, Osaka) | Two-city trip |
| `Kyoto & Osaka, Japan` | 2 (Kyoto, Osaka) | Two cities with country |
| `Tokyo / Kyoto / Osaka` | 3 (Tokyo, Kyoto, Osaka) | Three-city trip |
| `Paris and London` | 2 (Paris, London) | Two cities with "and" |

---

## 🚀 Advanced: Adding New Cities

If you need a city not in the list:

1. Open `src/views/FootprintsView.vue`
2. Find `cityCoordinates` (around line 25)
3. Add your city:
   ```typescript
   'San Francisco': { lat: 37.7749, lng: -122.4194 },
   ```
4. Save and refresh

Now you can use:
```
Location: Los Angeles & San Francisco, USA
```

---

**Happy mapping!** 🗺️✨
