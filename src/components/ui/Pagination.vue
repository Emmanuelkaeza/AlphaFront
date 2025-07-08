<template>
  <nav class="flex items-center justify-between">
    <div class="flex-1 flex justify-between sm:hidden">
      <button
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Précédent
      </button>
      <button
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Suivant
      </button>
    </div>
    
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Affichage de
          <span class="font-medium">{{ startItem }}</span>
          à
          <span class="font-medium">{{ endItem }}</span>
          sur
          <span class="font-medium">{{ totalItems }}</span>
          résultats
        </p>
      </div>
      
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <!-- Bouton précédent -->
          <button
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Précédent</span>
            <ChevronLeftIcon class="h-5 w-5" />
          </button>
          
          <!-- Numéros de page -->
          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="typeof page === 'number'"
              :class="[
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                page === currentPage
                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              ]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span
              v-else
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              {{ page }}
            </span>
          </template>
          
          <!-- Bouton suivant -->
          <button
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Suivant</span>
            <ChevronRightIcon class="h-5 w-5" />
          </button>
        </nav>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10
})

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const startItem = computed(() => {
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
})

const visiblePages = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []
  
  for (let i = Math.max(2, props.currentPage - delta); 
       i <= Math.min(props.totalPages - 1, props.currentPage + delta); 
       i++) {
    range.push(i)
  }
  
  if (props.currentPage - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }
  
  rangeWithDots.push(...range)
  
  if (props.currentPage + delta < props.totalPages - 1) {
    rangeWithDots.push('...', props.totalPages)
  } else if (props.totalPages > 1) {
    rangeWithDots.push(props.totalPages)
  }
  
  return rangeWithDots.filter((page, index, array) => 
    page !== array[index - 1] && page !== '...' || 
    (page === '...' && array[index - 1] !== '...')
  )
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('pageChange', page)
  }
}
</script>
