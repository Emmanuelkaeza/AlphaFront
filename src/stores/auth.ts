import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type { User, LoginCredentials, LoginResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isReceptionist = computed(() => user.value?.role === 'receptionist')
  const isPatient = computed(() => user.value?.role === 'patient')

  // Actions
  const login = async (credentials: LoginCredentials): Promise<void> => {
    loading.value = true
    try {
      const response = await apiService.post<LoginResponse>('/auth/login', credentials)
      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData
      
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = (): void => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const loadUserFromStorage = (): void => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && token.value) {
      user.value = JSON.parse(storedUser)
    }
  }

  const refreshProfile = async (): Promise<void> => {
    try {
      const response = await apiService.get<User>('/auth/profile')
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (error) {
      logout()
      throw error
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isReceptionist,
    isPatient,
    login,
    logout,
    loadUserFromStorage,
    refreshProfile,
  }
})
