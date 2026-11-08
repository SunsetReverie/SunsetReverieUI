<script setup lang="ts">
import { computed } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { timelineProps, type SrTimelineItem } from './timeline'

defineOptions({ name: 'SrTimeline', inheritAttrs: false })

const props = defineProps(timelineProps)

/** 实际渲染顺序 */
const list = computed(() => (props.reverse ? [...props.items].reverse() : props.items))

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
  <div class="sr-timeline" :class="`sr-timeline--${mode}`" role="list">
    <div
      v-for="(item, index) in list"
      :key="`${item.content}-${index}`"
      class="sr-timeline__item"
      :class="[`is-${typeOf(item)}`, { 'is-last': index === list.length - 1, 'is-hollow': item.hollow }]"
      role="listitem"
    >
      <!-- 左侧：时间（mode=left） -->
      <div v-if="mode === 'left'" class="sr-timeline__time sr-timeline__time--left">
        {{ item.timestamp }}
      </div>

      <div class="sr-timeline__axis">
        <span class="sr-timeline__node">
          <SrIcon v-if="item.icon" :name="item.icon" :size="12" />
        </span>
        <span v-if="index < list.length - 1" class="sr-timeline__tail" />
      </div>

      <div class="sr-timeline__content">
        <slot name="content" :item="item" :index="index">{{ item.content }}</slot>
      </div>

      <!-- 右侧：时间 -->
      <div v-if="mode === 'right'" class="sr-timeline__time">{{ item.timestamp }}</div>
    </div>
  </div>
</template>
