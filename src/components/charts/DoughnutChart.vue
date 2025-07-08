<template>
  <div class="relative">
    <div v-if="loading" class="animate-pulse bg-gray-200 h-64 w-full rounded"></div>
    <div v-else class="flex items-center justify-center">
      <canvas ref="chartCanvas" class="max-w-sm h-64"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Chart, type ChartConfiguration, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  data: any
  loading?: boolean
  options?: any
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  options: () => ({})
})

const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
  },
  elements: {
    arc: {
      borderWidth: 2,
      borderColor: '#ffffff'
    }
  }
}

const createChart = () => {
  if (!chartCanvas.value || !props.data) return

  const config: ChartConfiguration = {
    type: 'doughnut',
    data: props.data,
    options: {
      ...defaultOptions,
      ...props.options
    }
  }

  chartInstance = new Chart(chartCanvas.value, config)
}

const updateChart = () => {
  if (chartInstance && props.data) {
    chartInstance.data = props.data
    chartInstance.update('active')
  }
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

watch(() => props.data, () => {
  if (!props.loading) {
    updateChart()
  }
}, { deep: true })

watch(() => props.loading, (newLoading) => {
  if (!newLoading && props.data) {
    setTimeout(() => {
      destroyChart()
      createChart()
    }, 100)
  }
})

onMounted(() => {
  if (!props.loading && props.data) {
    createChart()
  }
})

onUnmounted(() => {
  destroyChart()
})
</script>
