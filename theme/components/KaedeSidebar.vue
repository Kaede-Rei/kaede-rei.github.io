<script setup lang="ts">
import { association, profile } from '../../data/site'
</script>

<template>
  <section class="kaede-contact" aria-labelledby="contact-title">
    <h2 id="contact-title">
      <RouterLink class="kaede-avatar-link" to="/about" :aria-label="`关于 ${profile.name}`">
        <img :src="profile.avatar" alt="" width="72" height="72" loading="lazy" decoding="async">
        <span>{{ profile.name }}</span>
      </RouterLink>
    </h2>
    <nav class="kaede-contact-links" aria-label="联系方式">
      <a :href="profile.github" aria-label="GitHub" title="GitHub"><span class="i-ri-github-line" aria-hidden="true" /></a>
      <a :href="'mailto:' + profile.email" aria-label="邮箱" title="邮箱"><span class="i-ri-mail-line" aria-hidden="true" /></a>
      <a :href="profile.rss" aria-label="RSS" title="RSS"><span class="i-ri-rss-line" aria-hidden="true" /></a>
    </nav>
    <RouterLink class="kaede-atil-link" :to="association.path">
      <img src="/images/brand/atil-banner-480.webp" alt="" width="480" height="270" loading="lazy" decoding="async">
      <span class="kaede-atil-link-label">我在 ATIL 的工作 <span class="kaede-link-arrow" aria-hidden="true">→</span></span>
    </RouterLink>
  </section>
</template>
