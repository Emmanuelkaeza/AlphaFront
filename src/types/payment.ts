export interface Payment {
  id: string
  patientId: string
  subscriptionId?: string
  amount: number
  currency: string
  method: 'mobile_money' | 'credit_card' | 'cash' | 'card' | 'bank_transfer'
  mobileMoneyOperator?: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
  cinetpayTransactionId?: string
  description?: string
  createdAt: string
  updatedAt: string
  patient?: {
    id: string
    firstName: string
    lastName: string
    patientNumber: string
    email?: string
  }
}

export interface CreatePaymentDto {
  patientId: string
  subscriptionId?: string
  amount: number
  method: 'mobile_money' | 'credit_card' | 'cash' | 'card' | 'bank_transfer'
  mobileMoneyOperator?: 'ORANGE' | 'MTN' | 'MOOV' | 'WAVE'
  description?: string
}

export interface InitiateCinetPayDto {
  paymentId: string
  returnUrl: string
  cancelUrl: string
}

export interface PaymentStats {
  totalRevenue: number
  monthlyRevenue: number
  pendingPayments: number
  completedPayments: number
  failedPayments: number
  growth: number
}
