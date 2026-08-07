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

const leftCaption = computed(() => 
  currentLang.value === 'zh' && props.record.split_left_caption_zh 
    ? props.record.split_left_caption_zh 
    : props.record.split_left_caption_en
)

const rightCaption = computed(() => 
  currentLang.value === 'zh' && props.record.split_right_caption_zh 
    ? props.record.split_right_caption_zh 
    : props.record.split_right_caption_en
)
</script>

<template>
  <div class="split-card bg-white border border-minimal-light h-full overflow-hidden transition-all duration-300 hover:border-minimal-dark">
    <!-- Title -->
    <div class="border-b border-minimal-light px-6 py-4">
      <h3 class="text-xs tracking-[0.25em] uppercase text-minimal-dark font-light text-center">
        {{ title }}
      </h3>
    </div>

    <!-- Split Content -->
    <div class="grid grid-cols-2 h-[calc(100%-56px)]">
      <!-- Left Side -->
      <div class="flex flex-col items-center justify-center p-6 border-r border-minimal-light">
        <div class="text-3xl md:text-4xl font-thin text-minimal-black tracking-tight mb-3">
          {{ record.split_left_value }}
        </div>
        <p class="text-[10px] tracking-[0.15em] uppercase text-minimal-medium font-extralight text-center">
          {{ leftCaption }}
        </p>
      </div>

      <!-- Right Side -->
      <div class="flex flex-col items-center justify-center p-6">
        <div class="text-3xl md:text-4xl font-thin text-minimal-black tracking-tight mb-3">
          {{ record.split_right_value }}
        </div>
        <p class="text-[10px] tracking-[0.15em] uppercase text-minimal-medium font-extralight text-center">
          {{ rightCaption }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.split-card {
  min-height: 240px;
}
</style>
