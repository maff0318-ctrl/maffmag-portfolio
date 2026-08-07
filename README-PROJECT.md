# Wanderlust - Minimalist Travel Photography Website

A clean, modern, photography-focused personal travel website built with Vue 3, TypeScript, and Tailwind CSS. Features sharp edges, ultra-thin typography, and a pure aesthetic that puts photography first.

## 🎯 Project Overview

This minimalist travel website emphasizes:
- **Photography-first design** - High-quality images with zero distractions
- **Sharp corners** - No border-radius anywhere for a clean, modern look
- **Ultra-thin typography** - Inter font family with light weights (200-400)
- **Pure white backgrounds** - Minimal color palette for maximum visual impact
- **Responsive layouts** - Masonry galleries on desktop, clean grids on mobile

## 📂 Project Structure

```
travel-blog/
├── index.html                 # Entry HTML with SEO meta tags
├── tailwind.config.js         # Custom design tokens
├── postcss.config.js          # PostCSS configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
│
└── src/
    ├── main.ts                # Application entry point
    ├── App.vue                # Root component
    ├── env.d.ts               # Environment type declarations
    │
    ├── assets/
    │   └── tailwind.css       # Design system & Tailwind directives
    │
    ├── components/
    │   ├── ui/                # Base UI components
    │   │   ├── BaseButton.vue
    │   │   ├── BaseCard.vue
    │   │   ├── BaseImage.vue
    │   │   └── index.ts
    │   │
    │   ├── layout/            # Layout components
    │   │   ├── NavigationBar.vue
    │   │   ├── FooterSection.vue
    │   │   └── index.ts
    │   │
    │   ├── gallery/           # Gallery-specific components
    │   │   └── PhotoCard.vue
    │   │
    │   └── trip/              # Trip-specific components
    │       └── TripCard.vue
    │
    ├── views/                 # Page components
    │   ├── SplashView.vue     # Full-screen hero entrance
    │   ├── PortfolioView.vue  # Photography gallery
    │   ├── TripsView.vue      # Trip journal showcase
    │   └── AboutView.vue      # Split-screen about page
    │
    ├── router/
    │   └── index.ts           # Vue Router configuration
    │
    ├── data/                  # Static data files
    │   ├── portfolio.json     # Photo gallery data
    │   └── trips.json         # Trip journal data
    │
    └── types/
        └── index.ts           # TypeScript declarations
```

## 🎨 Design System

### Colors
- **Primary Background**: `#FFFFFF` (Pure white)
- **Text Colors**: `#000000` (Black), `#1A1A1A` (Dark), `#6B6B6B` (Medium)
- **Accent**: `#2563EB` (Blue - used sparingly)
- **Borders/Dividers**: `#E5E5E5` (Light gray)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 200 (Thin), 300 (Light), 400 (Regular), 500 (Medium)
- **Letter Spacing**: Wide tracking for headings (`tracking-widest`)
- **Text Transform**: Uppercase for labels and navigation

### Spacing
- **Base Unit**: 4px
- **Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px

### Border Radius
- **ALL**: 0 (Sharp corners everywhere)

## 📄 Pages

### 1. Splash Screen (`/`)
- Full-screen hero slideshow (3 images, 6-second intervals)
- Centered brand name and tagline
- "Enter Site" button with fade transition
- Current location indicator
- Slide navigation dots

### 2. Portfolio (`/portfolio`)
- **Desktop**: 3-column masonry gallery
- **Mobile**: 2-column square grid
- Location filter buttons
- Lazy-loaded images
- Hover effects with title/location overlay

### 3. Trips (`/trips`)
- **Desktop**: 3-column grid of trip cards
- **Mobile**: Single column layout
- Sort by date or location
- Trip cards with hero image, title, excerpt, and "Read More" button
- Responsive images with zero border-radius

### 4. About (`/about`)
- **Desktop**: 50/50 split-screen with overlapping content card
- **Mobile**: Stacked layout with image on top
- Biography text
- Skills/services list
- Social contact links

## 🧩 Components

### Base UI Components

#### BaseButton
```vue
<BaseButton 
  variant="primary"    <!-- primary | secondary | ghost -->
  size="md"            <!-- sm | md | lg -->
  :uppercase="true"
>
  Button Text
</BaseButton>
```

#### BaseCard
```vue
<BaseCard 
  :hoverable="true"
  padding="md"         <!-- none | sm | md | lg -->
>
  Card content
</BaseCard>
```

#### BaseImage
```vue
<BaseImage 
  src="image-url.jpg"
  alt="Description"
  aspectRatio="landscape"  <!-- auto | square | landscape | portrait -->
  objectFit="cover"        <!-- cover | contain | fill -->
  :lazy="true"
  :overlay="false"
/>
```

### Layout Components

#### NavigationBar
```vue
<NavigationBar :transparent="false" />
```
- Fixed header with scroll detection
- Transparent mode for splash screen
- Mobile hamburger menu with full-screen overlay
- Active link highlighting

#### FooterSection
```vue
<FooterSection :light="false" />
```
- Copyright text
- Social media links
- Optional light mode for dark backgrounds

## 🚀 Getting Started

### Prerequisites
- Node.js 22.18.0+ or 24.12.0+
- npm, yarn, or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## 📱 Responsive Breakpoints

| Breakpoint | Width | Gallery Columns | Trips Grid | About Layout |
|------------|-------|----------------|------------|--------------|
| Mobile     | <640px | 2 (square) | 1 column | Stacked |
| Tablet     | 640-1024px | 2-3 | 2 columns | Split 40/60 |
| Desktop    | >1024px | 3-4 masonry | 3 columns | Split 50/50 |

## ⚡ Performance Features

- **Lazy Loading**: Images load on-scroll using native lazy loading
- **Code Splitting**: Route-based lazy loading for all page components
- **Image Optimization**: Unsplash CDN with width/quality parameters
- **Preconnect**: Early connections to fonts.googleapis.com and images.unsplash.com
- **CSS Variables**: Efficient design token management
- **Minimal JavaScript**: Vue 3 Composition API with tree-shaking

## 🎭 Animations

- **Fade In/Out**: Page transitions and image loading
- **Slide Up**: Content reveal animations
- **Hover Effects**: Subtle scale and opacity changes
- **Smooth Scroll**: Native smooth scrolling behavior

## 🔧 Customization

### Adding New Photos
Edit `src/data/portfolio.json`:
```json
{
  "id": 13,
  "title": "Photo Title",
  "location": "Location",
  "image": "https://images.unsplash.com/...",
  "aspect": "landscape",
  "featured": false
}
```

### Adding New Trips
Edit `src/data/trips.json`:
```json
{
  "id": 7,
  "title": "Trip Title",
  "slug": "trip-slug",
  "location": "Country",
  "dateRange": "Month Year",
  "excerpt": "Brief description...",
  "heroImage": "https://images.unsplash.com/...",
  "duration": "10 days",
  "highlights": ["Highlight 1", "Highlight 2"]
}
```

### Changing Design Tokens
Edit `tailwind.config.js` to modify:
- Color palette
- Typography scale
- Spacing units
- Animation timings

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📜 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Credits

- Photography: [Unsplash](https://unsplash.com)
- Font: [Inter](https://fonts.google.com/specimen/Inter)
- Framework: [Vue.js](https://vuejs.org)
- Styling: [Tailwind CSS](https://tailwindcss.com)
- Build Tool: [Vite](https://vitejs.dev)

## 📝 Future Enhancements

- [ ] Lightbox component for full-size image viewing
- [ ] Trip detail pages with full journal entries
- [ ] Map integration showing visited locations
- [ ] Dark mode toggle
- [ ] Blog section
- [ ] Contact form
- [ ] Newsletter integration
- [ ] Social media sharing buttons
- [ ] Image upload/admin interface
- [ ] Performance monitoring dashboard

---

Built with ❤️ using Vue 3 + TypeScript + Tailwind CSS
