<script setup lang="ts">
import { useLanguage } from '@/composables/useLanguage'

const { currentLang, toggleLanguage } = useLanguage()
</script>

<template>
  <button
    class="flex items-center space-x-2 text-xs tracking-wider font-light text-minimal-medium hover:text-minimal-black transition-colors"
    @click="toggleLanguage"
    aria-label="Toggle language"
  >
    <span :class="currentLang === 'en' ? 'text-minimal-black' : ''">ENG</span>
    <span>•</span>
    <span :class="currentLang === 'zh' ? 'text-minimal-black' : ''">繁</span>
  </button>
</template>

<style scoped>
button {
  border-radius: 0 !important;
}
</style>
