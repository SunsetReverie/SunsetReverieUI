<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { chinaMapProps } from './china-map'
import {
  boundsOf,
  bubbleRadius,
  createProjection,
  gradeIndex,
  normalizeName,
  regionPath,
  SOUTH_SEA_ADCODE,
  type ChinaMapGeo,
  type ProjectedRegion,
} from './china-map-utils'
import { CHINA_PROVINCES } from '../data/china-provinces'

defineOptions({ name: 'SrChinaMap' })

const props = defineProps(chinaMapProps)

const emit = defineEmits<{
  /** 选中省份；点空白处为 null */
  select: [payload: { name: string; value: number } | null]
}>()

/** 画布内边距 */
const PADDING = 12

/** 分级填色的透明度档位（5 档） */
const FILL_STEPS = [0.16, 0.32, 0.48, 0.64, 0.82]

/** 无数据省份的底色透明度 */
const EMPTY_FILL = 0.08

/** 容器宽度：SSR 首帧 640，挂载后跟随容器 */
const width = ref(640)
const rootRef = ref<HTMLElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
let observer: ResizeObserver | null = null

/** 当前悬停的省份名 */
const hoverName = ref('')

/** tooltip 状态 */
interface TooltipState {
  /** 相对画布的横坐标 */
  x: number
  /** 相对画布的纵坐标 */
  y: number
  /** 省名 */
  name: string
  /** 数值，无数据为 null */
  value: number | null
}

const tooltip = ref<TooltipState | null>(null)

/** 主图区域（排除南海诸岛，否则南海会把整体取景压扁） */
const mainRegions = computed(() => CHINA_PROVINCES.filter((item) => item.adcode !== SOUTH_SEA_ADCODE))

/** 省名 → 数值，重复名累加 */
const valueMap = computed(() => {
  const map = new Map<string, number>()
  for (const item of props.data) {
    const key = normalizeName(item.name)
    if (!key) continue
    map.set(key, (map.get(key) ?? 0) + item.value)
  }
  return map
})

/** 有数据的省份数量 */
const dataCount = computed(() => valueMap.value.size)

/** 是否没有任何数据 */
const isEmpty = computed(() => dataCount.value === 0)

/** 数值范围 */
const valueRange = computed(() => {
  const values = [...valueMap.value.values()].filter((value) => Number.isFinite(value))
  if (values.length === 0) return { min: 0, max: 0 }
  return { min: Math.min(...values), max: Math.max(...values) }
})

/** 主图投影 */
const projection = computed(() => {
  const bounds = boundsOf(mainRegions.value)
  if (!bounds) return null
  return createProjection(bounds, {
    width: width.value,
    height: props.height,
    padding: PADDING,
  })
})

/**
 * 估算省份面积（经纬度包围盒），用于标签避让时优先保留大省
 * @param region 区域数据
 * @returns 面积（平方度）
 */
function areaOf(region: ChinaMapGeo): number {
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const polygon of region.rings) {
    for (const ring of polygon) {
      for (const [lng, lat] of ring) {
        if (lng < minX) minX = lng
        if (lng > maxX) maxX = lng
        if (lat < minY) minY = lat
        if (lat > maxY) maxY = lat
      }
    }
  }
  return Math.max(0, maxX - minX) * Math.max(0, maxY - minY)
}

/** 投影后的省份路径与标注锚点 */
const regions = computed<ProjectedRegion[]>(() => {
  const project = projection.value
  if (!project) return []

  return mainRegions.value.map((region) => ({
    name: region.name,
    adcode: region.adcode,
    d: regionPath(region, project),
    center: project(region.center[0], region.center[1]),
  }))
})

/** 南海诸岛小图：独立取景，画在右下角 */
const southSea = computed(() => {
  const feature = CHINA_PROVINCES.find((item) => item.adcode === SOUTH_SEA_ADCODE)
  if (!feature) return null

  const bounds = boundsOf([feature])
  if (!bounds) return null

  const insetW = Math.max(70, Math.min(140, width.value * 0.18))
  const insetH = Math.max(90, Math.min(180, props.height * 0.26))
  const x = width.value - insetW - 8
  const y = props.height - insetH - 8

  const project = createProjection(bounds, { width: insetW, height: insetH, padding: 6 })
  const d = regionPath(feature, (lng, lat) => {
    const [px, py] = project(lng, lat)
    return [px + x, py + y]
  })

  return { d, x, y, width: insetW, height: insetH }
})

/** 气泡（仅 bubble 模式） */
const bubbles = computed(() => {
  if (props.mode !== 'bubble') return []

  const max = valueRange.value.max
  return regions.value
    .map((region) => {
      const value = valueMap.value.get(region.name) ?? 0
      if (value <= 0) return null
      return {
        name: region.name,
        value,
        x: region.center[0],
        y: region.center[1],
        r: bubbleRadius(value, max, props.maxRadius),
      }
    })
    .filter((item): item is { name: string; value: number; x: number; y: number; r: number } => item !== null)
})

/** 省份标签：按面积从大到小放置，重叠的跳过 */
const labels = computed(() => {
  if (!props.showLabel) return []

  const items = mainRegions.value
    .map((region) => ({ name: region.name, area: areaOf(region) }))
    .sort((left, right) => right.area - left.area)

  const centerMap = new Map(regions.value.map((region) => [region.name, region.center]))
  const placed: { x1: number; y1: number; x2: number; y2: number }[] = []
  const result: { name: string; x: number; y: number }[] = []

  for (const item of items) {
    const center = centerMap.get(item.name)
    if (!center) continue

    // 标签宽度按字数估算，中文按 11px 一个字
    const halfW = (item.name.length * 11) / 2 + 2
    const halfH = 7
    const rect = {
      x1: center[0] - halfW,
      y1: center[1] - halfH,
      x2: center[0] + halfW,
      y2: center[1] + halfH,
    }

    const overlap = placed.some(
      (other) => !(rect.x2 < other.x1 || rect.x1 > other.x2 || rect.y2 < other.y1 || rect.y1 > other.y2),
    )
    if (overlap) continue

    placed.push(rect)
    result.push({ name: item.name, x: center[0], y: center[1] })
  }

  return result
})

/** 图例档位（色阶模式的 5 段，气泡模式用最大最小值） */
const legend = computed(() => {
  const { min, max } = valueRange.value
  return { min, max, steps: FILL_STEPS }
})

/** 无障碍描述 */
const ariaLabel = computed(
  () =>
    `中国省级地图，${props.mode === 'bubble' ? '气泡' : '分级着色'}模式，共 ${dataCount.value} 个省份有数据`,
)

/**
 * 省份填充透明度
 * @param name 省名
 * @returns 0-1 的透明度
 */
function fillOpacity(name: string): number {
  const value = valueMap.value.get(name)
  if (value === undefined) return EMPTY_FILL
  const { min, max } = valueRange.value
  const index = gradeIndex(value, min, max, FILL_STEPS.length)
  return FILL_STEPS[Math.max(0, index)]
}

/**
 * 把鼠标位置换算成相对画布的坐标
 * @param event 鼠标事件
 * @returns 相对画布的 x / y
 */
function pointerOf(event: MouseEvent): { x: number; y: number } {
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return { x: event.offsetX, y: event.offsetY }
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

/**
 * 悬停省份：高亮并显示提示
 * @param event 鼠标事件
 * @param region 省份
 */
function handleRegionMove(event: MouseEvent, region: ProjectedRegion): void {
  hoverName.value = region.name
  if (!props.showTooltip) return

  const { x, y } = pointerOf(event)
  tooltip.value = {
    x,
    y: Math.max(24, y - 12),
    name: region.name,
    value: valueMap.value.get(region.name) ?? null,
  }
}

/** 清掉悬停状态 */
function clearTooltip(): void {
  hoverName.value = ''
  tooltip.value = null
}

/**
 * 点击省份
 * @param region 省份
 */
function handleSelect(region: ProjectedRegion): void {
  emit('select', { name: region.name, value: valueMap.value.get(region.name) ?? 0 })
}

onMounted(() => {
  const element = rootRef.value
  if (!element) return

  width.value = Math.max(280, element.clientWidth || 640)

  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width
      if (next) width.value = Math.max(280, Math.round(next))
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
  <div ref="rootRef" class="sr-china-map">
    <div class="sr-china-map__canvas" :style="{ height: `${props.height}px` }">
      <svg
        ref="svgRef"
        class="sr-china-map__svg"
        :width="width"
        :height="props.height"
        :viewBox="`0 0 ${width} ${props.height}`"
        role="img"
        :aria-label="ariaLabel"
        @mouseleave="clearTooltip"
      >
        <!-- 省份 -->
        <g class="sr-china-map__regions">
          <path
            v-for="region in regions"
            :key="region.adcode"
            class="sr-china-map__region"
            :class="{ 'is-active': hoverName === region.name }"
            :d="region.d"
            :fill-opacity="fillOpacity(region.name)"
            @mousemove="handleRegionMove($event, region)"
            @click="handleSelect(region)"
          />
        </g>

        <!-- 南海诸岛小图 -->
        <g v-if="southSea" class="sr-china-map__south-sea">
          <rect
            class="sr-china-map__south-sea-frame"
            :x="southSea.x"
            :y="southSea.y"
            :width="southSea.width"
            :height="southSea.height"
            rx="4"
          />
          <path class="sr-china-map__region" :d="southSea.d" fill-opacity="0.25" />
        </g>

        <!-- 气泡 -->
        <g v-if="props.mode === 'bubble'" class="sr-china-map__bubbles">
          <circle
            v-for="bubble in bubbles"
            :key="`bubble-${bubble.name}`"
            class="sr-china-map__bubble"
            :cx="bubble.x"
            :cy="bubble.y"
            :r="bubble.r"
          />
        </g>

        <!-- 省份名称 -->
        <g v-if="props.showLabel" class="sr-china-map__labels">
          <text
            v-for="label in labels"
            :key="`label-${label.name}`"
            class="sr-china-map__label"
            :x="label.x"
            :y="label.y + 3.5"
            text-anchor="middle"
          >
            {{ label.name }}
          </text>
        </g>
      </svg>

      <div
        v-if="tooltip"
        class="sr-china-map__tooltip"
        :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
      >
        <div class="sr-china-map__tooltip-title">{{ tooltip.name }}</div>
        <div class="sr-china-map__tooltip-value">
          {{ tooltip.value === null ? '暂无数据' : tooltip.value.toLocaleString('zh-CN') }}
        </div>
      </div>

      <div v-if="isEmpty" class="sr-china-map__empty">{{ props.emptyText }}</div>
    </div>

    <div v-if="props.showLegend" class="sr-china-map__legend">
      <template v-if="props.mode === 'choropleth'">
        <span class="sr-china-map__legend-label">{{ legend.min.toLocaleString('zh-CN') }}</span>
        <i
          v-for="(opacity, index) in legend.steps"
          :key="`legend-${index}`"
          class="sr-china-map__swatch"
          :style="{ opacity }"
        ></i>
        <span class="sr-china-map__legend-label">{{ legend.max.toLocaleString('zh-CN') }}</span>
      </template>
      <template v-else>
        <i class="sr-china-map__swatch sr-china-map__swatch--dot"></i>
        <span class="sr-china-map__legend-label">
          气泡越大表示数值越高，最大 {{ legend.max.toLocaleString('zh-CN') }}
        </span>
      </template>
    </div>
  </div>
</template>
