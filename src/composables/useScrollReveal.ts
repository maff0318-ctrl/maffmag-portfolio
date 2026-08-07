import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Attaches an IntersectionObserver to a template ref and returns a reactive
 * `isVisible` boolean. When the element enters the viewport at the given
 * threshold the observer fires once, sets `isVisible = true`, and
 * disconnects — so the reveal happens exactly once per element.
 *
 * Usage:
 *   const { elRef, isVisible } = useScrollReveal()
 *   // in template: ref="elRef", :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
 */
export function useScrollReveal(threshold = 0.12) {
  const elRef = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!elRef.value || !('IntersectionObserver' in window)) {
      // Fallback: show immediately if IO not supported
      isVisible.value = true
      return
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer?.disconnect()
          observer = null
        }
      },
      { threshold },
    )
    observer.observe(elRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { elRef, isVisible }
}
