<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { recordService } from '@/services/recordService'
import type { TravelRecord } from '@/lib/supabase'
import LogoIcon from '@/components/ui/LogoIcon.vue'

const router = useRouter()
const route = useRoute()
const { user, logout } = useAuth()

const isEditMode = computed(() => route.name === 'admin-highlights-edit')
const recordId = computed(() => route.params.id as string)

const form = ref({
  type: 'highlight' as TravelRecord['type'],
  metric: '',
  location_tag: '',
  year_tag: '',
  is_featured: false,
  is_visible: true,
  // Shared/legacy fields (data, photo, split types)
  title_en: '',
  title_zh: '',
  value: '',
  caption_en: '',
  caption_zh: '',
  grid_size: 'small' as TravelRecord['grid_size'],
})

const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const existingImageUrl = ref<string | null>(null)
const loading = ref(false)
const uploading = ref(false)

const handleLogout = async () => {
  await logout()
  router.push('/admin/login')
}

const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (ev) => {
      imagePreview.value = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (ev) => {
      imagePreview.value = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  if (form.value.type === 'highlight') {
    if (!form.value.metric || !form.value.location_tag) {
      alert('Please fill in the Metric and Location fields')
      return
    }
    if (!isEditMode.value && !imageFile.value) {
      alert('Please select a background photo')
      return
    }
  }

  try {
    loading.value = true

    // Upload/optimize image if a new one was selected
    let imageUrl = existingImageUrl.value || ''
    let lqip: string | undefined

    if (imageFile.value) {
      uploading.value = true
      const idForUpload = isEditMode.value ? recordId.value : crypto.randomUUID()
      const result = await recordService.uploadImage(idForUpload, imageFile.value)
      imageUrl = result.imageUrl
      lqip = result.lqip
      uploading.value = false
    }

    const payload: Partial<TravelRecord> = {
      type: form.value.type,
      is_visible: form.value.is_visible,
      is_featured: form.value.is_featured,
      image_url: imageUrl || undefined,
      ...(lqip ? { image_placeholder_b64: lqip } : {}),
    }

    if (form.value.type === 'highlight') {
      payload.metric = form.value.metric
      payload.location_tag = form.value.location_tag
      payload.year_tag = form.value.year_tag || undefined
      payload.grid_size = form.value.is_featured ? 'medium' : 'small'
    } else {
      payload.title_en = form.value.title_en || undefined
      payload.title_zh = form.value.title_zh || undefined
      payload.value = form.value.value || undefined
      payload.caption_en = form.value.caption_en || undefined
      payload.caption_zh = form.value.caption_zh || undefined
      payload.grid_size = form.value.grid_size
    }

    if (isEditMode.value) {
      await recordService.update(recordId.value, payload)
      alert('Highlight updated successfully!')
    } else {
      const displayOrder = await recordService.getNextDisplayOrder()
      await recordService.create({
        ...payload,
        display_order: displayOrder,
      } as Omit<TravelRecord, 'id' | 'created_at' | 'updated_at'>)
      alert('Highlight created successfully!')
    }

    router.push('/admin/highlights')
  } catch (error: any) {
    console.error('Error saving highlight:', error)
    alert(`Error: ${error.message || 'Failed to save highlight'}`)
  } finally {
    loading.value = false
    uploading.value = false
  }
}

const loadRecord = async () => {
  if (!isEditMode.value) return

  try {
    loading.value = true
    const record = await recordService.getById(recordId.value)
    form.value = {
      type: record.type,
      metric: record.metric || '',
      location_tag: record.location_tag || '',
      year_tag: record.year_tag || '',
      is_featured: record.is_featured || false,
      is_visible: record.is_visible,
      title_en: record.title_en || '',
      title_zh: record.title_zh || '',
      value: record.value || '',
      caption_en: record.caption_en || '',
      caption_zh: record.caption_zh || '',
      grid_size: record.grid_size,
    }
    existingImageUrl.value = record.image_url || null
    imagePreview.value = record.image_url || null
  } catch (error) {
    console.error('Error loading highlight:', error)
    alert('Error loading highlight')
    router.push('/admin/highlights')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isEditMode.value) {
    loadRecord()
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
                @click="router.push('/admin/highlights')"
                class="text-sm text-minimal-medium hover:text-minimal-black transition-colors font-light tracking-wider uppercase"
              >
                Highlights
              </button>
              <span class="text-sm text-minimal-black font-light tracking-wider uppercase">
                {{ isEditMode ? 'Edit Highlight' : 'Create Highlight' }}
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
          {{ isEditMode ? '✏️ Edit Highlight' : '➕ Create New Highlight' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Record Type -->
          <div>
            <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
              Card Type <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.type"
              :disabled="isEditMode"
              class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black disabled:opacity-50"
            >
              <option value="highlight">Highlight (Bento photo card with big metric)</option>
              <option value="data">Data (simple stat card, no photo)</option>
              <option value="photo">Photo (full-bleed image, hover caption)</option>
              <option value="split">Split (two-value comparison)</option>
            </select>
            <p class="text-xs text-minimal-medium font-light mt-2">
              This matches the "Extreme Weather -18°C, Oymyakon, Russia — 2024" style Bento cards on the Highlights page.
            </p>
          </div>

          <!-- HIGHLIGHT type fields -->
          <template v-if="form.type === 'highlight'">
            <!-- Background Photo -->
            <div>
              <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
                Background Photo <span class="text-red-500">*</span>
              </label>
              <div
                @drop="handleDrop"
                @dragover.prevent
                class="border-2 border-dashed border-minimal-light p-8 text-center hover:border-minimal-dark transition-colors cursor-pointer"
                @click="() => ($refs.imageInput as HTMLInputElement)?.click()"
              >
                <div v-if="imagePreview" class="mb-4">
                  <img :src="imagePreview" alt="Preview" loading="eager" class="max-w-full max-h-64 mx-auto" />
                  <p class="text-xs text-minimal-medium mt-2">Click or drag to change</p>
                </div>
                <div v-else>
                  <p class="text-minimal-dark font-light mb-2">📸 Drag & Drop Photo</p>
                  <p class="text-sm text-minimal-medium font-light">
                    or click to browse (JPG, PNG, WebP • Max 10MB)
                  </p>
                </div>
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden"
                  @change="handleImageChange"
                />
              </div>
              <p class="text-xs text-minimal-medium font-light mt-2">
                Automatically resized to max 1200px and converted to WebP on upload - no need to compress it yourself first.
              </p>
            </div>

            <!-- Metric -->
            <div>
              <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
                Hero Metric <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.metric"
                type="text"
                required
                placeholder="e.g., -18°C or 5,364m or 10,400km"
                class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
              />
            </div>

            <!-- Category / Caption -->
            <div>
              <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
                Category Label
              </label>
              <input
                v-model="form.caption_en"
                type="text"
                placeholder="e.g., Extreme Weather"
                class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
              />
            </div>

            <!-- Location & Year -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
                  Location <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.location_tag"
                  type="text"
                  required
                  placeholder="e.g., Oymyakon, Russia"
                  class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
                />
              </div>
              <div>
                <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
                  Year
                </label>
                <input
                  v-model="form.year_tag"
                  type="text"
                  placeholder="e.g., 2024"
                  class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
                />
              </div>
            </div>

            <!-- Featured toggle -->
            <div class="flex items-center gap-3">
              <input
                id="is_featured"
                v-model="form.is_featured"
                type="checkbox"
                class="w-4 h-4"
              />
              <label for="is_featured" class="text-sm text-minimal-dark font-light">
                Featured (spans 2 columns, larger metric text)
              </label>
            </div>
          </template>

          <!-- DATA / PHOTO / SPLIT type fields (legacy card types) -->
          <template v-else>
            <div>
              <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
                Title (English)
              </label>
              <input
                v-model="form.title_en"
                type="text"
                placeholder="e.g., Highest Altitude"
                class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
              />
            </div>
            <div v-if="form.type === 'photo'">
              <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
                Photo <span class="text-red-500">*</span>
              </label>
              <div
                @drop="handleDrop"
                @dragover.prevent
                class="border-2 border-dashed border-minimal-light p-8 text-center hover:border-minimal-dark transition-colors cursor-pointer"
                @click="() => ($refs.imageInput as HTMLInputElement)?.click()"
              >
                <div v-if="imagePreview" class="mb-4">
                  <img :src="imagePreview" alt="Preview" loading="eager" class="max-w-full max-h-64 mx-auto" />
                </div>
                <p v-else class="text-minimal-dark font-light">📸 Drag & Drop or click to browse</p>
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden"
                  @change="handleImageChange"
                />
              </div>
            </div>
            <div v-if="form.type === 'data'">
              <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
                Value
              </label>
              <input
                v-model="form.value"
                type="text"
                placeholder="e.g., 4,810m"
                class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
              />
            </div>
            <div>
              <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
                Caption
              </label>
              <input
                v-model="form.caption_en"
                type="text"
                placeholder="e.g., Mont Blanc Summit, France"
                class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
              />
            </div>
            <div>
              <label class="block text-sm tracking-wider uppercase font-light text-minimal-dark mb-3">
                Grid Size
              </label>
              <select
                v-model="form.grid_size"
                class="w-full px-4 py-3 border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black"
              >
                <option value="small">Small (1x1)</option>
                <option value="medium">Medium (2x1)</option>
                <option value="large">Large (2x2)</option>
              </select>
            </div>
          </template>

          <!-- Visibility toggle -->
          <div class="flex items-center gap-3">
            <input
              id="is_visible"
              v-model="form.is_visible"
              type="checkbox"
              class="w-4 h-4"
            />
            <label for="is_visible" class="text-sm text-minimal-dark font-light">
              Visible on public Highlights page
            </label>
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 pt-6">
            <button
              type="button"
              @click="router.push('/admin/highlights')"
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
              <span v-if="uploading">Optimizing & uploading photo...</span>
              <span v-else-if="loading">Saving...</span>
              <span v-else>{{ isEditMode ? 'Update Highlight' : 'Create Highlight' }}</span>
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
