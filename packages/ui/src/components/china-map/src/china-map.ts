import type { ExtractPropTypes, PropType } from 'vue'

import type { ChinaMapDatum } from './china-map-utils'

/** 展示模式 */
export type SrChinaMapMode = 'choropleth' | 'bubble'

export type { ChinaMapDatum }

export const chinaMapProps = {
  /** 各省数值；名称写「北京」或「北京市」都能对上 */
  data: {
    type: Array as PropType<ChinaMapDatum[]>,
    default: () => [],
  },
  /**
   * 展示模式 @default 'choropleth'
   *
   * `choropleth` 按数值深浅填色，适合看分布；
   * `bubble` 在省会位置打点，半径表示量级，适合看排名。
   */
  mode: {
    type: String as PropType<SrChinaMapMode>,
    default: 'choropleth',
  },
  /** 图表高度（px） @default 420 */
  height: {
    type: Number,
    default: 420,
  },
  /** 是否显示省份名称 @default true */
  showLabel: {
    type: Boolean,
    default: true,
  },
  /** 是否显示色阶 / 气泡图例 @default true */
  showLegend: {
    type: Boolean,
    default: true,
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
  /** 气泡模式下的最大半径（px） @default 26 */
  maxRadius: {
    type: Number,
    default: 26,
  },
} as const

export type SrChinaMapProps = ExtractPropTypes<typeof chinaMapProps>
