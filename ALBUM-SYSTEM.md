# Travel Photo Album System - Design Documentation

## Overview
A comprehensive album system where each portfolio cover photo represents a complete travel album containing 100-250 photos with bilingual descriptions (Chinese/English), designed for storytelling.

---

## System Architecture

### 1. Data Structure

#### Portfolio Data (`src/data/portfolio.json`)
- **Purpose**: Cover photos displayed on the Portfolio grid page
- **Fields**:
  - `id`: Unique photo identifier
  - `albumId`: Links to the full album (e.g., "kyoto-2023")
  - `title`: Album title
  - `location`: Country/city
  - `continent`: Continent for filtering
  - `image`: Cover photo URL
  - `aspect`: Photo aspect ratio (landscape/portrait/square)
  - `featured`: Featured album flag
  - `year`: Year of visit

#### Album Data (`src/data/albums.json`)
- **Purpose**: Complete album information with all photos
- **Fields**:
  - `id`: Unique album identifier (matches albumId in portfolio)
  - `title`: Album title
  - `location`: Travel destination
  - `continent`: Continent
  - `year`: Year of visit
  - `coverImage`: Cover photo URL
  - `description`: Album summary
  - `date`: Human-readable date (e.g., "March 2023")
  - `photoCount`: Total number of photos (100-250)
  - `photos`: Array of album photos with:
    - `id`: Photo number in sequence
    - `url`: Photo URL
    - `caption`: Short title (bilingual: Chinese / English)
    - `description`: Detailed description (bilingual)

---

## User Flow

### Portfolio Page (`/portfolio`)
1. User sees a masonry grid of cover photos
2. Each cover shows:
   - Travel photo
   - Year badge (bottom right)
   - Hover effects (zoom + icons)
3. Filter by continents: All, Africa, Antarctica, Asia, Europe, North America, Oceania, South America
4. **Click on any cover → Navigate to Album Detail Page**

### Album Detail Page (`/album/:id`)

#### Layout Design

**Header Section**:
- Fixed navigation bar with back button, logo, and menu
- Back button returns to Portfolio page

**Album Hero Section**:
- Album title (large, thin typography)
- Location and date
- Description paragraph
- Stats: Photo count, year, continent

**Photo Gallery - Story Layout**:
- **Single column, centered layout (max-width: 1200px)**
- Each photo is full-width within the container
- Photos maintain original aspect ratios
- Large spacing between photos (4rem)
- Sequential order (tells a story)

**Photo Display**:
```
┌─────────────────────────────────┐
│                                 │
│     [Full-width Photo]          │
│                                 │
└─────────────────────────────────┘
       Caption (Chinese/English)
       Description paragraph
       
       [Large spacing]

┌─────────────────────────────────┐
│     [Next Photo]                │
└─────────────────────────────────┘
```

**Interactive Features**:
- Hover on photo → slight zoom + dark overlay + zoom icon
- Click on photo → Open full-screen lightbox
- Lightbox features:
  - Full-screen black background
  - Photo centered
  - Navigation arrows (left/right)
  - Close button (top right)
  - Keyboard controls: ← → arrows, Esc to close
  - Caption overlay at bottom
  - Photo counter (e.g., "1 / 156")

---

## Design Philosophy

### Storytelling Layout
- **Why single column?** Photos tell a linear story, maintaining narrative flow
- **Why large spacing?** Gives each photo breathing room, focuses attention
- **Why fixed order?** The sequence matters - it's a journey through time

### Typography & Captions
- **Bilingual support**: Chinese and English in same caption
- **Format**: "中文标题 / English Title"
- **Hierarchy**: 
  - Caption: Larger, bold-ish (photo title)
  - Description: Smaller, lighter (context/story)

### Minimalist Aesthetic
- Sharp corners (no border-radius)
- Ultra-thin fonts (100-300 weight)
- Wide letter-spacing (0.15em - 0.25em)
- Soft gray text (#8B8B8B) on white background
- Clean, unobtrusive UI

---

## Technical Implementation

### Routes
```typescript
/portfolio              → PortfolioView (grid of cover photos)
/album/:id             → AlbumDetailView (full album with 100-250 photos)
```

### Key Components
1. **PortfolioView.vue**
   - Displays masonry grid of cover photos
   - Filters by continent
   - Navigates to album on click

2. **AlbumDetailView.vue**
   - Loads album data by ID
   - Displays photos in story layout
   - Implements lightbox with keyboard navigation
   - Shows bilingual captions

3. **PhotoCard.vue**
   - Gallery card with hover effects
   - Displays year badge
   - Clickable to open album

### State Management
- No complex state needed (using ref and computed)
- Album data loaded from JSON
- Lightbox state managed locally

---

## Adding New Albums

### Step 1: Add Album Data
Edit `src/data/albums.json`:
```json
{
  "id": "new-destination-2024",
  "title": "New Destination",
  "location": "Country",
  "continent": "Continent",
  "year": 2024,
  "coverImage": "https://...",
  "description": "Album description",
  "date": "Month Year",
  "photoCount": 150,
  "photos": [
    {
      "id": 1,
      "url": "https://...",
      "caption": "中文标题 / English Caption",
      "description": "Detailed description in both languages"
    }
    // ... 150+ photos
  ]
}
```

### Step 2: Add Portfolio Cover
Edit `src/data/portfolio.json`:
```json
{
  "id": 13,
  "albumId": "new-destination-2024",
  "title": "New Destination",
  "location": "Country",
  "continent": "Continent",
  "image": "https://...",
  "aspect": "landscape",
  "featured": false,
  "year": 2024
}
```

### Step 3: Done!
The system automatically:
- Displays the cover in Portfolio grid
- Links to album detail page
- Shows all 150+ photos in story order

---

## Best Practices

### Photo Selection
- Cover photo should be the most iconic/representative
- Album photos should follow chronological/narrative order
- Mix wide and portrait shots for visual variety

### Captions
- Keep captions concise (1-2 lines)
- Use bilingual format: "中文 / English"
- Descriptions can be longer (2-4 sentences)
- Add context, emotions, or story behind the photo

### Image Optimization
- Recommended size: 1920px width (max)
- Use Unsplash quality parameter: `?w=1920&q=85`
- Maintain original aspect ratios
- Use lazy loading for performance

### Photo Count
- Minimum: 50 photos per album
- Sweet spot: 100-200 photos
- Maximum: 250 photos
- Too few = incomplete story
- Too many = viewer fatigue

---

## Future Enhancements

### Possible Features
1. **Photo metadata**: EXIF data, camera settings
2. **Map integration**: Show location pins
3. **Comments**: Allow viewers to leave comments
4. **Favorites**: Users can favorite photos
5. **Share**: Social media sharing
6. **Download**: High-res download option
7. **Slideshow**: Auto-play mode
8. **Filter/Sort**: By date, color, mood
9. **Search**: Search within captions
10. **Related albums**: Suggest similar trips

### Performance Optimization
- Implement virtual scrolling for 250+ photos
- Progressive image loading
- WebP format support
- CDN integration

---

## Technical Notes

### File Structure
```
src/
├── data/
│   ├── albums.json         # Full album data (all photos)
│   └── portfolio.json      # Portfolio covers (links to albums)
├── views/
│   ├── PortfolioView.vue   # Grid of cover photos
│   └── AlbumDetailView.vue # Individual album page
├── components/
│   └── gallery/
│       └── PhotoCard.vue   # Cover photo card
└── router/
    └── index.ts            # Route: /album/:id
```

### Dependencies
- Vue 3 + TypeScript
- Vue Router (for navigation)
- Tailwind CSS (styling)
- No external image libraries needed

---

## Responsive Design

### Desktop (≥768px)
- Masonry grid: 3 columns (Portfolio)
- Story layout: Single column, max 1200px (Album)
- Lightbox: Full screen with navigation

### Mobile (<768px)
- Portfolio: 2-column grid, square crops
- Album: Full width, single column
- Lightbox: Full screen, swipe gestures
- Touch-friendly navigation

---

## Summary

The album system creates a immersive storytelling experience where:
1. Portfolio page = "Book covers" showing all your travels
2. Album page = "Opening the book" to read the full story
3. Each photo = A moment in your journey
4. Captions = Your voice narrating the experience

The design prioritizes:
- **Narrative flow** over random grid
- **Photo quality** over quantity
- **Storytelling** over mere display
- **Simplicity** over complexity
- **Bilingual content** for wider audience

Perfect for personal travel photography portfolios!
