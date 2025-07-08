<template>
  <div 
    class="bg-white overflow-hidden shadow-sm rounded-lg transition-all duration-300 hover:shadow-md"
    data-stat-card
    ref="cardRef"
  >
    <div class="p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div 
            :class="[
              'w-12 h-12 rounded-lg flex items-center justify-center',
              colorClasses.background
            ]"
          >
            <component 
              :is="iconComponent" 
              :class="['w-6 h-6', colorClasses.icon]"
            />
          </div>
        </div>
        
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ title }}
            </dt>
            <dd class="flex items-baseline">
              <div class="text-2xl font-semibold text-gray-900">
                <span v-if="loading" class="animate-pulse bg-gray-200 h-8 w-20 rounded"></span>
                <span v-else>{{ displayValue }}</span>
              </div>
              <div 
                v-if="trend !== undefined && !loading"
                :class="[
                  'ml-2 flex items-baseline text-sm font-semibold',
                  trend >= 0 ? 'text-green-600' : 'text-red-600'
                ]"
              >
                <ArrowUpIcon v-if="trend >= 0" class="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                <ArrowDownIcon v-else class="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                <span class="sr-only">{{ trend >= 0 ? 'Augmentation' : 'Diminution' }} de</span>
                {{ Math.abs(trend) }}%
              </div>
            </dd>
          </dl>
        </div>
      </div>
      
      <!-- Mini graphique -->
      <div v-if="chartData" class="mt-4">
        <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Évolution</span>
          <span>{{ period || '30 jours' }}</span>
        </div>
        <div class="h-8">
          <svg class="w-full h-full" viewBox="0 0 100 20">
            <path
              :d="sparklinePath"
              :stroke="colorClasses.stroke"
              stroke-width="1.5"
              fill="none"
              class="transition-all duration-300"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useGSAP } from '@/composables/useGSAP'
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

interface Props {
  title: string
  value: string | number
  trend?: number
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'emerald' | 'amber'
  loading?: boolean
  chartData?: number[]
  period?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  chartData: () => []
})

const cardRef = ref<HTMLElement>()
const { scaleIn } = useGSAP()

const iconMap = {
  UserGroupIcon,
  DocumentCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon
}

const iconComponent = computed(() => {
  return iconMap[props.icon as keyof typeof iconMap] || ChartBarIcon
})

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('fr-FR')
  }
  return props.value
})

const colorClasses = computed(() => {
  const colors = {
    blue: {
      background: 'bg-blue-50',
      icon: 'text-blue-600',
      stroke: '#3B82F6'
    },
    green: {
      background: 'bg-green-50',
      icon: 'text-green-600',
      stroke: '#10B981'
    },
    yellow: {
      background: 'bg-yellow-50',
      icon: 'text-yellow-600',
      stroke: '#F59E0B'
    },
    red: {
      background: 'bg-red-50',
      icon: 'text-red-600',
      stroke: '#EF4444'
    },
    purple: {
      background: 'bg-purple-50',
      icon: 'text-purple-600',
      stroke: '#8B5CF6'
    },
    emerald: {
      background: 'bg-emerald-50',
      icon: 'text-emerald-600',
      stroke: '#10B981'
    },
    amber: {
      background: 'bg-amber-50',
      icon: 'text-amber-600',
      stroke: '#F59E0B'
    }
  }
  
  return colors[props.color]
})

const sparklinePath = computed(() => {
  if (!props.chartData || props.chartData.length === 0) return ''
  
  const width = 100
  const height = 20
  const padding = 2
  
  const min = Math.min(...props.chartData)
  const max = Math.max(...props.chartData)
  const range = max - min || 1
  
  const points = props.chartData.map((value, index) => {
    const x = (index / (props.chartData.length - 1)) * (width - 2 * padding) + padding
    const y = height - padding - ((value - min) / range) * (height - 2 * padding)
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
})

onMounted(() => {
  if (cardRef.value) {
    scaleIn(cardRef.value, { delay: Math.random() * 0.3 })
  }
})
</script>
