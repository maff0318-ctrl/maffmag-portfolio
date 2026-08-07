<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
    <!-- Eyebrow -->
    <p class="text-[10px] tracking-[0.4em] uppercase text-neutral-400 font-sans mb-6">
      404
    </p>

    <!-- Heading -->
    <h1 class="font-serif font-normal text-3xl md:text-4xl text-neutral-900 tracking-wide mb-4">
      Page Not Found.
    </h1>

    <!-- Sub-copy -->
    <p class="text-xs tracking-[0.2em] uppercase text-neutral-400 font-sans leading-relaxed mb-12 max-w-xs">
      The page you are looking for doesn't exist or has been moved.
    </p>

    <!-- CTA -->
    <button
      class="text-xs tracking-[0.3em] uppercase font-light text-neutral-900 relative
             after:content-[''] after:absolute after:left-0 after:-bottom-1
             after:h-px after:w-0 after:bg-neutral-900
             after:transition-all after:duration-300 hover:after:w-full
             transition-colors duration-300"
      @click="router.push('/portfolio')"
    >
      Return to Portfolio
    </button>
  </div>
</template>

<style scoped>
button, div {
  border-radius: 0 !important;
}
</style>
