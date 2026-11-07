import type { ExtractPropTypes, PropType } from 'vue'

/** 切换效果 */
export type SrCarouselEffect = 'slide' | 'fade'

/** 排列方向 */
export type SrCarouselDirection = 'horizontal' | 'vertical'

/** 指示器位置 */
export type SrCarouselIndicatorPosition = 'inside' | 'outside'

export const carouselProps = {
  /**
   * 数据源，每项原样传给 `#item` 插槽
   *
   * 不直接接收 DOM 子节点：轮播内容异形（图片、卡片、富文本都有），
   * 用作用域插槽把渲染权交给调用方，组件只管切换与布局。
   */
  items: {
    type: Array as PropType<unknown[]>,
    default: () => [],
  },
  /** 当前索引，支持 v-model */
  modelValue: {
    type: Number,
    default: 0,
  },
  /** 切换效果 @default 'slide' */
  effect: {
    type: String as PropType<SrCarouselEffect>,
    default: 'slide',
  },
  /**
   * 排列方向 @default 'horizontal'
   *
   * vertical 时滑动方向、拖动轴、指示器位置都会跟着转。
   */
  direction: {
    type: String as PropType<SrCarouselDirection>,
    default: 'horizontal',
  },
  /** 自动播放 @default false */
  autoplay: {
    type: Boolean,
    default: false,
  },
  /** 自动播放间隔（ms） @default 4000 */
  interval: {
    type: Number,
    default: 4000,
  },
  /**
   * 鼠标悬停时暂停自动播放 @default true
   *
   * 默认开启：用户停在某一张上说明正在看，此时自动切走会打断阅读。
   */
  pauseOnHover: {
    type: Boolean,
    default: true,
  },
  /** 循环播放，末张之后回到第一张 @default true */
  loop: {
    type: Boolean,
    default: true,
  },
  /** 显示指示器 @default true */
  indicators: {
    type: Boolean,
    default: true,
  },
  /** 指示器位置 @default 'inside' */
  indicatorPosition: {
    type: String as PropType<SrCarouselIndicatorPosition>,
    default: 'inside',
  },
  /** 显示左右箭头 @default true */
  arrows: {
    type: Boolean,
    default: true,
  },
  /** 高度，数字按 px @default 240 */
  height: {
    type: [String, Number] as PropType<number | string>,
    default: 240,
  },
  /** 允许鼠标拖动切换 @default true */
  draggable: {
    type: Boolean,
    default: true,
  },
  /** 允许触摸滑动切换 @default true */
  touchable: {
    type: Boolean,
    default: true,
  },
  /**
   * 拖动多少比例后算翻页 @default 0.15
   *
   * 太小容易误触，太大会让用户觉得「拖了没反应」。
   */
  dragThreshold: {
    type: Number,
    default: 0.15,
  },
  /** 禁用全部交互 @default false */
  disabled: {
    type: Boolean,
    default: false,
  },
}

export type SrCarouselProps = ExtractPropTypes<typeof carouselProps>
