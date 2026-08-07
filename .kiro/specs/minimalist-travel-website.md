# Minimalist Personal Travel Website Specification

**Project:** Minimalist Photography-Focused Travel Website  
**Tech Stack:** Vue 3 + TypeScript + Vite (Current) → Consider Astro + Tailwind CSS for final build  
**Design Philosophy:** Clean, modern, photography-first with sharp edges and ultra-minimal aesthetics

---

## Executive Summary

This specification defines a minimalist personal travel website with a photography-first approach. The design emphasizes clean layouts, sharp edges (zero border-radius), ultra-thin typography, and high-quality imagery. The user experience focuses on visual storytelling with minimal text and maximum visual impact.

---

## Pages Overview

### 1. Splash Screen (`/` or `/splash`)
**Purpose:** Dramatic entrance with full-screen hero image

**Layout:**
- Full viewport height (100vh)
- Single high-quality hero image as background
- Centered content overlay with minimal text
- "Enter Site" button with subtle animation

**Content:**
- Site title/brand (thin sans-serif, small text)
- Optional tagline (1-3 words maximum)
- Enter button (minimal style, no background or subtle border)

**Behavior:**
- Smooth fade transition to Portfolio page on button click
- Optional: Image slideshow (3-5 images, slow transition, 5-8 seconds each)

### 2. Portfolio/Home (`/portfolio` or `/home`)
**Purpose:** Photography gallery showcasing travel locations

**Layout - Desktop:**
- Multi-column masonry gallery (3-4 columns)
- Images with varying heights for visual interest
- Zero gap or minimal gap (2-4px)
- Hover effect: subtle scale or opacity change

**Layout - Mobile:**
- Clean 2-column square grid
- Uniform image sizes (1:1 aspect ratio)
- Minimal gap (2-4px)
- Touch-friendly interactions

**Features:**
- Lazy loading for performance
- Lightbox on image click (optional)
- Category/location filters (minimal UI)
- Infinite scroll or "Load More" button

### 3. Trips/Showcase (`/trips`)
**Purpose:** Grid layout for detailed trip journals

**Layout:**
- Clean grid system (2-3 columns desktop, 1 column mobile)
- Trip cards with:
  - Hero image (zero border-radius)
  - Trip title (thin font)
  - Date range (small text)
  - Brief excerpt (2-3 lines)
  - "Read More" link (minimal style)

**Card Design:**
- No borders, no shadows (or very subtle)
- Clean separation through spacing
- Image takes 60-70% of card height

**Features:**
- Sort by date or location
- Filter by region/country
- Archive pagination

### 4. About (`/about`)
**Purpose:** Personal introduction with split-screen design

**Layout - Desktop:**
- 50/50 split screen
- Left side: Large portrait or lifestyle image
- Right side: Content card overlapping the image boundary
- Content card: white background, minimal padding

**Layout - Mobile:**
- Stacked layout (image on top, content below)
- Content card maintains overlap effect (negative margin)

**Content:**
- Brief bio (2-3 paragraphs)
- Contact information (email, social links)
- Optional: Skills or services offered
- Minimal styling, focus on readability

---

## Design Tokens

### Colors

```css
/* Primary Palette */
--color-white: #FFFFFF;           /* Background */
--color-black: #000000;           /* Text (headings) */
--color-gray-dark: #1A1A1A;       /* Primary text */
--color-gray-medium: #6B6B6B;     /* Secondary text */
--color-gray-light: #E5E5E5;      /* Borders, dividers */

/* Accent Colors (use sparingly) */
--color-accent: #2563EB;          /* Links, buttons */
--color-accent-hover: #1D4ED8;    /* Hover states */

/* Transparent */
--color-overlay: rgba(0, 0, 0, 0.4); /* Image overlays */
```

### Typography

```css
/* Font Family */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;

/* Font Weights */
--font-weight-thin: 200;
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 2rem;       /* 32px */
--text-4xl: 2.5rem;     /* 40px */

/* Line Heights */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing

```css
/* Base Unit: 4px */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */
```

### Border Radius

```css
/* Sharp Corners - No Radius */
--radius-none: 0;
--radius-sm: 0;
--radius-md: 0;
--radius-lg: 0;
```

### Shadows

```css
/* Minimal or No Shadows */
--shadow-none: none;
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.05);
```

### Transitions

```css
--transition-fast: 150ms ease;
--transition-base: 300ms ease;
--transition-slow: 500ms ease;
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
--breakpoint-2xl: 1536px; /* Extra large screens */
```

### Grid Behavior

| Breakpoint | Gallery Columns | Trip Grid Columns | About Layout |
|------------|----------------|-------------------|--------------|
| Mobile (<640px) | 2 (square) | 1 | Stacked |
| Tablet (640-1024px) | 2-3 | 2 | Split 40/60 |
| Desktop (>1024px) | 3-4 masonry | 3 | Split 50/50 |

---

## Component Specifications

### 1. Navigation Bar
**Style:** Minimal fixed or absolute positioning

```
- Height: 64-80px
- Background: Transparent or white with subtle border
- Logo: Left-aligned, small text (thin weight)
- Menu: Right-aligned, minimal links (3-5 items)
- Mobile: Hamburger menu, full-screen overlay
```

### 2. Image Components
**Universal Rules:**
- Border-radius: 0 (sharp corners)
- Object-fit: cover
- Lazy loading enabled
- Placeholder/blur while loading
- Alt text required for accessibility

### 3. Buttons
**Primary Button:**
- Background: transparent or white
- Border: 1px solid black (optional)
- Text: uppercase, letter-spacing: 0.1em
- Padding: 12px 24px
- Hover: fill background black, text white

**Secondary Button:**
- Text only, no border
- Underline on hover
- Arrow icon (→) on hover

### 4. Cards
- Background: white
- Border: none
- Shadow: none or very subtle
- Border-radius: 0
- Content padding: 16-24px

### 5. Footer
- Minimal, text-focused
- Copyright, social links, contact
- Small text, gray color
- Top border: 1px solid gray-light

---

## Image Guidelines

### Quality Standards
- Minimum resolution: 1200px width for portfolio
- Aspect ratios: Mix of landscape, portrait, square
- File format: WebP for production, JPEG fallback
- Compression: Quality 80-85% for balance

### Splash Screen Hero
- Resolution: 1920x1080px minimum
- Format: High-quality JPEG or WebP
- File size: < 500KB optimized

### Portfolio Images
- Minimum: 800px width
- Masonry heights: Variable (400-800px)
- Square grid (mobile): 600x600px

### About Image
- Portrait orientation: 600x800px minimum
- Or landscape: 1200x800px

---

## Performance Requirements

### Target Metrics
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

### Optimization Strategies
1. Image lazy loading (native + intersection observer)
2. Critical CSS inlining
3. Route-based code splitting
4. Image format optimization (WebP/AVIF)
5. CDN for static assets
6. Preconnect to image CDNs (Unsplash, etc.)

---

## Accessibility Requirements

### WCAG AA Compliance
- Color contrast ratio: 4.5:1 for text
- Focus indicators: visible and clear
- Keyboard navigation: full support
- Screen reader: semantic HTML
- Alt text: all images
- Skip links: main content

### Interactive Elements
- Minimum touch target: 44x44px
- Clear focus states
- No motion for prefers-reduced-motion

---

## Implementation Tasks

### Phase 1: Project Setup & Structure
- [ ] Create new Astro project OR refactor existing Vue project
- [ ] Configure Tailwind CSS with custom design tokens
- [ ] Set up routing structure (Astro or Vue Router)
- [ ] Configure TypeScript and linting
- [ ] Set up image optimization pipeline

### Phase 2: Design System Implementation
- [ ] Create Tailwind config with custom tokens
- [ ] Build base components (Button, Card, Image)
- [ ] Implement typography system
- [ ] Create spacing utilities
- [ ] Set up CSS variables

### Phase 3: Page Development - Splash Screen
- [ ] Create SplashView.vue or Splash.astro
- [ ] Implement full-screen hero image
- [ ] Add centered content overlay
- [ ] Create "Enter Site" button with animation
- [ ] Implement fade transition to portfolio
- [ ] Add optional slideshow functionality

### Phase 4: Page Development - Portfolio/Home
- [ ] Create PortfolioView.vue or Portfolio.astro
- [ ] Implement masonry gallery for desktop
- [ ] Implement 2-column square grid for mobile
- [ ] Add lazy loading for images
- [ ] Create filter UI (if needed)
- [ ] Implement lightbox component (optional)
- [ ] Add hover effects and interactions

### Phase 5: Page Development - Trips/Showcase
- [ ] Create TripsView.vue or Trips.astro
- [ ] Design and build trip card component
- [ ] Implement grid layout (responsive)
- [ ] Create sample trip data structure
- [ ] Add sorting and filtering logic
- [ ] Build trip detail page template

### Phase 6: Page Development - About
- [ ] Create AboutView.vue or About.astro
- [ ] Implement split-screen layout
- [ ] Create overlapping content card
- [ ] Add responsive mobile layout
- [ ] Style bio and contact sections
- [ ] Add social links component

### Phase 7: Navigation & Layout
- [ ] Create NavigationBar component
- [ ] Implement responsive menu
- [ ] Create FooterSection component
- [ ] Add smooth scroll behavior
- [ ] Implement page transitions

### Phase 8: Content & Data
- [ ] Create data structure for trips
- [ ] Set up image asset management
- [ ] Add placeholder content
- [ ] Create content management approach
- [ ] Implement SEO meta tags

### Phase 9: Optimization & Polish
- [ ] Optimize images and assets
- [ ] Implement lazy loading
- [ ] Add loading states
- [ ] Performance testing and optimization
- [ ] Cross-browser testing
- [ ] Mobile testing

### Phase 10: Final Deployment
- [ ] Build production bundle
- [ ] Deploy to hosting platform
- [ ] Configure domain and SSL
- [ ] Set up analytics (privacy-focused)
- [ ] Monitor performance metrics

---

## Technical Considerations

### Framework Decision

**Option A: Refactor to Astro + Tailwind CSS**
- Pros: Better for static content, faster performance, image optimization
- Cons: Requires migration from Vue, learning curve

**Option B: Continue with Vue 3 + Vite**
- Pros: Current stack, faster development
- Cons: More JavaScript overhead, manual image optimization

**Recommendation:** Astro for final production build, Vue for rapid prototyping

### Data Management
- Static data: JSON files or Markdown
- Images: External CDN (Unsplash, Cloudinary) or local with optimization
- Content: Markdown files with frontmatter

### State Management
- Minimal state required
- Vue: Pinia or simple reactive stores
- Astro: No client-side state needed

---

## File Structure (Proposed)

```
src/
├── components/
│   ├── layout/
│   │   ├── NavigationBar.vue
│   │   ├── FooterSection.vue
│   │   └── PageTransition.vue
│   ├── ui/
│   │   ├── Button.vue
│   │   ├── Card.vue
│   │   ├── Image.vue
│   │   └── Lightbox.vue
│   ├── gallery/
│   │   ├── MasonryGallery.vue
│   │   ├── GridGallery.vue
│   │   └── PhotoCard.vue
│   └── trip/
│       ├── TripCard.vue
│       └── TripGrid.vue
├── views/
│   ├── SplashView.vue
│   ├── PortfolioView.vue
│   ├── TripsView.vue
│   ├── TripDetailView.vue
│   └── AboutView.vue
├── router/
│   └── index.ts
├── assets/
│   ├── images/
│   └── styles/
│       ├── main.css
│       └── tokens.css
├── data/
│   ├── trips.json
│   └── portfolio.json
└── utils/
    ├── imageUtils.ts
    └── animationUtils.ts
```

---

## Success Criteria

1. **Visual Impact:** Clean, minimalist aesthetic with sharp edges and thin typography
2. **Performance:** All Core Web Vitals in green, fast load times
3. **Responsiveness:** Seamless experience across all device sizes
4. **Accessibility:** WCAG AA compliant
5. **Image Quality:** High-quality photography display with optimal loading
6. **User Experience:** Smooth transitions, intuitive navigation
7. **Maintainability:** Clear code structure, well-documented components

---

## Next Steps

1. Review and approve this specification
2. Decide on framework approach (Astro vs Vue continuation)
3. Set up development environment
4. Begin Phase 1 implementation
5. Iterative development with regular reviews

---

## Notes

- Design tokens prioritize minimalism over the existing colorful palette
- Zero border-radius is a key differentiator from the current design
- Photography takes center stage; text should support, not compete
- Consider adding a blog section in future iterations
- Dark mode could be a future enhancement
