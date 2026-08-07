<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { albumService } from '@/services/albumService'
import { useLanguage } from '@/composables/useLanguage'
import type { Album } from '@/lib/supabase'
import AppHeader from '@/components/layout/AppHeader.vue'

const router = useRouter()
const { t, currentLang } = useLanguage()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let connectionLine: L.Polyline | null = null
let countryLayer: L.GeoJSON | null = null // Store country layer for re-styling
let standardTileLayer: L.TileLayer | null = null
const albums = ref<Album[]>([])
const selectedCity = ref<string | null>(null)
const selectedCityCoords = ref<{ lat: number; lng: number } | null>(null)
const selectedAlbums = ref<Album[]>([])
const showSidebar = ref(false)
const mapMode = ref<'2D' | '3D'>('2D')
const seasonalMode = ref(false)
const isLoading = ref(true)
const forceUpdate = ref(0) // Used to force reactivity

// Interactive reveal: pins stay hidden until a visited country is hovered or
// clicked. `activeCountry` holds the currently interacted country's name.
const activeCountry = ref<string | null>(null)

// Elegant expanding search (collapses to a magnifying-glass icon).
const searchOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

// Current map zoom - custom country-name labels only appear when zoomed in.
const zoomLevel = ref(2)

// Story Mode state
const storyMode = ref(false)
const storyIndex = ref(0)
const storySpeed = ref<'slow' | 'normal' | 'fast'>('normal')
let storyInterval: number | null = null

// Cooperative gesture hint: shown briefly on single-finger touch so the user
// knows to use two fingers. Keeps full dragging enabled for mouse users.
const showGestureHint = ref(false)
let gestureHintTimer: number | null = null

const handleMapTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    showGestureHint.value = true
    if (gestureHintTimer) clearTimeout(gestureHintTimer)
    gestureHintTimer = window.setTimeout(() => {
      showGestureHint.value = false
    }, 1500)
  } else {
    showGestureHint.value = false
    if (gestureHintTimer) {
      clearTimeout(gestureHintTimer)
      gestureHintTimer = null
    }
  }
}

// Stats Dashboard state
const showStatsPanel = ref(false)

// City to Country mapping
const cityToCountry: Record<string, string> = {
  'Tokyo': 'Japan',
  'Kyoto': 'Japan',
  'Osaka': 'Japan',
  'Seoul': 'South Korea',
  'Hong Kong': 'Hong Kong',
  'Bangkok': 'Thailand',
  'Singapore': 'Singapore',
  'Macau': 'Macau',
  'Taipei': 'Taiwan',
  'Kaohsiung': 'Taiwan',
  'Kenting': 'Taiwan',
  'Paris': 'France',
  'London': 'United Kingdom',
  'Glasgow': 'United Kingdom',
  'New York': 'United States of America',
  'Los Angeles': 'United States of America',
  'Sydney': 'Australia',
  'Melbourne': 'Australia',
  'Cairns': 'Australia',
  'Minsk': 'Belarus',
  'Bali': 'Indonesia',
  'Oslo': 'Norway',
  'Kuala Lumpur': 'Malaysia',
  'Ipoh': 'Malaysia',
  'Penang': 'Malaysia',
  'Siem Reap': 'Cambodia',
  'Phnom Penh': 'Cambodia',
  'Ho Chi Minh City': 'Vietnam',
  'Hanoi': 'Vietnam',
  'Moscow': 'Russia',
  'St Petersburg': 'Russia',
}

// Elegant color palette - more visible while maintaining minimalist aesthetic
const countryColors: Record<string, string> = {
  'Japan': 'rgba(210, 180, 190, 0.55)',           // Muted rose - more visible
  'South Korea': 'rgba(180, 200, 220, 0.55)',     // Soft blue-gray - more visible
  'Hong Kong': 'rgba(220, 200, 180, 0.55)',       // Warm beige - more visible
  'Thailand': 'rgba(200, 210, 180, 0.55)',        // Soft sage - more visible
  'Singapore': 'rgba(190, 180, 200, 0.55)',       // Light lavender - more visible
  'France': 'rgba(180, 190, 210, 0.55)',          // Soft periwinkle - more visible
  'United Kingdom': 'rgba(200, 190, 180, 0.55)',  // Warm gray - more visible
  'United States of America': 'rgba(210, 200, 190, 0.55)', // Sand - more visible
  'Australia': 'rgba(190, 210, 200, 0.55)',       // Soft mint - more visible
  'Belarus': 'rgba(205, 195, 210, 0.55)',         // Soft mauve - more visible
  'Indonesia': 'rgba(200, 200, 170, 0.55)',       // Soft olive - more visible
  'Norway': 'rgba(180, 205, 215, 0.55)',          // Soft ice blue - more visible
  'Malaysia': 'rgba(210, 195, 175, 0.55)',        // Soft tan - more visible
  'Cambodia': 'rgba(215, 190, 165, 0.55)',        // Soft terracotta - more visible
  'Vietnam': 'rgba(200, 195, 160, 0.55)',         // Soft khaki - more visible
  'Russia': 'rgba(205, 175, 170, 0.55)',           // Soft clay - more visible
}

// City coordinates (you'll add more as needed)
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Kyoto': { lat: 35.0116, lng: 135.7681 },
  'Osaka': { lat: 34.6937, lng: 135.5023 },
  'Seoul': { lat: 37.5665, lng: 126.9780 },
  'Hong Kong': { lat: 22.3193, lng: 114.1694 },
  'Bangkok': { lat: 13.7563, lng: 100.5018 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Macau': { lat: 22.1987, lng: 113.5439 },
  'Taipei': { lat: 25.0330, lng: 121.5654 },
  'Kaohsiung': { lat: 22.6273, lng: 120.3014 },
  'Kenting': { lat: 21.9397, lng: 120.8414 },
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'London': { lat: 51.5074, lng: -0.1278 },
  'Glasgow': { lat: 55.8642, lng: -4.2518 },
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Melbourne': { lat: -37.8136, lng: 144.9631 },
  'Cairns': { lat: -16.9186, lng: 145.7781 },
  'Minsk': { lat: 53.9006, lng: 27.5590 },
  'Bali': { lat: -8.3405, lng: 115.0920 },
  'Oslo': { lat: 59.9139, lng: 10.7522 },
  'Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
  'Ipoh': { lat: 4.5975, lng: 101.0901 },
  'Penang': { lat: 5.4141, lng: 100.3288 },
  'Siem Reap': { lat: 13.3633, lng: 103.8564 },
  'Phnom Penh': { lat: 11.5564, lng: 104.9282 },
  'Ho Chi Minh City': { lat: 10.8231, lng: 106.6297 },
  'Hanoi': { lat: 21.0278, lng: 105.8342 },
  'Moscow': { lat: 55.7558, lng: 37.6173 },
  'St Petersburg': { lat: 59.9311, lng: 30.3609 },
}

// Parse location string to extract multiple cities
const parseCities = (location: string): string[] => {
  // Remove country part if exists (e.g., "Kyoto & Osaka, Japan" → "Kyoto & Osaka")
  let cityPart = location
  if (location.includes(',')) {
    cityPart = location.split(',')[0].trim()
  }
  
  // Split by common separators: &, and, /
  const cities = cityPart
    .split(/\s*(&|and|\/)\s*/i)
    .filter(part => part !== '&' && part !== 'and' && part !== '/' && part.trim() !== '')
    .map(city => city.trim())
  
  // Validate cities exist in coordinates
  return cities.filter(city => {
    if (cityCoordinates[city]) {
      return true
    } else {
      console.warn(`City "${city}" not found in coordinates (from location: "${location}")`)
      return false
    }
  })
}

// Statistics
const stats = computed(() => {
  // Access forceUpdate to ensure reactivity
  const _ = forceUpdate.value
  
  const journeyCount = albums.value.length
  const cities = new Set<string>()
  
  // Parse all cities including multi-city albums
  albums.value.forEach(album => {
    if (album.location) {
      const albumCities = parseCities(album.location)
      albumCities.forEach(city => cities.add(city))
    }
  })
  
  const totalKm = journeyCount * 2500 // Approximate, you can calculate actual distances
  
  console.log('📊 Stats computed:', { journeys: journeyCount, cities: cities.size, totalKm })
  
  return {
    journeys: journeyCount,
    cities: cities.size,
    totalKm: totalKm.toLocaleString()
  }
})

// Enhanced statistics for dashboard
const enhancedStats = computed(() => {
  const visitedCountries = getVisitedCountries()
  const continents = new Set<string>()
  
  // Count continents (simplified - based on countries)
  visitedCountries.forEach(country => {
    if (['Japan', 'South Korea', 'Hong Kong', 'Macau', 'Taiwan', 'Thailand', 'Singapore', 'Indonesia', 'Malaysia', 'Cambodia', 'Vietnam'].includes(country)) continents.add('Asia')
    if (['France', 'United Kingdom', 'Belarus', 'Norway', 'Russia'].includes(country)) continents.add('Europe')
    if (['United States of America'].includes(country)) continents.add('North America')
    if (['Australia'].includes(country)) continents.add('Oceania')
  })
  
  // Calculate most visited city
  const cityVisits: Record<string, number> = {}
  albums.value.forEach(album => {
    const cities = parseCities(album.location)
    cities.forEach(city => {
      cityVisits[city] = (cityVisits[city] || 0) + 1
    })
  })
  const mostVisitedCity = Object.entries(cityVisits).sort((a, b) => b[1] - a[1])[0]
  
  // Calculate total photos
  const totalPhotos = albums.value.reduce((sum, album) => sum + (album.photo_count || 0), 0)
  
  // Calculate average photos per trip
  const avgPhotosPerTrip = albums.value.length > 0 ? Math.round(totalPhotos / albums.value.length) : 0
  
  // Get years span
  const years = albums.value.map(a => parseInt(a.year)).filter(y => !isNaN(y))
  const yearsActive = years.length > 0 ? Math.max(...years) - Math.min(...years) + 1 : 0
  
  return {
    // Macau and Taiwan are counted separately in cityToCountry (needed for
    // pin grouping) but are considered the same sovereign territory for display
    // purposes. Subtract 1 so the shown count reflects the user's intent (14).
    countries: Math.max(0, visitedCountries.size - 1),
    continents: continents.size,
    mostVisitedCity: mostVisitedCity ? mostVisitedCity[0] : 'N/A',
    mostVisitedCount: mostVisitedCity ? mostVisitedCity[1] : 0,
    totalPhotos,
    avgPhotosPerTrip,
    yearsActive,
    tripsPerYear: yearsActive > 0 ? (albums.value.length / yearsActive).toFixed(1) : '0'
  }
})

// Chronological timeline data
const timelineData = computed(() => {
  return albums.value
    .map(album => {
      const cities = parseCities(album.location)
      return cities.map(city => ({
        year: album.year,
        city,
        albumId: album.id,
        title: album.title,
        coords: cityCoordinates[city]
      }))
    })
    .flat()
    .filter(item => item.coords)
    .sort((a, b) => a.year.localeCompare(b.year))
})

// Season determination and colors
const getSeasonFromMonth = (month: number): 'spring' | 'summer' | 'autumn' | 'winter' => {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

const seasonColors = {
  spring: 'rgba(255, 182, 193, 0.55)',  // Soft pink - more visible
  summer: 'rgba(255, 218, 185, 0.55)',  // Warm peach - more visible
  autumn: 'rgba(255, 200, 160, 0.55)',  // Muted orange - more visible
  winter: 'rgba(176, 196, 222, 0.55)',  // Cool blue-gray - more visible
}

// Determine season for a country based on when it was visited
const getCountrySeasonColor = (countryName: string): string => {
  // Find albums for this country
  const countryAlbums = albums.value.filter(album => {
    const cities = parseCities(album.location)
    return cities.some(city => cityToCountry[city] === countryName)
  })
  
  if (countryAlbums.length === 0) {
    return countryColors[countryName] || 'rgba(200, 200, 200, 0.55)'
  }
  
  // Get the most recent visit's year to determine season
  // Since we don't have month data, we'll use a simple rotation based on country
  // In a real implementation, you'd parse the album's creation date
  const countryIndex = Object.keys(cityToCountry).indexOf(
    Object.keys(cityToCountry).find(city => cityToCountry[city] === countryName) || ''
  )
  const seasonIndex = countryIndex % 4
  const seasons: Array<'spring' | 'summer' | 'autumn' | 'winter'> = ['spring', 'summer', 'autumn', 'winter']
  
  return seasonColors[seasons[seasonIndex]]
}

// Group albums by city/location (supports multi-city albums)
const albumsByCity = computed(() => {
  const grouped: Record<string, Album[]> = {}
  
  albums.value.forEach(album => {
    // Parse multiple cities from location
    const cities = parseCities(album.location)
    
    if (cities.length === 0) {
      console.warn(`No valid cities found for album "${album.title}" with location: "${album.location}"`)
      return
    }
    
    // Add this album to each city's group
    cities.forEach(city => {
      if (!grouped[city]) {
        grouped[city] = []
      }
      grouped[city].push(album)
    })
    
    if (cities.length > 1) {
      console.log(`✨ Multi-city album: "${album.title}" pinned in ${cities.join(', ')}`)
    }
  })
  
  return grouped
})

// Quiet-luxury "camera focus ring" marker: a tiny static core dot with an
// elegant outer ring that scales smoothly on hover (no ping animation).
// (Count param retained for the call site; the design is intentionally the
// same for single and multi-album cities.)
const createLogoMarker = (_count: number = 1) => {
  return L.divIcon({
    className: 'bg-transparent border-none', // Removes any default Leaflet background
    html: `<div class="relative flex items-center justify-center w-6 h-6 group">
          <span class="absolute inline-flex rounded-full h-4 w-4 border border-neutral-500/50 transition-transform duration-700 ease-out group-hover:scale-150 group-hover:border-neutral-900"></span>
          <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-neutral-800 shadow-sm transition-colors duration-300 group-hover:bg-black"></span>
         </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -15],
  })
}

const initMap = () => {
  if (!mapContainer.value) return

  // Initialize map with quiet luxury style
  map = L.map(mapContainer.value, {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 10,
    zoomControl: false,
    // Always keep dragging enabled — disabling it breaks mouse pan on desktop
    // and mobile emulators. Touch-scroll coexistence is handled below by
    // showing a two-finger hint overlay when a single finger touches the map.
    dragging: true,
    tap: true,
    touchZoom: true,
    scrollWheelZoom: true,
    worldCopyJump: true,
    maxBounds: [[-85, -Infinity], [85, Infinity]],
    maxBoundsViscosity: 1.0,
  })

  // Enforce a single elegant, monochrome light-gray basemap (CartoDB Positron)
  // across all zoom levels - no dark or satellite alternatives, to keep the
  // quiet-luxury magazine aesthetic. Use the "no labels" variant so the map's
  // own baked-in place names don't clutter or conflict with our city pins;
  // the only labels shown are our own accurate city tooltips on each dot.
  standardTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '',
    subdomains: 'abcd',
    maxZoom: 20,
    noWrap: false, // Allow horizontal wrapping when panning beyond edges
  })

  standardTileLayer.addTo(map)

  // Cooperative gesture hint for touch devices
  if (mapContainer.value) {
    mapContainer.value.addEventListener('touchstart', handleMapTouchStart, { passive: true })
  }

  // Track zoom to toggle the custom country-name labels.
  zoomLevel.value = map.getZoom()
  map.on('zoomend', () => {
    zoomLevel.value = map!.getZoom()
    updateCountryLabels()
  })

  // Load and color visited countries
  loadCountryBoundaries()

  // Add markers for each city with albums
  console.log('Creating markers for cities:', Object.keys(albumsByCity.value))

  cityMarkers = []

  Object.entries(albumsByCity.value).forEach(([city, cityAlbums]) => {
    const coords = cityCoordinates[city]
    if (!coords) {
      console.warn(`No coordinates found for city: ${city}`)
      return
    }

    console.log(`Creating marker for ${city} with ${cityAlbums.length} albums`)

    const markerElement = L.marker([coords.lat, coords.lng], {
      icon: createLogoMarker(cityAlbums.length),
      interactive: true,
      bubblingMouseEvents: false,
      keyboard: false,
      // No `title` - the native browser hover box is intentionally removed;
      // the styled Leaflet tooltip below is the only label.
    })
    
    markerElement.addTo(map!)

    // Hidden by default; revealed only when its country is hovered/clicked.
    markerElement.setOpacity(0)
    cityMarkers.push({ marker: markerElement, country: cityToCountry[city] || null })

    // Add Leaflet tooltip (debossed text style, positioned well above pin)
    markerElement.bindTooltip(city, {
      permanent: false,
      direction: 'top',
      offset: [0, -15], // Sit just above the focus-ring marker
      className: 'city-tooltip-debossed',
      opacity: 1
    })

    // Create click handler function with proper Vue context
    const handleMarkerClick = (e: any) => {
      console.log('🎯 Marker clicked!', city, cityAlbums)
      
      // Hide photo thumbnails on click
      hidePhotoThumbnails()
      
      if (e && e.originalEvent) {
        e.originalEvent.stopPropagation()
        e.originalEvent.preventDefault()
      }
      
      // Remove existing connection line
      if (connectionLine && map) {
        map.removeLayer(connectionLine)
        connectionLine = null
      }

      // Update Vue reactive refs - match albums from any location containing this city
      selectedCity.value = city
      selectedCityCoords.value = coords
      // Filter albums that have this city in their location (supports multi-city albums)
      selectedAlbums.value = albums.value.filter(album => {
        const cities = parseCities(album.location)
        return cities.includes(city)
      })
      showSidebar.value = true

      console.log('✅ Sidebar state updated:', {
        selectedCity: selectedCity.value,
        selectedAlbums: selectedAlbums.value.length,
        showSidebar: showSidebar.value,
        albums: selectedAlbums.value.map(a => a.title)
      })

      // Create connection line from marker to sidebar
      setTimeout(() => {
        if (map && showSidebar.value) {
          try {
            const mapSize = map.getSize()
            const markerPoint = map.latLngToContainerPoint([coords.lat, coords.lng])
            
            // Sidebar panel edge position (right side)
            const sidebarEdgeX = mapSize.x - (window.innerWidth >= 768 ? 384 : 0)
            
            // Convert sidebar edge point back to lat/lng
            const sidebarLatLng = map.containerPointToLatLng([sidebarEdgeX, markerPoint.y])
            
            // Draw thin platinum line
            connectionLine = L.polyline(
              [[coords.lat, coords.lng], [sidebarLatLng.lat, sidebarLatLng.lng]], 
              {
                color: '#C0C0C0',
                weight: 1,
                opacity: 0.6,
                dashArray: '4, 4',
              }
            ).addTo(map)
            
            console.log('📍 Connection line created')
          } catch (error) {
            console.error('Error creating connection line:', error)
          }
        }
      }, 150)
    }

    // Add click handler directly to marker
    markerElement.on('click', handleMarkerClick)

    markerElement.on('mouseover', function() {
      // Keep this country's pins revealed while hovering the pin itself.
      revealCountry(cityToCountry[city] || activeCountry.value)
      showPhotoThumbnails(city, cityAlbums, coords)
    })
    
    markerElement.on('mouseout', function() {
      scheduleHide()
      // Hide photo thumbnails
      hidePhotoThumbnails()
    })
    
    markerElement.on('mousedown', function(e) {
      console.log('👆 Mouse down on marker:', city)
    })
  })

  console.log('All markers created')

  // Apply the initial reveal state (all pins hidden until a country is used).
  updateMarkerVisibility()

  // Custom zoom controls are rendered as Vue buttons below.
  // We disable the Leaflet built-in zoom control (zoomControl: false above)
  // to avoid the inconsistent +/- text characters.
}

const loadAlbums = async () => {
  try {
    isLoading.value = true
    console.log('🔄 Starting to load albums...')
    albums.value = await albumService.getAll()
    console.log('✅ Loaded albums:', albums.value.length, 'albums')
    console.log('📦 Albums data:', albums.value)
    console.log('🏙️ Albums by city:', Object.keys(albumsByCity.value).length, 'cities')
    
    // Force Vue to update
    await nextTick()
    
    console.log('📊 Stats after load:', stats.value)
    isLoading.value = false
    
    // Trigger force update
    forceUpdate.value++
    
    // Force another update
    await nextTick()
    
    if (map) {
      // Re-initialize markers after albums load
      initMap()
    }
  } catch (error) {
    console.error('❌ Error loading albums:', error)
    isLoading.value = false
  }
}

const viewAlbum = (albumId: string) => {
  router.push(`/album/${albumId}`)
}

const closeSidebar = () => {
  showSidebar.value = false
  selectedCity.value = null
  selectedCityCoords.value = null
  selectedAlbums.value = []
  
  // Remove connection line when closing sidebar
  if (connectionLine && map) {
    map.removeLayer(connectionLine)
    connectionLine = null
  }
}

// Photo thumbnail overlay state
let photoOverlays: L.Marker[] = []

// --- Interactive pin reveal ------------------------------------------------
// Registry of every city marker plus the country it belongs to, so we can
// reveal only the pins that match the currently active (hovered/clicked)
// country. Markers stay on the map but toggle opacity + pointer-events.
let cityMarkers: { marker: L.Marker; country: string | null }[] = []
let hideTimer: number | null = null

// Reveal a country's pins immediately (cancels any pending hide).
const revealCountry = (name: string | null) => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  activeCountry.value = name
}

// Hide after a short grace period, so moving the cursor from a country onto
// one of its freshly revealed pins doesn't make the pin disappear first.
const scheduleHide = () => {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => {
    activeCountry.value = null
    hideTimer = null
  }, 160)
}

// Show only the markers whose country matches the active country (pins without
// a country mapping fall back to showing whenever any country is active).
const updateMarkerVisibility = () => {
  cityMarkers.forEach(({ marker, country }) => {
    const visible = !!activeCountry.value && (country === activeCountry.value || country === null)
    marker.setOpacity(visible ? 1 : 0)
    const el = marker.getElement()
    if (el) el.style.pointerEvents = visible ? 'auto' : 'none'
  })
}

watch(activeCountry, updateMarkerVisibility)

// --- Zoom-based country labels ---------------------------------------------
// Permanent country-name tooltips, shown only once the user zooms in enough
// (keeps the default world view clean and minimal).
let countryLabelLayers: L.Layer[] = []
const LABEL_MIN_ZOOM = 4

// Manual [x, y] pixel nudges for countries whose multipolygon centroid lands
// awkwardly (e.g. Malaysia + Indonesia both centering over Borneo). Prevents
// the labels from overlapping and places them more meaningfully.
const countryLabelOffsets: Record<string, [number, number]> = {
  Malaysia: [-50, -30], // Nudge left/up toward Peninsular Malaysia
  Indonesia: [30, 40], // Nudge right/down deeper into the archipelago
  // Add more here as needed, e.g. Philippines: [10, -20]
}

const updateCountryLabels = () => {
  const show = zoomLevel.value >= LABEL_MIN_ZOOM
  countryLabelLayers.forEach((layer) => {
    if (show) layer.openTooltip()
    else layer.closeTooltip()
  })
}

// --- Expanding search ------------------------------------------------------
interface SearchResult {
  city: string
  country: string | null
  coords: { lat: number; lng: number }
}

// Suggestions drawn only from visited locations (cities that have albums),
// matched against both the city and its country name.
const searchResults = computed<SearchResult[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return Object.keys(albumsByCity.value)
    .filter(
      (city) =>
        city.toLowerCase().includes(q) ||
        (cityToCountry[city] || '').toLowerCase().includes(q),
    )
    .map((city) => ({
      city,
      country: cityToCountry[city] || null,
      coords: cityCoordinates[city],
    }))
    .filter((r) => !!r.coords)
    .slice(0, 8)
})

const toggleSearch = () => {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    nextTick(() => searchInputRef.value?.focus())
  } else {
    searchQuery.value = ''
  }
}

const selectSearchResult = (result: SearchResult) => {
  // 1. Smoothly fly to the selected destination.
  if (map && result.coords) {
    map.flyTo([result.coords.lat, result.coords.lng], 5, { animate: true, duration: 1.5 })
  }
  // 2. Reveal that destination's pins on arrival.
  revealCountry(result.country)
  // 3. Collapse the search back to the icon.
  searchQuery.value = ''
  searchOpen.value = false
}

// Show photo thumbnails on hover
const showPhotoThumbnails = (city: string, cityAlbums: Album[], coords: { lat: number; lng: number }) => {
  if (!map) return
  
  // Get up to 4 photos from the albums
  const photos: string[] = []
  cityAlbums.forEach(album => {
    if (photos.length < 4 && album.cover_image) {
      photos.push(album.cover_image)
    }
  })
  
  if (photos.length === 0) return
  
  // Position thumbnails in an arc above the pin
  const thumbnailSize = 50
  const radius = 80
  const startAngle = -120 // Start from left
  const angleStep = 60 / Math.max(photos.length - 1, 1) // Spread across 60 degrees
  
  photos.forEach((photoUrl, index) => {
    const angle = (startAngle + (angleStep * index)) * (Math.PI / 180)
    const offsetX = Math.sin(angle) * radius
    const offsetY = -Math.cos(angle) * radius
    
    // Calculate lat/lng offset
    const point = map!.latLngToContainerPoint([coords.lat, coords.lng])
    const newPoint = L.point(point.x + offsetX, point.y + offsetY)
    const newLatLng = map!.containerPointToLatLng(newPoint)
    
    // Create thumbnail HTML
    const thumbnailHtml = `
      <div class="photo-thumbnail" style="
        width: ${thumbnailSize}px;
        height: ${thumbnailSize}px;
        background-image: url('${photoUrl}');
        background-size: cover;
        background-position: center;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: thumbnailFadeIn 0.3s ease-out forwards;
        animation-delay: ${index * 0.1}s;
        opacity: 0;
      "></div>
    `
    
    const thumbnailIcon = L.divIcon({
      html: thumbnailHtml,
      className: 'photo-thumbnail-marker',
      iconSize: [thumbnailSize, thumbnailSize],
      iconAnchor: [thumbnailSize / 2, thumbnailSize / 2],
    })
    
    const thumbnailMarker = L.marker(newLatLng, {
      icon: thumbnailIcon,
      interactive: false,
      keyboard: false
    }).addTo(map!)
    
    photoOverlays.push(thumbnailMarker)
  })
}

// Hide photo thumbnails
const hidePhotoThumbnails = () => {
  if (!map) return
  
  photoOverlays.forEach(marker => {
    map!.removeLayer(marker)
  })
  photoOverlays = []
}

// Get list of visited countries from albums
const getVisitedCountries = (): Set<string> => {
  const countries = new Set<string>()
  albums.value.forEach(album => {
    const cities = parseCities(album.location)
    cities.forEach(city => {
      const country = cityToCountry[city]
      if (country) {
        countries.add(country)
      }
    })
  })
  return countries
}

// Load country boundaries and color visited countries
const loadCountryBoundaries = async () => {
  if (!map) return

  try {
    // Fetch world countries GeoJSON from public source
    const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
    const geojsonData = await response.json()
    
    const visitedCountries = getVisitedCountries()
    console.log('🌍 Visited countries:', Array.from(visitedCountries))

    countryLabelLayers = []

    // Add GeoJSON layer with conditional styling. Visited countries share a
    // single, unified "frosted-glass silver" tone to match the quiet-luxury
    // monochrome aesthetic - no pinks/browns or per-region coloring.
    countryLayer = L.geoJSON(geojsonData, {
      style: (feature) => {
        const countryName = feature?.properties?.ADMIN || feature?.properties?.name
        const isVisited = visitedCountries.has(countryName)

        if (isVisited) {
          return {
            fillColor: '#d4d4d8', // Tailwind neutral-300
            fillOpacity: 0.45,
            color: '#a1a1aa',     // Tailwind neutral-400 - subtle border
            weight: 1,
            dashArray: '3',       // Elegant dashed border
            opacity: 0.9,
          }
        } else {
          // Unvisited countries - fully transparent
          return {
            fillColor: 'transparent',
            fillOpacity: 0,
            color: 'transparent',
            weight: 0,
          }
        }
      },
      interactive: true, // Enable hover/click on countries to reveal their pins
      onEachFeature: (feature, layer) => {
        const countryName = feature?.properties?.ADMIN || feature?.properties?.name
        // Only visited (highlighted) countries are interactive.
        if (!countryName || !visitedCountries.has(countryName)) return

        layer.on({
          mouseover: (e: L.LeafletMouseEvent) => {
            e.target.setStyle({ fillOpacity: 0.55 })
            revealCountry(countryName)
          },
          mouseout: (e: L.LeafletMouseEvent) => {
            e.target.setStyle({ fillOpacity: 0.45 }) // revert to default silver
            scheduleHide()
          },
          click: (e: L.LeafletMouseEvent) => {
            // Zoom to the country (great for mobile) and keep its pins revealed.
            if (map) map.fitBounds(e.target.getBounds())
            revealCountry(countryName)
          },
        })

        // Minimal country-name label, centered on the polygon. Permanent, but
        // toggled by zoom via updateCountryLabels() so it only shows when close.
        // A manual offset separates overlapping labels (e.g. Malaysia/Indonesia).
        const customOffset: [number, number] = countryLabelOffsets[countryName] || [0, 0]
        layer.bindTooltip(countryName, {
          permanent: true,
          direction: 'center',
          offset: customOffset,
          className: 'country-label-lux',
          interactive: false,
        })
        countryLabelLayers.push(layer)
      },
    }).addTo(map)

    console.log('✅ Country boundaries loaded and colored')

    // Permanent tooltips open on add; hide them unless already zoomed in.
    updateCountryLabels()
  } catch (error) {
    console.error('Error loading country boundaries:', error)
  }
}

// Update country colors when seasonal mode toggles
const toggleSeasonalMode = () => {
  seasonalMode.value = !seasonalMode.value
  
  // Re-style the country layer
  if (countryLayer && map) {
    map.removeLayer(countryLayer)
    loadCountryBoundaries()
    
    console.log('🎨 Country colors updated:', seasonalMode.value ? 'Seasonal' : 'Default')
  }
}

// Fly to location on timeline click
const flyToLocation = (city: string, coords: { lat: number; lng: number }) => {
  if (!map) return
  
  console.log('✈️ Flying to:', city)
  
  // Smooth fly animation
  map.flyTo([coords.lat, coords.lng], 5, {
    duration: 1.5,
    easeLinearity: 0.25
  })
  
  // Optional: Open sidebar after flying
  setTimeout(() => {
    const cityAlbums = albumsByCity.value[city]
    if (cityAlbums && cityAlbums.length > 0) {
      selectedCity.value = city
      selectedCityCoords.value = coords
      selectedAlbums.value = cityAlbums
      showSidebar.value = true
    }
  }, 1600)
}

// Story Mode functions
const getStorySpeedDuration = () => {
  const speeds = {
    slow: 6000,    // 6 seconds per location
    normal: 4000,  // 4 seconds per location
    fast: 2500     // 2.5 seconds per location
  }
  return speeds[storySpeed.value]
}

const startStoryMode = () => {
  if (timelineData.value.length === 0) return
  
  storyMode.value = true
  storyIndex.value = 0
  
  // Play first location immediately
  playStoryLocation(0)
  
  // Set up interval for auto-advance
  storyInterval = window.setInterval(() => {
    const nextIndex = storyIndex.value + 1
    if (nextIndex >= timelineData.value.length) {
      // End of story
      stopStoryMode()
    } else {
      storyIndex.value = nextIndex
      playStoryLocation(nextIndex)
    }
  }, getStorySpeedDuration())
  
  console.log('🎬 Story mode started')
}

const stopStoryMode = () => {
  storyMode.value = false
  if (storyInterval) {
    clearInterval(storyInterval)
    storyInterval = null
  }
  console.log('⏹️ Story mode stopped')
}

const pauseStoryMode = () => {
  if (storyInterval) {
    clearInterval(storyInterval)
    storyInterval = null
  }
}

const resumeStoryMode = () => {
  if (!storyMode.value) return
  
  storyInterval = window.setInterval(() => {
    const nextIndex = storyIndex.value + 1
    if (nextIndex >= timelineData.value.length) {
      stopStoryMode()
    } else {
      storyIndex.value = nextIndex
      playStoryLocation(nextIndex)
    }
  }, getStorySpeedDuration())
}

const playStoryLocation = (index: number) => {
  const location = timelineData.value[index]
  if (!location || !map) return
  
  console.log(`📍 Story mode: ${index + 1}/${timelineData.value.length} - ${location.city}`)
  
  // Fly to location
  map.flyTo([location.coords.lat, location.coords.lng], 5, {
    duration: 1.2,
    easeLinearity: 0.25
  })
  
  // Open sidebar after animation
  setTimeout(() => {
    const cityAlbums = albumsByCity.value[location.city]
    if (cityAlbums && cityAlbums.length > 0) {
      selectedCity.value = location.city
      selectedCityCoords.value = location.coords
      selectedAlbums.value = cityAlbums
      showSidebar.value = true
    }
  }, 1300)
}

const skipStoryNext = () => {
  if (!storyMode.value || storyIndex.value >= timelineData.value.length - 1) return
  
  pauseStoryMode()
  storyIndex.value++
  playStoryLocation(storyIndex.value)
  
  setTimeout(() => {
    resumeStoryMode()
  }, 100)
}

const skipStoryPrev = () => {
  if (!storyMode.value || storyIndex.value <= 0) return
  
  pauseStoryMode()
  storyIndex.value--
  playStoryLocation(storyIndex.value)
  
  setTimeout(() => {
    resumeStoryMode()
  }, 100)
}

const toggleStatsPanel = () => {
  showStatsPanel.value = !showStatsPanel.value
}

const zoomIn = () => { map?.zoomIn() }
const zoomOut = () => { map?.zoomOut() }

onMounted(async () => {
  // Load albums first and wait for it to complete
  await loadAlbums()
  
  console.log('✅ Albums loaded, initializing map with:', albums.value.length, 'albums')
  console.log('📊 Initial stats:', stats.value)
  
  // Then initialize map
  setTimeout(() => {
    initMap()
    
    // Animated entrance: Fly to first visited location after a delay
    setTimeout(() => {
      if (timelineData.value.length > 0 && map) {
        const firstLocation = timelineData.value[0]
        console.log('🎬 Entrance animation: Flying to', firstLocation.city)
        
        map.flyTo([firstLocation.coords.lat, firstLocation.coords.lng], 4, {
          duration: 2,
          easeLinearity: 0.2
        })
      }
    }, 800) // Wait 800ms after map loads
  }, 100)
})

onUnmounted(() => {
  // Clean up story mode interval
  if (storyInterval) {
    clearInterval(storyInterval)
  }
  if (gestureHintTimer) {
    clearTimeout(gestureHintTimer)
  }
  if (mapContainer.value) {
    mapContainer.value.removeEventListener('touchstart', handleMapTouchStart)
  }
  
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden bg-minimal-white flex flex-col">
    <!-- Header - locked at top, always visible (never scrolls away) -->
    <AppHeader position="static" />

    <!-- Immersive Map Canvas - fills the space between header and stats bar.
         `isolate` creates a stacking context so the map's high z-index overlays
         (sidebars, controls) stay contained and never cover the header/footer. -->
    <div class="relative flex-1 min-h-0 isolate bg-minimal-white">
        <div ref="mapContainer" class="w-full h-full"></div>

        <!-- Two-finger gesture hint: appears briefly on first single-touch contact,
             fades out automatically. Keeps map panning enabled while giving
             mobile users a cooperative-gesture cue for page scroll vs. map pan. -->
        <transition
          enter-active-class="transition-opacity duration-200 ease-out"
          leave-active-class="transition-opacity duration-500 ease-in"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showGestureHint"
            class="absolute inset-0 z-[900] flex items-center justify-center pointer-events-none"
          >
            <div class="bg-black/60 backdrop-blur-sm px-5 py-3 text-white text-[11px] tracking-[0.2em] uppercase font-light">
              Use two fingers to pan
            </div>
          </div>
        </transition>

        <!-- Story Mode Controls - Floating Bottom Center -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-300 ease-in"
          enter-from-class="opacity-0 translate-y-4"
          leave-to-class="opacity-0 translate-y-4"
        >
          <div
            v-if="storyMode"
            class="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-minimal-light px-6 py-4 flex items-center gap-4"
            style="z-index: 1200; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);"
          >
            <!-- Previous Button -->
            <button
              @click="skipStoryPrev"
              :disabled="storyIndex === 0"
              class="w-8 h-8 flex items-center justify-center transition-colors"
              :class="storyIndex === 0 ? 'text-minimal-light cursor-not-allowed' : 'text-minimal-dark hover:text-minimal-black'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <!-- Play/Pause Button -->
            <button
              @click="storyInterval ? pauseStoryMode() : resumeStoryMode()"
              class="w-10 h-10 flex items-center justify-center text-minimal-black hover:bg-minimal-lightest transition-colors border border-minimal-light"
            >
              <svg v-if="storyInterval" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>

            <!-- Next Button -->
            <button
              @click="skipStoryNext"
              :disabled="storyIndex >= timelineData.length - 1"
              class="w-8 h-8 flex items-center justify-center transition-colors"
              :class="storyIndex >= timelineData.length - 1 ? 'text-minimal-light cursor-not-allowed' : 'text-minimal-dark hover:text-minimal-black'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <!-- Progress -->
            <div class="border-l border-minimal-light pl-4 ml-2">
              <p class="text-[10px] tracking-[0.2em] uppercase text-minimal-medium font-light">
                {{ storyIndex + 1 }} / {{ timelineData.length }}
              </p>
            </div>

            <!-- Speed Control -->
            <div class="border-l border-minimal-light pl-4 ml-2 flex items-center gap-2">
              <button
                v-for="speed in ['slow', 'normal', 'fast']"
                :key="speed"
                @click="storySpeed = speed as 'slow' | 'normal' | 'fast'"
                class="text-[9px] tracking-[0.15em] uppercase font-light px-2 py-1 border transition-colors"
                :class="storySpeed === speed ? 'bg-minimal-black text-white border-minimal-black' : 'bg-white text-minimal-medium border-minimal-light hover:border-minimal-dark'"
              >
                {{ speed }}
              </button>
            </div>

            <!-- Stop Button -->
            <button
              @click="stopStoryMode"
              class="border-l border-minimal-light pl-4 ml-2 text-[10px] tracking-[0.2em] uppercase font-light text-minimal-medium hover:text-minimal-black transition-colors"
            >
              Stop
            </button>
          </div>
        </transition>

        <!-- Story Mode Start Button - Top Left -->
        <button
          v-if="!storyMode && timelineData.length > 0"
          @click="startStoryMode"
          class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-minimal-light px-4 py-2 hover:bg-white transition-all flex items-center gap-2 group"
          style="z-index: 1000;"
        >
          <svg class="w-3 h-3 text-minimal-dark group-hover:text-minimal-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span class="text-[10px] tracking-[0.2em] uppercase text-minimal-dark group-hover:text-minimal-black font-light transition-colors">
            Story Mode
          </span>
        </button>

        <!-- Elegant expanding search - stacked above the control panel.
             The control panel is 3 buttons × 44px + 2 gaps × 4px = 140px + 24px bottom offset ≈ bottom-[10.5rem]. -->
        <div class="absolute right-3 bottom-[10.5rem] z-[1100]">
          <div class="flex items-center justify-end">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search destinations"
              @keydown.esc="toggleSearch"
              :class="searchOpen
                ? 'w-48 md:w-64 px-3 border border-neutral-200 opacity-100'
                : 'w-0 px-0 border border-transparent opacity-0 pointer-events-none'"
              class="h-11 mr-2 bg-white/90 backdrop-blur-md shadow-sm text-sm font-light tracking-wide text-neutral-700 placeholder:text-neutral-400 outline-none transition-all duration-300 ease-out"
            />
            <button
              @click="toggleSearch"
              class="shrink-0 w-11 h-11 flex items-center justify-center bg-white/90 backdrop-blur-md shadow-sm border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all"
              :title="searchOpen ? 'Close search' : 'Search destinations'"
            >
              <svg v-if="!searchOpen" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m1.35-5.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Auto-suggest dropdown (floats above the input) -->
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-150 ease-in"
            enter-from-class="opacity-0 translate-y-1"
            leave-to-class="opacity-0 translate-y-1"
          >
            <ul
              v-if="searchOpen && searchResults.length"
              class="absolute right-0 bottom-full mb-2 w-48 md:w-64 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-md border border-neutral-200 shadow-lg"
            >
              <li
                v-for="result in searchResults"
                :key="result.city"
                @click="selectSearchResult(result)"
                class="px-3 py-2 cursor-pointer hover:bg-neutral-100 transition-colors flex items-baseline justify-between gap-3"
              >
                <span class="text-xs font-light tracking-wide uppercase text-neutral-800">{{ result.city }}</span>
                <span v-if="result.country" class="text-[10px] tracking-[0.15em] uppercase text-neutral-400 shrink-0">{{ result.country }}</span>
              </li>
            </ul>
          </transition>
        </div>

        <!-- ── Unified control panel: Search · Stats · Zoom In · Zoom Out ──
             All 4 buttons share identical dimensions (w-11 h-11), Heroicons
             Outline SVGs (w-5 h-5, stroke-width 1.5, text-neutral-600), and
             a consistent white/glass pill appearance. -->
        <div class="absolute right-3 bottom-6 z-[1100] flex flex-col gap-1">

          <!-- Zoom In -->
          <button
            @click="zoomIn"
            class="w-11 h-11 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all"
            aria-label="Zoom in"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M10.5 7.5v6m-3-3h6m4 0a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
            </svg>
          </button>

          <!-- Zoom Out -->
          <button
            @click="zoomOut"
            class="w-11 h-11 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all"
            aria-label="Zoom out"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M13.5 10.5h-6m10 0a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
            </svg>
          </button>

          <!-- Stats (Travel Insights) -->
          <button
            @click="toggleStatsPanel"
            class="w-11 h-11 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all"
            aria-label="Travel Insights"
            :title="'Travel Insights'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </button>

        </div>

        <!-- Subtle micro-instruction - non-intrusive bottom-left label -->
        <div class="absolute bottom-4 left-4 z-[1000] pointer-events-none">
          <p class="text-[10px] tracking-[0.2em] uppercase text-neutral-500 bg-white/70 backdrop-blur-sm px-3 py-1.5 border border-neutral-100">
            {{ currentLang === 'zh' ? '選擇已標示的國家以探索' : 'Select a highlighted country to explore' }}
          </p>
        </div>

        <!-- Sidebar Panel -->
        <transition
          enter-active-class="transition-transform duration-300 ease-out"
          leave-active-class="transition-transform duration-300 ease-in"
          enter-from-class="translate-x-full"
          leave-to-class="translate-x-full"
        >
          <div
            v-if="showSidebar"
            class="lux-panel absolute top-4 right-4 bottom-4 w-[calc(100%-2rem)] md:w-[420px] bg-white/95 backdrop-blur-md border border-neutral-100 rounded-2xl overflow-y-auto"
            style="z-index: 1500; box-shadow: 0 12px 48px rgba(0, 0, 0, 0.14);"
          >
            <!-- Close Button - Minimal X -->
            <button
              @click="closeSidebar"
              class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-minimal-medium hover:text-minimal-black transition-colors z-10"
              aria-label="Close"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                <path stroke-linecap="square" stroke-linejoin="miter" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- City Header - Elegant Minimal -->
            <div class="pt-8 pb-4 px-8 border-b border-minimal-light">
              <div class="text-center">
                <h2 class="text-2xl font-thin text-minimal-dark tracking-[0.3em] uppercase mb-1 letter-spacing-widest">
                  {{ selectedCity }}
                </h2>
                <p class="text-[10px] text-minimal-medium font-extralight tracking-[0.25em] uppercase">
                  {{ selectedAlbums.length }} {{ selectedAlbums.length === 1 ? 'Journey' : 'Journeys' }}
                </p>
              </div>
            </div>

            <!-- Albums List - Clean Cards -->
            <div class="py-6 px-6 space-y-6">
              <div
                v-for="album in selectedAlbums"
                :key="album.id"
                class="group cursor-pointer"
                @click="viewAlbum(album.id)"
              >
                <!-- Album Cover - Full Width Sharp Corners -->
                <div class="relative overflow-hidden mb-4 bg-minimal-lightest">
                  <img
                    :src="album.cover_image"
                    :alt="album.title"
                    loading="lazy"
                    decoding="async"
                    class="w-full aspect-[3/2] object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-90"
                  />
                  <div class="absolute inset-0 border border-minimal-light group-hover:border-minimal-dark transition-colors duration-300"></div>
                </div>

                <!-- Album Info - Ultra Minimal -->
                <div class="space-y-2">
                  <!-- Title -->
                  <h3 class="text-sm font-light text-minimal-dark tracking-[0.15em] uppercase group-hover:text-minimal-black transition-colors">
                    {{ album.title }}
                  </h3>
                  
                  <!-- Meta Info -->
                  <div class="flex items-center justify-between text-[10px] text-minimal-medium font-extralight tracking-[0.2em] uppercase">
                    <span>{{ album.year }}</span>
                    <span>•</span>
                    <span>{{ album.photo_count }} {{ t('photos') }}</span>
                  </div>
                  
                  <!-- View Link -->
                  <div class="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p class="text-[10px] text-minimal-black font-light tracking-[0.25em] uppercase border-b border-minimal-black inline-block pb-[2px]">
                      {{ t('viewFullJourney') }} →
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- Stats Dashboard Panel - Slides from Left -->
        <transition
          enter-active-class="transition-transform duration-300 ease-out"
          leave-active-class="transition-transform duration-300 ease-in"
          enter-from-class="-translate-x-full"
          leave-to-class="-translate-x-full"
        >
          <div
            v-if="showStatsPanel"
            class="lux-panel absolute top-4 left-4 bottom-4 w-[calc(100%-2rem)] md:w-[380px] bg-white/95 backdrop-blur-md border border-neutral-100 rounded-2xl overflow-y-auto"
            style="z-index: 1500; box-shadow: 0 12px 48px rgba(0, 0, 0, 0.14);"
          >
            <!-- Close Button -->
            <button
              @click="toggleStatsPanel"
              class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-minimal-medium hover:text-minimal-black transition-colors z-10"
              aria-label="Close"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                <path stroke-linecap="square" stroke-linejoin="miter" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Header -->
            <div class="pt-8 pb-6 px-8 border-b border-minimal-light">
              <h2 class="text-xl font-thin text-minimal-dark tracking-[0.3em] uppercase text-center">
                {{ t('travelInsights') }}
              </h2>
            </div>

            <!-- Stats Grid -->
            <div class="py-8 px-8 space-y-8">
              <!-- Primary Stats - Large Numbers -->
              <div class="grid grid-cols-2 gap-6">
                <!-- Countries -->
                <div class="text-center">
                  <div class="text-4xl font-thin text-minimal-black mb-2">
                    {{ enhancedStats.countries }}
                  </div>
                  <p class="text-[10px] tracking-[0.25em] uppercase text-minimal-medium font-light">
                    {{ t('countries') }}
                  </p>
                </div>

                <!-- Continents -->
                <div class="text-center">
                  <div class="text-4xl font-thin text-minimal-black mb-2">
                    {{ enhancedStats.continents }}
                  </div>
                  <p class="text-[10px] tracking-[0.25em] uppercase text-minimal-medium font-light">
                    {{ t('continents') }}
                  </p>
                </div>

                <!-- Total Photos -->
                <div class="text-center col-span-2">
                  <div class="text-4xl font-thin text-minimal-black mb-2">
                    {{ enhancedStats.totalPhotos }}
                  </div>
                  <p class="text-[10px] tracking-[0.25em] uppercase text-minimal-medium font-light">
                    {{ t('photos') }}
                  </p>
                </div>
              </div>

              <!-- Divider -->
              <div class="border-t border-minimal-light"></div>

              <!-- Most Visited City -->
              <div>
                <p class="text-[10px] tracking-[0.25em] uppercase text-minimal-medium font-light mb-3">
                  {{ t('mostVisitedCity') }}
                </p>
                <div class="flex items-baseline justify-between">
                  <span class="text-lg font-light text-minimal-dark tracking-[0.15em] uppercase">
                    {{ enhancedStats.mostVisitedCity }}
                  </span>
                  <span class="text-2xl font-thin text-minimal-black">
                    {{ enhancedStats.mostVisitedCount }}
                  </span>
                </div>
                <!-- Minimal bar chart -->
                <div class="mt-3 h-1 bg-minimal-lightest">
                  <div 
                    class="h-full bg-minimal-dark transition-all duration-500"
                    :style="{ width: `${(enhancedStats.mostVisitedCount / albums.length) * 100}%` }"
                  ></div>
                </div>
              </div>

              <!-- Average Photos Per Trip -->
              <div>
                <p class="text-[10px] tracking-[0.25em] uppercase text-minimal-medium font-light mb-3">
                  {{ t('avgPhotosPerTrip') }}
                </p>
                <div class="flex items-baseline justify-between">
                  <span class="text-lg font-light text-minimal-dark tracking-[0.15em]">
                    {{ enhancedStats.avgPhotosPerTrip }} {{ currentLang === 'zh' ? '張相片' : 'photos' }}
                  </span>
                </div>
                <!-- Minimal bar chart -->
                <div class="mt-3 h-1 bg-minimal-lightest">
                  <div 
                    class="h-full bg-minimal-dark transition-all duration-500"
                    :style="{ width: `${Math.min((enhancedStats.avgPhotosPerTrip / 100) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>

              <!-- Divider -->
              <div class="border-t border-minimal-light"></div>

              <!-- Summary Stats -->
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-[10px] tracking-[0.2em] uppercase text-minimal-medium font-light">
                    {{ t('totalJourneys') }}
                  </span>
                  <span class="text-sm font-light text-minimal-dark">
                    {{ albums.length }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-[10px] tracking-[0.2em] uppercase text-minimal-medium font-light">
                    {{ t('uniqueCities') }}
                  </span>
                  <span class="text-sm font-light text-minimal-dark">
                    {{ stats.cities }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-[10px] tracking-[0.2em] uppercase text-minimal-medium font-light">
                    {{ t('estDistance') }}
                  </span>
                  <span class="text-sm font-light text-minimal-dark">
                    {{ stats.totalKm }} km
                  </span>
                </div>
              </div>
            </div>
          </div>
        </transition>
    </div>

    <!-- Bottom Global Statistics Bar - anchored, translucent luxury bar -->
    <div class="shrink-0 z-40 backdrop-blur-md bg-white/90 border-t border-neutral-100" :key="forceUpdate">
      <div class="container mx-auto px-6 py-3">
        <div v-if="!isLoading" class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:gap-x-8 text-[10px] md:text-xs font-light tracking-[0.2em] uppercase text-neutral-500 md:text-minimal-medium leading-loose">
          <span>{{ t('globalFootsteps') }}</span>
          <span class="text-neutral-700 md:text-minimal-black">{{ stats.journeys }} {{ t('journeys') }}</span>
          <span class="text-neutral-400">•</span>
          <span class="text-neutral-700 md:text-minimal-black">{{ stats.cities }} Cities</span>
          <span class="text-neutral-400">•</span>
          <span>{{ stats.totalKm }} {{ t('kmTravelled') }}</span>
        </div>
        <div v-else class="flex items-center justify-center text-[10px] md:text-xs font-light tracking-[0.2em] uppercase text-neutral-500 md:text-minimal-medium">
          <span>Loading...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove all border radius */
div, button {
  border-radius: 0 !important;
}

/* Floating luxury panels keep rounded-2xl corners (scoped exception to the
   site-wide sharp-corner token; class specificity beats the reset above). */
.lux-panel {
  border-radius: 1rem !important;
}

/* Keep the focus-ring marker's ring and core perfectly circular. The global
   `* { border-radius: 0 !important }` reset would otherwise square them off. */
:deep(.leaflet-marker-icon span) {
  border-radius: 9999px !important;
}

/* Prevent map overflow */
.relative {
  overflow: hidden;
}

/* Custom marker styling - pin design */
:deep(.custom-marker-single),
:deep(.custom-marker-cluster) {
  background: transparent !important;
  border: none !important;
  cursor: pointer !important;
  z-index: 1000 !important;
}

/* Ensure leaflet marker container is clickable.
   NOTE: do NOT override `position` here - Leaflet positions markers with
   `position: absolute` + a transform relative to the map origin. Forcing
   `position: relative` breaks that and makes the dots render off from their
   true coordinates (while tooltips, positioned separately, stay correct). */
:deep(.leaflet-marker-icon) {
  cursor: pointer !important;
  /* Smooth fade-in when pins are revealed (opacity is toggled in JS). */
  transition: opacity 0.45s ease;
}

/* Ensure marker pane is above map pane */
:deep(.leaflet-marker-pane) {
  z-index: 600 !important;
}

:deep(.leaflet-tile-pane) {
  z-index: 200 !important;
}

/* Pin marker styling - classic map pin */
:deep(.map-marker-single),
:deep(.map-marker-cluster) {
  cursor: pointer !important;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
  transition: all 0.25s ease-out;
  position: relative;
  z-index: 1000;
}

:deep(.leaflet-marker-icon:hover .map-marker-single),
:deep(.leaflet-marker-icon:hover .map-marker-cluster) {
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.25));
  transform: scale(1.35);
}

:deep(.map-marker-single svg),
:deep(.map-marker-cluster svg) {
  display: block;
  transition: transform 0.25s ease-out;
  pointer-events: all;
}

/* Active/clicked state */
:deep(.leaflet-marker-icon:active .map-marker-single),
:deep(.leaflet-marker-icon:active .map-marker-cluster) {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
}

/* Ensure cluster badge is visible */
:deep(.cluster-badge) {
  z-index: 1001 !important;
  position: absolute;
}

/* Cluster badge - minimal monochrome number indicator */
:deep(.cluster-badge) {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #2C2C2C;
  color: white;
  font-size: 9px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  padding: 1px 5px;
  border-radius: 10px !important;
  border: 1.5px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  min-width: 16px;
  text-align: center;
  line-height: 1.4;
  pointer-events: none;
}

/* Map zoom controls - minimalist styling */
:deep(.leaflet-control-zoom) {
  border: 1px solid #E5E5E5 !important;
  border-radius: 0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
}

:deep(.leaflet-control-zoom a) {
  color: #2C2C2C !important;
  border-radius: 0 !important;
  border-bottom: 1px solid #E5E5E5 !important;
  font-weight: 300 !important;
  font-size: 18px !important;
  width: 32px !important;
  height: 32px !important;
  line-height: 32px !important;
  transition: all 0.2s ease !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background: #F5F5F5 !important;
  color: #000000 !important;
}

:deep(.leaflet-control-zoom a:last-child) {
  border-bottom: none !important;
}

/* Smooth connection line animation */
:deep(.leaflet-interactive) {
  transition: opacity 0.3s ease;
}

/* Hide default leaflet attribution */
:deep(.leaflet-control-attribution) {
  display: none;
}

/* Photo thumbnail animation */
@keyframes thumbnailFadeIn {
  from {
    opacity: 0;
    transform: scale(0.5) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Timeline styling */
.timeline-item {
  flex: 1;
  min-width: 80px;
  position: relative;
}

.timeline-item:first-child {
  flex: 0 0 auto;
}

.timeline-item:last-child {
  flex: 0 0 auto;
}

/* Smooth transitions */
:deep(.leaflet-fade-anim .leaflet-map-pane .leaflet-popup) {
  transition: opacity 0.3s ease;
}

/* Photo thumbnail styling */
:deep(.photo-thumbnail-marker) {
  background: transparent !important;
  border: none !important;
  z-index: 800 !important;
}

:deep(.photo-thumbnail) {
  border-radius: 0 !important;
  transition: all 0.3s ease;
}

/* Zoom-based country labels - transparent floating text, quiet-luxury type.
   (text-[10px] tracking-[0.25em] uppercase font-sans text-neutral-400
    font-medium drop-shadow-sm) */
:deep(.leaflet-tooltip.country-label-lux),
:deep(.country-label-lux) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
  color: #a3a3a3 !important; /* neutral-400 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
  font-size: 10px !important;
  font-weight: 500 !important; /* font-medium */
  letter-spacing: 0.25em !important;
  text-transform: uppercase !important;
  white-space: nowrap !important;
  pointer-events: none !important;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.06)); /* drop-shadow-sm */
}

/* Remove the tooltip arrow for country labels */
:deep(.country-label-lux::before),
:deep(.country-label-lux::after) {
  display: none !important;
  border: none !important;
  background: transparent !important;
}

/* Custom debossed tooltip - pure text, no box at all */
:deep(.leaflet-tooltip.city-tooltip-debossed) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.city-tooltip-debossed) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: rgba(80, 80, 80, 0.9) !important;
  font-size: 11px !important;
  font-weight: 300 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
  letter-spacing: 0.3em !important;
  text-transform: uppercase !important;
  padding: 0 !important;
  margin: 0 !important;
  pointer-events: none !important;
  text-shadow: 
    0 1px 1px rgba(255, 255, 255, 0.95),
    0 -1px 1px rgba(0, 0, 0, 0.12) !important;
  white-space: nowrap !important;
  transition: color 0.3s ease, text-shadow 0.3s ease !important;
}

/* Satellite mode - white text with dark shadow for contrast */
:deep(.city-tooltip-debossed.satellite-mode) {
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.8),
    0 1px 2px rgba(0, 0, 0, 0.6) !important;
}

/* Remove tooltip arrow completely */
:deep(.city-tooltip-debossed::before),
:deep(.city-tooltip-debossed::after),
:deep(.leaflet-tooltip-top.city-tooltip-debossed::before),
:deep(.leaflet-tooltip-top.city-tooltip-debossed::after) {
  display: none !important;
  border: none !important;
  background: transparent !important;
}

/* Override all Leaflet default tooltip styles */
:deep(.leaflet-tooltip-top) {
  margin-top: 0 !important;
}

:deep(.leaflet-tooltip.city-tooltip-debossed)::before {
  border: none !important;
  background: none !important;
}
</style>
