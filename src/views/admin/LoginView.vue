<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import LogoIcon from '@/components/ui/LogoIcon.vue'

const router = useRouter()
const { login, loading } = useAuth()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  
  // Validation
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both email and password'
    return
  }

  if (!email.value.includes('@')) {
    errorMessage.value = 'Please enter a valid email address'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }

  try {
    await login(email.value, password.value)
    // On success, router guard will redirect to dashboard
    router.push('/admin/dashboard')
  } catch (error: any) {
    console.error('Login error:', error)
    errorMessage.value = error.message || 'Invalid email or password. Please try again.'
  }
}

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleLogin()
  }
}

</script>

<template>
  <div class="min-h-screen bg-minimal-white flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <LogoIcon color="dark" size="lg" />
      </div>

      <!-- Title -->
      <div class="text-center mb-12">
        <h1 class="text-2xl md:text-3xl font-thin text-minimal-dark tracking-[0.2em] uppercase mb-2">
          Admin Dashboard
        </h1>
        <p class="text-xs text-minimal-medium font-light tracking-wider">
          CONTENT MANAGEMENT SYSTEM
        </p>
      </div>

      <!-- Login Form -->
      <div class="bg-white p-8 md:p-10 border border-minimal-light">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label 
              for="email" 
              class="block text-xs tracking-widest uppercase font-light text-minimal-medium mb-2"
            >
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="w-full px-4 py-3 bg-minimal-white border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black transition-colors"
              placeholder="your@email.com"
              @keypress="handleKeyPress"
              :disabled="loading"
            />
          </div>

          <!-- Password Field -->
          <div>
            <label 
              for="password" 
              class="block text-xs tracking-widest uppercase font-light text-minimal-medium mb-2"
            >
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full px-4 py-3 bg-minimal-white border border-minimal-light text-minimal-dark font-light focus:outline-none focus:border-minimal-black transition-colors"
              placeholder="••••••••"
              @keypress="handleKeyPress"
              :disabled="loading"
            />
          </div>

          <!-- Remember Me -->
          <div class="flex items-center">
            <input
              id="remember"
              v-model="rememberMe"
              type="checkbox"
              class="w-4 h-4 border-minimal-light focus:ring-0 focus:ring-offset-0"
              :disabled="loading"
            />
            <label 
              for="remember" 
              class="ml-2 text-sm text-minimal-dark font-light tracking-wide cursor-pointer"
            >
              Remember me for 30 days
            </label>
          </div>

          <!-- Error Message -->
          <div 
            v-if="errorMessage" 
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-light"
          >
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-minimal-black text-minimal-white py-3 px-6 text-sm tracking-widest uppercase font-light hover:bg-minimal-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Logging in...</span>
            <span v-else>Login</span>
          </button>
        </form>

        <!-- Forgot Password Link -->
        <div class="mt-6 text-center">
          <a 
            href="#" 
            class="text-xs text-minimal-medium hover:text-minimal-black transition-colors tracking-wider font-light"
            @click.prevent="errorMessage = 'Password reset feature coming soon. Please contact your developer if you forgot your password.'"
          >
            Forgot password?
          </a>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="mt-8 text-center">
        <p class="text-xs text-minimal-medium font-light tracking-wide">
          Secure admin access only
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove default border radius */
input,
button,
div {
  border-radius: 0 !important;
}

/* Custom checkbox styling */
input[type="checkbox"] {
  border-radius: 0 !important;
  cursor: pointer;
}
</style>
