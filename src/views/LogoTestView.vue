<script setup lang="ts">
import { ref } from 'vue'
import LogoIcon from '@/components/ui/LogoIcon.vue'

const animationKey = ref(0)

const replay = () => {
  animationKey.value += 1
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-minimal-white">
    <div class="w-64 h-64 flex flex-col items-center justify-center gap-8">
      <LogoIcon :key="animationKey" animated color="primary" size="lg" />
      <button
        class="text-sm tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
        type="button"
        @click="replay"
      >
        REPLAY ANIMATION
      </button>
    </div>
  </div>
</template>
