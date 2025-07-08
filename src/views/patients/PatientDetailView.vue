<template>
  <div v-if="!loading && patient" class="max-w-6xl mx-auto space-y-6">
    <!-- En-tête -->
    <div class="bg-white rounded-lg shadow-sm p-6" ref="headerRef">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <Button variant="outline" @click="$router.back()">
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ patient.firstName }} {{ patient.lastName }}
            </h1>
            <p class="mt-1 text-sm text-gray-600">
              Patient N° {{ patient.patientNumber }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <span 
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
              getStatusClass(patient.status)
            ]"
          >
            {{ getStatusLabel(patient.status) }}
          </span>
          <Button @click="editPatient">
            <PencilIcon class="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>
    </div>

    <!-- Informations principales -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Informations personnelles -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-lg shadow-sm" ref="personalInfoRef">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Informations personnelles</h2>
          </div>
          <div class="px-6 py-4">
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ patient.email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Téléphone</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ patient.phone || 'Non renseigné' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Date de naissance</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(patient.dateOfBirth) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Genre</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ getGenderLabel(patient.gender) }}</dd>
              </div>
              <div class="md:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Adresse</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ patient.address || 'Non renseignée' }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Informations universitaires -->
        <div v-if="patient.isUniversityAffiliated" class="bg-white rounded-lg shadow-sm" ref="universityInfoRef">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Informations universitaires</h2>
          </div>
          <div class="px-6 py-4">
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Numéro étudiant</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ patient.studentId || 'Non renseigné' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Département</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ patient.universityDepartment || 'Non renseigné' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Année/Niveau</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ patient.universityYear || 'Non renseigné' }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Informations médicales -->
        <div class="bg-white rounded-lg shadow-sm" ref="medicalInfoRef">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Informations médicales</h2>
          </div>
          <div class="px-6 py-4">
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Groupe sanguin</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ patient.bloodType || 'Non renseigné' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Contact d'urgence</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ patient.emergencyContactName || 'Non renseigné' }}
                  <span v-if="patient.emergencyContactPhone" class="block text-gray-500">
                    {{ patient.emergencyContactPhone }}
                  </span>
                </dd>
              </div>
              <div class="md:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Allergies</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ patient.allergies || 'Aucune allergie connue' }}</dd>
              </div>
              <div class="md:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Antécédents médicaux</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ patient.medicalHistory || 'Aucun antécédent renseigné' }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <!-- Sidebar avec actions et statistiques -->
      <div class="space-y-6">
        <!-- Actions rapides -->
        <div class="bg-white rounded-lg shadow-sm" ref="actionsRef">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Actions rapides</h2>
          </div>
          <div class="px-6 py-4 space-y-3">
            <Button class="w-full" @click="createSubscription">
              <DocumentPlusIcon class="h-4 w-4 mr-2" />
              Nouvel abonnement
            </Button>
            <Button variant="outline" class="w-full" @click="recordPayment">
              <CreditCardIcon class="h-4 w-4 mr-2" />
              Enregistrer paiement
            </Button>
            <Button variant="outline" class="w-full" @click="sendNotification">
              <BellIcon class="h-4 w-4 mr-2" />
              Envoyer notification
            </Button>
          </div>
        </div>

        <!-- Statistiques patient -->
        <div class="bg-white rounded-lg shadow-sm" ref="statsRef">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Statistiques</h2>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Abonnements actifs</span>
              <span class="text-sm font-medium text-gray-900">2</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total paiements</span>
              <span class="text-sm font-medium text-gray-900">150,000 FCFA</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Dernière visite</span>
              <span class="text-sm font-medium text-gray-900">Il y a 3 jours</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Membre depuis</span>
              <span class="text-sm font-medium text-gray-900">{{ formatDate(patient.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Activité récente -->
        <div class="bg-white rounded-lg shadow-sm" ref="activityRef">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Activité récente</h2>
          </div>
          <div class="px-6 py-4">
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p class="text-sm text-gray-900">Paiement reçu</p>
                  <p class="text-xs text-gray-500">Il y a 2 jours</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p class="text-sm text-gray-900">Abonnement renouvelé</p>
                  <p class="text-xs text-gray-500">Il y a 1 semaine</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p class="text-sm text-gray-900">Profil mis à jour</p>
                  <p class="text-xs text-gray-500">Il y a 2 semaines</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading state -->
  <div v-else-if="loading" class="max-w-6xl mx-auto space-y-6">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 rounded w-1/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/6"></div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-6 bg-gray-200 rounded w-1/3"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-6 bg-gray-200 rounded w-1/2"></div>
            <div class="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Error state -->
  <div v-else class="max-w-6xl mx-auto">
    <div class="bg-white rounded-lg shadow-sm p-6 text-center">
      <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h2 class="text-lg font-medium text-gray-900 mb-2">Patient non trouvé</h2>
      <p class="text-sm text-gray-600 mb-4">Le patient demandé n'existe pas ou a été supprimé.</p>
      <Button @click="$router.push('/patients')">
        Retour à la liste
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGSAP } from '@/composables/useGSAP'
import { formatDate } from '@/utils/formatters'
import Button from '@/components/ui/Button.vue'
import {
  ArrowLeftIcon,
  PencilIcon,
  DocumentPlusIcon,
  CreditCardIcon,
  BellIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const { fadeIn } = useGSAP()

// Refs pour animations
const headerRef = ref<HTMLElement>()
const personalInfoRef = ref<HTMLElement>()
const universityInfoRef = ref<HTMLElement>()
const medicalInfoRef = ref<HTMLElement>()
const actionsRef = ref<HTMLElement>()
const statsRef = ref<HTMLElement>()
const activityRef = ref<HTMLElement>()

// État
const loading = ref(true)
const patient = ref<any>(null)

// Données de démonstration
const mockPatient = {
  id: '1',
  patientNumber: 'P-2024-001',
  firstName: 'Marie',
  lastName: 'Dupont',
  email: 'marie.dupont@etudiant.univ.ci',
  phone: '+225 01 02 03 04 05',
  dateOfBirth: '1995-06-15',
  gender: 'female',
  address: 'Cocody, Angré 8ème tranche, Villa 123',
  city: 'Abidjan',
  nationalId: 'CI123456789',
  studentId: 'ETU-2024-001',
  isUniversityAffiliated: true,
  universityDepartment: 'Informatique',
  universityYear: 'Master 1',
  emergencyContactName: 'Jean Dupont',
  emergencyContactPhone: '+225 07 08 09 10 11',
  bloodType: 'A+',
  allergies: 'Allergie aux arachides',
  medicalHistory: 'Asthme léger depuis l\'enfance',
  status: 'active',
  createdAt: '2024-01-15T10:30:00Z'
}

// Méthodes utilitaires
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

const getGenderLabel = (gender: string) => {
  return gender === 'male' ? 'Masculin' : 'Féminin'
}

// Actions
const editPatient = () => {
  router.push(`/patients/${route.params.id}/edit`)
}

const createSubscription = () => {
  router.push(`/subscriptions/new?patientId=${route.params.id}`)
}

const recordPayment = () => {
  router.push(`/payments/new?patientId=${route.params.id}`)
}

const sendNotification = () => {
  alert('Fonctionnalité de notification à implémenter')
}

// Chargement des données
const loadPatient = async () => {
  loading.value = true
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // En réalité, on ferait un appel API avec l'ID
    if (route.params.id === '1') {
      patient.value = mockPatient
    } else {
      patient.value = null
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    patient.value = null
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadPatient()
  
  if (patient.value) {
    // Animations d'entrée séquentielles
    const refs = [
      headerRef,
      personalInfoRef,
      universityInfoRef,
      medicalInfoRef,
      actionsRef,
      statsRef,
      activityRef
    ]

    refs.forEach((ref, index) => {
      setTimeout(() => {
        if (ref.value) fadeIn(ref.value)
      }, index * 100)
    })
  }
})
</script>
