<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="bg-white rounded-lg shadow-sm p-6" ref="headerRef">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p class="mt-1 text-sm text-gray-600">
            Vue d'ensemble de la clinique universitaire
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <div class="text-right">
            <p class="text-sm text-gray-500">Dernière mise à jour</p>
            <p class="text-sm font-medium text-gray-900">{{ formatDateTime(new Date().toISOString()) }}</p>
          </div>
          <Button @click="refreshData" :disabled="loading" size="sm">
            <ArrowPathIcon class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }" />
            Actualiser
          </Button>
        </div>
      </div>
    </div>

    <!-- Statistiques principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" ref="statsRef">
      <StatCard
        title="Patients"
        :value="stats.patients?.total || 0"
        :trend="stats.patients?.growth || 0"
        icon="UserGroupIcon"
        color="blue"
        :loading="loading"
      />
      
      <StatCard
        title="Abonnements actifs"
        :value="stats.subscriptions?.active || 0"
        :trend="stats.subscriptions?.growth || 0"
        icon="DocumentCheckIcon"
        color="green"
        :loading="loading"
      />
      
      <StatCard
        title="Revenus mensuels"
        :value="formatCurrency(stats.payments?.monthlyRevenue || 0)"
        :trend="stats.payments?.growth || 0"
        icon="CurrencyDollarIcon"
        color="yellow"
        :loading="loading"
      />
      
      <StatCard
        title="Paiements en attente"
        :value="stats.payments?.pending || 0"
        icon="ClockIcon"
        color="red"
        :loading="loading"
      />
    </div>

    <!-- Graphiques -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" ref="chartsRef">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Évolution des abonnements</h3>
          <div class="flex space-x-2">
            <button
              v-for="period in ['7j', '30j', '90j']"
              :key="period"
              :class="[
                'px-3 py-1 text-xs rounded-md transition-colors',
                selectedPeriod === period 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-500 hover:text-gray-700'
              ]"
              @click="selectedPeriod = period"
            >
              {{ period }}
            </button>
          </div>
        </div>
        <LineChart :data="chartData.subscriptions" :loading="loading" />
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Répartition par type d'abonnement</h3>
        <DoughnutChart :data="chartData.subscriptionTypes" :loading="loading" />
      </div>
    </div>

    <!-- Activités récentes et indicateurs -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" ref="activitiesRef">
      <!-- Activités récentes -->
      <div class="lg:col-span-2 bg-white shadow-sm rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Activités récentes</h3>
        </div>
        <RecentActivities :activities="recentActivities" :loading="loading" />
      </div>

      <!-- Indicateurs de performance -->
      <div class="bg-white shadow-sm rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Indicateurs</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Taux de satisfaction</span>
            <div class="flex items-center">
              <div class="w-20 bg-gray-200 rounded-full h-2 mr-2">
                <div class="bg-green-600 h-2 rounded-full" style="width: 92%"></div>
              </div>
              <span class="text-sm font-medium text-gray-900">92%</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Taux de renouvellement</span>
            <div class="flex items-center">
              <div class="w-20 bg-gray-200 rounded-full h-2 mr-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: 87%"></div>
              </div>
              <span class="text-sm font-medium text-gray-900">87%</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Occupation clinique</span>
            <div class="flex items-center">
              <div class="w-20 bg-gray-200 rounded-full h-2 mr-2">
                <div class="bg-yellow-600 h-2 rounded-full" style="width: 74%"></div>
              </div>
              <span class="text-sm font-medium text-gray-900">74%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="bg-white shadow-sm rounded-lg p-6" ref="quickActionsRef">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          v-for="action in quickActions"
          :key="action.name"
          @click="handleQuickAction(action.action)"
          class="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
        >
          <component :is="action.icon" class="h-8 w-8 text-gray-400 mr-3" />
          <div class="text-left">
            <p class="text-sm font-medium text-gray-900">{{ action.name }}</p>
            <p class="text-xs text-gray-500">{{ action.description }}</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGSAP } from '@/composables/useGSAP'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import Button from '@/components/ui/Button.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import RecentActivities from '@/components/dashboard/RecentActivities.vue'
import {
  ArrowPathIcon,
  UserPlusIcon,
  DocumentPlusIcon,
  CreditCardIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { staggerAnimation, fadeIn } = useGSAP()

// Refs pour animations
const headerRef = ref<HTMLElement>()
const statsRef = ref<HTMLElement>()
const chartsRef = ref<HTMLElement>()
const activitiesRef = ref<HTMLElement>()
const quickActionsRef = ref<HTMLElement>()

// Data
const loading = ref(false)
const selectedPeriod = ref('30j')

const stats = ref({
  patients: {
    total: 1247,
    growth: 12.5
  },
  subscriptions: {
    active: 892,
    growth: 8.3
  },
  payments: {
    monthlyRevenue: 2450000,
    pending: 23,
    growth: 15.2
  }
})

const chartData = ref({
  subscriptions: {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [{
      label: 'Abonnements',
      data: [65, 78, 85, 91, 98, 102],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    }]
  },
  subscriptionTypes: {
    labels: ['Étudiant', 'Personnel', 'Externe'],
    datasets: [{
      data: [65, 25, 10],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ]
    }]
  }
})

const recentActivities = ref([
  {
    id: 1,
    type: 'patient' as const,
    message: 'Nouveau patient enregistré: Marie Dupont',
    timestamp: '2024-01-15T10:30:00Z',
    user: 'Dr. Martin'
  },
  {
    id: 2,
    type: 'payment' as const,
    message: 'Paiement reçu: 50,000 FCFA',
    timestamp: '2024-01-15T09:15:00Z',
    user: 'Système'
  },
  {
    id: 3,
    type: 'subscription' as const,
    message: 'Abonnement renouvelé: Jean Kouassi',
    timestamp: '2024-01-15T08:45:00Z',
    user: 'Réception'
  }
])

const quickActions = [
  {
    name: 'Nouveau patient',
    description: 'Enregistrer un patient',
    icon: UserPlusIcon,
    action: 'new-patient'
  },
  {
    name: 'Nouvel abonnement',
    description: 'Créer un abonnement',
    icon: DocumentPlusIcon,
    action: 'new-subscription'
  },
  {
    name: 'Enregistrer paiement',
    description: 'Saisir un paiement',
    icon: CreditCardIcon,
    action: 'new-payment'
  },
  {
    name: 'Voir rapports',
    description: 'Consulter les statistiques',
    icon: ChartBarIcon,
    action: 'view-reports'
  }
]

const refreshData = async () => {
  loading.value = true
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Ici, on ferait les vrais appels API pour récupérer les données
  } catch (error) {
    console.error('Erreur lors du rafraîchissement:', error)
  } finally {
    loading.value = false
  }
}

const handleQuickAction = (action: string) => {
  switch (action) {
    case 'new-patient':
      router.push('/patients/new')
      break
    case 'new-subscription':
      router.push('/subscriptions/new')
      break
    case 'new-payment':
      router.push('/payments/new')
      break
    case 'view-reports':
      router.push('/reports')
      break
  }
}

onMounted(() => {
  // Animations d'entrée séquentielles
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
    if (chartsRef.value) fadeIn(chartsRef.value)
  }, 600)
  
  setTimeout(() => {
    if (activitiesRef.value) fadeIn(activitiesRef.value)
  }, 800)
  
  setTimeout(() => {
    if (quickActionsRef.value) fadeIn(quickActionsRef.value)
  }, 1000)
  
  // Charger les données initiales
  refreshData()
})
</script>
