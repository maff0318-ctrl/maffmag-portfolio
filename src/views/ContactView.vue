<script setup lang="ts">
import { computed, ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import FooterSection from '@/components/layout/FooterSection.vue'
import SocialIconLinks from '@/components/ui/SocialIconLinks.vue'
import { useLanguage } from '@/composables/useLanguage'

const { t } = useLanguage()

const form = ref({
  name: '',
  email: '',
  message: '',
})

const isSubmitting = ref(false)
const isSubmitted = ref(false)
const hasError = ref(false)

const buttonLabel = computed(() => {
  if (isSubmitted.value) return t('messageSentShort')
  if (isSubmitting.value) return t('sending')
  return t('sendInquiry')
})

const handleSubmit = async () => {
  if (isSubmitting.value || isSubmitted.value) return

  isSubmitting.value = true
  hasError.value = false

  try {
    const res = await fetch('https://formspree.io/f/mzepzlod', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: form.value.name,
        email: form.value.email,
        message: form.value.message,
      }),
    })

    if (res.ok) {
      isSubmitted.value = true
      form.value = { name: '', email: '', message: '' }
    } else {
      hasError.value = true
    }
  } catch {
    hasError.value = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen md:h-screen overflow-x-hidden md:overflow-hidden flex flex-col bg-white">
    <AppHeader position="static" />

    <main class="flex-1 md:overflow-hidden container-minimal flex items-start md:items-center py-8 md:py-6 pb-32 md:pb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 max-w-5xl mx-auto w-full">
        <section class="flex flex-col justify-center" aria-labelledby="contact-heading">
          <p class="text-xs text-neutral-400 tracking-[0.3em] uppercase font-sans mb-3" aria-hidden="true">
            &nbsp;
          </p>
          <h1
            id="contact-heading"
            class="contact-heading max-w-md font-serif font-normal text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight text-neutral-900 uppercase"
          >
            {{ t('startConversation') }}
          </h1>

          <div class="mt-8 md:mt-10 space-y-2 font-sans text-[11px] text-neutral-500 tracking-[0.2em] uppercase">
            <p>{{ t('currentLocationLabel') }} — {{ t('currentLocationValue') }}</p>
            <p class="flex items-center">
              <span class="pulsing-dot w-1.5 h-1.5 bg-emerald-500 animate-pulse inline-block mr-2 shrink-0" aria-hidden="true"></span>
              <span>{{ t('availabilityLabel') }} — {{ t('availabilityValue') }}</span>
            </p>
          </div>

          <div class="mt-10 flex flex-col items-start gap-4">
            <a
              href="mailto:miche@maffmag.com"
              class="editorial-link w-fit text-sm text-neutral-700 font-light tracking-widest hover:text-neutral-900 transition-colors"
            >
              miche@maffmag.com
            </a>
            <SocialIconLinks tooltip-anchor="left" />
          </div>
        </section>

        <section class="flex items-center" :aria-label="t('inquiries')">
          <form class="w-full" @submit.prevent="handleSubmit">
            <div class="contact-letter font-serif text-lg md:text-2xl leading-relaxed text-neutral-800">
              <span>{{ t('letterHelloMyName') }}</span>
              <!-- On mobile the inputs stack as full-width blocks so the sentence
                   wraps naturally without the fixed pixel widths breaking layout. -->
              <span class="inline-block align-baseline mx-1">
                <label for="name" class="sr-only">{{ t('name') }}</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  autocomplete="name"
                  :disabled="isSubmitting || isSubmitted"
                  class="inscription-input w-36 md:w-48"
                  :placeholder="t('yourName')"
                />
              </span>
              <span>{{ t('letterReplyAt') }}</span>
              <span class="inline-block align-baseline mx-1">
                <label for="email" class="sr-only">{{ t('email') }}</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  autocomplete="email"
                  :disabled="isSubmitting || isSubmitted"
                  class="inscription-input w-44 md:w-60"
                  :placeholder="t('yourEmail')"
                />
              </span>
              <span>{{ t('letterTalkAbout') }}</span>
              <span class="block mt-3">
                <label for="message" class="sr-only">{{ t('message') }}</label>
                <textarea
                  id="message"
                  v-model="form.message"
                  required
                  rows="2"
                  :disabled="isSubmitting || isSubmitted"
                  class="inscription-input inscription-message w-full resize-none leading-relaxed"
                  :placeholder="t('yourMessage')"
                ></textarea>
              </span>
              <span aria-hidden="true">{{ t('letterEnd') }}</span>
            </div>

            <div class="mt-8">
              <button
                type="submit"
                :disabled="isSubmitting || isSubmitted"
                class="send-trigger group relative inline-flex items-center gap-3 cursor-pointer disabled:cursor-default"
              >
                <span
                  class="relative text-xs tracking-[0.25em] font-medium text-neutral-900 uppercase after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-neutral-900 after:transition-all after:duration-300 after:ease-out group-hover:after:w-full"
                  aria-live="polite"
                >
                  <transition
                    enter-active-class="transition-opacity duration-300 ease-out"
                    leave-active-class="transition-opacity duration-150 ease-in"
                    enter-from-class="opacity-0"
                    leave-to-class="opacity-0"
                    mode="out-in"
                  >
                    <span :key="buttonLabel" class="inline-block">{{ buttonLabel }}</span>
                  </transition>
                </span>
                <svg
                  class="w-4 h-4 text-neutral-900 transition-transform duration-300 ease-out group-hover:translate-x-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 12h16m-6-6 6 6-6 6"
                  />
                </svg>
              </button>
            </div>

            <!-- Error state: shown on network failure or non-ok Formspree response -->
            <transition
              enter-active-class="transition-opacity duration-300 ease-out"
              leave-active-class="transition-opacity duration-150 ease-in"
              enter-from-class="opacity-0"
              leave-to-class="opacity-0"
            >
              <p
                v-if="hasError"
                class="mt-4 text-[11px] tracking-[0.15em] uppercase text-neutral-500 font-sans"
              >
                Something went wrong. Please try again.
              </p>
            </transition>
          </form>
        </section>
      </div>
    </main>

    <FooterSection class="shrink-0" />
  </div>
</template>

<style scoped>
input:focus,
textarea:focus {
  outline: none;
}

input,
textarea,
button,
div {
  border-radius: 0 !important;
}

.pulsing-dot {
  border-radius: 50% !important;
}

.inscription-input {
  vertical-align: -0.1em;
  border: 0;
  border-bottom: 1px solid rgb(212 212 212);
  background: transparent;
  padding: 0.08em 0.25rem 0.16em;
  color: rgb(38 38 38); /* neutral-800, matching the letter prose */
  font-family: inherit; /* inherits the editorial serif from .contact-letter */
  font-size: inherit;
  font-weight: 500;
  line-height: 1.15;
  transition: border-color 300ms ease, opacity 300ms ease;
}

.inscription-input:focus {
  border-bottom-color: rgb(0 0 0);
}

.inscription-input:disabled {
  opacity: 0.5;
}

.inscription-input::placeholder {
  color: rgb(163 163 163);
  font-weight: 300;
  opacity: 1;
}

.inscription-message {
  display: block;
  min-height: 4.25rem;
}

.editorial-link {
  position: relative;
}

.editorial-link::after {
  position: absolute;
  right: 0;
  bottom: -0.2rem;
  left: 0;
  height: 1px;
  content: '';
  background: rgb(163 163 163);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 300ms ease;
}

.editorial-link:hover::after,
.editorial-link:focus-visible::after {
  transform: scaleX(1);
  transform-origin: left;
}

.send-trigger:disabled svg {
  transform: none;
}

/* Explicit editorial serif enforcement. The global base layer sets a thin,
   sans-driven treatment on <h1>, so we pin Playfair Display here to guarantee
   the luxury magazine serif on the heading, the entire interactive letter,
   and every input/textarea + placeholder (never a Times New Roman fallback). */
.contact-heading {
  font-family: 'Playfair Display', 'Cormorant Garamond', 'Noto Serif TC', Georgia, serif;
  font-weight: 400;
}

.contact-letter,
.contact-letter input,
.contact-letter textarea,
.contact-letter input::placeholder,
.contact-letter textarea::placeholder {
  font-family: 'Playfair Display', 'Cormorant Garamond', 'Noto Serif TC', Georgia, serif;
}
</style>
