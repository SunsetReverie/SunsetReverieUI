<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

import { srComputeFloating } from '../../../utils/floating'
import SrIcon from '../../icon/src/icon.vue'
import { contextMenuProps, type SrContextMenuItem } from './context-menu'

defineOptions({ name: 'SrContextMenu', inheritAttrs: false })

const props = defineProps(contextMenuProps)

const emit = defineEmits<{
  /** 选中某一项 */
  select: [key: string, item: SrContextMenuItem]
  /** 显隐 */
  'visible-change': [visible: boolean]
}>()

/** 菜单面板 */
const panelRef = ref<HTMLElement | null>(null)
/** 是否展开 */
const visible = ref(false)
/** 面板位置 */
const position = ref({ top: 0, left: 0 })

/**
 * 在指定位置打开
 * @param event 鼠标事件，用来取坐标
 */
async function open(event: MouseEvent): Promise<void> {
  if (props.disabled || !props.items.length) return

  visible.value = true
  emit('visible-change', true)

  await nextTick()

  // 先用事件坐标定位，再根据面板实际尺寸纠偏（避免贴边被裁）
  const floating = {
    width: panelRef.value?.offsetWidth ?? 180,
    height: panelRef.value?.offsetHeight ?? 160,
  }

  const result = srComputeFloating({
    reference: {
      top: event.clientY,
      left: event.clientX,
      width: 0,
      height: 0,
    },
    floating,
    placement: 'bottom-start',
    offset: 2,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    padding: 6,
  })

  position.value = { top: result.top, left: result.left }
}

/** 关闭 */
function close(): void {
  if (!visible.value) return
  visible.value = false
  emit('visible-change', false)
}

/**
 * 右键处理
 * @param event 鼠标事件
 */
function onContextMenu(event: MouseEvent): void {
  event.preventDefault()
  void open(event)
}

/**
 * 点某一项
 * @param item 菜单项
 */
function onSelect(item: SrContextMenuItem): void {
  if (item.disabled) return
  emit('select', item.key, item)
  close()
}

/** 点击外部或滚动时关闭 */
function onDocumentPointerDown(event: PointerEvent): void {
  if (!visible.value) return
  if (panelRef.value?.contains(event.target as Node)) return
  close()
}

/**
 * 键盘：Esc 关闭
 * @param event 键盘事件
 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') close()
}

// 菜单打开时才挂监听，避免全局常驻
let listening = false

/**
 * 挂/卸全局监听
 * @param on 是否开启
 */
function toggleListeners(on: boolean): void {
  if (on === listening) return
  listening = on

  if (on) {
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    document.addEventListener('keydown', onKeydown, true)
    window.addEventListener('scroll', close, true)
    window.addEventListener('blur', close)
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
    document.removeEventListener('keydown', onKeydown, true)
    window.removeEventListener('scroll', close, true)
    window.removeEventListener('blur', close)
  }
}

// 用 watch 而不是在 open/close 里各写一遍
watch(visible, (value) => toggleListeners(value))

onBeforeUnmount(() => toggleListeners(false))

defineExpose({ open, close })
</script>

<template>
  <div class="sr-context-menu" @contextmenu="onContextMenu">
    <slot />

    <Teleport to="body">
      <Transition name="sr-context-menu-pop">
        <div
          v-if="visible"
          ref="panelRef"
          class="sr-context-menu__panel"
          role="menu"
          :style="{ top: `${position.top}px`, left: `${position.left}px` }"
        >
          <template v-for="item in items" :key="item.key">
            <div v-if="item.divider" class="sr-context-menu__divider" role="separator" />
            <button
              class="sr-context-menu__item"
              :class="{ 'is-disabled': item.disabled, 'is-danger': item.danger }"
              type="button"
              role="menuitem"
              :disabled="item.disabled"
              @click="onSelect(item)"
            >
              <SrIcon v-if="item.icon" class="sr-context-menu__icon" :name="item.icon" :size="14" />
              <span class="sr-context-menu__label">{{ item.label }}</span>
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
