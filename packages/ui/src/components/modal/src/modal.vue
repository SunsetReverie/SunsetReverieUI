<script lang="ts">
/**
 * 打开中的弹层栈（模块级，跨实例共享）
 *
 * 必须放在普通 <script> 块里：写在 <script setup> 中会被编译进 setup 函数，
 * 变成「每个实例一个数组」，栈就永远只有自己一个元素，嵌套弹窗的 Esc 会一起关闭。
 */
const openStack: symbol[] = []

/** 层级种子，保证同时打开的多个弹层依次叠高 */
let zIndexSeed = 0
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, onScopeDispose, ref, useAttrs, useId, useSlots, watch } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { srOmit } from '../../../utils/attrs'
import { srFocusFirst, srTrapTab } from '../../../utils/focus-trap'
import { srLockScroll, srUnlockScroll } from '../../../utils/scroll-lock'
import SrIcon from '../../icon/src/icon.vue'
import { modalProps, type SrModalCloseReason } from './modal'

defineOptions({ name: 'SrModal', inheritAttrs: false })

const props = defineProps(modalProps)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: [reason: SrModalCloseReason]
  afterClose: []
}>()

const attrs = useAttrs()
const slots = useSlots()
const config = useSrConfig()

/** 面板元素 */
const panelRef = ref<HTMLElement | null>(null)
/** 本次打开分配的层级 */
const currentZIndex = ref<number>(0)
/** 打开前的焦点元素，关闭后归还 */
let triggerElement: HTMLElement | null = null

/** 实例标识，用于判定是否为最顶层弹层 */
const instanceId = Symbol('sr-modal')

/** 标题 id，供 aria-labelledby 使用 */
const titleId = useId()

/** 面板宽度 */
const panelWidth = computed(() => (typeof props.width === 'number' ? `${props.width}px` : props.width))

/** 根样式 */
const rootStyle = computed(() => ({ '--sr-modal-z': String(currentZIndex.value) }))

/** 面板内联样式 */
const panelStyle = computed(() => ({
  '--sr-modal-width': panelWidth.value,
  ...(attrs.style as Record<string, string>),
}))

/** 需要落到面板上的属性（按规范：$attrs 落在弹窗面板，不是遮罩） */
const panelAttrs = computed(() => srOmit(attrs as Record<string, unknown>, ['class', 'style']))

/**
 * 是否处于打开栈顶
 * @returns 栈顶返回 true
 */
function isTopmost(): boolean {
  return openStack[openStack.length - 1] === instanceId
}

/**
 * 打开时的处理：入栈、锁滚动、焦点移入
 * @returns {Promise<void>}
 */
async function handleOpen(): Promise<void> {
  if (openStack.includes(instanceId)) return

  triggerElement = document.activeElement as HTMLElement | null
  openStack.push(instanceId)

  zIndexSeed += 1
  currentZIndex.value = (props.zIndex ?? (config.value.zIndex || 1000) + 1001) + zIndexSeed

  if (props.lockScroll) srLockScroll()

  await nextTick()
  if (panelRef.value) srFocusFirst(panelRef.value)

  emit('open')
}

/**
 * 关闭时的处理：出栈、解锁、焦点归还
 * @returns {void}
 */
function handleClose(): void {
  const index = openStack.indexOf(instanceId)
  if (index >= 0) openStack.splice(index, 1)

  if (props.lockScroll) srUnlockScroll()

  // 归还焦点：只在触发元素仍挂载于文档时执行
  if (triggerElement && document.contains(triggerElement)) {
    triggerElement.focus({ preventScroll: true })
  }
  triggerElement = null

  emit('afterClose')
}

/**
 * 请求关闭
 * @param reason 关闭原因
 */
function close(reason: SrModalCloseReason): void {
  if (!props.modelValue) return
  emit('update:modelValue', false)
  emit('close', reason)
}

/** 点击遮罩 */
function onMaskClick(): void {
  if (props.maskClosable) close('mask')
}

/**
 * 全局键盘处理
 * @param event 键盘事件
 */
function onKeydown(event: KeyboardEvent): void {
  if (!props.modelValue || !isTopmost()) return

  if (event.key === 'Escape' && props.escToClose) {
    // 阻止冒泡，避免外层弹层或页面级监听也收到 Esc
    event.stopPropagation()
    close('esc')
    return
  }

  if (event.key === 'Tab' && panelRef.value) {
    srTrapTab(panelRef.value, event)
  }
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
  // 初始就处于打开状态时补一次打开流程
  if (props.modelValue) void handleOpen()
})

onScopeDispose(() => {
  document.removeEventListener('keydown', onKeydown, true)
  // 组件在打开状态下被销毁时，必须把栈和滚动锁清理掉
  const index = openStack.indexOf(instanceId)
  if (index >= 0) {
    openStack.splice(index, 1)
    if (props.lockScroll) srUnlockScroll()
  }
})
</script>

<template>
  <Teleport :to="teleportTo">
    <Transition name="sr-fade" :duration="{ enter: 200, leave: 160 }">
      <div v-show="modelValue" class="sr-modal" :class="{ 'is-centered': centered }" :style="rootStyle">
        <div v-if="showMask" class="sr-modal__mask" @click="onMaskClick" />

        <div
          ref="panelRef"
          class="sr-modal__panel"
          :class="attrs.class"
          :style="panelStyle"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          v-bind="panelAttrs"
        >
          <header v-if="title || slots.header || closable" class="sr-modal__header">
            <slot name="header">
              <h3 v-if="title" :id="titleId" class="sr-modal__title">{{ title }}</h3>
            </slot>

            <button
              v-if="closable"
              class="sr-modal__close"
              type="button"
              aria-label="关闭"
              @click="close('close-button')"
            >
              <sr-icon name="lucide:x" :size="18" />
            </button>
          </header>

          <div class="sr-modal__body">
            <slot />
          </div>

          <footer v-if="slots.footer" class="sr-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
