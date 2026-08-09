<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseImage from '@/components/ui/BaseImage.vue'
import LoadMoreButton from '@/components/ui/LoadMoreButton.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useLanguage } from '@/composables/useLanguage'
import { albumService } from '@/services/albumService'
import { photoService } from '@/services/photoService'
import type { Album, Photo } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()
const { t, getContinentName, currentLang } = useLanguage()

const album = ref<Album | null>(null)
const photos = ref<Photo[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const currentPhotoIndex = ref<number | null>(null)
const isLightboxOpen = ref(false)
const viewMode = ref<'grid' | 'story'>('grid')

// Story mode renders heavy full-height images one after another, so we render
// only a window at a time and load more on demand — just like the grid does.
// This prevents the browser from building a 100+-node DOM of large images all
// at once when switching modes, which was the cause of the crash.
const STORY_PAGE_SIZE = 20
const storyLimit = ref(STORY_PAGE_SIZE)

// The photos currently visible in Story mode.
const storyPhotos = computed(() => photos.value.slice(0, storyLimit.value))
const hasMoreStoryPhotos = computed(() => storyLimit.value < photos.value.length)

const loadMoreStoryPhotos = () => {
  storyLimit.value = Math.min(storyLimit.value + STORY_PAGE_SIZE, photos.value.length)
}

// On every mode switch: reset the Story window AND scroll to the top so the
// user never lands mid-page with stale DOM from the previous mode.
watch(viewMode, () => {
  storyLimit.value = STORY_PAGE_SIZE
  window.scrollTo({ top: 0, behavior: 'instant' })
})

// Pagination state
const totalPhotos = ref(0)
const hasMorePhotos = ref(false)
const photosPerPage = 30
const currentOffset = ref(0)

// Check if pagination is needed
const shouldPaginate = computed(() => {
  return album.value && album.value.photo_count > photosPerPage
})

// Load album data from Supabase
const loadAlbumData = async () => {
  try {
    loading.value = true
    const albumId = route.params.id as string
    
    // Load album
    album.value = await albumService.getById(albumId)

    // Load initial photos with pagination if needed
    if (album.value.photo_count > photosPerPage) {
      const result = await photoService.getByAlbumIdPaginated(albumId, photosPerPage, 0)
      photos.value = result.photos
      totalPhotos.value = result.total
      hasMorePhotos.value = result.hasMore
      currentOffset.value = photosPerPage
    } else {
      // Load all photos if less than pagination threshold
      photos.value = await photoService.getByAlbumId(albumId)
      totalPhotos.value = photos.value.length
      hasMorePhotos.value = false
    }
  } catch (error) {
    console.error('Error loading album:', error)
    router.push('/portfolio')
  } finally {
    loading.value = false
  }
}

// Load more photos
const loadMorePhotos = async () => {
  if (!album.value || loadingMore.value || !hasMorePhotos.value) return

  try {
    loadingMore.value = true
    const albumId = route.params.id as string

    const result = await photoService.getByAlbumIdPaginated(
      albumId,
      photosPerPage,
      currentOffset.value
    )

    photos.value = [...photos.value, ...result.photos]
    hasMorePhotos.value = result.hasMore
    currentOffset.value += result.photos.length
  } catch (error) {
    console.error('Error loading more photos:', error)
  } finally {
    loadingMore.value = false
  }
}

// Get caption in current language
const getCaption = (photo: Photo) => {
  if (currentLang.value === 'zh' && photo.caption_zh) {
    return photo.caption_zh
  }
  return photo.caption_en || ''
}

// Get description in current language
const getDescription = (photo: Photo) => {
  if (currentLang.value === 'zh' && photo.description_zh) {
    return photo.description_zh
  }
  return photo.description_en || ''
}

onMounted(() => {
  loadAlbumData()
})

// Keyboard navigation for lightbox
const handleKeydown = (e: KeyboardEvent) => {
  if (!isLightboxOpen.value) return
  
  if (e.key === 'Escape') {
    closeLightbox()
  } else if (e.key === 'ArrowLeft') {
    previousPhoto()
  } else if (e.key === 'ArrowRight') {
    nextPhoto()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const openLightbox = (index: number) => {
  currentPhotoIndex.value = index
  isLightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  isLightboxOpen.value = false
  currentPhotoIndex.value = null
  document.body.style.overflow = ''
}

const nextPhoto = async () => {
  if (currentPhotoIndex.value === null) return

  const nextIndex = currentPhotoIndex.value + 1

  // BOUNDARY CHECK: Disable loop-around — freeze at the last photo
  if (nextIndex >= photos.value.length) {
    // If we have more photos on the server, try to load them
    if (hasMorePhotos.value) {
      await loadMorePhotos()
      // After loading, check again if we can advance
      if (nextIndex < photos.value.length) {
        currentPhotoIndex.value = nextIndex
      }
      // Otherwise stay put (we're at the true end)
    }
    // If no more photos available, do nothing (freeze at last photo)
    return
  }

  currentPhotoIndex.value = nextIndex
}

const previousPhoto = () => {
  if (currentPhotoIndex.value === null) return
  
  // BOUNDARY CHECK: Disable loop-around — freeze at the first photo
  if (currentPhotoIndex.value === 0) {
    return  // Do nothing, stay at first photo
  }
  
  currentPhotoIndex.value = currentPhotoIndex.value - 1
}

const currentPhoto = computed(() => {
  if (currentPhotoIndex.value !== null && photos.value) {
    return photos.value[currentPhotoIndex.value]
  }
  return null
})

// Editorial paragraph parser for the mobile lightbox.
// Splits the description on blank lines and classifies each chunk:
//   'quote'    — line that opens with a quotation mark (pull quote styling)
//   'meta'     — line that looks like camera metadata (LEICA · 35MM · f/1.4)
//   'body'     — everything else
interface DescParagraph {
  type: 'body' | 'quote' | 'meta'
  text: string
}

const parseDescription = (raw: string): DescParagraph[] => {
  if (!raw) return []
  return raw
    .split(/\n\s*\n/)           // split on blank lines
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .map((chunk): DescParagraph => {
      // Camera metadata: contains common patterns like f/, mm, ISO, ·
      if (/\b(f\/|mm\b|ISO\s?\d|LEICA|FUJI|SONY|NIKON|CANON)/i.test(chunk)) {
        return { type: 'meta', text: chunk }
      }
      // Pull quote: starts with a quotation mark
      if (/^["「『〝❝]/.test(chunk)) {
        return { type: 'quote', text: chunk }
      }
      return { type: 'body', text: chunk }
    })
}

const mobileParagraphs = computed(() =>
  parseDescription(currentPhoto.value ? getDescription(currentPhoto.value) : ''),
)

const goBack = () => {
  router.push('/portfolio')
}

// ── Mobile swipe navigation in the lightbox ───────────────────────────────
// Swipe left  → next photo
// Swipe right → previous photo
// Edge protection: if the touch starts within 40px of the left screen edge,
// pass through without intercepting so iOS "swipe back" still works.
const SWIPE_MIN = 50         // minimum px of horizontal movement to count
const EDGE_GUARD = 40        // px from left edge that we leave to the browser

let swipeTouchStartX = 0
let swipeTouchStartY = 0
let isSwiping = false        // flag to prevent tap-click at end of swipe

const onLightboxTouchStart = (e: TouchEvent) => {
  swipeTouchStartX = e.touches[0].clientX
  swipeTouchStartY = e.touches[0].clientY
  isSwiping = false
}

const onLightboxTouchEnd = (e: TouchEvent) => {
  // Ignore if started in the left-edge zone (let browser handle back gesture)
  if (swipeTouchStartX < EDGE_GUARD) return

  const dx = e.changedTouches[0].clientX - swipeTouchStartX
  const dy = e.changedTouches[0].clientY - swipeTouchStartY

  // Only register as a horizontal swipe if X movement dominates
  if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy)) return

  // Mark as swiping to prevent click handler from firing
  isSwiping = true

  // REVERSED SWIPE DIRECTION:
  // Swipe right (finger moves right) → next photo
  // Swipe left (finger moves left) → previous photo
  if (dx > 0) {
    nextPhoto()       // swipe right → forward
  } else {
    previousPhoto()   // swipe left → back
  }

  // Reset flag after a short delay (longer than typical click event timing)
  setTimeout(() => { isSwiping = false }, 300)
}

// ── Instagram-style tap navigation ────────────────────────────────────────
// Tap left half of screen → previous photo
// Tap right half of screen → next photo
// Respects boundary locks and ignores interactive elements (buttons, links)
const onMobileLightboxClick = (e: MouseEvent) => {
  // Ignore if we just finished a swipe gesture
  if (isSwiping) return

  // Ignore clicks on interactive elements (buttons, links)
  const target = e.target as HTMLElement
  if (target.closest('button, a')) return

  // Calculate if click is on left or right half of screen
  const clickX = e.clientX
  const screenMidpoint = window.innerWidth / 2

  if (clickX < screenMidpoint) {
    previousPhoto()  // Left half → previous
  } else {
    nextPhoto()      // Right half → next
  }
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'story' : 'grid'
}

// Album title: swap full-width/half-width commas for an elegant middle dot
// so bilingual titles read as an editorial masthead, e.g. "東京 · 熱".
const formattedTitle = computed(() =>
  (album.value?.title ?? '').replace(/\s*[，,]\s*/g, ' · '),
)

// Total photos in the album, used for the metadata subtitle ("30 PHOTOS").
const totalPhotoCount = computed(
  () => album.value?.photo_count ?? totalPhotos.value ?? photos.value.length,
)
</script>

<template>
  <!-- Loading State -->
  <div v-if="loading" class="min-h-screen bg-minimal-white flex items-center justify-center">
    <p class="text-minimal-medium font-light tracking-wide">Loading album...</p>
  </div>

  <!-- Album Content -->
  <div v-else-if="album" class="min-h-screen bg-minimal-white">
    <!-- Header -->
    <AppHeader position="fixed">
      <template #left>
        <!--
          "Magic Morph" back button:
          Arrow and airplane are absolutely stacked at the exact same center
          inside a fixed w-6 h-6 box, so cross-fading between them never shifts
          layout or leaves whitespace. On hover the arrow fades out with a
          subtle -8px nudge while the airplane fades in from a slight offset
          to rest at the same -8px position - a contained, local cross-fade.
        -->
            <button
              class="back-nudge-btn group inline-flex items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none cursor-pointer text-neutral-700 transition-all duration-200 ease-in-out opacity-70 hover:opacity-100 active:scale-95 active:opacity-50 active:-translate-x-1"
              @click="goBack"
              aria-label="Back to portfolio"
            >
              <span class="relative w-6 h-6 flex items-center justify-center">
                <!-- Arrow - visible at rest, fades + nudges left on hover -->
                <svg
                  class="absolute inset-0 w-6 h-6 opacity-100 translate-x-0 transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:-translate-x-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke="currentColor"
                    stroke-width="1.5"
                    d="M19 12H5m0 0l6-6m-6 6l6 6"
                  />
                </svg>
                <!-- Paper airplane - hidden at rest, fades in and settles on hover -->
                <svg
                  class="absolute inset-0 w-6 h-6 opacity-0 translate-x-1 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:-translate-x-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M2 12L22 4L15 12L22 20L2 12Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2 12L15 12"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
            </button>
      </template>
      <template #right>
            <!-- View Mode Toggle -->
            <button
              class="hidden md:flex items-center space-x-2 text-xs tracking-wide uppercase font-light text-minimal-medium hover:text-minimal-black transition-colors"
              @click="toggleViewMode"
            >
              <svg 
                v-if="viewMode === 'story'"
                class="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" 
                />
              </svg>
              <svg 
                v-else
                class="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" 
                />
              </svg>
              <span>{{ viewMode === 'story' ? t('story') : t('grid') }}</span>
            </button>
      </template>
    </AppHeader>

    <!-- Main Content -->
    <main class="pt-20 pb-16">
      <!-- Album Header -->
      <div class="container-minimal mt-8">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="album-title font-light text-3xl md:text-4xl tracking-widest text-neutral-900 mb-6">
            {{ formattedTitle }}
          </h1>
          <p class="text-sm text-minimal-medium font-light tracking-wide leading-relaxed">
            {{ album.description }}
          </p>
          <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs tracking-[0.2em] uppercase text-neutral-400 font-sans mt-4 mb-12">
            <span>{{ totalPhotoCount }} {{ t('photos') }}</span>
            <span aria-hidden="true">•</span>
            <span>{{ album.year }}</span>
            <span aria-hidden="true">•</span>
            <span>{{ album.location }}</span>
            <span aria-hidden="true">•</span>
            <span>{{ getContinentName(album.continent) }}</span>
          </div>
        </div>
      </div>

      <!-- Instagram-Style Grid View -->
      <div v-if="viewMode === 'grid'" class="container-minimal">
        <!-- Clean gallery grid: 4 columns desktop / 3 mobile, 12px micro-gap -->
        <div class="grid grid-cols-3 md:grid-cols-4 gap-3">
          <div
            v-for="(photo, index) in photos"
            :key="photo.id"
            class="photo-tile relative aspect-square overflow-hidden cursor-pointer group bg-white rounded-lg transition-transform duration-300 ease-out hover:scale-[1.01]"
            @click="openLightbox(index)"
          >
            <BaseImage
              :photo="photo"
              :alt="getCaption(photo) || `Photo ${index + 1}`"
              :index="index"
              :priority="index < 12"
              aspect-ratio="square"
              variant="medium"
              class="w-full h-full"
            />
            
            <!-- Hover Overlay (no text, just dark overlay) -->
            <div
              class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 ease-in-out pointer-events-none"
            >
            </div>
          </div>
        </div>

        <!-- Load More Button (Grid View) -->
        <LoadMoreButton
          v-if="shouldPaginate && hasMorePhotos"
          :loading="loadingMore"
          :current-count="photos.length"
          :total-count="totalPhotos"
          @load-more="loadMorePhotos"
        />

        <!-- Empty State for albums without photos yet -->
        <div v-if="photos.length === 0" class="text-center py-20">
          <p class="text-minimal-medium font-light tracking-wide">
            This album is being prepared. {{ album.photo_count }} photos coming soon.
          </p>
        </div>
      </div>

      <!-- Story Layout View -->
      <div v-else class="max-w-5xl mx-auto px-4 md:px-6 space-y-12 md:space-y-16">
        <div
          v-for="(photo, index) in storyPhotos"
          :key="photo.id"
          class="group"
        >
          <!-- Photo -->
          <div 
            class="relative overflow-hidden cursor-pointer mb-6"
            @click="openLightbox(index)"
          >
            <div class="relative overflow-hidden transition-transform duration-700 ease-out transform group-hover:scale-105">
              <BaseImage
                :photo="photo"
                :alt="getCaption(photo) || `Photo ${index + 1}`"
                :index="index"
                :priority="index < 3"
                aspect-ratio="auto"
                variant="large"
                class="w-full h-auto"
              />
            </div>
            
            <!-- Hover Overlay -->
            <div
              class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 ease-in-out flex items-center justify-center pointer-events-none"
            >
              <svg 
                class="w-12 h-12 text-minimal-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                fill="none" 
                stroke="currentColor" 
                stroke-width="1"
                viewBox="0 0 24 24"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" 
                />
              </svg>
            </div>
          </div>

          <!-- Photo Caption & Description -->
          <div v-if="getCaption(photo) || getDescription(photo)" class="max-w-3xl mx-auto px-4">
            <h3
              v-if="getCaption(photo)"
              class="text-base md:text-lg font-normal text-minimal-black tracking-wide mb-2"
            >
              {{ getCaption(photo) }}
            </h3>
            <div v-if="getDescription(photo)" class="relative pt-2 pb-4">
              <!-- Opening Quote -->
              <span class="hidden md:block absolute -left-8 top-0 text-4xl text-minimal-medium font-serif leading-none opacity-40">"</span>
              <p class="text-sm text-minimal-dark font-normal leading-relaxed tracking-wide whitespace-pre-line pl-2 md:pl-2">
                {{ getDescription(photo) }}
              </p>
              <!-- Closing Quote -->
              <span class="hidden md:block absolute -right-8 bottom-0 text-4xl text-minimal-medium font-serif leading-none opacity-40">"</span>
            </div>
          </div>
        </div>

        <!-- Load More (Story) - shows more from the already-fetched window, then
             falls through to fetching the next server page if needed. -->
        <div v-if="hasMoreStoryPhotos || (shouldPaginate && hasMorePhotos)" class="text-center py-8">
          <button
            class="text-xs tracking-[0.25em] uppercase font-light text-neutral-500 hover:text-neutral-900 transition-colors duration-300 border-b border-neutral-300 pb-0.5"
            @click="hasMoreStoryPhotos ? loadMoreStoryPhotos() : loadMorePhotos()"
          >
            {{ t('loadMore') }}
          </button>
        </div>

        <!-- Empty State for albums without photos yet -->
        <div v-if="photos.length === 0" class="text-center py-20">
          <p class="text-minimal-medium font-light tracking-wide">
            This album is being prepared. {{ album.photo_count }} photos coming soon.
          </p>
        </div>
      </div>
    </main>

    <!-- Lightbox -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-in-out"
      leave-active-class="transition-opacity duration-300 ease-in-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isLightboxOpen && currentPhoto"
        class="fixed inset-0 z-50"
      >
        <!-- ─────────────────────────────────────────────────────────────
             MOBILE  (<md): white bg, full-screen, outer scroll handles
                     everything — image cap at 50vh, then text flows below.
             DESKTOP (≥md): black bg, no-scroll, side-by-side 75/25 split.
             ───────────────────────────────────────────────────────────── -->

        <!-- MOBILE MODAL ------------------------------------------------ -->
        <div
          class="md:hidden fixed inset-0 z-50 h-[100dvh] w-full overflow-y-auto bg-white flex flex-col"
          @click="onMobileLightboxClick"
          @touchstart.passive="onLightboxTouchStart"
          @touchend.passive="onLightboxTouchEnd"
        >
          <!-- Image area: max 50vh, never cropped -->
          <div
            class="relative w-full max-h-[50vh] flex-shrink-0 bg-neutral-100 flex items-center justify-center overflow-hidden"
          >
            <BaseImage
              :photo="currentPhoto"
              :alt="getCaption(currentPhoto) || 'Photo'"
              :priority="true"
              aspect-ratio="auto"
              variant="medium"
              :lazy="false"
              object-fit="contain"
              class="w-full h-full object-contain"
              style="max-width:100%; max-height:50vh;"
            />
            <!-- Counter: pinned to bottom-right of image, always visible -->
            <div class="absolute bottom-3 right-3 z-20 bg-black/50 text-white text-xs px-3 py-1 backdrop-blur-sm">
              {{ (currentPhotoIndex ?? 0) + 1 }} / {{ totalPhotos || photos.length }}
            </div>
            <!-- Close -->
            <button
              class="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center bg-black/40 text-white backdrop-blur-sm"
              @click="closeLightbox"
              aria-label="Close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Prev / Next bar -->
          <div class="flex items-center justify-between px-6 py-4 flex-shrink-0">
            <button @click="previousPhoto" class="w-11 h-11 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors" aria-label="Previous photo">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span class="text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-light">
              {{ (currentPhotoIndex ?? 0) + 1 }} / {{ totalPhotos || photos.length }}
            </span>
            <button @click="nextPhoto" class="w-11 h-11 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors" aria-label="Next photo">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Editorial text block — Kinfolk / Monocle style (mobile only) -->
          <div class="px-8 pb-24 flex-1">
            <!-- Caption: clean serif title above the body -->
            <div v-if="getCaption(currentPhoto)" class="mb-5">
              <p class="text-base font-normal text-neutral-900 leading-relaxed">
                {{ getCaption(currentPhoto) }}
              </p>
            </div>

            <!-- Description: parsed into editorial paragraphs -->
            <div v-if="mobileParagraphs.length" class="space-y-5">
              <template v-for="(para, i) in mobileParagraphs" :key="i">
                <!-- Pull quote -->
                <blockquote
                  v-if="para.type === 'quote'"
                  class="font-serif italic text-lg text-neutral-600 text-center my-8 px-4"
                >
                  {{ para.text }}
                </blockquote>

                <!-- Camera metadata -->
                <p
                  v-else-if="para.type === 'meta'"
                  class="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium font-sans mt-8"
                >
                  {{ para.text }}
                </p>

                <!-- Body text — first paragraph gets the drop cap -->
                <p
                  v-else
                  class="leading-[2.0] tracking-wide text-neutral-700 text-[15px] font-light whitespace-pre-line"
                  :class="i === 0 ? 'editorial-drop-cap' : ''"
                >
                  {{ para.text }}
                </p>
              </template>
            </div>

            <!-- Fallback for descriptions that don't parse into paragraphs -->
            <div v-else-if="getDescription(currentPhoto)">
              <p class="leading-[2.0] tracking-wide text-neutral-700 text-[15px] font-light whitespace-pre-line editorial-drop-cap">
                {{ getDescription(currentPhoto) }}
              </p>
            </div>
          </div>
        </div>

        <!-- DESKTOP MODAL ----------------------------------------------- -->
        <div
          class="hidden md:flex fixed inset-0 z-50 bg-minimal-black items-center justify-center"
          @click="closeLightbox"
        >
          <!-- Prev (image-area overlay arrow) -->
          <button
            class="absolute left-6 top-1/2 -translate-y-1/2 text-minimal-white hover:text-minimal-light bg-minimal-black/50 hover:bg-minimal-black/70 p-3 backdrop-blur-sm transition-colors"
            @click.stop="previousPhoto"
            aria-label="Previous photo"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <!-- Next (image-area overlay arrow) -->
          <button
            class="absolute left-[calc(75%-3rem)] top-1/2 -translate-y-1/2 text-minimal-white hover:text-minimal-light bg-minimal-black/50 hover:bg-minimal-black/70 p-3 backdrop-blur-sm transition-colors"
            @click.stop="nextPhoto"
            aria-label="Next photo"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div class="flex flex-row items-start justify-center w-full h-full" @click.stop>
            <!-- Photo 75% -->
            <div class="relative flex-shrink-0 w-[75%] h-screen bg-minimal-black flex items-center justify-center p-8">
              <BaseImage
                :photo="currentPhoto"
                :alt="getCaption(currentPhoto) || 'Photo'"
                :priority="true"
                aspect-ratio="auto"
                variant="large"
                :lazy="false"
                object-fit="contain"
                class="w-full h-full object-contain"
                style="max-width:100%; max-height:100%;"
              />

              <!-- Desktop-only: full-height transparent click zones (FB-style).
                   Left half → previous, right half → next.
                   Only rendered when there is more than one photo so single-album
                   views are not accidentally navigated away.
                   z-10 sits above the image; arrow buttons below use z-20. -->
              <template v-if="photos.length > 1">
                <!-- Left click zone → previous (hidden at first photo) -->
                <div
                  v-if="(currentPhotoIndex ?? 0) > 0"
                  class="hidden md:block absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
                  aria-label="Previous photo"
                  @click.stop="previousPhoto"
                />
                <!-- Right click zone → next (hidden at last loaded photo) -->
                <div
                  v-if="(currentPhotoIndex ?? 0) < (totalPhotos || photos.length) - 1"
                  class="hidden md:block absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
                  aria-label="Next photo"
                  @click.stop="nextPhoto"
                />
              </template>

              <!-- Desktop-only Previous arrow — sits above click zone at z-20 -->
              <button
                v-if="photos.length > 1 && (currentPhotoIndex ?? 0) > 0"
                class="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 z-20 items-center justify-center bg-black/40 hover:bg-black/70 text-white/70 hover:text-white backdrop-blur-sm transition-all duration-200 ease-out"
                aria-label="Previous photo"
                @click.stop="previousPhoto"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <!-- Desktop-only Next arrow — sits above click zone at z-20 -->
              <button
                v-if="photos.length > 1 && (currentPhotoIndex ?? 0) < (totalPhotos || photos.length) - 1"
                class="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 z-20 items-center justify-center bg-black/40 hover:bg-black/70 text-white/70 hover:text-white backdrop-blur-sm transition-all duration-200 ease-out"
                aria-label="Next photo"
                @click.stop="nextPhoto"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <!-- Counter removed from image — now lives in the details panel top bar -->
            </div>
            <!-- Sidebar 25% — counter + close in a clean top bar on white -->
            <div class="flex-shrink-0 bg-white w-[25%] h-screen overflow-y-auto" style="min-width:280px;max-width:420px;">
              <!-- Top bar: counter left, close right — dark text on white, no dark bg overlay -->
              <div class="flex items-center justify-between px-6 pt-6 pb-4">
                <span class="text-xs font-light tracking-wider text-neutral-500">
                  {{ (currentPhotoIndex ?? 0) + 1 }} / {{ totalPhotos || photos.length }}
                </span>
                <button
                  class="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
                  @click="closeLightbox"
                  aria-label="Close"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="px-8 pb-8">
                <div v-if="getCaption(currentPhoto)" class="mb-6">
                  <p class="text-xs tracking-wider uppercase text-minimal-medium font-light mb-3 border-b border-minimal-light pb-2">Caption</p>
                  <p class="text-base font-normal text-minimal-black leading-relaxed">{{ getCaption(currentPhoto) }}</p>
                </div>
                <div v-if="getDescription(currentPhoto)">
                  <p class="text-xs tracking-wider uppercase text-minimal-medium font-light mb-3 border-b border-minimal-light pb-2">Details</p>
                  <div class="relative pl-6 pr-6 pt-4 pb-6">
                    <span class="absolute left-0 top-0 text-5xl text-minimal-medium font-serif leading-none opacity-40" style="line-height:0.7;">"</span>
                    <p class="text-sm text-minimal-dark font-normal leading-relaxed whitespace-pre-line">{{ getDescription(currentPhoto) }}</p>
                    <span class="absolute right-0 bottom-0 text-5xl text-minimal-medium font-serif leading-none opacity-40" style="line-height:0.7;">"</span>
                  </div>
                </div>
                <div v-if="!getCaption(currentPhoto) && !getDescription(currentPhoto)" class="text-center py-12">
                  <p class="text-xs tracking-wider uppercase text-minimal-light font-light">No caption available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Gallery drop cap for the first body paragraph in the mobile lightbox.
   Applied via .editorial-drop-cap — Tailwind's first-letter: variants
   conflict with whitespace-pre-line, so we use a scoped CSS rule instead. */
.editorial-drop-cap::first-letter {
  font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 0.75;
  float: left;
  margin-right: 0.35rem;
  margin-top: 0.15rem;
  color: #171717; /* neutral-900 */
}

/* Editorial Chinese serif for the album title masthead. Playfair lacks CJK
   glyphs, so pin Noto Serif TC / Songti for crisp traditional-Chinese strokes
   (e.g. "東京 · 熱") while still rendering Latin titles elegantly. */
.album-title {
  font-family: 'Noto Serif TC', 'Songti SC', serif;
}

/* Gallery tiles are an intentional exception to the sharp-corner token:
   subtle rounded-lg corners. overflow-hidden on the tile clips the inner
   image to match. Class specificity beats the universal/element radius rules. */
.photo-tile {
  border-radius: 0.5rem !important;
}

/* Smooth transitions */
img {
  transition: transform 0.7s ease-out;
}

/* Line clamp for caption overflow in grid view */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar for caption box - minimal style */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #E8E8E8 transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #E8E8E8;
  border-radius: 0;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #D0D0D0;
}
</style>
