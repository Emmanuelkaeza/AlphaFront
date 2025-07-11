<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="bg-white rounded-lg shadow-sm p-6" ref="headerRef">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Patients</h1>
          <p class="mt-1 text-sm text-gray-600">
            Gestion des patients de la clinique universitaire
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <Button 
            variant="outline" 
            @click="exportPatientsData"
            :disabled="loading"
          >
            <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button @click="$router.push('/patients/new')">
            <PlusIcon class="h-4 w-4 mr-2" />
            Nouveau patient
          </Button>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-lg shadow-sm p-6" ref="filtersRef">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="searchPatient" class="form-label">Recherche</label>
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="searchPatient"
              v-model="viewFilters.search"
              type="text"
              placeholder="Nom, email, numéro..."
              class="form-input pl-10"
              @input="debouncedApplyFilters"
            />
          </div>
        </div>
        
        <div>
          <label for="statusFilter" class="form-label">Statut</label>
          <select id="statusFilter" v-model="viewFilters.status" class="form-input" @change="applyViewFilters">
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>
        
        <div>
          <label for="uniAffiliationFilter" class="form-label">Affiliation universitaire</label>
          <select id="uniAffiliationFilter" v-model="viewFilters.isUniversityAffiliated" class="form-input" @change="applyViewFilters" disabled>
            <option value="">Tous</option>
            <option value="true">Affilié</option>
            <option value="false">Non affilié</option>
          </select>
        </div>
        
        <div>
          <label for="departmentFilter" class="form-label">Département</label>
          <select id="departmentFilter" v-model="viewFilters.department" class="form-input" @change="applyViewFilters" disabled>
            <option value="">Tous les départements</option>
            <option value="informatique">Informatique</option>
            <option value="medecine">Médecine</option>
            <option value="droit">Droit</option>
            <option value="economie">Économie</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Statistiques rapides -->
    <!-- Design doc GET /patients/stats: nombre total, nouveaux patients, actifs/inactifs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6" ref="statsRef">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <UserGroupIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total patients</p>
            <p class="text-2xl font-semibold text-gray-900">{{ storeStats.total || 0 }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <CheckCircleIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Actifs</p>
            <p class="text-2xl font-semibold text-gray-900">{{ storeStats.active || 0 }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <CalendarDaysIcon class="h-6 w-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Nouveaux patients</p>
            <p class="text-2xl font-semibold text-gray-900">{{ storeStats.new || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau des patients -->
    <div class="bg-white rounded-lg shadow-sm" ref="tableRef">
      <DataTable
        title="Liste des patients"
        :data="patients"
        :columns="columns"
        :current-page="storePagination.currentPage || 1"
        :total-pages="storePagination.totalPages || 0"
        :total-items="storePagination.total || 0"
        :loading="loading"
        @page-change="handlePageChange"
        @search="debouncedApplyFilters"
        @sort="handleSort"
      >
        <template #actions>
          <Button variant="outline" size="sm" @click="refreshData">
            <ArrowPathIcon class="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </template>

        <template #cell-patientNumber="{ value }">
          <span class="font-mono text-sm">{{ value }}</span>
        </template>

        <template #cell-name="{ item }">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10">
              <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span class="text-sm font-medium text-primary-700">
                  {{ getInitials(item.firstName, item.lastName) }}
                </span>
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">
                {{ item.firstName }} {{ item.lastName }}
              </div>
              <div class="text-sm text-gray-500">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <template #cell-universityAffiliation="{ item }"> <!-- Changed from #cell-university -->
          <div v-if="item.isUniversityAffiliated">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <AcademicCapIcon class="h-3 w-3 mr-1" />
              {{ item.universityDepartment || 'Affilié' }}
            </span>
          </div>
          <span v-else class="text-sm text-gray-500">Non affilié</span>
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

        <template #cell-createdAt="{ value }">
          <span class="text-sm text-gray-900">{{ formatDate(value) }}</span>
        </template>

        <template #table-actions="{ item }"> <!-- DataTable uses 'item' not 'row' based on its current definition -->
          <div class="flex items-center space-x-2">
            <button
              @click="viewPatient(item.id)"
              class="text-primary-600 hover:text-primary-900 text-sm font-medium"
            >
              Voir
            </button>
            <button
              @click="editPatient(item.id)"
              class="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Modifier
            </button>
            <button
              @click="deletePatientHandler(item)"
              class="text-red-600 hover:text-red-900 text-sm font-medium"
            >
              Supprimer
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patient'
import { notifications } from '@/composables/useNotifications' // Import notifications
import { useGSAP } from '@/composables/useGSAP'
import { formatDate, getInitials, debounce } from '@/utils/formatters'
import Button from '@/components/ui/Button.vue'
import DataTable, { type Column } from '@/components/ui/DataTable.vue'
import {
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  CalendarDaysIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const patientStore = usePatientStore() // Initialize patientStore
const { fadeIn, staggerAnimation } = useGSAP()

// Refs pour animations
const headerRef = ref<HTMLElement>()
const filtersRef = ref<HTMLElement>()
const statsRef = ref<HTMLElement>()
const tableRef = ref<HTMLElement>()

// État
const loading = ref(false)
const patients = ref([])
const stats = ref({
  total: 0,
  active: 0,
  students: 0,
  newThisMonth: 0
})

const filters = reactive({
  search: '',
  status: '',
  isUniversityAffiliated: '',
  department: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// Configuration du tableau
const columns = [
  { key: 'patientNumber', label: 'N° Patient', sortable: true },
  { key: 'name', label: 'Nom complet', sortable: false },
  { key: 'phone', label: 'Téléphone', sortable: true },
  { key: 'university', label: 'Université', sortable: false },
  { key: 'status', label: 'Statut', sortable: true },
  { key: 'createdAt', label: 'Date création', sortable: true }
]

// Données de démonstration
const mockPatients = [
  {
    id: '1',
    patientNumber: 'P-2024-001',
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@etudiant.univ.ci',
    phone: '+225 01 02 03 04 05',
    isUniversityAffiliated: true,
    universityDepartment: 'Informatique',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    patientNumber: 'P-2024-002',
    firstName: 'Jean',
    lastName: 'Kouassi',
    email: 'jean.kouassi@univ.ci',
    phone: '+225 07 08 09 10 11',
    isUniversityAffiliated: true,
    universityDepartment: 'Médecine',
    status: 'active',
    createdAt: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    patientNumber: 'P-2024-003',
    firstName: 'Fatou',
    lastName: 'Traoré',
    email: 'fatou.traore@gmail.com',
    phone: '+225 05 06 07 08 09',
    isUniversityAffiliated: false,
    universityDepartment: null,
    status: 'inactive',
    createdAt: '2024-01-13T09:15:00Z'
  }
]

// Méthodes
const getStatusClass = (status: string) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    active: 'Actif',
    inactive: 'Inactif',
    suspended: 'Suspendu'
  }
  return labels[status as keyof typeof labels] || status
}

const loadData = async () => {
  loading.value = true
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 800))
    patients.value = mockPatients as any
    stats.value = {
      total: mockPatients.length,
      active: mockPatients.filter(p => p.status === 'active').length,
      students: mockPatients.filter(p => p.isUniversityAffiliated).length,
      newThisMonth: mockPatients.filter(p => {
        const created = new Date(p.createdAt)
        const now = new Date()
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      }).length
    }
    pagination.total = mockPatients.length
    pagination.totalPages = Math.ceil(mockPatients.length / pagination.limit)
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  // Logique de filtrage
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
  // Logique de tri
  console.log('Sort:', key, direction)
}

const refreshData = () => {
  loadData()
}

const exportPatients = () => {
  // Logique d'export
  console.log('Export patients')
}

const viewPatient = (id: string) => {
  router.push(`/patients/${id}`)
}

const editPatient = (id: string) => {
  router.push(`/patients/${id}/edit`)
}

const deletePatient = async (patient: { id: string, firstName: string, lastName: string }) => {
  // TODO: Remplacer confirm par une modale de confirmation plus jolie (comme mentionné dans le code précédent)
  if (confirm(`Êtes-vous sûr de vouloir supprimer le patient ${patient.firstName} ${patient.lastName} ?`)) {
    try {
      await patientStore.deletePatient(patient.id);
      notifications.success({ title: 'Succès', message: `Patient ${patient.firstName} ${patient.lastName} supprimé.` });
      // La liste est mise à jour optimistically par le store.
      // Si la pagination ou le total doit être rafraîchi immédiatement, on pourrait appeler ici:
      // await loadData(); // ou une version qui ne fetch que les stats/pagination si la liste est déjà OK.
    } catch (error) {
      console.error("Suppression échouée depuis la vue:", error);
      // Les erreurs API sont déjà notifiées par l'intercepteur global.
      // Si une notification spécifique est nécessaire ici pour des erreurs non-API:
      // notifications.error({ title: 'Échec Suppression', message: 'La suppression du patient a échoué.' });
    }
  }
}

onMounted(() => {
  // Animations d'entrée
  setTimeout(() => {
    if (headerRef.value) fadeIn(headerRef.value)
  }, 100)
  
  setTimeout(() => {
    if (filtersRef.value) fadeIn(filtersRef.value)
  }, 300)
  
  setTimeout(() => {
    if (statsRef.value) {
      const statCards = statsRef.value.querySelectorAll('> div')
      staggerAnimation(Array.from(statCards))
    }
  }, 500)
  
  setTimeout(() => {
    if (tableRef.value) fadeIn(tableRef.value)
  }, 700)
  
  // Charger les données
  loadData()
})
</script>
