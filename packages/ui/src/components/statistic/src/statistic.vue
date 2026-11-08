<script setup lang="ts">
import { computed } from 'vue'

import { statisticProps } from './statistic'

defineOptions({ name: 'SrStatistic', inheritAttrs: false })

const props = defineProps(statisticProps)

/**
 * 按精度四舍五入
 * @param value 原值
 * @param precision 小数位
 * @returns 定长小数字符串
 */
function withPrecision(value: number, precision: number): string {
  if (precision <= 0) return String(Math.round(value))
  return value.toFixed(precision)
}

/**
 * 整数部分加千分位
 * @param text 数字文本
 * @param separator 分隔符
 * @returns 分组后的文本
 */
function group(text: string, separator: string): string {
  if (!separator) return text

  const negative = text.startsWith('-')
  const body = negative ? text.slice(1) : text
  const [integer, decimal] = body.split('.')

  const grouped = (integer ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, separator)

  const result = decimal === undefined ? grouped : `${grouped}.${decimal}`
  return negative ? `-${result}` : result
}

/** 最终显示的数字文本 */
const display = computed(() => {
  if (props.formatter) return props.formatter(props.value)

  const text = withPrecision(props.value, Math.max(0, props.precision))
  return group(text, props.separator)
})

/** 数值样式 */
const valueStyle = computed(() => (props.valueColor ? { color: props.valueColor } : undefined))
</script>

<template>
  <div class="sr-statistic">
    <p v-if="title || $slots.title" class="sr-statistic__title">
      <slot name="title">{{ title }}</slot>
    </p>

    <div class="sr-statistic__value" :style="valueStyle">
      <span v-if="loading" class="sr-statistic__skeleton" aria-hidden="true" />
      <template v-else>
        <span v-if="prefix || $slots.prefix" class="sr-statistic__affix">
          <slot name="prefix">{{ prefix }}</slot>
        </span>
        <span class="sr-statistic__number">{{ display }}</span>
        <span v-if="suffix || $slots.suffix" class="sr-statistic__affix">
          <slot name="suffix">{{ suffix }}</slot>
        </span>
      </template>
    </div>
  </div>
</template>
