<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SocialIconLinks from '@/components/ui/SocialIconLinks.vue'

interface Props {
  light?: boolean
}

withDefaults(defineProps<Props>(), {
  light: false,
})

const route = useRoute()
const currentYear = new Date().getFullYear()

// Hide social icons on the Contact page — they already appear in the main
// content area there, so showing them again in the footer is redundant.
const showSocialIcons = computed(() => route.path !== '/contact')
</script>

<template>
  <footer
    class="py-6 border-t"
    :class="light ? 'border-transparent' : 'border-minimal-light'"
  >
    <div class="container-minimal">
      <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p
          class="text-xs font-light tracking-wider"
          :class="light ? 'text-minimal-white/70' : 'text-minimal-medium'"
        >
          © {{ currentYear }} MIMAMA. ALL RIGHTS RESERVED.
        </p>

        <div v-if="showSocialIcons" class="flex items-center gap-6">
          <SocialIconLinks :light="light" />
          <a
            href="mailto:miche@maffmag.com"
            aria-label="Email"
            class="inline-flex items-center justify-center transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-4"
            :class="light
              ? 'text-white/60 hover:text-white'
              : 'text-neutral-400 hover:text-neutral-900'"
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
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m2 7 10 7 10-7" />
            </svg>
          </a>
        </div>
      </div>

      <div v-if="$slots.default" class="mt-8">
        <slot />
      </div>
    </div>
  </footer>
</template>

<style scoped>
a,
div {
  border-radius: 0 !important;
}
</style>
