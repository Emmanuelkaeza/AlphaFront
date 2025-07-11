import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  subscriptionService,
  type Subscription,
  type SubscriptionFilters,
  type PaginatedSubscriptionsResponse
} from '@/services/subscriptionService';

export const useSubscriptionStore = defineStore('subscription', () => {
  // State
  const subscriptions = ref<Subscription[]>([]);
  const currentSubscription = ref<Subscription | null>(null); // For viewing/editing details

  const pagination = ref({
    currentPage: 1,
    pageSize: 10, // Default page size
    total: 0,
    totalPages: 0,
  });

  const filters = ref<SubscriptionFilters>({
    status: '',
    planId: '',
    patientId: '', // This might be a search string for patient name/email
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchSubscriptions = async (page?: number) => {
    loading.value = true;
    error.value = null;

    const effectivePage = page || pagination.value.currentPage;
    const queryFilters: SubscriptionFilters = {
      ...filters.value,
      page: effectivePage,
      limit: pagination.value.pageSize,
    };

    try {
      const response = await subscriptionService.getSubscriptions(queryFilters);
      subscriptions.value = response.data;
      pagination.value.total = response.total;
      pagination.value.currentPage = response.page;
      pagination.value.pageSize = response.limit; // Ensure pageSize from response is stored if it can vary
      pagination.value.totalPages = response.totalPages;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des abonnements.';
      console.error('Erreur fetchSubscriptions:', err);
      subscriptions.value = []; // Clear subscriptions on error
      pagination.value.total = 0;
      pagination.value.totalPages = 0;
    } finally {
      loading.value = false;
    }
  };

  const setSubscriptionFilters = (newFilters: Partial<SubscriptionFilters>) => {
    filters.value = { ...filters.value, ...newFilters };
    // Fetching with new filters should reset to page 1
    fetchSubscriptions(1);
  };

  const clearSubscriptionFilters = () => {
    filters.value = { status: '', planId: '', patientId: '' };
    fetchSubscriptions(1);
  };

  // State for statistics
  const stats = ref({
    active: 0,
    expired: 0,
    renewalRate: 0,
    total: 0,
    expiringSoon: 0, // From view's mock data
    monthlyRevenue: 0 // From view's mock data
  });
  const loadingStats = ref(false);

  const fetchSubscriptionStats = async () => {
    loadingStats.value = true;
    try {
      const fetchedStats = await subscriptionService.getSubscriptionStats();
      stats.value = { // Merge fetched stats with defaults for safety
        active: fetchedStats.active || 0,
        expired: fetchedStats.expired || 0,
        renewalRate: fetchedStats.renewalRate || 0,
        total: fetchedStats.total || 0,
        expiringSoon: fetchedStats.expiringSoon || 0,
        monthlyRevenue: fetchedStats.monthlyRevenue || 0,
      };
    } catch (err: any) {
      console.error('Erreur fetchSubscriptionStats:', err);
      // Potentially set an error state for stats or use default/previous stats
    } finally {
      loadingStats.value = false;
    }
  };

  // Placeholder for other actions (create, update, delete, renew, getById)
  const createSubscription = async (data: import('@/services/subscriptionService').CreateSubscriptionDto): Promise<Subscription | null> => {
    loading.value = true;
    error.value = null;
    try {
      const newSubscription = await subscriptionService.createSubscription(data);
      // Optionally, add to the local list if relevant to current view, or trigger a refetch.
      // For now, we just return the new subscription. The view can decide to refetch or redirect.
      // If adding to list: subscriptions.value.unshift(newSubscription);
      // if (pagination.value.total !== undefined) pagination.value.total++;
      notifications.success({ title: 'Succès', message: 'Abonnement créé avec succès!' }); // Added notification
      return newSubscription;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la création de l\'abonnement.';
      console.error('Erreur createSubscription:', err);
      // Notification for error is handled by global interceptor or view can show specific one based on this error.value
      throw err; // Re-throw for the component to handle (e.g., display validation errors)
    } finally {
      loading.value = false;
    }
  };

  const renewSubscription = async (id: string, renewalData: import('@/services/subscriptionService').RenewSubscriptionDto): Promise<Subscription | null> => {
    loading.value = true;
    error.value = null;
    try {
      const updatedSubscription = await subscriptionService.renewSubscription(id, renewalData);
      // Update the subscription in the list
      const index = subscriptions.value.findIndex(sub => sub.id === id);
      if (index !== -1) {
        subscriptions.value[index] = updatedSubscription;
      }
      // Update currentSubscription if it's the one being renewed
      if (currentSubscription.value?.id === id) {
        currentSubscription.value = updatedSubscription;
      }
      notifications.success({ title: 'Succès', message: 'Abonnement renouvelé avec succès!' });
      return updatedSubscription;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du renouvellement de l\'abonnement.';
      console.error('Erreur renewSubscription:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const cancelSubscription = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await subscriptionService.cancelSubscription(id);
      // Option 1: Remove from list
      // subscriptions.value = subscriptions.value.filter(sub => sub.id !== id);
      // Option 2: Update status in list (preferred if soft delete or status change)
      const index = subscriptions.value.findIndex(sub => sub.id === id);
      if (index !== -1) {
        // If the backend changes the status upon DELETE, we might not get the updated subscription back.
        // We might need to refetch the item or the list, or just assume status is 'cancelled'.
        // For simplicity, let's update status locally or refetch.
        // A more robust way would be for the DELETE to return the updated (soft-deleted) item or refetch.
        // Or, if it's a hard delete, filtering is correct.
        // Given "confirmation suppression" implies it's gone, let's filter.
        subscriptions.value = subscriptions.value.filter(sub => sub.id !== id);
        if (pagination.value.total) { // Decrement total if it exists
          pagination.value.total--;
        }
      }
      if (currentSubscription.value?.id === id) {
        currentSubscription.value = null; // Or update its status
      }
      notifications.success({ title: 'Succès', message: 'Abonnement annulé avec succès!' });
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'annulation de l\'abonnement.';
      console.error('Erreur cancelSubscription:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    subscriptions,
    currentSubscription,
    pagination,
    filters,
    loading,
    error,
    fetchSubscriptions,
    setSubscriptionFilters,
    clearSubscriptionFilters,
    // ... other actions
  };
});
