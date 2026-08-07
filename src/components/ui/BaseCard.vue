<script setup lang="ts">
interface Props {
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  hoverable: true,
  padding: 'md',
})
</script>

<template>
  <div
    :class="[
      'bg-minimal-white transition-all duration-300',
      {
        'p-0': padding === 'none',
        'p-4': padding === 'sm',
        'p-6': padding === 'md',
        'p-8': padding === 'lg',
        'hover:shadow-minimal-lg': hoverable,
      },
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
div {
  border-radius: 0 !important;
}
</style>
