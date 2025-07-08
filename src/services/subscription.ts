import { apiService } from './api'
import type { Subscription, CreateSubscriptionDto } from '@/types/subscription'

export type UpdateSubscriptionData = Partial<CreateSubscriptionDto>
export type CreateSubscriptionData = CreateSubscriptionDto

export interface SubscriptionFilters {
  search?: string
  status?: string
  type?: string
  patientId?: string
  startDate?: string
  endDate?: string
  priceMin?: number
  priceMax?: number
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

export const subscriptionService = {
  // Récupérer tous les abonnements avec pagination et filtres
  async getSubscriptions(
    page = 1, 
    pageSize = 10, 
    filters: SubscriptionFilters = {}
  ): Promise<PaginatedResponse<Subscription>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    })

    const response = await apiService.get<PaginatedResponse<Subscription>>(`/subscriptions?${params}`)
    return response.data
  },

  // Récupérer un abonnement par son ID
  async getSubscription(id: string): Promise<Subscription> {
    const response = await apiService.get<Subscription>(`/subscriptions/${id}`)
    return response.data
  },

  // Créer un nouvel abonnement
  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    const response = await apiService.post<Subscription>('/subscriptions', data)
    return response.data
  },

  // Mettre à jour un abonnement
  async updateSubscription(id: string, data: UpdateSubscriptionData): Promise<Subscription> {
    const response = await apiService.put<Subscription>(`/subscriptions/${id}`, data)
    return response.data
  },

  // Activer un abonnement
  async activateSubscription(id: string): Promise<Subscription> {
    const response = await apiService.patch<Subscription>(`/subscriptions/${id}/activate`)
    return response.data
  },

  // Suspendre un abonnement
  async suspendSubscription(id: string, reason?: string): Promise<Subscription> {
    const response = await apiService.patch<Subscription>(`/subscriptions/${id}/suspend`, { reason })
    return response.data
  },

  // Annuler un abonnement
  async cancelSubscription(id: string, reason?: string): Promise<Subscription> {
    const response = await apiService.patch<Subscription>(`/subscriptions/${id}/cancel`, { reason })
    return response.data
  },

  // Renouveler un abonnement
  async renewSubscription(id: string): Promise<Subscription> {
    const response = await apiService.patch<Subscription>(`/subscriptions/${id}/renew`)
    return response.data
  },

  // Obtenir les plans d'abonnement disponibles
  async getSubscriptionPlans(): Promise<{
    id: string
    name: string
    description: string
    price: number
    duration: number
    features: string[]
    popular?: boolean
  }[]> {
    const response = await apiService.get('/subscriptions/plans')
    return response.data as any[]
  },

  // Créer un plan d'abonnement
  async createSubscriptionPlan(data: {
    name: string
    description: string
    price: number
    duration: number
    features: string[]
  }): Promise<any> {
    const response = await apiService.post('/subscriptions/plans', data)
    return response.data
  },

  // Mettre à jour un plan d'abonnement
  async updateSubscriptionPlan(id: string, data: any): Promise<any> {
    const response = await apiService.put(`/subscriptions/plans/${id}`, data)
    return response.data
  },

  // Obtenir les statistiques des abonnements
  async getSubscriptionStats(): Promise<{
    totalActive: number
    totalRevenue: number
    newThisMonth: number
    churnRate: number
    averageLifetime: number
    byStatus: { [key: string]: number }
    byPlan: { [key: string]: number }
    monthlyGrowth: number
  }> {
    const response = await apiService.get('/subscriptions/stats')
    return response.data as any
  },

  // Obtenir les abonnements d'un patient
  async getPatientSubscriptions(patientId: string): Promise<Subscription[]> {
    const response = await apiService.get<Subscription[]>(`/patients/${patientId}/subscriptions`)
    return response.data
  },

  // Obtenir l'abonnement actif d'un patient
  async getPatientActiveSubscription(patientId: string): Promise<Subscription | null> {
    const response = await apiService.get<Subscription>(`/patients/${patientId}/subscriptions/active`)
    return response.data
  },

  // Vérifier si un patient peut accéder à un service
  async checkPatientAccess(patientId: string, serviceId: string): Promise<{
    hasAccess: boolean
    subscription?: Subscription
    reason?: string
  }> {
    const response = await apiService.get(`/patients/${patientId}/access/${serviceId}`)
    return response.data as any
  },

  // Obtenir l'historique des utilisations d'un abonnement
  async getSubscriptionUsage(id: string): Promise<{
    date: string
    service: string
    count: number
  }[]> {
    const response = await apiService.get(`/subscriptions/${id}/usage`)
    return response.data as any[]
  },

  // Enregistrer l'utilisation d'un service
  async recordServiceUsage(subscriptionId: string, serviceId: string): Promise<void> {
    await apiService.post(`/subscriptions/${subscriptionId}/usage`, { serviceId })
  },

  // Obtenir les abonnements expirant bientôt
  async getExpiringSubscriptions(days = 7): Promise<Subscription[]> {
    const response = await apiService.get<Subscription[]>(`/subscriptions/expiring?days=${days}`)
    return response.data
  },

  // Envoyer des rappels d'expiration
  async sendExpirationReminders(): Promise<{
    sent: number
    failed: number
  }> {
    const response = await apiService.post('/subscriptions/reminders')
    return response.data as any
  },

  // Exporter les abonnements
  async exportSubscriptions(format: 'csv' | 'excel' = 'csv', filters: SubscriptionFilters = {}): Promise<Blob> {
    const params = new URLSearchParams({
      format,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    })

    const response = await apiService.get(`/subscriptions/export?${params}`)
    return response.data as Blob
  },

  // Rechercher des abonnements
  async searchSubscriptions(query: string): Promise<Subscription[]> {
    const response = await apiService.get<Subscription[]>(`/subscriptions/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Obtenir les rapports d'abonnement
  async getSubscriptionReports(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    revenue: number[]
    subscriptions: number[]
    churn: number[]
    growth: number[]
    labels: string[]
  }> {
    const response = await apiService.get(`/subscriptions/reports?period=${period}`)
    return response.data as any
  },

  // Calculer le prix d'un abonnement avec promotions
  async calculatePrice(planId: string, promoCode?: string): Promise<{
    basePrice: number
    discount: number
    finalPrice: number
    promotion?: any
  }> {
    const params = new URLSearchParams({ planId })
    if (promoCode) {
      params.append('promoCode', promoCode)
    }

    const response = await apiService.get(`/subscriptions/calculate-price?${params}`)
    return response.data as any
  },

  // Appliquer une promotion à un abonnement
  async applyPromotion(subscriptionId: string, promoCode: string): Promise<Subscription> {
    const response = await apiService.patch<Subscription>(`/subscriptions/${subscriptionId}/promotion`, { promoCode })
    return response.data
  },

  // Obtenir les promotions disponibles
  async getPromotions(): Promise<any[]> {
    const response = await apiService.get('/subscriptions/promotions')
    return response.data as any[]
  },

  // Créer une promotion
  async createPromotion(data: {
    code: string
    type: 'percentage' | 'fixed'
    value: number
    validFrom: string
    validTo: string
    maxUses?: number
    minAmount?: number
  }): Promise<any> {
    const response = await apiService.post('/subscriptions/promotions', data)
    return response.data
  }
}

export default subscriptionService
