<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { albumService } from '@/services/albumService'
import type { Album } from '@/lib/supabase'
import LogoIcon from '@/components/ui/LogoIcon.vue'

const router = useRouter()
const { user, logout } = useAuth()

const albums = ref<Album[]>([])
const loading = ref(true)
const filterContinent = ref('All')
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const albumToDelete = ref<Album | null>(null)
const deleteConfirmText = ref('')
const totalAlbumCount = ref(0)

// Cover optimization migration state
const optimizing = ref(false)
const optimizeProgress = ref({ current: 0, total: 0 })
const optimizingAlbumId = ref<string | null>(null)
const optimizeResults = ref<{ title: string; originalKB: number; optimizedKB: number; error?: string }[]>([])
const showOptimizeResults = ref(false)

const continents = [
  'All',
  'Africa',
  'Antarctica',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
]

const filteredAlbums = computed(() => {
  if (filterContinent.value === 'All') {
    return albums.value
  }
  return albums.value.filter(a => a.continent === filterContinent.value)
})

const handleLogout = async () => {
  await logout()
  router.push('/admin/login')
}

const loadAlbums = async () => {
  try {
    loading.value = true
    albums.value = await albumService.getAll()
    totalAlbumCount.value = albums.value.length
  } catch (error) {
    console.error('Error loading albums:', error)
    alert('Error loading albums. Please refresh the page.')
  } finally {
    loading.value = false
  }
}

const moveUp = async (album: Album) => {
  if (album.display_order <= 1) return
  try {
    console.log(`Moving album ${album.id} from ${album.display_order} to ${album.display_order - 1}`)
    await albumService.swapOrder(album.id, album.display_order - 1)
    await loadAlbums()
  } catch (error: any) {
    console.error('Error moving album:', error)
    alert(`Error reordering album: ${error.message || error}`)
  }
}

const moveDown = async (album: Album) => {
  if (album.display_order >= totalAlbumCount.value) return
  try {
    console.log(`Moving album ${album.id} from ${album.display_order} to ${album.display_order + 1}`)
    await albumService.swapOrder(album.id, album.display_order + 1)
    await loadAlbums()
  } catch (error: any) {
    console.error('Error moving album:', error)
    alert(`Error reordering album: ${error.message || error}`)
  }
}

const confirmDelete = (album: Album) => {
  albumToDelete.value = album
  deleteConfirmText.value = ''
  showDeleteModal.value = true
}

const deleteAlbum = async () => {
  if (!albumToDelete.value) return
  
  if (deleteConfirmText.value !== albumToDelete.value.title) {
    alert('Album title does not match. Deletion cancelled.')
    return
  }

  try {
    await albumService.delete(albumToDelete.value.id)
    await albumService.deleteCover(albumToDelete.value.cover_image)
    showDeleteModal.value = false
    albumToDelete.value = null
    deleteConfirmText.value = ''
    await loadAlbums()
    alert('Album deleted successfully!')
  } catch (error) {
    console.error('Error deleting album:', error)
    alert('Error deleting album')
  }
}

onMounted(() => {
  loadAlbums()
})

// Re-optimize a single album's cover (max 800px WebP) without needing to
// re-upload through the edit form.
const optimizeSingleCover = async (album: Album) => {
  optimizingAlbumId.value = album.id
  try {
    const result = await albumService.migrateCoverToOptimized(album)
    await loadAlbums()
    alert(
      `Cover optimized for "${album.title}"\n` +
      `${(result.originalSize / 1024).toFixed(0)} KB → ${(result.optimizedSize / 1024).toFixed(0)} KB`
    )
  } catch (error: any) {
    console.error('Error optimizing cover:', error)
    alert(`Error optimizing cover for "${album.title}": ${error.message || error}`)
  } finally {
    optimizingAlbumId.value = null
  }
}

// Bulk migration: re-optimize every album's cover in one pass
const optimizeAllCovers = async () => {
  if (!confirm(
    `This will re-download and re-optimize the cover image for all ${albums.value.length} albums ` +
    `(resized to max 800px, converted to WebP). This may take a minute. Continue?`
  )) {
    return
  }

  optimizing.value = true
  optimizeResults.value = []
  optimizeProgress.value = { current: 0, total: albums.value.length }

  for (const album of albums.value) {
    optimizeProgress.value.current++
    try {
      const result = await albumService.migrateCoverToOptimized(album)
      optimizeResults.value.push({
        title: album.title,
        originalKB: Math.round(result.originalSize / 1024),
        optimizedKB: Math.round(result.optimizedSize / 1024),
      })
    } catch (error: any) {
      console.error(`Error optimizing cover for album ${album.id}:`, error)
      optimizeResults.value.push({
        title: album.title,
        originalKB: 0,
        optimizedKB: 0,
        error: error.message || String(error),
      })
    }
  }

  optimizing.value = false
  showOptimizeResults.value = true
  await loadAlbums()
}

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
              <span class="text-sm text-minimal-black font-light tracking-wider uppercase">
                Albums
              </span>
              <button
                @click="router.push('/admin/highlights')"
                class="text-sm text-minimal-medium hover:text-minimal-black transition-colors font-light tracking-wider uppercase"
              >
                Highlights
              </button>
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
            📂 Manage Albums
          </h2>
          <div class="flex gap-3">
            <button
              @click="optimizeAllCovers"
              :disabled="optimizing || loading || albums.length === 0"
              class="border border-minimal-black text-minimal-black py-3 px-6 text-sm tracking-widest uppercase font-light hover:bg-minimal-black hover:text-minimal-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Resize + convert every album cover to a faster-loading 800px WebP version"
            >
              <span v-if="optimizing">⏳ Optimizing {{ optimizeProgress.current }}/{{ optimizeProgress.total }}...</span>
              <span v-else>⚡ Optimize All Covers</span>
            </button>
            <button
              @click="router.push('/admin/albums/create')"
              class="bg-minimal-black text-minimal-white py-3 px-6 text-sm tracking-widest uppercase font-light hover:bg-minimal-dark transition-colors"
            >
              ➕ Create Album
            </button>
          </div>
        </div>

        <!-- Optimize All Covers - Progress Bar -->
        <div v-if="optimizing" class="bg-white border border-minimal-light p-4 mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs tracking-widest uppercase text-minimal-medium font-light">
              Optimizing covers, please keep this tab open...
            </span>
            <span class="text-xs text-minimal-dark font-light">
              {{ optimizeProgress.current }} / {{ optimizeProgress.total }}
            </span>
          </div>
          <div class="h-1 bg-minimal-light">
            <div
              class="h-full bg-minimal-black transition-all duration-300"
              :style="{ width: `${(optimizeProgress.current / Math.max(optimizeProgress.total, 1)) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white border border-minimal-light p-4 mb-6">
          <div class="flex items-center space-x-4">
            <label class="text-xs tracking-widest uppercase text-minimal-medium font-light">
              Filter:
            </label>
            <select
              v-model="filterContinent"
              class="px-4 py-2 border border-minimal-light text-sm font-light focus:outline-none focus:border-minimal-black"
            >
              <option v-for="continent in continents" :key="continent" :value="continent">
                {{ continent }}
              </option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <p class="text-minimal-medium font-light">Loading albums...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredAlbums.length === 0" class="bg-white border border-minimal-light p-12 text-center">
          <p class="text-xl font-light text-minimal-dark mb-4">
            {{ filterContinent === 'All' ? 'No albums yet' : `No albums in ${filterContinent}` }}
          </p>
          <p class="text-sm text-minimal-medium font-light mb-6">
            {{ filterContinent === 'All' 
              ? 'Create your first album to get started!' 
              : 'Try selecting a different continent or create a new album.' 
            }}
          </p>
          <button
            @click="router.push('/admin/albums/create')"
            class="bg-minimal-black text-minimal-white py-3 px-6 text-sm tracking-widest uppercase font-light hover:bg-minimal-dark transition-colors"
          >
            ➕ Create First Album
          </button>
        </div>

        <!-- Albums List -->
        <div v-else class="space-y-4">
          <div
            v-for="album in filteredAlbums"
            :key="album.id"
            class="bg-white border border-minimal-light p-6 hover:border-minimal-dark transition-colors"
          >
            <div class="flex gap-6">
              <!-- Cover Image -->
              <div class="flex-shrink-0 w-40 h-40 bg-minimal-light overflow-hidden">
                <img
                  :src="album.cover_image"
                  :alt="album.title"
                  loading="lazy"
                  decoding="async"
                  class="w-full h-full object-cover"
                />
              </div>

              <!-- Album Info -->
              <div class="flex-1">
                <h3 class="text-xl font-light text-minimal-dark tracking-wide uppercase mb-2">
                  {{ album.title }}
                </h3>
                <p class="text-sm text-minimal-medium font-light mb-3">
                  {{ album.location }} • {{ album.continent }} • {{ album.year }}
                </p>
                <p class="text-sm text-minimal-medium font-light mb-3">
                  {{ album.photo_count }} photos • Display Order: #{{ album.display_order }}
                </p>
                <p v-if="album.description" class="text-sm text-minimal-dark font-light line-clamp-2">
                  {{ album.description }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex-shrink-0 flex flex-col gap-2">
                <!-- Reorder Buttons -->
                <div class="flex gap-1">
                  <button
                    @click="moveUp(album)"
                    :disabled="album.display_order <= 1"
                    :class="[
                      'px-3 py-2 text-sm border border-minimal-light transition-colors',
                      album.display_order <= 1
                        ? 'text-minimal-light cursor-not-allowed'
                        : 'text-minimal-dark hover:bg-minimal-light'
                    ]"
                    title="Move up"
                  >
                    ⬆️
                  </button>
                  <button
                    @click="moveDown(album)"
                    :disabled="album.display_order >= totalAlbumCount"
                    :class="[
                      'px-3 py-2 text-sm border border-minimal-light transition-colors',
                      album.display_order >= totalAlbumCount
                        ? 'text-minimal-light cursor-not-allowed'
                        : 'text-minimal-dark hover:bg-minimal-light'
                    ]"
                    title="Move down"
                  >
                    ⬇️
                  </button>
                </div>

                <!-- Edit Button -->
                <button
                  @click="router.push(`/admin/albums/${album.id}/edit`)"
                  class="px-4 py-2 text-sm border border-minimal-black text-minimal-black hover:bg-minimal-black hover:text-minimal-white transition-colors font-light tracking-wider"
                >
                  ✏️ Edit
                </button>

                <!-- Photos Button -->
                <button
                  @click="router.push(`/admin/albums/${album.id}/photos`)"
                  class="px-4 py-2 text-sm bg-minimal-black text-minimal-white hover:bg-minimal-dark transition-colors font-light tracking-wider"
                >
                  📸 Photos
                </button>

                <!-- Optimize Cover Button -->
                <button
                  @click="optimizeSingleCover(album)"
                  :disabled="optimizingAlbumId === album.id || optimizing"
                  class="px-4 py-2 text-sm border border-minimal-light text-minimal-dark hover:bg-minimal-light transition-colors font-light tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Resize + convert this cover to a faster-loading 800px WebP version"
                >
                  <span v-if="optimizingAlbumId === album.id">⏳ Optimizing...</span>
                  <span v-else>⚡ Optimize Cover</span>
                </button>

                <!-- Delete Button -->
                <button
                  @click="confirmDelete(album)"
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
        <p class="text-sm text-minimal-dark font-light mb-4">
          You are about to delete <strong>"{{ albumToDelete?.title }}"</strong>.
        </p>
        <p class="text-sm text-red-600 font-light mb-4">
          This will permanently delete the album and all <strong>{{ albumToDelete?.photo_count }} photos</strong>. 
          This action cannot be undone!
        </p>
        <p class="text-sm text-minimal-dark font-light mb-2">
          Type the album title to confirm:
        </p>
        <input
          v-model="deleteConfirmText"
          type="text"
          :placeholder="albumToDelete?.title"
          class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-red-500 mb-6"
        />
        <div class="flex gap-4">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-3 border border-minimal-light text-minimal-dark hover:bg-minimal-light transition-colors font-light tracking-wider uppercase text-sm"
          >
            Cancel
          </button>
          <button
            @click="deleteAlbum"
            :disabled="deleteConfirmText !== albumToDelete?.title"
            :class="[
              'flex-1 px-4 py-3 text-white font-light tracking-wider uppercase text-sm transition-colors',
              deleteConfirmText === albumToDelete?.title
                ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
                : 'bg-red-300 cursor-not-allowed'
            ]"
          >
            Delete Album
          </button>
        </div>
      </div>
    </div>

    <!-- Optimize All Covers - Results Summary Modal -->
    <div
      v-if="showOptimizeResults"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      @click.self="showOptimizeResults = false"
    >
      <div class="bg-white p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <h3 class="text-xl font-light text-minimal-dark tracking-wide uppercase mb-4">
          ⚡ Cover Optimization Complete
        </h3>
        <div class="space-y-3 mb-6">
          <div
            v-for="result in optimizeResults"
            :key="result.title"
            class="flex items-center justify-between text-sm border-b border-minimal-light pb-2"
          >
            <span class="text-minimal-dark font-light">{{ result.title }}</span>
            <span v-if="result.error" class="text-red-500 font-light text-xs">
              Failed: {{ result.error }}
            </span>
            <span v-else class="text-minimal-medium font-light text-xs">
              {{ result.originalKB }} KB → {{ result.optimizedKB }} KB
            </span>
          </div>
        </div>
        <button
          @click="showOptimizeResults = false"
          class="w-full px-4 py-3 bg-minimal-black text-minimal-white hover:bg-minimal-dark transition-colors font-light tracking-wider uppercase text-sm"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
div, button, select, input {
  border-radius: 0 !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
