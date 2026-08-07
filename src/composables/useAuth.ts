import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const loading = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => user.value !== null)

  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const checkAuth = async () => {
    loading.value = true
    try {
      const { data } = await supabase.auth.getSession()
      user.value = data.session?.user ?? null
    } finally {
      loading.value = false
    }
  }

  // Listen to auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })

  return {
    user: computed(() => user.value),
    isAuthenticated,
    loading: computed(() => loading.value),
    login,
    logout,
    checkAuth,
  }
}
