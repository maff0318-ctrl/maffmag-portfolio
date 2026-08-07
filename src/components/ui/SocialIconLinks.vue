<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  instagramUrl?: string
  light?: boolean
  tooltipPlacement?: 'auto' | 'up' | 'down'
  // 'right' (default): tooltip expands leftward from the icon's right edge —
  //   correct when the icon is on the right side of the screen.
  // 'left': tooltip expands rightward from the icon's left edge —
  //   correct when the icon is flush-left (e.g. Contact page left column).
  tooltipAnchor?: 'right' | 'left'
}

const props = withDefaults(defineProps<Props>(), {
  instagramUrl: 'https://www.instagram.com/maffmmm/',
  light: false,
  tooltipPlacement: 'auto',
  tooltipAnchor: 'right',
})

const emit = defineEmits<{
  activate: []
}>()

// Easter egg state
const showXTooltip = ref(false)
const xShaking = ref(false)
const tooltipAbove = ref(false)
const xButtonRef = ref<HTMLButtonElement | null>(null)
let hideTimer: number | null = null

const handleXClick = () => {
  emit('activate')

  // Determine placement: measure space below the button at click time.
  if (xButtonRef.value) {
    const rect = xButtonRef.value.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    tooltipAbove.value = spaceBelow < 80 // flip above if fewer than 80px below
  }

  // Trigger head-shake
  xShaking.value = false
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { xShaking.value = true })
  })

  // Show tooltip
  if (hideTimer) clearTimeout(hideTimer)
  showXTooltip.value = true
  hideTimer = window.setTimeout(() => {
    showXTooltip.value = false
    hideTimer = null
  }, 3000)
}

const onShakeEnd = () => {
  xShaking.value = false
}
</script>

<template>
  <div class="flex items-center gap-5" role="group" aria-label="Social media links">
    <!-- Instagram -->
    <a
      :href="instagramUrl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      class="inline-flex items-center justify-center transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-4"
      :class="light ? 'text-white/60 hover:text-white' : 'text-neutral-400 hover:text-neutral-900'"
      @click="emit('activate')"
    >
      <svg
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    </a>

    <!-- X easter egg: no href, tooltip + head-shake on click -->
    <div class="relative inline-flex">
      <button
        ref="xButtonRef"
        type="button"
        aria-label="X"
        class="inline-flex items-center justify-center cursor-pointer transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-4 bg-transparent border-none p-0"
        :class="[
          light ? 'text-white/60 hover:text-white' : 'text-neutral-400 hover:text-neutral-900',
          xShaking ? 'x-shake' : ''
        ]"
        @click="handleXClick"
        @animationend="onShakeEnd"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.46l-5.06-6.618-5.79 6.618H2.208l7.549-8.628L1.751 2.25h6.624l4.57 6.04 5.299-6.04Zm-1.161 17.52h1.833L7.38 4.126H5.412L17.083 19.77Z" />
        </svg>
      </button>

      <!-- Quiet-luxury floating tooltip -->
      <transition
        enter-active-class="transition-all duration-200 ease-out"
        leave-active-class="transition-all duration-150 ease-in"
        enter-from-class="opacity-0 translate-y-1"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="showXTooltip"
          role="tooltip"
          class="x-tooltip
                 fixed bottom-24 left-1/2 -translate-x-1/2 w-max max-w-[85vw] whitespace-normal text-center z-[99999]
                 md:absolute md:fixed-none md:bottom-auto md:left-auto md:translate-x-0 md:w-max md:max-w-[80vw] md:whitespace-nowrap md:text-left md:z-auto
                 px-4 py-2 bg-white/90 backdrop-blur-md border border-neutral-200 shadow-sm text-[11px] text-neutral-600 tracking-wide pointer-events-none"
          :class="[
            tooltipAbove ? 'md:bottom-full md:mb-3' : 'md:top-full md:mt-3',
            props.tooltipAnchor === 'left' ? 'md:left-0' : 'md:right-0',
          ]"
        >
          Pretend you didn't click that. I don't have X.
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* Head-shake: rapid left-right micro-wobble, 3 cycles, 450ms total */
@keyframes x-head-shake {
  0%   { transform: translateX(0); }
  12%  { transform: translateX(-4px); }
  25%  { transform: translateX(4px); }
  37%  { transform: translateX(-3px); }
  50%  { transform: translateX(3px); }
  62%  { transform: translateX(-2px); }
  75%  { transform: translateX(2px); }
  87%  { transform: translateX(-1px); }
  100% { transform: translateX(0); }
}

.x-shake {
  animation: x-head-shake 0.45s ease-in-out;
}

/* Tooltip arrow: handled inline via dynamic :class — no static rule needed */

/* Keep tooltip rounded: override the global sharp-corner reset */
.x-tooltip {
  border-radius: 0.5rem !important;
}

/* Keep button border-radius reset intact except for focus ring */
button {
  border-radius: 0 !important;
}
</style>
