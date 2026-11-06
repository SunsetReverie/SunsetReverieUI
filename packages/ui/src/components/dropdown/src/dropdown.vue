<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'

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

watch(visible, (open) => {
  if (open) {
    document.addEventListener('click', onDocumentClick, true)
    // 等一帧拿到面板高度再定位，避免首帧贴到错误的位置
    requestAnimationFrame(updatePosition)
    return
  }
  document.removeEventListener('click', onDocumentClick, true)
})

onScopeDispose(() => {
  document.removeEventListener('click', onDocumentClick, true)
})

/** 触发区事件 */
const triggerEvents = computed(() =>
  props.trigger === 'hover' ? { onMouseenter: open, onMouseleave: close } : { onClick: toggle },
)
</script>

<template>
  <div class="sr-dropdown" :class="{ 'is-disabled': disabled, 'is-open': visible }">
    <div ref="triggerRef" class="sr-dropdown__trigger" v-bind="triggerEvents">
      <slot />
    </div>

    <Teleport to="body">
      <Transition name="sr-dropdown-zoom">
        <div v-if="visible" ref="panelRef" class="sr-dropdown__panel" :style="panelStyle" role="menu">
          <slot name="menu" :close="close">
            <template v-for="(item, index) in items" :key="item.key ?? index">
              <div v-if="item.divided" class="sr-dropdown__divider" role="separator" />
              <div v-if="item.group && item.group !== items[index - 1]?.group" class="sr-dropdown__group">
                {{ item.group }}
              </div>

              <button
                class="sr-dropdown__item"
                :class="{ 'is-disabled': item.disabled }"
                type="button"
                role="menuitem"
                :disabled="item.disabled"
                @click="pick(item)"
              >
                <sr-icon v-if="item.icon" class="sr-dropdown__icon" :name="item.icon" :size="15" />
                <span class="sr-dropdown__label">{{ item.label }}</span>
              </button>
            </template>
          </slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
