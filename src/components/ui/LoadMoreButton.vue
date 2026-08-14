<script setup lang="ts">
import { useLanguage } from '@/composables/useLanguage'

interface Props {
  loading?: boolean
  disabled?: boolean
  currentCount: number
  totalCount: number
  itemLabel?: 'photos' | 'albums'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  itemLabel: 'photos',
})

const emit = defineEmits<{
  loadMore: []
}>()

const { currentLang } = useLanguage()

const buttonText = () => {
  if (props.loading) {
    return currentLang.value === 'zh' ? '載入中...' : 'LOADING...'
  }
  if (props.itemLabel === 'albums') {
    return currentLang.value === 'zh' ? '載入更多相簿' : 'LOAD MORE ALBUMS'
  }
  return currentLang.value === 'zh' ? '載入更多相片' : 'LOAD MORE PHOTOS'
}

const statusText = () => {
  return `${props.currentCount} / ${props.totalCount}`
}
</script>

<template>
  <div class="mt-24 mb-32 flex flex-col items-center justify-center space-y-4">
    <!-- Status Text -->
    <p class="text-xs text-minimal-medium font-light tracking-widest uppercase">
      {{ statusText() }}
    </p>

    <!-- Editorial text-only Load More control -->
    <button
      :disabled="disabled || loading"
      class="group relative inline-flex flex-col items-center justify-center pb-1 text-xs tracking-[0.2em] uppercase font-light text-neutral-400 transition-colors duration-500 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
      @click="emit('loadMore')"
    >
      <span v-if="!loading">{{ buttonText() }}</span>
      <span v-else class="animate-pulse">{{ buttonText() }}</span>

      <!-- Dynamic underline draws in from the left on hover. -->
      <span
        v-if="!loading"
        class="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-neutral-900 transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
    </button>

    <!-- Progress indicator -->
    <div class="w-64 h-px bg-minimal-light overflow-hidden">
      <div
        class="h-full bg-minimal-dark transition-all duration-500"
        :style="{ width: `${(currentCount / totalCount) * 100}%` }"
      />
    </div>
  </div>
</template>
