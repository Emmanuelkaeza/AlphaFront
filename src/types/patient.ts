export interface Patient {
  id: string
  patientNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth: string
  gender: 'male' | 'female'
  address?: string
  city?: string
  nationalId?: string
  studentId?: string
  isUniversityAffiliated: boolean
  universityDepartment?: string
  universityYear?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  updatedAt: string
}

export interface CreatePatientDto {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth: string
  gender: 'male' | 'female'
  address?: string
  city?: string
  nationalId?: string
  studentId?: string
  isUniversityAffiliated: boolean
  universityDepartment?: string
  universityYear?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
}

export interface PatientFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  isUniversityAffiliated?: boolean
  department?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PatientStats {
  total: number
  active: number
  inactive: number
  suspended: number
  universityAffiliated: number
  growth: number
}
