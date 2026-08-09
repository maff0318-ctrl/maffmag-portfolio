<script setup lang="ts">
/**
 * HighlightCard - Bento Grid "Travel Extreme" card for the Highlights page.
 *
 * Displays a dark-overlayed background photo with an oversized hero metric,
 * a small uppercase category label, and a location/year tag - per the
 * "Highlights (Travel Personal Records)" Bento Grid specification.
 */
interface Props {
  metric: string       // Oversized hero number, e.g. "-18°C", "5,364m"
  category: string     // Small uppercase category label, e.g. "EXTREME WEATHER"
  location: string      // Location tag, e.g. "Oymyakon, Russia"
  year: string | number // Year tag, e.g. 2024
  image: string          // Background photo URL
  featured?: boolean     // Larger, more prominent typography for the hero card
}

withDefaults(defineProps<Props>(), {
  featured: false,
})
</script>

<template>
  <div
    class="highlight-card group relative h-full w-full overflow-hidden rounded-2xl border border-white/10 cursor-default transition-transform duration-300 ease-out hover:scale-[1.02]"
  >
    <!-- Background Image - kept at full brightness/vibrancy. Text contrast
         comes entirely from the gradient overlay below, not from dimming
         the photo itself. -->
    <img
      :src="image"
      :alt="category"
      loading="lazy"
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
    />

    <!-- Dark gradient overlay - visible on mobile, hover-reveal on desktop -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"></div>

    <!-- Content - visible on mobile, hover-reveal on desktop -->
    <div class="relative z-10 flex h-full flex-col justify-between px-6 pt-6 pb-8 md:px-8 md:pt-8 md:pb-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
      <!-- Category Label -->
      <p class="text-[10px] md:text-xs tracking-[0.25em] uppercase text-white/90 font-light drop-shadow-sm">
        {{ category }}
      </p>

      <!-- Hero Metric - light, editorial weight rather than heavy UI text -->
      <div class="flex-1 flex items-center">
        <p
          :class="[
            'font-light text-white leading-none tracking-tight drop-shadow-md',
            featured ? 'text-6xl md:text-8xl' : 'text-5xl md:text-6xl'
          ]"
        >
          {{ metric }}
        </p>
      </div>

      <!-- Location & Year Tag -->
      <p class="text-[11px] md:text-xs tracking-[0.15em] uppercase text-white/90 font-light drop-shadow-sm">
        {{ location }} — {{ year }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/*
  Intentional exception to the site-wide sharp-corner design token:
  Bento highlight cards use rounded-2xl per explicit design request,
  so no border-radius override here (unlike every other component).
*/
</style>
