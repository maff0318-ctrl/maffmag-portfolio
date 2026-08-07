<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { recordService } from '@/services/recordService'
import { useLanguage } from '@/composables/useLanguage'
import type { TravelRecord } from '@/lib/supabase'
import AppHeader from '@/components/layout/AppHeader.vue'
import DataCard from '@/components/records/DataCard.vue'
import PhotoRecordCard from '@/components/records/PhotoRecordCard.vue'
import SplitCard from '@/components/records/SplitCard.vue'
import HighlightCard from '@/components/records/HighlightCard.vue'

const { t, currentLang } = useLanguage()

const records = ref<TravelRecord[]>([])
const isLoading = ref(true)

// "highlight" type records (Bento photo cards with a big metric) render via
// HighlightCard in the 3-column grid. All other types (data/photo/split)
// keep using the original 4-column CMS grid below.
const highlightRecords = computed(() => records.value.filter(r => r.type === 'highlight'))
const legacyRecords = computed(() => records.value.filter(r => r.type !== 'highlight'))

const loadRecords = async () => {
  try {
    isLoading.value = true
    // Use getAllAdmin so records appear regardless of is_visible — the admin
    // controls visibility for future use, but shouldn't gate public display
    // for a personal site where all published content is intentionally shown.
    records.value = await recordService.getAllAdmin()
    console.log('✅ Loaded records:', records.value.length)
    console.log('📋 Record types:', records.value.map(r => r.type))
    console.log('🔦 Highlight records:', records.value.filter(r => r.type === 'highlight').length)
  } catch (error) {
    console.error('❌ Error loading records:', error)
  } finally {
    isLoading.value = false
  }
}

// Get grid class based on card size
const getGridClass = (size: string) => {
  switch (size) {
    case 'medium':
      return 'md:col-span-2' // 2 columns wide on desktop
    case 'large':
      return 'md:col-span-2 md:row-span-2' // 2x2 on desktop
    default:
      return '' // 1x1 (default)
  }
}

// Sample highlight data REMOVED — the public page now shows only real CMS
// records from Supabase. If there are no highlight records yet, a clean
// empty state is shown instead. This prevents ghost items appearing on the
// frontend that don't exist in the database and can't be managed via admin.

onMounted(() => {
  loadRecords()
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <AppHeader position="fixed" />

    <!-- Main Content -->
    <main class="pt-24 pb-16 min-h-[calc(100vh-100px)]">
      <!-- Loading State - occupies the same vertical space as the loaded
           Bento Grid so content never pops/shifts when data resolves. -->
      <div v-if="isLoading" class="container mx-auto px-6 mb-4">
        <div class="flex items-center justify-center min-h-[calc(100vh-220px)]">
          <p class="text-sm tracking-[0.2em] uppercase text-minimal-medium font-light">
            Loading...
          </p>
        </div>
      </div>

      <!-- Bento Grid: "Travel Extreme" highlight cards (photo + big metric) -->
      <div v-else class="container mx-auto px-6 mb-4">
        <!-- Bento Grid: real CMS highlight records only -->
        <div v-if="highlightRecords.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-3 auto-rows-[320px]">
          <div
            v-for="record in highlightRecords"
            :key="record.id"
            :class="record.is_featured ? 'md:col-span-2' : 'md:col-span-1'"
          >
            <HighlightCard
              :metric="record.metric || ''"
              :category="record.caption_en || ''"
              :location="record.location_tag || ''"
              :year="record.year_tag || ''"
              :image="record.image_url || ''"
              :featured="record.is_featured"
            />
          </div>
        </div>

        <!-- Empty state: no hardcoded fallbacks — admin must add real records -->
        <div v-else class="flex flex-col items-center justify-center min-h-[320px]">
          <p class="text-xs tracking-[0.25em] uppercase text-neutral-400 font-sans">
            Highlights coming soon.
          </p>
        </div>
      </div>

      <!-- Bento Grid: legacy CMS-managed records (data/photo/split types) -->
      <div v-if="legacyRecords.length > 0" class="container mx-auto px-6">
        <div class="bento-grid grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-fr">
          <div
            v-for="record in legacyRecords"
            :key="record.id"
            :class="getGridClass(record.grid_size)"
            class="bento-grid-item"
          >
            <!-- Data Card -->
            <DataCard v-if="record.type === 'data'" :record="record" />
            
            <!-- Photo Card -->
            <PhotoRecordCard v-else-if="record.type === 'photo'" :record="record" />
            
            <!-- Split Card -->
            <SplitCard v-else-if="record.type === 'split'" :record="record" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Remove all border radius, EXCEPT the Highlights Bento cards, which use
   rounded-2xl by explicit design request (an intentional exception to the
   site-wide sharp-corner token). Vue's scoped CSS applies to a child
   component's root element too, so this exclusion is required here or it
   would silently override HighlightCard's own rounded-2xl class. */
div:not(.highlight-card), button {
  border-radius: 0 !important;
}

/* Bento Grid Configuration */
.bento-grid {
  grid-auto-rows: minmax(240px, auto);
}

/* Ensure grid items fill their container */
.bento-grid-item {
  display: flex;
  flex-direction: column;
}

.bento-grid-item > * {
  flex: 1;
}

/* Mobile: single column, all items equal height */
@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: 300px;
  }
}

/* Desktop: 4-column grid with flexible sizing */
@media (min-width: 768px) {
  .bento-grid {
    grid-auto-rows: 240px;
  }
}
</style>
