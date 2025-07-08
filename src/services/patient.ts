import { apiService } from './api'
import type { Patient, CreatePatientDto } from '@/types/patient'

export type UpdatePatientData = Partial<CreatePatientDto>
export type CreatePatientData = CreatePatientDto

export interface PatientFilters {
  search?: string
  status?: string
  gender?: string
  ageMin?: number
  ageMax?: number
  dateStart?: string
  dateEnd?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const patientService = {
  // Récupérer tous les patients avec pagination et filtres
  async getPatients(
    page = 1, 
    pageSize = 10, 
    filters: PatientFilters = {}
  ): Promise<PaginatedResponse<Patient>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    })

    const response = await apiService.get<PaginatedResponse<Patient>>(`/patients?${params}`)
    return response.data
  },

  // Récupérer un patient par son ID
  async getPatient(id: string): Promise<Patient> {
    const response = await apiService.get<Patient>(`/patients/${id}`)
    return response.data
  },

  // Créer un nouveau patient
  async createPatient(data: CreatePatientData): Promise<Patient> {
    const response = await apiService.post<Patient>('/patients', data)
    return response.data
  },

  // Mettre à jour un patient
  async updatePatient(id: string, data: UpdatePatientData): Promise<Patient> {
    const response = await apiService.put<Patient>(`/patients/${id}`, data)
    return response.data
  },

  // Supprimer un patient
  async deletePatient(id: string): Promise<void> {
    await apiService.delete(`/patients/${id}`)
  },

  // Archiver/désarchiver un patient
  async togglePatientStatus(id: string): Promise<Patient> {
    const response = await apiService.patch<Patient>(`/patients/${id}/toggle-status`)
    return response.data
  },

  // Rechercher des patients
  async searchPatients(query: string): Promise<Patient[]> {
    const response = await apiService.get<Patient[]>(`/patients/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Obtenir les statistiques des patients
  async getPatientStats(): Promise<{
    total: number
    active: number
    new: number
    byGender: { male: number; female: number }
    byAgeGroup: Record<string, number>
    monthlyGrowth: number
  }> {
    const response = await apiService.get('/patients/stats')
    return response.data as any
  },

  // Obtenir l'historique médical d'un patient
  async getPatientHistory(id: string): Promise<{
    consultations: any[]
    treatments: any[]
    prescriptions: any[]
    payments: any[]
  }> {
    const response = await apiService.get(`/patients/${id}/history`)
    return response.data as any
  },

  // Exporter les patients
  async exportPatients(format: 'csv' | 'excel' = 'csv', filters: PatientFilters = {}): Promise<Blob> {
    const params = new URLSearchParams({
      format,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    })

    // Note: Cette méthode devra être adaptée selon l'API backend
    const response = await apiService.get(`/patients/export?${params}`)
    return response.data as Blob
  },

  // Importer des patients
  async importPatients(file: File): Promise<{
    success: number
    errors: number
    details: any[]
  }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiService.post('/patients/import', formData)
    return response.data as any
  },

  // Obtenir les rendez-vous d'un patient
  async getPatientAppointments(id: string): Promise<any[]> {
    const response = await apiService.get(`/patients/${id}/appointments`)
    return response.data as any[]
  },

  // Créer un rendez-vous pour un patient
  async createAppointment(patientId: string, appointmentData: any): Promise<any> {
    const response = await apiService.post(`/patients/${patientId}/appointments`, appointmentData)
    return response.data
  },

  // Obtenir les prescriptions d'un patient
  async getPatientPrescriptions(id: string): Promise<any[]> {
    const response = await apiService.get(`/patients/${id}/prescriptions`)
    return response.data as any[]
  },

  // Ajouter une prescription pour un patient
  async addPrescription(patientId: string, prescriptionData: any): Promise<any> {
    const response = await apiService.post(`/patients/${patientId}/prescriptions`, prescriptionData)
    return response.data
  },

  // Obtenir les allergies d'un patient
  async getPatientAllergies(id: string): Promise<any[]> {
    const response = await apiService.get(`/patients/${id}/allergies`)
    return response.data as any[]
  },

  // Ajouter une allergie pour un patient
  async addAllergy(patientId: string, allergyData: any): Promise<any> {
    const response = await apiService.post(`/patients/${patientId}/allergies`, allergyData)
    return response.data
  },

  // Supprimer une allergie
  async removeAllergy(patientId: string, allergyId: string): Promise<void> {
    await apiService.delete(`/patients/${patientId}/allergies/${allergyId}`)
  }
}

export default patientService
