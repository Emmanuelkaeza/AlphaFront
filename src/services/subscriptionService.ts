import { apiService } from './api';
import type { Patient } from '@/types/patient'; // Assuming Patient type might be part of Subscription
import type { User } from '@/types/auth';     // Assuming User (creator/receptor) might be part of Subscription

// Define the structure of a Subscription based on expected API response
export interface SubscriptionPlan { // Assuming a nested or referenced plan structure
  id: string;
  name: string;
  price: number;
  durationDays: number; // Example
}

export interface Subscription {
  id: string;
  patientId: string;
  patient?: Patient; // Optional: if backend populates patient details
  planId: string;
  plan?: SubscriptionPlan; // Optional: if backend populates plan details
  startDate: string; // ISO Date string
  endDate: string;   // ISO Date string
  status: 'active' | 'expired' | 'cancelled' | 'pending_payment'; // Example statuses
  autoRenew: boolean;
  paymentId?: string; // Link to a payment
  createdAt: string;
  updatedAt: string;
  createdBy?: User; // Optional: if backend populates this
}

export interface SubscriptionFilters {
  page?: number;
  limit?: number;
  status?: 'active' | 'expired' | 'cancelled' | 'pending_payment' | '';
  planId?: string;
  patientId?: string; // Could be a search string for patient name/email, or a direct ID
  // Add other filters as needed, e.g., date ranges for startDate/endDate
}

export interface PaginatedSubscriptionsResponse {
  data: Subscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const subscriptionService = {
  async getSubscriptions(filters: SubscriptionFilters = {}): Promise<PaginatedSubscriptionsResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.planId) params.append('planId', filters.planId);
    if (filters.patientId) params.append('patientId', filters.patientId); // Backend might expect patient name/email for search

    const response = await apiService.get<PaginatedSubscriptionsResponse>(`/subscriptions?${params.toString()}`);
    return response.data;
  },

  // Placeholder for other subscription actions
  // async getSubscription(id: string): Promise<Subscription> { ... }

  async createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
    const response = await apiService.post<Subscription>('/subscriptions', data);
    return response.data;
  }
  // async updateSubscription(id: string, data: UpdateSubscriptionDto): Promise<Subscription> { ... }
  async renewSubscription(id: string, data: RenewSubscriptionDto): Promise<Subscription> {
    const response = await apiService.post<Subscription>(`/subscriptions/${id}/renew`, data);
    return response.data;
  }
  async cancelSubscription(id: string): Promise<void> {
    await apiService.delete(`/subscriptions/${id}`);
  }

  async getSubscriptionStats(): Promise<{
    active: number;
    expired: number;
    renewalRate: number; // Assuming this is what "taux de renouvellement" maps to
    total: number; // Adding total as it's generally useful and often available
    expiringSoon?: number; // Optional, as view uses it
    monthlyRevenue?: number; // Optional, as view uses it but not in design doc for this endpoint
  }> {
    // Note: The actual response structure from GET /subscriptions/stats might differ.
    // This is a placeholder based on design doc and view usage.
    const response = await apiService.get('/subscriptions/stats');
    return response.data as any;
  }
};
