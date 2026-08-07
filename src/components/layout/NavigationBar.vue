<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LogoIcon from '@/components/ui/LogoIcon.vue'
import LanguageToggle from '@/components/ui/LanguageToggle.vue'
import SocialIconLinks from '@/components/ui/SocialIconLinks.vue'
import { useLanguage } from '@/composables/useLanguage'

interface Props {
  transparent?: boolean
}

withDefaults(defineProps<Props>(), {
  transparent: false,
})

const router = useRouter()
const route = useRoute()
const { t } = useLanguage()

const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)

const navLinks = [
  { name: 'portfolio', path: '/portfolio' },
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

// Lock body scroll when mobile menu is open
watch(isMobileMenuOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})

const navigateTo = (path: string) => {
  router.push(path)
  isMobileMenuOpen.value = false
}

const isActive = (path: string) => {
  return route.path === path
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="[
      transparent && !isScrolled
        ? 'bg-transparent border-b border-transparent'
        : 'bg-minimal-white border-b border-minimal-light',
    ]"
  >
    <div class="container-minimal py-6">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div 
          class="cursor-pointer"
          @click="navigateTo('/')"
        >
          <LogoIcon 
            :color="transparent && !isScrolled ? 'white' : 'dark'" 
            size="md"
          />
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <button
            v-for="link in navLinks"
            :key="link.path"
            class="text-xs tracking-[0.15em] uppercase font-extralight transition-colors"
            :class="[
              isActive(link.path)
                ? (transparent && !isScrolled ? 'text-minimal-white' : 'text-minimal-dark')
                : (transparent && !isScrolled ? 'text-minimal-white/70 hover:text-minimal-white' : 'text-minimal-medium hover:text-minimal-dark')
            ]"
            @click="navigateTo(link.path)"
          >
            {{ t(link.name as any) }}
          </button>
          
          <!-- Language Toggle - Rightmost -->
          <div class="pl-4 border-l border-minimal-light/30">
            <LanguageToggle />
          </div>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden p-2 relative z-50"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          aria-label="Toggle menu"
        >
          <svg 
            class="w-6 h-6 transition-colors"
            :class="transparent && !isScrolled && !isMobileMenuOpen ? 'text-minimal-white' : 'text-minimal-black'"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              v-if="!isMobileMenuOpen"
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="1.5" 
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path 
              v-else
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="1.5" 
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay - Full Screen -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-in-out"
      leave-active-class="transition-opacity duration-300 ease-in-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-minimal-white z-40 md:hidden"
      >
        <!-- Close Button (Top Right) -->
        <button
          class="absolute top-6 right-6 p-2 z-50"
          @click="closeMobileMenu"
          aria-label="Close menu"
        >
          <svg 
            class="w-6 h-6 text-minimal-black" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="1.5" 
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Navigation Links - Centered and Large -->
        <nav class="flex flex-col items-center justify-center h-full space-y-12">
          <button
            v-for="(link, index) in navLinks"
            :key="link.path"
            class="text-3xl font-thin tracking-[0.2em] transition-all duration-300 transform uppercase"
            :class="[
              isActive(link.path) 
                ? 'text-minimal-dark' 
                : 'text-minimal-medium hover:text-minimal-dark hover:translate-x-2'
            ]"
            style="transition-delay: calc(index * 50ms + 100ms)"
            @click="navigateTo(link.path)"
          >
            {{ t(link.name as any) }}
          </button>
        </nav>

        <!-- Social Links at Bottom -->
        <div class="absolute bottom-8 left-0 right-0 flex justify-center">
          <SocialIconLinks @activate="closeMobileMenu" />
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
/* Ensure no border radius */
button, div {
  border-radius: 0 !important;
}
</style>
