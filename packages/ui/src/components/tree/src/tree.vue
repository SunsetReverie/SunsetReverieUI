<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import SrTreeNodeRow from './tree-node.vue'
import { treeProps } from './tree'
import {
  collectKeys,
  computeCheckStates,
  flattenTree,
  getHalfCheckedKeys,
  getLeafCheckedKeys,
  toggleCheck,
  type SrTreeKey,
  type SrTreeNode,
} from './tree-utils'

defineOptions({ name: 'SrTree' })

const props = defineProps(treeProps)

const emit = defineEmits<{
  /** 选中项变化，配合 v-model */
  'update:modelValue': [keys: SrTreeKey[]]
  /** 展开项变化，配合 v-model:expanded-keys */
  'update:expandedKeys': [keys: SrTreeKey[]]
  /** 勾选变化 */
  check: [keys: SrTreeKey[], detail: { checked: boolean; node: SrTreeNode; halfCheckedKeys: SrTreeKey[] }]
  /** 展开收起 */
  expand: [keys: SrTreeKey[], detail: { node: SrTreeNode; expanded: boolean }]
  /** 点击节点 */
  'node-click': [node: SrTreeNode]
}>()

/* ---------- 展开状态 ---------- */

/** 非受控时的展开集合 */
const innerExpanded = ref<SrTreeKey[]>(
  props.defaultExpandAll ? collectKeys(props.data) : [...props.defaultExpandedKeys],
)

/** 实际生效的展开集合 */
const expandedKeys = computed(() => props.expandedKeys ?? innerExpanded.value)

/** 更新展开集合 */
function setExpanded(keys: SrTreeKey[]): void {
  if (props.expandedKeys === undefined) innerExpanded.value = keys
  emit('update:expandedKeys', keys)
}

/**
 * 展开 / 收起某个节点
 * @param node 节点
 */
function toggleExpand(node: SrTreeNode): void {
  if (props.disabled) return
  if (!node.children?.length) return

  const set = new Set(expandedKeys.value)
  const willExpand = !set.has(node.key)

  if (willExpand) set.add(node.key)
  else set.delete(node.key)

  setExpanded([...set])
  emit('expand', [...set], { node, expanded: willExpand })
}

/* ---------- 选中状态 ---------- */

/** 当前选中的集合 */
const selectedSet = computed(() => new Set(props.modelValue))

/**
 * 点击节点文字
 * @param node 节点
 */
function selectNode(node: SrTreeNode): void {
  if (props.disabled || node.disabled || !props.selectable) return

  emit('node-click', node)

  const set = new Set(selectedSet.value)
  if (props.multiple) {
    if (set.has(node.key)) set.delete(node.key)
    else set.add(node.key)
  } else {
    set.clear()
    set.add(node.key)
  }

  emit('update:modelValue', [...set])
}

/* ---------- 勾选状态 ---------- */

/** 每个节点的勾选状态 */
const checkStates = computed(() => computeCheckStates(props.data, props.modelValue))

/**
 * 勾选 / 取消
 * @param node 节点
 * @param event 原生事件，用来判断当前是否选中
 */
function handleCheck(node: SrTreeNode, event: Event): void {
  if (props.disabled || node.disabled) return

  const checked = (event.target as HTMLInputElement).checked
  const next = props.checkStrictly
    ? (() => {
        // 父子不联动：只改自己
        const set = new Set(props.modelValue)
        if (checked) set.add(node.key)
        else set.delete(node.key)
        return [...set]
      })()
    : toggleCheck(props.data, props.modelValue, node, checked)

  emit('update:modelValue', next)
  emit('check', next, {
    checked,
    node,
    halfCheckedKeys: getHalfCheckedKeys(props.data, next),
  })
}

/** 叶子层面的勾选（业务方通常只关心这个） */
const leafCheckedKeys = computed(() => getLeafCheckedKeys(props.data, props.modelValue))

/* ---------- 扁平化与虚拟滚动 ---------- */

/** 可见行 */
const rows = computed(() => flattenTree(props.data, expandedKeys.value))

/** 滚动容器 */
const viewportRef = ref<HTMLElement>()

/** 当前滚动位置 */
const scrollTop = ref(0)

/** 可视区高度 */
const viewportHeight = ref(0)

/** 虚拟滚动的总高度 */
const totalHeight = computed(() => rows.value.length * props.itemHeight)

/** 可视区能放多少行 */
const visibleCount = computed(() => Math.ceil(viewportHeight.value / props.itemHeight) + 2)

/** 起始下标 */
const startIndex = computed(() =>
  props.virtual ? Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - 1) : 0,
)

/** 结束下标 */
const endIndex = computed(() =>
  props.virtual ? Math.min(rows.value.length, startIndex.value + visibleCount.value) : rows.value.length,
)

/** 实际渲染的行 */
const visibleRows = computed(() => rows.value.slice(startIndex.value, endIndex.value))

/** 行偏移 */
const offsetY = computed(() => startIndex.value * props.itemHeight)

/** 滚动处理 */
function onScroll(event: Event): void {
  const el = event.target as HTMLElement
  scrollTop.value = el.scrollTop
}

/** 测量可视区高度 */
function measure(): void {
  viewportHeight.value = viewportRef.value?.clientHeight ?? props.height
}

watch(
  () => props.height,
  () => {
    measure()
  },
  { immediate: true },
)

defineExpose({ leafCheckedKeys, rows })
</script>

<template>
  <div
    class="sr-tree"
    :class="[size ? `sr-tree--${size}` : '', { 'is-disabled': disabled, 'is-line': showLine }]"
  >
    <div
      ref="viewportRef"
      class="sr-tree__viewport"
      :class="{ 'is-virtual': virtual }"
      :style="virtual ? { height: `${height}px` } : undefined"
      @scroll="onScroll"
    >
      <!-- 虚拟滚动：撑出总高度，只渲染可视区内的一小段 -->
      <div v-if="virtual" class="sr-tree__phantom" :style="{ height: `${totalHeight}px` }">
        <div :style="{ transform: `translateY(${offsetY}px)` }">
          <SrTreeNodeRow
            v-for="row in visibleRows"
            :key="row.node.key"
            :row="row"
            :indent="indent"
            :item-height="itemHeight"
            :checkable="checkable"
            :check-state="checkStates.get(row.node.key) ?? 'unchecked'"
            :selected="selectedSet.has(row.node.key)"
            :disabled="disabled"
            :expand-on-click-node="expandOnClickNode"
            @toggle="toggleExpand"
            @check="handleCheck"
            @select="selectNode"
          />
        </div>
      </div>

      <template v-else>
        <SrTreeNodeRow
          v-for="row in rows"
          :key="row.node.key"
          :row="row"
          :indent="indent"
          :item-height="itemHeight"
          :checkable="checkable"
          :check-state="checkStates.get(row.node.key) ?? 'unchecked'"
          :selected="selectedSet.has(row.node.key)"
          :disabled="disabled"
          :expand-on-click-node="expandOnClickNode"
          @toggle="toggleExpand"
          @check="handleCheck"
          @select="selectNode"
        />
      </template>
    </div>

    <p v-if="!rows.length" class="sr-tree__empty">{{ emptyText }}</p>
  </div>
</template>
