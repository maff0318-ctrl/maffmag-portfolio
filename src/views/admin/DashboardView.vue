<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { albumService } from '@/services/albumService'
import { photoService } from '@/services/photoService'
import LogoIcon from '@/components/ui/LogoIcon.vue'

const router = useRouter()
const { user, logout } = useAuth()

const stats = ref({
  totalAlbums: 0,
  totalPhotos: 0,
  loading: true,
})

const handleLogout = async () => {
  await logout()
  router.push('/admin/login')
}

const loadStats = async () => {
  try {
    stats.value.loading = true
    const [albumCount, photoCount] = await Promise.all([
      albumService.getCount(),
      photoService.getTotalCount(),
    ])
    stats.value.totalAlbums = albumCount
    stats.value.totalPhotos = photoCount
  } catch (error) {
    console.error('Error loading stats:', error)
  } finally {
    stats.value.loading = false
  }
}

onMounted(() => {
  loadStats()
})
</script>

<template>
  <div class="min-h-screen bg-minimal-white">
    <!-- Header -->
    <header class="border-b border-minimal-light bg-white">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-8">
            <LogoIcon color="dark" size="md" />
            <h1 class="text-lg font-light tracking-[0.15em] uppercase text-minimal-dark">
              Admin Dashboard
            </h1>
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
        <h2 class="text-3xl font-thin text-minimal-dark tracking-[0.2em] uppercase mb-8">
          Dashboard
        </h2>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <!-- Total Albums -->
          <div class="bg-white border border-minimal-light p-6">
            <div class="text-4xl font-thin text-minimal-dark mb-2">
              {{ stats.loading ? '...' : stats.totalAlbums }}
            </div>
            <div class="text-xs tracking-widest uppercase text-minimal-medium font-light">
              Total Albums
            </div>
          </div>

          <!-- Total Photos -->
          <div class="bg-white border border-minimal-light p-6">
            <div class="text-4xl font-thin text-minimal-dark mb-2">
              {{ stats.loading ? '...' : stats.totalPhotos }}
            </div>
            <div class="text-xs tracking-widest uppercase text-minimal-medium font-light">
              Total Photos
            </div>
          </div>

          <!-- Storage Used (placeholder) -->
          <div class="bg-white border border-minimal-light p-6">
            <div class="text-4xl font-thin text-minimal-dark mb-2">
              0 MB
            </div>
            <div class="text-xs tracking-widest uppercase text-minimal-medium font-light">
              Storage Used
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white border border-minimal-light p-8 mb-8">
          <h3 class="text-xl font-light text-minimal-dark tracking-wide uppercase mb-6">
            Quick Actions
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              @click="router.push('/admin/albums')"
              class="bg-minimal-black text-minimal-white py-4 px-6 text-sm tracking-widest uppercase font-light hover:bg-minimal-dark transition-colors text-left"
            >
              📂 Manage Albums
            </button>
            <button
              @click="router.push('/admin/albums')"
              class="bg-minimal-white border border-minimal-black text-minimal-black py-4 px-6 text-sm tracking-widest uppercase font-light hover:bg-minimal-black hover:text-minimal-white transition-colors text-left"
            >
              ➕ Create New Album
            </button>
            <button
              @click="router.push('/admin/highlights')"
              class="bg-minimal-black text-minimal-white py-4 px-6 text-sm tracking-widest uppercase font-light hover:bg-minimal-dark transition-colors text-left"
            >
              🏆 Manage Highlights
            </button>
            <button
              @click="router.push('/admin/highlights/create')"
              class="bg-minimal-white border border-minimal-black text-minimal-black py-4 px-6 text-sm tracking-widest uppercase font-light hover:bg-minimal-black hover:text-minimal-white transition-colors text-left"
            >
              ➕ Create New Highlight
            </button>
          </div>
        </div>

        <!-- Getting Started Guide (shows when no albums) -->
        <div v-if="!stats.loading && stats.totalAlbums === 0" class="bg-blue-50 border border-blue-200 p-6">
          <h4 class="text-sm font-light tracking-wide uppercase text-blue-800 mb-3">
            👋 Getting Started
          </h4>
          <ol class="list-decimal list-inside space-y-2 text-sm text-blue-800 font-light">
            <li>Click "Create New Album" to add your first travel destination</li>
            <li>Upload a cover photo and fill in album details</li>
            <li>Add photos to your album with captions</li>
            <li>Changes appear on your public website instantly!</li>
          </ol>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
div, button {
  border-radius: 0 !important;
}
</style>
