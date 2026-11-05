import type { ExtractPropTypes, PropType } from 'vue'

export const modalProps = {
  /** 是否显示，支持 v-model */
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** 标题，同时作为 aria-labelledby 的文本来源 */
  title: {
    type: String,
    default: '',
  },
  /** 宽度：数字按 px，字符串原样透传 */
  width: {
    type: [Number, String] as PropType<number | string>,
    default: 480,
  },
  /** 点击遮罩是否关闭 */
  maskClosable: {
    type: Boolean,
    default: true,
  },
  /** 是否显示右上角关闭按钮 */
  closable: {
    type: Boolean,
    default: true,
  },
  /** Esc 是否关闭 */
  escToClose: {
    type: Boolean,
    default: true,
  },
  /** 打开时锁定页面滚动 */
  lockScroll: {
    type: Boolean,
    default: true,
  },
  /** 垂直居中，否则距顶 10vh */
  centered: {
    type: Boolean,
    default: false,
  },
  /** 是否渲染遮罩（用于嵌套在别的弹层里时关闭遮罩） */
  showMask: {
    type: Boolean,
    default: true,
  },
  /** 挂载目标 */
  teleportTo: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: 'body',
  },
  /** 自定义层级，不传则用配置里的 zIndex */
  zIndex: {
    type: Number,
    default: undefined,
  },
} as const

export type SrModalProps = ExtractPropTypes<typeof modalProps>

/** 关闭原因 */
export type SrModalCloseReason = 'mask' | 'esc' | 'close-button' | 'api'
