<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Animation d'erreur -->
      <div ref="errorAnimation" class="text-center mb-8">
        <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Paiement échoué</h1>
        <p class="text-gray-600 mb-8">
          {{ errorMessage || 'Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.' }}
        </p>
      </div>

      <!-- Détails de l'erreur -->
      <div v-if="errorDetails" class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Détails de l'erreur</h2>
        
        <div class="space-y-3">
          <div v-if="errorDetails.transactionId" class="flex justify-between">
            <span class="text-gray-500">Transaction ID:</span>
            <span class="font-mono text-sm">{{ errorDetails.transactionId }}</span>
          </div>
          
          <div v-if="errorDetails.amount" class="flex justify-between">
            <span class="text-gray-500">Montant:</span>
            <span class="font-semibold">{{ formatCurrency(errorDetails.amount) }}</span>
          </div>
          
          <div v-if="errorDetails.method" class="flex justify-between">
            <span class="text-gray-500">Méthode tentée:</span>
            <span>{{ getMethodLabel(errorDetails.method) }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-500">Code d'erreur:</span>
            <span class="font-mono text-sm text-red-600">{{ errorDetails.code || 'UNKNOWN' }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-500">Date:</span>
            <span>{{ formatDateTime(new Date().toISOString()) }}</span>
          </div>
        </div>
      </div>

      <!-- Raisons communes d'échec -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
        <h3 class="text-sm font-semibold text-amber-800 mb-3">Raisons communes d'échec :</h3>
        <ul class="text-sm text-amber-700 space-y-1">
          <li>• Fonds insuffisants sur votre compte</li>
          <li>• Informations de carte incorrectes</li>
          <li>• Problème de connexion réseau</li>
          <li>• Limite de transaction dépassée</li>
          <li>• Transaction bloquée par votre banque</li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <Button 
          @click="retryPayment" 
          class="w-full"
          :loading="retrying"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Réessayer le paiement
        </Button>
        
        <Button 
          @click="chooseOtherMethod" 
          variant="outline"
          class="w-full"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
          Changer de méthode de paiement
        </Button>
        
        <Button 
          @click="contactSupport" 
          variant="outline"
          class="w-full"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          Contacter le support
        </Button>
        
        <button 
          @click="goHome" 
          class="w-full text-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>

      <!-- Informations de contact -->
      <div class="mt-8 text-center text-sm text-gray-500">
        <p class="mb-2">Besoin d'aide ? Contactez-nous :</p>
        <div class="space-y-1">
          <a href="tel:+22501020304" class="block text-primary-600 hover:text-primary-700">
            📞 +225 01 02 03 04
          </a>
          <a href="mailto:support@clinique-alpha.ci" class="block text-primary-600 hover:text-primary-700">
            ✉️ support@clinique-alpha.ci
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGSAP } from '@/composables/useGSAP'
import { usePaymentStore } from '@/stores/payment'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

const errorAnimation = ref<HTMLElement>()
const errorMessage = ref<string>('')
const errorDetails = ref<any>(null)
const retrying = ref(false)

// Méthodes
const getMethodLabel = (method: string) => {
  const labels = {
    cash: 'Espèces',
    card: 'Carte',
    mobile_money: 'Mobile Money',
    bank_transfer: 'Virement bancaire'
  }
  return labels[method as keyof typeof labels] || method
}

const retryPayment = async () => {
  retrying.value = true
  try {
    // TODO: Relancer le processus de paiement
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Rediriger vers la page de paiement
    router.push({
      name: 'payment',
      query: { 
        retry: 'true',
        ...(errorDetails.value?.amount && { amount: errorDetails.value.amount }),
        ...(errorDetails.value?.description && { description: errorDetails.value.description })
      }
    })
  } catch (error) {
    console.error('Erreur lors du retry:', error)
  } finally {
    retrying.value = false
  }
}

const chooseOtherMethod = () => {
  router.push({
    name: 'payment',
    query: { 
      change_method: 'true',
      ...(errorDetails.value?.amount && { amount: errorDetails.value.amount }),
      ...(errorDetails.value?.description && { description: errorDetails.value.description })
    }
  })
}

const contactSupport = () => {
  // Préparer le message de support avec les détails de l'erreur
  const subject = 'Problème de paiement'
  const body = `Bonjour,

J'ai rencontré un problème lors de mon paiement.

Détails :
- Transaction ID: ${errorDetails.value?.transactionId || 'N/A'}
- Montant: ${errorDetails.value?.amount ? formatCurrency(errorDetails.value.amount) : 'N/A'}
- Méthode: ${errorDetails.value?.method ? getMethodLabel(errorDetails.value.method) : 'N/A'}
- Code d'erreur: ${errorDetails.value?.code || 'UNKNOWN'}
- Message d'erreur: ${errorMessage.value}

Merci de votre aide.`

  window.open(`mailto:support@clinique-alpha.ci?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
}

const goHome = () => {
  router.push('/')
}

const loadErrorDetails = async () => {
  const transactionId = route.query.transaction_id as string
  const error = route.query.error as string
  const errorCode = route.query.error_code as string
  
  errorMessage.value = error || 'Une erreur est survenue lors du traitement de votre paiement.'
  
  if (transactionId) {
    try {
      const result = await paymentStore.verifyOnlinePayment(transactionId)
      if (result.payment) {
        errorDetails.value = {
          ...result.payment,
          code: errorCode
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error)
      errorDetails.value = {
        transactionId,
        code: errorCode
      }
    }
  } else {
    errorDetails.value = {
      code: errorCode || 'UNKNOWN'
    }
  }
}

// Animations GSAP
const { gsap } = useGSAP()

onMounted(async () => {
  await loadErrorDetails()
  
  // Animation d'entrée
  if (errorAnimation.value?.children) {
    gsap.fromTo(errorAnimation.value.children, 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'back.out(1.7)'
      }
    )
  }
  
  // Animation de secousse pour l'icône d'erreur
  if (errorAnimation.value) {
    const icon = errorAnimation.value.querySelector('.w-24')
    if (icon) {
      gsap.fromTo(icon,
        { scale: 0, rotation: -10 },
        { 
          scale: 1,
          rotation: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)'
        }
      )
    }
  }
})
</script>
