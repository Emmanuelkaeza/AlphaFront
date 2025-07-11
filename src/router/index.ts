import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/patients',
    name: 'Patients',
    component: () => import('@/views/patients/PatientsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/patients/new',
    name: 'NewPatient',
    component: () => import('@/views/patients/NewPatientView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/patients/:id',
    name: 'PatientDetail',
    component: () => import('@/views/patients/PatientDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/patients/:id/edit',
    name: 'EditPatient',
    component: () => import('@/views/patients/NewPatientView.vue'), // Reuse NewPatientView
    meta: { requiresAuth: true }
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: () => import('@/views/subscriptions/SubscriptionsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/subscriptions/new',
    name: 'NewSubscription',
    component: () => import('@/views/subscriptions/NewSubscriptionView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('@/views/payments/PaymentsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payments/success',
    name: 'PaymentSuccess',
    component: () => import('@/views/payments/PaymentSuccessView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payments/error',
    name: 'PaymentError',
    component: () => import('@/views/payments/PaymentErrorView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payments/cancel',
    name: 'PaymentCancel',
    component: () => import('@/views/payments/PaymentErrorView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Garde de navigation globale
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Gérer l'initialisation de l'état d'authentification
  if (!authStore.user && authStore.token) {
    authStore.loadUserFromStorage() // Charge l'utilisateur depuis localStorage (synchrone)
    if (authStore.user) { // Si l'utilisateur a été chargé depuis localStorage
      try {
        // Tenter de rafraîchir le profil pour valider le token et obtenir les dernières infos
        // Cela se fait en arrière-plan et ne bloque pas la navigation initiale si l'utilisateur existe déjà dans localStorage
        // Si refreshProfile échoue (ex: token invalide), le store auth gère la déconnexion.
        await authStore.refreshProfile()
      } catch (error) {
        // L'erreur est déjà gérée dans refreshProfile (logout), mais on peut logguer ici si besoin.
        console.error('Failed to refresh profile during initial load:', error)
        // Si refreshProfile a provoqué une déconnexion, isAuthenticated sera false
        // et la logique ci-dessous redirigera vers /login si nécessaire.
      }
    }
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Si après refreshProfile (ou tentative), l'utilisateur n'est plus authentifié
    // et la route requiert l'authentification, rediriger vers login.
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (to.meta.requiresAdmin && authStore.isAuthenticated && !authStore.isAdmin) { // Ajout de la vérification isAuthenticated
    next('/dashboard')
  } else {
    next()
  }
})

export default router
