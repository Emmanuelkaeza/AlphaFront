<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="bg-white rounded-lg shadow-sm p-6" :ref="el => headerRef = el as HTMLElement">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Abonnements</h1>
          <p class="mt-1 text-sm text-gray-600">
            Gestion des abonnements de la clinique
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <Button variant="outline" @click="exportData" :disabled="loading">
            <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button @click="$router.push('/subscriptions/new')">
            <PlusIcon class="h-4 w-4 mr-2" />
            Nouvel abonnement
          </Button>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6" :ref="el => statsRef = el as HTMLElement">
      <StatCard
        title="Total abonnements"
        :value="storeStats.total"
        icon="DocumentTextIcon"
        color="blue"
        :loading="loading"
      />
      
      <StatCard
        title="Actifs"
        :value="storeStats.active"
        :trend="storeStats.renewalRate" <!-- Assuming renewalRate can be used as a trend for active ones -->
        icon="CheckCircleIcon"
        color="green"
        :loading="loading"
      />
      
      <StatCard
        title="Expirent bientôt"
        :value="storeStats.expiringSoon || 0" <!-- Default to 0 if undefined -->
        icon="ClockIcon"
        color="yellow"
        :loading="loading"
      />
      
      <StatCard
        title="Revenus mensuels (Abo.)" <!-- Clarified this is subscription revenue -->
        :value="formatCurrency(storeStats.monthlyRevenue || 0)" <!-- Default to 0 -->
        icon="CurrencyDollarIcon"
        color="purple"
        :loading="loading"
      />
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-lg shadow-sm p-6" :ref="el => filtersRef = el as HTMLElement">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="subSearch" class="form-label">Recherche Patient</label>
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="subSearch"
              v-model="viewFilters.search"
              type="text"
              placeholder="Nom, email patient..."
              class="form-input pl-10"
              @input="debouncedApplyFilters"
            />
          </div>
        </div>
        
        <div>
          <label for="subStatus" class="form-label">Statut</label>
          <select id="subStatus" v-model="viewFilters.status" class="form-input" @change="applyViewFilters">
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="expired">Expiré</option>
            <option value="cancelled">Annulé</option>
            <option value="pending_payment">Paiement en attente</option>
            <!-- 'suspended' n'est pas dans SubscriptionStatus de service, mais était dans le mock. Ajout de pending_payment -->
          </select>
        </div>
        
        <div>
          <label for="subPlan" class="form-label">Plan</label>
          <select id="subPlan" v-model="viewFilters.planId" class="form-input" @change="applyViewFilters">
            <option value="">Tous les plans</option>
            <option v-for="plan in subscriptionPlans" :key="plan.id" :value="plan.id">
              {{ plan.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label for="subAutoRenew" class="form-label">Renouvellement auto</label>
          <select id="subAutoRenew" v-model="viewFilters.autoRenew" class="form-input" @change="applyViewFilters" disabled>
            <!-- Disabled car non géré par le store/service filters pour l'instant -->
            <option value="">Tous</option>
            <option value="true">Activé</option>
            <option value="false">Désactivé</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tableau des abonnements -->
    <div class="bg-white rounded-lg shadow-sm" :ref="el => tableRef = el as HTMLElement">
      <DataTable
        title="Liste des abonnements"
        :data="subscriptions"
        :columns="columns"
        :current-page="storePagination.currentPage"
        :total-pages="storePagination.totalPages"
        :total-items="storePagination.total"
        :loading="loading"
        @page-change="handlePageChange"
        @search="debouncedApplyFilters" <!-- Assumant que DataTable émet la query de recherche -->
        @sort="handleSort"
      >
        <template #actions>
          <Button variant="outline" size="sm" @click="refreshData">
            <ArrowPathIcon class="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </template>

        <template #cell-patient="{ item }">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10">
              <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span class="text-sm font-medium text-primary-700">
                  {{ getInitials(item.patient?.firstName || '', item.patient?.lastName || '') }}
                </span>
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">
                {{ item.patient?.firstName }} {{ item.patient?.lastName }}
              </div>
              <div class="text-sm text-gray-500">{{ item.patient?.patientNumber }}</div>
            </div>
          </div>
        </template>

        <template #cell-plan="{ item }">
          <div>
            <div class="text-sm font-medium text-gray-900">{{ item.plan?.name }}</div>
            <div class="text-sm text-gray-500">{{ formatCurrency(item.plan?.price || 0) }}</div>
          </div>
        </template>

        <template #cell-status="{ value }">
          <span 
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              getStatusClass(value)
            ]"
          >
            {{ getStatusLabel(value) }}
          </span>
        </template>

        <template #cell-dates="{ item }">
          <div class="text-sm">
            <div class="text-gray-900">{{ formatDate(item.startDate) }}</div>
            <div class="text-gray-500">→ {{ formatDate(item.endDate) }}</div>
          </div>
        </template>

        <template #cell-autoRenew="{ value }">
          <span 
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            ]"
          >
            {{ value ? 'Activé' : 'Désactivé' }}
          </span>
        </template>

        <template #cell-remaining="{ item }">
          <div class="text-sm">
            {{ getRemainingDays(item.endDate) }}
          </div>
        </template>

        <template #table-actions="{ item }">
          <div class="flex items-center space-x-2">
            <button
              @click="viewSubscription(item.id)"
              class="text-primary-600 hover:text-primary-900 text-sm font-medium"
            >
              Voir
            </button>
            <button
              v-if="item.status === 'active'"
              @click="renewSubscription(item)"
              class="text-green-600 hover:text-green-900 text-sm font-medium"
            >
              Renouveler
            </button>
            <button
              v-if="item.status === 'active'"
              @click="suspendSubscription(item)"
              class="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
            >
              Suspendre
            </button>
            <button
              @click="cancelSubscription(item)"
              class="text-red-600 hover:text-red-900 text-sm font-medium"
            >
              Annuler
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue' // Added computed
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscriptionStore' // Added store
import { useGSAP } from '@/composables/useGSAP'
import { formatDate, formatCurrency, getInitials, debounce } from '@/utils/formatters'
import Button from '@/components/ui/Button.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import {
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const { fadeIn, staggerAnimation } = useGSAP()

// Refs pour animations
const headerRef = ref<HTMLElement>()
const statsRef = ref<HTMLElement>()
const filtersRef = ref<HTMLElement>()
const tableRef = ref<HTMLElement>()

// État mappé au store
const loading = computed(() => subscriptionStore.loading || subscriptionStore.loadingStats)
const subscriptions = computed(() => subscriptionStore.subscriptions)
const storePagination = computed(() => subscriptionStore.pagination)
const storeStats = computed(() => subscriptionStore.stats)

// Filtres locaux de la vue
const viewFilters = reactive({
  search: '', // Utilisé pour patientId dans le store filter
  status: '',
  planId: '',
  autoRenew: '' // Ce filtre n'est pas dans SubscriptionFilters du store, à ajouter si nécessaire
})

// Plans d'abonnement (mock pour l'instant, à remplacer par une source de données réelle si besoin)
const subscriptionPlans = ref([
  { id: '1', name: 'Plan Étudiant', price: 25000 },
  { id: '2', name: 'Plan Standard', price: 50000 },
  { id: '3', name: 'Plan Premium', price: 75000 }
])

// Configuration du tableau
const columns = [
  { key: 'patient', label: 'Patient', sortable: false },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'status', label: 'Statut', sortable: true },
  { key: 'dates', label: 'Période', sortable: false },
  { key: 'autoRenew', label: 'Auto-renouvellement', sortable: true },
  { key: 'remaining', label: 'Restant', sortable: false }
]

// Données de démonstration
const mockSubscriptions = [
  {
    id: '1',
    patientId: '1',
    planId: '1',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    autoRenew: true,
    patient: {
      firstName: 'Marie',
      lastName: 'Dupont',
      patientNumber: 'P-2024-001'
    },
    plan: {
      name: 'Plan Étudiant',
      price: 25000
    }
  },
  {
    id: '2',
    patientId: '2',
    planId: '2',
    status: 'active',
    startDate: '2024-02-01',
    endDate: '2024-07-31',
    autoRenew: false,
    patient: {
      firstName: 'Jean',
      lastName: 'Kouassi',
      patientNumber: 'P-2024-002'
    },
    plan: {
      name: 'Plan Standard',
      price: 50000
    }
  }
]

// Méthodes utilitaires
const getStatusClass = (status: string) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    suspended: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    active: 'Actif',
    expired: 'Expiré',
    cancelled: 'Annulé',
    suspended: 'Suspendu'
  }
  return labels[status as keyof typeof labels] || status
}

const getRemainingDays = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Expiré'
  if (diffDays === 0) return 'Expire aujourd\'hui'
  if (diffDays === 1) return '1 jour'
  return `${diffDays} jours`
}

// Actions
const loadSubscriptionListData = async (page?: number) => {
  // loading state is computed from store
  const filtersToApply = {
    patientId: viewFilters.search, // Map search to patientId as discussed
    status: viewFilters.status || undefined, // Pass undefined if empty string for cleaner API query
    planId: viewFilters.planId || undefined,
    // autoRenew is not in store filters yet
  };
  subscriptionStore.setSubscriptionFilters(filtersToApply);
  // fetchSubscriptions will be triggered by setSubscriptionFilters if page is 1,
  // or we can call it directly if page is provided.
  // The store's fetchSubscriptions already resets to page 1 if filters change via setSubscriptionFilters.
  // So, if page is provided here, it's likely from pagination.
  await subscriptionStore.fetchSubscriptions(page || storePagination.value.currentPage);
}

const loadSubscriptionStats = async () => {
  await subscriptionStore.fetchSubscriptionStats();
}

const applyViewFilters = () => {
  // setSubscriptionFilters in store will trigger fetchSubscriptions(1)
  subscriptionStore.setSubscriptionFilters({
    patientId: viewFilters.search,
    status: viewFilters.status || undefined,
    planId: viewFilters.planId || undefined,
  });
}

const debouncedApplyFilters = debounce(() => {
  applyViewFilters();
}, 500)

const handlePageChange = (page: number) => {
  loadSubscriptionListData(page);
}

const handleSort = (key: string, direction: 'asc' | 'desc') => {
  // TODO: Implement server-side sorting if API supports it
  console.log('Sort attempt (subscriptions):', key, direction)
  // If client-side sorting is handled by DataTable, no specific action needed here.
  // If server-side: subscriptionStore.setSort(key, direction); loadSubscriptionListData(1);
}

const refreshData = async () => {
  await loadSubscriptionListData();
  await loadSubscriptionStats();
}

const exportData = () => {
  // TODO: Implement export functionality using subscriptionStore.exportSubscriptions()
  console.log('Export abonnements (placeholder)')
  notifications.info({ title: 'Exportation', message: 'Fonctionnalité d\'exportation non implémentée.'})
}

const viewSubscription = (id: string) => {
  router.push(`/subscriptions/${id}`) // TODO: Create this route and view
}

const renewSubscription = async (subscription: any) => {
  // TODO: Replace prompt with a proper modal for better UX and input validation
  const durationDaysStr = prompt(`Renouveler l'abonnement de ${subscription.patient?.firstName} ${subscription.patient?.lastName} pour combien de jours supplémentaires ?`, "30");

  if (durationDaysStr) {
    const durationDays = parseInt(durationDaysStr, 10);
    if (isNaN(durationDays) || durationDays <= 0) {
      notifications.error({ title: 'Durée invalide', message: 'Veuillez entrer un nombre de jours valide.' });
      return;
    }

    try {
      await subscriptionStore.renewSubscription(subscription.id, { durationDays });
      // Success notification is handled by the store action.
      // The list will also be updated by the store action.
    } catch (error) {
      // Error notification is handled by the global interceptor or store action's catch block.
      console.error('Failed to renew subscription from view:', error);
    }
  }
}

const suspendSubscription = (subscription: any) => {
  // TODO: Implement suspend logic using store action (PATCH /subscriptions/:id with status 'suspended')
  if (confirm(`Suspendre l'abonnement de ${subscription.patient?.firstName} ${subscription.patient?.lastName} ?`)) {
    console.log('Suspendre (placeholder):', subscription.id)
    notifications.info({ title: 'Suspension', message: 'Fonctionnalité de suspension non implémentée.'})
  }
}

const cancelSubscription = async (subscription: any) => {
  // TODO: Replace confirm with a proper modal for better UX
  if (confirm(`Êtes-vous sûr de vouloir annuler l'abonnement de ${subscription.patient?.firstName} ${subscription.patient?.lastName} ? Cet abonnement sera définitivement supprimé ou marqué comme annulé.`)) {
    try {
      await subscriptionStore.cancelSubscription(subscription.id);
      // Success notification is handled by the store action.
      // The list will also be updated by the store action.
      // May need to call refreshData() if total count impacts pagination display significantly and isn't reactive enough.
    } catch (error) {
      // Error notification is handled by the global interceptor or store action's catch block.
      console.error('Failed to cancel subscription from view:', error);
    }
  }
}

onMounted(async () => {
  await refreshData(); // Load both list and stats

  // Animations d'entrée
  setTimeout(() => {
    if (headerRef.value) fadeIn(headerRef.value)
  }, 100)
  
  setTimeout(() => {
    if (statsRef.value) {
      const statCards = statsRef.value.querySelectorAll('[data-stat-card]')
      staggerAnimation(Array.from(statCards))
    }
  }, 300)
  
  setTimeout(() => {
    if (filtersRef.value) fadeIn(filtersRef.value)
  }, 500)
  
  setTimeout(() => {
    if (tableRef.value) fadeIn(tableRef.value)
  }, 700)
  
  // Charger les données
  loadData()
})
</script>
