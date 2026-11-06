<script setup lang="ts">
import { computed, nextTick, onScopeDispose, ref, useId, watch } from 'vue'

import { srFocusFirst, srTrapTab } from '../../../utils/focus-trap'
import { srLockScroll, srUnlockScroll } from '../../../utils/scroll-lock'
import SrIcon from '../../icon/src/icon.vue'
import { DRAWER_SIZE_PRESET, drawerProps, type SrDrawerCloseReason } from './drawer'

defineOptions({ name: 'SrDrawer' })

const props = defineProps(drawerProps)

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  /** 关闭原因：关闭按钮 / 遮罩 / Esc */
  close: [reason: SrDrawerCloseReason]
  /** 打开状态变化 */
  'visible-change': [open: boolean]
  /** 打开动画结束 */
  opened: []
}>()

/** 标题 id，供 aria-labelledby 使用 */
const titleId = `sr-drawer-title-${useId()}`

/** 面板节点 */
const panelRef = ref<HTMLElement>()

/** 是否处于打开态 */
const locked = ref(false)

/** 是否水平方向（左右） */
const isHorizontal = computed(() => props.placement === 'left' || props.placement === 'right')

/** 面板尺寸样式 */
const panelStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.size !== '' && props.size !== undefined) {
    const preset = DRAWER_SIZE_PRESET[String(props.size)]
    const value =
      preset !== undefined
        ? `${preset}px`
        : typeof props.size === 'number'
          ? `${props.size}px`
          : String(props.size)
    style[isHorizontal.value ? 'width' : 'height'] = value
  }

  if (props.zIndex !== undefined) {
    style.zIndex = String(props.zIndex)
    style['--sr-drawer-z'] = String(props.zIndex - 1)
  }

  return Object.keys(style).length > 0 ? style : undefined
})

/**
 * 关闭抽屉
 * @param reason 关闭原因
 */
function close(reason: SrDrawerCloseReason): void {
  if (!props.modelValue) return
  emit('update:modelValue', false)
  emit('close', reason)
}

/** 点击遮罩 */
function onMaskClick(): void {
  if (props.maskClosable) close('mask')
}

/**
 * 键盘处理：Esc 关闭，Tab 在面板内循环
 * @param event 键盘事件
 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.escToClose) {
    event.stopPropagation()
    close('esc')
    return
  }
  if (event.key === 'Tab' && panelRef.value) srTrapTab(panelRef.value, event)
}

watch(
  () => props.modelValue,
  (open) => {
    emit('visible-change', open)

    // 服务端没有 document：immediate 会在 setup 阶段就跑到这里，
    // 不加判断会直接抛 "document is not defined"，整个 SSR 渲染失败
    if (typeof document === 'undefined') return

    if (open) {
      if (props.lockScroll && !locked.value) {
        srLockScroll()
        locked.value = true
      }
      document.addEventListener('keydown', onKeydown, true)
      void nextTick(() => {
        if (panelRef.value) srFocusFirst(panelRef.value)
      })
      return
    }

    document.removeEventListener('keydown', onKeydown, true)
    if (locked.value) {
      srUnlockScroll()
      locked.value = false
    }
  },
  { immediate: true },
)

onScopeDispose(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', onKeydown, true)
  if (locked.value) {
    srUnlockScroll()
    locked.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sr-drawer-fade">
      <div v-if="mask && modelValue" class="sr-drawer__mask" @click="onMaskClick" />
    </Transition>

    <Transition name="sr-drawer-slide" @after-enter="emit('opened')">
      <div
        v-if="modelValue"
        ref="panelRef"
        class="sr-drawer"
        :class="[`is-${placement}`, { 'is-inset': inset }]"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? titleId : undefined"
        :style="panelStyle"
      >
        <header v-if="title || $slots.header" class="sr-drawer__header">
          <slot name="header">
            <h2 :id="titleId" class="sr-drawer__title">{{ title }}</h2>
          </slot>

          <button
            v-if="closable"
            class="sr-drawer__close"
            type="button"
            aria-label="关闭"
            @click="close('close')"
          >
            <sr-icon name="lucide:x" :size="16" />
          </button>
        </header>

        <div class="sr-drawer__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="sr-drawer__footer">
          <slot name="footer" />
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>
