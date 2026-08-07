<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import PhotoCard from '@/components/gallery/PhotoCard.vue'
import LoadMoreButton from '@/components/ui/LoadMoreButton.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import FooterSection from '@/components/layout/FooterSection.vue'
import SocialIconLinks from '@/components/ui/SocialIconLinks.vue'
import ScrollReveal from '@/components/ui/ScrollReveal.vue'
import { useLanguage } from '@/composables/useLanguage'
import { albumService } from '@/services/albumService'
import type { Album } from '@/lib/supabase'

const router = useRouter()
const { t, getContinentName, currentLang } = useLanguage()

interface Photo {
  id: string
  albumId: string
  title: string
  location: string
  continent: string
  image: string
  placeholder_b64?: string // LQIP for album covers
  aspect: 'landscape' | 'portrait' | 'square'
  featured: boolean
  year?: number
}

const photos = ref<Photo[]>([])
const loading = ref(true)
const isMobile = ref(false)

// Sliding active indicator for the category filter bar
const filterBarRef = ref<HTMLElement | null>(null)
const filterButtonRefs = ref<HTMLElement[]>([])
const indicatorStyle = ref({ width: '0px', transform: 'translate(0px, 0px)', opacity: 0 })

const setFilterButtonRef = (el: any, index: number) => {
  if (el) filterButtonRefs.value[index] = el as HTMLElement
}

// Measure the currently active filter button and position the sliding
// underline indicator directly beneath it, relative to the filter bar.
const updateIndicatorPosition = () => {
  const container = filterBarRef.value
  const activeIndex = continentKeys.indexOf(selectedContinent.value)
  const activeButton = filterButtonRefs.value[activeIndex]

  if (!container || !activeButton) return

  const containerRect = container.getBoundingClientRect()
  const buttonRect = activeButton.getBoundingClientRect()

  // Account for the filter bar wrapping onto multiple lines on narrow
  // viewports - track both axes so the indicator always sits directly
  // under the active button, on whichever row it lands on.
  const offsetX = buttonRect.left - containerRect.left
  const offsetY = buttonRect.bottom - containerRect.top - 1 // sit just below the button's own row

  indicatorStyle.value = {
    width: `${buttonRect.width}px`,
    transform: `translate(${offsetX}px, ${offsetY}px)`,
    opacity: 1,
  }
}

// Pagination state - show 20 albums initially, load more on demand
const albumsPerPage = 20
const displayCount = ref(albumsPerPage)
const loadingMore = ref(false)

// Load albums from Supabase
const loadAlbums = async () => {
  try {
    loading.value = true
    const albums = await albumService.getAll()
    
    // Convert albums to photo format for portfolio view
    photos.value = albums.map((album: Album) => ({
      id: album.id,
      albumId: album.id,
      title: album.title,
      location: album.location,
      continent: album.continent,
      image: album.cover_image,
      placeholder_b64: album.cover_placeholder_b64, // Pass LQIP
      aspect: 'landscape' as const,
      featured: false,
      year: album.year,
    }))
  } catch (error) {
    console.error('Error loading albums:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAlbums()
})

// Language-independent continent keys. The active selection is keyed on these
// stable values (never the localized label), so toggling EN <-> 繁 can never
// desync the active state or the sliding-underline measurement.
const continentKeys = [
  'All', 'Africa', 'Antarctica', 'Asia', 'Europe',
  'North America', 'Oceania', 'South America',
] as const

// Localized label for a continent key; reactively follows the language.
const continentLabel = (key: string) => (key === 'All' ? t('all') : getContinentName(key))

const selectedContinent = ref<string>('All')

const filteredPhotos = computed(() => {
  if (selectedContinent.value === 'All') {
    return photos.value
  }
  return photos.value.filter((p) => p.continent === selectedContinent.value as string)
})

// Only show a slice of the filtered albums; rest load in on "Load More"
const displayedPhotos = computed(() => filteredPhotos.value.slice(0, displayCount.value))
const hasMoreAlbums = computed(() => displayCount.value < filteredPhotos.value.length)

// Mobile-only: same slice sorted newest-first by year. Desktop uses the
// original insertion order from Supabase via displayedPhotos above.
const mobileDisplayedPhotos = computed(() =>
  [...displayedPhotos.value].sort((a, b) => (b.year ?? 0) - (a.year ?? 0)),
)

// Reset pagination whenever the continent filter changes, and glide the
// sliding indicator to the newly selected category.
const selectContinent = (continent: string) => {
  selectedContinent.value = continent
  displayCount.value = albumsPerPage
  nextTick(updateIndicatorPosition)
}

const loadMoreAlbums = () => {
  loadingMore.value = true
  // Small delay so the loading state is visible (albums are already fetched, just revealing more)
  setTimeout(() => {
    displayCount.value = Math.min(displayCount.value + albumsPerPage, filteredPhotos.value.length)
    loadingMore.value = false
  }, 200)
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const handleResize = () => {
  checkMobile()
  updateIndicatorPosition()
}

// Watches the filter bar's size so the underline re-measures whenever label
// widths change (language toggle, late-loading CJK glyphs, wrapping/resize).
let filterResizeObserver: ResizeObserver | null = null

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
  nextTick(updateIndicatorPosition)

  if (filterBarRef.value && 'ResizeObserver' in window) {
    filterResizeObserver = new ResizeObserver(() => updateIndicatorPosition())
    filterResizeObserver.observe(filterBarRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  filterResizeObserver?.disconnect()
  filterResizeObserver = null
})

// Re-measure the indicator when the language changes. The active button keeps
// the same key/index, but its label width changes (e.g. "ANTARCTICA" -> "南極洲"),
// so the underline must be recomputed once the new text has painted. A double
// rAF waits for layout of the freshly swapped labels (incl. late CJK glyphs).
watch(currentLang, async () => {
  await nextTick()
  requestAnimationFrame(() => requestAnimationFrame(updateIndicatorPosition))
})

const handlePhotoClick = (photo: Photo) => {
  // Navigate to album detail page
  router.push(`/album/${photo.albumId}`)
}
</script>

<template>
  <div class="min-h-screen bg-minimal-white">
    <!-- Header Section -->
    <AppHeader />

    <!-- Main Content -->
    <main class="container-minimal py-6">
      <!-- Page Subtitle - Editorial serif banner, distinct from the sans-serif catalog index below -->
      <div class="mt-4 mb-6 text-center">
        <p class="font-serif italic font-normal text-base md:text-lg text-neutral-400 tracking-widest uppercase">
          {{ t('portfolioSubtitle') }}
        </p>
      </div>

      <!-- Filters -->
      <div ref="filterBarRef" class="relative mb-6 pb-1 flex flex-wrap justify-center gap-x-6 gap-y-2 md:gap-x-8 md:gap-y-4">
        <button
          v-for="(key, index) in continentKeys"
          :key="key"
          :ref="(el) => setFilterButtonRef(el, index)"
          class="py-2 text-xs tracking-wide uppercase font-sans font-light transition-colors duration-300"
          :class="selectedContinent === key
            ? 'text-minimal-black'
            : 'text-neutral-400 hover:text-minimal-black'"
          @click="selectContinent(key)"
        >
          {{ continentLabel(key) }}
        </button>

        <!-- Sliding active indicator - glides beneath the selected category.
             Anchored to the container's top-left; translateX/Y position it
             under whichever button (and row) is currently active. -->
        <span
          class="absolute top-0 left-0 h-px bg-minimal-black transition-all duration-300 ease-out pointer-events-none"
          :style="{
            width: indicatorStyle.width,
            transform: indicatorStyle.transform,
            opacity: indicatorStyle.opacity,
          }"
        ></span>
      </div>

      <!-- Loading State with Skeleton -->
      <div v-if="loading" class="container-minimal">
        <!-- Skeleton Grid -->
        <div class="grid-masonry" v-if="!isMobile">
          <div 
            v-for="n in 6" 
            :key="`skeleton-${n}`"
            class="masonry-item mb-0"
          >
            <div class="relative aspect-[4/3] bg-minimal-light animate-pulse">
              <div class="absolute inset-0 bg-gradient-to-r from-minimal-light via-white to-minimal-light bg-[length:200%_100%] animate-shimmer"></div>
            </div>
          </div>
        </div>
        <div v-else class="grid grid-cols-1 px-4 gap-3">
          <div
            v-for="n in 6"
            :key="`skeleton-mobile-${n}`"
            class="aspect-[4/3] bg-minimal-light animate-pulse"
          ></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredPhotos.length === 0" class="text-center py-20">
        <p class="text-xl font-light text-minimal-dark mb-4">{{ t('noAlbumsYet') }}</p>
        <p class="text-sm text-minimal-medium font-light">{{ t('checkBackSoon') }}</p>
      </div>

      <!-- Desktop: Masonry Gallery with Optimized Loading -->
      <div v-else-if="!isMobile" class="grid-masonry">
        <div
          v-for="(photo, index) in displayedPhotos"
          :key="photo.id"
          class="masonry-item"
        >
          <PhotoCard
            :photo="photo"
            :show-info="true"
            :priority="index < 4"
            @click="handlePhotoClick"
          />
        </div>
      </div>

      <!-- Mobile: Single-column elegant gallery with padding, sorted newest first.
           Each album fades up as it enters the viewport (ScrollReveal). -->
      <div v-else class="grid grid-cols-1 px-4 gap-4">
        <ScrollReveal
          v-for="(photo, index) in mobileDisplayedPhotos"
          :key="photo.id"
          class="mb-16"
        >
          <PhotoCard
            :photo="photo"
            :force-square="false"
            :show-info="true"
            :priority="index < 4"
            @click="handlePhotoClick"
          />
        </ScrollReveal>
      </div>

      <!-- Load More Button -->
      <LoadMoreButton
        v-if="!loading && hasMoreAlbums"
        :loading="loadingMore"
        :current-count="displayedPhotos.length"
        :total-count="filteredPhotos.length"
        item-label="albums"
        @load-more="loadMoreAlbums"
      />
    </main>

    <!-- Footer -->
    <FooterSection />
  </div>
</template>

<style scoped>
/* Masonry grid for desktop - NO GAPS */
.grid-masonry {
  column-count: 3;
  column-gap: 0;
}

@media (max-width: 1280px) {
  .grid-masonry {
    column-count: 3;
  }
}

@media (max-width: 1024px) {
  .grid-masonry {
    column-count: 2;
  }
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 0;
}

/* Skeleton loading shimmer animation */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
}

/* Ensure no border radius */
div, button, a {
  border-radius: 0 !important;
}
</style>
