<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Photo } from '@/lib/supabase'
import { getImageUrl, getImageSrcSet, getImageSizes, getLoadingStrategy } from '@/utils/imageUtils'

interface Props {
  src?: string
  alt: string
  photo?: Photo // Support Photo object for automatic variant selection
  aspectRatio?: 'auto' | 'square' | 'landscape' | 'portrait'
  objectFit?: 'cover' | 'contain' | 'fill'
  lazy?: boolean
  overlay?: boolean
  variant?: 'thumbnail' | 'medium' | 'large' // Manual variant selection
  index?: number // For intelligent eager/lazy loading
  priority?: boolean // For LCP images (hero, above fold)
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: 'auto',
  objectFit: 'cover',
  lazy: true,
  overlay: false,
  variant: 'large',
  index: 999,
  priority: false,
})

const imageLoaded = ref(false)
const imageError = ref(false)

// Compute LQIP placeholder (if available)
const lqipPlaceholder = computed(() => {
  if (props.photo?.placeholder_b64) {
    return props.photo.placeholder_b64
  }
  return null
})

// Compute image source based on Photo object or direct src
const imageSource = computed(() => {
  if (props.photo) {
    return getImageUrl(props.photo, props.variant)
  }
  return props.src || ''
})

// Compute srcset for responsive images
const imageSrcSet = computed(() => {
  if (props.photo) {
    return getImageSrcSet(props.photo)
  }
  return undefined
})

// Compute sizes attribute
const imageSizes = computed(() => {
  if (props.photo && imageSrcSet.value) {
    // Customize based on aspect ratio
    if (props.aspectRatio === 'square') {
      return getImageSizes({
        mobile: '50vw', // 2-column grid
        tablet: '33vw', // 3-column grid
        desktop: '25vw', // 4-column grid
      })
    }
    return getImageSizes()
  }
  return undefined
})

// Intelligent loading strategy
const loadingStrategy = computed(() => {
  if (props.priority) return 'eager'
  if (!props.lazy) return 'eager'
  return getLoadingStrategy(props.index)
})

// Always decode async so image decoding happens off the main thread and
// never blocks paint/script execution - including eager, above-the-fold images.
const decodingStrategy = computed(() => 'async' as const)

onMounted(() => {
  imageLoaded.value = !props.lazy && !props.priority
})

const handleLoad = () => {
  imageLoaded.value = true
}

const handleError = () => {
  imageError.value = true
  console.error('Image failed to load:', imageSource.value)
}
</script>

<template>
  <div
    :class="[
      'relative overflow-hidden bg-minimal-light',
      {
        'aspect-square': aspectRatio === 'square',
        'aspect-landscape': aspectRatio === 'landscape',
        'aspect-portrait': aspectRatio === 'portrait',
      },
    ]"
  >
    <!-- LQIP Blur Placeholder (Instant Display) -->
    <div
      v-if="lqipPlaceholder && !imageLoaded && !imageError"
      class="absolute inset-0 lqip-blur"
      :style="{ backgroundImage: `url(${lqipPlaceholder})` }"
    />

    <!-- Loading skeleton (Fallback if no LQIP) -->
    <div
      v-if="!lqipPlaceholder && !imageLoaded && !imageError"
      class="absolute inset-0 skeleton"
    />

    <!-- Error state -->
    <div
      v-if="imageError"
      class="absolute inset-0 flex items-center justify-center bg-minimal-light"
    >
      <span class="text-minimal-medium text-sm">Image not available</span>
    </div>

    <!-- High-Res Image (Fades in over LQIP) -->
    <img
      :src="imageSource"
      :srcset="imageSrcSet"
      :sizes="imageSizes"
      :alt="alt"
      :loading="loadingStrategy"
      :decoding="decodingStrategy"
      :width="photo?.image_width"
      :height="photo?.image_height"
      :class="[
        'w-full h-full transition-opacity duration-700 ease-out transform-gpu',
        {
          'object-cover': objectFit === 'cover',
          'object-contain': objectFit === 'contain',
          'object-fill': objectFit === 'fill',
          'opacity-0': !imageLoaded,
          'opacity-100': imageLoaded,
        },
      ]"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Overlay -->
    <div
      v-if="overlay"
      class="absolute inset-0 bg-minimal-black bg-opacity-40"
    />

    <!-- Slot for content over image -->
    <div
      v-if="$slots.default"
      class="absolute inset-0 flex items-center justify-center"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
div {
  border-radius: 0 !important;
}

img {
  border-radius: 0 !important;
}

/* LQIP Blur Effect - Creates beautiful matte-glass aesthetic */
.lqip-blur {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  /* Blur + Scale to prevent edge artifacts */
  filter: blur(20px);
  transform: scale(1.1);
  
  /* Smooth transition when high-res loads */
  transition: opacity 700ms ease-out;
  
  /* Ensure crisp rendering */
  image-rendering: auto;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

/* Skeleton loading animation (fallback) */
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Performance optimization */
img {
  will-change: opacity;
}

.lqip-blur {
  will-change: opacity;
}
</style>
