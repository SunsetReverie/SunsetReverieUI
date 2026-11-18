import type { ExtractPropTypes, PropType } from 'vue'

import type { ChinaMapDatum, ChinaMapFit } from './china-map-utils'

/** 展示模式 */
export type SrChinaMapMode = 'choropleth' | 'bubble'

/** 缩放策略 */
export type SrChinaMapFit = ChinaMapFit

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
  /**
   * 图表高度 @default 420
   *
   * 传 `'auto'` 时高度由「容器宽度 + 地图宽高比」算出，
   * 只在 `fit: 'width'` 下有意义；其它组合会退回 420。
   */
  height: {
    type: [Number, String] as PropType<number | 'auto'>,
    default: 420,
  },
  /**
   * 缩放策略 @default 'contain'
   *
   * - `contain`：等比缩放到宽高都能装下。面板变宽只会让左右留白变多，
   *   地图大小完全由 `height` 决定
   * - `width`：按宽度撑满，高度由地图宽高比反推，`height` 不再决定缩放。
   *   宽面板里想让地图铺满就是用它
   * - `height`：按高度撑满，宽度由宽高比反推
   */
  fit: {
    type: String as PropType<SrChinaMapFit>,
    default: 'contain',
  },
  /**
   * 额外的中心缩放倍数 @default 1
   *
   * 适合「面板高度不变、地图想再大一点」的场景。放大后超出容器的部分会被裁掉，
   * 建议配合调小 `padding` 控制裁切范围。
   */
  zoom: {
    type: Number,
    default: 1,
  },
  /**
   * 地图四周留白（px）@default 12
   *
   * 宽屏下想更贴边就调小，`0` 表示完全贴边。
   */
  padding: {
    type: Number,
    default: 12,
  },
  /**
   * 省份标签的最小面积阈值（平方度）@default 0
   *
   * 面积小于该值的省份不画标签。窄图里标签互相压住时，调大它可以让小省直接不显示，
   * 而不是依赖重叠检测随机丢掉几个。
   */
  labelMinArea: {
    type: Number,
    default: 0,
  },
  /**
   * 省份标签字号（px）@default 自动
   *
   * 不传时按画布高度相对 420 做等比缩放，限制在 9–15 之间，
   * 避免大屏标签过小、小图标签挤成一团。
   */
  labelSize: {
    type: Number,
    default: 0,
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
