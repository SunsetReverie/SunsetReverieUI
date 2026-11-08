<script setup lang="ts">
import { computed } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { timelineProps, type SrTimelineItem } from './timeline'

defineOptions({ name: 'SrTimeline', inheritAttrs: false })

const props = defineProps(timelineProps)

/** 实际渲染顺序 */
const list = computed(() => (props.reverse ? [...props.items].reverse() : props.items))

/**
 * 时间戳是否渲染在内容内部（上方）
 *
 * `top` 模式本来就要置顶；`plain` 模式没有轴列可放时间，也强制置顶。
 */
const timeOnTop = computed(() => props.plain || props.mode === 'top')

/**
 * 某一项的节点类型
 * @param item 节点
 * @returns 类型
 */
function typeOf(item: SrTimelineItem): string {
  return item.type ?? 'default'
}
</script>

<template>
  <div class="sr-timeline" :class="[`sr-timeline--${mode}`, { 'is-plain': plain }]" role="list">
    <div
      v-for="(item, index) in list"
      :key="`${item.content}-${index}`"
      class="sr-timeline__item"
      :class="[`is-${typeOf(item)}`, { 'is-last': index === list.length - 1, 'is-hollow': item.hollow }]"
      role="listitem"
    >
      <!-- 时间在左（mode=left，且不是无节点模式） -->
      <div v-if="mode === 'left' && !plain" class="sr-timeline__time sr-timeline__time--left">
        {{ item.timestamp }}
      </div>

      <div v-if="!plain" class="sr-timeline__axis">
        <span class="sr-timeline__node">
          <SrIcon v-if="item.icon" :name="item.icon" :size="14" />
        </span>
        <span v-if="index < list.length - 1" class="sr-timeline__tail" />
      </div>

      <div class="sr-timeline__content">
        <div v-if="timeOnTop" class="sr-timeline__time sr-timeline__time--top">
          {{ item.timestamp }}
        </div>
        <div class="sr-timeline__body">
          <slot name="content" :item="item" :index="index">{{ item.content }}</slot>
        </div>
      </div>

      <!-- 时间在右（mode=right，且不是无节点模式） -->
      <div v-if="mode === 'right' && !plain" class="sr-timeline__time">
        {{ item.timestamp }}
      </div>
    </div>
  </div>
</template>
