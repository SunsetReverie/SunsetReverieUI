<script setup lang="ts">
import { computed, nextTick, onMounted, onScopeDispose, ref, watch } from 'vue'

import { srFocusFirst } from '../../../utils/focus-trap'
import { srLockScroll, srUnlockScroll } from '../../../utils/scroll-lock'
import SrButton from '../../button/src/button.vue'
import SrIcon from '../../icon/src/icon.vue'
import { SR_CONFIRM_ICONS, confirmProps, type SrConfirmType } from './confirm'

defineOptions({ name: 'SrConfirm', inheritAttrs: false })

const props = defineProps(confirmProps)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  close: []
}>()

/** 图标与按钮都用当前类型色，避免红图标配蓝按钮 */
const BUTTON_VARIANTS: Record<SrConfirmType, 'primary' | 'warning' | 'danger'> = {
  primary: 'primary',
  warning: 'warning',
  danger: 'danger',
}

/** 面板元素 */
const panelRef = ref<HTMLElement | null>(null)
/** 是否已锁定滚动 */
let locked = false

/** 类型图标名 */
const iconName = computed(() => SR_CONFIRM_ICONS[props.type])

/** 确认按钮变体 */
const buttonVariant = computed(() => BUTTON_VARIANTS[props.type])

/** 面板宽度：数字按 px */
const panelWidth = computed(() => (typeof props.width === 'number' ? `${props.width}px` : props.width))

/**
 * 打开：锁滚动并把焦点移进面板
 * @returns {Promise<void>}
 */
async function handleOpen(): Promise<void> {
  if (locked) return
  locked = true
  srLockScroll()
  await nextTick()
  if (panelRef.value) srFocusFirst(panelRef.value)
}

/** 关闭：解锁滚动 */
function handleClose(): void {
  if (!locked) return
  locked = false
  srUnlockScroll()
}

/** 取消（按钮 / 遮罩 / Esc 共用） */
function cancel(): void {
  emit('update:modelValue', false)
  emit('cancel')
  emit('close')
}

/** 点击确认 */
function confirm(): void {
  emit('confirm')
}

/**
 * Esc 视为取消；加载中不允许关闭
 * @param event 键盘事件
 */
function onKeydown(event: KeyboardEvent): void {
  if (!props.modelValue || props.loading) return
  if (event.key !== 'Escape') return

  event.stopPropagation()
  cancel()
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) void handleOpen()
    else handleClose()
  },
)

onMounted(() => {
  document.addEventListener('keydown', onKeydown, true)
  if (props.modelValue) void handleOpen()
})

onScopeDispose(() => {
  document.removeEventListener('keydown', onKeydown, true)
  handleClose()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sr-fade" :duration="{ enter: 200, leave: 160 }">
      <div v-if="modelValue" class="sr-confirm-root" :style="{ '--sr-confirm-width': panelWidth }">
        <div class="sr-confirm-mask" @click="maskClosable && !loading && cancel()" />

        <div ref="panelRef" class="sr-confirm-panel" role="alertdialog" aria-modal="true" tabindex="-1">
          <div class="sr-confirm" :class="`sr-confirm--${type}`">
            <span class="sr-confirm__icon" aria-hidden="true">
              <sr-icon :name="iconName" :size="22" />
            </span>

            <div class="sr-confirm__text">
              <h3 v-if="title" class="sr-confirm__title">{{ title }}</h3>
              <p v-if="content" class="sr-confirm__content">{{ content }}</p>
              <slot />
            </div>
          </div>

          <footer class="sr-confirm-footer">
            <sr-button v-if="showCancel" variant="secondary" :disabled="loading" @click="cancel">
              {{ cancelText }}
            </sr-button>
            <sr-button :variant="buttonVariant" :loading="loading" @click="confirm">
              {{ confirmText }}
            </sr-button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
