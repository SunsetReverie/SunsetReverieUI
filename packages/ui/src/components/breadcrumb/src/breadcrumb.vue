<script setup lang="ts">
import { computed } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { breadcrumbProps, type SrBreadcrumbItem } from './breadcrumb'

defineOptions({ name: 'SrBreadcrumb' })

const props = defineProps(breadcrumbProps)

/** 折叠后的渲染序列，'ellipsis' 代表省略占位 */
const displayItems = computed<(SrBreadcrumbItem | 'ellipsis')[]>(() => {
  const list = props.items
  if (props.maxItems <= 0 || list.length <= props.maxItems || props.maxItems < 3) return list

  // 保留首项与末尾 (maxItems - 2) 项，中间收成一个省略号
  const tailCount = props.maxItems - 2
  return [list[0] as SrBreadcrumbItem, 'ellipsis', ...list.slice(-tailCount)]
})

/**
 * 是否当前页（最后一项）
 * @param index 渲染序列中的下标
 * @returns 是否最后一项
 */
function isLast(index: number): boolean {
  return index === displayItems.value.length - 1
}
</script>

<template>
  <nav class="sr-breadcrumb" aria-label="面包屑">
    <ol class="sr-breadcrumb__list">
      <li
        v-for="(item, index) in displayItems"
        :key="index"
        class="sr-breadcrumb__item"
        :class="{ 'is-last': isLast(index), 'is-disabled': item !== 'ellipsis' && item.disabled }"
      >
        <template v-if="item === 'ellipsis'">
          <span class="sr-breadcrumb__ellipsis" aria-hidden="true">…</span>
        </template>

        <template v-else>
          <sr-icon v-if="item.icon" class="sr-breadcrumb__icon" :name="item.icon" :size="14" />

          <a
            v-if="item.href && !isLast(index) && !item.disabled"
            class="sr-breadcrumb__link"
            :href="item.href"
          >
            {{ item.label }}
          </a>
          <span v-else class="sr-breadcrumb__text" :aria-current="isLast(index) ? 'page' : undefined">
            {{ item.label }}
          </span>
        </template>

        <span v-if="!isLast(index)" class="sr-breadcrumb__separator" aria-hidden="true">
          <slot name="separator">
            <sr-icon v-if="separatorIcon" :name="separatorIcon" :size="12" />
            <template v-else>{{ separator }}</template>
          </slot>
        </span>
      </li>
    </ol>
  </nav>
</template>
