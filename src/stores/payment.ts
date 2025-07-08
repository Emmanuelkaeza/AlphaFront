import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { paymentService, type PaymentFilters } from '@/services/payment'
import type { Payment } from '@/types/payment'

export const usePaymentStore = defineStore('payment', () => {
  // État
  const payments = ref<Payment[]>([])
  const currentPayment = ref<Payment | null>(null)
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
  const filters = ref<PaymentFilters>({
    search: '',
    status: '',
    method: '',
    patientId: '',
    startDate: '',
    endDate: '',
    amountMin: undefined,
    amountMax: undefined
  })

  // Statistiques
  const stats = ref({
    todayTotal: 0,
    todayChange: 0,
    monthTotal: 0,
    monthChange: 0,
    pendingCount: 0,
    pendingChange: 0,
    failedCount: 0,
    failedChange: 0,
    successRate: 0,
    averageAmount: 0
  })

  // Méthodes de paiement
  const paymentMethods = ref<any[]>([])

  // Getters
  const completedPayments = computed(() => 
    payments.value.filter(payment => payment.status === 'completed')
  )

  const pendingPayments = computed(() => 
    payments.value.filter(payment => payment.status === 'pending')
  )

  const failedPayments = computed(() => 
    payments.value.filter(payment => payment.status === 'failed')
  )

  const totalAmount = computed(() => 
    completedPayments.value.reduce((sum, payment) => sum + payment.amount, 0)
  )

  const paymentsCount = computed(() => payments.value.length)

  // Actions
  const fetchPayments = async (page = 1, pageSize = 10) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await paymentService.getPayments(page, pageSize, filters.value)
      payments.value = response.data
      pagination.value = response.pagination
    } catch (err) {
      error.value = 'Erreur lors du chargement des paiements'
      console.error('Erreur fetchPayments:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchPayment = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      currentPayment.value = await paymentService.getPayment(id)
    } catch (err) {
      error.value = 'Erreur lors du chargement du paiement'
      console.error('Erreur fetchPayment:', err)
    } finally {
      loading.value = false
    }
  }

  const createPayment = async (paymentData: any) => {
    loading.value = true
    error.value = null
    
    try {
      const newPayment = await paymentService.createPayment(paymentData)
      payments.value.unshift(newPayment)
      return newPayment
    } catch (err) {
      error.value = 'Erreur lors de la création du paiement'
      console.error('Erreur createPayment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePayment = async (id: string, paymentData: any) => {
    loading.value = true
    error.value = null
    
    try {
      const updatedPayment = await paymentService.updatePayment(id, paymentData)
      const index = payments.value.findIndex(p => p.id === id)
      if (index !== -1) {
        payments.value[index] = updatedPayment
      }
      if (currentPayment.value?.id === id) {
        currentPayment.value = updatedPayment
      }
      return updatedPayment
    } catch (err) {
      error.value = 'Erreur lors de la mise à jour du paiement'
      console.error('Erreur updatePayment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const processPayment = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const processedPayment = await paymentService.processPayment(id)
      const index = payments.value.findIndex(p => p.id === id)
      if (index !== -1) {
        payments.value[index] = processedPayment
      }
      if (currentPayment.value?.id === id) {
        currentPayment.value = processedPayment
      }
      return processedPayment
    } catch (err) {
      error.value = 'Erreur lors du traitement du paiement'
      console.error('Erreur processPayment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelPayment = async (id: string, reason?: string) => {
    loading.value = true
    error.value = null
    
    try {
      const cancelledPayment = await paymentService.cancelPayment(id, reason)
      const index = payments.value.findIndex(p => p.id === id)
      if (index !== -1) {
        payments.value[index] = cancelledPayment
      }
      if (currentPayment.value?.id === id) {
        currentPayment.value = cancelledPayment
      }
      return cancelledPayment
    } catch (err) {
      error.value = 'Erreur lors de l\'annulation du paiement'
      console.error('Erreur cancelPayment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const refundPayment = async (id: string, amount?: number, reason?: string) => {
    loading.value = true
    error.value = null
    
    try {
      const refundedPayment = await paymentService.refundPayment(id, amount, reason)
      const index = payments.value.findIndex(p => p.id === id)
      if (index !== -1) {
        payments.value[index] = refundedPayment
      }
      if (currentPayment.value?.id === id) {
        currentPayment.value = refundedPayment
      }
      return refundedPayment
    } catch (err) {
      error.value = 'Erreur lors du remboursement'
      console.error('Erreur refundPayment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPaymentStats = async () => {
    try {
      stats.value = await paymentService.getPaymentStats()
    } catch (err) {
      console.error('Erreur fetchPaymentStats:', err)
    }
  }

  const fetchPatientPayments = async (patientId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const patientPayments = await paymentService.getPatientPayments(patientId)
      return patientPayments
    } catch (err) {
      error.value = 'Erreur lors du chargement des paiements du patient'
      console.error('Erreur fetchPatientPayments:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const searchPayments = async (query: string) => {
    loading.value = true
    error.value = null
    
    try {
      const results = await paymentService.searchPayments(query)
      payments.value = results
    } catch (err) {
      error.value = 'Erreur lors de la recherche'
      console.error('Erreur searchPayments:', err)
    } finally {
      loading.value = false
    }
  }

  const exportPayments = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const blob = await paymentService.exportPayments(format, filters.value)
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payments.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = 'Erreur lors de l\'export'
      console.error('Erreur exportPayments:', err)
      throw err
    }
  }

  // Paiements en ligne
  const initializeOnlinePayment = async (data: {
    amount: number
    patientId: string
    description: string
    returnUrl: string
    cancelUrl: string
  }) => {
    loading.value = true
    error.value = null
    
    try {
      return await paymentService.initializeOnlinePayment(data)
    } catch (err) {
      error.value = 'Erreur lors de l\'initialisation du paiement en ligne'
      console.error('Erreur initializeOnlinePayment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const verifyOnlinePayment = async (transactionId: string) => {
    loading.value = true
    error.value = null
    
    try {
      return await paymentService.verifyOnlinePayment(transactionId)
    } catch (err) {
      error.value = 'Erreur lors de la vérification du paiement'
      console.error('Erreur verifyOnlinePayment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      paymentMethods.value = await paymentService.getPaymentMethods()
    } catch (err) {
      console.error('Erreur fetchPaymentMethods:', err)
    }
  }

  const fetchPaymentReports = async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    try {
      return await paymentService.getPaymentReports(period)
    } catch (err) {
      console.error('Erreur fetchPaymentReports:', err)
      throw err
    }
  }

  // Méthodes utilitaires
  const setFilters = (newFilters: Partial<PaymentFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      status: '',
      method: '',
      patientId: '',
      startDate: '',
      endDate: '',
      amountMin: undefined,
      amountMax: undefined
    }
  }

  const setCurrentPayment = (payment: Payment | null) => {
    currentPayment.value = payment
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    payments.value = []
    currentPayment.value = null
    loading.value = false
    error.value = null
    pagination.value = {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
    paymentMethods.value = []
    clearFilters()
  }

  return {
    // État
    payments,
    currentPayment,
    loading,
    error,
    pagination,
    filters,
    stats,
    paymentMethods,
    
    // Getters
    completedPayments,
    pendingPayments,
    failedPayments,
    totalAmount,
    paymentsCount,
    
    // Actions
    fetchPayments,
    fetchPayment,
    createPayment,
    updatePayment,
    processPayment,
    cancelPayment,
    refundPayment,
    fetchPaymentStats,
    fetchPatientPayments,
    searchPayments,
    exportPayments,
    initializeOnlinePayment,
    verifyOnlinePayment,
    fetchPaymentMethods,
    fetchPaymentReports,
    
    // Utilitaires
    setFilters,
    clearFilters,
    setCurrentPayment,
    clearError,
    resetStore
  }
})
