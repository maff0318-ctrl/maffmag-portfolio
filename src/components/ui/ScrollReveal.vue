<script setup lang="ts">
import { useScrollReveal } from '@/composables/useScrollReveal'

// threshold: fraction of the element that must be visible to trigger (0.12 = 12%)
withDefaults(defineProps<{ threshold?: number }>(), { threshold: 0.12 })

const { elRef, isVisible } = useScrollReveal(0.12)
</script>

<template>
  <!--
    Wraps its slot in a single div that starts invisible + nudged down,
    then transitions to full opacity at resting position once 12% of the
    element enters the viewport. The transition is intentionally slow and
    ease-out for a "breathing into existence" luxury feel.
    Used only in the mobile portfolio feed; desktop masonry is unaffected.
  -->
  <div
    ref="elRef"
    class="transition-all duration-[800ms] ease-out"
    :class="isVisible
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-8'"
  >
    <slot />
  </div>
</template>
