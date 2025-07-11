import axios, { type AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import { notifications } from '@/composables/useNotifications' // Import notification system

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
    // Request interceptor - Add JWT token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - Handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<any>) => {
        const status = error.response?.status
        const errorMessage = error.response?.data?.message || error.message

        switch (status) {
          case 401:
            // Handled by authStore.refreshProfile by logging out if it's a profile refresh
            // For other 401s, this redirect is a hard stop.
            notifications.error({ title: 'Non autorisé', message: 'Votre session a peut-être expiré. Veuillez vous reconnecter.' })
            // Avoid immediate redirect if authStore's logout is more graceful
            // localStorage.removeItem('token')
            // localStorage.removeItem('user')
            // window.location.href = '/login'
            // Let calling actions or auth store handle logout to update app state properly.
            // If a component catches this, it might try to use authStore.logout()
            break
          case 403:
            notifications.error({ title: 'Interdit', message: "Vous n'êtes pas autorisé à effectuer cette action." })
            break
          case 404:
            notifications.error({ title: 'Non trouvé', message: "La ressource demandée n'a pas été trouvée." })
            break
          case 422:
            // Unprocessable Entity - typically validation errors
            let validationMessage = "Erreur de validation. Veuillez vérifier les données soumises."
            if (error.response?.data?.errors) {
              // If backend sends specific error messages in an 'errors' object/array
              // This part might need adjustment based on the actual backend response structure
              const errors = error.response.data.errors;
              if (typeof errors === 'string') {
                validationMessage = errors;
              } else if (Array.isArray(errors)) {
                validationMessage = errors.join(' ');
              } else if (typeof errors === 'object') {
                validationMessage = Object.values(errors).flat().join(' ');
              }
            } else if (errorMessage && status === 422) {
              validationMessage = errorMessage;
            }
            notifications.warning({ title: 'Validation Échouée', message: validationMessage })
            break
          case 500:
            notifications.error({ title: 'Erreur Serveur', message: 'Une erreur interne du serveur est survenue. Veuillez réessayer plus tard.' })
            break
          default:
            if (status && status >= 400 && status < 500) {
              notifications.warning({ title: `Erreur Client (Code: ${status})`, message: errorMessage })
            } else if (status && status >= 500) {
              notifications.error({ title: `Erreur Serveur (Code: ${status})`, message: errorMessage })
            } else if (!error.response) {
              // Network error or other issues
              notifications.error({ title: 'Erreur Réseau', message: "Impossible de joindre le serveur. Vérifiez votre connexion internet."})
            } else {
              notifications.error({ title: 'Erreur Inconnue', message: errorMessage })
            }
        }
        return Promise.reject(error)
      }
    )
  }

  // Generic HTTP methods
  public get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, { params })
  }

  public post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data)
  }

  public patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data)
  }

  public delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url)
  }

  public put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data)
  }
}

export const apiService = new ApiService()
