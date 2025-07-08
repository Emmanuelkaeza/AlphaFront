<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Animation de succès -->
      <div ref="successAnimation" class="text-center mb-8">
        <div class="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Paiement réussi !</h1>
        <p class="text-gray-600 mb-8">
          Votre paiement a été traité avec succès. Vous allez recevoir un email de confirmation.
        </p>
      </div>

      <!-- Détails du paiement -->
      <div v-if="paymentDetails" class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Détails du paiement</h2>
        
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-500">Transaction ID:</span>
            <span class="font-mono text-sm">{{ paymentDetails.transactionId }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-500">Montant:</span>
            <span class="font-semibold text-emerald-600">{{ formatCurrency(paymentDetails.amount) }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-500">Méthode:</span>
            <span>{{ getMethodLabel(paymentDetails.method) }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-500">Date:</span>
            <span>{{ formatDateTime(paymentDetails.createdAt) }}</span>
          </div>
          
          <div v-if="paymentDetails.description" class="flex justify-between">
            <span class="text-gray-500">Description:</span>
            <span>{{ paymentDetails.description }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <Button 
          @click="downloadReceipt" 
          variant="outline" 
          class="w-full"
          :loading="downloadingReceipt"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Télécharger le reçu
        </Button>
        
        <Button 
          @click="goToDashboard" 
          class="w-full"
        >
          Retour au tableau de bord
        </Button>
        
        <button 
          @click="goHome" 
          class="w-full text-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>

      <!-- Informations supplémentaires -->
      <div class="mt-8 text-center text-sm text-gray-500">
        <p>
          En cas de problème, contactez notre support au 
          <a href="tel:+22501020304" class="text-primary-600 hover:text-primary-700">
            +225 01 02 03 04
          </a>
        </p>
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

const successAnimation = ref<HTMLElement>()
const paymentDetails = ref<any>(null)
const downloadingReceipt = ref(false)

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

const downloadReceipt = async () => {
  downloadingReceipt.value = true
  try {
    // TODO: Implémenter le téléchargement du reçu
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simuler le téléchargement
    const link = document.createElement('a')
    link.href = '#'
    link.download = `recu-${paymentDetails.value?.transactionId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
  } finally {
    downloadingReceipt.value = false
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const goHome = () => {
  router.push('/')
}

const loadPaymentDetails = async () => {
  const transactionId = route.query.transaction_id as string
  
  if (transactionId) {
    try {
      const result = await paymentStore.verifyOnlinePayment(transactionId)
      if (result.payment) {
        paymentDetails.value = result.payment
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error)
    }
  }
}

// Animations GSAP
const { gsap } = useGSAP()

onMounted(async () => {
  await loadPaymentDetails()
  
  // Animation d'entrée
  if (successAnimation.value?.children) {
    gsap.fromTo(successAnimation.value.children, 
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
  
  // Animation de pulsation pour l'icône de succès
  if (successAnimation.value) {
    const icon = successAnimation.value.querySelector('.w-24')
    if (icon) {
      gsap.fromTo(icon,
        { scale: 0 },
        { 
          scale: 1,
          duration: 1,
          ease: 'bounce.out'
        }
      )
    }
  }
})
</script>
