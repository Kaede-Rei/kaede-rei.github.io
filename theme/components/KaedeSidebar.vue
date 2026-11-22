<script setup lang="ts">
import { profile } from '../../data/site'
</script>

<template>
  <section class="kaede-contact kaede-home-section" aria-labelledby="contact-title">
    <RouterLink class="kaede-avatar-link" to="/about" :aria-label="`关于 ${profile.name}`">
      <img :src="profile.avatar" alt="" width="72" height="72" loading="lazy" decoding="async">
    </RouterLink>
    <div>
      <h2 id="contact-title">联系 Kaede Rei</h2>
      <p>机器人开发者，华南农业大学本科生，AgroTech-SCAU 的主要负责人之一</p>
    </div>
    <nav class="kaede-contact-links" aria-label="联系入口">
      <a :href="profile.github">GitHub <span aria-hidden="true">↗</span></a>
      <a :href="'mailto:' + profile.email">邮箱</a>
      <a :href="profile.rss">RSS</a>
      <RouterLink to="/about">关于我 <span class="kaede-link-arrow" aria-hidden="true">→</span></RouterLink>
    </nav>
  </section>
</template>
