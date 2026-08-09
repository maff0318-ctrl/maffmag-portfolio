<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LogoIcon from '@/components/ui/LogoIcon.vue'
import LanguageToggle from '@/components/ui/LanguageToggle.vue'
import SocialIconLinks from '@/components/ui/SocialIconLinks.vue'
import { useLanguage } from '@/composables/useLanguage'

interface Props {
  position?: 'sticky' | 'fixed' | 'static'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'sticky',
})

const router = useRouter()
const route = useRoute()
const { t } = useLanguage()

const navItems = [
  { key: 'portfolio', path: '/portfolio' },
  { key: 'footprints', path: '/footprints' },
  { key: 'highlights', path: '/records' },
  { key: 'about', path: '/about' },
  { key: 'contact', path: '/contact' },
] as const

const positionClasses = computed(() => {
  switch (props.position) {
    case 'fixed':  return 'fixed top-0 left-0 right-0 z-50'
    case 'static': return 'relative z-50'
    default:       return 'sticky top-0 z-50'
  }
})

const mobileMenuOpen = ref(false)

// Close overlay on route change
watch(() => route.path, () => { mobileMenuOpen.value = false })

// Lock / unlock body scroll when overlay is open
watch(mobileMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

const navigateTo = (path: string) => {
  // Close the menu immediately and navigate
  mobileMenuOpen.value = false
  // Use nextTick to ensure the menu close is processed before navigation
  router.push(path).catch((err) => {
    // Ignore navigation duplicated errors
    if (err.name !== 'NavigationDuplicated') {
      console.error('Navigation error:', err)
    }
  })
}

const isActive = (path: string) => route.path === path
</script>

<template>
  <header
    class="shrink-0 bg-minimal-white border-b border-minimal-light"
    :class="positionClasses"
  >
    <div class="container-minimal py-4">
      <div class="flex items-center justify-between">
        <!-- Left cluster: optional slot content + logo -->
        <div class="flex items-center gap-4">
          <slot name="left" />
          <div class="cursor-pointer" @click="navigateTo('/')">
            <LogoIcon color="dark" size="md" />
          </div>
        </div>

        <!-- Desktop nav (hidden on mobile) -->
        <div class="hidden md:flex items-center space-x-6">
          <slot name="right" />
          <nav class="flex items-center space-x-8">
            <button
              v-for="item in navItems"
              :key="item.path"
              class="text-xs tracking-wide uppercase font-light transition-colors"
              :class="isActive(item.path)
                ? 'text-minimal-black md:hover:text-accent'
                : 'text-minimal-medium md:hover:text-minimal-black'"
              :aria-current="isActive(item.path) ? 'page' : undefined"
              @click="navigateTo(item.path)"
              @touchstart.passive="() => {}"
            >
              {{ t(item.key) }}
            </button>
            <div class="pl-4 border-l border-minimal-light">
              <LanguageToggle />
            </div>
          </nav>
        </div>

        <!-- Mobile: language toggle + hamburger -->
        <div class="flex items-center gap-4 md:hidden">
          <LanguageToggle />
          <button
            class="flex flex-col justify-center items-center w-11 h-11 gap-[5px] bg-transparent border-none cursor-pointer"
            :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
            :aria-expanded="mobileMenuOpen"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <span
              class="block w-5 h-px bg-neutral-800 transition-all duration-300 origin-center"
              :class="mobileMenuOpen ? 'rotate-45 translate-y-[3px]' : ''"
            />
            <span
              class="block w-5 h-px bg-neutral-800 transition-all duration-300 origin-center"
              :class="mobileMenuOpen ? '-rotate-45 -translate-y-[3px]' : ''"
            />
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Full-screen mobile overlay -->
  <transition
    enter-active-class="transition-opacity duration-300 ease-out"
    leave-active-class="transition-opacity duration-[400ms] ease-in-out"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-md md:hidden border-b border-minimal-light"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <!-- Top bar: logo + close -->
      <div class="container-minimal py-4">
        <div class="flex items-center justify-between">
          <div class="cursor-pointer" @click="navigateTo('/')">
            <LogoIcon color="dark" size="md" />
          </div>
          <button
            class="w-11 h-11 flex items-center justify-center bg-transparent border-none cursor-pointer text-neutral-600"
            aria-label="Close menu"
            @click="mobileMenuOpen = false"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Nav links: vertically centred, large tracking -->
      <nav
        class="flex-1 flex flex-col items-center justify-center gap-8"
        aria-label="Mobile navigation"
      >
        <button
          v-for="item in navItems"
          :key="item.path"
          class="text-base tracking-[0.35em] uppercase font-light transition-colors duration-300"
          :class="isActive(item.path)
            ? 'text-neutral-900'
            : 'text-neutral-500 md:hover:text-neutral-800'"
          :aria-current="isActive(item.path) ? 'page' : undefined"
          @click="navigateTo(item.path)"
          @touchstart.passive="() => {}"
        >
          {{ t(item.key) }}
        </button>
      </nav>

      <!-- Bottom: social icons -->
      <div class="flex justify-center pt-8 pb-10">
        <SocialIconLinks />
      </div>
    </div>
  </transition>
</template>

<style scoped>
button,
div {
  border-radius: 0 !important;
}
</style>
