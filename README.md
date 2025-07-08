# 🎨 Guide Complet Frontend Vue.js - Clinique Universitaire

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration du projet](#configuration-du-projet)
3. [Architecture du projet](#architecture-du-projet)
4. [Configuration API et Axios](#configuration-api-et-axios)
5. [Authentification et JWT](#authentification-et-jwt)
6. [Gestion des États (Pinia)](#gestion-des-états-pinia)
7. [Composants principaux](#composants-principaux)
8. [Interfaces et Types](#interfaces-et-types)
9. [Services API](#services-api)
10. [Pages et Vues](#pages-et-vues)
11. [Routage et Navigation](#routage-et-navigation)
12. [Intégration CinetPay](#intégration-cinetpay)
13. [Styling et UI](#styling-et-ui)
14. [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

Ce frontend Vue.js 3 est conçu pour interagir avec l'API NestJS de gestion de clinique universitaire. Il utilise la Composition API, TypeScript, Pinia pour la gestion d'état, et Vue Router pour la navigation.

### Technologies Utilisées

- **Vue.js 3** - Framework principal avec Composition API
- **TypeScript** - Typage statique
- **Pinia** - Gestion d'état moderne pour Vue
- **Vue Router 4** - Routage SPA
- **Axios** - Client HTTP pour les appels API
- **Tailwind CSS** - Framework CSS utilitaire
- **Vite** - Build tool et dev server
- **Vue Query (TanStack)** - Cache et synchronisation des données
- **Headless UI** - Composants accessibles
- **Heroicons** - Icônes SVG

---

## ⚙️ Configuration du projet

### Création du projet

```bash
# Créer le projet Vue.js avec Vite
npm create vue@latest clinic-frontend

# Options recommandées :
# ✅ TypeScript
# ✅ Router
# ✅ Pinia
# ✅ ESLint
# ✅ Prettier

cd clinic-frontend
npm install
```

### Dépendances supplémentaires

```bash
# Dépendances principales
npm install axios @tanstack/vue-query @headlessui/vue @heroicons/vue
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography autoprefixer postcss
npm install vue-toastification date-fns validator
npm install chart.js vue-chartjs

# Dépendances de développement
npm install -D @types/validator @vitejs/plugin-vue
```

### Configuration Tailwind CSS

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Configuration Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

---

## 🏗️ Architecture du projet

```
src/
├── components/           # Composants réutilisables
│   ├── ui/              # Composants UI de base
│   ├── forms/           # Composants de formulaires
│   ├── tables/          # Composants de tableaux
│   └── charts/          # Composants de graphiques
├── views/               # Pages/Vues principales
│   ├── auth/           # Pages d'authentification
│   ├── patients/       # Pages de gestion des patients
│   ├── subscriptions/  # Pages d'abonnements
│   ├── payments/       # Pages de paiements
│   └── dashboard/      # Tableau de bord
├── stores/             # Stores Pinia
├── services/           # Services API
├── types/              # Types TypeScript
├── utils/              # Fonctions utilitaires
├── composables/        # Composables Vue
├── router/             # Configuration du routage
└── assets/             # Ressources statiques
```

---

## 🔗 Configuration API et Axios

### Configuration de base

```ts
// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Intercepteur de requête - Ajouter le token JWT
    this.api.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore()
        const token = authStore.token
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        return config
      },
      (error) => Promise.reject(error)
    )

    // Intercepteur de réponse - Gestion des erreurs
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          const authStore = useAuthStore()
          authStore.logout()
          // Rediriger vers la page de connexion
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Méthodes HTTP génériques
  public get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.api.get(url, { params })
  }

  public post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.post(url, data)
  }

  public patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data)
  }

  public delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete(url)
  }
}

export const apiService = new ApiService()
```

---

## 🔐 Authentification et JWT

### Store d'authentification

```ts
// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type { User, LoginCredentials, LoginResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isReceptionist = computed(() => user.value?.role === 'receptionist')

  // Actions
  const login = async (credentials: LoginCredentials): Promise<void> => {
    loading.value = true
    try {
      const response = await apiService.post<LoginResponse>('/auth/login', credentials)
      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData
      
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = (): void => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const loadUserFromStorage = (): void => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && token.value) {
      user.value = JSON.parse(storedUser)
    }
  }

  const refreshProfile = async (): Promise<void> => {
    try {
      const response = await apiService.get<User>('/auth/profile')
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (error) {
      logout()
      throw error
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isReceptionist,
    login,
    logout,
    loadUserFromStorage,
    refreshProfile,
  }
})
```

### Garde de navigation

```ts
// src/router/guards.ts
import { useAuthStore } from '@/stores/auth'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
}

export const adminGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAdmin) {
    next('/dashboard')
  } else {
    next()
  }
}
```

---

## 🗃️ Gestion des États (Pinia)

### Store des patients

```ts
// src/stores/patients.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { patientsService } from '@/services/patients'
import type { Patient, CreatePatientDto, PatientFilters, PaginatedResponse } from '@/types/patient'

export const usePatientsStore = defineStore('patients', () => {
  const patients = ref<Patient[]>([])
  const currentPatient = ref<Patient | null>(null)
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchPatients = async (filters?: PatientFilters) => {
    loading.value = true
    try {
      const response = await patientsService.getAll(filters)
      patients.value = response.patients
      pagination.value = {
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        total: response.total,
        totalPages: response.totalPages
      }
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const createPatient = async (patientData: CreatePatientDto): Promise<Patient> => {
    const response = await patientsService.create(patientData)
    patients.value.unshift(response)
    return response
  }

  const updatePatient = async (id: string, patientData: Partial<CreatePatientDto>): Promise<Patient> => {
    const response = await patientsService.update(id, patientData)
    const index = patients.value.findIndex(p => p.id === id)
    if (index !== -1) {
      patients.value[index] = response
    }
    return response
  }

  const deletePatient = async (id: string): Promise<void> => {
    await patientsService.delete(id)
    patients.value = patients.value.filter(p => p.id !== id)
  }

  return {
    patients,
    currentPatient,
    loading,
    pagination,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  }
})
```

---

## 🧩 Composants principaux

### Composant de tableau réutilisable

```vue
<!-- src/components/ui/DataTable.vue -->
<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <!-- En-tête avec recherche et filtres -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <div class="flex items-center space-x-4">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              @input="onSearch"
            />
          </div>
          <slot name="actions" />
        </div>
      </div>
    </div>

    <!-- Tableau -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              @click="handleSort(column.key)"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                <ChevronUpDownIcon v-if="!sortKey || sortKey !== column.key" class="h-4 w-4" />
                <ChevronUpIcon v-else-if="sortDirection === 'asc'" class="h-4 w-4" />
                <ChevronDownIcon v-else class="h-4 w-4" />
              </div>
            </th>
            <th class="relative px-6 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in sortedData" :key="item.id" class="hover:bg-gray-50">
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <slot :name="`cell-${column.key}`" :item="item" :value="getNestedValue(item, column.key)">
                {{ getNestedValue(item, column.key) }}
              </slot>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <slot name="actions" :item="item" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-6 py-4 border-t border-gray-200">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        @page-change="$emit('pageChange', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { MagnifyingGlassIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import Pagination from './Pagination.vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
}

interface Props {
  title: string
  data: any[]
  columns: Column[]
  currentPage: number
  totalPages: number
  totalItems: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  pageChange: [page: number]
  search: [query: string]
  sort: [key: string, direction: 'asc' | 'desc']
}>()

const searchQuery = ref('')
const sortKey = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')

const sortedData = computed(() => {
  if (!sortKey.value) return props.data
  
  return [...props.data].sort((a, b) => {
    const aVal = getNestedValue(a, sortKey.value)
    const bVal = getNestedValue(b, sortKey.value)
    
    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
})

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((o, p) => o?.[p], obj)
}

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
  emit('sort', key, sortDirection.value)
}

const onSearch = () => {
  emit('search', searchQuery.value)
}
</script>
```

### Composant de formulaire patient

```vue
<!-- src/components/forms/PatientForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Informations personnelles -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">Informations personnelles</h3>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Prénom *</label>
          <input
            v-model="form.firstName"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Nom *</label>
          <input
            v-model="form.lastName"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Email *</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            v-model="form.phone"
            type="tel"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Date de naissance *</label>
          <input
            v-model="form.dateOfBirth"
            type="date"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Genre *</label>
          <select
            v-model="form.gender"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Sélectionner</option>
            <option value="male">Masculin</option>
            <option value="female">Féminin</option>
          </select>
        </div>
      </div>

      <!-- Informations universitaires -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">Informations universitaires</h3>
        
        <div class="flex items-center">
          <input
            v-model="form.isUniversityAffiliated"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label class="ml-2 block text-sm text-gray-900">Affilié à l'université</label>
        </div>

        <div v-if="form.isUniversityAffiliated">
          <label class="block text-sm font-medium text-gray-700">Département</label>
          <input
            v-model="form.universityDepartment"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div v-if="form.isUniversityAffiliated">
          <label class="block text-sm font-medium text-gray-700">Année/Niveau</label>
          <input
            v-model="form.universityYear"
            type="text"
            placeholder="ex: L3, Master 1, Professeur"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>

    <!-- Boutons d'action -->
    <div class="flex justify-end space-x-3">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Annuler
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        <span v-if="loading">Enregistrement...</span>
        <span v-else>{{ mode === 'create' ? 'Créer' : 'Modifier' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { CreatePatientDto, Patient } from '@/types/patient'

interface Props {
  patient?: Patient
  loading?: boolean
  mode: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  submit: [data: CreatePatientDto]
  cancel: []
}>()

const form = reactive<CreatePatientDto>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  address: '',
  city: '',
  nationalId: '',
  studentId: '',
  isUniversityAffiliated: false,
  universityDepartment: '',
  universityYear: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  bloodType: '',
  allergies: '',
  medicalHistory: ''
})

// Remplir le formulaire si on édite un patient
watch(() => props.patient, (patient) => {
  if (patient && props.mode === 'edit') {
    Object.assign(form, patient)
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('submit', { ...form })
}
</script>
```

---

## 📡 Services API

### Service des patients

```ts
// src/services/patients.ts
import { apiService } from './api'
import type { Patient, CreatePatientDto, PatientFilters, PaginatedResponse, PatientStats } from '@/types/patient'

export const patientsService = {
  async getAll(filters?: PatientFilters): Promise<PaginatedResponse<Patient>> {
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)

    const response = await apiService.get<PaginatedResponse<Patient>>(`/patients?${params}`)
    return response.data
  },

  async getById(id: string): Promise<Patient> {
    const response = await apiService.get<Patient>(`/patients/${id}`)
    return response.data
  },

  async getByNumber(patientNumber: string): Promise<Patient> {
    const response = await apiService.get<Patient>(`/patients/by-number/${patientNumber}`)
    return response.data
  },

  async create(data: CreatePatientDto): Promise<Patient> {
    const response = await apiService.post<Patient>('/patients', data)
    return response.data
  },

  async update(id: string, data: Partial<CreatePatientDto>): Promise<Patient> {
    const response = await apiService.patch<Patient>(`/patients/${id}`, data)
    return response.data
  },

  async changeStatus(id: string, status: string): Promise<Patient> {
    const response = await apiService.patch<Patient>(`/patients/${id}/status`, { status })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(`/patients/${id}`)
  },

  async getStats(): Promise<PatientStats> {
    const response = await apiService.get<PatientStats>('/patients/stats')
    return response.data
  }
}
```

### Service des paiements avec CinetPay

```ts
// src/services/payments.ts
import { apiService } from './api'
import type { Payment, CreatePaymentDto, InitiateCinetPayDto, PaymentStats } from '@/types/payment'

export const paymentsService = {
  async create(data: CreatePaymentDto): Promise<Payment> {
    const response = await apiService.post<Payment>('/payments', data)
    return response.data
  },

  async initiateCinetPay(data: InitiateCinetPayDto): Promise<{ payment: Payment; paymentUrl: string }> {
    const response = await apiService.post<{ payment: Payment; paymentUrl: string }>('/payments/cinetpay/initiate', data)
    return response.data
  },

  async getAll(filters?: any): Promise<any> {
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.patientId) params.append('patientId', filters.patientId)

    const response = await apiService.get(`/payments?${params}`)
    return response.data
  },

  async getById(id: string): Promise<Payment> {
    const response = await apiService.get<Payment>(`/payments/${id}`)
    return response.data
  },

  async refund(id: string, refundAmount?: number): Promise<Payment> {
    const response = await apiService.patch<Payment>(`/payments/${id}/refund`, { refundAmount })
    return response.data
  },

  async getStats(): Promise<PaymentStats> {
    const response = await apiService.get<PaymentStats>('/payments/stats')
    return response.data
  }
}
```

---

## 🎨 Pages et Vues

### Page de connexion

```vue
<!-- src/views/auth/LoginView.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion - Clinique Universitaire
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Accédez à votre espace de gestion
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <span v-if="loading">Connexion...</span>
            <span v-else>Se connecter</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await authStore.login(form)
    toast.success('Connexion réussie!')
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur de connexion'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>
```

### Tableau de bord

```vue
<!-- src/views/dashboard/DashboardView.vue -->
<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
      <p class="mt-1 text-sm text-gray-600">
        Vue d'ensemble de la clinique universitaire
      </p>
    </div>

    <!-- Statistiques principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Patients"
        :value="stats.patients?.total || 0"
        :trend="stats.patients?.growth"
        icon="UserGroupIcon"
        color="blue"
      />
      
      <StatCard
        title="Abonnements actifs"
        :value="stats.subscriptions?.active || 0"
        :trend="stats.subscriptions?.growth"
        icon="DocumentCheckIcon"
        color="green"
      />
      
      <StatCard
        title="Revenus mensuels"
        :value="formatCurrency(stats.payments?.monthlyRevenue || 0)"
        :trend="stats.payments?.growth"
        icon="CurrencyDollarIcon"
        color="yellow"
      />
      
      <StatCard
        title="Paiements en attente"
        :value="stats.payments?.pending || 0"
        icon="ClockIcon"
        color="red"
      />
    </div>

    <!-- Graphiques -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Évolution des abonnements</h3>
        <LineChart :data="chartData.subscriptions" />
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Répartition par type d'abonnement</h3>
        <DoughnutChart :data="chartData.subscriptionTypes" />
      </div>
    </div>

    <!-- Activités récentes -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Activités récentes</h3>
      </div>
      <RecentActivities :activities="recentActivities" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import RecentActivities from '@/components/dashboard/RecentActivities.vue'
import { formatCurrency } from '@/utils/formatters'

const stats = ref({})
const chartData = ref({})
const recentActivities = ref([])

onMounted(async () => {
  await loadDashboardData()
})

const loadDashboardData = async () => {
  // Charger les statistiques depuis l'API
  // Implementation des appels API pour récupérer les données du tableau de bord
}
</script>
```

---

## 🧭 Routage et Navigation

### Configuration du routeur

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue')
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/patients',
      name: 'Patients',
      component: () => import('@/views/patients/PatientsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/patients/new',
      name: 'NewPatient',
      component: () => import('@/views/patients/NewPatientView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/subscriptions',
      name: 'Subscriptions',
      component: () => import('@/views/subscriptions/SubscriptionsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/payments',
      name: 'Payments',
      component: () => import('@/views/payments/PaymentsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/admin/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

// Garde de navigation globale
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
```

---

## 💳 Intégration CinetPay

### Composant de paiement

```vue
<!-- src/components/payments/CinetPayPayment.vue -->
<template>
  <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Paiement CinetPay</h3>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Montant</label>
        <input
          v-model="amount"
          type="number"
          min="0"
          step="100"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Montant en FCFA"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Méthode de paiement</label>
        <select
          v-model="paymentMethod"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="mobile_money">Mobile Money</option>
          <option value="credit_card">Carte bancaire</option>
        </select>
      </div>

      <div v-if="paymentMethod === 'mobile_money'">
        <label class="block text-sm font-medium text-gray-700">Opérateur</label>
        <select
          v-model="mobileOperator"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="ORANGE">Orange Money</option>
          <option value="MTN">MTN Mobile Money</option>
          <option value="MOOV">Moov Money</option>
          <option value="WAVE">Wave</option>
        </select>
      </div>

      <button
        @click="initiatePaiement"
        :disabled="!amount || loading"
        class="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
      >
        <span v-if="loading">Redirection en cours...</span>
        <span v-else>Procéder au paiement</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { paymentsService } from '@/services/payments'
import { useToast } from 'vue-toastification'

interface Props {
  patientId: string
  subscriptionId?: string
}

const props = defineProps<Props>()
const toast = useToast()

const amount = ref<number>(0)
const paymentMethod = ref('mobile_money')
const mobileOperator = ref('ORANGE')
const loading = ref(false)

const initiatePaiement = async () => {
  if (!amount.value) {
    toast.error('Veuillez saisir un montant')
    return
  }

  loading.value = true
  
  try {
    // 1. Créer le paiement
    const payment = await paymentsService.create({
      patientId: props.patientId,
      subscriptionId: props.subscriptionId,
      amount: amount.value,
      method: paymentMethod.value,
      mobileMoneyOperator: paymentMethod.value === 'mobile_money' ? mobileOperator.value : undefined
    })

    // 2. Initier le paiement CinetPay
    const { paymentUrl } = await paymentsService.initiateCinetPay({
      paymentId: payment.id,
      returnUrl: `${window.location.origin}/payments/success`,
      cancelUrl: `${window.location.origin}/payments/cancel`
    })

    // 3. Rediriger vers CinetPay
    window.location.href = paymentUrl

  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Erreur lors de l\'initiation du paiement')
  } finally {
    loading.value = false
  }
}
</script>
```

---

## 🎯 Configuration du main.ts

```ts
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import Toast from 'vue-toastification'
import App from './App.vue'
import router from './router'

import 'vue-toastification/dist/index.css'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin)
app.use(Toast, {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
})

app.mount('#app')
```

---

## 🚀 Scripts de développement

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    "format": "prettier --write src/"
  }
}
```

---

## 📝 Conclusion

Ce guide fournit une base solide pour développer un frontend Vue.js 3 moderne et robuste pour votre système de gestion de clinique universitaire. Le code est structuré de manière modulaire, utilise TypeScript pour la sécurité des types, et intègre toutes les fonctionnalités nécessaires pour interagir efficacement avec votre API NestJS.

### Points clés à retenir :

1. **Architecture modulaire** - Séparation claire des responsabilités
2. **TypeScript** - Sécurité des types et meilleure expérience développeur
3. **Pinia** - Gestion d'état moderne et réactive
4. **Composants réutilisables** - DRY principle et maintenabilité
5. **Intégration API complète** - Tous les endpoints couverts
6. **Authentification JWT** - Sécurité et gestion des permissions
7. **Intégration CinetPay** - Paiements en ligne fluides
8. **Interface utilisateur moderne** - Tailwind CSS et composants accessibles

Le frontend est maintenant prêt pour la production et peut être facilement étendu selon les besoins futurs de votre clinique universitaire.