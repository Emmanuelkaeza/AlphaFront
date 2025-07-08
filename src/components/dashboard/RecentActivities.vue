<template>
  <div class="flow-root">
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 5" :key="n" class="flex items-center space-x-4 p-4">
        <div class="animate-pulse bg-gray-200 h-10 w-10 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
          <div class="animate-pulse bg-gray-200 h-3 w-1/2 rounded"></div>
        </div>
      </div>
    </div>
    
    <ul v-else role="list" class="-mb-8">
      <li v-for="(activity, activityIdx) in activities" :key="activity.id" ref="activityRefs">
        <div class="relative pb-8">
          <span 
            v-if="activityIdx !== activities.length - 1" 
            class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
            aria-hidden="true" 
          />
          
          <div class="relative flex space-x-3">
            <div>
              <span 
                :class="[
                  'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                  getActivityTypeColor(activity.type)
                ]"
              >
                <component :is="getActivityIcon(activity.type)" class="h-4 w-4 text-white" />
              </span>
            </div>
            
            <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
              <div>
                <p class="text-sm text-gray-900">
                  {{ activity.message }}
                </p>
                <p class="mt-0.5 text-xs text-gray-500">
                  Par {{ activity.user }}
                </p>
              </div>
              
              <div class="text-right text-sm whitespace-nowrap text-gray-500">
                <time :datetime="activity.timestamp">
                  {{ formatRelativeTime(activity.timestamp) }}
                </time>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
    
    <div v-if="!loading && activities.length === 0" class="text-center py-12">
      <div class="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ExclamationTriangleIcon class="h-6 w-6 text-gray-400" />
      </div>
      <p class="text-sm text-gray-500">Aucune activité récente</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGSAP } from '@/composables/useGSAP'
import { formatDateTime } from '@/utils/formatters'
import {
  UserIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  BellIcon
} from '@heroicons/vue/24/outline'

interface Activity {
  id: number | string
  type: 'patient' | 'payment' | 'subscription' | 'notification'
  message: string
  timestamp: string
  user: string
}

interface Props {
  activities: Activity[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const activityRefs = ref<HTMLElement[]>([])
const { staggerAnimation } = useGSAP()

const getActivityIcon = (type: string) => {
  const icons = {
    patient: UserIcon,
    payment: CreditCardIcon,
    subscription: DocumentTextIcon,
    notification: BellIcon
  }
  return icons[type as keyof typeof icons] || BellIcon
}

const getActivityTypeColor = (type: string) => {
  const colors = {
    patient: 'bg-blue-500',
    payment: 'bg-green-500',
    subscription: 'bg-yellow-500',
    notification: 'bg-purple-500'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-500'
}

const formatRelativeTime = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000)
  
  if (diffInMinutes < 1) return 'À l\'instant'
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Il y a ${diffInHours}h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `Il y a ${diffInDays}j`
  
  return formatDateTime(timestamp)
}

onMounted(() => {
  if (!props.loading && activityRefs.value.length > 0) {
    staggerAnimation(activityRefs.value, { delay: 0.5 })
  }
})
</script>
