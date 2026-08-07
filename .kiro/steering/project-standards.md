---
inclusion: always
---

# Travel Blog Project Standards

## Development Standards

### Coding Standards
- Use TypeScript with strict mode enabled
- Follow Vue.js Composition API patterns
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components focused and single-responsibility

### Component Structure
```vue
<script setup lang="ts">
// 1. Imports
// 2. TypeScript interfaces
// 3. Reactive state
// 4. Computed properties
// 5. Functions and handlers
// 6. Lifecycle hooks
</script>

<template>
  <!-- Semantic HTML structure -->
  <!-- Use Vue directives appropriately -->
  <!-- Keep templates readable -->
</template>

<style scoped>
  /* Scoped styles */
  /* Use CSS variables for consistency */
  /* Mobile-first responsive design */
</style>
```

### File Organization
- Components: `src/components/`
- Views: `src/views/`
- Router: `src/router/`
- Stores: `src/stores/`
- Assets: `src/assets/`
- Utilities: `src/utils/` (when needed)

## Design System

### Color Palette
- Primary: `#3a86ff` (Blue)
- Secondary: `#8338ec` (Purple)
- Accent: `#ff006e` (Pink)
- Light: `#f8f9fa` (Off-white)
- Dark: `#212529` (Charcoal)
- Gray Scale: Use `--gray-light`, `--gray-medium`, `--gray-dark`

### Typography
- Font Family: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif`
- Font Weights: 400 (normal), 600 (semibold), 700 (bold), 800 (extrabold)
- Line Height: 1.6 for body, 1.4 for headings

### Spacing
- Use CSS variables for consistency
- Base unit: 8px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px

### Border Radius
- Small: `var(--border-radius-sm)` (8px)
- Regular: `var(--border-radius)` (12px)
- Large: 20px (for special elements)

### Shadows
- Regular: `var(--shadow)` (0 4px 6px rgba(0, 0, 0, 0.1))
- Large: `var(--shadow-lg)` (0 10px 15px rgba(0, 0, 0, 0.1))
- Hover: Add transform and shadow enhancement

## Performance Guidelines

### Image Optimization
- Use Unsplash CDN for development images
- Implement lazy loading for images below the fold
- Optimize production images with proper formats (WebP, AVIF)
- Specify image dimensions to prevent layout shifts

### Code Splitting
- Use Vue Router's lazy loading for routes
- Split vendor chunks appropriately
- Consider component-level code splitting for large components

### Bundle Optimization
- Tree-shake unused code
- Use proper import syntax
- Avoid large third-party libraries when possible
- Monitor bundle size with `npm run build --report`

## Accessibility

### Semantic HTML
- Use appropriate HTML5 elements
- Implement proper heading hierarchy (h1-h6)
- Use ARIA labels when necessary
- Ensure keyboard navigation works

### Color Contrast
- Maintain WCAG AA compliance (4.5:1 for normal text)
- Test contrast ratios for all color combinations
- Provide alternative styles for colorblind users

### Focus Management
- Ensure all interactive elements are focusable
- Implement visible focus indicators
- Manage focus for modal dialogs and popups

## Testing Strategy

### Unit Testing (Planned)
- Test component logic with Vitest
- Mock API calls appropriately
- Test computed properties and methods

### Integration Testing (Planned)
- Test component interactions
- Test routing behavior
- Test state management

### E2E Testing (Planned)
- Use Cypress for end-to-end tests
- Test critical user journeys
- Test responsive behavior

## Git Workflow

### Branch Naming
- `feature/` for new features
- `bugfix/` for bug fixes
- `hotfix/` for urgent fixes
- `release/` for release preparation

### Commit Messages
- Use conventional commits format
- Start with type: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Keep subject line under 50 characters
- Use imperative mood

### Pull Requests
- Include descriptive titles
- Add screenshots for UI changes
- Link related issues
- Request reviews from team members

## Deployment Guidelines

### Environment Variables
- Store secrets in `.env` files
- Never commit `.env` files to version control
- Use different environments: development, staging, production

### Build Process
- Run tests before building
- Generate source maps for production debugging
- Implement proper caching strategies

### Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor performance metrics
- Track user analytics (privacy-compliant)

## Content Guidelines

### Blog Posts
- Minimum 300 words per post
- Include high-quality images with proper attribution
- Use markdown for formatting
- Include meta descriptions for SEO

### Photography
- Minimum resolution: 1200px width
- Optimize file sizes
- Add alt text for accessibility
- Include location and photographer credits

### User-Generated Content
- Implement content moderation
- Respect copyright laws
- Follow community guidelines
- Provide reporting mechanisms

## Future Development Roadmap

### Phase 1: MVP (Current)
- Basic blog functionality
- Photo gallery
- Responsive design
- Core user features

### Phase 2: Enhanced Features
- User authentication
- Comments system
- Social sharing
- Newsletter integration

### Phase 3: Advanced Features
- Map integration
- Travel planning tools
- Community features
- Mobile app

### Phase 4: Scale
- Backend API
- Database integration
- Advanced search
- Performance optimization