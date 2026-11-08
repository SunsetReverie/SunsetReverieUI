import type { ExtractPropTypes, PropType } from 'vue'

/** 图片填充方式 */
export type SrImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'

export const imageProps = {
  /** 图片地址 */
  src: {
    type: String,
    default: '',
  },
  /** 替代文本，同时作为无障碍描述 */
  alt: {
    type: String,
    default: '',
  },
  /** 宽度，数字按像素处理 */
  width: {
    type: [String, Number] as PropType<string | number>,
    default: undefined,
  },
  /** 高度，数字按像素处理 */
  height: {
    type: [String, Number] as PropType<string | number>,
    default: undefined,
  },
  /** 填充方式 @default 'cover' */
  fit: {
    type: String as PropType<SrImageFit>,
    default: 'cover',
  },
  /** 圆角，数字按像素处理 @default 0 */
  radius: {
    type: [String, Number] as PropType<string | number>,
    default: 0,
  },
  /**
   * 懒加载 @default false
   *
   * 用 IntersectionObserver，进入视口才真正请求图片。
   */
  lazy: {
    type: Boolean,
    default: false,
  },
  /** 点击放大 @default false */
  preview: {
    type: Boolean,
    default: false,
  },
  /**
   * 加载失败的兜底图 @default ''
   *
   * 不传时显示一个占位图标 + 替代文本。
   */
  fallback: {
    type: String,
    default: '',
  },
  /** 加载中的占位图 @default '' */
  placeholder: {
    type: String,
    default: '',
  },
} as const

export type SrImageProps = ExtractPropTypes<typeof imageProps>
