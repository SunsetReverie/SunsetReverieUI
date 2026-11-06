<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import type { SrSize } from '../../../types/config'

import { srComputeFloating, srGetRect } from '../../../utils/floating'
import SrIcon from '../../icon/src/icon.vue'
import { dropdownProps, type SrDropdownItem } from './dropdown'

defineOptions({ name: 'SrDropdown' })

const props = defineProps(dropdownProps)

const emit = defineEmits<{
  /** 选中某一项 */
  select: [key: string, item: SrDropdownItem]
  /** 展开状态变化 */
  'visible-change': [visible: boolean]
}>()

const config = useSrConfig()

/** 最终尺寸 */
const resolvedSize = computed<SrSize>(() => props.size ?? config.value.size)

/** 触发元素 */
const triggerRef = ref<HTMLElement>()
/** 菜单面板 */
const panelRef = ref<HTMLElement>()

/** 是否展开 */
const visible = ref(false)

/** 面板位置 */
const position = ref({ top: 0, left: 0 })

/** 面板样式 */
const panelStyle = computed(() => {
  const minWidth = typeof props.minWidth === 'number' ? `${props.minWidth}px` : props.minWidth
  return { top: `${position.value.top}px`, left: `${position.value.left}px`, minWidth }
})

/** 重新计算位置 */
function updatePosition(): void {
  const trigger = triggerRef.value
  if (!trigger) return

  const result = srComputeFloating({
    reference: srGetRect(trigger),
    floating: {
      width: Math.max(trigger.offsetWidth, Number(props.minWidth) || 160),
      height: panelRef.value?.offsetHeight ?? 0,
    },
    placement: props.placement,
    offset: 6,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    padding: 8,
  })

  position.value = { top: result.top, left: result.left }
}

/** 打开 */
function open(): void {
  clearCloseTimer()
  if (props.disabled || visible.value) return
  visible.value = true
  emit('visible-change', true)
}

/** 关闭 */
function close(): void {
  if (!visible.value) return
  visible.value = false
  emit('visible-change', false)
}

/** 切换 */
function toggle(): void {
  if (visible.value) close()
  else open()
}

/**
 * 选中某项
 * @param item 菜单项
 */
function pick(item: SrDropdownItem): void {
  if (item.disabled || !item.key) return
  emit('select', item.key, item)
  close()
}

/** 点击外部关闭 */
function onDocumentClick(event: MouseEvent): void {
  const target = event.target as Node | null
  if (!target) return
  if (triggerRef.value?.contains(target)) return
  if (panelRef.value?.contains(target)) return
  close()
}

/** 合并到下一帧重算位置，避免滚动时逐像素读布局 */
let rafId: number | undefined

/** 视口或滚动位置变化时重新定位，否则面板会停在原处和触发器脱节 */
function onViewportChange(): void {
  if (rafId !== undefined) return
  rafId = window.requestAnimationFrame(() => {
    rafId = undefined
    if (!visible.value) return
    updatePosition()
  })
}

watch(visible, (open) => {
  if (open) {
    document.addEventListener('click', onDocumentClick, true)
    // 捕获阶段监听：内部滚动容器（maxHeight 之类）也能收到
    window.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
    // 等一帧拿到面板高度再定位，避免首帧贴到错误的位置
    requestAnimationFrame(updatePosition)
    return
  }
  document.removeEventListener('click', onDocumentClick, true)
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('resize', onViewportChange)
})

onScopeDispose(() => {
  clearCloseTimer()
  document.removeEventListener('click', onDocumentClick, true)
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('resize', onViewportChange)
  if (rafId !== undefined) window.cancelAnimationFrame(rafId)
})

/** 延迟关闭的定时器 */
let closeTimer: number | undefined

/** 清掉待执行的关闭 */
function clearCloseTimer(): void {
  if (closeTimer === undefined) return
  window.clearTimeout(closeTimer)
  closeTimer = undefined
}

/** 延时关闭：留出从触发器移到面板的时间 */
function closeLater(): void {
  clearCloseTimer()
  closeTimer = window.setTimeout(close, 160)
}

/** 触发区事件 */
const triggerEvents = computed(() =>
  props.trigger === 'hover' ? { onMouseenter: open, onMouseleave: closeLater } : { onClick: toggle },
)

/** 面板事件：移入要取消关闭，移出再延时关 */
const panelEvents = computed(() =>
  props.trigger === 'hover' ? { onMouseenter: clearCloseTimer, onMouseleave: closeLater } : {},
)
</script>

<template>
  <div
    class="sr-dropdown"
    :class="[`sr-dropdown--${resolvedSize}`, { 'is-disabled': disabled, 'is-open': visible }]"
  >
    <div ref="triggerRef" class="sr-dropdown__trigger" v-bind="triggerEvents">
      <slot />
    </div>

    <Teleport to="body">
      <Transition name="sr-dropdown-zoom">
        <div
          v-if="visible"
          ref="panelRef"
          class="sr-dropdown__panel"
          :class="[`sr-dropdown--${resolvedSize}`, { 'is-flush': flush }]"
          :style="panelStyle"
          :role="role"
          v-bind="panelEvents"
        >
          <slot name="menu" :close="close">
            <template v-for="(item, index) in items" :key="item.key ?? index">
              <div v-if="item.divided" class="sr-dropdown__divider" role="separator" />
              <div v-if="item.group && item.group !== items[index - 1]?.group" class="sr-dropdown__group">
                {{ item.group }}
              </div>

              <button
                class="sr-dropdown__item"
                :class="{
                  'is-disabled': item.disabled,
                  'is-danger': item.danger,
                  'is-selected': item.selected,
                }"
                type="button"
                role="menuitem"
                :disabled="item.disabled"
                @click="pick(item)"
              >
                <sr-icon v-if="item.icon" class="sr-dropdown__icon" :name="item.icon" :size="15" />
                <span class="sr-dropdown__label">{{ item.label }}</span>
                <sr-icon v-if="item.selected" class="sr-dropdown__check" name="lucide:check" :size="14" />
              </button>
            </template>
          </slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
