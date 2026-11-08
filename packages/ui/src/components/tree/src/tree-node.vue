<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import SrCheckbox from '../../checkbox/src/checkbox.vue'
import SrIcon from '../../icon/src/icon.vue'
import type { SrFlatNode, SrTreeCheckState, SrTreeDropType } from './tree-utils'

defineOptions({ name: 'SrTreeNodeRow' })

const props = defineProps<{
  /** 扁平化后的行 */
  row: SrFlatNode
  /** 缩进宽度 */
  indent: number
  /** 行高 */
  itemHeight: number
  /** 是否显示复选框 */
  checkable: boolean
  /** 勾选状态 */
  checkState: SrTreeCheckState
  /** 是否选中 */
  selected: boolean
  /** 是否整体禁用 */
  disabled: boolean
  /** 点击整行切换展开 */
  expandOnClickNode: boolean
  /** 是否可拖拽 */
  draggable: boolean
  /** 注册元素，供父级计算落点 */
  register: (element: HTMLElement | null) => void
  /** 是否可被 Tab 进入 */
  tabbable: boolean
  /** 正在被拖动的 key */
  draggingKey: unknown
  /** 当前拖到本行的哪个位置 */
  dropType: SrTreeDropType | null
  /** 是否正在加载子节点 */
  loading: boolean
  /** 是否由外部异步提供子节点（没有 children 也要显示箭头） */
  loadable: boolean
}>()

const emit = defineEmits<{
  /** 切换展开 */
  toggle: [node: SrFlatNode['node']]
  /** 勾选变化 */
  check: [node: SrFlatNode['node'], checked: boolean]
  /** 点击文字选中 */
  select: [node: SrFlatNode['node']]
  /** 指针按下（拖拽起始） */
  'pointer-down': [node: SrFlatNode['node'], event: PointerEvent]
}>()

/** 本行元素 */
const rowRef = ref<HTMLElement>()

/** 行内边距：层级越深缩进越大 */
const rowStyle = computed<Record<string, string>>(() => ({
  paddingLeft: `${8 + props.row.level * props.indent}px`,
  height: `${props.itemHeight}px`,
}))

/** 是否显示展开箭头（异步节点在加载完之前也要显示，否则没法点开） */
const hasArrow = computed(() => {
  if (props.row.node.isLeaf) return false
  if (props.loading) return true
  return props.row.hasChildren || props.loadable
})

/** 当前拖拽落点：拖到自己身上或拖进自己的子树时不允许 */
const dropClass = computed(() => (props.dropType ? `is-drop-${props.dropType}` : ''))

/**
 * 指针按下
 *
 * 只有可拖拽的节点才转发给父级；否则交给浏览器做正常点击/选择。
 * @param event 指针事件
 */
function onPointerDown(event: PointerEvent): void {
  if (!props.draggable || props.disabled || props.row.node.disabled) return
  // 点在复选框或箭头上时不启动拖拽，否则按钮点不动
  const target = event.target as HTMLElement | null
  if (target?.closest('.sr-checkbox, .sr-tree__arrow')) return

  emit('pointer-down', props.row.node, event)
}

/** 行点击：按配置决定是展开还是只聚焦 */
function onRowClick(): void {
  if (props.expandOnClickNode) emit('toggle', props.row.node)
}

onMounted(() => {
  props.register(rowRef.value ?? null)
})

onBeforeUnmount(() => {
  props.register(null)
})

defineExpose({ rowRef })
</script>

<template>
  <div
    ref="rowRef"
    class="sr-tree__row"
    :class="[
      {
        'is-expanded': row.expanded,
        'is-leaf': !row.hasChildren,
        'is-disabled': row.node.disabled,
        'is-dragging': draggingKey === row.node.key,
      },
      dropClass,
    ]"
    :style="rowStyle"
    :data-key="row.node.key"
    :data-level="row.level"
    :tabindex="tabbable ? 0 : -1"
    @click="onRowClick"
    @pointerdown="onPointerDown"
  >
    <button
      v-if="hasArrow"
      class="sr-tree__arrow"
      type="button"
      :aria-label="row.expanded ? '收起' : '展开'"
      :aria-expanded="row.expanded"
      @click.stop="emit('toggle', row.node)"
    >
      <SrIcon v-if="!loading" name="lucide:chevron-right" :size="12" />
      <span v-else class="sr-tree__spinner" />
    </button>
    <span v-else class="sr-tree__arrow sr-tree__arrow--placeholder" />

    <SrCheckbox
      v-if="checkable"
      class="sr-tree__check"
      :model-value="checkState === 'checked'"
      :indeterminate="checkState === 'indeterminate'"
      :disabled="disabled || row.node.disabled"
      @click.stop
      @update:model-value="emit('check', row.node, $event)"
    />

    <span
      class="sr-tree__label"
      :class="{ 'is-selected': selected, 'is-disabled': row.node.disabled }"
      @click.stop="emit('select', row.node)"
    >
      <SrIcon v-if="row.node.icon" :name="row.node.icon" :size="14" class="sr-tree__icon" />
      {{ row.node.label }}
    </span>
  </div>
</template>
