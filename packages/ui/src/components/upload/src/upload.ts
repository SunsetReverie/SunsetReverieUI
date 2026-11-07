import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 单个文件的上传状态 */
export type SrUploadStatus = 'ready' | 'uploading' | 'success' | 'error'

/** 列表展示形态 */
export type SrUploadListType = 'list' | 'card'

/** 触发区形态 */
export type SrUploadTriggerType = 'area' | 'button'

/** 文件条目 */
export interface SrUploadFile {
  /** 唯一标识，删除与去重都靠它 */
  uid: string
  /** 文件名 */
  name: string
  /** 字节数 */
  size: number
  /** MIME 类型 */
  type: string
  /** 预览地址：图片走 objectURL，也可由上传结果返回 */
  url?: string
  /** 当前状态 */
  status: SrUploadStatus
  /** 进度 0-100 */
  percent: number
  /** 失败原因 */
  error?: string
  /** 原始文件，交给上传函数 */
  raw?: File
}

/**
 * 上传函数签名
 *
 * 不内置请求库：这个库零运行时依赖，用什么 HTTP 客户端由调用方决定。
 * 不传时组件只负责收集文件（autoUpload 关闭），把 raw 交给外部处理。
 */
export type SrUploadRequest = (file: File, onProgress: (percent: number) => void) => Promise<string | void>

export const uploadProps = {
  /**
   * 已有文件列表，支持 v-model:files
   *
   * 回显场景：服务端只返回 url/name/size，没有 raw，组件不会为它们发上传请求。
   */
  files: {
    type: Array as PropType<SrUploadFile[]>,
    default: () => [],
  },
  /** 接受的文件类型，写法同原生 input 的 accept */
  accept: {
    type: String,
    default: '',
  },
  /** 允许选择多个文件 @default false */
  multiple: {
    type: Boolean,
    default: false,
  },
  /** 最多保留几个文件，0 表示不限 @default 0 */
  maxCount: {
    type: Number,
    default: 0,
  },
  /** 单文件大小上限（MB），0 表示不限 @default 0 */
  maxSize: {
    type: Number,
    default: 0,
  },
  /** 列表形态 @default 'list' */
  listType: {
    type: String as PropType<SrUploadListType>,
    default: 'list',
  },
  /**
   * 触发区形态 @default 'area'
   *
   * button 是一个紧凑的按钮，适合放在表单里；area 是大块拖拽区。
   */
  triggerType: {
    type: String as PropType<SrUploadTriggerType>,
    default: 'area',
  },
  /**
   * 拖拽区图标，传空字符串可去掉 @default 'lucide:box'
   *
   * 拖拽悬停时会换成下载图标；想固定不变就自己用 #icon 插槽。
   */
  icon: {
    type: String,
    default: 'lucide:box',
  },
  /** 按钮形态下的文案 @default '选择文件' */
  buttonText: {
    type: String,
    default: '选择文件',
  },
  /** 允许拖拽到区域上传 @default true */
  draggable: {
    type: Boolean,
    default: true,
  },
  /** 禁用 @default false */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 选择后立即调用 httpRequest @default true
   *
   * 关掉后组件只收集文件，由调用方在合适的时机批量提交。
   */
  autoUpload: {
    type: Boolean,
    default: true,
  },
  /** 显示文件列表 @default true */
  showFileList: {
    type: Boolean,
    default: true,
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /** 拖拽区主文案 @default '点击或拖拽文件到这里' */
  dragText: {
    type: String,
    default: '点击或拖拽文件到这里',
  },
  /** 拖拽区下方的提示文案 */
  tip: {
    type: String,
    default: '',
  },
  /** 自定义上传函数；不传则只收集文件 */
  httpRequest: {
    type: Function as PropType<SrUploadRequest>,
    default: undefined,
  },
} as const

export type SrUploadProps = ExtractPropTypes<typeof uploadProps>
