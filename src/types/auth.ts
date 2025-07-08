export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'receptionist' | 'patient'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'admin' | 'receptionist'
}
