<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8" ref="loginFormRef">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-6" ref="logoRef">
          <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-8 0H3m2 0h4m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
          </svg>
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900" ref="titleRef">
          Clinique Universitaire
        </h2>
        <p class="mt-2 text-sm text-gray-600" ref="subtitleRef">
          Connectez-vous à votre espace de gestion
        </p>
      </div>
      
      <!-- Form -->
      <form class="mt-8 space-y-6 bg-white rounded-lg shadow-xl p-8" @submit.prevent="handleSubmit" ref="formRef">
        <div class="space-y-4">
          <div>
            <label for="email" class="form-label">Adresse email</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="form-input"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.email }"
              placeholder="votre@email.com"
            />
            <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
          </div>
          
          <div>
            <label for="password" class="form-label">Mot de passe</label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                required
                class="form-input pr-10"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.password }"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Se souvenir de moi
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Mot de passe oublié?
            </a>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="loginError" class="bg-red-50 border border-red-200 rounded-md p-4" ref="errorRef">
          <div class="flex">
            <div class="flex-shrink-0">
              <XCircleIcon class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ loginError }}</p>
            </div>
          </div>
        </div>

        <!-- Submit button -->
        <div>
          <Button
            type="submit"
            :disabled="loading"
            class="w-full btn-lg"
            ref="submitButtonRef"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connexion en cours...
            </span>
            <span v-else>Se connecter</span>
          </Button>
        </div>

        <!-- Demo credentials -->
        <div class="mt-6 p-4 bg-gray-50 rounded-md">
          <p class="text-xs text-gray-600 mb-2">Comptes de démonstration:</p>
          <div class="grid grid-cols-1 gap-2 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-500">Admin:</span>
              <span class="font-mono">admin@clinic.com / admin123</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Réceptionniste:</span>
              <span class="font-mono">reception@clinic.com / reception123</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGSAP } from '@/composables/useGSAP'
import Button from '@/components/ui/Button.vue'
import { EyeIcon, EyeSlashIcon, XCircleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const { fadeIn, slideInLeft, slideInRight, scaleIn } = useGSAP()

// Refs pour les animations
const loginFormRef = ref<HTMLElement>()
const logoRef = ref<HTMLElement>()
const titleRef = ref<HTMLElement>()
const subtitleRef = ref<HTMLElement>()
const formRef = ref<HTMLElement>()
const errorRef = ref<HTMLElement>()
const submitButtonRef = ref<HTMLElement>()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const loginError = ref('')
const showPassword = ref(false)

const validateForm = () => {
  errors.email = ''
  errors.password = ''
  
  if (!form.email) {
    errors.email = 'L\'adresse email est requise'
    return false
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Adresse email invalide'
    return false
  }
  
  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
    return false
  }
  
  if (form.password.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  loginError.value = ''
  
  try {
    await authStore.login({
      email: form.email,
      password: form.password
    })
    
    // Animation de succès
    if (submitButtonRef.value) {
      scaleIn(submitButtonRef.value, { scale: 1.1, duration: 0.2 })
    }
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
    
  } catch (error: any) {
    loginError.value = error.response?.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.'
    
    // Animation d'erreur
    if (errorRef.value) {
      slideInLeft(errorRef.value)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Animations d'entrée séquentielles
  setTimeout(() => {
    if (logoRef.value) scaleIn(logoRef.value)
  }, 100)
  
  setTimeout(() => {
    if (titleRef.value) fadeIn(titleRef.value)
  }, 300)
  
  setTimeout(() => {
    if (subtitleRef.value) fadeIn(subtitleRef.value)
  }, 500)
  
  setTimeout(() => {
    if (formRef.value) slideInRight(formRef.value)
  }, 700)
})
</script>
