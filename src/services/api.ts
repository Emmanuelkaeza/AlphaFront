import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

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
    // Intercepteur de requête - Ajouter le token JWT
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

    // Intercepteur de réponse - Gestion des erreurs
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          // Rediriger vers la page de connexion
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Méthodes HTTP génériques
  public get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.api.get(url, { params })
  }

  public post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.post(url, data)
  }

  public patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data)
  }

  public delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete(url)
  }

  public put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.put(url, data)
  }
}

export const apiService = new ApiService()
