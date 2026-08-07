# How to Update About Page Image

You want to use "The Secret Life of Walter Mitty" poster image. Here's how to add it with the best visual treatment for your website.

---

## 📸 Step 1: Prepare the Image

### **Recommended Adjustments:**

Since the original image has text overlays ("BEN STILLER", "THE SECRET LIFE OF WALTER MITTY"), I recommend:

**Option A: Crop to focus on the person + sky** (Best for quiet luxury aesthetic)
- Crop out the movie title text at the top
- Keep just the person jumping and the blue sky
- This creates a cleaner, more personal feel

**Option B: Use full image but desaturate**
- Slightly desaturate colors (reduce saturation by 20-30%)
- This makes it match your minimal aesthetic better
- The blue sky becomes more muted and elegant

**Option C: Find a similar clean image**
- Search Unsplash for: "person jumping sky", "adventure travel portrait"
- Get a high-quality image without text overlays

---

## 📂 Step 2: Save the Image

### **Image Specs:**
- **Format:** JPG or WebP
- **Dimensions:** 1200px width minimum (for sharp display)
- **Aspect Ratio:** 2:3 or 3:4 (portrait orientation)
- **File Size:** Under 500KB (optimize for web)

### **Save Location:**
```
/Users/kwuntungman/kiro_test/travel-blog/public/images/about-hero.jpg
```

Or upload to your existing image storage (Supabase Storage, Unsplash URL, etc.)

---

## 🎨 Step 3: Design Treatment Options

I'll give you multiple design options that match your website's aesthetic:

### **Option 1: Full-Height Portrait (Current Style)**
```vue
<!-- Clean, full portrait -->
<BaseImage
  src="/images/about-hero.jpg"
  alt="Travel photographer portrait"
  object-fit="cover"
  :lazy="false"
  class="h-full w-full"
/>
```

### **Option 2: Cropped + Focused (Recommended)**
```vue
<!-- Crop to show just upper body + sky -->
<BaseImage
  src="/images/about-hero.jpg"
  alt="Adventure travel"
  object-fit="cover"
  object-position="center 30%"
  :lazy="false"
  class="h-full w-full"
/>
```
This crops the bottom part and focuses on the person + sky.

### **Option 3: With Gradient Overlay (Most Elegant)**
```vue
<div class="relative h-screen sticky top-0 overflow-hidden">
  <BaseImage
    src="/images/about-hero.jpg"
    alt="Travel photographer"
    object-fit="cover"
    :lazy="false"
    class="h-full w-full opacity-90"
  />
  <!-- Subtle white gradient from right for seamless blend -->
  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white opacity-40" />
</div>
```

### **Option 4: Grayscale + Sharp Corners (Quiet Luxury)**
```vue
<div class="relative h-screen sticky top-0 overflow-hidden">
  <BaseImage
    src="/images/about-hero.jpg"
    alt="Travel photographer"
    object-fit="cover"
    :lazy="false"
    class="h-full w-full grayscale-[30%] brightness-105"
  />
</div>
```
Subtle grayscale (30%) keeps some color but makes it more refined.

---

## 🛠️ Step 4: Apply the Change

### **Edit the AboutView.vue file:**

Location: `src/views/AboutView.vue` (around line 75)

**Find this section:**
```vue
<!-- Left Side: Fixed Full-Vertical Portrait Image -->
<div class="relative h-screen sticky top-0 overflow-hidden">
  <BaseImage
    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=85"
    alt="Travel portrait of photographer"
    object-fit="cover"
    :lazy="false"
    class="h-full w-full"
  />
  <!-- Subtle gradient overlay for depth -->
  <div class="absolute inset-0 bg-gradient-to-r from-transparent to-minimal-white opacity-20" />
</div>
```

**Replace with one of these options:**

#### **Recommended: Option 3 (Elegant with Gradient)**
```vue
<div class="relative h-screen sticky top-0 overflow-hidden">
  <BaseImage
    src="/images/about-hero.jpg"
    alt="Embracing adventure and exploration"
    object-fit="cover"
    object-position="center 35%"
    :lazy="false"
    class="h-full w-full opacity-95"
  />
  <!-- Elegant white gradient blend -->
  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white opacity-30" />
</div>
```

**Why this is best:**
- ✅ `opacity-95` - Slightly softens the image
- ✅ `object-position="center 35%"` - Crops to focus on person + sky
- ✅ White gradient - Creates seamless blend with white content card
- ✅ Matches your quiet luxury aesthetic

---

## 🎯 If Using Unsplash Alternative

If you want a similar clean image without movie text:

**Search Unsplash for:**
- "person jumping adventure"
- "traveler portrait sky"
- "explorer blue sky"

**Example URLs (ready to use):**
```
https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=85
https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=85
https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=85
```

---

## 🧪 Step 5: Test & Refine

After updating:

1. **Refresh the About page**: http://localhost:5173/about
2. **Check on desktop**: Image should fill left half, content on right
3. **Check on mobile**: Image should display well in stacked layout
4. **Adjust `object-position`** if needed:
   - `center 20%` - Focus more on top (sky)
   - `center 40%` - Focus more on middle (person)
   - `center 50%` - Standard center

---

## 🎨 Color Adjustments (CSS Filters)

If the image is too colorful for your minimal aesthetic:

```vue
<BaseImage
  src="/images/about-hero.jpg"
  alt="Travel photographer"
  object-fit="cover"
  :lazy="false"
  class="h-full w-full 
         saturate-[0.85]
         brightness-[1.05]
         contrast-[0.95]"
/>
```

**What each does:**
- `saturate-[0.85]` - Reduce color intensity by 15%
- `brightness-[1.05]` - Slightly brighten (5%)
- `contrast-[0.95]` - Soften contrast by 5%

This creates a more refined, less "poster-like" look.

---

## 📋 Quick Copy-Paste Solution

**If you already saved the image to `/public/images/about-hero.jpg`:**

Just replace the image URL in `AboutView.vue`:

```vue
<BaseImage
  src="/images/about-hero.jpg"
  alt="Embracing adventure through travel"
  object-fit="cover"
  object-position="center 30%"
  :lazy="false"
  class="h-full w-full opacity-95 saturate-[0.9]"
/>
```

Save, refresh, done! ✅

---

## 💡 Pro Tips

1. **Remove movie text**: Use a photo editor to crop out title text
2. **Vertical format works best**: Portrait images suit the split-screen layout
3. **Sky colors**: Blue sky works great with your white aesthetic
4. **Person in motion**: Matches the "travel/adventure" theme
5. **Quality matters**: Use high-res images (1200px+ width)

---

**Need help?** Let me know if you want me to:
- Suggest specific Unsplash alternatives
- Adjust the CSS positioning
- Add different filter effects

📸✨
