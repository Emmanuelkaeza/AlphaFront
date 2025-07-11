<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar mobile backdrop -->
    <div 
      v-show="isMobileMenuOpen" 
      class="fixed inset-0 z-40 md:hidden" 
      @click="isMobileMenuOpen = false"
    >
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"></div>
    </div>

    <!-- Sidebar -->
    <div 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      ref="sidebarRef"
    >
      <div class="flex items-center justify-center h-16 px-4 bg-primary-600">
        <h1 class="text-xl font-bold text-white">Clinique Universitaire</h1>
      </div>
      
      <nav class="mt-8 px-4">
        <div class="space-y-2">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :class="[
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
              isActiveRoute(item.href) 
                ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <component :is="item.icon" :class="[
              'mr-3 h-5 w-5 transition-colors',
              isActiveRoute(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
            ]" />
            {{ item.name }}
          </router-link>
        </div>
      </nav>
    </div>

    <!-- Main content -->
    <div class="md:ml-64 flex flex-col min-h-screen">
      <!-- Top navigation -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <!-- Mobile menu button -->
              <button
                type="button"
                class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                @click="isMobileMenuOpen = !isMobileMenuOpen"
              >
                <Bars3Icon class="h-6 w-6" />
              </button>
              
              <!-- Breadcrumb -->
              <nav class="hidden md:flex items-center space-x-4 ml-4">
                <ol class="flex items-center space-x-2">
                  <li v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center">
                    <ChevronRightIcon v-if="index > 0" class="h-4 w-4 text-gray-400 mx-2" />
                    <span 
                      :class="[
                        'text-sm',
                        index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-500'
                      ]"
                    >
                      {{ crumb }}
                    </span>
                  </li>
                </ol>
              </nav>
            </div>

            <!-- User menu -->
            <div class="flex items-center space-x-4">
              <!-- Notifications -->
              <button
                type="button"
                class="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <BellIcon class="h-6 w-6" />
              </button>

              <!-- User dropdown -->
              <div class="relative" ref="userMenuRef">
                <button
                  type="button"
                  class="flex items-center space-x-3 p-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  @click="isUserMenuOpen = !isUserMenuOpen"
                >
                  <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span class="text-sm font-medium text-white">
                      {{ userInitials }}
                    </span>
                  </div>
                  <div class="hidden md:block text-left">
                    <p class="text-sm font-medium text-gray-900">{{ user?.firstName }} {{ user?.lastName }}</p>
                    <p class="text-xs text-gray-500">{{ user?.role }}</p>
                  </div>
                  <ChevronDownIcon class="h-4 w-4 text-gray-400" />
                </button>

                <!-- User dropdown menu -->
                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div
                    v-show="isUserMenuOpen"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                  >
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</a>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Paramètres</a>
                    <hr class="my-1">
                    <button
                      @click="handleLogout"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Déconnexion
                    </button>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6" ref="mainContentRef">
        <router-view />
      </main>
    </div>
    
    <!-- Système de notifications -->
    <NotificationContainer ref="notificationContainer" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGSAP } from '@/composables/useGSAP'
import { notifications } from '@/composables/useNotifications'
import NotificationContainer from '@/components/ui/NotificationContainer.vue'
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CogIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { fadeIn } = useGSAP()

const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const sidebarRef = ref<HTMLElement>()
const userMenuRef = ref<HTMLElement>()
const mainContentRef = ref<HTMLElement>()
const notificationContainer = ref()

const user = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!user.value || !user.value.firstName || !user.value.lastName) return ''
  return `${user.value.firstName.charAt(0)}${user.value.lastName.charAt(0)}`.toUpperCase()
})

interface NavItem {
  name: string
  href: string
  icon: any // Vue component type for icons
  roles?: string[] // Optional: roles that can see this item. If undefined, visible to all authenticated.
}

const allNavigationItems: NavItem[] = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'receptionist', 'patient'] }, // Assuming all roles can see dashboard
  { name: 'Patients', href: '/patients', icon: UserGroupIcon, roles: ['admin', 'receptionist'] },
  { name: 'Abonnements', href: '/subscriptions', icon: DocumentTextIcon, roles: ['admin', 'receptionist'] }, // Or include 'patient' if they can see their own
  { name: 'Paiements', href: '/payments', icon: CreditCardIcon, roles: ['admin', 'receptionist'] }, // Or include 'patient'
  { name: 'Administration', href: '/admin', icon: CogIcon, roles: ['admin'] },
  // Example for a patient-specific view, if any:
  // { name: 'Mon Profil', href: '/profile', icon: UserIcon, roles: ['patient'] }
]

const navigation = computed(() => {
  if (!user.value || !user.value.role) return []
  const userRole = user.value.role
  return allNavigationItems.filter(item => {
    return !item.roles || item.roles.includes(userRole)
  })
})

const breadcrumbs = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const crumbs = ['Accueil']
  
  pathSegments.forEach(segment => {
    switch (segment) {
      case 'dashboard':
        crumbs.push('Tableau de bord')
        break
      case 'patients':
        crumbs.push('Patients')
        break
      case 'subscriptions':
        crumbs.push('Abonnements')
        break
      case 'payments':
        crumbs.push('Paiements')
        break
      case 'admin':
        crumbs.push('Administration')
        break
      case 'new':
        crumbs.push('Nouveau')
        break
      default:
        crumbs.push(segment)
    }
  })
  
  return crumbs
})

const isActiveRoute = (href: string) => {
  return route.path === href || route.path.startsWith(href + '/')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleClickOutside = (event: Event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Initialiser le système de notifications
  if (notificationContainer.value) {
    notifications.setNotificationContainer(notificationContainer.value)
  }
  
  // Animation d'entrée
  if (mainContentRef.value) {
    fadeIn(mainContentRef.value)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
