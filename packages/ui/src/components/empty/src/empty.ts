import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 空状态场景类型 */
export type SrEmptyType = 'default' | 'search' | 'data' | 'error' | 'network' | 'permission'

/** 场景色调，决定图标块的底色 */
type EmptyTone = 'neutral' | 'warning' | 'danger'

/** 单个预设场景 */
interface EmptyPreset {
  /** 默认图标名 */
  icon: string
  /** 默认描述文案 */
  description: string
  /** 图标块色调 */
  tone: EmptyTone
}

/**
 * 各场景的预设图标、文案与色调。
 * 显式传入 `icon` / `description` 时以外部值为准，预设只做兜底。
 */
export const emptyPresets: Record<SrEmptyType, EmptyPreset> = {
  default: { icon: 'lucide:inbox', description: '暂无数据', tone: 'neutral' },
  search: { icon: 'lucide:search-x', description: '没有找到匹配的结果', tone: 'neutral' },
  data: { icon: 'lucide:database', description: '还没有创建任何内容', tone: 'neutral' },
  error: { icon: 'lucide:circle-exclamation-point', description: '加载失败，请稍后重试', tone: 'danger' },
  network: { icon: 'lucide:wifi-off', description: '网络连接失败，请检查网络', tone: 'warning' },
  permission: { icon: 'lucide:lock', description: '暂无访问权限', tone: 'warning' },
}

/** 场景可选值，供文档与演示引用 */
export const EMPTY_TYPES = Object.keys(emptyPresets) as SrEmptyType[]

export const emptyProps = {
  /** 场景类型，决定默认图标、文案与色调 @default 'default' */
  type: {
    type: String as PropType<SrEmptyType>,
    default: 'default',
  },
  /** 描述文案，不传则用场景预设文案 */
  description: {
    type: String,
    default: '',
  },
  /** 图标名，不传则用场景预设图标；显式传空字符串则不显示图标 */
  icon: {
    type: String,
    default: undefined,
  },
  /** 图片地址，传了就用图片替代图标 */
  image: {
    type: String,
    default: '',
  },
  /** 是否套一层虚线框，用于表格或画布内的空占位 */
  bordered: {
    type: Boolean,
    default: false,
  },
  /** 尺寸档位 @default 'md' */
  size: {
    type: String as PropType<SrSize>,
    default: 'md',
  },
} as const

export type SrEmptyProps = ExtractPropTypes<typeof emptyProps>
