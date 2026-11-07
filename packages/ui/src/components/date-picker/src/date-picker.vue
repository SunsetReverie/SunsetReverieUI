<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { srComputeFloating, srGetRect } from '../../../utils/floating'
import {
  addMonths,
  endOfDay,
  formatDate,
  getMonthGrid,
  getWeekLabels,
  isInRange,
  isOutOfRange,
  isSameDay,
  MONTH_LABELS,
  startOfDay,
  toDate,
} from './date-utils'
import { datePickerProps, type SrDatePickerShortcut, type SrDatePickerValue } from './date-picker'

defineOptions({ name: 'SrDatePicker' })

const props = defineProps(datePickerProps)

const emit = defineEmits<{
  /** 值变化，配合 v-model */
  'update:modelValue': [value: SrDatePickerValue]
  /** 值变化（提交语义） */
  change: [value: SrDatePickerValue]
  /** 面板开合 */
  'visible-change': [visible: boolean]
}>()

/** 触发器 */
const triggerRef = ref<HTMLElement>()
/** 面板 */
const panelRef = ref<HTMLElement>()

/** 面板是否展开 */
const visible = ref(false)

/** 面板位置 */
const position = ref({ top: 0, left: 0 })

/** 是否区间模式 */
const isRange = computed(() => props.type === 'daterange' || props.type === 'datetimerange')

/** 是否带时间 */
const hasTime = computed(() => props.type === 'datetime' || props.type === 'datetimerange')

/** 显示格式 */
const displayFormat = computed(() => {
  if (props.format) return props.format
  return hasTime.value ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
})

/** 最小可选 */
const minDate = computed(() => toDate(props.min, displayFormat.value))

/** 最大可选 */
const maxDate = computed(() => toDate(props.max, displayFormat.value))

/** 已提交的值（Date 或 [Date, Date]） */
const inner = computed<SrDatePickerValue>(() => {
  const value = props.modelValue
  if (!value) return null
  if (Array.isArray(value)) {
    const [from, to] = value
    return [toDate(from, displayFormat.value) ?? new Date(), toDate(to, displayFormat.value) ?? new Date()]
  }
  return toDate(value, displayFormat.value)
})

/** 区间值（统一成 [Date, Date] 或 null） */
const rangeValue = computed<[Date, Date] | null>(() => {
  const value = inner.value
  return Array.isArray(value) ? value : null
})

/** 单值 */
const singleValue = computed<Date | null>(() => {
  const value = inner.value
  return value && !Array.isArray(value) ? value : null
})

/** 选择过程中的临时起点（区间模式下点了第一次） */
const pendingStart = ref<Date | null>(null)

/** 悬停的日期，用于预览区间高亮 */
const hoverDate = ref<Date | null>(null)

/** 左侧面板显示的月份 */
const leftMonth = ref(startOfMonth(singleValue.value ?? rangeValue.value?.[0] ?? new Date()))

/** 当前编辑的时间（区间时对应起点/终点） */
const timeTarget = ref(0)

/** 内部暂存的值：点「确定」才提交，date 类型点日期即提交 */
const draft = ref<SrDatePickerValue>(null)

/** 月份归一化到 1 号 */
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/** 面板样式 */
const panelStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
}))

/** 触发器里显示的文字 */
const displayText = computed(() => {
  const value = inner.value
  if (!value) return ''

  if (Array.isArray(value)) {
    const [from, to] = value
    return `${formatDate(from, displayFormat.value)} ~ ${formatDate(to, displayFormat.value)}`
  }

  return formatDate(value, displayFormat.value)
})

/** 占位文案 */
const placeholders = computed<[string, string]>(() => {
  const raw = props.placeholder
  if (Array.isArray(raw)) return [raw[0] ?? '', raw[1] ?? '']
  const text = raw || (hasTime.value ? '选择日期时间' : '选择日期')
  return isRange.value ? [`开始${text}`, `结束${text}`] : [text, text]
})

/** 需要渲染的月份面板 */
const panes = computed(() => {
  if (!isRange.value) return [leftMonth.value]
  return [leftMonth.value, addMonths(leftMonth.value, 1)]
})

/** 某个月的日历格子 */
function cellsOf(month: Date) {
  return getMonthGrid(month.getFullYear(), month.getMonth(), props.firstDayOfWeek)
}

/** 星期表头 */
const weekLabels = computed(() => getWeekLabels(props.firstDayOfWeek))

/** 内置快捷项 */
const builtinShortcuts = computed<SrDatePickerShortcut[]>(() => {
  const today = startOfDay(new Date())

  if (isRange.value) {
    return [
      { label: '今天', value: () => [today, endOfDay(today)] },
      { label: '近 7 天', value: () => [new Date(today.getTime() - 6 * 86400000), endOfDay(today)] },
      { label: '近 30 天', value: () => [new Date(today.getTime() - 29 * 86400000), endOfDay(today)] },
      {
        label: '本月',
        value: () => [new Date(today.getFullYear(), today.getMonth(), 1), endOfDay(today)],
      },
      {
        label: '上个月',
        value: () => [
          new Date(today.getFullYear(), today.getMonth() - 1, 1),
          endOfDay(new Date(today.getFullYear(), today.getMonth(), 0)),
        ],
      },
    ]
  }

  return [
    { label: '今天', value: () => today },
    { label: '昨天', value: () => new Date(today.getTime() - 86400000) },
    { label: '一周前', value: () => new Date(today.getTime() - 7 * 86400000) },
  ]
})

/** 实际使用的快捷项 */
const shortcuts = computed(() => props.shortcuts ?? builtinShortcuts.value)

/** 某个日期是否禁用 */
function isDisabled(date: Date): boolean {
  if (props.disabled || props.readonly) return true
  if (isOutOfRange(date, minDate.value, maxDate.value)) return true
  return props.disabledDate?.(date) ?? false
}

/** 是否选中（单值或区间端点） */
function isSelected(date: Date): boolean {
  if (isRange.value) {
    if (isSameDay(date, pendingStart.value)) return true
    return (
      !!rangeValue.value && (isSameDay(date, rangeValue.value[0]) || isSameDay(date, rangeValue.value[1]))
    )
  }
  return isSameDay(date, singleValue.value) || isSameDay(date, draft.value as Date | null)
}

/** 是否处于高亮区间内 */
function inRange(date: Date): boolean {
  if (!isRange.value) return false

  // 拖选过程中：起点 + 悬停点构成临时区间
  if (pendingStart.value && hoverDate.value) {
    return isInRange(date, [pendingStart.value, hoverDate.value])
  }

  return isInRange(date, rangeValue.value)
}

/** 是否今天 */
function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/** 重新计算面板位置 */
function updatePosition(): void {
  const trigger = triggerRef.value
  if (!trigger) return

  const result = srComputeFloating({
    reference: srGetRect(trigger),
    floating: { width: panelRef.value?.offsetWidth ?? 320, height: panelRef.value?.offsetHeight ?? 0 },
    placement: 'bottom-start',
    offset: 6,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    padding: 8,
  })

  position.value = { top: result.top, left: result.left }
}

/** 打开面板 */
async function open(): Promise<void> {
  if (props.disabled || props.readonly || visible.value) return

  visible.value = true
  draft.value = inner.value
  pendingStart.value = null
  timeTarget.value = 0

  // 面板渲染后才知道尺寸，位置要等一拍
  await nextTick()
  updatePosition()
  emit('visible-change', true)
}

/** 关闭面板 */
function close(): void {
  if (!visible.value) return
  visible.value = false
  pendingStart.value = null
  hoverDate.value = null
  emit('visible-change', false)
}

/** 切换 */
function toggle(): void {
  if (visible.value) close()
  else void open()

  if (props.disabled || props.readonly) return
}

/** 提交值 */
function commit(value: SrDatePickerValue): void {
  const output = formatOutput(value)
  emit('update:modelValue', output)
  emit('change', output)
}

/**
 * 按 valueFormat 转换输出
 * @param value 内部值
 * @returns 对外值
 */
function formatOutput(value: SrDatePickerValue): SrDatePickerValue {
  if (!props.valueFormat) return value
  if (!value) return null

  if (Array.isArray(value)) {
    return [
      formatDate(value[0], props.valueFormat) as unknown as Date,
      formatDate(value[1], props.valueFormat) as unknown as Date,
    ]
  }

  return formatDate(value, props.valueFormat) as unknown as Date
}

/** 合并日期与时间 */
function mergeTime(date: Date, source: Date | null): Date {
  const next = new Date(date)
  if (hasTime.value && source) {
    next.setHours(source.getHours(), source.getMinutes(), source.getSeconds())
  } else if (hasTime.value) {
    next.setHours(0, 0, 0, 0)
  }
  return next
}

/**
 * 点击某个日期
 * @param date 日期
 */
function pickDate(date: Date): void {
  if (isDisabled(date)) return

  if (!isRange.value) {
    const next = mergeTime(date, singleValue.value ?? (draft.value as Date | null))
    draft.value = next
    commit(next)
    close()
    return
  }

  // 区间模式：第一次点设起点，第二次点设终点
  if (!pendingStart.value) {
    pendingStart.value = date
    draft.value = [
      mergeTime(date, rangeValue.value?.[0] ?? null),
      mergeTime(date, rangeValue.value?.[1] ?? null),
    ]
    return
  }

  const start = pendingStart.value
  const end = date
  const ordered: [Date, Date] = start <= end ? [start, end] : [end, start]

  const from = mergeTime(startOfDay(ordered[0]), rangeValue.value?.[0] ?? null)
  const to = mergeTime(endOfDay(ordered[1]), rangeValue.value?.[1] ?? new Date(0))
  to.setHours(
    hasTime.value ? to.getHours() : 23,
    hasTime.value ? to.getMinutes() : 59,
    hasTime.value ? to.getSeconds() : 59,
  )

  draft.value = [from, to]
  pendingStart.value = null

  if (!hasTime.value) {
    commit([from, to])
    close()
  }
}

/** 应用快捷项 */
function applyShortcut(shortcut: SrDatePickerShortcut): void {
  const value = shortcut.value()

  if (Array.isArray(value)) {
    const fixed: [Date, Date] = [value[0], value[1]]
    leftMonth.value = startOfMonth(fixed[0])
    draft.value = fixed
    commit(fixed)
    pendingStart.value = null
  } else {
    leftMonth.value = startOfMonth(value)
    draft.value = value
    commit(value)
  }

  close()
}

/** 切换月份 */
function shiftMonth(step: number): void {
  leftMonth.value = addMonths(leftMonth.value, step)
}

/** 上一年 */
function shiftYear(step: number): void {
  leftMonth.value = addMonths(leftMonth.value, step * 12)
}

/** 当前编辑的时间值 */
const timeValue = computed<Date>(() => {
  const value = draft.value ?? inner.value
  if (!value) return new Date()

  if (Array.isArray(value)) return value[timeTarget.value] ?? value[0]
  return value
})

/**
 * 调整时间
 * @param unit 单位
 * @param delta 增量
 */
function stepTime(unit: 'hours' | 'minutes' | 'seconds', delta: number): void {
  const value = draft.value ?? inner.value
  if (!value) return

  const apply = (date: Date): Date => {
    const next = new Date(date)
    if (unit === 'hours') next.setHours(next.getHours() + delta)
    else if (unit === 'minutes') next.setMinutes(next.getMinutes() + delta)
    else next.setSeconds(next.getSeconds() + delta)
    return next
  }

  draft.value = Array.isArray(value) ? [apply(value[0]), apply(value[1])] : apply(value)
}

/** 确定（带时间时需要显式确认） */
function confirm(): void {
  if (draft.value) commit(draft.value)
  close()
}

/** 选今天 */
function pickToday(): void {
  const today = new Date()
  if (!isRange.value) {
    applyShortcut({ label: '今天', value: () => today })
    return
  }
  applyShortcut({ label: '今天', value: () => [startOfDay(today), endOfDay(today)] })
}

/** 清空 */
function clear(): void {
  emit('update:modelValue', null)
  emit('change', null)
}

/** 点外部关闭 */
function onDocumentPointerDown(event: PointerEvent): void {
  const target = event.target as Node | null
  if (!target) return
  if (triggerRef.value?.contains(target)) return
  if (panelRef.value?.contains(target)) return
  close()
}

/** 滚动或改变窗口时重算位置 */
function onViewportChange(): void {
  if (visible.value) updatePosition()
}

watch(visible, (value) => {
  if (typeof document === 'undefined') return

  if (value) {
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    window.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
    return
  }

  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('resize', onViewportChange)
})

// 外部值变化时同步面板月份，避免停在无关的月份
watch(
  () => props.modelValue,
  () => {
    const anchor = singleValue.value ?? rangeValue.value?.[0]
    if (anchor) leftMonth.value = startOfMonth(anchor)
  },
)

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('resize', onViewportChange)
})

defineExpose({ open, close, toggle })
</script>

<template>
  <div class="sr-date-picker" :class="{ 'is-disabled': disabled }">
    <div
      ref="triggerRef"
      class="sr-input sr-date-picker__trigger"
      :class="[
        size ? `sr-input--${size}` : '',
        {
          'is-disabled': disabled,
          'is-readonly': readonly,
          'is-active': visible,
          [`is-${status}`]: status !== 'default',
        },
      ]"
      role="combobox"
      :aria-expanded="visible"
      tabindex="0"
      @click="toggle"
      @keydown.enter.prevent="toggle"
    >
      <span v-if="!displayText" class="sr-date-picker__placeholder">
        {{ placeholders[0] }}
        <template v-if="isRange"> ~ {{ placeholders[1] }}</template>
      </span>
      <span v-else class="sr-date-picker__value">{{ displayText }}</span>

      <button
        v-if="clearable && displayText && !disabled"
        class="sr-date-picker__clear"
        type="button"
        aria-label="清空"
        @click.stop="clear"
      >
        <SrIcon name="lucide:x" :size="12" />
      </button>

      <SrIcon class="sr-date-picker__icon" name="lucide:calendar" :size="14" />
    </div>

    <Teleport to="body">
      <div
        v-if="visible"
        ref="panelRef"
        class="sr-date-picker__panel"
        :class="{ 'is-range': isRange }"
        :style="panelStyle"
      >
        <!-- 快捷区 -->
        <div v-if="showShortcuts && shortcuts.length" class="sr-date-picker__shortcuts">
          <button
            v-for="item in shortcuts"
            :key="item.label"
            class="sr-date-picker__shortcut"
            type="button"
            @click="applyShortcut(item)"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="sr-date-picker__main">
          <!-- 日历 -->
          <div class="sr-date-picker__calendars">
            <div v-for="(month, index) in panes" :key="index" class="sr-date-picker__calendar">
              <div class="sr-date-picker__head">
                <button
                  v-if="index === 0"
                  class="sr-date-picker__nav"
                  type="button"
                  aria-label="上一年"
                  @click="shiftYear(-1)"
                >
                  <SrIcon name="lucide:chevron-left" :size="14" />
                </button>
                <button
                  v-if="index === 0"
                  class="sr-date-picker__nav"
                  type="button"
                  aria-label="上个月"
                  @click="shiftMonth(-1)"
                >
                  <SrIcon name="lucide:chevron-up" :size="14" />
                </button>

                <span class="sr-date-picker__title">
                  {{ month.getFullYear() }} 年 {{ MONTH_LABELS[month.getMonth()] }}
                </span>

                <button class="sr-date-picker__nav" type="button" aria-label="下个月" @click="shiftMonth(1)">
                  <SrIcon name="lucide:chevron-down" :size="14" />
                </button>
                <button
                  v-if="isRange && index === 1"
                  class="sr-date-picker__nav"
                  type="button"
                  aria-label="下一年"
                  @click="shiftYear(1)"
                >
                  <SrIcon name="lucide:chevron-right" :size="14" />
                </button>
              </div>

              <div class="sr-date-picker__weekdays">
                <span v-for="label in weekLabels" :key="label">{{ label }}</span>
              </div>

              <div class="sr-date-picker__days">
                <button
                  v-for="cell in cellsOf(month)"
                  :key="cell.date.getTime()"
                  class="sr-date-picker__day"
                  :class="{
                    'is-out': !cell.inMonth,
                    'is-today': isToday(cell.date),
                    'is-selected': isSelected(cell.date),
                    'is-in-range': inRange(cell.date),
                    'is-disabled': isDisabled(cell.date),
                  }"
                  type="button"
                  :disabled="isDisabled(cell.date)"
                  @click="pickDate(cell.date)"
                  @mouseenter="hoverDate = cell.date"
                >
                  {{ cell.date.getDate() }}
                </button>
              </div>
            </div>
          </div>

          <!-- 时间 -->
          <div v-if="hasTime" class="sr-date-picker__time">
            <div v-if="isRange" class="sr-date-picker__time-tabs">
              <button
                v-for="(label, index) in ['开始', '结束']"
                :key="label"
                class="sr-date-picker__time-tab"
                :class="{ 'is-active': timeTarget === index }"
                type="button"
                @click="timeTarget = index"
              >
                {{ label }}
              </button>
            </div>

            <div class="sr-date-picker__time-row">
              <span class="sr-date-picker__time-label">时</span>
              <button class="sr-date-picker__step" type="button" @click="stepTime('hours', -1)">−</button>
              <span class="sr-date-picker__time-value">{{
                String(timeValue.getHours()).padStart(2, '0')
              }}</span>
              <button class="sr-date-picker__step" type="button" @click="stepTime('hours', 1)">+</button>
            </div>

            <div class="sr-date-picker__time-row">
              <span class="sr-date-picker__time-label">分</span>
              <button class="sr-date-picker__step" type="button" @click="stepTime('minutes', -1)">−</button>
              <span class="sr-date-picker__time-value">{{
                String(timeValue.getMinutes()).padStart(2, '0')
              }}</span>
              <button class="sr-date-picker__step" type="button" @click="stepTime('minutes', 1)">+</button>
            </div>

            <div class="sr-date-picker__time-row">
              <span class="sr-date-picker__time-label">秒</span>
              <button class="sr-date-picker__step" type="button" @click="stepTime('seconds', -1)">−</button>
              <span class="sr-date-picker__time-value">{{
                String(timeValue.getSeconds()).padStart(2, '0')
              }}</span>
              <button class="sr-date-picker__step" type="button" @click="stepTime('seconds', 1)">+</button>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="sr-date-picker__footer">
          <button class="sr-date-picker__link" type="button" @click="pickToday">今天</button>

          <span v-if="isRange && pendingStart" class="sr-date-picker__hint">请选择结束日期</span>

          <span class="sr-date-picker__spacer" />

          <button
            class="sr-date-picker__link"
            type="button"
            @click="
              clear()
              close()
            "
          >
            清空
          </button>
          <button class="sr-date-picker__confirm" type="button" @click="confirm">确定</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
