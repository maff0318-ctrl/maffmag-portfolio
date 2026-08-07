<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import FooterSection from '@/components/layout/FooterSection.vue'
import SocialIconLinks from '@/components/ui/SocialIconLinks.vue'

// Served from the public/ folder at runtime. Using a bound :src (instead of a
// static src="/...") stops Vite from trying to resolve it as a build-time
// import, so a missing file degrades to a 404 image rather than crashing dev.
// Drop your image at: public/walter-mitty.jpg
const heroImageUrl = '/walter-mitty.jpg'
</script>

<template>
  <div class="min-h-screen bg-minimal-white">
    <!-- Header Section -->
    <AppHeader />

    <!-- Main Content - Cinematic full-bleed background + floating magazine card -->
    <main>
      <div
        class="about-canvas relative w-full h-[calc(100vh-130px)] max-h-[600px] min-h-[480px] max-w-7xl mx-auto rounded-2xl overflow-hidden flex items-center justify-end px-6 md:px-12 my-2"
      >
        <!-- Full-bleed background image layer -->
        <img
          :src="heroImageUrl"
          alt="Walter Mitty"
          class="absolute inset-0 w-full h-full object-cover object-[20%_center] z-0"
        />

        <!-- Right-aligned compact floating white card. Scrolls internally if
             the bio grows, with a completely hidden scrollbar (see scoped CSS)
             so the page stays zero-scroll. -->
        <div
          class="about-card no-visible-scrollbar relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-5 md:p-7 rounded-2xl shadow-xl border border-white/50 max-h-[82vh] overflow-y-auto"
        >
          <!-- Sub-tag -->
          <p class="text-xs tracking-[0.25em] text-neutral-400 font-sans uppercase mb-1">
            THE STORY
          </p>
          <!-- Main Heading -->
          <h1 class="font-serif font-normal text-2xl md:text-3xl text-neutral-900 tracking-wide mb-2">
            ABOUT ME
          </h1>

          <!-- Body Text - Traditional Chinese, shown in both language modes -->
          <div class="text-xs md:text-sm text-neutral-700 leading-relaxed font-sans">
            <p class="mb-3">年過三十，作為最普通嘅香港人，生活早就上咗一條既定軌道——返工、放工、交租、供樓，路軌鋪得好好，冇彎轉，冇分岔，一直向前，直到終點。</p>
            <p class="mb-3">但係，靈魂耐唔耐就會脫軌。</p>
            <p class="mb-3">去南極浸冰水、去黃刀鎮睇極光、試印度嘅街頭小食、去烏蘭巴托數星星⋯⋯呢啲念頭，總會不經意咁偷偷鑽入腦海。</p>
            <p class="mb-3">脫軌嗰一刻，我發現，原來我仲有心跳㗎。</p>
            <p class="mb-3">夢想好貴，我冇本事辭職買一張冇回程嘅機票。生活嘅路軌上面，每一刻嘅停留都係奢侈。但係每次放假，趁路軌有個小小嘅維修空檔，我都想偷偷掟個背囊上膊，跳上火車以外嘅某一條路。</p>
            <p class="mb-3">而呢度，就係用嚟記錄每一次短暫脫軌嘅地方。</p>
            <p>每次合上電腦、鎖好背囊，心入面嗰種按住又唔敢張揚嘅興奮，總令我覺得，我就係嗰個被困喺功課堆裡嘅小學生，望著角落裡嘅小背囊，心入面已經偷偷期待緊聽日嘅學校旅行 :)</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <FooterSection />
  </div>
</template>

<style scoped>
/* Keep the site-wide sharp-corner token for inner elements. */
div, a, button {
  border-radius: 0 !important;
}

/* The full-bleed canvas and the floating magazine card are intentional
   rounded-2xl (1rem) exceptions. This override is scoped to the About page
   only and does not alter any global tokens. Class specificity beats the
   element/universal radius rules. */
.about-canvas,
.about-card {
  border-radius: 1rem !important;
}

/* Completely hide the card's scrollbar across browsers while keeping it
   scrollable, so a longer bio scrolls internally and the page stays
   zero-scroll. Scoped to the About page only. */
.no-visible-scrollbar {
  -ms-overflow-style: none; /* IE / old Edge */
  scrollbar-width: none;    /* Firefox */
}

.no-visible-scrollbar::-webkit-scrollbar {
  display: none;            /* Chrome, Safari, new Edge */
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}
</style>
