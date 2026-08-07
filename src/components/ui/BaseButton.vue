<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  uppercase?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  uppercase: true,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-light transition-all duration-300',
      {
        'px-4 py-2 text-xs': size === 'sm',
        'px-6 py-3 text-sm': size === 'md',
        'px-8 py-4 text-base': size === 'lg',
        'uppercase tracking-widest border border-minimal-black': variant === 'primary' && uppercase,
        'uppercase tracking-wider': variant === 'secondary' && uppercase,
        'border-transparent': variant === 'ghost',
        'hover:bg-minimal-black hover:text-minimal-white': variant === 'primary',
        'hover:text-minimal-black hover:underline': variant === 'secondary',
        'hover:text-accent': variant === 'ghost',
        'opacity-50 cursor-not-allowed': disabled,
      },
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<style scoped>
button {
  border-radius: 0 !important;
}
</style>
