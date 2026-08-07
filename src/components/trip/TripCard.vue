<script setup lang="ts">
import { computed } from 'vue'
import BaseImage from '@/components/ui/BaseImage.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

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

interface Props {
  trip: Trip
}

const props = defineProps<Props>()

const emit = defineEmits<{
  viewTrip: [slug: string]
}>()

const handleViewTrip = () => {
  emit('viewTrip', props.trip.slug)
}
</script>

<template>
  <article class="group cursor-pointer" @click="handleViewTrip">
    <div class="overflow-hidden">
      <BaseImage
        :src="trip.heroImage"
        :alt="trip.title"
        aspect-ratio="landscape"
        :lazy="true"
      />
    </div>
    
    <div class="pt-4">
      <p class="text-xs text-minimal-medium tracking-widest uppercase mb-2">
        {{ trip.location }} · {{ trip.dateRange }}
      </p>
      
      <h3 class="text-lg font-light text-minimal-black mb-2 group-hover:text-accent transition-colors duration-300">
        {{ trip.title }}
      </h3>
      
      <p class="text-sm text-minimal-dark leading-relaxed mb-4 line-clamp-2">
        {{ trip.excerpt }}
      </p>
      
      <BaseButton variant="secondary" size="sm">
        Read More →
      </BaseButton>
    </div>
  </article>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

article {
  border-radius: 0 !important;
}
</style>
