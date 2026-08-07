# Typography & Design System Update

## Updated Based on Zoe Marks Reference

### 🎨 Key Changes Implemented

## 1. Font Family
**Before:** Inter (weights 200-500)  
**After:** Work Sans + Inter (weights 100-400)

```css
--font-primary: 'Work Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
```

### Font Weights:
- **100** - Thin (for main headings)
- **200** - Extra Light (for navigation, labels)
- **300** - Light (for body text)
- **400** - Regular (for emphasis)

---

## 2. Letter Spacing

**Dramatic increase in letter-spacing for all text elements:**

| Element | Before | After |
|---------|--------|-------|
| Brand Name | `tracking-widest` (0.1em) | `tracking-[0.25em]` (0.25em) |
| Page Titles | `tracking-wide` (0.05em) | `tracking-[0.2em]` (0.2em) |
| Navigation | `tracking-widest` (0.1em) | `tracking-[0.15em]` (0.15em) |
| Labels | `tracking-wider` (0.05em) | `tracking-[0.2em]` (0.2em) |
| Body Text | Normal | `tracking-[0.05em]` (0.05em) |

---

## 3. Color Palette Softening

**Before:**
- Black: `#000000`
- Dark: `#1A1A1A`
- Medium: `#6B6B6B`

**After:**
- Black: `#000000`
- Dark: `#2C2C2C` (softer)
- Medium: `#8B8B8B` (lighter gray)
- Light: `#E8E8E8` (very light gray)

---

## 4. Typography Hierarchy

### Brand Name (Logo)
```vue
<h1 class="text-xl md:text-2xl font-thin tracking-[0.25em] uppercase">
  Wanderlust
</h1>
```

### Splash Screen
```vue
<h1 class="text-5xl md:text-6xl lg:text-7xl font-thin tracking-[0.25em] uppercase">
  Wanderlust
</h1>
<p class="text-sm md:text-base font-extralight tracking-[0.3em] uppercase">
  Enter Site
</p>
```

### Page Titles
```vue
<h2 class="text-4xl md:text-5xl font-thin tracking-[0.2em] uppercase">
  Portfolio
</h2>
```

### Section Subtitles
```vue
<p class="text-xs font-extralight tracking-[0.25em] uppercase">
  A Collection of Moments
</p>
```

### Navigation
```vue
<button class="text-xs tracking-[0.15em] uppercase font-extralight">
  Portfolio
</button>
```

### Body Text
```vue
<p class="text-base text-minimal-medium font-light leading-relaxed">
  Body content...
</p>
```

---

## 5. Component-Specific Updates

### Navigation Bar
- Logo: Ultra-thin (font-weight: 100)
- Menu items: Extra-light (font-weight: 200)
- Wider letter-spacing throughout
- Softer colors (dark gray instead of black)

### Portfolio Page
- Title: Font-thin with 0.2em letter-spacing
- Subtitle: Font-extralight with 0.25em letter-spacing
- All uppercase styling maintained

### About Page
- Header: Font-thin, 5xl-6xl size
- "The Story" label: Font-extralight
- Body text: Font-light with softer gray color
- Stats numbers: Font-thin

### Mobile Menu
- Links: Font-thin with 0.2em letter-spacing
- Larger size (text-3xl)
- Uppercase styling

---

## 6. Comparison Table

| Element | Reference (Zoe Marks) | Our Implementation |
|---------|----------------------|-------------------|
| Brand Font | Thin sans-serif | Work Sans Thin (100) |
| Letter Spacing | Very wide (0.2-0.3em) | 0.15-0.3em |
| Text Transform | Uppercase | Uppercase |
| Color Contrast | Low (soft grays) | Low (soft grays #2C2C2C, #8B8B8B) |
| Line Height | Generous | 1.8 for body, 1.2 for headings |
| Font Size | Medium-large | Matching (responsive) |

---

## 7. CSS Custom Properties Updated

```css
:root {
  /* Colors - Softer palette */
  --color-dark: #2C2C2C;
  --color-medium: #8B8B8B;
  --color-light: #E8E8E8;
  
  /* Typography - Ultra thin */
  --font-primary: 'Work Sans', 'Inter', sans-serif;
  --font-weight-thin: 100;
  --font-weight-extralight: 200;
  --font-weight-light: 300;
  --font-weight-regular: 400;
}
```

---

## 8. Tailwind Config Updates

```js
fontFamily: {
  sans: ['Work Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
},
fontWeight: {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
},
fontSize: {
  // All sizes now include letter-spacing
  'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.1em' }],
  'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.08em' }],
  // ... etc
}
```

---

## 9. Visual Aesthetic Summary

### Before (Original Design)
- Bold, modern, high-contrast
- Inter font (200-500 weights)
- Tight letter-spacing
- Dark black colors
- Professional but strong

### After (Zoe Marks Inspired)
- Delicate, elegant, subtle
- Work Sans font (100-400 weights)
- Wide letter-spacing (0.15-0.3em)
- Soft gray colors
- Professional but gentle

---

## 10. Files Modified

1. ✅ `src/assets/tailwind.css` - Font imports, CSS variables, base styles
2. ✅ `tailwind.config.js` - Font family, weights, letter-spacing
3. ✅ `src/components/layout/NavigationBar.vue` - Logo and nav styling
4. ✅ `src/views/SplashView.vue` - Brand name and tagline
5. ✅ `src/views/PortfolioView.vue` - Page title styling
6. ✅ `src/views/AboutView.vue` - Header and body text

---

## 11. Testing Checklist

- [ ] Logo appears ultra-thin (weight 100)
- [ ] Navigation has wide letter-spacing
- [ ] All headings are uppercase
- [ ] Page titles use font-thin
- [ ] Body text is softer gray color
- [ ] Letter-spacing is visibly wider
- [ ] Mobile menu text is ultra-thin
- [ ] Overall aesthetic feels lighter and more elegant

---

## 12. Next Steps (Optional Enhancements)

1. **Add tagline** below portfolio title (like "URBAN PHOTOGRAPHER")
2. **Social icons** styled to match (thin outlines)
3. **Filter buttons** with ultra-thin typography
4. **Stats section** with thin numbers
5. **Footer** with lighter text styling

---

## Preview the Changes

Refresh your browser at http://localhost:5174/ to see the updated typography!

The overall feel should now match the reference photos with:
- Ultra-thin, delicate typography
- Wide letter-spacing throughout
- Softer, more subtle color palette
- Elegant, minimalist aesthetic
