<template>
  <div class="space-y-6">
    <!-- En-tête avec titre et actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Administration</h1>
        <p class="text-gray-600">Gestion des utilisateurs et paramètres système</p>
      </div>
    </div>

    <!-- Onglets -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div>
      <!-- Onglet Utilisateurs -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">Utilisateurs</h2>
          <Button @click="showUserModal = true">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nouvel utilisateur
          </Button>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <DataTable
            title="Utilisateurs"
            :columns="userColumns"
            :data="users"
            :loading="loadingUsers"
            :current-page="1"
            :total-pages="1"
            :total-items="users.length"
          >
            <template #cell-role="{ item }">
              <span 
                :class="getRoleClass(item.role)"
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ getRoleLabel(item.role) }}
              </span>
            </template>
            
            <template #cell-status="{ item }">
              <span 
                :class="getUserStatusClass(item.status)"
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ getUserStatusLabel(item.status) }}
              </span>
            </template>
            
            <template #actions="{ row }">
              <div class="flex items-center space-x-2">
                <button
                  @click="editUser(row)"
                  class="text-primary-600 hover:text-primary-900 text-sm font-medium"
                >
                  Modifier
                </button>
                <button
                  v-if="row.status === 'active'"
                  @click="deactivateUser(row)"
                  class="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Désactiver
                </button>
                <button
                  v-else
                  @click="activateUser(row)"
                  class="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
                >
                  Activer
                </button>
              </div>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Onglet Paramètres -->
      <div v-if="activeTab === 'settings'" class="space-y-6">
        <h2 class="text-lg font-semibold text-gray-900">Paramètres système</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Paramètres généraux -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4">Paramètres généraux</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la clinique</label>
                <input
                  v-model="settings.clinicName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <textarea
                  v-model="settings.address"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  v-model="settings.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  v-model="settings.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <!-- Paramètres de paiement -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4">Paramètres de paiement</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Devise par défaut</label>
                <select 
                  v-model="settings.defaultCurrency"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="XOF">Franc CFA (XOF)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dollar US (USD)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Clé API CinetPay</label>
                <input
                  v-model="settings.cinetpayApiKey"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Site ID CinetPay</label>
                <input
                  v-model="settings.cinetpaySiteId"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div class="flex items-center">
                <input
                  v-model="settings.enableOnlinePayments"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900">
                  Activer les paiements en ligne
                </label>
              </div>
            </div>
          </div>

          <!-- Paramètres de notification -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4">Notifications</h3>
            <div class="space-y-4">
              <div class="flex items-center">
                <input
                  v-model="settings.emailNotifications"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900">
                  Notifications par email
                </label>
              </div>
              <div class="flex items-center">
                <input
                  v-model="settings.smsNotifications"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900">
                  Notifications par SMS
                </label>
              </div>
              <div class="flex items-center">
                <input
                  v-model="settings.pushNotifications"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900">
                  Notifications push
                </label>
              </div>
            </div>
          </div>

          <!-- Paramètres de sécurité -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4">Sécurité</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Durée de session (minutes)
                </label>
                <input
                  v-model.number="settings.sessionTimeout"
                  type="number"
                  min="15"
                  max="480"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Tentatives de connexion max
                </label>
                <input
                  v-model.number="settings.maxLoginAttempts"
                  type="number"
                  min="3"
                  max="10"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div class="flex items-center">
                <input
                  v-model="settings.requirePasswordChange"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900">
                  Obliger le changement de mot de passe
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <Button @click="saveSettings" :loading="savingSettings">
            Enregistrer les paramètres
          </Button>
        </div>
      </div>

      <!-- Onglet Sauvegarde -->
      <div v-if="activeTab === 'backup'" class="space-y-6">
        <h2 class="text-lg font-semibold text-gray-900">Sauvegarde et restauration</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4">Sauvegarde automatique</h3>
            <div class="space-y-4">
              <div class="flex items-center">
                <input
                  v-model="backupSettings.autoBackup"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900">
                  Activer la sauvegarde automatique
                </label>
              </div>
              <div v-if="backupSettings.autoBackup">
                <label class="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                <select 
                  v-model="backupSettings.frequency"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuelle</option>
                </select>
              </div>
              <div class="text-sm text-gray-600">
                Dernière sauvegarde : {{ formatDate(backupSettings.lastBackup.toString()) }}
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4">Actions</h3>
            <div class="space-y-3">
              <Button 
                @click="createBackup" 
                :loading="creatingBackup"
                variant="outline"
                class="w-full"
              >
                Créer une sauvegarde maintenant
              </Button>
              <Button 
                @click="downloadBackup" 
                variant="outline"
                class="w-full"
              >
                Télécharger la dernière sauvegarde
              </Button>
              <Button 
                @click="restoreBackup" 
                variant="outline"
                class="w-full"
              >
                Restaurer une sauvegarde
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal utilisateur -->
    <div v-if="showUserModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75" @click="showUserModal = false"></div>
        </div>
        
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
            </h3>
          </div>
          
          <form @submit.prevent="saveUser" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  v-model="currentUser.firstName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  v-model="currentUser.lastName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="currentUser.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select 
                v-model="currentUser.role"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="admin">Administrateur</option>
                <option value="doctor">Médecin</option>
                <option value="nurse">Infirmier</option>
                <option value="receptionist">Réceptionniste</option>
              </select>
            </div>
            
            <div v-if="!editingUser">
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                v-model="currentUser.password"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                @click="cancelUserEdit"
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                :loading="savingUser"
              >
                {{ editingUser ? 'Modifier' : 'Créer' }}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useGSAP } from '@/composables/useGSAP'
import { formatDate } from '@/utils/formatters'
import Button from '@/components/ui/Button.vue'
import DataTable from '@/components/ui/DataTable.vue'

// États réactifs
const activeTab = ref('users')
const showUserModal = ref(false)
const editingUser = ref(false)
const loadingUsers = ref(false)
const savingUser = ref(false)
const savingSettings = ref(false)
const creatingBackup = ref(false)

// Onglets
const tabs = [
  { id: 'users', label: 'Utilisateurs' },
  { id: 'settings', label: 'Paramètres' },
  { id: 'backup', label: 'Sauvegarde' }
]

// Utilisateurs
const users = ref([
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'System',
    email: 'admin@clinique.com',
    role: 'admin',
    status: 'active',
    lastLogin: new Date(),
    createdAt: new Date()
  }
])

const currentUser = reactive({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  role: 'receptionist',
  password: ''
})

const userColumns = [
  { key: 'firstName', label: 'Prénom', sortable: true },
  { key: 'lastName', label: 'Nom', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Rôle' },
  { key: 'status', label: 'Statut' },
  { key: 'actions', label: 'Actions' }
]

// Paramètres
const settings = reactive({
  clinicName: 'Clinique Universitaire Alpha',
  address: '123 Boulevard Lagunaire, Abidjan, Côte d\'Ivoire',
  phone: '+225 01 02 03 04 05',
  email: 'contact@clinique-alpha.ci',
  defaultCurrency: 'XOF',
  cinetpayApiKey: '',
  cinetpaySiteId: '',
  enableOnlinePayments: true,
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  sessionTimeout: 120,
  maxLoginAttempts: 5,
  requirePasswordChange: false
})

// Paramètres de sauvegarde
const backupSettings = reactive({
  autoBackup: true,
  frequency: 'daily',
  lastBackup: new Date()
})

// Méthodes
const getRoleClass = (role: string) => {
  const classes = {
    admin: 'bg-purple-100 text-purple-800',
    doctor: 'bg-blue-100 text-blue-800',
    nurse: 'bg-emerald-100 text-emerald-800',
    receptionist: 'bg-amber-100 text-amber-800'
  }
  return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getRoleLabel = (role: string) => {
  const labels = {
    admin: 'Administrateur',
    doctor: 'Médecin',
    nurse: 'Infirmier',
    receptionist: 'Réceptionniste'
  }
  return labels[role as keyof typeof labels] || role
}

const getUserStatusClass = (status: string) => {
  const classes = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getUserStatusLabel = (status: string) => {
  const labels = {
    active: 'Actif',
    inactive: 'Inactif'
  }
  return labels[status as keyof typeof labels] || status
}

const editUser = (user: any) => {
  editingUser.value = true
  Object.assign(currentUser, user)
  showUserModal.value = true
}

const cancelUserEdit = () => {
  editingUser.value = false
  Object.assign(currentUser, {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'receptionist',
    password: ''
  })
  showUserModal.value = false
}

const saveUser = async () => {
  savingUser.value = true
  try {
    // TODO: Appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (!editingUser.value) {
      // Ajouter le nouvel utilisateur
      users.value.push({
        ...currentUser,
        id: Date.now().toString(),
        status: 'active',
        lastLogin: new Date(),
        createdAt: new Date()
      })
    } else {
      // Mettre à jour l'utilisateur existant
      const index = users.value.findIndex(u => u.id === currentUser.id)
      if (index !== -1) {
        users.value[index] = { ...currentUser, ...users.value[index] }
      }
    }
    
    cancelUserEdit()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    savingUser.value = false
  }
}

const activateUser = (user: any) => {
  user.status = 'active'
  // TODO: Appel API
}

const deactivateUser = (user: any) => {
  user.status = 'inactive'
  // TODO: Appel API
}

const saveSettings = async () => {
  savingSettings.value = true
  try {
    // TODO: Appel API pour sauvegarder les paramètres
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres:', error)
  } finally {
    savingSettings.value = false
  }
}

const createBackup = async () => {
  creatingBackup.value = true
  try {
    // TODO: Créer une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 2000))
    backupSettings.lastBackup = new Date()
  } catch (error) {
    console.error('Erreur lors de la création de la sauvegarde:', error)
  } finally {
    creatingBackup.value = false
  }
}

const downloadBackup = () => {
  // TODO: Télécharger la sauvegarde
  console.log('Téléchargement de la sauvegarde...')
}

const restoreBackup = () => {
  // TODO: Restaurer une sauvegarde
  console.log('Restauration de la sauvegarde...')
}

// Animations GSAP
const { animateOnMount } = useGSAP()

onMounted(() => {
  animateOnMount('.space-y-6 > *', 'fadeIn', 0.1)
})
</script>
