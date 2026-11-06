<script setup lang="ts">
import { computed } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { srToast } from './toast'
import { SR_TOAST_ICONS, SR_TOAST_POSITIONS, srToastItems } from './store'

defineOptions({ name: 'SrToastContainer' })

/**
 * 按位置分组，空的组不渲染容器
 * @returns 分组列表
 */
const groups = computed(() =>
  SR_TOAST_POSITIONS.map((position) => ({
    position,
    items: srToastItems.value.filter((item) => item.position === position),
  })).filter((group) => group.items.length > 0),
)
</script>

<template>
  <div v-for="group in groups" :key="group.position" class="sr-toast" :class="`sr-toast--${group.position}`">
    <TransitionGroup name="sr-list">
      <div
        v-for="item in group.items"
        :key="item.id"
        class="sr-toast__item"
        :class="`sr-toast__item--${item.type}`"
        :role="item.type === 'error' ? 'alert' : 'status'"
        :aria-live="item.type === 'error' ? 'assertive' : 'polite'"
      >
        <sr-icon :name="SR_TOAST_ICONS[item.type]" class="sr-toast__icon" :size="16" />

        <span class="sr-toast__message">{{ item.message }}</span>

        <button
          v-if="item.closable"
          class="sr-toast__close"
          type="button"
          aria-label="关闭提示"
          @click="srToast.close(item.id)"
        >
          <sr-icon name="lucide:x" :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
