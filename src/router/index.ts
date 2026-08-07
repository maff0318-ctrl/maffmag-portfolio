import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'splash',
      component: () => import('@/views/SplashView.vue'),
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: () => import('@/views/PortfolioView.vue'),
    },
    {
      path: '/footprints',
      name: 'footprints',
      component: () => import('@/views/FootprintsView.vue'),
    },
    {
      path: '/records',
      name: 'records',
      component: () => import('@/views/RecordsView.vue'),
    },
    {
      path: '/album/:id',
      name: 'album-detail',
      component: () => import('@/views/AlbumDetailView.vue'),
    },
    {
      path: '/trips',
      name: 'trips',
      component: () => import('@/views/TripsView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/ContactView.vue'),
    },
    // Admin routes
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/admin',
      redirect: '/admin/dashboard',
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/views/admin/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/albums',
      name: 'admin-albums',
      component: () => import('@/views/admin/AlbumsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/albums/create',
      name: 'admin-albums-create',
      component: () => import('@/views/admin/AlbumFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/albums/:id/edit',
      name: 'admin-albums-edit',
      component: () => import('@/views/admin/AlbumFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/albums/:id/photos',
      name: 'admin-photos',
      component: () => import('@/views/admin/PhotosView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/highlights',
      name: 'admin-highlights',
      component: () => import('@/views/admin/RecordsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/highlights/create',
      name: 'admin-highlights-create',
      component: () => import('@/views/admin/RecordFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/highlights/:id/edit',
      name: 'admin-highlights-edit',
      component: () => import('@/views/admin/RecordFormView.vue'),
      meta: { requiresAuth: true },
    },
    // 404 — must be last
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, checkAuth } = useAuth()
  await checkAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Redirect to login if trying to access protected route
    next('/admin/login')
  } else if (to.meta.requiresGuest && isAuthenticated.value) {
    // Redirect to dashboard if already logged in and trying to access login page
    next('/admin/dashboard')
  } else {
    next()
  }
})

export default router
