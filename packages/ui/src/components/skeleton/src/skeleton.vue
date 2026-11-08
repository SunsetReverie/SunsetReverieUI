<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { skeletonProps } from './skeleton'

defineOptions({ name: 'SrSkeleton', inheritAttrs: false })

const props = defineProps(skeletonProps)

const attrs = useAttrs()
const config = useSrConfig()

/** 尺寸：自身 > 全局配置 */
const resolvedSize = computed(() => props.size ?? config.value.size)

/** 段落行数取整到非负 */
const rowCount = computed(() => Math.max(0, Math.trunc(props.rows)))

/**
 * 行宽百分比
 *
 * 最后一行刻意短一些，读起来像自然断句，而不是一个整齐的色块。
 * @param index 行号
 * @returns 宽度百分比
 */
function rowWidth(index: number): string {
  if (rowCount.value <= 1) return '100%'
  if (index === rowCount.value - 1) return '62%'
  // 中间行做点微差，避免看起来像表格
  return index % 3 === 0 ? '100%' : index % 3 === 1 ? '96%' : '88%'
}
</script>

<template>
  <div
    v-if="loading"
    class="sr-skeleton"
    :class="[
      {
        'is-animated': animated,
        'is-round': round,
        'has-avatar': avatar,
      },
      resolvedSize ? `sr-skeleton--${resolvedSize}` : '',
      attrs.class,
    ]"
    :style="attrs.style as Record<string, string>"
    role="status"
    aria-busy="true"
    aria-live="polite"
  >
    <span class="sr-skeleton__sr-only">加载中</span>

    <div v-if="avatar" class="sr-skeleton__avatar" />

    <div class="sr-skeleton__body">
      <div v-if="title" class="sr-skeleton__title" />
      <div
        v-for="index in rowCount"
        :key="index"
        class="sr-skeleton__row"
        :style="{ width: rowWidth(index - 1) }"
      />
    </div>
  </div>

  <template v-else>
    <slot />
  </template>
</template>
