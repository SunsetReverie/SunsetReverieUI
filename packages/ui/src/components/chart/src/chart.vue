<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { chartProps, type SrChartTooltipItem } from './chart'
import { arcPath, areaPath, clamp, formatTick, linePath, niceTicks, type ChartPoint } from './chart-utils'

defineOptions({ name: 'SrChart' })

const props = defineProps(chartProps)

/** 画布四周留白：左侧放 y 轴刻度，底部放 x 轴标签 */
const PADDING = { top: 16, right: 16, bottom: 28, left: 44 }

/** 默认调色板：全部走主题变量，换肤时图表跟着变 */
const DEFAULT_COLORS = [
  'var(--sr-color-primary)',
  'var(--sr-color-success)',
  'var(--sr-color-warning)',
  'var(--sr-color-danger)',
  'var(--sr-color-info)',
  'var(--sr-color-primary-active)',
]

/** 容器宽度：SSR 首帧固定 600，挂载后用 ResizeObserver 跟随容器 */
const width = ref(600)
const rootRef = ref<HTMLElement | null>(null)
let observer: ResizeObserver | null = null

/** tooltip 状态 */
interface TooltipState {
  /** 相对容器的横坐标 */
  x: number
  /** 相对容器的纵坐标 */
  y: number
  /** 标题（分类名或扇区名） */
  title: string
  /** 数据行 */
  items: SrChartTooltipItem[]
}

const tooltip = ref<TooltipState | null>(null)

/** 实际使用的调色板 */
const palette = computed(() => (props.colors && props.colors.length > 0 ? props.colors : DEFAULT_COLORS))

/** 取某个系列的颜色 */
function colorAt(index: number): string {
  return palette.value[index % palette.value.length]
}

/** 是否饼图 */
const isPie = computed(() => props.type === 'pie')

/** 绘图区宽高 */
const innerW = computed(() => Math.max(0, width.value - PADDING.left - PADDING.right))
const innerH = computed(() => Math.max(0, props.height - PADDING.top - PADDING.bottom))

/** x 轴基线纵坐标 */
const baseline = computed(() => PADDING.top + innerH.value)

/** 数据点数量：分类与各系列长度取最大 */
const count = computed(() => {
  if (isPie.value) return props.series[0]?.data.length ?? 0
  return Math.max(props.categories.length, ...props.series.map((item) => item.data.length), 0)
})

/** 是否没有可画的数据 */
const isEmpty = computed(() => count.value === 0 || props.series.every((item) => item.data.length === 0))

/** 折线/面积每个点的横向间距 */
const stepX = computed(() => (count.value > 1 ? innerW.value / (count.value - 1) : innerW.value))

/**
 * 第 index 个数据点的横坐标
 * @param index 数据点下标
 * @returns 画布横坐标
 */
function xAt(index: number): number {
  if (count.value <= 1) return PADDING.left + innerW.value / 2
  return PADDING.left + index * stepX.value
}

/** 柱状图每个分类占用的宽度 */
const bandWidth = computed(() => innerW.value / Math.max(1, count.value))

/** 堆叠时每个分类的累计值 */
const stackSums = computed(() => {
  const sums = Array.from({ length: count.value }, () => 0)
  for (const item of props.series) {
    item.data.forEach((value, index) => {
      if (index < sums.length) sums[index] += value
    })
  }
  return sums
})

/** y 轴最大值（堆叠时按累计值取） */
const maxValue = computed(() => {
  if (isPie.value) return 0
  if (props.stacked) return Math.max(0, ...stackSums.value)
  const values = props.series.flatMap((item) => item.data)
  return Math.max(0, ...values)
})

/** y 轴刻度值 */
const yTicks = computed(() => niceTicks(maxValue.value))

/** y 轴刻度上限（用于把数据映射到像素） */
const yMax = computed(() => yTicks.value[yTicks.value.length - 1] || 1)

/**
 * 数值转纵坐标
 * @param value 数据值
 * @returns 画布纵坐标
 */
function yAt(value: number): number {
  return PADDING.top + innerH.value - (value / yMax.value) * innerH.value
}

/** 一条折线（或面积）的渲染数据 */
interface SeriesView {
  /** 系列名 */
  name: string
  /** 颜色 */
  color: string
  /** 折线路径 */
  d: string
  /** 面积路径（仅面积图有值） */
  area: string
  /** 原始点，用于画拐点 */
  points: ChartPoint[]
}

/** 折线与面积图的系列视图 */
const seriesViews = computed<SeriesView[]>(() => {
  if (props.type !== 'line' && props.type !== 'area') return []
  return props.series.map((item, seriesIndex) => {
    const points = item.data.map((value, index) => ({ x: xAt(index), y: yAt(value) }))
    return {
      name: item.name,
      color: item.color ?? colorAt(seriesIndex),
      d: linePath(points, props.smooth),
      area: areaPath(points, baseline.value, props.smooth),
      points,
    }
  })
})

/** 折线图要画的线（面积图不重复画线，由折线描边即可） */
const lineSeries = computed(() => (props.type === 'line' ? seriesViews.value : []))

/** 面积图要填充的区域 */
const areaSeries = computed(() => (props.type === 'area' ? seriesViews.value : []))

/** 拐点是否显示：点太多时不画，避免糊成一片 */
const showDots = computed(() => count.value > 0 && count.value <= 31)

/** 拐点：把所有系列的点展平，便于模板里一次遍历 */
const dots = computed(() =>
  showDots.value
    ? seriesViews.value.flatMap((item, seriesIndex) =>
        item.points.map((point, index) => ({
          x: point.x,
          y: point.y,
          color: item.color,
          key: `${seriesIndex}-${index}`,
        })),
      )
    : [],
)

/** 一根柱子的渲染数据 */
interface BarView {
  /** 左上角横坐标 */
  x: number
  /** 顶部纵坐标 */
  y: number
  /** 宽度 */
  w: number
  /** 高度 */
  h: number
  /** 颜色 */
  color: string
}

/** 柱状图的柱子 */
const bars = computed<BarView[]>(() => {
  if (props.type !== 'bar') return []

  const band = bandWidth.value
  const groupWidth = band * 0.6
  const seriesCount = Math.max(1, props.series.length)
  const barWidth = props.stacked ? groupWidth : groupWidth / seriesCount
  const accumulated = Array.from({ length: count.value }, () => 0)
  const result: BarView[] = []

  props.series.forEach((item, seriesIndex) => {
    item.data.forEach((value, index) => {
      const base = props.stacked ? (accumulated[index] ?? 0) : 0
      const top = yAt(base + value)
      const bottom = yAt(base)
      const offset = props.stacked ? 0 : seriesIndex * barWidth
      result.push({
        x: PADDING.left + index * band + (band - groupWidth) / 2 + offset,
        y: top,
        w: barWidth,
        h: Math.max(0, bottom - top),
        color: item.color ?? colorAt(seriesIndex),
      })
      if (props.stacked) accumulated[index] = base + value
    })
  })

  return result
})

/** 一片扇区的渲染数据 */
interface SliceView {
  /** 扇区名 */
  name: string
  /** 数值 */
  value: number
  /** 占比 0-1 */
  percent: number
  /** 颜色 */
  color: string
  /** 路径 */
  d: string
}

/** 饼图 / 环形图的扇区 */
const pieSlices = computed<SliceView[]>(() => {
  if (!isPie.value) return []

  const data = props.series[0]?.data ?? []
  const total = data.reduce((sum, value) => sum + Math.max(0, value), 0)
  const cx = width.value / 2
  const cy = PADDING.top + innerH.value / 2
  const outer = Math.max(0, Math.min(innerW.value, innerH.value) / 2 - 8)
  const inner = outer * clamp(props.innerRadius, 0, 0.9)

  let accumulated = 0
  return data.map((raw, index) => {
    const value = Math.max(0, raw)
    const start = total > 0 ? (accumulated / total) * Math.PI * 2 : 0
    accumulated += value
    const end = total > 0 ? (accumulated / total) * Math.PI * 2 : 0

    // 只有一个扇区（或某一项占满）时，起止点重合，单段弧画不出来，改走整圆路径
    const isFull = total > 0 && end - start >= Math.PI * 2 - 1e-6
    const d = isFull ? fullCirclePath(cx, cy, outer, inner) : arcPath(cx, cy, outer, inner, start, end)

    return {
      name: props.categories[index] ?? `#${index + 1}`,
      value,
      percent: total > 0 ? value / total : 0,
      color: colorAt(index),
      d,
    }
  })
})

/**
 * 画一个整圆（环形时挖空中间）
 * @param cx 圆心横坐标
 * @param cy 圆心纵坐标
 * @param outer 外半径
 * @param inner 内半径，0 为实心
 * @returns SVG 路径
 */
function fullCirclePath(cx: number, cy: number, outer: number, inner: number): string {
  const top = cy - outer
  const bottom = cy + outer
  const outerRing = `M ${cx} ${top} A ${outer} ${outer} 0 1 1 ${cx} ${bottom} A ${outer} ${outer} 0 1 1 ${cx} ${top} Z`
  if (inner <= 0) return outerRing

  const innerTop = cy - inner
  const innerBottom = cy + inner
  // 内圈反向绘制，配合默认的 nonzero 填充规则形成挖空
  return `${outerRing} M ${cx} ${innerTop} A ${inner} ${inner} 0 1 0 ${cx} ${innerBottom} A ${inner} ${inner} 0 1 0 ${cx} ${innerTop} Z`
}

/** x 轴标签：点太多时按间隔抽样，避免文字重叠 */
const xLabels = computed(() => {
  if (isPie.value) return []
  const maxLabels = Math.max(2, Math.floor(innerW.value / 64))
  const step = Math.ceil(count.value / maxLabels)
  return props.categories.map((label, index) => ({ label, index })).filter((item) => item.index % step === 0)
})

/** 图例项 */
const legend = computed(() => {
  if (isPie.value) return pieSlices.value.map((item) => ({ name: item.name, color: item.color }))
  return props.series.map((item, index) => ({
    name: item.name,
    color: item.color ?? colorAt(index),
  }))
})

/** 无障碍描述 */
const ariaLabel = computed(() => {
  const typeName = { line: '折线图', bar: '柱状图', area: '面积图', pie: '饼图' }[props.type]
  return `${typeName}，${props.series.map((item) => item.name).join('、')}，共 ${count.value} 个数据点`
})

/**
 * 把鼠标位置换算成相对画布的坐标
 * @param event 鼠标事件
 * @returns 相对容器的 x / y
 */
function pointerOf(event: MouseEvent): { x: number; y: number } {
  const target = event.currentTarget as Element
  const rect = target.getBoundingClientRect()
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

/**
 * 悬停：折线/柱状按最近的 x 定位分类，显示该分类下全部系列
 * @param event 鼠标事件
 */
function handleMove(event: MouseEvent): void {
  if (!props.showTooltip || isPie.value || isEmpty.value || count.value === 0) return

  const { x, y } = pointerOf(event)
  const index =
    props.type === 'bar'
      ? clamp(Math.floor((x - PADDING.left) / bandWidth.value), 0, count.value - 1)
      : clamp(Math.round((x - PADDING.left) / (stepX.value || 1)), 0, count.value - 1)

  tooltip.value = {
    x: clamp(x, 64, Math.max(64, width.value - 64)),
    y: Math.max(24, y - 12),
    title: props.categories[index] ?? `#${index + 1}`,
    items: props.series.map((item, seriesIndex) => ({
      name: item.name,
      value: item.data[index] ?? 0,
      color: item.color ?? colorAt(seriesIndex),
    })),
  }
}

/**
 * 悬停扇区：显示数值与占比
 * @param event 鼠标事件
 * @param slice 扇区数据
 */
function handleSliceMove(event: MouseEvent, slice: SliceView): void {
  if (!props.showTooltip) return

  const { x, y } = pointerOf(event)
  tooltip.value = {
    x: clamp(x, 64, Math.max(64, width.value - 64)),
    y: Math.max(24, y - 12),
    title: slice.name,
    items: [
      {
        name: `${(slice.percent * 100).toFixed(1)}%`,
        value: slice.value,
        color: slice.color,
      },
    ],
  }
}

/** 清掉悬停提示 */
function clearTooltip(): void {
  tooltip.value = null
}

onMounted(() => {
  const element = rootRef.value
  if (!element) return

  width.value = Math.max(240, element.clientWidth || 600)

  // ResizeObserver 让 SVG 像素宽度与容器一致，文字不会被缩放拉变形
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width
      if (next) width.value = Math.max(240, Math.round(next))
    })
    observer.observe(element)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div ref="rootRef" class="sr-chart">
    <div class="sr-chart__canvas" :style="{ height: `${props.height}px` }">
      <svg
        class="sr-chart__svg"
        :width="width"
        :height="props.height"
        :viewBox="`0 0 ${width} ${props.height}`"
        role="img"
        :aria-label="ariaLabel"
        @mousemove="handleMove"
        @mouseleave="clearTooltip"
      >
        <template v-if="!isEmpty && !isPie">
          <!-- 网格与 y 轴刻度 -->
          <g v-if="props.showGrid" class="sr-chart__grid">
            <line
              v-for="tick in yTicks"
              :key="`grid-${tick}`"
              class="sr-chart__grid-line"
              :x1="PADDING.left"
              :x2="width - PADDING.right"
              :y1="yAt(tick)"
              :y2="yAt(tick)"
            />
          </g>
          <g class="sr-chart__axis">
            <text
              v-for="tick in yTicks"
              :key="`tick-${tick}`"
              class="sr-chart__tick"
              :x="PADDING.left - 8"
              :y="yAt(tick) + 4"
              text-anchor="end"
            >
              {{ formatTick(tick) }}
            </text>
            <text
              v-for="item in xLabels"
              :key="`label-${item.index}`"
              class="sr-chart__tick"
              :x="xAt(item.index)"
              :y="props.height - 8"
              text-anchor="middle"
            >
              {{ item.label }}
            </text>
          </g>

          <!-- 面积 -->
          <path
            v-for="item in areaSeries"
            :key="`area-${item.name}`"
            class="sr-chart__area"
            :d="item.area"
            :fill="item.color"
          />

          <!-- 柱 -->
          <rect
            v-for="(bar, index) in bars"
            :key="`bar-${index}`"
            class="sr-chart__bar"
            :x="bar.x"
            :y="bar.y"
            :width="bar.w"
            :height="bar.h"
            :fill="bar.color"
            rx="3"
          />

          <!-- 折线 -->
          <path
            v-for="item in lineSeries"
            :key="`line-${item.name}`"
            class="sr-chart__line"
            :d="item.d"
            :stroke="item.color"
          />

          <!-- 拐点 -->
          <circle
            v-for="dot in dots"
            :key="`dot-${dot.key}`"
            class="sr-chart__dot"
            :cx="dot.x"
            :cy="dot.y"
            r="3"
            :fill="dot.color"
          />
        </template>

        <!-- 饼图扇区 -->
        <template v-else-if="!isEmpty && isPie">
          <path
            v-for="slice in pieSlices"
            :key="`slice-${slice.name}`"
            class="sr-chart__slice"
            :d="slice.d"
            :fill="slice.color"
            @mousemove.stop="handleSliceMove($event, slice)"
            @mouseleave="clearTooltip"
          />
        </template>

        <!-- 悬停参考线 -->
        <line
          v-if="tooltip && !isPie"
          class="sr-chart__cursor"
          :x1="tooltip.x"
          :x2="tooltip.x"
          :y1="PADDING.top"
          :y2="baseline"
        />
      </svg>

      <div
        v-if="tooltip"
        class="sr-chart__tooltip"
        :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
      >
        <div class="sr-chart__tooltip-title">{{ tooltip.title }}</div>
        <div v-for="item in tooltip.items" :key="item.name" class="sr-chart__tooltip-row">
          <i class="sr-chart__swatch" :style="{ background: item.color }"></i>
          <span class="sr-chart__tooltip-name">{{ item.name }}</span>
          <span class="sr-chart__tooltip-value">{{ item.value }}</span>
        </div>
      </div>

      <div v-if="isEmpty" class="sr-chart__empty">{{ props.emptyText }}</div>
    </div>

    <div v-if="props.showLegend && !isEmpty" class="sr-chart__legend">
      <span v-for="item in legend" :key="item.name" class="sr-chart__legend-item">
        <i class="sr-chart__swatch" :style="{ background: item.color }"></i>
        {{ item.name }}
      </span>
    </div>
  </div>
</template>
