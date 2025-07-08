import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { subscriptionService, type SubscriptionFilters } from '@/services/subscription'
import type { Subscription } from '@/types/subscription'

export const useSubscriptionStore = defineStore('subscription', () => {
  // État
  const subscriptions = ref<Subscription[]>([])
  const currentSubscription = ref<Subscription | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })

  // Filtres
  const filters = ref<SubscriptionFilters>({
    search: '',
    status: '',
    type: '',
    patientId: '',
    startDate: '',
    endDate: '',
    priceMin: undefined,
    priceMax: undefined
  })

  // Plans d'abonnement
  const subscriptionPlans = ref<any[]>([])

  // Statistiques
  const stats = ref({
    totalActive: 0,
    totalRevenue: 0,
    newThisMonth: 0,
    churnRate: 0,
    averageLifetime: 0,
    byStatus: {},
    byPlan: {},
    monthlyGrowth: 0
  })

  // Promotions
  const promotions = ref<any[]>([])

  // Getters
  const activeSubscriptions = computed(() => 
    subscriptions.value.filter(sub => sub.status === 'active')
  )

  const expiredSubscriptions = computed(() => 
    subscriptions.value.filter(sub => sub.status === 'expired')
  )

  const suspendedSubscriptions = computed(() => 
    subscriptions.value.filter(sub => sub.status === 'suspended')
  )

  const subscriptionsCount = computed(() => subscriptions.value.length)

  const totalRevenue = computed(() => 
    activeSubscriptions.value.reduce((sum, sub) => sum + (sub.plan?.price || 0), 0)
  )

  // Actions
  const fetchSubscriptions = async (page = 1, pageSize = 10) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await subscriptionService.getSubscriptions(page, pageSize, filters.value)
      subscriptions.value = response.data
      pagination.value = response.pagination
    } catch (err) {
      error.value = 'Erreur lors du chargement des abonnements'
      console.error('Erreur fetchSubscriptions:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchSubscription = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      currentSubscription.value = await subscriptionService.getSubscription(id)
    } catch (err) {
      error.value = 'Erreur lors du chargement de l\'abonnement'
      console.error('Erreur fetchSubscription:', err)
    } finally {
      loading.value = false
    }
  }

  const createSubscription = async (subscriptionData: any) => {
    loading.value = true
    error.value = null
    
    try {
      const newSubscription = await subscriptionService.createSubscription(subscriptionData)
      subscriptions.value.unshift(newSubscription)
      return newSubscription
    } catch (err) {
      error.value = 'Erreur lors de la création de l\'abonnement'
      console.error('Erreur createSubscription:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSubscription = async (id: string, subscriptionData: any) => {
    loading.value = true
    error.value = null
    
    try {
      const updatedSubscription = await subscriptionService.updateSubscription(id, subscriptionData)
      const index = subscriptions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = updatedSubscription
      }
      if (currentSubscription.value?.id === id) {
        currentSubscription.value = updatedSubscription
      }
      return updatedSubscription
    } catch (err) {
      error.value = 'Erreur lors de la mise à jour de l\'abonnement'
      console.error('Erreur updateSubscription:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const activateSubscription = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const activatedSubscription = await subscriptionService.activateSubscription(id)
      const index = subscriptions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = activatedSubscription
      }
      if (currentSubscription.value?.id === id) {
        currentSubscription.value = activatedSubscription
      }
      return activatedSubscription
    } catch (err) {
      error.value = 'Erreur lors de l\'activation de l\'abonnement'
      console.error('Erreur activateSubscription:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const suspendSubscription = async (id: string, reason?: string) => {
    loading.value = true
    error.value = null
    
    try {
      const suspendedSubscription = await subscriptionService.suspendSubscription(id, reason)
      const index = subscriptions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = suspendedSubscription
      }
      if (currentSubscription.value?.id === id) {
        currentSubscription.value = suspendedSubscription
      }
      return suspendedSubscription
    } catch (err) {
      error.value = 'Erreur lors de la suspension de l\'abonnement'
      console.error('Erreur suspendSubscription:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelSubscription = async (id: string, reason?: string) => {
    loading.value = true
    error.value = null
    
    try {
      const cancelledSubscription = await subscriptionService.cancelSubscription(id, reason)
      const index = subscriptions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = cancelledSubscription
      }
      if (currentSubscription.value?.id === id) {
        currentSubscription.value = cancelledSubscription
      }
      return cancelledSubscription
    } catch (err) {
      error.value = 'Erreur lors de l\'annulation de l\'abonnement'
      console.error('Erreur cancelSubscription:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const renewSubscription = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const renewedSubscription = await subscriptionService.renewSubscription(id)
      const index = subscriptions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = renewedSubscription
      }
      if (currentSubscription.value?.id === id) {
        currentSubscription.value = renewedSubscription
      }
      return renewedSubscription
    } catch (err) {
      error.value = 'Erreur lors du renouvellement de l\'abonnement'
      console.error('Erreur renewSubscription:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchSubscriptionPlans = async () => {
    try {
      subscriptionPlans.value = await subscriptionService.getSubscriptionPlans()
    } catch (err) {
      console.error('Erreur fetchSubscriptionPlans:', err)
    }
  }

  const fetchSubscriptionStats = async () => {
    try {
      stats.value = await subscriptionService.getSubscriptionStats()
    } catch (err) {
      console.error('Erreur fetchSubscriptionStats:', err)
    }
  }

  const fetchPatientSubscriptions = async (patientId: string) => {
    loading.value = true
    error.value = null
    
    try {
      return await subscriptionService.getPatientSubscriptions(patientId)
    } catch (err) {
      error.value = 'Erreur lors du chargement des abonnements du patient'
      console.error('Erreur fetchPatientSubscriptions:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchPatientActiveSubscription = async (patientId: string) => {
    loading.value = true
    error.value = null
    
    try {
      return await subscriptionService.getPatientActiveSubscription(patientId)
    } catch (err) {
      error.value = 'Erreur lors du chargement de l\'abonnement actif'
      console.error('Erreur fetchPatientActiveSubscription:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const checkPatientAccess = async (patientId: string, serviceId: string) => {
    try {
      return await subscriptionService.checkPatientAccess(patientId, serviceId)
    } catch (err) {
      console.error('Erreur checkPatientAccess:', err)
      return { hasAccess: false, reason: 'Erreur de vérification' }
    }
  }

  const recordServiceUsage = async (subscriptionId: string, serviceId: string) => {
    try {
      await subscriptionService.recordServiceUsage(subscriptionId, serviceId)
    } catch (err) {
      console.error('Erreur recordServiceUsage:', err)
    }
  }

  const fetchExpiringSubscriptions = async (days = 7) => {
    try {
      return await subscriptionService.getExpiringSubscriptions(days)
    } catch (err) {
      console.error('Erreur fetchExpiringSubscriptions:', err)
      return []
    }
  }

  const sendExpirationReminders = async () => {
    try {
      return await subscriptionService.sendExpirationReminders()
    } catch (err) {
      console.error('Erreur sendExpirationReminders:', err)
      throw err
    }
  }

  const searchSubscriptions = async (query: string) => {
    loading.value = true
    error.value = null
    
    try {
      const results = await subscriptionService.searchSubscriptions(query)
      subscriptions.value = results
    } catch (err) {
      error.value = 'Erreur lors de la recherche'
      console.error('Erreur searchSubscriptions:', err)
    } finally {
      loading.value = false
    }
  }

  const exportSubscriptions = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const blob = await subscriptionService.exportSubscriptions(format, filters.value)
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `subscriptions.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = 'Erreur lors de l\'export'
      console.error('Erreur exportSubscriptions:', err)
      throw err
    }
  }

  const fetchSubscriptionReports = async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    try {
      return await subscriptionService.getSubscriptionReports(period)
    } catch (err) {
      console.error('Erreur fetchSubscriptionReports:', err)
      throw err
    }
  }

  const calculatePrice = async (planId: string, promoCode?: string) => {
    try {
      return await subscriptionService.calculatePrice(planId, promoCode)
    } catch (err) {
      console.error('Erreur calculatePrice:', err)
      throw err
    }
  }

  const applyPromotion = async (subscriptionId: string, promoCode: string) => {
    loading.value = true
    error.value = null
    
    try {
      const updatedSubscription = await subscriptionService.applyPromotion(subscriptionId, promoCode)
      const index = subscriptions.value.findIndex(s => s.id === subscriptionId)
      if (index !== -1) {
        subscriptions.value[index] = updatedSubscription
      }
      if (currentSubscription.value?.id === subscriptionId) {
        currentSubscription.value = updatedSubscription
      }
      return updatedSubscription
    } catch (err) {
      error.value = 'Erreur lors de l\'application de la promotion'
      console.error('Erreur applyPromotion:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPromotions = async () => {
    try {
      promotions.value = await subscriptionService.getPromotions()
    } catch (err) {
      console.error('Erreur fetchPromotions:', err)
    }
  }

  // Méthodes utilitaires
  const setFilters = (newFilters: Partial<SubscriptionFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      status: '',
      type: '',
      patientId: '',
      startDate: '',
      endDate: '',
      priceMin: undefined,
      priceMax: undefined
    }
  }

  const setCurrentSubscription = (subscription: Subscription | null) => {
    currentSubscription.value = subscription
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    subscriptions.value = []
    currentSubscription.value = null
    loading.value = false
    error.value = null
    pagination.value = {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
    subscriptionPlans.value = []
    promotions.value = []
    clearFilters()
  }

  return {
    // État
    subscriptions,
    currentSubscription,
    loading,
    error,
    pagination,
    filters,
    subscriptionPlans,
    stats,
    promotions,
    
    // Getters
    activeSubscriptions,
    expiredSubscriptions,
    suspendedSubscriptions,
    subscriptionsCount,
    totalRevenue,
    
    // Actions
    fetchSubscriptions,
    fetchSubscription,
    createSubscription,
    updateSubscription,
    activateSubscription,
    suspendSubscription,
    cancelSubscription,
    renewSubscription,
    fetchSubscriptionPlans,
    fetchSubscriptionStats,
    fetchPatientSubscriptions,
    fetchPatientActiveSubscription,
    checkPatientAccess,
    recordServiceUsage,
    fetchExpiringSubscriptions,
    sendExpirationReminders,
    searchSubscriptions,
    exportSubscriptions,
    fetchSubscriptionReports,
    calculatePrice,
    applyPromotion,
    fetchPromotions,
    
    // Utilitaires
    setFilters,
    clearFilters,
    setCurrentSubscription,
    clearError,
    resetStore
  }
})
