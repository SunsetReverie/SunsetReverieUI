<script setup lang="ts">
import { computed } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import SrIcon from '../../icon/src/icon.vue'
import { stepsProps, type SrStepItem, type SrStepStatus } from './steps'

defineOptions({ name: 'SrSteps', inheritAttrs: false })

const props = defineProps(stepsProps)

const emit = defineEmits<{
  /** 点击某一步 */
  change: [index: number]
}>()

const config = useSrConfig()

/** 尺寸：自身 > 全局配置 */
const resolvedSize = computed(() => props.size ?? config.value.size)

/**
 * 推导某一项的状态
 *
 * 显式指定的优先，否则按位置判断：当前步之前的都算完成。
 * @param item 步骤项
 * @param index 下标
 * @returns 状态
 */
function statusOf(item: SrStepItem, index: number): SrStepStatus {
  if (item.status) return item.status
  if (index < props.current) return 'finish'
  if (index === props.current) return props.status
  return 'wait'
}

/**
 * 某一步显示的内容
 *
 * 已完成显示对勾、出错显示叉，其余显示序号——这是步骤条最省解释成本的表达。
 * @param item 步骤项
 * @param index 下标
 * @returns 图标名或序号
 */
function markerOf(item: SrStepItem, index: number): { icon?: string; text?: number } {
  if (item.icon) return { icon: item.icon }

  const status = statusOf(item, index)
  if (status === 'finish') return { icon: 'lucide:check' }
  if (status === 'error') return { icon: 'lucide:x' }
  return { text: index + 1 }
}

/**
 * 是否允许点击这一项
 * @param item 步骤项
 * @returns 是否可点
 */
function canClick(item: SrStepItem): boolean {
  return props.clickable && !item.disabled
}

/**
 * 点击某一步
 * @param item 步骤项
 * @param index 下标
 */
function onClick(item: SrStepItem, index: number): void {
  if (!canClick(item) || index === props.current) return
  emit('change', index)
}
</script>

<template>
  <div
    class="sr-steps"
    :class="[
      `sr-steps--${direction}`,
      `sr-steps--label-${labelPlacement}`,
      `sr-steps--line-${lineStyle}`,
      {
        'is-simple': simple,
        'is-clickable': clickable,
      },
      resolvedSize ? `sr-steps--${resolvedSize}` : '',
    ]"
    role="list"
  >
    <div
      v-for="(item, index) in items"
      :key="`${item.title}-${index}`"
      class="sr-steps__item"
      :class="[
        `is-${statusOf(item, index)}`,
        {
          'is-last': index === items.length - 1,
          'is-clickable': canClick(item),
          'is-disabled': item.disabled,
        },
      ]"
      role="listitem"
      :aria-current="index === current ? 'step' : undefined"
      @click="onClick(item, index)"
    >
      <div class="sr-steps__head">
        <span class="sr-steps__marker">
          <SrIcon v-if="markerOf(item, index).icon" :name="markerOf(item, index).icon!" :size="12" />
          <template v-else>{{ markerOf(item, index).text }}</template>
        </span>
        <!-- 最后一项后面不画连接线 -->
        <span v-if="index < items.length - 1" class="sr-steps__tail" />
      </div>

      <div class="sr-steps__body">
        <p class="sr-steps__title">
          <slot name="title" :item="item" :index="index" :status="statusOf(item, index)">
            {{ item.title }}
          </slot>
        </p>
        <p v-if="item.description && !simple" class="sr-steps__desc">
          <slot name="description" :item="item" :index="index" :status="statusOf(item, index)">
            {{ item.description }}
          </slot>
        </p>
      </div>
    </div>
  </div>
</template>
