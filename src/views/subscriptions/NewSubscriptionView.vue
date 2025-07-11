<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- En-tête -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Nouvel abonnement</h1>
          <p class="mt-1 text-sm text-gray-600">
            Créer un nouvel abonnement pour un patient
          </p>
        </div>
        <Button variant="outline" @click="$router.back()">
          <ArrowLeftIcon class="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    </div>

    <!-- Formulaire -->
    <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div>
        <label for="patientId" class="form-label">ID du Patient *</label>
        <input
          id="patientId"
          v-model="form.patientId"
          type="text"
          required
          class="form-input"
          :class="{ 'border-red-300': errors.patientId }"
          placeholder="Entrez l'ID du patient"
        />
        <p v-if="errors.patientId" class="form-error">{{ errors.patientId }}</p>
        <!-- TODO: Remplacer par un composant de recherche/sélection de patient -->
      </div>

      <div>
        <label for="planId" class="form-label">Plan d'abonnement *</label>
        <select
          id="planId"
          v-model="form.planId"
          required
          class="form-input"
          :class="{ 'border-red-300': errors.planId }"
        >
          <option value="">Sélectionner un plan</option>
          <option v-for="plan in availablePlans" :key="plan.id" :value="plan.id">
            {{ plan.name }} ({{ formatCurrency(plan.price) }})
          </option>
        </select>
        <p v-if="errors.planId" class="form-error">{{ errors.planId }}</p>
      </div>

      <div>
        <label for="startDate" class="form-label">Date de début *</label>
        <input
          id="startDate"
          v-model="form.startDate"
          type="date"
          required
          class="form-input"
          :class="{ 'border-red-300': errors.startDate }"
        />
        <p v-if="errors.startDate" class="form-error">{{ errors.startDate }}</p>
      </div>

      <div>
        <label for="durationDays" class="form-label">Durée (en jours)</label>
        <input
          id="durationDays"
          v-model.number="form.durationDays"
          type="number"
          min="1"
          class="form-input"
          :class="{ 'border-red-300': errors.durationDays }"
          placeholder="Ex: 30, 90, 365"
        />
        <p class="text-xs text-gray-500 mt-1">
          Laisser vide si le plan sélectionné a une durée fixe ou si vous fournissez une date de fin.
          La date de fin sera calculée si la durée est fournie et que le plan n'impose pas de durée.
        </p>
        <p v-if="errors.durationDays" class="form-error">{{ errors.durationDays }}</p>
      </div>

      <div class="flex items-center">
        <input
          id="autoRenew"
          v-model="form.autoRenew"
          type="checkbox"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label for="autoRenew" class="ml-2 block text-sm text-gray-900">Renouvellement automatique</label>
      </div>

      <!-- Boutons d'action -->
      <div class="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          @click="$router.back()"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Création...
          </span>
          <span v-else class="flex items-center justify-center">
            <DocumentPlusIcon class="h-4 w-4 mr-2" />
            Créer l'abonnement
          </span>
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { notifications } from '@/composables/useNotifications'; // Already imported in store, but good for direct use if needed
import { formatCurrency } from '@/utils/formatters';
import Button from '@/components/ui/Button.vue';
import { ArrowLeftIcon, DocumentPlusIcon } from '@heroicons/vue/24/outline';
import type { CreateSubscriptionDto } from '@/services/subscriptionService';

const router = useRouter();
const subscriptionStore = useSubscriptionStore();

const form = reactive<CreateSubscriptionDto>({
  patientId: '',
  planId: '',
  startDate: new Date().toISOString().split('T')[0], // Default to today
  durationDays: undefined, // Optional
  autoRenew: false,
});

const errors = reactive({
  patientId: '',
  planId: '',
  startDate: '',
  durationDays: '',
});

const loading = computed(() => subscriptionStore.loading);

// Mock data for available plans - replace with API call or props later
const availablePlans = ref([
  { id: 'plan_etu_mensuel', name: 'Étudiant - Mensuel', price: 10000, durationDays: 30 },
  { id: 'plan_etu_trim', name: 'Étudiant - Trimestriel', price: 25000, durationDays: 90 },
  { id: 'plan_std_mensuel', name: 'Standard - Mensuel', price: 20000, durationDays: 30 },
  { id: 'plan_std_annuel', name: 'Standard - Annuel', price: 200000, durationDays: 365 },
]);

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '');
  let isValid = true;

  if (!form.patientId.trim()) {
    errors.patientId = 'L\'ID du patient est requis.';
    isValid = false;
  }
  if (!form.planId) {
    errors.planId = 'Veuillez sélectionner un plan.';
    isValid = false;
  }
  if (!form.startDate) {
    errors.startDate = 'La date de début est requise.';
    isValid = false;
  } else if (new Date(form.startDate) < new Date(new Date().setHours(0,0,0,0)) && !router.currentRoute.value.query.allowPastDate) {
    // Allow past date only if a specific condition is met (e.g. from a specific flow)
    // For a new subscription, start date usually shouldn't be in the past.
    // errors.startDate = 'La date de début ne peut pas être dans le passé.';
    // isValid = false;
    // This validation can be very context-specific. For now, allowing past dates.
  }

  if (form.durationDays !== undefined && (isNaN(form.durationDays) || form.durationDays <= 0)) {
    errors.durationDays = 'La durée doit être un nombre positif.';
    isValid = false;
  }

  // If plan has fixed duration, durationDays might not be needed from user.
  // The backend should handle calculating endDate based on plan's duration if durationDays is not provided.

  return isValid;
};

const isFormValid = computed(() => {
  // Basic check, detailed validation in validateForm
  return form.patientId && form.planId && form.startDate;
});

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    const newSubscription = await subscriptionStore.createSubscription({ ...form });
    if (newSubscription && newSubscription.id) {
      // Success notification is already handled by the store action
      router.push('/subscriptions'); // Or to the new subscription's detail page: `/subscriptions/${newSubscription.id}`
    }
    // If newSubscription is null, it implies an error already handled and notified by the store/service.
  } catch (error: any) {
    // Errors (like validation from backend) re-thrown by store action can be caught here
    // to potentially update the local `errors` object for field-specific messages.
    if (error.response?.data?.errors) {
      const serverErrors = error.response.data.errors;
      Object.keys(serverErrors).forEach(key => {
        if (errors.hasOwnProperty(key)) {
          errors[key as keyof typeof errors] = Array.isArray(serverErrors[key]) ? serverErrors[key].join(', ') : serverErrors[key];
        }
      });
      notifications.warning({ title: 'Erreur de validation', message: 'Veuillez corriger les erreurs indiquées dans le formulaire.' });
    }
    // General error notification is handled by the API interceptor or store
  }
};

</script>
<style scoped>
/* Add any specific styles if needed */
</style>
