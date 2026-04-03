<script lang="ts" setup>
import { defineWebPage, useSchemaOrg } from '@unhead/schema-org/vue'
import { useCategories } from 'valaxy'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const categories = useCategories()

useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
  }),
])
</script>

<template>
  <SakuraPage>
    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-content>
          <slot name="content">
            <div>
              <div text="center" p="2">
                {{ t('counter.categories', Array.from(categories.children).length) }}
              </div>

              <SakuraCategories :categories="categories.children" />
            </div>
          </slot>
        </template>
      </component>
    </RouterView>
  </SakuraPage>
</template>