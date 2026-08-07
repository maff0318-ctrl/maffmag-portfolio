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
  <div class="flex flex-col items-center justify-center py-12 space-y-4">
    <!-- Status Text -->
    <p class="text-xs text-minimal-medium font-light tracking-widest uppercase">
      {{ statusText() }}
    </p>

    <!-- Load More Button -->
    <button
      @click="emit('loadMore')"
      :disabled="disabled || loading"
      class="group relative px-12 py-4 border border-minimal-light text-minimal-dark font-light tracking-[0.3em] text-xs uppercase transition-all duration-300 hover:bg-minimal-black hover:text-white hover:border-minimal-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-minimal-dark disabled:hover:border-minimal-light"
    >
      <span class="relative z-10">{{ buttonText() }}</span>

      <!-- Animated loading dots -->
      <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
        <span class="flex space-x-1">
          <span class="w-1.5 h-1.5 bg-minimal-dark rounded-full animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-1.5 h-1.5 bg-minimal-dark rounded-full animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-1.5 h-1.5 bg-minimal-dark rounded-full animate-bounce" style="animation-delay: 300ms"></span>
        </span>
      </span>

      <!-- Hover effect line -->
      <span
        class="absolute bottom-0 left-1/2 w-0 h-px bg-minimal-black transition-all duration-300 -translate-x-1/2 group-hover:w-full"
      ></span>
    </button>

    <!-- Progress indicator -->
    <div class="w-64 h-px bg-minimal-light overflow-hidden">
      <div
        class="h-full bg-minimal-dark transition-all duration-500"
        :style="{ width: `${(currentCount / totalCount) * 100}%` }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
button {
  border-radius: 0 !important;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.5rem);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
