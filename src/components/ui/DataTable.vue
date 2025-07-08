<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <!-- En-tête avec recherche et filtres -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <div class="flex items-center space-x-4">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              @input="onSearch"
            />
          </div>
          <slot name="actions" />
        </div>
      </div>
    </div>

    <!-- Tableau -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              @click="handleSort(column.key)"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                <ChevronUpDownIcon v-if="!sortKey || sortKey !== column.key" class="h-4 w-4" />
                <ChevronUpIcon v-else-if="sortDirection === 'asc'" class="h-4 w-4" />
                <ChevronDownIcon v-else class="h-4 w-4" />
              </div>
            </th>
            <th class="relative px-6 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in sortedData" :key="item.id" class="hover:bg-gray-50 transition-colors">
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <slot :name="`cell-${column.key}`" :item="item" :value="getNestedValue(item, column.key)">
                {{ getNestedValue(item, column.key) }}
              </slot>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <slot name="actions" :row="item" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-6 py-4 border-t border-gray-200">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        @page-change="$emit('pageChange', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MagnifyingGlassIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import Pagination from '@/components/ui/Pagination.vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
}

interface Props {
  title: string
  data: any[]
  columns: Column[]
  currentPage: number
  totalPages: number
  totalItems: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  pageChange: [page: number]
  search: [query: string]
  sort: [key: string, direction: 'asc' | 'desc']
}>()

const searchQuery = ref('')
const sortKey = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')

const sortedData = computed(() => {
  if (!sortKey.value) return props.data
  
  return [...props.data].sort((a, b) => {
    const aVal = getNestedValue(a, sortKey.value)
    const bVal = getNestedValue(b, sortKey.value)
    
    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
})

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((o, p) => o?.[p], obj)
}

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
  emit('sort', key, sortDirection.value)
}

const onSearch = () => {
  emit('search', searchQuery.value)
}
</script>
