<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { albumService } from '@/services/albumService'
import type { Album } from '@/lib/supabase'
import LogoIcon from '@/components/ui/LogoIcon.vue'

const router = useRouter()
const route = useRoute()
const { user, logout } = useAuth()

const isEditMode = computed(() => route.name === 'admin-albums-edit')
const albumId = computed(() => route.params.id as string)

const form = ref({
  title: '',
  title_zh: '',
  location: '',
  continent: 'Asia' as string,
  year: new Date().getFullYear(),
  description: '',
  description_zh: '',
  cover_image: '',
})

const coverFile = ref<File | null>(null)
const coverPreview = ref<string | null>(null)
const loading = ref(false)
const uploading = ref(false)

const continents = [
  'Africa',
  'Antarctica',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
]

const handleLogout = async () => {
  await logout()
  router.push('/admin/login')
}

const handleCoverChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    coverFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      coverPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    coverFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      coverPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  // Validation
  if (!form.value.title || !form.value.location || !form.value.continent || !form.value.year) {
    alert('Please fill in all required fields')
    return
  }

  if (!isEditMode.value && !coverFile.value) {
    alert('Please select a cover image')
    return
  }

  if (form.value.year < 1900 || form.value.year > 2100) {
    alert('Please enter a valid year')
    return
  }

  try {
    loading.value = true

    if (isEditMode.value) {
      // Update existing album
      let coverUrl = form.value.cover_image

      if (coverFile.value) {
        uploading.value = true
        const result = await albumService.uploadCover(albumId.value, coverFile.value)
        coverUrl = result.coverUrl
        uploading.value = false
        
        // Update with LQIP
        await albumService.update(albumId.value, {
          title: form.value.title,
          title_zh: form.value.title_zh || undefined,
          location: form.value.location,
          continent: form.value.continent,
          year: form.value.year,
          description: form.value.description || undefined,
          description_zh: form.value.description_zh || undefined,
          cover_image: coverUrl,
          cover_placeholder_b64: result.lqip,
        } as Partial<Album>)
      } else {
        // No new cover, just update metadata
        await albumService.update(albumId.value, {
          title: form.value.title,
          title_zh: form.value.title_zh || undefined,
          location: form.value.location,
          continent: form.value.continent,
          year: form.value.year,
          description: form.value.description || undefined,
          description_zh: form.value.description_zh || undefined,
          cover_image: coverUrl,
        } as Partial<Album>)
      }

      alert('Album updated successfully!')
      router.push('/admin/albums')
    } else {
      // Create new album
      uploading.value = true
      
      // Get next display order
      const displayOrder = await albumService.getNextDisplayOrder()
      
      // Upload cover first to get temporary ID
      const tempId = crypto.randomUUID()
      const coverResult = await albumService.uploadCover(tempId, coverFile.value!)
      uploading.value = false

      await albumService.create({
        title: form.value.title,
        title_zh: form.value.title_zh || undefined,
        location: form.value.location,
        continent: form.value.continent,
        year: form.value.year,
        description: form.value.description || undefined,
        description_zh: form.value.description_zh || undefined,
        cover_image: coverResult.coverUrl,
        cover_placeholder_b64: coverResult.lqip,
        photo_count: 0,
        display_order: displayOrder,
      } as Omit<Album, 'id' | 'created_at' | 'updated_at'>)

      alert('Album created successfully!')
      router.push('/admin/albums')
    }
  } catch (error: any) {
    console.error('Error saving album:', error)
    alert(`Error: ${error.message || 'Failed to save album'}`)
  } finally {
    loading.value = false
    uploading.value = false
  }
}

const loadAlbum = async () => {
  if (!isEditMode.value) return

  try {
    loading.value = true
    const album = await albumService.getById(albumId.value)
    form.value = {
      title: album.title,
      title_zh: album.title_zh || '',
      location: album.location,
      continent: album.continent,
      year: album.year,
      description: album.description || '',
      description_zh: album.description_zh || '',
      cover_image: album.cover_image,
    }
    coverPreview.value = album.cover_image
  } catch (error) {
    console.error('Error loading album:', error)
    alert('Error loading album')
    router.push('/admin/albums')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isEditMode.value) {
    loadAlbum()
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
                {{ isEditMode ? 'Edit Album' : 'Create Album' }}
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
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl font-thin text-minimal-dark tracking-[0.2em] uppercase mb-8">
          {{ isEditMode ? '✏️ Edit Album' : '➕ Create New Album' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Cover Image -->
          <div>
            <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
              Cover Image <span class="text-red-500">*</span>
            </label>
            <div
              @drop="handleDrop"
              @dragover.prevent
              class="border-2 border-dashed border-minimal-light p-8 text-center hover:border-minimal-dark transition-colors cursor-pointer"
              @click="() => ($refs.coverInput as HTMLInputElement)?.click()"
            >
              <div v-if="coverPreview" class="mb-4">
                <img :src="coverPreview" alt="Cover preview" loading="eager" class="max-w-full max-h-64 mx-auto" />
                <p class="text-xs text-minimal-medium mt-2">Click or drag to change</p>
              </div>
              <div v-else>
                <p class="text-minimal-dark font-light mb-2">📸 Drag & Drop Cover Image</p>
                <p class="text-sm text-minimal-medium font-light">
                  or click to browse (JPG, PNG, WebP • Max 10MB)
                </p>
              </div>
              <input
                ref="coverInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="handleCoverChange"
              />
            </div>
          </div>

          <!-- Title (English) -->
          <div>
            <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
              Album Title (English) <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="e.g., Kyoto Temples"
              class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
            />
          </div>

          <!-- Title (Chinese) -->
          <div>
            <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
              Album Title (繁體中文)
            </label>
            <input
              v-model="form.title_zh"
              type="text"
              placeholder="例如：京都寺廟"
              class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
            />
          </div>

          <!-- Location & Continent -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
                Location <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.location"
                type="text"
                required
                placeholder="e.g., Kyoto"
                class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
              />
            </div>
            <div>
              <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
                Continent <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.continent"
                required
                class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
              >
                <option v-for="continent in continents" :key="continent" :value="continent">
                  {{ continent }}
                </option>
              </select>
            </div>
          </div>

          <!-- Year -->
          <div>
            <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
              Year <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.year"
              type="number"
              required
              min="1900"
              max="2100"
              placeholder="2023"
              class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
            />
          </div>

          <!-- Description (English) -->
          <div>
            <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
              Description (English)
            </label>
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Brief description of this album..."
              class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black resize-none"
            />
          </div>

          <!-- Description (Chinese) -->
          <div>
            <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
              Description (繁體中文)
            </label>
            <textarea
              v-model="form.description_zh"
              rows="4"
              placeholder="相簿的簡短描述..."
              class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black resize-none"
            />
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 pt-6">
            <button
              type="button"
              @click="router.push('/admin/albums')"
              :disabled="loading"
              class="flex-1 px-6 py-4 border border-minimal-light text-minimal-dark hover:bg-minimal-light transition-colors font-light tracking-wider uppercase disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading || uploading"
              class="flex-1 px-6 py-4 bg-minimal-black text-minimal-white hover:bg-minimal-dark transition-colors font-light tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="uploading">Uploading image...</span>
              <span v-else-if="loading">Saving...</span>
              <span v-else>{{ isEditMode ? 'Update Album' : 'Create Album' }}</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>
div, button, select, input, textarea {
  border-radius: 0 !important;
}
</style>
