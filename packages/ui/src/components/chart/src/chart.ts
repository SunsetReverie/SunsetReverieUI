import type { ExtractPropTypes, PropType } from 'vue'

/** 图表类型 */
export type SrChartType = 'line' | 'bar' | 'area' | 'pie'

/** 一个数据系列 */
export interface SrChartSeries {
  /** 系列名，显示在图例与 tooltip 里 */
  name: string
  /** 数据值，按 `categories` 的顺序排列 */
  data: number[]
  /** 自定义颜色，缺省按内置调色板轮转 */
  color?: string
}

/** tooltip 里的一条数据 */
export interface SrChartTooltipItem {
  /** 系列名或分类名 */
  name: string
  /** 数值 */
  value: number
  /** 色块颜色 */
  color: string
}

export const chartProps = {
  /**
   * 图表类型 @default 'line'
   *
   * `pie` 只读取 `series[0]`，分类取 `categories`。
   */
  type: {
    type: String as PropType<SrChartType>,
    default: 'line',
  },
  /** x 轴分类标签；饼图里作为扇区名称 */
  categories: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  /** 数据系列；折线/柱状/面积可传多个，饼图只用第一个 */
  series: {
    type: Array as PropType<SrChartSeries[]>,
    default: () => [],
  },
  /** 图表高度（px） @default 280 */
  height: {
    type: Number,
    default: 280,
  },
  /**
   * 自定义调色板（CSS 颜色或变量） @default undefined
   *
   * 不传时使用主题色：primary / success / warning / danger / info。
   */
  colors: {
    type: Array as PropType<string[]>,
    default: undefined,
  },
  /** 是否显示图例 @default true */
  showLegend: {
    type: Boolean,
    default: true,
  },
  /** 是否显示水平网格线与 y 轴刻度 @default true */
  showGrid: {
    type: Boolean,
    default: true,
  },
  /** 折线 / 面积是否平滑 @default true */
  smooth: {
    type: Boolean,
    default: true,
  },
  /**
   * 柱状 / 面积是否堆叠 @default false
   *
   * 开启后同一分类的多系列相加，y 轴按总和取刻度。
   */
  stacked: {
    type: Boolean,
    default: false,
  },
  /**
   * 环形内半径占比（0-0.9，仅 `pie` 生效） @default 0
   *
   * 传 0.6 左右即可得到环形图。
   */
  innerRadius: {
    type: Number,
    default: 0,
  },
  /** 是否显示悬停提示 @default true */
  showTooltip: {
    type: Boolean,
    default: true,
  },
  /** 无数据时的占位文案 @default '暂无数据' */
  emptyText: {
    type: String,
    default: '暂无数据',
  },
} as const

export type SrChartProps = ExtractPropTypes<typeof chartProps>
