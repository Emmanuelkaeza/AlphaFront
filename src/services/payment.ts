import { apiService } from './api'
import type { Payment, CreatePaymentDto } from '@/types/payment'

export type UpdatePaymentData = Partial<CreatePaymentDto>
export type CreatePaymentData = CreatePaymentDto

export interface PaymentFilters {
  search?: string
  status?: string
  method?: string
  patientId?: string
  startDate?: string
  endDate?: string
  amountMin?: number
  amountMax?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const paymentService = {
  // Récupérer tous les paiements avec pagination et filtres
  async getPayments(
    page = 1, 
    pageSize = 10, 
    filters: PaymentFilters = {}
  ): Promise<PaginatedResponse<Payment>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    })

    const response = await apiService.get<PaginatedResponse<Payment>>(`/payments?${params}`)
    return response.data
  },

  // Récupérer un paiement par son ID
  async getPayment(id: string): Promise<Payment> {
    const response = await apiService.get<Payment>(`/payments/${id}`)
    return response.data
  },

  // Créer un nouveau paiement
  async createPayment(data: CreatePaymentData): Promise<Payment> {
    const response = await apiService.post<Payment>('/payments', data)
    return response.data
  },

  // Mettre à jour un paiement
  async updatePayment(id: string, data: UpdatePaymentData): Promise<Payment> {
    const response = await apiService.put<Payment>(`/payments/${id}`, data)
    return response.data
  },

  // Traiter un paiement en attente
  async processPayment(id: string): Promise<Payment> {
    const response = await apiService.patch<Payment>(`/payments/${id}/process`)
    return response.data
  },

  // Annuler un paiement
  async cancelPayment(id: string, reason?: string): Promise<Payment> {
    const response = await apiService.patch<Payment>(`/payments/${id}/cancel`, { reason })
    return response.data
  },

  // Rembourser un paiement
  async refundPayment(id: string, amount?: number, reason?: string): Promise<Payment> {
    const response = await apiService.patch<Payment>(`/payments/${id}/refund`, { amount, reason })
    return response.data
  },

  // Obtenir les statistiques des paiements
  async getPaymentStats(): Promise<{
    todayTotal: number
    todayChange: number
    monthTotal: number
    monthChange: number
    pendingCount: number
    pendingChange: number
    failedCount: number
    failedChange: number
    successRate: number
    averageAmount: number
  }> {
    const response = await apiService.get('/payments/stats')
    return response.data as any
  },

  // Obtenir les paiements d'un patient
  async getPatientPayments(patientId: string): Promise<Payment[]> {
    const response = await apiService.get<Payment[]>(`/patients/${patientId}/payments`)
    return response.data
  },

  // Exporter les paiements
  async exportPayments(format: 'csv' | 'excel' = 'csv', filters: PaymentFilters = {}): Promise<Blob> {
    const params = new URLSearchParams({
      format,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    })

    const response = await apiService.get(`/payments/export?${params}`)
    return response.data as Blob
  },

  // Initialiser un paiement en ligne avec CinetPay
  async initializeOnlinePayment(data: {
    amount: number
    patientId: string
    description: string
    returnUrl: string
    cancelUrl: string
  }): Promise<{
    paymentUrl: string
    transactionId: string
  }> {
    const response = await apiService.post('/payments/cinetpay/initialize', data)
    return response.data as any
  },

  // Vérifier le statut d'un paiement en ligne
  async verifyOnlinePayment(transactionId: string): Promise<{
    status: string
    payment?: Payment
  }> {
    const response = await apiService.get(`/payments/cinetpay/verify/${transactionId}`)
    return response.data as any
  },

  // Traiter le callback de CinetPay
  async handlePaymentCallback(data: any): Promise<Payment> {
    const response = await apiService.post('/payments/cinetpay/callback', data)
    return response.data as Payment
  },

  // Obtenir l'historique des transactions d'un paiement
  async getPaymentHistory(id: string): Promise<any[]> {
    const response = await apiService.get(`/payments/${id}/history`)
    return response.data as any[]
  },

  // Rechercher des paiements
  async searchPayments(query: string): Promise<Payment[]> {
    const response = await apiService.get<Payment[]>(`/payments/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Obtenir les méthodes de paiement disponibles
  async getPaymentMethods(): Promise<{
    id: string
    name: string
    type: string
    enabled: boolean
    config?: any
  }[]> {
    const response = await apiService.get('/payments/methods')
    return response.data as any[]
  },

  // Configurer une méthode de paiement
  async configurePaymentMethod(methodId: string, config: any): Promise<void> {
    await apiService.put(`/payments/methods/${methodId}`, config)
  },

  // Obtenir les rapports de paiement
  async getPaymentReports(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    revenue: number[]
    transactions: number[]
    methods: { [key: string]: number }
    statuses: { [key: string]: number }
    labels: string[]
  }> {
    const response = await apiService.get(`/payments/reports?period=${period}`)
    return response.data as any
  },

  // Récupérer les paiements récurrents
  async getRecurringPayments(): Promise<any[]> {
    const response = await apiService.get('/payments/recurring')
    return response.data as any[]
  },

  // Créer un paiement récurrent
  async createRecurringPayment(data: {
    patientId: string
    amount: number
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    startDate: string
    endDate?: string
    description: string
  }): Promise<any> {
    const response = await apiService.post('/payments/recurring', data)
    return response.data
  },

  // Annuler un paiement récurrent
  async cancelRecurringPayment(id: string): Promise<void> {
    await apiService.delete(`/payments/recurring/${id}`)
  }
}

export default paymentService
