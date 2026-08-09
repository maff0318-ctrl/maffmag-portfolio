<script setup lang="ts">
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import type { TravelRecord } from '@/lib/supabase'

const props = defineProps<{
  record: TravelRecord
}>()

const { currentLang } = useLanguage()

const title = computed(() => 
  currentLang.value === 'zh' && props.record.title_zh 
    ? props.record.title_zh 
    : props.record.title_en
)

const caption = computed(() => 
  currentLang.value === 'zh' && props.record.caption_zh 
    ? props.record.caption_zh 
    : props.record.caption_en
)
</script>

<template>
  <div class="photo-record-card relative bg-white border border-minimal-light overflow-hidden h-full group cursor-pointer">
    <!-- Full-bleed Image -->
    <div class="relative w-full h-full overflow-hidden">
      <img
        :src="record.image_url"
        :alt="title"
        loading="lazy"
        decoding="async"
        class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
      />
      
      <!-- Overlay (visible on mobile, fade in on desktop hover) -->
      <div class="absolute inset-0 bg-black/20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 ease-out"></div>
      
      <!-- Text Content (visible on mobile, fade in on desktop hover) -->
      <div class="absolute inset-0 flex flex-col items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 ease-out p-6">
        <h3 class="text-xl md:text-2xl font-thin text-white tracking-[0.2em] uppercase mb-3 text-center">
          {{ title }}
        </h3>
        <p class="text-xs text-white/90 tracking-[0.15em] uppercase font-light text-center">
          {{ caption }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.photo-record-card {
  min-height: 300px;
}
</style>
