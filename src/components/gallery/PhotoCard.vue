<script setup lang="ts">
import { ref } from 'vue'
import BaseImage from '@/components/ui/BaseImage.vue'

interface Photo {
  id: number
  albumId: string
  title: string
  location: string
  continent: string
  image: string
  placeholder_b64?: string // LQIP placeholder
  aspect: 'landscape' | 'portrait' | 'square'
  featured: boolean
  year?: number
}

interface Props {
  photo: Photo
  showInfo?: boolean
  forceSquare?: boolean
  priority?: boolean // For eager loading first few images
}

const props = withDefaults(defineProps<Props>(), {
  showInfo: false,
  forceSquare: false,
  priority: false,
})

const emit = defineEmits<{
  click: [photo: Photo]
}>()

const imageLoaded = ref(false)

const handleClick = () => {
  emit('click', props.photo)
}

const handleIconClick = (event: Event, action: 'heart' | 'share') => {
  event.stopPropagation()
  console.log(`${action} clicked for:`, props.photo.title)
  // Add your action logic here
}

// Listen for image load event from BaseImage
const onImageLoad = () => {
  imageLoaded.value = true
}

</script>

<template>
  <!-- Parent Container: group relative overflow-hidden cursor-pointer -->
  <div
    class="group relative overflow-hidden cursor-pointer photo-card-container"
    :class="{ 'photo-loaded': imageLoaded }"
    @click="handleClick"
  >
    <!-- Inner Image Wrapper to constrain zoom effect -->
    <!-- transform + will-change + transform-gpu force this onto its own GPU
         compositor layer, so the hover scale never touches layout/paint.
         forceSquare (mobile grid) gets an explicit aspect-square to prevent CLS;
         desktop masonry intentionally keeps auto/organic heights, so its own
         img element reserves space via width/height once cover dimensions load. -->
    <div
      :class="[
        'relative overflow-hidden transform-gpu will-change-transform transition-transform duration-300 ease-out delay-0 group-hover:scale-105',
        { 'aspect-square': forceSquare }
      ]"
    >
      <!-- Image (no transform, parent handles zoom) -->
      <div class="w-full h-full">
        <BaseImage
          :src="photo.image"
          :photo="{ image_url: photo.image, placeholder_b64: photo.placeholder_b64 }"
          :alt="photo.title"
          :aspect-ratio="forceSquare ? 'square' : 'auto'"
          :lazy="!priority"
          :priority="priority"
          class="w-full h-full"
        />
      </div>
    </div>
    
    <!-- Dark Overlay: opacity-only (GPU-composited), NOT background-color -->
    <div
      class="absolute inset-0 bg-black opacity-0 group-hover:opacity-25 transition-opacity duration-300 ease-out delay-0 pointer-events-none will-change-[opacity]"
    />
    
    <!-- Year Display: floating overlay on both mobile and desktop.
         Mobile base: smaller, white/90, font-light.
         Desktop md: existing classes preserved exactly as-is. -->
    <div
      v-if="photo.year"
      class="absolute bottom-4 right-4 text-white/90 text-sm tracking-[0.2em] font-light pointer-events-none z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] md:drop-shadow-none md:block md:text-minimal-white md:text-sm md:font-extralight md:tracking-[0.15em] md:z-20"
    >
      {{ photo.year }}
    </div>
    
    <!-- Bottom-Left Icon: Heart (hidden -> fade in + slide up) -->
    <button
      class="absolute bottom-4 left-4 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out text-minimal-white hover:scale-110 z-10"
      @click="(e) => handleIconClick(e, 'heart')"
      aria-label="Like photo"
    >
      <svg 
        class="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="1.5"
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
    </button>
    
    <!-- Optional: Title/Location Info (for desktop, center overlay on hover) -->
    <div
      v-if="showInfo"
      class="hidden md:flex absolute inset-0 flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-none z-10 text-center px-4"
    >
      <h3 class="font-serif text-minimal-white text-lg font-light tracking-widest mb-1 uppercase photo-info-shadow">
        {{ photo.title }}
      </h3>
      <p class="text-minimal-white text-xs font-light tracking-[0.25em] uppercase photo-info-shadow">
        {{ photo.location }}
      </p>
    </div>
  </div>

  <!-- Mobile-only: text rendered below the image (no hover needed on touch) -->
  <div
    v-if="showInfo"
    class="block md:hidden bg-white px-1 pt-3 pb-1"
  >
    <h3 class="font-serif text-neutral-900 text-sm font-light tracking-widest uppercase leading-snug mb-1">
      {{ photo.title }}
    </h3>
    <p class="text-neutral-400 text-[10px] font-light tracking-[0.2em] uppercase">
      {{ photo.location }}
    </p>
  </div>
</template>

<style scoped>
/* Ensure no border radius - sharp corners everywhere */
div, button, img {
  border-radius: 0 !important;
}

/* Fade-in animation for loaded images */
.photo-card-container {
  opacity: 0;
  animation: fadeIn 0.4s ease-out forwards;
}

.photo-card-container.photo-loaded {
  opacity: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ensure smooth transitions */
button {
  transition: transform 0.2s ease-out;
}

/* Add subtle shadow so title/location text stays readable over bright or busy photos */
.photo-info-shadow {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6), 0 1px 8px rgba(0, 0, 0, 0.4);
}
</style>
