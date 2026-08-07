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
  <div class="data-card bg-white border border-minimal-light h-full flex flex-col items-center justify-center p-8 transition-all duration-300 hover:border-minimal-dark group">
    <!-- Main Value/Statistic -->
    <div class="text-center mb-6">
      <div class="text-5xl md:text-6xl font-thin text-minimal-black tracking-tight leading-none mb-2">
        {{ record.value }}
      </div>
      <div class="text-xs tracking-[0.25em] uppercase text-minimal-medium font-light mt-4">
        {{ title }}
      </div>
    </div>

    <!-- Caption -->
    <div class="text-center mt-auto">
      <p class="text-[10px] tracking-[0.15em] uppercase text-minimal-medium font-extralight">
        {{ caption }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.data-card {
  min-height: 240px;
}
</style>
