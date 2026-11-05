/** 组件尺寸阶梯 */
export type SrSize = 'xs' | 'sm' | 'md' | 'lg'

/**
 * 全局配置
 *
 * 由 SrConfigProvider 通过 provide / inject 下发，
 * 组件读取时若未找到 provider，回落到默认值。
 */
export interface SrConfig {
  /** 组件默认尺寸 */
  size: SrSize
  /** 弹层层级基数，Modal / Dropdown 在此之上叠加 */
  zIndex: number
  /** 类名前缀，固定 'sr'，保留字段以便未来做多品牌 */
  namespace: string
}

/** 默认配置 */
export const SR_CONFIG_DEFAULTS: SrConfig = {
  size: 'md',
  zIndex: 1000,
  namespace: 'sr',
}
