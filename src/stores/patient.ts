import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { patientService, type PatientFilters } from '@/services/patient'
import type { Patient } from '@/types/patient'

export const usePatientStore = defineStore('patient', () => {
  // État
  const patients = ref<Patient[]>([])
  const currentPatient = ref<Patient | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })

  // Filtres
  const filters = ref<PatientFilters>({
    search: '',
    status: '',
    gender: '',
    ageMin: undefined,
    ageMax: undefined,
    dateStart: '',
    dateEnd: ''
  })

  // Statistiques
  const stats = ref({
    total: 0,
    active: 0,
    new: 0,
    byGender: { male: 0, female: 0 },
    byAgeGroup: {},
    monthlyGrowth: 0
  })

  // Getters
  const activePatients = computed(() => 
    patients.value.filter(patient => patient.status === 'active')
  )

  const inactivePatients = computed(() => 
    patients.value.filter(patient => patient.status === 'inactive')
  )

  const patientsCount = computed(() => patients.value.length)

  // Actions
  const fetchPatients = async (page = 1, pageSize = 10) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await patientService.getPatients(page, pageSize, filters.value)
      patients.value = response.data
      pagination.value = response.pagination
    } catch (err) {
      error.value = 'Erreur lors du chargement des patients'
      console.error('Erreur fetchPatients:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchPatient = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      currentPatient.value = await patientService.getPatient(id)
    } catch (err) {
      error.value = 'Erreur lors du chargement du patient'
      console.error('Erreur fetchPatient:', err)
    } finally {
      loading.value = false
    }
  }

  const createPatient = async (patientData: any) => {
    loading.value = true
    error.value = null
    
    try {
      const newPatient = await patientService.createPatient(patientData)
      patients.value.unshift(newPatient)
      return newPatient
    } catch (err) {
      error.value = 'Erreur lors de la création du patient'
      console.error('Erreur createPatient:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePatient = async (id: string, patientData: any) => {
    loading.value = true
    error.value = null
    
    try {
      const updatedPatient = await patientService.updatePatient(id, patientData)
      const index = patients.value.findIndex(p => p.id === id)
      if (index !== -1) {
        patients.value[index] = updatedPatient
      }
      if (currentPatient.value?.id === id) {
        currentPatient.value = updatedPatient
      }
      return updatedPatient
    } catch (err) {
      error.value = 'Erreur lors de la mise à jour du patient'
      console.error('Erreur updatePatient:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePatient = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      await patientService.deletePatient(id)
      patients.value = patients.value.filter(p => p.id !== id)
      if (currentPatient.value?.id === id) {
        currentPatient.value = null
      }
    } catch (err) {
      error.value = 'Erreur lors de la suppression du patient'
      console.error('Erreur deletePatient:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const togglePatientStatus = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const updatedPatient = await patientService.togglePatientStatus(id)
      const index = patients.value.findIndex(p => p.id === id)
      if (index !== -1) {
        patients.value[index] = updatedPatient
      }
      if (currentPatient.value?.id === id) {
        currentPatient.value = updatedPatient
      }
      return updatedPatient
    } catch (err) {
      error.value = 'Erreur lors du changement de statut'
      console.error('Erreur togglePatientStatus:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchPatients = async (query: string) => {
    loading.value = true
    error.value = null
    
    try {
      const results = await patientService.searchPatients(query)
      patients.value = results
    } catch (err) {
      error.value = 'Erreur lors de la recherche'
      console.error('Erreur searchPatients:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchPatientStats = async () => {
    try {
      stats.value = await patientService.getPatientStats()
    } catch (err) {
      console.error('Erreur fetchPatientStats:', err)
    }
  }

  const exportPatients = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const blob = await patientService.exportPatients(format, filters.value)
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `patients.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = 'Erreur lors de l\'export'
      console.error('Erreur exportPatients:', err)
      throw err
    }
  }

  const importPatients = async (file: File) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await patientService.importPatients(file)
      // Recharger la liste après import
      await fetchPatients()
      return result
    } catch (err) {
      error.value = 'Erreur lors de l\'import'
      console.error('Erreur importPatients:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Méthodes utilitaires
  const setFilters = (newFilters: Partial<PatientFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      status: '',
      gender: '',
      ageMin: undefined,
      ageMax: undefined,
      dateStart: '',
      dateEnd: ''
    }
  }

  const setCurrentPatient = (patient: Patient | null) => {
    currentPatient.value = patient
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    patients.value = []
    currentPatient.value = null
    loading.value = false
    error.value = null
    pagination.value = {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
    clearFilters()
  }

  return {
    // État
    patients,
    currentPatient,
    loading,
    error,
    pagination,
    filters,
    stats,
    
    // Getters
    activePatients,
    inactivePatients,
    patientsCount,
    
    // Actions
    fetchPatients,
    fetchPatient,
    createPatient,
    updatePatient,
    deletePatient,
    togglePatientStatus,
    searchPatients,
    fetchPatientStats,
    exportPatients,
    importPatients,
    
    // Utilitaires
    setFilters,
    clearFilters,
    setCurrentPatient,
    clearError,
    resetStore
  }
})
