<script setup lang="ts">
import SrIcon from '../../icon/src/icon.vue'
import { SR_MESSAGE_ICONS, srMessageItems } from './store'

defineOptions({ name: 'SrMessageContainer' })

/** 消息条目的类型（从 store 推导，避免额外 import） */
type MessageItem = (typeof srMessageItems.value)[number]

/**
 * 单条消息的内联样式
 *
 * 背景 / 文字 / 图标三个颜色都以 CSS 变量下发，样式表只负责回退值。
 * @param item 消息条目
 * @returns 内联样式
 */
function itemStyle(item: MessageItem): Record<string, string> | undefined {
  const style: Record<string, string> = {}
  if (item.backgroundColor) style['--sr-message-bg'] = item.backgroundColor
  if (item.color) style['--sr-message-color'] = item.color
  if (item.iconColor) style['--sr-message-icon-color'] = item.iconColor

  return Object.keys(style).length ? style : undefined
}
</script>

<template>
  <div class="sr-message">
    <TransitionGroup name="sr-list">
      <div
        v-for="item in srMessageItems"
        :key="item.id"
        class="sr-message__item"
        :class="`sr-message__item--${item.type}`"
        :style="itemStyle(item)"
        role="status"
        aria-live="polite"
      >
        <sr-icon :name="SR_MESSAGE_ICONS[item.type]" class="sr-message__icon" :size="16" />
        <span class="sr-message__content">{{ item.content }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>
