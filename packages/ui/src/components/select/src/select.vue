<script setup lang="ts">
import { computed, inject, nextTick, onMounted, onScopeDispose, ref, useAttrs, useId, watch } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import type { SrSize } from '../../../types/config'
import type { SrResponsive } from '../../../types/theme'
import { srOmit } from '../../../utils/attrs'
import { srComputeFloating, srGetRect } from '../../../utils/floating'
import { SR_FORM_ITEM_KEY } from '../../form/src/form'
import SrIcon from '../../icon/src/icon.vue'
import SrTag from '../../tag/src/tag.vue'
import { SELECT_SIZE_MAP, selectProps, type SrSelectOption, type SrSelectValue } from './select'

defineOptions({ name: 'SrSelect', inheritAttrs: false })

const props = defineProps(selectProps)

const emit = defineEmits<{
  'update:modelValue': [value: SrSelectValue | SrSelectValue[] | undefined]
  change: [value: SrSelectValue | SrSelectValue[] | undefined]
  /** 面板展开状态变化 */
  'visible-change': [visible: boolean]
  /** 搜索关键字变化 */
  search: [keyword: string]
}>()

const attrs = useAttrs()
const config = useSrConfig()
// 表单内使用时由 SrFormItem 提供校验态
const formItem = inject(SR_FORM_ITEM_KEY, null)

/** 最终是否禁用：表单级 disabled 也要生效 */
const isDisabled = computed(() => props.disabled || (formItem?.disabled?.value ?? false))

/** 根元素（用于判断点击是否在内部） */
const rootRef = ref<HTMLElement | null>(null)
/** 触发元素 */
const triggerRef = ref<HTMLElement | null>(null)
/** 下拉面板 */
const panelRef = ref<HTMLElement | null>(null)
/** 搜索输入框 */
const searchRef = ref<HTMLInputElement | null>(null)

/** 面板是否展开 */
const visible = ref(false)
/** 搜索关键字 */
const keyword = ref('')
/** 键盘高亮的选项索引（-1 表示无） */
const activeIndex = ref(-1)
/** 面板坐标 */
const position = ref({ top: 0, left: 0, width: 0 })

/** 唯一 id 前缀，串联 combobox 与 listbox */
const uid = useId()
const listId = `sr-select-list-${uid}`

/** rAF 句柄 */
let frame = 0

/** 最终尺寸 */
const resolvedSize = computed<SrResponsive<SrSize>>(() => props.size ?? config.value.size)

/** 尺寸变量 */
const sizeVars = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}

  /**
   * 写入一组尺寸变量
   * @param suffix 断点后缀
   * @param size 档位
   */
  const write = (suffix: string, size: SrSize): void => {
    const metrics = SELECT_SIZE_MAP[size]
    if (!metrics) return
    const tail = suffix ? `-${suffix}` : ''
    out[`--sr-select-height${tail}`] = `${metrics.height}px`
    out[`--sr-select-padding-x${tail}`] = `${metrics.paddingX}px`
    out[`--sr-select-font-size${tail}`] = `${metrics.fontSize}px`
  }

  const size = resolvedSize.value
  if (typeof size === 'string') {
    write('', size)
  } else {
    for (const [bp, value] of Object.entries(size)) {
      if (value) write(bp, value as SrSize)
    }
  }

  return out
})

/** 实际校验态：自身显式指定优先，否则跟随表单项 */
const resolvedStatus = computed(() =>
  props.status !== 'default' ? props.status : (formItem?.status.value ?? 'default'),
)

/** 非受控时的内部值 */
const innerValue = ref<SrSelectValue | SrSelectValue[] | undefined>(props.defaultValue)

/** 实际生效的值：受控优先 */
const currentValue = computed(() => props.modelValue ?? innerValue.value)

/**
 * 写入选中值
 *
 * 受控时只派发事件等父级回写，非受控时直接更新内部状态——
 * 后者避免「忘了绑 v-model 就点了没反应」。
 * @param next 新值
 */
function setValue(next: SrSelectValue | SrSelectValue[]): void {
  if (props.modelValue === undefined) innerValue.value = next
  emit('update:modelValue', next)
}

/** 当前选中的值数组（统一形态，简化判断） */
const selectedValues = computed<SrSelectValue[]>(() => {
  const value = currentValue.value
  if (props.multiple) {
    return Array.isArray(value) ? value : []
  }
  return value === undefined ? [] : [value as SrSelectValue]
})

/** 已选选项对象 */
const selectedOptions = computed(() =>
  selectedValues.value
    .map((value) => props.options.find((option) => option.value === value))
    .filter((option): option is SrSelectOption => Boolean(option)),
)

/** 单选时展示的文案 */
const singleLabel = computed(() => selectedOptions.value[0]?.label ?? '')

/** 搜索过滤后的选项 */
const filteredOptions = computed(() => {
  if (!props.filterable || !keyword.value.trim()) return props.options
  const needle = keyword.value.trim().toLowerCase()
  return props.options.filter((option) => option.label.toLowerCase().includes(needle))
})

/** 是否显示清空按钮 */
const showClear = computed(() => props.clearable && selectedValues.value.length > 0 && !isDisabled.value)

/**
 * 判断某个值是否被选中
 * @param value 选项值
 * @returns 选中返回 true
 */
function isSelected(value: SrSelectValue): boolean {
  return selectedValues.value.includes(value)
}

/**
 * 计算面板位置
 * @returns {void}
 */
function updatePosition(): void {
  if (typeof window === 'undefined') return
  const trigger = triggerRef.value
  if (!trigger) return

  const result = srComputeFloating({
    reference: srGetRect(trigger),
    floating: {
      width: trigger.offsetWidth,
      height: panelRef.value?.offsetHeight ?? props.maxHeight,
    },
    placement: 'bottom-start',
    offset: 4,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    padding: 8,
  })

  position.value = { top: result.top, left: result.left, width: trigger.offsetWidth }
}

/**
 * 合并到下一帧重算，避免滚动时逐像素读布局
 * @returns {void}
 */
function scheduleUpdate(): void {
  if (typeof window === 'undefined' || frame) return
  frame = window.requestAnimationFrame(() => {
    frame = 0
    updatePosition()
  })
}

/**
 * 打开面板
 * @returns {Promise<void>}
 */
async function open(): Promise<void> {
  if (isDisabled.value || visible.value) return

  visible.value = true
  keyword.value = ''
  emit('visible-change', true)

  await nextTick()
  updatePosition()

  // 高亮定位到当前选中项；没有选中项时停在第一个可选项，
  // 这样键盘打开后直接回车即可选中，而不是先按一次方向键。
  const selectedIndex = filteredOptions.value.findIndex((option) => isSelected(option.value))
  activeIndex.value =
    selectedIndex >= 0 ? selectedIndex : filteredOptions.value.findIndex((option) => !option.disabled)

  if (props.filterable) searchRef.value?.focus()
}

/** 关闭面板 */
function close(): void {
  if (!visible.value) return
  visible.value = false
  keyword.value = ''
  activeIndex.value = -1
  emit('visible-change', false)
  formItem?.notify('blur')
}

/** 切换展开状态 */
function toggle(): void {
  if (visible.value) close()
  else void open()
}

/**
 * 选中某个选项
 * @param option 选项
 * @returns {void}
 */
function pick(option: SrSelectOption): void {
  if (option.disabled) return

  if (props.multiple) {
    const current = selectedValues.value
    const next = current.includes(option.value)
      ? current.filter((value) => value !== option.value)
      : [...current, option.value]

    setValue(next)
    emit('change', next)
    formItem?.notify('change')
    // 多选不关闭面板，允许连续选择
    keyword.value = ''
    return
  }

  setValue(option.value)
  emit('change', option.value)
  formItem?.notify('change')
  close()
}

/**
 * 移除多选中的一个标签
 * @param value 选项值
 * @returns {void}
 */
function removeTag(value: SrSelectValue): void {
  const next = selectedValues.value.filter((item) => item !== value)
  emit('update:modelValue', next)
  emit('change', next)
  formItem?.notify('change')
}

/** 清空全部选中 */
function clear(): void {
  const next = props.multiple ? [] : undefined
  emit('update:modelValue', next)
  emit('change', next)
  formItem?.notify('change')
}

/**
 * 键盘导航
 * @param event 键盘事件
 * @returns {void}
 */
function onKeydown(event: KeyboardEvent): void {
  if (isDisabled.value) return

  const key = event.key

  if (!visible.value) {
    if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
      event.preventDefault()
      void open()
    }
    return
  }

  const options = filteredOptions.value

  if (key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (key === 'Tab') {
    close()
    return
  }

  if (key === 'ArrowDown' || key === 'ArrowUp') {
    event.preventDefault()
    if (options.length === 0) return

    const step = key === 'ArrowDown' ? 1 : -1
    const start = activeIndex.value < 0 ? (step > 0 ? -1 : 0) : activeIndex.value
    let next = start + step

    // 跳过禁用项，首尾循环
    for (let guard = 0; guard < options.length; guard += 1) {
      if (next < 0) next = options.length - 1
      if (next >= options.length) next = 0
      if (!options[next].disabled) break
      next += step
    }

    activeIndex.value = next
    return
  }

  if (key === 'Enter') {
    event.preventDefault()
    const option = options[activeIndex.value]
    if (option) pick(option)
  }
}

/**
 * 点击外部关闭
 * @param event 鼠标事件
 * @returns {void}
 */
function onDocumentMousedown(event: MouseEvent): void {
  if (!visible.value) return
  const target = event.target as Node
  if (rootRef.value?.contains(target) || panelRef.value?.contains(target)) return
  close()
}

watch(keyword, (value) => {
  emit('search', value)
  activeIndex.value = filteredOptions.value.findIndex((option) => !option.disabled)
})

watch(filteredOptions, (options) => {
  if (!visible.value) return
  // 过滤后原索引可能越界，重置到第一个可选项
  if (activeIndex.value >= options.length) {
    activeIndex.value = options.findIndex((option) => !option.disabled)
  }
})

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMousedown)
  window.addEventListener('scroll', scheduleUpdate, true)
  window.addEventListener('resize', scheduleUpdate)
})

onScopeDispose(() => {
  document.removeEventListener('mousedown', onDocumentMousedown)
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', scheduleUpdate, true)
    window.removeEventListener('resize', scheduleUpdate)
  }
  if (frame) cancelAnimationFrame(frame)
})

/** 根 class */
const rootClass = computed(() => [
  `sr-select--${resolvedStatus.value}`,
  {
    'is-disabled': isDisabled,
    'is-open': visible.value,
    'is-multiple': props.multiple,
    'is-empty': selectedValues.value.length === 0,
  },
  attrs.class,
])

/** 根样式 */
const rootStyle = computed(() => ({ ...sizeVars.value, ...(attrs.style as Record<string, string>) }))

/** 面板样式 */
const panelStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  width: `${position.value.width}px`,
  maxHeight: `${props.maxHeight + (props.filterable ? 44 : 0)}px`,
  '--sr-select-z': String((config.value.zIndex || 1000) + 1003),
}))
</script>

<template>
  <div ref="rootRef" class="sr-select" :class="rootClass" :style="rootStyle">
    <div
      ref="triggerRef"
      class="sr-select__trigger"
      role="combobox"
      :aria-expanded="visible"
      :aria-controls="listId"
      aria-haspopup="listbox"
      :aria-disabled="disabled || undefined"
      :aria-labelledby="formItem?.labelId"
      :aria-describedby="resolvedStatus === 'error' ? formItem?.messageId : undefined"
      :aria-invalid="resolvedStatus === 'error' ? 'true' : undefined"
      :tabindex="disabled ? -1 : 0"
      v-bind="srOmit(attrs as Record<string, unknown>, ['class', 'style'])"
      @click="toggle"
      @keydown="onKeydown"
    >
      <div class="sr-select__values">
        <!-- 多选：标签列表 -->
        <template v-if="multiple">
          <sr-tag
            v-for="option in selectedOptions"
            :key="option.value"
            class="sr-select__tag"
            type="primary"
            size="sm"
            :closable="!disabled"
            @close="removeTag(option.value)"
          >
            {{ option.label }}
          </sr-tag>

          <span v-if="selectedOptions.length === 0" class="sr-select__placeholder">
            {{ placeholder }}
          </span>
        </template>

        <!-- 单选：单个文案 -->
        <template v-else>
          <span v-if="singleLabel" class="sr-select__single">{{ singleLabel }}</span>
          <span v-else class="sr-select__placeholder">{{ placeholder }}</span>
        </template>
      </div>

      <button
        v-if="showClear"
        class="sr-select__clear"
        type="button"
        tabindex="-1"
        aria-label="清空选择"
        @mousedown.prevent
        @click.stop="clear"
      >
        <sr-icon name="lucide:x" :size="14" />
      </button>

      <sr-icon class="sr-select__arrow" name="lucide:chevron-down" :size="16" />
    </div>

    <Teleport to="body">
      <Transition name="sr-zoom" :duration="{ enter: 140, leave: 110 }">
        <div
          v-show="visible"
          :id="listId"
          ref="panelRef"
          class="sr-select__panel"
          :style="panelStyle"
          role="listbox"
          :aria-multiselectable="multiple || undefined"
        >
          <div v-if="filterable" class="sr-select__search">
            <input
              ref="searchRef"
              v-model="keyword"
              class="sr-select__search-input"
              type="text"
              :placeholder="placeholder"
              @keydown="onKeydown"
            />
          </div>

          <ul class="sr-select__list">
            <li
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              class="sr-select__option"
              :class="{
                'is-selected': isSelected(option.value),
                'is-active': index === activeIndex,
                'is-disabled': option.disabled,
              }"
              role="option"
              :aria-selected="isSelected(option.value)"
              :aria-disabled="option.disabled || undefined"
              @mouseenter="activeIndex = option.disabled ? activeIndex : index"
              @click="pick(option)"
            >
              <span class="sr-select__option-label">
                <slot name="option" :option="option">{{ option.label }}</slot>
              </span>
            </li>
          </ul>

          <div v-if="filteredOptions.length === 0" class="sr-select__empty">
            {{ emptyText }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
