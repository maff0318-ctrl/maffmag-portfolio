<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TripCard from '@/components/trip/TripCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LogoIcon from '@/components/ui/LogoIcon.vue'
import FooterSection from '@/components/layout/FooterSection.vue'
import SocialIconLinks from '@/components/ui/SocialIconLinks.vue'
import tripsData from '@/data/trips.json'

const router = useRouter()

interface Trip {
  id: number
  title: string
  slug: string
  location: string
  dateRange: string
  excerpt: string
  heroImage: string
  duration: string
  highlights: string[]
}

const trips = ref<Trip[]>(tripsData)
const sortBy = ref<'date' | 'location'>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')

const sortedTrips = computed(() => {
  const sorted = [...trips.value]
  
  if (sortBy.value === 'date') {
    // Simple sort by id for demo (in real app, parse dates)
    return sortOrder.value === 'desc' ? sorted.reverse() : sorted
  } else {
    return sorted.sort((a, b) => a.location.localeCompare(b.location))
  }
})

const handleViewTrip = (slug: string) => {
  console.log('View trip:', slug)
  // Navigate to trip detail page
  // router.push(`/trips/${slug}`)
}

const navigateTo = (path: string) => {
  router.push(path)
}

const toggleSort = (type: 'date' | 'location') => {
  if (sortBy.value === type) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = type
    sortOrder.value = 'desc'
  }
}
</script>

<template>
  <div class="min-h-screen bg-minimal-white">
    <!-- Header Section -->
    <header class="sticky top-0 z-20 bg-minimal-white border-b border-minimal-light">
      <div class="container-minimal py-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <!-- Logo -->
          <div class="cursor-pointer" @click="navigateTo('/')">
            <LogoIcon color="dark" size="md" />
          </div>

          <!-- Navigation -->
          <nav class="flex items-center space-x-8">
            <button
              class="text-xs tracking-widest uppercase font-light text-minimal-medium hover:text-minimal-black transition-colors"
              @click="navigateTo('/portfolio')"
            >
              Portfolio
            </button>
            <button
              class="text-xs tracking-widest uppercase font-light text-minimal-black hover:text-accent transition-colors"
              @click="navigateTo('/trips')"
            >
              Trips
            </button>
            <button
              class="text-xs tracking-widest uppercase font-light text-minimal-medium hover:text-minimal-black transition-colors"
              @click="navigateTo('/about')"
            >
              About
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container-minimal py-12">
      <!-- Page Title -->
      <div class="mb-12 text-center">
        <h2 class="text-3xl md:text-4xl font-light text-minimal-black tracking-wide mb-3">
          Travel Journal
        </h2>
        <p class="text-sm text-minimal-medium font-light tracking-wider">
          STORIES AND MEMORIES FROM EVERY JOURNEY
        </p>
      </div>

      <!-- Sort Options -->
      <div class="mb-8 flex justify-center gap-6">
        <button
          class="flex items-center space-x-2 text-xs tracking-widest uppercase font-light transition-colors"
          :class="sortBy === 'date' ? 'text-minimal-black' : 'text-minimal-medium hover:text-minimal-black'"
          @click="toggleSort('date')"
        >
          <span>Date</span>
          <svg 
            v-if="sortBy === 'date'"
            class="w-3 h-3 transition-transform"
            :class="{ 'rotate-180': sortOrder === 'asc' }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          class="flex items-center space-x-2 text-xs tracking-widest uppercase font-light transition-colors"
          :class="sortBy === 'location' ? 'text-minimal-black' : 'text-minimal-medium hover:text-minimal-black'"
          @click="toggleSort('location')"
        >
          <span>Location</span>
          <svg 
            v-if="sortBy === 'location'"
            class="w-3 h-3 transition-transform"
            :class="{ 'rotate-180': sortOrder === 'asc' }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Trips Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        <TripCard
          v-for="trip in sortedTrips"
          :key="trip.id"
          :trip="trip"
          @view-trip="handleViewTrip"
        />
      </div>

      <!-- Archive Navigation (optional) -->
      <div class="mt-16 pt-8 border-t border-minimal-light">
        <div class="flex justify-center">
          <BaseButton variant="secondary" size="md">
            View Archive
          </BaseButton>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <FooterSection />
  </div>
</template>

<style scoped>
/* Ensure no border radius */
div, button, a {
  border-radius: 0 !important;
}
</style>
