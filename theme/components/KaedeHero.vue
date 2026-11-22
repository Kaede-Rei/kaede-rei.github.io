<script setup lang="ts">
import { useReducedMotion, useSpring } from '@vueuse/motion'
import { onMounted, reactive, watch } from 'vue'
import { profile } from '../../data/site'

const reducedMotion = useReducedMotion()
const waveMotion = reactive({ y: 0 })
const waveSpring = useSpring(waveMotion, { stiffness: 550, damping: 42, mass: 1, restDelta: .01, restSpeed: .2 })

onMounted(() => {
  if (visited)
    return

  visited = true
  if (!reducedMotion.value) {
    waveMotion.y = 3
    void waveSpring.set({ y: 0 })
  }
})

watch(reducedMotion, (reduced) => {
  if (reduced) {
    waveSpring.stop()
    waveMotion.y = 0
  }
})
</script>

<script lang="ts">
let visited = false
</script>

<template>
  <header class="kaede-hero">
    <div class="kaede-hero-grid">
      <div class="kaede-hero-copy">
        <p class="kaede-hero-identity">{{ profile.name }} · 机器人开发者</p>
        <h1 class="kaede-hero-title" tabindex="-1">让机器人从模型<br class="kaede-hero-break">走向真实运行</h1>
        <p class="kaede-hero-intro">我是华南农业大学本科生、AgroTech-SCAU 主要负责人之一，从事机械臂控制、嵌入式软件与系统集成，整理可复用的代码、工具和工程经验</p>
        <div class="kaede-actions">
          <RouterLink to="/#projects" class="kaede-button kaede-button--primary">个人代表项目 <span aria-hidden="true" class="kaede-link-arrow">↓</span></RouterLink>
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
          <path class="kaede-wave-back"
            d="M0 17C134 61 273 2 403 21s147 28 197-8v39H0Z"
            :style="waveMotion.y ? { transform: `translateY(${waveMotion.y}px)` } : undefined" />
          <path d="M0 33C160 5 245 68 402 34s166 10 198-8v26H0Z" />
        </svg>
      </div>
    </div>
  </header>
</template>
