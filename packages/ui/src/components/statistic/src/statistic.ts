import type { ExtractPropTypes, PropType } from 'vue'

export const statisticProps = {
  /** 数值 */
  value: {
    type: Number,
    default: 0,
  },
  /** 标题 */
  title: {
    type: String,
    default: '',
  },
  /**
   * 小数位数 @default 0
   *
   * 不足补零，超出四舍五入。
   */
  precision: {
    type: Number,
    default: 0,
  },
  /** 前缀（货币符号等） */
  prefix: {
    type: String,
    default: '',
  },
  /** 后缀（单位） */
  suffix: {
    type: String,
    default: '',
  },
  /**
   * 千分位分隔符 @default ','
   *
   * 传空字符串关闭分组。
   */
  separator: {
    type: String,
    default: ',',
  },
  /**
   * 自定义格式化 @default undefined
   *
   * 传了就完全接管显示，`precision` / `separator` 不再生效。
   */
  formatter: {
    type: Function as PropType<(value: number) => string>,
    default: undefined,
  },
  /** 加载中 @default false */
  loading: {
    type: Boolean,
    default: false,
  },
  /** 数值颜色，接受任意 CSS 颜色 */
  valueColor: {
    type: String,
    default: '',
  },
} as const

export type SrStatisticProps = ExtractPropTypes<typeof statisticProps>
