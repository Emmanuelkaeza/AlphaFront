export interface Subscription {
  id: string
  patientId: string
  planId: string
  status: 'active' | 'expired' | 'cancelled' | 'suspended'
  startDate: string
  endDate: string
  autoRenew: boolean
  createdAt: string
  updatedAt: string
  patient?: {
    id: string
    firstName: string
    lastName: string
    patientNumber: string
  }
  plan?: SubscriptionPlan
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  duration: number // en jours
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSubscriptionDto {
  patientId: string
  planId: string
  autoRenew?: boolean
}

export interface SubscriptionStats {
  total: number
  active: number
  expired: number
  cancelled: number
  growth: number
}
