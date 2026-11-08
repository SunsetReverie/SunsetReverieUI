<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { useSrDragSort } from '../../../composables/use-sr-drag'
import SrTreeNodeRow from './tree-node.vue'
import { treeProps } from './tree'
import {
  cloneTree,
  collectKeys,
  computeCheckStates,
  flattenTree,
  getHalfCheckedKeys,
  getLeafCheckedKeys,
  isDescendant,
  moveNode,
  toggleCheck,
  type SrTreeDropType,
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
  /** 异步加载完成 */
  load: [node: SrTreeNode, children: SrTreeNode[]]
  /** 拖放完成，data 是移动后的新树 */
  'node-drop': [
    detail: { dragNode: SrTreeNode; dropNode: SrTreeNode; type: SrTreeDropType },
    data: SrTreeNode[],
  ]
}>()

/* ---------- 数据副本 ---------- */

/**
 * 内部数据
 *
 * 异步加载和拖拽都要往节点上写 children，直接改 props 会污染父组件的数据，
 * 而且不会触发响应式更新。这里维护一份副本，对外通过事件回传。
 */
const innerData = ref<SrTreeNode[]>(cloneTree(props.data))

watch(
  () => props.data,
  (next) => {
    // 外部换了数据才同步，避免自己的改动被覆盖
    if (next !== innerData.value) innerData.value = cloneTree(next)
  },
)

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

/** 正在加载子节点的 key */
const loadingKeys = ref<SrTreeKey[]>([])

/** 已经加载过子节点的 key（避免重复请求） */
const loadedKeys = ref<SrTreeKey[]>([])

/**
 * 展开 / 收起某个节点
 *
 * 异步节点第一次展开时会先发请求，期间箭头位置显示转圈。
 * @param node 节点
 */
async function toggleExpand(node: SrTreeNode): Promise<void> {
  if (props.disabled || node.disabled) return

  const set = new Set(expandedKeys.value)

  // 收起：直接关掉
  if (set.has(node.key)) {
    set.delete(node.key)
    setExpanded([...set])
    emit('expand', [...set], { node, expanded: false })
    return
  }

  const needsLoad = !!props.loadData && !node.children?.length && !loadedKeys.value.includes(node.key)

  if (!needsLoad && !node.children?.length && !props.loadData) return

  // 先展开，让用户立刻看到 loading，而不是点完没反应
  set.add(node.key)
  setExpanded([...set])
  emit('expand', [...set], { node, expanded: true })

  if (!needsLoad) return

  loadingKeys.value = [...loadingKeys.value, node.key]

  try {
    const children = await props.loadData!(node)
    await loadChildrenInto(node.key, children)
    loadedKeys.value = [...loadedKeys.value, node.key]
    emit('load', node, children)
  } finally {
    loadingKeys.value = loadingKeys.value.filter((key) => key !== node.key)
  }
}

/**
 * 把加载结果写进内部数据
 * @param key 目标 key
 * @param children 子节点
 */
async function loadChildrenInto(key: SrTreeKey, children: SrTreeNode[]): Promise<void> {
  const find = (nodes: SrTreeNode[]): SrTreeNode | undefined => {
    for (const node of nodes) {
      if (node.key === key) return node
      const hit = node.children ? find(node.children) : undefined
      if (hit) return hit
    }
    return undefined
  }

  const target = find(innerData.value)
  if (!target) return

  // 空数组说明后端确认没有子节点了，标记成叶子，
  // 否则箭头会一直挂着，用户点开永远是空的
  if (!children.length) target.isLeaf = true

  target.children = children
  // 改的是深层属性，数组引用没变，手动触发一次
  innerData.value = [...innerData.value]
  await nextTick()
}

/* ---------- 选中状态 ---------- */

/** 当前选中的集合 */
const selectedSet = computed(() => new Set(props.modelValue))

/**
 * 选中某个节点
 * @param node 节点
 */
function selectNode(node: SrTreeNode): void {
  if (props.disabled || node.disabled || !props.selectable) return

  activeKey.value = node.key
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
const checkStates = computed(() => computeCheckStates(innerData.value, props.modelValue))

/**
 * 勾选 / 取消
 * @param node 节点
 * @param checked 目标状态
 */
function handleCheck(node: SrTreeNode, checked: boolean): void {
  if (props.disabled || node.disabled) return

  const next = props.checkStrictly
    ? (() => {
        const set = new Set(props.modelValue)
        if (checked) set.add(node.key)
        else set.delete(node.key)
        return [...set]
      })()
    : toggleCheck(innerData.value, props.modelValue, node, checked)

  emit('update:modelValue', next)
  emit('check', next, {
    checked,
    node,
    halfCheckedKeys: getHalfCheckedKeys(innerData.value, next),
  })
}

/**
 * 在树里按 key 找节点
 * @param nodes 树
 * @param key 目标 key
 * @returns 节点
 */
function findNodeIn(nodes: SrTreeNode[], key: SrTreeKey): SrTreeNode | undefined {
  for (const node of nodes) {
    if (node.key === key) return node
    const hit = node.children ? findNodeIn(node.children, key) : undefined
    if (hit) return hit
  }
  return undefined
}

/** 叶子层面的勾选 */
const leafCheckedKeys = computed(() => getLeafCheckedKeys(innerData.value, props.modelValue))

/* ---------- 扁平化与虚拟滚动 ---------- */

/** 可见行 */
const rows = computed(() => flattenTree(innerData.value, expandedKeys.value))

/** 滚动容器 */
const viewportRef = ref<HTMLElement>()

/** 当前滚动位置 */
const scrollTop = ref(0)

/** 可视区高度 */
const viewportHeight = ref(0)

/** 虚拟滚动的总高度 */
const totalHeight = computed(() => rows.value.length * props.itemHeight)

/** 起始下标 */
const startIndex = computed(() =>
  props.virtual ? Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - 1) : 0,
)

/** 结束下标 */
const endIndex = computed(() =>
  props.virtual
    ? Math.min(rows.value.length, startIndex.value + Math.ceil(viewportHeight.value / props.itemHeight) + 2)
    : rows.value.length,
)

/** 实际渲染的行 */
const visibleRows = computed(() => rows.value.slice(startIndex.value, endIndex.value))

/** 行偏移 */
const offsetY = computed(() => startIndex.value * props.itemHeight)

/** 滚动处理 */
function onScroll(event: Event): void {
  scrollTop.value = (event.target as HTMLElement).scrollTop
}

onMounted(() => {
  registerContainer(viewportRef.value ?? null)
})

watch(
  () => props.height,
  () => {
    viewportHeight.value = viewportRef.value?.clientHeight ?? props.height
  },
  { immediate: true },
)

/* ---------- 键盘导航 ---------- */

/**
 * 键盘焦点所在的行
 *
 * 树是一个整体接收焦点，行本身靠 tabindex 切换，
 * 这样 Tab 只会停在树上一次，内部用方向键移动。
 */
const activeKey = ref<SrTreeKey | null>(null)

/** 焦点行在可见行里的下标 */
const activeIndex = computed(() => {
  const key = activeKey.value ?? rows.value[0]?.node.key
  return rows.value.findIndex((row) => row.node.key === key)
})

/**
 * 移动焦点
 * @param step 相对位移
 */
function moveActive(step: number): void {
  if (!rows.value.length) return

  const base = activeIndex.value < 0 ? 0 : activeIndex.value
  const next = Math.min(rows.value.length - 1, Math.max(0, base + step))
  const row = rows.value[next]
  if (!row) return

  activeKey.value = row.node.key
  scrollActiveIntoView()
}

/** 把焦点行滚进可视区 */
function scrollActiveIntoView(): void {
  if (!props.virtual) {
    nextTick(() => {
      const el = viewportRef.value?.querySelector<HTMLElement>(`[data-key="${String(activeKey.value)}"]`)
      // jsdom 里没有 scrollIntoView，可选调用避免测试环境报错
      el?.scrollIntoView?.({ block: 'nearest' })
    })
    return
  }

  const index = activeIndex.value
  if (index < 0) return

  const top = index * props.itemHeight
  const bottom = top + props.itemHeight
  const viewTop = scrollTop.value
  const viewBottom = viewTop + viewportHeight.value

  if (top < viewTop) scrollTop.value = top
  else if (bottom > viewBottom) scrollTop.value = bottom - viewportHeight.value
}

/**
 * 键盘事件
 *
 * 上下移动焦点、右展开/左收起、空格勾选、回车选中、Home/End 跳首尾。
 * @param event 键盘事件
 */
function onKeydown(event: KeyboardEvent): void {
  if (!props.keyboard || props.disabled) return

  const row = rows.value[activeIndex.value]
  if (!row) return

  const { node } = row
  const expanded = expandedKeys.value.includes(node.key)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      moveActive(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      moveActive(-1)
      break
    case 'ArrowRight':
      event.preventDefault()
      if (!expanded) void toggleExpand(node)
      else moveActive(1)
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (expanded) void toggleExpand(node)
      else moveActive(-1)
      break
    case 'Home':
      event.preventDefault()
      moveActive(-rows.value.length)
      break
    case 'End':
      event.preventDefault()
      moveActive(rows.value.length)
      break
    case 'Enter':
      event.preventDefault()
      selectNode(node)
      break
    case ' ':
      event.preventDefault()
      if (props.checkable) handleCheck(node, checkStates.value.get(node.key) !== 'checked')
      else selectNode(node)
      break
    default:
      break
  }
}

/* ---------- 拖拽 ---------- */

/**
 * 拖拽排序
 *
 * 逻辑抽在 useSrDragSort 里：它只认「key + 元素」，不关心树的结构，
 * 列表、看板之类的场景可以直接复用。
 */
const {
  dragKey: draggingKey,
  register: registerRow,
  registerContainer,
  onPointerDown: startRowDrag,
  dropTypeOf,
  cancel: cancelDrag,
} = useSrDragSort({
  orientation: 'vertical',
  isDisabled: () => props.disabled,
  canDrop: ({ dragKey, overKey, type }) => {
    const dragNode = findNodeIn(innerData.value, dragKey)
    const overNode = findNodeIn(innerData.value, overKey)
    if (!dragNode || !overNode) return false

    // 拖进自己的子树会成环
    if (isDescendant(innerData.value, dragKey, overKey)) return false
    // 没有子节点也不允许「放进去」
    if (type === 'inside' && !overNode.children?.length && !props.loadData) return false

    return props.allowDrop ? props.allowDrop(dragNode, overNode, type) : true
  },
  onDrop: ({ dragKey, overKey, type }) => {
    const dragNode = findNodeIn(innerData.value, dragKey)
    const overNode = findNodeIn(innerData.value, overKey)
    if (!dragNode || !overNode) return

    const next = moveNode(innerData.value, dragKey, overKey, type)
    if (!next) return

    innerData.value = next
    emit('node-drop', { dragNode, dropNode: overNode, type }, next)
  },
})

watch(draggingKey, (value) => {
  if (value === null) cancelDrag()
})

/**
 * 行按下：row 组件传的是节点，composable 要的是 key
 * @param node 节点
 * @param event 指针事件
 */
function onRowPointerDown(node: SrTreeNode, event: PointerEvent): void {
  startRowDrag(node.key, event)
}

/**
 * 可 Tab 进入的行
 *
 * 树整体只占一个 Tab 位：没进行过键盘导航时落在第一行，
 * 一旦用方向键移动过就跟着走。
 */
const tabbableKey = computed<SrTreeKey | null>(() => activeKey.value ?? rows.value[0]?.node.key ?? null)

/**
 * 是否正在加载子节点
 * @param key 项标识
 * @returns 是否 loading
 */
function isLoading(key: SrTreeKey): boolean {
  return loadingKeys.value.includes(key)
}

/**
 * 该节点是否还能点开加载
 * @param row 行
 * @returns 是否有异步子节点可加载
 */
function isLoadable(row: { node: SrTreeNode; hasChildren: boolean }): boolean {
  if (!props.loadData) return false
  if (row.hasChildren) return false
  return !loadedKeys.value.includes(row.node.key)
}

defineExpose({ leafCheckedKeys, rows, innerData })
</script>

<template>
  <div
    class="sr-tree"
    :class="[size ? `sr-tree--${size}` : '', { 'is-disabled': disabled, 'is-line': showLine }]"
    :role="'tree'"
    :aria-multiselectable="multiple"
    @keydown="onKeydown"
  >
    <div
      ref="viewportRef"
      class="sr-tree__viewport"
      :class="{ 'is-virtual': virtual }"
      :style="virtual ? { height: `${height}px` } : undefined"
      @scroll="onScroll"
    >
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
            :draggable="draggable"
            :tabbable="tabbableKey === row.node.key"
            :dragging-key="draggingKey"
            :drop-type="dropTypeOf(row.node.key)"
            :loading="isLoading(row.node.key)"
            :loadable="isLoadable(row)"
            :register="(el) => registerRow(row.node.key, el)"
            @toggle="toggleExpand"
            @check="handleCheck"
            @select="selectNode"
            @pointer-down="onRowPointerDown"
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
          :draggable="draggable"
          :tabbable="tabbableKey === row.node.key"
          :dragging-key="draggingKey"
          :drop-type="dropTypeOf(row.node.key)"
          :loading="isLoading(row.node.key)"
          :loadable="isLoadable(row)"
          :register="(el) => registerRow(row.node.key, el)"
          @toggle="toggleExpand"
          @check="handleCheck"
          @select="selectNode"
          @pointer-down="onRowPointerDown"
        />
      </template>
    </div>

    <p v-if="!rows.length" class="sr-tree__empty">{{ emptyText }}</p>
  </div>
</template>
