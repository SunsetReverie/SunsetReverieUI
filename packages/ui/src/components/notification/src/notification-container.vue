<script setup lang="ts">
import { computed } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { srNotification } from './notification'
import { SR_NOTIFICATION_ICONS, SR_NOTIFICATION_POSITIONS, srNotificationItems } from './store'

defineOptions({ name: 'SrNotificationContainer' })

/** 按位置分组，空的组不渲染容器 */
const groups = computed(() =>
  SR_NOTIFICATION_POSITIONS.map((position) => ({
    position,
    items: srNotificationItems.value.filter((item) => item.position === position),
  })).filter((group) => group.items.length > 0),
)
</script>

<template>
  <div
    v-for="group in groups"
    :key="group.position"
    class="sr-notification"
    :class="`sr-notification--${group.position}`"
  >
    <TransitionGroup name="sr-list">
      <div
        v-for="item in group.items"
        :key="item.id"
        class="sr-notification__item"
        :class="`sr-notification__item--${item.type}`"
        :style="item.backgroundColor ? { '--sr-notification-bg': item.backgroundColor } : undefined"
        :role="item.type === 'error' ? 'alert' : 'status'"
        aria-live="polite"
      >
        <sr-icon :name="SR_NOTIFICATION_ICONS[item.type]" class="sr-notification__icon" :size="20" />

        <div class="sr-notification__body">
          <div v-if="item.title" class="sr-notification__title">{{ item.title }}</div>
          <div v-if="item.message" class="sr-notification__message">{{ item.message }}</div>
        </div>

        <button
          v-if="item.closable"
          class="sr-notification__close"
          type="button"
          aria-label="关闭通知"
          @click="srNotification.close(item.id)"
        >
          <sr-icon name="lucide:x" :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
