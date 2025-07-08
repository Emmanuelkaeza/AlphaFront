<template>
  <button
    :class="[
      'btn',
      sizeClasses,
      variantClasses,
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-9 px-3 text-sm'
    case 'lg':
      return 'h-11 px-8 text-base'
    default:
      return 'h-10 px-4 text-sm'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
    case 'secondary':
      return 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500'
    case 'outline':
      return 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
    case 'ghost':
      return 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
    case 'danger':
      return 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500'
    default:
      return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
  }
})
</script>
