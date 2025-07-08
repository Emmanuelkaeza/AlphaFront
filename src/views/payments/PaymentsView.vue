<template>
  <div class="space-y-6">
    <!-- En-tête avec titre et actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Paiements</h1>
        <p class="text-gray-600">Gestion des paiements et transactions</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline" 
          @click="exportPayments"
          :loading="exporting"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Exporter
        </Button>
        <Button @click="showNewPaymentModal = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nouveau paiement
        </Button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total aujourd'hui"
        :value="formatCurrency(stats.todayTotal)"
        :change="stats.todayChange"
        icon="💰"
        color="emerald"
      />
      <StatCard
        title="Total ce mois"
        :value="formatCurrency(stats.monthTotal)"
        :change="stats.monthChange"
        icon="📈"
        color="blue"
      />
      <StatCard
        title="Paiements en attente"
        :value="stats.pendingCount.toString()"
        :change="stats.pendingChange"
        icon="⏳"
        color="amber"
      />
      <StatCard
        title="Paiements échoués"
        :value="stats.failedCount.toString()"
        :change="stats.failedChange"
        icon="❌"
        color="red"
      />
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nom du patient, numéro de transaction..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
          <select 
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="completed">Complété</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- Tableau des paiements -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <DataTable
        title="Paiements"
        :columns="columns"
        :data="payments"
        :loading="loading"
        :current-page="pagination.currentPage"
        :total-pages="pagination.totalPages"
        :total-items="pagination.total"
        @page-change="handlePageChange"
        @sort="handleSort"
      >
        <template #cell-status="{ item }">
          <span 
            :class="getStatusClass(item.status)"
            class="px-2 py-1 text-xs font-medium rounded-full"
          >
            {{ getStatusLabel(item.status) }}
          </span>
        </template>
        
        <template #cell-amount="{ item }">
          <span class="font-medium text-gray-900">
            {{ formatCurrency(item.amount) }}
          </span>
        </template>
        
        <template #cell-patient="{ item }">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
              <span class="text-sm font-medium text-primary-600">
                {{ item.patient.firstName[0] }}{{ item.patient.lastName[0] }}
              </span>
            </div>
            <div>
              <div class="font-medium text-gray-900">
                {{ item.patient.firstName }} {{ item.patient.lastName }}
              </div>
              <div class="text-sm text-gray-500">
                {{ item.patient.email }}
              </div>
            </div>
          </div>
        </template>
        
        <template #cell-method="{ item }">
          <div class="flex items-center">
            <span :class="getMethodIcon(item.method)" class="mr-2"></span>
            {{ getMethodLabel(item.method) }}
          </div>
        </template>
        
        <template #cell-createdAt="{ item }">
          <div>
            <div class="text-sm text-gray-900">{{ formatDate(item.createdAt) }}</div>
            <div class="text-xs text-gray-500">{{ formatTime(item.createdAt) }}</div>
          </div>
        </template>
        
        <template #actions="{ row }">
          <div class="flex items-center space-x-2">
            <button
              @click="viewPayment(row)"
              class="text-primary-600 hover:text-primary-900 text-sm font-medium"
            >
              Voir
            </button>
            <button
              v-if="row.status === 'pending'"
              @click="processPayment(row)"
              class="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
            >
              Traiter
            </button>
            <button
              v-if="row.status === 'completed'"
              @click="refundPayment(row)"
              class="text-red-600 hover:text-red-900 text-sm font-medium"
            >
              Rembourser
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Modal nouveau paiement -->
    <div v-if="showNewPaymentModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75" @click="showNewPaymentModal = false"></div>
        </div>
        
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="mb-4">
            <h3 class="text-lg font-medium text-gray-900">Nouveau paiement</h3>
            <p class="text-sm text-gray-500">Enregistrer un nouveau paiement</p>
          </div>
          
          <form @submit.prevent="createPayment" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <select 
                v-model="newPayment.patientId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sélectionner un patient</option>
                <option v-for="patient in availablePatients" :key="patient.id" :value="patient.id">
                  {{ patient.firstName }} {{ patient.lastName }}
                </option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                <input
                  v-model.number="newPayment.amount"
                  type="number"
                  step="0.01"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Méthode</label>
                <select 
                  v-model="newPayment.method"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="cash">Espèces</option>
                  <option value="card">Carte</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Virement bancaire</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="newPayment.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Description du paiement..."
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                @click="showNewPaymentModal = false"
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                :loading="creating"
              >
                Créer le paiement
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGSAP } from '@/composables/useGSAP'
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters'
import Button from '@/components/ui/Button.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import type { Payment } from '@/types/payment'
import type { Patient } from '@/types/patient'

// Données réactives
const loading = ref(false)
const creating = ref(false)
const exporting = ref(false)
const showNewPaymentModal = ref(false)

// Filtres
const filters = ref({
  search: '',
  status: '',
  startDate: '',
  endDate: ''
})

// Pagination
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

// Statistiques
const stats = ref({
  todayTotal: 125000,
  todayChange: 12.5,
  monthTotal: 3450000,
  monthChange: 8.3,
  pendingCount: 5,
  pendingChange: -2.1,
  failedCount: 2,
  failedChange: 0
})

// Nouveau paiement
const newPayment = ref({
  patientId: '',
  amount: 0,
  method: 'cash',
  description: ''
})

// Données simulées
const payments = ref<Payment[]>([
  {
    id: '1',
    patientId: '1',
    amount: 15000,
    currency: 'FCFA',
    status: 'completed',
    method: 'mobile_money',
    description: 'Consultation générale',
    transactionId: 'TXN-2024-001',
    patient: {
      id: '1',
      firstName: 'Marie',
      lastName: 'Kouame',
      patientNumber: 'P001'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    patientId: '2',
    amount: 25000,
    currency: 'FCFA',
    status: 'pending',
    method: 'card',
    description: 'Consultation spécialisée',
    transactionId: 'TXN-2024-002',
    patient: {
      id: '2',
      firstName: 'Jean',
      lastName: 'Doe',
      patientNumber: 'P002'
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  }
])

const availablePatients = ref<Patient[]>([
  {
    id: '1',
    patientNumber: 'P001',
    firstName: 'Marie',
    lastName: 'Kouame',
    email: 'marie.kouame@email.com',
    phone: '+225 01 02 03 04 05',
    dateOfBirth: '1990-01-01',
    gender: 'female',
    address: '123 Rue de la Paix, Abidjan',
    bloodType: 'A+',
    emergencyContactName: 'Paul Kouame',
    emergencyContactPhone: '+225 01 02 03 04 06',
    isUniversityAffiliated: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
])

// Configuration des colonnes
const columns = [
  { key: 'transactionId', label: 'Transaction ID', sortable: true },
  { key: 'patient', label: 'Patient' },
  { key: 'amount', label: 'Montant', sortable: true },
  { key: 'method', label: 'Méthode' },
  { key: 'status', label: 'Statut' },
  { key: 'createdAt', label: 'Date', sortable: true },
  { key: 'actions', label: 'Actions' }
]

// Méthodes
const getStatusClass = (status: string) => {
  const classes = {
    completed: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    completed: 'Complété',
    pending: 'En attente',
    failed: 'Échoué',
    cancelled: 'Annulé'
  }
  return labels[status as keyof typeof labels] || status
}

const getMethodIcon = (method: string) => {
  const icons = {
    cash: '💵',
    card: '💳',
    mobile_money: '📱',
    bank_transfer: '🏦'
  }
  return icons[method as keyof typeof icons] || '💰'
}

const getMethodLabel = (method: string) => {
  const labels = {
    cash: 'Espèces',
    card: 'Carte',
    mobile_money: 'Mobile Money',
    bank_transfer: 'Virement bancaire'
  }
  return labels[method as keyof typeof labels] || method
}

const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
  // TODO: Charger les données de la nouvelle page
}

const handleSort = (column: string, direction: 'asc' | 'desc') => {
  // TODO: Implémenter le tri
  console.log('Sort:', column, direction)
}

const viewPayment = (payment: Payment) => {
  // TODO: Naviguer vers la vue détail du paiement
  console.log('View payment:', payment)
}

const processPayment = (payment: Payment) => {
  // TODO: Traiter le paiement
  console.log('Process payment:', payment)
}

const refundPayment = (payment: Payment) => {
  // TODO: Rembourser le paiement
  console.log('Refund payment:', payment)
}

const createPayment = async () => {
  creating.value = true
  try {
    // TODO: Appel API pour créer le paiement
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Réinitialiser le formulaire
    newPayment.value = {
      patientId: '',
      amount: 0,
      method: 'cash',
      description: ''
    }
    showNewPaymentModal.value = false
    
    // TODO: Recharger les données
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error)
  } finally {
    creating.value = false
  }
}

const exportPayments = async () => {
  exporting.value = true
  try {
    // TODO: Exporter les paiements
    await new Promise(resolve => setTimeout(resolve, 2000))
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
  } finally {
    exporting.value = false
  }
}

// Animations GSAP
const { animateOnMount } = useGSAP()

onMounted(() => {
  animateOnMount('.space-y-6 > *', 'fadeIn', 0.1)
})

// Watchers pour les filtres
watch(filters, () => {
  // TODO: Recharger les données avec les nouveaux filtres
}, { deep: true })
</script>
