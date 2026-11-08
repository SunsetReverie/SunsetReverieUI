<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { srComputeFloating, srGetRect } from '../../../utils/floating'
import SrIcon from '../../icon/src/icon.vue'
import { cascaderProps, type SrCascaderOption, type SrCascaderValue } from './cascader'

defineOptions({ name: 'SrCascader', inheritAttrs: false })

const props = defineProps(cascaderProps)

const emit = defineEmits<{
  /** 选中值变化 */
  'update:modelValue': [value: SrCascaderValue[] | SrCascaderValue[][]]
  /** 选中了某一项（带完整路径的节点） */
  change: [value: SrCascaderValue[], labels: string[]]
  /** 面板显隐 */
  'visible-change': [visible: boolean]
}>()

const config = useSrConfig()

/** 触发器 */
const triggerRef = ref<HTMLElement | null>(null)
/** 面板 */
const panelRef = ref<HTMLElement | null>(null)
/** 搜索框 */
const searchRef = ref<HTMLInputElement | null>(null)

/** 面板是否展开 */
const visible = ref(false)
/** 搜索关键字 */
const keyword = ref('')
/** 面板位置 */
const position = ref({ top: 0, left: 0, minWidth: 0 })
/** 当前展开的路径（各级选中的 value） */
const activePath = ref<SrCascaderValue[]>([])

/** 尺寸：自身 > 全局配置 */
const resolvedSize = computed(() => props.size ?? config.value.size)

/** 是否处于搜索态 */
const searching = computed(() => props.filterable && keyword.value.trim().length > 0)

/**
 * 在某一层里按 value 找节点
 * @param list 该层的选项
 * @param value 目标值
 * @returns 节点
 */
function findIn(list: SrCascaderOption[], value: SrCascaderValue): SrCascaderOption | undefined {
  return list.find((option) => option.value === value)
}

/**
 * 路径转标签
 * @param path 各级 value
 * @returns 标签数组
 */
function labelsOfPath(path: SrCascaderValue[]): string[] {
  const labels: string[] = []
  let level = props.options

  for (const value of path) {
    const node = findIn(level, value)
    if (!node) break
    labels.push(node.label)
    level = node.children ?? []
  }

  return labels
}

/**
 * 各列数据
 *
 * 第 0 列是根，之后每一列都是「上一列选中项的 children」。
 * 遇到叶子就停止，所以列数天然等于「已展开层级 + 1」。
 */
const columns = computed<SrCascaderOption[][]>(() => {
  const result: SrCascaderOption[][] = [props.options]
  let level: SrCascaderOption[] = props.options

  for (const value of activePath.value) {
    const node = findIn(level, value)
    if (!node?.children?.length) break
    level = node.children
    result.push(level)
  }

  return result
})

/** 单选时的显示文案 */
const singleLabel = computed(() => {
  if (!props.modelValue.length || Array.isArray(props.modelValue[0])) return ''
  const path = props.modelValue as SrCascaderValue[]
  const labels = labelsOfPath(path)
  if (!labels.length) return ''
  return props.showAllLevels ? labels.join(props.separator) : (labels[labels.length - 1] ?? '')
})

/** 多选时的选中项（每条路径一组标签） */
const multiTags = computed(() => {
  if (!props.multiple) return []
  return (props.modelValue as SrCascaderValue[][]).map((path) => ({
    value: path,
    label: labelsOfPath(path).join(props.separator),
  }))
})

/** 多选时已选的叶子值，用于面板打勾 */
const checkedLeaves = computed(() => {
  if (!props.multiple) return new Set<SrCascaderValue>()
  return new Set(
    (props.modelValue as SrCascaderValue[][]).map((path) => path[path.length - 1] as SrCascaderValue),
  )
})

/**
 * 扁平化出所有叶子（搜索用）
 * @param list 当前层
 * @param trail 已走过的路径
 * @returns 叶子列表
 */
function flattenLeaves(
  list: SrCascaderOption[],
  trail: SrCascaderValue[] = [],
): Array<{ path: SrCascaderValue[]; labels: string[]; option: SrCascaderOption }> {
  const result: Array<{ path: SrCascaderValue[]; labels: string[]; option: SrCascaderOption }> = []

  for (const option of list) {
    const path = [...trail, option.value]
    if (option.children?.length) {
      result.push(...flattenLeaves(option.children, path))
    } else {
      result.push({ path, labels: labelsOfPath(path), option })
    }
  }

  return result
}

/** 搜索结果 */
const searchResults = computed(() => {
  const needle = keyword.value.trim().toLowerCase()
  if (!needle) return []

  return flattenLeaves(props.options)
    .filter((entry) => entry.labels.join(' ').toLowerCase().includes(needle) && !entry.option.disabled)
    .slice(0, 50)
})

/** 是否已有选中值 */
const hasValue = computed(() => props.modelValue.length > 0)

/**
 * 计算面板位置
 */
function updatePosition(): void {
  if (typeof window === 'undefined') return
  const trigger = triggerRef.value
  if (!trigger) return

  const result = srComputeFloating({
    reference: srGetRect(trigger),
    floating: {
      width: panelRef.value?.offsetWidth ?? trigger.offsetWidth,
      height: panelRef.value?.offsetHeight ?? props.maxHeight,
    },
    placement: 'bottom-start',
    offset: 4,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    padding: 8,
  })

  position.value = {
    top: result.top,
    left: result.left,
    minWidth: trigger.offsetWidth,
  }
}

/** 合并到下一帧 */
let frame = 0
function scheduleUpdate(): void {
  if (typeof window === 'undefined' || frame) return
  frame = window.requestAnimationFrame(() => {
    frame = 0
    updatePosition()
  })
}

/** 打开面板 */
async function open(): Promise<void> {
  if (props.disabled || visible.value) return

  visible.value = true
  emit('visible-change', true)

  // 回填已选路径，方便接着往下点
  if (props.multiple) {
    activePath.value = []
  } else {
    activePath.value = [...(props.modelValue as SrCascaderValue[])]
  }

  await nextTick()
  updatePosition()
  searchRef.value?.focus()
}

/** 关闭面板 */
function close(): void {
  if (!visible.value) return

  visible.value = false
  keyword.value = ''
  emit('visible-change', false)
}

/** 切换 */
function toggle(): void {
  if (visible.value) close()
  else void open()
}

/**
 * 提交一条路径
 * @param path 路径
 */
function commit(path: SrCascaderValue[]): void {
  const labels = labelsOfPath(path)

  if (props.multiple) {
    const current = [...(props.modelValue as SrCascaderValue[][])]
    const leaf = path[path.length - 1]
    const index = current.findIndex((item) => item[item.length - 1] === leaf)

    if (index >= 0) current.splice(index, 1)
    else current.push(path)

    emit('update:modelValue', current)
    emit('change', path, labels)
    return
  }

  emit('update:modelValue', path)
  emit('change', path, labels)
  close()
}

/**
 * 点击某一级的选项
 * @param option 选项
 * @param level 层级下标
 */
function pick(option: SrCascaderOption, level: number): void {
  if (option.disabled) return

  activePath.value = [...activePath.value.slice(0, level), option.value]

  // 没有子节点就是终点，直接提交
  if (!option.children?.length) commit(activePath.value)
}

/**
 * 点搜索结果
 * @param path 路径
 */
function pickSearch(path: SrCascaderValue[]): void {
  commit(path)
  keyword.value = ''
  if (!props.multiple) close()
}

/**
 * 判断某一项是否处于「当前展开路径」
 * @param option 选项
 * @param level 层级
 * @returns 是否选中
 */
function isActive(option: SrCascaderOption, level: number): boolean {
  return activePath.value[level] === option.value
}

/**
 * 判断某项是否已被选中（多选打勾）
 * @param option 选项
 * @returns 是否勾选
 */
function isChecked(option: SrCascaderOption): boolean {
  if (props.multiple) return checkedLeaves.value.has(option.value)
  const path = props.modelValue as SrCascaderValue[]
  return path[path.length - 1] === option.value
}

/** 清空 */
function clear(): void {
  emit('update:modelValue', [])
  activePath.value = []
}

/**
 * 多选时移除某个标签
 * @param path 路径
 */
function removeTag(path: SrCascaderValue[]): void {
  const leaf = path[path.length - 1]
  const next = (props.modelValue as SrCascaderValue[][]).filter((item) => item[item.length - 1] !== leaf)
  emit('update:modelValue', next)
}

/** 点击外部关闭 */
function onDocumentPointerDown(event: PointerEvent): void {
  if (!visible.value) return

  const target = event.target as Node | null
  if (!target) return
  if (triggerRef.value?.contains(target) || panelRef.value?.contains(target)) return
  close()
}

/** Esc 关闭 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && visible.value) {
    close()
    event.stopPropagation()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  document.addEventListener('keydown', onKeydown, true)
  window.addEventListener('scroll', scheduleUpdate, true)
  window.addEventListener('resize', scheduleUpdate)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('keydown', onKeydown, true)
  window.removeEventListener('scroll', scheduleUpdate, true)
  window.removeEventListener('resize', scheduleUpdate)
  if (frame) window.cancelAnimationFrame(frame)
})

watch(
  () => props.modelValue,
  () => {
    if (visible.value) scheduleUpdate()
  },
)

defineExpose({ open, close })
</script>

<template>
  <div
    class="sr-cascader"
    :class="[
      {
        'is-open': visible,
        'is-disabled': disabled,
        'is-multiple': multiple,
      },
      status ? `sr-cascader--${status}` : '',
      resolvedSize ? `sr-cascader--${resolvedSize}` : '',
    ]"
  >
    <div
      ref="triggerRef"
      class="sr-cascader__trigger"
      role="combobox"
      :aria-expanded="visible"
      tabindex="0"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
    >
      <div class="sr-cascader__values">
        <template v-if="multiple && multiTags.length">
          <span v-for="tag in multiTags" :key="tag.value.join('-')" class="sr-cascader__tag">
            {{ tag.label }}
            <button class="sr-cascader__tag-close" type="button" @click.stop="removeTag(tag.value)">
              <SrIcon name="lucide:x" :size="10" />
            </button>
          </span>
        </template>

        <template v-else-if="!multiple && singleLabel">{{ singleLabel }}</template>

        <span v-else class="sr-cascader__placeholder">{{ placeholder }}</span>
      </div>

      <button
        v-if="clearable && hasValue && !disabled"
        class="sr-cascader__clear"
        type="button"
        aria-label="清空"
        @click.stop="clear"
      >
        <SrIcon name="lucide:x" :size="12" />
      </button>

      <span class="sr-cascader__arrow">
        <SrIcon name="lucide:chevron-down" :size="14" />
      </span>
    </div>

    <Teleport to="body">
      <Transition name="sr-cascader-panel">
        <div
          v-if="visible"
          ref="panelRef"
          class="sr-cascader__panel"
          :style="{
            top: `${position.top}px`,
            left: `${position.left}px`,
            minWidth: `${position.minWidth}px`,
            maxHeight: `${maxHeight}px`,
          }"
        >
          <!-- 搜索态：平铺展示命中项 -->
          <template v-if="searching">
            <ul v-if="searchResults.length" class="sr-cascader__results">
              <li
                v-for="entry in searchResults"
                :key="entry.path.join('-')"
                class="sr-cascader__result"
                :class="{ 'is-checked': isChecked(entry.option) }"
                @click="pickSearch(entry.path)"
              >
                <span>{{ entry.labels.join(separator) }}</span>
                <SrIcon v-if="isChecked(entry.option)" name="lucide:check" :size="12" />
              </li>
            </ul>
            <div v-else class="sr-cascader__empty">{{ emptyText }}</div>
          </template>

          <!-- 正常态：多列 -->
          <div v-else class="sr-cascader__columns">
            <ul v-for="(column, level) in columns" :key="level" class="sr-cascader__column">
              <li
                v-for="option in column"
                :key="option.value"
                class="sr-cascader__option"
                :class="{
                  'is-active': isActive(option, level),
                  'is-checked': isChecked(option),
                  'is-disabled': option.disabled,
                }"
                @click="pick(option, level)"
                @mouseenter="expandTrigger === 'hover' && !option.disabled && pick(option, level)"
              >
                <span class="sr-cascader__option-label">{{ option.label }}</span>
                <SrIcon
                  v-if="isChecked(option) && !option.children?.length"
                  class="sr-cascader__option-check"
                  name="lucide:check"
                  :size="12"
                />
                <SrIcon
                  v-else-if="option.children?.length"
                  class="sr-cascader__option-more"
                  name="lucide:chevron-right"
                  :size="12"
                />
              </li>
            </ul>
          </div>

          <!-- 搜索框固定在底部 -->
          <div v-if="filterable" class="sr-cascader__search">
            <SrIcon name="lucide:search" :size="13" />
            <input
              ref="searchRef"
              v-model="keyword"
              class="sr-cascader__search-input"
              type="text"
              placeholder="搜索"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
