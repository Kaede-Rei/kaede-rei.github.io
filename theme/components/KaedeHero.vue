<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useMediaQuery } from '@vueuse/core'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { profile } from '../../data/site'

const entryMarker = 'data-kaede-hero-enter'
const hero = ref<HTMLElement>()
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
let entrance = 0

if (import.meta.env.SSR) {
  // Arm the full entrance before first paint. Client-side returns replay the copy only.
  useHead({
    script: [{
      key: 'kaede-hero-entry',
      tagPriority: 'critical',
      innerHTML: 'if (location.pathname === "/" && !location.hash && !matchMedia("(prefers-reduced-motion: reduce)").matches) document.documentElement.setAttribute("data-kaede-hero-enter", "direct")',
    }],
  })
}

function finishEntry() {
  entrance++
  document.documentElement.removeAttribute(entryMarker)
}

function playEntry() {
  if (!hero.value || reducedMotion.value || location.hash) {
    finishEntry()
    return
  }
  const root = document.documentElement
  if (!root.hasAttribute(entryMarker)) root.setAttribute(entryMarker, 'return')
  const round = ++entrance
  const animations = hero.value.getAnimations({ subtree: true }).filter(animation =>
    'animationName' in animation && /^kaede-hero-(?:title-arrive|copy-arrive|picture-unmask|picture-settle|wave-settle)/.test(String(animation.animationName)),
  )
  void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
    if (round === entrance) finishEntry()
  })
}

function replayRestoredPage(event: PageTransitionEvent) {
  if (event.persisted) playEntry()
}

onMounted(() => {
  playEntry()
  window.addEventListener('pageshow', replayRestoredPage)
})

watch(reducedMotion, (reduced) => {
  if (reduced) finishEntry()
})
onUnmounted(() => {
  window.removeEventListener('pageshow', replayRestoredPage)
  finishEntry()
})
</script>

<template>
  <header ref="hero" class="kaede-hero">
    <div class="kaede-hero-grid">
      <div class="kaede-hero-copy">
        <p class="kaede-hero-identity">{{ profile.name }} · 机器人开发者</p>
        <h1 class="kaede-hero-title" tabindex="-1">
          <span class="kaede-hero-title-motion">
            <span class="kaede-hero-title-line"><span>让机器人从模型</span></span><br class="kaede-hero-break">
            <span class="kaede-hero-title-line"><span>走向真实运行</span></span>
          </span>
        </h1>
        <p class="kaede-hero-intro">我是华南农业大学本科生、AgroTech-SCAU 主要负责人之一，从事机械臂控制、嵌入式软件与系统集成，整理可复用的代码、工具和工程经验</p>
        <div class="kaede-actions">
          <RouterLink to="/#projects" class="kaede-button kaede-button--primary">查看开发项目 <span aria-hidden="true" class="kaede-link-arrow">↓</span></RouterLink>
          <RouterLink to="/archives" class="kaede-button">阅读技术笔记 <span aria-hidden="true" class="kaede-link-arrow">→</span></RouterLink>
        </div>
      </div>
      <div class="kaede-hero-art">
        <picture>
          <img src="/images/optimized/hero-1920.webp"
            srcset="/images/optimized/hero-960.webp 960w, /images/optimized/hero-1920.webp 1920w"
            sizes="(max-width: 720px) calc(100vw - 36px), (max-width: 1180px) 49vw, 565px"
            alt="爱音与素世插画" width="1920" height="1358" fetchpriority="high" decoding="async">
        </picture>
        <svg class="kaede-waves" viewBox="0 0 600 52" preserveAspectRatio="none" aria-hidden="true">
          <path class="kaede-wave-back" d="M0 17C134 61 273 2 403 21s147 28 197-8v39H0Z" />
          <path class="kaede-wave-front" d="M0 33C160 5 245 68 402 34s166 10 198-8v26H0Z" />
        </svg>
      </div>
    </div>
  </header>
</template>

<style scoped>
.kaede-hero-art {
  --wave-height: clamp(24px, 4vw, 52px);
}

.kaede-waves {
  height: var(--wave-height);
}

@supports (mask-image: linear-gradient(black, black)) {
  .kaede-hero-art {
    mask:
      linear-gradient(black, black) top / 100% calc(100% - var(--wave-height) + 1px) no-repeat,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 52' preserveAspectRatio='none'%3E%3Cpath d='M0 33C160 5 245 68 402 34s166 10 198-8V0H0Z'/%3E%3C/svg%3E") bottom / 100% var(--wave-height) no-repeat;
  }

  .kaede-wave-front {
    display: none;
  }
}

.kaede-hero-title-motion {
  display: block;
}

@media (min-width: 721px) {
  .kaede-hero-title-line,
  .kaede-hero-title-line > span {
    display: block;
  }

  .kaede-hero-title-motion .kaede-hero-break {
    display: none;
  }
}

@media (min-width: 721px) and (prefers-reduced-motion: no-preference) {
  html[data-kaede-hero-enter] .kaede-hero-title-line {
    overflow: clip;
    overflow-clip-margin: 2px;
  }

  html[data-kaede-hero-enter] .kaede-hero-title-line > span {
    transform-origin: center bottom;
    animation: kaede-hero-title-arrive 760ms var(--ease-out) both;
  }

  html[data-kaede-hero-enter] .kaede-hero-title-line:last-child > span {
    animation-delay: 108ms;
  }
}

@media (max-width: 720px) and (prefers-reduced-motion: no-preference) {
  html[data-kaede-hero-enter] .kaede-hero-title {
    overflow: clip;
    overflow-clip-margin: 2px;
  }

  html[data-kaede-hero-enter] .kaede-hero-title-motion {
    transform-origin: center bottom;
    animation: kaede-hero-title-arrive 760ms var(--ease-out) both;
  }
}

@media (prefers-reduced-motion: no-preference) {
  html[data-kaede-hero-enter] .kaede-hero-identity {
    --hero-rise: 8px;
    animation: kaede-hero-copy-arrive 520ms var(--ease-out) 42ms both;
  }

  html[data-kaede-hero-enter] .kaede-hero-intro {
    --hero-rise: 18px;
    animation: kaede-hero-copy-arrive 630ms var(--ease-out) 180ms both;
  }

  html[data-kaede-hero-enter='direct'] .kaede-hero-art picture {
    animation: kaede-hero-picture-unmask 780ms var(--ease-out) 96ms both;
  }

  html[data-kaede-hero-enter='direct'] .kaede-hero-art img {
    animation: kaede-hero-picture-settle 780ms var(--ease-out) 96ms both;
  }

  html[data-kaede-hero-enter='direct'] .kaede-wave-back {
    animation: kaede-hero-wave-settle 660ms var(--ease-out) 96ms both;
  }

  html[data-kaede-hero-enter] .kaede-hero-title:focus-visible :is(.kaede-hero-title-motion, .kaede-hero-title-line > span) {
    animation: none;
  }
}

@keyframes kaede-hero-title-arrive {
  from { transform: perspective(520px) translateY(112%) rotateX(-34deg); }
  72% { transform: perspective(520px) translateY(-4%) rotateX(0); }
  to { transform: perspective(520px) translateY(0) rotateX(0); }
}

@keyframes kaede-hero-copy-arrive {
  from { opacity: 0; transform: translateY(var(--hero-rise)); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes kaede-hero-picture-unmask {
  from { clip-path: inset(0 0 94%); }
  to { clip-path: inset(0); }
}

@keyframes kaede-hero-picture-settle {
  from { transform: translateY(-12px) scale(1.1); }
  to { transform: translateY(0) scale(1); }
}

@keyframes kaede-hero-wave-settle {
  from { transform: translateY(4px); }
  to { transform: translateY(0); }
}
</style>
