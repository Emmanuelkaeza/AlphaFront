<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- En-tête -->
    <div class="bg-white rounded-lg shadow-sm p-6" :ref="el => headerRef = el as HTMLElement">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ isEditMode ? 'Modifier le patient' : 'Nouveau patient' }}</h1>
          <p class="mt-1 text-sm text-gray-600">
            {{ isEditMode ? 'Mettez à jour les informations du patient.' : 'Enregistrer un nouveau patient dans le système' }}
          </p>
        </div>
        <Button variant="outline" @click="$router.back()">
          <ArrowLeftIcon class="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    </div>

    <!-- Formulaire -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Informations personnelles -->
      <div class="bg-white rounded-lg shadow-sm p-6" ref="personalInfoRef">
        <h2 class="text-lg font-medium text-gray-900 mb-6">Informations personnelles</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">Prénom *</label>
            <input
              v-model="form.firstName"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.firstName }"
              placeholder="Prénom du patient"
            />
            <p v-if="errors.firstName" class="form-error">{{ errors.firstName }}</p>
          </div>

          <div>
            <label class="form-label">Nom *</label>
            <input
              v-model="form.lastName"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.lastName }"
              placeholder="Nom du patient"
            />
            <p v-if="errors.lastName" class="form-error">{{ errors.lastName }}</p>
          </div>

          <div>
            <label class="form-label">Email *</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="form-input"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.email }"
              placeholder="email@exemple.com"
            />
            <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
          </div>

          <div>
            <label class="form-label">Téléphone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="form-input"
              placeholder="+225 XX XX XX XX XX"
            />
          </div>

          <div>
            <label class="form-label">Date de naissance *</label>
            <input
              v-model="form.dateOfBirth"
              type="date"
              required
              class="form-input"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.dateOfBirth }"
            />
            <p v-if="errors.dateOfBirth" class="form-error">{{ errors.dateOfBirth }}</p>
          </div>

          <div>
            <label class="form-label">Genre *</label>
            <select
              v-model="form.gender"
              required
              class="form-input"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.gender }"
            >
              <option value="">Sélectionner le genre</option>
              <option value="male">Masculin</option>
              <option value="female">Féminin</option>
            </select>
            <p v-if="errors.gender" class="form-error">{{ errors.gender }}</p>
          </div>
        </div>
      </div>

      <!-- Adresse -->
      <div class="bg-white rounded-lg shadow-sm p-6" ref="addressRef">
        <h2 class="text-lg font-medium text-gray-900 mb-6">Adresse</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="form-label">Adresse complète</label>
            <textarea
              v-model="form.address"
              rows="3"
              class="form-input"
              placeholder="Adresse complète du patient"
            ></textarea>
          </div>

          <div>
            <label class="form-label">Ville</label>
            <input
              v-model="form.city"
              type="text"
              class="form-input"
              placeholder="Ville de résidence"
            />
          </div>

          <div>
            <label class="form-label">Numéro CNI</label>
            <input
              v-model="form.nationalId"
              type="text"
              class="form-input"
              placeholder="Numéro de carte d'identité"
            />
          </div>
        </div>
      </div>

      <!-- Informations universitaires -->
      <div class="bg-white rounded-lg shadow-sm p-6" ref="universityRef">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-medium text-gray-900">Informations universitaires</h2>
          <div class="flex items-center">
            <input
              v-model="form.isUniversityAffiliated"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label class="ml-2 block text-sm text-gray-900">Affilié à l'université</label>
          </div>
        </div>

        <div v-if="form.isUniversityAffiliated" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">Numéro étudiant</label>
            <input
              v-model="form.studentId"
              type="text"
              class="form-input"
              placeholder="Numéro d'étudiant"
            />
          </div>

          <div>
            <label class="form-label">Département</label>
            <select v-model="form.universityDepartment" class="form-input">
              <option value="">Sélectionner un département</option>
              <option value="informatique">Informatique</option>
              <option value="medecine">Médecine</option>
              <option value="droit">Droit</option>
              <option value="economie">Économie</option>
              <option value="lettres">Lettres Modernes</option>
              <option value="sciences">Sciences</option>
            </select>
          </div>

          <div>
            <label class="form-label">Année/Niveau</label>
            <input
              v-model="form.universityYear"
              type="text"
              class="form-input"
              placeholder="ex: L3, Master 1, Professeur"
            />
          </div>
        </div>
      </div>

      <!-- Contact d'urgence -->
      <div class="bg-white rounded-lg shadow-sm p-6" ref="emergencyRef">
        <h2 class="text-lg font-medium text-gray-900 mb-6">Contact d'urgence</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">Nom du contact</label>
            <input
              v-model="form.emergencyContactName"
              type="text"
              class="form-input"
              placeholder="Nom complet du contact d'urgence"
            />
          </div>

          <div>
            <label class="form-label">Téléphone du contact</label>
            <input
              v-model="form.emergencyContactPhone"
              type="tel"
              class="form-input"
              placeholder="+225 XX XX XX XX XX"
            />
          </div>
        </div>
      </div>

      <!-- Informations médicales -->
      <div class="bg-white rounded-lg shadow-sm p-6" ref="medicalRef">
        <h2 class="text-lg font-medium text-gray-900 mb-6">Informations médicales</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">Groupe sanguin</label>
            <select v-model="form.bloodType" class="form-input">
              <option value="">Sélectionner</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="form-label">Allergies connues</label>
            <textarea
              v-model="form.allergies"
              rows="3"
              class="form-input"
              placeholder="Listez les allergies connues (médicaments, aliments, etc.)"
            ></textarea>
          </div>

          <div class="md:col-span-2">
            <label class="form-label">Antécédents médicaux</label>
            <textarea
              v-model="form.medicalHistory"
              rows="3"
              class="form-input"
              placeholder="Antécédents médicaux importants"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="bg-white rounded-lg shadow-sm p-6" ref="actionsRef">
        <div class="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            @click="$router.back()"
          >
            Annuler
          </Button>
          
          <Button
            type="button"
            variant="outline"
            @click="saveDraft"
            :disabled="loading"
          >
            <DocumentIcon class="h-4 w-4 mr-2" />
            Sauvegarder brouillon
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
              {{ isEditMode ? 'Mise à jour...' : 'Enregistrement...' }}
            </span>
            <span v-else class="flex items-center justify-center">
              <component :is="isEditMode ? PencilSquareIcon : UserPlusIcon" class="h-4 w-4 mr-2" />
              {{ isEditMode ? 'Enregistrer les modifications' : 'Créer le patient' }}
            </span>
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref as vueRef, watch } from 'vue' // Added watch
import { useRouter, useRoute } from 'vue-router' // Added useRoute
import { usePatientStore } from '@/stores/patient'
import { notifications } from '@/composables/useNotifications'
import { useGSAP } from '@/composables/useGSAP'
import Button from '@/components/ui/Button.vue'
import {
  ArrowLeftIcon,
  UserPlusIcon,
  DocumentIcon,
  PencilSquareIcon // For edit mode button
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute() // Initialize useRoute
const patientStore = usePatientStore()
const { fadeIn } = useGSAP()

// Determine if in edit mode
const patientId = vueRef<string | null>(null)
const isEditMode = computed(() => !!patientId.value)

// Refs pour animations (utilisez vueRef ici)
const headerRef = vueRef<HTMLElement>()
const personalInfoRef = vueRef<HTMLElement>()
const addressRef = vueRef<HTMLElement>()
const universityRef = vueRef<HTMLElement>()
const emergencyRef = vueRef<HTMLElement>()
const medicalRef = vueRef<HTMLElement>()
const actionsRef = vueRef<HTMLElement>()

// État du formulaire
const loading = computed(() => patientStore.loading)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
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

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  dateOfBirth: '',
  gender: ''
})

// Validation
const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  if (!form.firstName.trim()) {
    errors.firstName = 'Le prénom est requis'
    isValid = false
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Le nom est requis'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = 'L\'email est requis'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Format d\'email invalide'
    isValid = false
  }

  if (!form.dateOfBirth) {
    errors.dateOfBirth = 'La date de naissance est requise'
    isValid = false
  }

  if (!form.gender) {
    errors.gender = 'Le genre est requis'
    isValid = false
  }

  return isValid
}

const isFormValid = computed(() => {
  return form.firstName && form.lastName && form.email && form.dateOfBirth && form.gender
})

// Actions
const handleSubmit = async () => {
  if (!validateForm()) return;

  const patientData = { ...form };

  try {
    if (isEditMode.value && patientId.value) {
      const updatedPatient = await patientStore.updatePatient(patientId.value, patientData);
      if (updatedPatient && updatedPatient.id) {
        notifications.success({ title: 'Succès', message: 'Patient mis à jour avec succès!' });
        router.push(`/patients/${updatedPatient.id}`);
      } else {
        notifications.error({ title: 'Erreur Inattendue', message: 'La mise à jour du patient semble avoir échoué.' });
      }
    } else {
      const newPatient = await patientStore.createPatient(patientData);
      if (newPatient && newPatient.id) {
        notifications.success({ title: 'Succès', message: 'Patient créé avec succès!' });
        router.push(`/patients/${newPatient.id}`);
      } else {
        notifications.error({ title: 'Erreur Inattendue', message: 'La création du patient semble avoir échoué.' });
      }
    }
  } catch (error: any) {
    console.error(`Erreur lors de ${isEditMode.value ? 'la mise à jour' : 'la création'} du patient (vue):`, error);
    if (error.response?.data?.errors) {
      const serverErrors = error.response.data.errors;
      let VITE_ASSIGN_ERRORS = true;
      if (VITE_ASSIGN_ERRORS) {
        Object.keys(serverErrors).forEach(key => {
          if (errors.hasOwnProperty(key)) {
            const errorMessages = serverErrors[key];
            errors[key as keyof typeof errors] = Array.isArray(errorMessages) ? errorMessages.join(', ') : String(errorMessages);
          }
        });
        notifications.warning({ title: 'Erreur de validation', message: 'Veuillez corriger les erreurs indiquées dans le formulaire.' });
      }
    }
  }
}

const saveDraft = async () => {
  // Logique pour sauvegarder en brouillon
  console.log('Sauvegarde du brouillon:', form)
  // Pourrait être étendu pour utiliser localStorage ou une API de brouillon
  notifications.info({ title: 'Brouillon', message: 'Fonctionnalité de brouillon non implémentée.' });
}

onMounted(async () => {
  const idFromRoute = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  if (idFromRoute) {
    patientId.value = idFromRoute;
    // Nettoyer le formulaire avant de potentiellement le remplir
    Object.keys(form).forEach(key => {
        const formKey = key as keyof typeof form;
        if (typeof form[formKey] === 'boolean') {
            (form[formKey] as any) = false;
        } else {
            (form[formKey] as any) = '';
        }
    });
    await patientStore.fetchPatient(patientId.value);
  } else {
    // S'assurer que currentPatient est null si on est en mode création et qu'on vient d'un mode édition
    patientStore.setCurrentPatient(null);
  }

  // Animations d'entrée séquentielles
  const refs = [
    headerRef,
    personalInfoRef,
    addressRef,
    universityRef,
    emergencyRef,
    medicalRef,
    actionsRef
  ]

  refs.forEach((ref, index) => {
    setTimeout(() => {
      if (ref.value) fadeIn(ref.value)
    }, index * 150)
  })
})
</script>
