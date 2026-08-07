<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { recordService } from '@/services/recordService'
import type { TravelRecord } from '@/lib/supabase'
import LogoIcon from '@/components/ui/LogoIcon.vue'

const router = useRouter()
const { user, logout } = useAuth()

const records = ref<TravelRecord[]>([])
const loading = ref(true)
const filterType = ref('All')
const showDeleteModal = ref(false)
const recordToDelete = ref<TravelRecord | null>(null)
const totalRecordCount = ref(0)

const types = ['All', 'highlight', 'data', 'photo', 'split']

const filteredRecords = computed(() => {
  if (filterType.value === 'All') {
    return records.value
  }
  return records.value.filter(r => r.type === filterType.value)
})

const handleLogout = async () => {
  await logout()
  router.push('/admin/login')
}

const loadRecords = async () => {
  try {
    loading.value = true
    // Use getAllAdmin() — fetches ALL records regardless of visibility so
    // hidden or incomplete items always appear here and can be edited/deleted.
    records.value = await recordService.getAllAdmin()
    totalRecordCount.value = records.value.length
  } catch (error) {
    console.error('Error loading records:', error)
    alert('Error loading records. Please refresh the page.')
  } finally {
    loading.value = false
  }
}

const moveUp = async (record: TravelRecord) => {
  if (record.display_order <= 1) return
  try {
    await recordService.swapOrder(record.id, record.display_order - 1)
    await loadRecords()
  } catch (error: any) {
    console.error('Error moving record:', error)
    alert(`Error reordering: ${error.message || error}`)
  }
}

const moveDown = async (record: TravelRecord) => {
  if (record.display_order >= totalRecordCount.value) return
  try {
    await recordService.swapOrder(record.id, record.display_order + 1)
    await loadRecords()
  } catch (error: any) {
    console.error('Error moving record:', error)
    alert(`Error reordering: ${error.message || error}`)
  }
}

const toggleVisibility = async (record: TravelRecord) => {
  try {
    await recordService.toggleVisibility(record.id)
    await loadRecords()
  } catch (error: any) {
    console.error('Error toggling visibility:', error)
    alert(`Error: ${error.message || error}`)
  }
}

const confirmDelete = (record: TravelRecord) => {
  recordToDelete.value = record
  showDeleteModal.value = true
}

const deleteRecord = async () => {
  if (!recordToDelete.value) return
  try {
    if (recordToDelete.value.image_url) {
      await recordService.deleteImage(recordToDelete.value.image_url)
    }
    await recordService.delete(recordToDelete.value.id)
    showDeleteModal.value = false
    recordToDelete.value = null
    await loadRecords()
  } catch (error) {
    console.error('Error deleting record:', error)
    alert('Error deleting record')
  }
}

// Display label for a record, based on its type
const recordLabel = (record: TravelRecord) => {
  if (record.type === 'highlight') return record.metric || record.title_en || 'Untitled'
  if (record.type === 'data') return record.value || record.title_en || 'Untitled'
  return record.title_en || 'Untitled'
}

onMounted(() => {
  loadRecords()
})
</script>

<template>
  <div class="min-h-screen bg-minimal-white">
    <!-- Header -->
    <header class="border-b border-minimal-light bg-white sticky top-0 z-10">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-8">
            <div class="cursor-pointer" @click="router.push('/admin/dashboard')">
              <LogoIcon color="dark" size="md" />
            </div>
            <nav class="flex items-center space-x-6">
              <button
                @click="router.push('/admin/dashboard')"
                class="text-sm text-minimal-medium hover:text-minimal-black transition-colors font-light tracking-wider uppercase"
              >
                Dashboard
              </button>
              <button
                @click="router.push('/admin/albums')"
                class="text-sm text-minimal-medium hover:text-minimal-black transition-colors font-light tracking-wider uppercase"
              >
                Albums
              </button>
              <span class="text-sm text-minimal-black font-light tracking-wider uppercase">
                Highlights
              </span>
            </nav>
          </div>
          <div class="flex items-center space-x-6">
            <span class="text-sm text-minimal-medium font-light">
              {{ user?.email }}
            </span>
            <button
              @click="handleLogout"
              class="text-sm text-minimal-medium hover:text-minimal-black transition-colors font-light tracking-wider uppercase"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-12">
      <div class="max-w-6xl mx-auto">
        <!-- Page Header -->
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-thin text-minimal-dark tracking-[0.2em] uppercase">
            🏆 Manage Highlights
          </h2>
          <button
            @click="router.push('/admin/highlights/create')"
            class="bg-minimal-black text-minimal-white py-3 px-6 text-sm tracking-widest uppercase font-light hover:bg-minimal-dark transition-colors"
          >
            ➕ Create Highlight
          </button>
        </div>

        <p class="text-sm text-minimal-medium font-light mb-6">
          These records populate the public "Highlights" (旅行之最) page. The
          "Bento Extreme" cards (with a photo background + big metric like
          "-18°C") use the <strong>highlight</strong> type - uploaded images
          are automatically resized and converted to WebP.
        </p>

        <!-- Filters -->
        <div class="bg-white border border-minimal-light p-4 mb-6">
          <div class="flex items-center space-x-4">
            <label class="text-xs tracking-widest uppercase text-minimal-medium font-light">
              Filter:
            </label>
            <select
              v-model="filterType"
              class="px-4 py-2 border border-minimal-light text-sm font-light focus:outline-none focus:border-minimal-black"
            >
              <option v-for="type in types" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <p class="text-minimal-medium font-light">Loading highlights...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredRecords.length === 0" class="bg-white border border-minimal-light p-12 text-center">
          <p class="text-xl font-light text-minimal-dark mb-4">
            {{ filterType === 'All' ? 'No highlights yet' : `No ${filterType} records` }}
          </p>
          <p class="text-sm text-minimal-medium font-light mb-6">
            The public page will show sample preview cards until you add your own.
          </p>
          <button
            @click="router.push('/admin/highlights/create')"
            class="bg-minimal-black text-minimal-white py-3 px-6 text-sm tracking-widest uppercase font-light hover:bg-minimal-dark transition-colors"
          >
            ➕ Create First Highlight
          </button>
        </div>

        <!-- Records List -->
        <div v-else class="space-y-4">
          <div
            v-for="record in filteredRecords"
            :key="record.id"
            class="bg-white border border-minimal-light p-6 hover:border-minimal-dark transition-colors"
            :class="{ 'opacity-50': !record.is_visible }"
          >
            <div class="flex gap-6">
              <!-- Preview Image (highlight/photo types) -->
              <div
                v-if="record.image_url"
                class="flex-shrink-0 w-40 h-28 bg-minimal-light overflow-hidden"
              >
                <img
                  :src="record.image_url"
                  :alt="recordLabel(record)"
                  loading="lazy"
                  decoding="async"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="flex-shrink-0 w-40 h-28 bg-minimal-light flex items-center justify-center text-minimal-light text-xs uppercase tracking-wide"
              >
                No image
              </div>

              <!-- Record Info -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-[10px] tracking-widest uppercase bg-minimal-dark text-white px-2 py-1">
                    {{ record.type }}
                  </span>
                  <span v-if="!record.is_visible" class="text-[10px] tracking-widest uppercase bg-red-100 text-red-600 px-2 py-1">
                    Hidden
                  </span>
                  <span v-if="record.is_featured" class="text-[10px] tracking-widest uppercase bg-amber-100 text-amber-700 px-2 py-1">
                    Featured
                  </span>
                </div>
                <h3 class="text-xl font-light text-minimal-dark tracking-wide mb-2">
                  {{ recordLabel(record) }}
                </h3>
                <p class="text-sm text-minimal-medium font-light">
                  {{ record.location_tag || record.caption_en }}
                  <span v-if="record.year_tag"> — {{ record.year_tag }}</span>
                </p>
                <p class="text-xs text-minimal-medium font-light mt-1">
                  Display Order: #{{ record.display_order }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex-shrink-0 flex flex-col gap-2">
                <!-- Reorder Buttons -->
                <div class="flex gap-1">
                  <button
                    @click="moveUp(record)"
                    :disabled="record.display_order <= 1"
                    :class="[
                      'px-3 py-2 text-sm border border-minimal-light transition-colors',
                      record.display_order <= 1
                        ? 'text-minimal-light cursor-not-allowed'
                        : 'text-minimal-dark hover:bg-minimal-light'
                    ]"
                    title="Move up"
                  >
                    ⬆️
                  </button>
                  <button
                    @click="moveDown(record)"
                    :disabled="record.display_order >= totalRecordCount"
                    :class="[
                      'px-3 py-2 text-sm border border-minimal-light transition-colors',
                      record.display_order >= totalRecordCount
                        ? 'text-minimal-light cursor-not-allowed'
                        : 'text-minimal-dark hover:bg-minimal-light'
                    ]"
                    title="Move down"
                  >
                    ⬇️
                  </button>
                </div>

                <!-- Visibility Toggle -->
                <button
                  @click="toggleVisibility(record)"
                  class="px-4 py-2 text-sm border border-minimal-light text-minimal-dark hover:bg-minimal-light transition-colors font-light tracking-wider"
                >
                  {{ record.is_visible ? '🙈 Hide' : '👁️ Show' }}
                </button>

                <!-- Edit Button -->
                <button
                  @click="router.push(`/admin/highlights/${record.id}/edit`)"
                  class="px-4 py-2 text-sm border border-minimal-black text-minimal-black hover:bg-minimal-black hover:text-minimal-white transition-colors font-light tracking-wider"
                >
                  ✏️ Edit
                </button>

                <!-- Delete Button -->
                <button
                  @click="confirmDelete(record)"
                  class="px-4 py-2 text-sm border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-light tracking-wider"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-white p-8 max-w-md w-full border-2 border-red-500">
        <h3 class="text-xl font-light text-minimal-dark tracking-wide uppercase mb-4">
          ⚠️ Confirm Deletion
        </h3>
        <p class="text-sm text-minimal-dark font-light mb-6">
          Delete this highlight? This action cannot be undone.
        </p>
        <div class="flex gap-4">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-3 border border-minimal-light text-minimal-dark hover:bg-minimal-light transition-colors font-light tracking-wider uppercase text-sm"
          >
            Cancel
          </button>
          <button
            @click="deleteRecord"
            class="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-light tracking-wider uppercase text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
div, button, select, input {
  border-radius: 0 !important;
}
</style>
