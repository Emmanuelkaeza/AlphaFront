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
    path: '/subscriptions',
    name: 'Subscriptions',
    component: () => import('@/views/subscriptions/SubscriptionsView.vue'),
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
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // Charger l'utilisateur depuis le localStorage si pas encore fait
  if (!authStore.user && authStore.token) {
    authStore.loadUserFromStorage()
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
