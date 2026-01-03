import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userTier = computed(() => user.value?.tier || 'free')

  // Helper: Save token to localStorage
  const saveToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  // Helper: Load token from localStorage
  const loadToken = () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
    }
  }

  // Actions
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await authService.login(credentials)
      user.value = result.user
      saveToken(result.token)
      return result
    } catch (err) {
      error.value = err.message || 'خطا در ورود به سیستم'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (data) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await authService.register(data)
      user.value = result.user
      saveToken(result.token)
      return result
    } catch (err) {
      error.value = err.message || 'خطا در ثبت‌نام'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      await authService.logout()
      user.value = null
      saveToken(null)
    } catch (err) {
      // Even if logout fails, clear local state
      user.value = null
      saveToken(null)
      error.value = err.message || 'خطا در خروج از سیستم'
    } finally {
      isLoading.value = false
    }
  }

  const refreshToken = async () => {
    // This can be implemented later if token refresh is needed
    // For now, just check if we have a valid token
    loadToken()
    if (token.value && !user.value) {
      try {
        const profile = await authService.getProfile()
        user.value = profile
      } catch (err) {
        // Token is invalid, clear it
        saveToken(null)
      }
    }
  }

  const updateProfile = async (data) => {
    isLoading.value = true
    error.value = null

    try {
      const updatedUser = await authService.updateProfile(data)
      user.value = updatedUser
      return updatedUser
    } catch (err) {
      error.value = err.message || 'خطا در به‌روزرسانی پروفایل'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Initialize: Load token and user from localStorage on store creation
  const initialize = async () => {
    loadToken()
    if (token.value) {
      try {
        const profile = await authService.getProfile()
        user.value = profile
      } catch (err) {
        // Token is invalid, clear it
        saveToken(null)
      }
    }
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
    updateProfile,
    initialize
  }
})