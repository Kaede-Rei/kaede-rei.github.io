<script lang="ts" setup>
import { formatDate, useSiteStore, useTags } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useThemeConfig } from 'valaxy'

const route = useRoute()
const router = useRouter()
const site = useSiteStore()
const tags = useTags()
const themeConfig = useThemeConfig()
const { t } = useI18n()

const defaultRainbow = [
  '#ff4e6a',
  '#ff761e',
  '#ffb900',
  '#33d57a',
  '#00dbff',
  '#1a98ff',
  '#9090ff',
]

function hexToRgba(hex: string, alpha: number) {
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex))
    return 'transparent'

  let h = hex.slice(1)
  if (h.length === 3)
    h = h.split('').map(ch => ch + ch).join('')

  const r = Number.parseInt(h.slice(0, 2), 16)
  const g = Number.parseInt(h.slice(2, 4), 16)
  const b = Number.parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getTagStyle(index: number) {
  const rainbow = themeConfig.value.tags?.rainbow === true
    ? defaultRainbow
    : Array.isArray(themeConfig.value.tags?.rainbow)
      ? themeConfig.value.tags.rainbow
      : false

  if (!rainbow)
    return

  const color = rainbow[index % rainbow.length]

  return {
    '--sakura-tag-color': color,
    '--sakura-tag-bg': hexToRgba(color, 0.12),
  }
}

const curTag = computed(() => route.query.tag as string || '')

const posts = computed(() => {
  return site.postList.filter((post) => {
    if (!post.tags)
      return false

    if (typeof post.tags === 'string')
      return post.tags === curTag.value

    return post.tags.includes(curTag.value)
  })
})

function displayTag(tag: string) {
  router.push({ query: { tag } })
}
</script>

<template>
  <SakuraPage>
    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-content>
          <slot name="content">
            <div class="tags-page-wrap">
              <div class="sakura-text-light" text="center" p="2">
                {{ t('counter.tags', Array.from(tags).length) }}
              </div>

              <div class="tags-cloud" flex="~ wrap" gap="2" justify-center>
                <SakuraButton
                  v-for="([key, tag], index) in Array.from(tags).sort()"
                  :key="key"
                  class="sakura-tag-button"
                  :style="getTagStyle(index)"
                  :class="{ clicked: curTag === key.toString() }"
                  @click="displayTag(key.toString())"
                >
                  <span mx-1 inline-flex>{{ key }}</span>
                  <span inline-flex text="xs">[{{ tag.count }}]</span>
                </SakuraButton>
              </div>

              <div v-if="curTag" class="tag-posts">
                <div class="tag-posts-title">
                  <span># {{ curTag }}</span>
                  <span class="count">共 {{ posts.length }} 篇</span>
                </div>

                <RouterLink
                  v-for="post in posts"
                  :key="post.path"
                  :to="post.path"
                  class="tag-post-item"
                >
                  <div class="tag-post-date">
                    {{ formatDate(post.updated || post.date || 0) }}
                  </div>
                  <div class="tag-post-main">
                    <div class="tag-post-title">
                      {{ post.title }}
                    </div>
                    <div v-if="post.excerpt || post.description" class="tag-post-desc">
                      {{ post.excerpt || post.description }}
                    </div>
                  </div>
                </RouterLink>
              </div>
            </div>
          </slot>
        </template>
      </component>
    </RouterView>
  </SakuraPage>
</template>

<style lang="scss" scoped>
.tags-page-wrap {
  width: 100%;
}

.tags-cloud {
  margin-bottom: 2rem;
}

.sakura-tag-button {
  color: var(--sakura-tag-color) !important;
  background-color: var(--sakura-tag-bg);
  line-height: 1.75rem;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    color: var(--sakura-tag-color, var(--sakura-color-primary)) !important;
    border-color: var(--sakura-tag-color, var(--sakura-color-primary));
    transform: translateY(-1px);
  }

  &.clicked {
    color: var(--sakura-tag-color, var(--sakura-color-primary)) !important;
    border-color: var(--sakura-tag-color, var(--sakura-color-primary));
  }

  &::before {
    content: '#';
  }
}

.tag-posts {
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
}

.tag-posts-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);

  .count {
    opacity: 0.7;
    font-size: 0.95rem;
  }
}

.tag-post-item {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  padding: 1rem 0;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.tag-post-date {
  opacity: 0.72;
  font-size: 0.95rem;
  white-space: nowrap;
}

.tag-post-main {
  min-width: 0;
}

.tag-post-title {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.45;
  color: #2f3440;
  word-break: break-word;
}

.tag-post-desc {
  margin-top: 0.45rem;
  line-height: 1.7;
  opacity: 0.8;
  word-break: break-word;
}

@media (max-width: 768px) {
  .tag-post-item {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .tag-posts-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .tag-post-title {
    font-size: 1.12rem;
  }
}
</style>