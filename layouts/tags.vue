<script lang="ts" setup>
import { useSiteStore, useTags } from 'valaxy'
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
    '--sakura-tag-bg': hexToRgba(color, 0.15),
  }
}

const curTag = computed(() => route.query.tag as string || '')
const posts = computed(() => {
  const list = site.postList.filter((post) => {
    if (post.tags) {
      if (typeof post.tags === 'string')
        return post.tags === curTag.value
      else
        return post.tags.includes(curTag.value)
    }
    return false
  })
  return list
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
            <div>
              <div class="sakura-text-light" text="center" p="2">
                {{ t('counter.tags', Array.from(tags).length) }}
              </div>

              <div class="items-end justify-center" flex="~ wrap" gap="1">
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
            </div>
          </slot>
        </template>

        <template #main-nav-before>
          <slot name="post">
            <div v-if="curTag">
              <SakuraPostList :posts />
            </div>
          </slot>
        </template>
      </component>
    </RouterView>
  </SakuraPage>
</template>

<style lang="scss" scoped>
.sakura-tag-button {
  color: var(--sakura-tag-color) !important;
  background-color: var(--sakura-tag-bg);
  line-height: 1.75rem;
  transition:
    color 0.3s ease-in-out,
    color-border 0.2s ease-in-out;

  &:hover {
    color: var(--sakura-tag-color, var(--sakura-color-primary)) !important;
    border-color: var(--sakura-tag-color, var(--sakura-color-primary));
  }

  &.clicked {
    color: var(--sakura-tag-color, var(--sakura-color-primary)) !important;
    border-color: var(--sakura-tag-color, var(--sakura-color-primary));
  }

  &::before {
    content: '#';
  }
}
</style>
