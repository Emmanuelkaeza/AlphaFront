<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="bg-white rounded-lg shadow-sm p-6" ref="headerRef">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Abonnements</h1>
          <p class="mt-1 text-sm text-gray-600">
            Gestion des abonnements de la clinique
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <Button variant="outline" @click="exportData">
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
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6" ref="statsRef">
      <StatCard
        title="Total abonnements"
        :value="stats.total"
        icon="DocumentTextIcon"
        color="blue"
        :loading="loading"
      />
      
      <StatCard
        title="Actifs"
        :value="stats.active"
        :trend="stats.activeGrowth"
        icon="CheckCircleIcon"
        color="green"
        :loading="loading"
      />
      
      <StatCard
        title="Expirent bientôt"
        :value="stats.expiringSoon"
        icon="ClockIcon"
        color="yellow"
        :loading="loading"
      />
      
      <StatCard
        title="Revenus mensuels"
        :value="formatCurrency(stats.monthlyRevenue)"
        :trend="stats.revenueGrowth"
        icon="CurrencyDollarIcon"
        color="purple"
        :loading="loading"
      />
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-lg shadow-sm p-6" ref="filtersRef">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="form-label">Recherche</label>
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Patient, plan..."
              class="form-input pl-10"
              @input="debouncedSearch"
            />
          </div>
        </div>
        
        <div>
          <label class="form-label">Statut</label>
          <select v-model="filters.status" class="form-input" @change="applyFilters">
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="expired">Expiré</option>
            <option value="cancelled">Annulé</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>
        
        <div>
          <label class="form-label">Plan</label>
          <select v-model="filters.planId" class="form-input" @change="applyFilters">
            <option value="">Tous les plans</option>
            <option v-for="plan in subscriptionPlans" :key="plan.id" :value="plan.id">
              {{ plan.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="form-label">Renouvellement auto</label>
          <select v-model="filters.autoRenew" class="form-input" @change="applyFilters">
            <option value="">Tous</option>
            <option value="true">Activé</option>
            <option value="false">Désactivé</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tableau des abonnements -->
    <div class="bg-white rounded-lg shadow-sm" ref="tableRef">
      <DataTable
        title="Liste des abonnements"
        :data="subscriptions"
        :columns="columns"
        :current-page="pagination.page"
        :total-pages="pagination.totalPages"
        :total-items="pagination.total"
        :loading="loading"
        @page-change="handlePageChange"
        @search="handleSearch"
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
const { fadeIn, staggerAnimation } = useGSAP()

// Refs pour animations
const headerRef = ref<HTMLElement>()
const statsRef = ref<HTMLElement>()
const filtersRef = ref<HTMLElement>()
const tableRef = ref<HTMLElement>()

// État
const loading = ref(false)
const subscriptions = ref([])
const subscriptionPlans = ref([
  { id: '1', name: 'Plan Étudiant', price: 25000 },
  { id: '2', name: 'Plan Standard', price: 50000 },
  { id: '3', name: 'Plan Premium', price: 75000 }
])

const stats = ref({
  total: 150,
  active: 128,
  expiringSoon: 12,
  monthlyRevenue: 3750000,
  activeGrowth: 8.5,
  revenueGrowth: 12.3
})

const filters = reactive({
  search: '',
  status: '',
  planId: '',
  autoRenew: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

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
const loadData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    subscriptions.value = mockSubscriptions as any
    pagination.total = mockSubscriptions.length
    pagination.totalPages = Math.ceil(mockSubscriptions.length / pagination.limit)
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  loadData()
}

const handleSearch = (query: string) => {
  filters.search = query
  applyFilters()
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 300)

const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

const handleSort = (key: string, direction: 'asc' | 'desc') => {
  console.log('Sort:', key, direction)
}

const refreshData = () => {
  loadData()
}

const exportData = () => {
  console.log('Export abonnements')
}

const viewSubscription = (id: string) => {
  router.push(`/subscriptions/${id}`)
}

const renewSubscription = (subscription: any) => {
  if (confirm(`Renouveler l'abonnement de ${subscription.patient.firstName} ${subscription.patient.lastName} ?`)) {
    console.log('Renouveler:', subscription.id)
  }
}

const suspendSubscription = (subscription: any) => {
  if (confirm(`Suspendre l'abonnement de ${subscription.patient.firstName} ${subscription.patient.lastName} ?`)) {
    console.log('Suspendre:', subscription.id)
  }
}

const cancelSubscription = (subscription: any) => {
  if (confirm(`Annuler l'abonnement de ${subscription.patient.firstName} ${subscription.patient.lastName} ?`)) {
    console.log('Annuler:', subscription.id)
  }
}

onMounted(() => {
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
