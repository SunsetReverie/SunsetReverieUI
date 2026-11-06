<script setup lang="ts">
import SrIcon from '../../icon/src/icon.vue'
import { SR_MESSAGE_ICONS, srMessageItems } from './store'

defineOptions({ name: 'SrMessageContainer' })
</script>

<template>
  <div class="sr-message">
    <TransitionGroup name="sr-list">
      <div
        v-for="item in srMessageItems"
        :key="item.id"
        class="sr-message__item"
        :class="`sr-message__item--${item.type}`"
        :style="item.backgroundColor ? { '--sr-message-bg': item.backgroundColor } : undefined"
        role="status"
        aria-live="polite"
      >
        <sr-icon :name="SR_MESSAGE_ICONS[item.type]" class="sr-message__icon" :size="16" />
        <span class="sr-message__content">{{ item.content }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>
