<template>
  <div class="relative">
    <div v-if="loading" class="animate-pulse bg-gray-200 h-64 w-full rounded"></div>
    <canvas v-else ref="chartCanvas" class="w-full h-64"></canvas>
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
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2
    },
    point: {
      radius: 4,
      hoverRadius: 6
    }
  }
}

const createChart = () => {
  if (!chartCanvas.value || !props.data) return

  const config: ChartConfiguration = {
    type: 'line',
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
