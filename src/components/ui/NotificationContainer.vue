<template>
  <teleport to="body">
    <transition-group
      name="notification"
      tag="div"
      class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 pointer-events-auto',
          getNotificationClass(notification.type)
        ]"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <component
              :is="getIcon(notification.type)"
              :class="getIconClass(notification.type)"
              class="w-5 h-5"
            />
          </div>
          <div class="ml-3 w-0 flex-1">
            <p :class="getTitleClass(notification.type)" class="text-sm font-medium">
              {{ notification.title }}
            </p>
            <p v-if="notification.message" class="mt-1 text-sm text-gray-500">
              {{ notification.message }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="removeNotification(notification.id)"
              class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const notifications = ref<Notification[]>([])

// Icônes pour chaque type
const getIcon = (type: string) => {
  const icons = {
    success: () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 20 20'
    }, [
      h('path', {
        fillRule: 'evenodd',
        d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
        clipRule: 'evenodd'
      })
    ]),
    error: () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 20 20'
    }, [
      h('path', {
        fillRule: 'evenodd',
        d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
        clipRule: 'evenodd'
      })
    ]),
    warning: () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 20 20'
    }, [
      h('path', {
        fillRule: 'evenodd',
        d: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
        clipRule: 'evenodd'
      })
    ]),
    info: () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 20 20'
    }, [
      h('path', {
        fillRule: 'evenodd',
        d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
        clipRule: 'evenodd'
      })
    ])
  }
  return icons[type as keyof typeof icons] || icons.info
}

const getNotificationClass = (type: string) => {
  const classes = {
    success: 'border-emerald-400',
    error: 'border-red-400',
    warning: 'border-amber-400',
    info: 'border-blue-400'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const getIconClass = (type: string) => {
  const classes = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const getTitleClass = (type: string) => {
  const classes = {
    success: 'text-emerald-800',
    error: 'text-red-800',
    warning: 'text-amber-800',
    info: 'text-blue-800'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Date.now().toString()
  const newNotification: Notification = {
    id,
    duration: 5000,
    ...notification
  }
  
  notifications.value.push(newNotification)
  
  // Auto-remove après la durée spécifiée
  if (newNotification.duration && newNotification.duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, newNotification.duration)
  }
  
  return id
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const clearAll = () => {
  notifications.value = []
}

// Méthodes de convenance
const success = (title: string, message?: string, duration?: number) => {
  return addNotification({ type: 'success', title, message, duration })
}

const error = (title: string, message?: string, duration?: number) => {
  return addNotification({ type: 'error', title, message, duration })
}

const warning = (title: string, message?: string, duration?: number) => {
  return addNotification({ type: 'warning', title, message, duration })
}

const info = (title: string, message?: string, duration?: number) => {
  return addNotification({ type: 'info', title, message, duration })
}

defineExpose({
  addNotification,
  removeNotification,
  clearAll,
  success,
  error,
  warning,
  info
})
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
