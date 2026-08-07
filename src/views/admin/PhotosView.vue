<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { albumService } from '@/services/albumService'
import { photoService, type UploadProgress } from '@/services/photoService'
import { r2Service } from '@/services/r2Service'
import type { Album, Photo } from '@/lib/supabase'
import { formatFileSize } from '@/utils/imageUtils'
import LogoIcon from '@/components/ui/LogoIcon.vue'

const router = useRouter()
const route = useRoute()
const { user, logout } = useAuth()

const albumId = route.params.id as string
const album = ref<Album | null>(null)
const photos = ref<Photo[]>([])
const loading = ref(true)
const uploading = ref(false)
const editingPhoto = ref<Photo | null>(null)
const uploadProgress = ref<Map<string, UploadProgress>>(new Map())
const useR2Storage = ref(true) // Toggle for R2 vs Supabase
const r2Configured = ref(false)

// Computed stats
const uploadStats = computed(() => {
  const progressArray = Array.from(uploadProgress.value.values())
  if (progressArray.length === 0) return null

  const completed = progressArray.filter((p) => p.stage === 'complete').length
  const failed = progressArray.filter((p) => p.stage === 'error').length
  const inProgress = progressArray.length - completed - failed

  const totalOriginalSize = progressArray.reduce(
    (sum, p) => sum + (p.optimizationResult?.originalSize || 0),
    0
  )
  const totalOptimizedSize = progressArray.reduce(
    (sum, p) => sum + (p.optimizationResult?.totalOptimizedSize || 0),
    0
  )
  const totalSavings = totalOriginalSize - totalOptimizedSize
  const savingsPercent =
    totalOriginalSize > 0 ? ((totalSavings / totalOriginalSize) * 100).toFixed(1) : '0'

  return {
    total: progressArray.length,
    completed,
    failed,
    inProgress,
    totalOriginalSize,
    totalOptimizedSize,
    totalSavings,
    savingsPercent,
  }
})

const handleLogout = async () => {
  await logout()
  router.push('/admin/login')
}

const loadData = async () => {
  try {
    loading.value = true
    album.value = await albumService.getById(albumId)
    photos.value = await photoService.getByAlbumId(albumId)
  } catch (error) {
    console.error('Error loading data:', error)
    alert('Error loading album')
    router.push('/admin/albums')
  } finally {
    loading.value = false
  }
}

const handleUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  uploading.value = true
  uploadProgress.value.clear()

  try {
    const nextOrder = await photoService.getNextDisplayOrder(albumId)

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (useR2Storage.value && r2Configured.value) {
        // Use R2 with optimization
        await photoService.uploadWithOptimization(
          albumId,
          file,
          nextOrder + i,
          (progress) => {
            uploadProgress.value.set(progress.photoId, progress)
            // Force reactivity update
            uploadProgress.value = new Map(uploadProgress.value)
          }
        )
      } else {
        // Use legacy Supabase storage
        await photoService.upload(albumId, file, nextOrder + i)
      }
    }

    await photoService.updateAlbumPhotoCount(albumId)
    await loadData()

    if (useR2Storage.value && r2Configured.value) {
      const stats = uploadStats.value
      const progressArray = Array.from(uploadProgress.value.values())
      const totalLqipSize = progressArray.reduce(
        (sum, p) => sum + (p.optimizationResult?.lqipSize || 0),
        0
      )
      
      alert(
        `Successfully uploaded ${files.length} photo(s)!\n\n` +
          `💾 Total savings: ${formatFileSize(stats?.totalSavings || 0)} (${stats?.savingsPercent}%)\n` +
          `Original: ${formatFileSize(stats?.totalOriginalSize || 0)}\n` +
          `Optimized: ${formatFileSize(stats?.totalOptimizedSize || 0)}\n` +
          (totalLqipSize > 0 ? `LQIP: ${formatFileSize(totalLqipSize)}` : '')
      )
    } else {
      alert(`Successfully uploaded ${files.length} photo(s)!`)
    }
  } catch (error: any) {
    console.error('Error uploading:', error)
    alert(`Upload error: ${error.message}`)
  } finally {
    uploading.value = false
    input.value = ''
    // Clear progress after 3 seconds
    setTimeout(() => {
      uploadProgress.value.clear()
    }, 3000)
  }
}

const editPhoto = (photo: Photo) => {
  editingPhoto.value = { ...photo }
}

const savePhoto = async () => {
  if (!editingPhoto.value) return

  try {
    await photoService.update(editingPhoto.value.id, {
      caption_en: editingPhoto.value.caption_en,
      caption_zh: editingPhoto.value.caption_zh,
      description_en: editingPhoto.value.description_en,
      description_zh: editingPhoto.value.description_zh,
    })
    await loadData()
    editingPhoto.value = null
    alert('Photo caption updated!')
  } catch (error) {
    console.error('Error updating photo:', error)
    alert('Error updating photo')
  }
}

const deletePhoto = async (photo: Photo) => {
  if (!confirm('Delete this photo? This cannot be undone.')) return

  try {
    await photoService.delete(photo.id, photo)
    await photoService.updateAlbumPhotoCount(albumId)
    await loadData()
    alert('Photo deleted!')
  } catch (error) {
    console.error('Error deleting photo:', error)
    alert('Error deleting photo')
  }
}

const moveUp = async (photo: Photo) => {
  if (photo.display_order <= 1) return
  try {
    await photoService.swapOrder(photo.id, albumId, photo.display_order - 1)
    await loadData()
  } catch (error) {
    console.error('Error moving photo:', error)
  }
}

const moveDown = async (photo: Photo) => {
  if (photo.display_order >= photos.value.length) return
  try {
    await photoService.swapOrder(photo.id, albumId, photo.display_order + 1)
    await loadData()
  } catch (error) {
    console.error('Error moving photo:', error)
  }
}

const getStorageBadge = (photo: Photo) => {
  if (photo.storage_type === 'r2') {
    return '☁️ R2'
  }
  return '📦 Supabase'
}

onMounted(() => {
  loadData()
  r2Configured.value = r2Service.isConfigured()
  if (!r2Configured.value) {
    useR2Storage.value = false
  }
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
              <button @click="router.push('/admin/albums')" class="text-sm text-minimal-medium hover:text-minimal-black transition-colors font-light tracking-wider uppercase">
                ← Back to Albums
              </button>
            </nav>
          </div>
          <div class="flex items-center space-x-6">
            <span class="text-sm text-minimal-medium font-light">{{ user?.email }}</span>
            <button @click="handleLogout" class="text-sm text-minimal-medium hover:text-minimal-black transition-colors font-light tracking-wider uppercase">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-12">
      <div class="max-w-6xl mx-auto">
        <!-- Album Header -->
        <div v-if="album" class="mb-8">
          <h2 class="text-3xl font-thin text-minimal-dark tracking-[0.2em] uppercase mb-2">
            📸 {{ album.title }}
          </h2>
          <p class="text-sm text-minimal-medium font-light">
            {{ album.location }} • {{ album.continent }} • {{ album.year }} • {{ photos.length }} photos
          </p>
        </div>

        <!-- Upload Section -->
        <div class="bg-white border border-minimal-light p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-light tracking-wide uppercase">Upload Photos</h3>
            
            <!-- Storage Type Toggle -->
            <div v-if="r2Configured" class="flex items-center gap-3">
              <span class="text-xs text-minimal-medium font-light">Storage:</span>
              <button
                @click="useR2Storage = !useR2Storage"
                class="px-3 py-1 text-xs border transition-colors"
                :class="
                  useR2Storage
                    ? 'bg-minimal-black text-white border-minimal-black'
                    : 'border-minimal-light text-minimal-medium hover:border-minimal-dark'
                "
              >
                {{ useR2Storage ? '☁️ R2 (Optimized)' : '📦 Supabase (Legacy)' }}
              </button>
            </div>
            <div v-else class="text-xs text-amber-600">
              ⚠️ R2 not configured - using Supabase Storage
            </div>
          </div>

          <!-- Upload Input -->
          <input
            type="file"
            multiple
            accept="image/*"
            @change="handleUpload"
            :disabled="uploading"
            class="w-full px-4 py-3 border border-minimal-light"
          />

          <!-- Upload Instructions -->
          <div class="mt-3 text-xs text-minimal-medium font-light space-y-1">
            <p v-if="useR2Storage && r2Configured">
              ✨ Photos will be automatically optimized (WebP, 3 variants) and uploaded to Cloudflare R2
            </p>
            <p v-else>📦 Photos will be uploaded to Supabase Storage (no optimization)</p>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploading && uploadProgress.size > 0" class="mt-6">
            <div class="border-t border-minimal-light pt-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-light tracking-wide uppercase">Upload Progress</h4>
                <span class="text-xs text-minimal-medium">
                  {{ uploadStats?.completed || 0 }} / {{ uploadStats?.total || 0 }} complete
                </span>
              </div>

              <!-- Overall Stats -->
              <div
                v-if="uploadStats && uploadStats.totalOriginalSize > 0"
                class="bg-minimal-light bg-opacity-30 p-3 mb-4 text-xs space-y-1"
              >
                <div class="flex justify-between">
                  <span class="text-minimal-medium">Original Size:</span>
                  <span class="font-medium">{{ formatFileSize(uploadStats.totalOriginalSize) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-minimal-medium">Optimized Size:</span>
                  <span class="font-medium text-green-700">{{ formatFileSize(uploadStats.totalOptimizedSize) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-minimal-medium">Total Savings:</span>
                  <span class="font-medium text-green-700">
                    {{ formatFileSize(uploadStats.totalSavings) }} ({{ uploadStats.savingsPercent }}%)
                  </span>
                </div>
              </div>

              <!-- Individual File Progress -->
              <div class="space-y-3 max-h-64 overflow-y-auto">
                <div
                  v-for="[photoId, progress] in uploadProgress.entries()"
                  :key="photoId"
                  class="border border-minimal-light p-3"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-light truncate flex-1">{{ progress.fileName }}</span>
                    <span
                      class="text-xs ml-2"
                      :class="{
                        'text-minimal-medium': progress.stage !== 'complete' && progress.stage !== 'error',
                        'text-green-700': progress.stage === 'complete',
                        'text-red-600': progress.stage === 'error',
                      }"
                    >
                      {{ progress.stage === 'complete' ? '✓ Done' : progress.stage === 'error' ? '✗ Failed' : progress.message }}
                    </span>
                  </div>

                  <!-- Progress Bar -->
                  <div class="w-full bg-minimal-light h-1 mb-2">
                    <div
                      class="h-1 transition-all duration-300"
                      :class="{
                        'bg-minimal-dark': progress.stage !== 'complete' && progress.stage !== 'error',
                        'bg-green-600': progress.stage === 'complete',
                        'bg-red-600': progress.stage === 'error',
                      }"
                      :style="{ width: `${progress.progress}%` }"
                    ></div>
                  </div>

                  <!-- Optimization Results -->
                  <div
                    v-if="progress.optimizationResult"
                    class="text-xs text-minimal-medium space-y-1 mt-2 pt-2 border-t border-minimal-light"
                  >
                    <div class="flex justify-between">
                      <span>Savings:</span>
                      <span class="text-green-700 font-medium">
                        {{ formatFileSize(progress.optimizationResult.originalSize - progress.optimizationResult.totalOptimizedSize) }}
                        ({{ progress.optimizationResult.savingsPercent }}%)
                      </span>
                    </div>
                    <div class="flex gap-2 mt-1">
                      <span
                        v-for="variant in progress.optimizationResult.variants"
                        :key="variant.type"
                        class="px-2 py-0.5 bg-minimal-light text-[10px]"
                      >
                        {{ variant.type }}: {{ formatFileSize(variant.size) }}
                      </span>
                    </div>
                  </div>

                  <!-- Error Message -->
                  <div v-if="progress.error" class="text-xs text-red-600 mt-2">
                    {{ progress.error }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p v-else-if="uploading" class="text-sm text-minimal-medium mt-2">Uploading...</p>
        </div>

        <!-- Photos Grid -->
        <div v-if="loading" class="text-center py-12">
          <p class="text-minimal-medium font-light">Loading photos...</p>
        </div>

        <div v-else-if="photos.length === 0" class="bg-white border border-minimal-light p-12 text-center">
          <p class="text-xl font-light text-minimal-dark mb-4">No photos yet</p>
          <p class="text-sm text-minimal-medium font-light">Upload your first photos above!</p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="photo in photos" :key="photo.id" class="bg-white border border-minimal-light p-3">
            <img :src="photo.thumbnail_url || photo.image_url" :alt="`Photo ${photo.display_order}`" class="w-full aspect-square object-cover mb-3" />
            
            <!-- Storage Badge & Order -->
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs text-minimal-medium">#{{ photo.display_order }}</p>
              <span class="text-[10px] px-1.5 py-0.5 bg-minimal-light">
                {{ getStorageBadge(photo) }}
              </span>
            </div>

            <!-- Dimensions (for R2 photos) -->
            <p v-if="photo.image_width && photo.image_height" class="text-[10px] text-minimal-medium mb-2">
              {{ photo.image_width }}×{{ photo.image_height }}
            </p>

            <div class="flex gap-1 mb-2">
              <button @click="moveUp(photo)" :disabled="photo.display_order <= 1" class="px-2 py-1 text-xs border border-minimal-light">⬆️</button>
              <button @click="moveDown(photo)" :disabled="photo.display_order >= photos.length" class="px-2 py-1 text-xs border border-minimal-light">⬇️</button>
            </div>
            <button @click="editPhoto(photo)" class="w-full px-2 py-1 text-xs bg-minimal-black text-white mb-1">✏️ Edit</button>
            <button @click="deletePhoto(photo)" class="w-full px-2 py-1 text-xs border border-red-500 text-red-500">🗑️</button>
          </div>
        </div>
      </div>
    </main>

    <!-- Edit Modal -->
    <div v-if="editingPhoto" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4" @click.self="editingPhoto = null">
      <div class="bg-white p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-light mb-4">Edit Photo Caption</h3>
        <img :src="editingPhoto.large_url || editingPhoto.image_url" alt="Photo" class="w-full max-h-64 object-contain mb-4" />
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-light mb-2">Caption (English)</label>
            <input v-model="editingPhoto.caption_en" type="text" class="w-full px-3 py-2 border border-minimal-light" />
          </div>
          <div>
            <label class="block text-sm font-light mb-2">Caption (繁體中文)</label>
            <input v-model="editingPhoto.caption_zh" type="text" class="w-full px-3 py-2 border border-minimal-light" />
          </div>
          <div>
            <label class="block text-sm font-light mb-2">Description (English)</label>
            <textarea v-model="editingPhoto.description_en" rows="3" class="w-full px-3 py-2 border border-minimal-light"></textarea>
          </div>
          <div>
            <label class="block text-sm font-light mb-2">Description (繁體中文)</label>
            <textarea v-model="editingPhoto.description_zh" rows="3" class="w-full px-3 py-2 border border-minimal-light"></textarea>
          </div>
        </div>

        <div class="flex gap-4 mt-6">
          <button @click="editingPhoto = null" class="flex-1 px-4 py-2 border border-minimal-light">Cancel</button>
          <button @click="savePhoto" class="flex-1 px-4 py-2 bg-minimal-black text-white">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
div, button, input, textarea {
  border-radius: 0 !important;
}
</style>
