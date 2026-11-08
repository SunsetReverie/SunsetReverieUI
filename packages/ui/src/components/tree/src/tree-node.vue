<script setup lang="ts">
import SrIcon from '../../icon/src/icon.vue'
import type { SrFlatNode, SrTreeCheckState } from './tree-utils'

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
}>()

const emit = defineEmits<{
  /** 切换展开 */
  toggle: [node: SrFlatNode['node']]
  /** 勾选变化 */
  check: [node: SrFlatNode['node'], event: Event]
  /** 点击文字选中 */
  select: [node: SrFlatNode['node']]
  /** 点了行的空白处 */
  rowClick: [node: SrFlatNode['node']]
}>()

/** 行内边距：层级越深缩进越大 */
function style(): Record<string, string> {
  return {
    paddingLeft: `${8 + props.row.level * props.indent}px`,
    height: `${props.itemHeight}px`,
  }
}

/** 是否显示展开箭头 */
function hasArrow(): boolean {
  return props.row.hasChildren && !props.row.node.isLeaf
}

/** 行点击 */
function onRowClick(): void {
  if (props.expandOnClickNode) emit('toggle', props.row.node)
  else emit('rowClick', props.row.node)
}
</script>

<template>
  <div
    class="sr-tree__row"
    :class="{ 'is-expanded': row.expanded, 'is-leaf': !row.hasChildren, 'is-disabled': row.node.disabled }"
    :style="style()"
    @click="onRowClick"
  >
    <button
      v-if="hasArrow()"
      class="sr-tree__arrow"
      type="button"
      :aria-label="row.expanded ? '收起' : '展开'"
      @click.stop="emit('toggle', row.node)"
    >
      <SrIcon name="lucide:chevron-right" :size="12" />
    </button>
    <span v-else class="sr-tree__arrow sr-tree__arrow--placeholder" />

    <label v-if="checkable" class="sr-tree__check" @click.stop>
      <input
        type="checkbox"
        :checked="checkState === 'checked'"
        :indeterminate="checkState === 'indeterminate'"
        :disabled="disabled || row.node.disabled"
        @change="emit('check', row.node, $event)"
      />
    </label>

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
