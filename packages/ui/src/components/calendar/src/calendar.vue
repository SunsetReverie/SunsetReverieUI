<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import {
  addMonths,
  formatDate,
  getMonthGrid,
  getWeekLabels,
  isOutOfRange,
  isSameDay,
  parseDate,
} from '../../date-picker/src/date-utils'
import SrIcon from '../../icon/src/icon.vue'
import { calendarProps } from './calendar'

defineOptions({ name: 'SrCalendar', inheritAttrs: false })

const props = defineProps(calendarProps)

const emit = defineEmits<{
  /** 选中日期 */
  'update:modelValue': [value: string]
  /** 选中日期 */
  change: [value: string]
  /** 切换月份 */
  'month-change': [year: number, month: number]
}>()

/** 当前显示的月份（该月 1 号） */
const viewDate = ref(new Date())

/** 今日，用于「今天」高亮 */
const today = new Date()

/** 当前选中的日期 */
const selected = computed(() => parseDate(props.modelValue))

/** 最小 / 最大日期 */
const minDate = computed(() => parseDate(props.min))
const maxDate = computed(() => parseDate(props.max))

/** 星期表头 */
const weekLabels = computed(() => getWeekLabels(props.firstDayOfWeek))

/** 6×7 的月历网格 */
const cells = computed(() =>
  getMonthGrid(viewDate.value.getFullYear(), viewDate.value.getMonth(), props.firstDayOfWeek),
)

/** 标题文案 */
const title = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth() + 1

  return `${year} 年 ${month} 月`
})

/** 标记日期集合 */
const markSet = computed(() => new Set(props.marks))

/**
 * 切到上一月
 */
function prevMonth(): void {
  viewDate.value = addMonths(viewDate.value, -1)
}

/**
 * 切到下一月
 */
function nextMonth(): void {
  viewDate.value = addMonths(viewDate.value, 1)
}

/**
 * 回到今天所在月份
 */
function goToday(): void {
  viewDate.value = new Date()
}

/**
 * 点某一格
 * @param date 日期
 * @param disabled 是否禁用
 */
function pick(date: Date, disabled: boolean): void {
  if (disabled) return

  const value = formatDate(date, 'YYYY-MM-DD')
  emit('update:modelValue', value)
  emit('change', value)
}

/**
 * 某一格是否禁用
 * @param date 日期
 * @returns 是否禁用
 */
function isDisabled(date: Date): boolean {
  return isOutOfRange(date, minDate.value, maxDate.value)
}

// 选中值变化时把视图同步到那个月
watch(
  () => props.modelValue,
  (value) => {
    const date = parseDate(value)
    if (date) viewDate.value = date
  },
  { immediate: true },
)

watch(viewDate, (date) => {
  emit('month-change', date.getFullYear(), date.getMonth() + 1)
})
</script>

<template>
  <div class="sr-calendar">
    <div class="sr-calendar__header">
      <!-- 翻月按钮成组放在左侧，标题才能始终居中 -->
      <div class="sr-calendar__nav-group">
        <button class="sr-calendar__nav" type="button" aria-label="上一月" @click="prevMonth">
          <SrIcon name="lucide:chevron-left" :size="15" />
        </button>

        <button class="sr-calendar__nav" type="button" aria-label="下一月" @click="nextMonth">
          <SrIcon name="lucide:chevron-right" :size="15" />
        </button>
      </div>

      <span class="sr-calendar__title">{{ title }}</span>

      <button
        v-if="showToday"
        class="sr-calendar__today"
        type="button"
        aria-label="回到今天"
        @click="goToday"
      >
        今天
      </button>
    </div>

    <div class="sr-calendar__week">
      <span v-for="label in weekLabels" :key="label" class="sr-calendar__weekday">{{ label }}</span>
    </div>

    <div class="sr-calendar__grid">
      <button
        v-for="cell in cells"
        :key="cell.date.toISOString()"
        class="sr-calendar__cell"
        :class="{
          'is-out': !cell.inMonth,
          'is-today': isSameDay(cell.date, today),
          'is-selected': isSameDay(cell.date, selected),
          'is-disabled': isDisabled(cell.date),
          'is-marked': markSet.has(formatDate(cell.date, 'YYYY-MM-DD')),
        }"
        type="button"
        :style="{ height: `${cellHeight}px` }"
        :disabled="isDisabled(cell.date)"
        @click="pick(cell.date, isDisabled(cell.date))"
      >
        <span class="sr-calendar__day">{{ cell.date.getDate() }}</span>
      </button>
    </div>
  </div>
</template>
