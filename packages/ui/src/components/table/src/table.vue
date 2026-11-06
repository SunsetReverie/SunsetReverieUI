<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, watch } from 'vue'

import { useSrBreakpoint } from '../../../composables/use-sr-breakpoint'
import { useSrConfig } from '../../../composables/use-sr-config'
import type { SrSize } from '../../../types/config'
import { srOmit } from '../../../utils/attrs'
import SrCheckbox from '../../checkbox/src/checkbox.vue'
import SrIcon from '../../icon/src/icon.vue'
import SrPagination from '../../pagination/src/pagination.vue'
import SrSpinner from '../../spinner/src/spinner.vue'
import {
  TABLE_SIZE_MAP,
  tableProps,
  type SrTableColumn,
  type SrTableRow,
  type SrTableRowKey,
  type SrTableSortOrder,
} from './table'

defineOptions({ name: 'SrTable', inheritAttrs: false })

const props = defineProps(tableProps)

const emit = defineEmits<{
  'update:selectedKeys': [keys: SrTableRowKey[]]
  'update:expandedKeys': [keys: SrTableRowKey[]]
  /** 选中集合变化 */
  'selection-change': [keys: SrTableRowKey[], rows: SrTableRow[]]
  /** 排序变化 */
  'sort-change': [payload: { key: string; order: SrTableSortOrder | null }]
  /** 行点击 */
  'row-click': [row: SrTableRow, index: number]
  /** 展开态变化 */
  'expand-change': [keys: SrTableRowKey[], rows: SrTableRow[]]
  /** 当前页变化，配合 v-model:page */
  'update:page': [page: number]
  /** 页码变化 */
  'page-change': [page: number]
  /** 滚动到底部，需要加载更多 */
  'load-more': []
}>()

const attrs = useAttrs()
const config = useSrConfig()
const { current: breakpoint } = useSrBreakpoint()

/** 是否已挂载：卡片模式只在挂载后启用，避免 SSR 与客户端首帧结构不一致 */
const mounted = ref(false)

/** 当前排序列 */
const sortKey = ref(props.defaultSort?.key ?? '')
/** 当前排序方向 */
const sortOrder = ref<SrTableSortOrder | null>(props.defaultSort?.order ?? null)

/** 最终尺寸 */
const resolvedSize = computed<SrSize>(() => props.size ?? config.value.size)

/** 是否切换为卡片视图 */
const isCardMode = computed(() => props.responsive && mounted.value && breakpoint.value === 'xs')

/** 行数（用于空状态与序号） */
const rowCount = computed(() => props.data.length)

/**
 * 取行键
 * @param row 行数据
 * @param index 行索引
 * @returns 行键
 */
function rowKeyOf(row: SrTableRow, index: number): SrTableRowKey {
  if (typeof props.rowKey === 'function') return props.rowKey(row, index)
  const value = row[props.rowKey]
  return (value as SrTableRowKey) ?? index
}

/**
 * 单元格文本
 * @param row 行数据
 * @param column 列配置
 * @param index 行索引
 * @returns 展示文本
 */
function cellText(row: SrTableRow, column: SrTableColumn, index: number): string {
  if (column.formatter) return column.formatter(row, index, column)
  const value = row[column.key]
  return value === undefined || value === null ? '' : String(value)
}

/**
 * 默认比较函数
 * @param a 前者
 * @param b 后者
 * @returns 比较结果
 */
function compareValue(a: unknown, b: unknown): number {
  // 空值统一沉底，避免 asc 时一片空白排在最前
  if (a === undefined || a === null || a === '') return 1
  if (b === undefined || b === null || b === '') return -1

  if (typeof a === 'number' && typeof b === 'number') return a - b

  return String(a).localeCompare(String(b), 'zh-Hans-CN', { numeric: true })
}

/** 排序后的数据（server 模式下原样返回） */
const displayData = computed<SrTableRow[]>(() => {
  if (props.sortMode === 'server' || !sortKey.value || !sortOrder.value) return props.data

  const key = sortKey.value
  const direction = sortOrder.value === 'asc' ? 1 : -1

  // 复制一份再排：直接 sort props.data 会就地修改父组件数组
  return [...props.data].sort((a, b) => compareValue(a[key], b[key]) * direction)
})

/** 列数（含选择与展开列），用于空状态与展开行 colspan */
const columnCount = computed(
  () => props.columns.length + (props.selectable ? 1 : 0) + (props.expandable ? 1 : 0),
)

// ---------- 分页 ----------

/** 是否启用分页 */
const paged = computed(() => Boolean(props.pagination))

/** 每页条数，优先取 pagination.pageSize */
const pageSizeResolved = computed(() => {
  if (typeof props.pagination === 'object' && props.pagination?.pageSize) {
    return props.pagination.pageSize
  }
  return props.pageSize
})

/** 内部页码：未绑定 v-model:page 时也能翻页 */
const innerPage = ref(props.page)

watch(
  () => props.page,
  (value) => {
    innerPage.value = value
  },
)

/** 总页数 */
const pageCount = computed(() =>
  paged.value ? Math.max(1, Math.ceil(displayData.value.length / pageSizeResolved.value)) : 1,
)

// 数据变少后可能停在空页，回落到最后一页
watch(pageCount, (total) => {
  if (innerPage.value > total) innerPage.value = total
})

/** 实际渲染的数据：分页时只取当前页 */
const visibleData = computed<SrTableRow[]>(() => {
  if (!paged.value) return displayData.value
  const start = (innerPage.value - 1) * pageSizeResolved.value
  return displayData.value.slice(start, start + pageSizeResolved.value)
})

/**
 * 翻页
 * @param page 目标页码
 */
function goPage(page: number): void {
  const next = Math.min(Math.max(1, page), pageCount.value)
  if (next === innerPage.value) return
  innerPage.value = next
  emit('update:page', next)
  emit('page-change', next)
}

// ---------- 固定列 ----------

/** 展开列宽度 */
const EXPAND_WIDTH = 40
/** 选择列宽度 */
const SELECT_WIDTH = 44

/**
 * 列宽换算成像素；百分比等相对单位无法累加，按 0 处理
 * @param column 列配置
 * @returns 像素宽度
 */
function columnWidthPx(column: SrTableColumn): number {
  const width = column.width
  if (typeof width === 'number') return width
  if (typeof width === 'string' && width.endsWith('px')) return Number.parseFloat(width) || 0
  return 0
}

/** 固定列的 sticky 偏移量与贴边方向 */
const fixedMap = computed(() => {
  const map = new Map<string, { style: Record<string, string>; edge: 'left' | 'right' }>()

  let left = (props.expandable ? EXPAND_WIDTH : 0) + (props.selectable ? SELECT_WIDTH : 0)
  for (const column of props.columns) {
    if (column.fixed !== 'left') continue
    map.set(column.key, { style: { left: `${left}px` }, edge: 'left' })
    left += columnWidthPx(column)
  }

  let right = 0
  for (let index = props.columns.length - 1; index >= 0; index -= 1) {
    const column = props.columns[index]
    if (!column || column.fixed !== 'right') continue
    map.set(column.key, { style: { right: `${right}px` }, edge: 'right' })
    right += columnWidthPx(column)
  }

  return map
})

/**
 * 表格最小宽度
 *
 * 固定列依赖横向滚动才成立，而 table-layout: auto 会把列压回容器宽度。
 * 有固定列时按各列宽之和兜一个 min-width，保证一定溢出。
 */
const tableMinWidth = computed(() => {
  if (!props.columns.some((column) => column.fixed)) return undefined
  const total =
    props.columns.reduce((sum, column) => sum + columnWidthPx(column), 0) +
    (props.expandable ? EXPAND_WIDTH : 0) +
    (props.selectable ? SELECT_WIDTH : 0)
  return total > 0 ? `${total}px` : undefined
})

/** 是否存在左侧固定列：有的话展开/选择列也要贴左 */
const hasFixedLeft = computed(() => props.columns.some((column) => column.fixed === 'left'))

/**
 * 固定列的内联样式
 * @param column 列配置
 * @returns 样式对象
 */
function fixedStyleOf(column: SrTableColumn): Record<string, string> | undefined {
  return fixedMap.value.get(column.key)?.style
}

/**
 * 固定列类名
 * @param column 列配置
 * @returns 类名映射
 */
function fixedClassOf(column: SrTableColumn): Record<string, boolean> {
  const edge = fixedMap.value.get(column.key)?.edge
  return {
    'is-fixed': Boolean(edge),
    'is-fixed-left': edge === 'left',
    'is-fixed-right': edge === 'right',
  }
}

// ---------- 懒加载 ----------

/**
 * 滚动到接近底部时请求更多数据
 * @param event 滚动事件
 */
function onScroll(event: Event): void {
  if (!props.lazy || !props.hasMore || props.loadingMore) return
  const el = event.target as HTMLElement
  // 留 48px 提前量，避免用户真的滚到最后一像素才触发
  if (el.scrollHeight - el.scrollTop - el.clientHeight > 48) return
  emit('load-more')
}

/** 已选 key 集合 */
const selectedSet = computed(() => new Set(props.selectedKeys))

/** 展开 key 集合 */
const expandedSet = computed(() => new Set(props.expandedKeys))

/**
 * 判断某行是否被选中
 * @param row 行数据
 * @param index 行索引
 * @returns 选中返回 true
 */
function isSelected(row: SrTableRow, index: number): boolean {
  return selectedSet.value.has(rowKeyOf(row, index))
}

/**
 * 判断某行是否展开
 * @param row 行数据
 * @param index 行索引
 * @returns 展开返回 true
 */
function isExpanded(row: SrTableRow, index: number): boolean {
  return expandedSet.value.has(rowKeyOf(row, index))
}

/** 是否全部选中 */
const allSelected = computed(
  () => rowCount.value > 0 && displayData.value.every((row, index) => isSelected(row, index)),
)

/** 是否部分选中（驱动表头复选框的半选态） */
const someSelected = computed(
  () => !allSelected.value && displayData.value.some((row, index) => isSelected(row, index)),
)

/**
 * 切换全选
 * @param checked 是否全选
 */
function toggleAll(checked: boolean): void {
  const keys = checked ? displayData.value.map((row, index) => rowKeyOf(row, index)) : []
  emit('update:selectedKeys', keys)
  emit(
    'selection-change',
    keys,
    displayData.value.filter((_, index) => keys.includes(rowKeyOf(displayData.value[index], index))),
  )
}

/**
 * 切换单行选中
 * @param row 行数据
 * @param index 行索引
 * @param checked 是否选中
 */
function toggleRow(row: SrTableRow, index: number, checked: boolean): void {
  const key = rowKeyOf(row, index)
  const next = checked ? [...props.selectedKeys, key] : props.selectedKeys.filter((item) => item !== key)

  emit('update:selectedKeys', next)
  emit(
    'selection-change',
    next,
    displayData.value.filter((item, itemIndex) => next.includes(rowKeyOf(item, itemIndex))),
  )
}

/**
 * 切换展开
 * @param row 行数据
 * @param index 行索引
 */
function toggleExpand(row: SrTableRow, index: number): void {
  const key = rowKeyOf(row, index)
  const next = expandedSet.value.has(key)
    ? props.expandedKeys.filter((item) => item !== key)
    : [...props.expandedKeys, key]

  emit('update:expandedKeys', next)
  emit(
    'expand-change',
    next,
    displayData.value.filter((item, itemIndex) => next.includes(rowKeyOf(item, itemIndex))),
  )
}

/**
 * 点击表头排序：asc → desc → 取消
 * @param column 列配置
 */
function toggleSort(column: SrTableColumn): void {
  if (!column.sortable) return

  let nextOrder: SrTableSortOrder | null
  if (sortKey.value !== column.key) {
    nextOrder = 'asc'
  } else if (sortOrder.value === 'asc') {
    nextOrder = 'desc'
  } else {
    nextOrder = null
  }

  sortKey.value = nextOrder ? column.key : ''
  sortOrder.value = nextOrder
  emit('sort-change', { key: column.key, order: nextOrder })
}

/**
 * 某个列当前的 aria-sort 值
 * @param column 列配置
 * @returns aria-sort 取值
 */
function ariaSortOf(column: SrTableColumn): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortable) return undefined
  if (sortKey.value !== column.key) return 'none'
  return sortOrder.value === 'asc' ? 'ascending' : 'descending'
}

/**
 * 行点击
 * @param row 行数据
 * @param index 行索引
 */
function onRowClick(row: SrTableRow, index: number): void {
  emit('row-click', row, index)
}

/** 滚动容器样式 */
const scrollStyle = computed(() => {
  if (props.maxHeight === undefined) return undefined
  return {
    maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
  }
})

/** 列宽样式 */
function columnStyle(column: SrTableColumn): Record<string, string> {
  const style: Record<string, string> = {}
  if (column.width !== undefined) {
    style.width = typeof column.width === 'number' ? `${column.width}px` : column.width
  }
  if (column.minWidth !== undefined) {
    style.minWidth = typeof column.minWidth === 'number' ? `${column.minWidth}px` : column.minWidth
  }
  return style
}

/** 根样式：尺寸变量 */
const rootStyle = computed(() => {
  const metrics = TABLE_SIZE_MAP[resolvedSize.value] ?? TABLE_SIZE_MAP.md
  return {
    '--sr-table-cell-padding-y': `${metrics.cellPaddingY}px`,
    '--sr-table-font-size': `${metrics.fontSize}px`,
    ...(attrs.style as Record<string, string>),
  }
})

/**
 * 取列的插槽名
 * @param column 列配置
 * @returns 插槽名
 */
function slotNameOf(column: SrTableColumn): string {
  return `cell-${column.slot ?? column.key}`
}

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <div
    class="sr-table"
    :class="[
      `sr-table--${resolvedSize}`,
      {
        'is-bordered': bordered,
        'is-stripe': stripe,
        'is-hoverable': hoverable,
        'is-loading': loading,
        'is-card-mode': isCardMode,
      },
      attrs.class,
    ]"
    :style="rootStyle"
    v-bind="srOmit(attrs as Record<string, unknown>, ['class', 'style'])"
  >
    <!-- ---------- 卡片视图（窄屏） ---------- -->
    <div v-if="isCardMode" class="sr-table__cards">
      <div v-for="(row, index) in visibleData" :key="rowKeyOf(row, index)" class="sr-table__card">
        <div v-for="column in columns" :key="column.key" class="sr-table__card-field">
          <span class="sr-table__card-label">{{ column.title }}</span>
          <span class="sr-table__card-value">
            <slot
              :name="slotNameOf(column)"
              :row="row"
              :value="row[column.key]"
              :index="index"
              :column="column"
            >
              {{ cellText(row, column, index) }}
            </slot>
          </span>
        </div>
      </div>

      <div v-if="visibleData.length === 0 && !loading" class="sr-table__empty">
        <slot name="empty">
          <sr-icon v-if="emptyIcon" class="sr-table__empty-icon" :name="emptyIcon" :size="30" />
          <p class="sr-table__empty-text">{{ emptyText }}</p>
        </slot>
      </div>
    </div>

    <!-- ---------- 表格视图 ---------- -->
    <div v-else class="sr-table__scroll" :style="scrollStyle" @scroll="onScroll">
      <table class="sr-table__inner" :style="{ tableLayout, minWidth: tableMinWidth }">
        <colgroup>
          <col v-if="expandable" style="width: 40px" />
          <col v-if="selectable" style="width: 44px" />
          <col v-for="column in columns" :key="column.key" :style="columnStyle(column)" />
        </colgroup>

        <thead class="sr-table__head">
          <tr>
            <th
              v-if="expandable"
              class="sr-table__cell--expand"
              scope="col"
              :class="{ 'is-fixed': hasFixedLeft, 'is-fixed-left': hasFixedLeft }"
              :style="hasFixedLeft ? { left: '0px' } : undefined"
            >
              <span class="sr-table__sr-only">展开</span>
            </th>

            <th
              v-if="selectable"
              class="sr-table__cell--select"
              scope="col"
              :class="{ 'is-fixed': hasFixedLeft, 'is-fixed-left': hasFixedLeft }"
              :style="hasFixedLeft ? { left: `${expandable ? EXPAND_WIDTH : 0}px` } : undefined"
            >
              <sr-checkbox
                :model-value="allSelected"
                :indeterminate="someSelected"
                aria-label="全选"
                size="sm"
                @update:model-value="toggleAll"
              />
            </th>

            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                `is-${column.align ?? 'left'}`,
                { 'is-sortable': column.sortable, 'is-sorted': sortKey === column.key },
                fixedClassOf(column),
              ]"
              :style="fixedStyleOf(column)"
              :aria-sort="ariaSortOf(column)"
              scope="col"
              @click="toggleSort(column)"
            >
              <span class="sr-table__th-inner">
                {{ column.title }}

                <span v-if="column.sortable" class="sr-table__sorter" aria-hidden="true">
                  <sr-icon class="sr-table__sorter-icon is-asc" name="lucide:chevron-down" :size="10" />
                  <sr-icon class="sr-table__sorter-icon is-desc" name="lucide:chevron-down" :size="10" />
                </span>
              </span>
            </th>
          </tr>
        </thead>

        <tbody class="sr-table__body">
          <template v-for="(row, index) in visibleData" :key="rowKeyOf(row, index)">
            <tr
              class="sr-table__row"
              :class="{ 'is-selected': isSelected(row, index) }"
              @click="onRowClick(row, index)"
            >
              <td
                v-if="expandable"
                class="sr-table__cell--expand"
                :class="{ 'is-fixed': hasFixedLeft, 'is-fixed-left': hasFixedLeft }"
                :style="hasFixedLeft ? { left: '0px' } : undefined"
              >
                <button
                  class="sr-table__expand-btn"
                  :class="{ 'is-expanded': isExpanded(row, index) }"
                  type="button"
                  :aria-expanded="isExpanded(row, index)"
                  aria-label="展开行"
                  @click.stop="toggleExpand(row, index)"
                >
                  <sr-icon name="lucide:chevron-right" :size="16" />
                </button>
              </td>

              <td
                v-if="selectable"
                class="sr-table__cell--select"
                :class="{ 'is-fixed': hasFixedLeft, 'is-fixed-left': hasFixedLeft }"
                :style="hasFixedLeft ? { left: `${expandable ? EXPAND_WIDTH : 0}px` } : undefined"
                @click.stop
              >
                <sr-checkbox
                  :model-value="isSelected(row, index)"
                  size="sm"
                  :aria-label="`选择第 ${index + 1} 行`"
                  @update:model-value="(checked: boolean) => toggleRow(row, index, checked)"
                />
              </td>

              <td
                v-for="column in columns"
                :key="column.key"
                :class="[
                  `is-${column.align ?? 'left'}`,
                  { 'is-ellipsis': column.ellipsis },
                  fixedClassOf(column),
                ]"
                :style="fixedStyleOf(column)"
              >
                <slot
                  :name="slotNameOf(column)"
                  :row="row"
                  :value="row[column.key]"
                  :index="index"
                  :column="column"
                >
                  {{ cellText(row, column, index) }}
                </slot>
              </td>
            </tr>

            <tr v-if="expandable && isExpanded(row, index)" class="sr-table__expand-row">
              <td :colspan="columnCount">
                <slot name="expand" :row="row" :index="index" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <div v-if="visibleData.length === 0 && !loading" class="sr-table__empty">
        <slot name="empty">
          <sr-icon v-if="emptyIcon" class="sr-table__empty-icon" :name="emptyIcon" :size="30" />
          <p class="sr-table__empty-text">{{ emptyText }}</p>
        </slot>
      </div>
    </div>

    <!-- ---------- 分页：复用 SrPagination ---------- -->
    <sr-pagination
      v-if="paged"
      class="sr-table__pagination"
      :model-value="innerPage"
      :total="displayData.length"
      :page-size="pageSizeResolved"
      :show-sizer="false"
      @update:model-value="goPage"
    />

    <!-- ---------- 懒加载底栏 ---------- -->
    <div v-if="lazy" class="sr-table__lazy">
      <span v-if="loadingMore" class="sr-table__lazy-text">
        <sr-spinner size="sm" />
        加载中…
      </span>
      <span v-else-if="!hasMore" class="sr-table__lazy-text">没有更多了</span>
      <button v-else class="sr-table__lazy-btn" type="button" @click="emit('load-more')">加载更多</button>
    </div>

    <!-- 加载遮罩：盖在内容上而不是替换内容，避免高度跳动 -->
    <div v-if="loading" class="sr-table__loading" role="status" aria-label="加载中">
      <sr-spinner size="md" />
    </div>
  </div>
</template>
