import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userTier = computed(() => user.value?.tier || 'free')

  // Actions
  const login = async (credentials) => {
    // Implementation will be added in later tasks
    console.log('Login action placeholder', credentials)
  }

  const register = async (data) => {
    // Implementation will be added in later tasks
    console.log('Register action placeholder', data)
  }

  const logout = async () => {
    // Implementation will be added in later tasks
    console.log('Logout action placeholder')
  }

  const refreshToken = async () => {
    // Implementation will be added in later tasks
    console.log('Refresh token action placeholder')
  }

  const updateProfile = async (data) => {
    // Implementation will be added in later tasks
    console.log('Update profile action placeholder', data)
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    userTier,
    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateProfile
  }
})