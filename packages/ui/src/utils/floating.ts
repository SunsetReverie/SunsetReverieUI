/**
 * 浮层定位内核
 *
 * 只做纯计算，不碰 DOM 以外的任何东西 —— 因此可以用单元测试完全覆盖，
 * 也不用担心 SSR：调用方保证只在客户端调用。
 *
 * 三个阶段（顺序不可颠倒）：
 * 1. 按 placement 算出基础坐标
 * 2. flip：主轴上放不下就翻到对面
 * 3. shift：交叉轴上超出视口就平移回来
 *
 * 后续 SrSelect / SrDropdown / SrDatePicker 共用这一份，避免每个组件各写一套。
 */

/** 12 个方位 */
export type SrPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

/** 矩形（只保留定位需要的字段） */
export interface SrRect {
  top: number
  left: number
  width: number
  height: number
}

/** 视口尺寸 */
export interface SrViewport {
  width: number
  height: number
}

/** 定位计算参数 */
export interface SrFloatingOptions {
  /** 触发元素矩形 */
  reference: SrRect
  /** 浮层尺寸 */
  floating: { width: number; height: number }
  /** 期望方位 */
  placement: SrPlacement
  /** 与触发元素的间距 */
  offset?: number
  /** 视口尺寸 */
  viewport: SrViewport
  /** 视口内边距，避免贴边 */
  padding?: number
  /** 主轴上放不下时是否翻转到对面 @default true */
  flip?: boolean
}

/** 定位结果 */
export interface SrFloatingResult {
  /** 浮层左上角坐标（fixed 定位） */
  top: number
  left: number
  /** 实际采用的方位（可能因翻转而改变） */
  placement: SrPlacement
  /** 是否发生了翻转 */
  flipped: boolean
}

/** 主轴 → 交叉轴的反向映射 */
const OPPOSITE: Record<string, string> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

/**
 * 判定某个方位的主轴方向
 * @param placement 方位
 * @returns 主轴方向
 */
function mainAxisOf(placement: SrPlacement): 'top' | 'bottom' | 'left' | 'right' {
  return placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right'
}

/**
 * 翻转方位（同时保留 start / end 对齐）
 * @param placement 原方位
 * @returns 翻转后的方位
 */
export function srFlipPlacement(placement: SrPlacement): SrPlacement {
  const [side, align] = placement.split('-')
  const flipped = OPPOSITE[side]
  return (align ? `${flipped}-${align}` : flipped) as SrPlacement
}

/**
 * 计算基础坐标（未做翻转与避让）
 * @param options 参数
 * @param placement 方位
 * @returns 左上角坐标
 */
function basePosition(options: SrFloatingOptions, placement: SrPlacement): { top: number; left: number } {
  const { reference, floating, viewport, offset = 0 } = options
  const [side, align] = placement.split('-')

  const centerX = reference.left + reference.width / 2
  const centerY = reference.top + reference.height / 2

  // 交叉轴的对齐偏移：center / start / end
  const alignX =
    align === 'start'
      ? reference.left
      : align === 'end'
        ? reference.left + reference.width - floating.width
        : centerX - floating.width / 2

  const alignY =
    align === 'start'
      ? reference.top
      : align === 'end'
        ? reference.top + reference.height - floating.height
        : centerY - floating.height / 2

  switch (side) {
    case 'top':
      return { top: reference.top - floating.height - offset, left: alignX }
    case 'bottom':
      return { top: reference.top + reference.height + offset, left: alignX }
    case 'left':
      return { top: alignY, left: reference.left - floating.width - offset }
    case 'right':
      return { top: alignY, left: reference.left + reference.width + offset }
    default:
      // viewport 参与计算只是为了类型完整，实际坐标不依赖它
      return { top: centerY, left: centerX + viewport.width * 0 }
  }
}

/**
 * 主轴方向是否放得下
 * @param options 参数
 * @param placement 方位
 * @returns 放得下返回 true
 */
function fitsMainAxis(options: SrFloatingOptions, placement: SrPlacement): boolean {
  const { reference, floating, viewport, offset = 0, padding = 0 } = options
  const side = mainAxisOf(placement)

  if (side === 'top') {
    return reference.top - floating.height - offset >= padding
  }
  if (side === 'bottom') {
    return reference.top + reference.height + floating.height + offset <= viewport.height - padding
  }
  if (side === 'left') {
    return reference.left - floating.width - offset >= padding
  }
  return reference.left + reference.width + floating.width + offset <= viewport.width - padding
}

/**
 * 交叉轴上避让视口边缘
 * @param options 参数
 * @param position 基础坐标
 * @param placement 方位
 * @returns 修正后的坐标
 */
function shiftIntoView(
  options: SrFloatingOptions,
  position: { top: number; left: number },
  placement: SrPlacement,
): { top: number; left: number } {
  const { floating, viewport, padding = 0 } = options
  const side = mainAxisOf(placement)
  const isVertical = side === 'top' || side === 'bottom'

  const next = { ...position }

  if (isVertical) {
    const min = padding
    const max = viewport.width - floating.width - padding
    next.left = Math.min(Math.max(position.left, min), Math.max(min, max))
  } else {
    const min = padding
    const max = viewport.height - floating.height - padding
    next.top = Math.min(Math.max(position.top, min), Math.max(min, max))
  }

  return next
}

/**
 * 计算浮层位置
 * @param options 定位参数
 * @returns 最终坐标与实际方位
 */
export function srComputeFloating(options: SrFloatingOptions): SrFloatingResult {
  const { placement, flip = true } = options

  let actual = placement
  let flipped = false

  // flip：主轴放不下就翻到对面
  if (flip && !fitsMainAxis(options, actual)) {
    const opposite = srFlipPlacement(actual)
    if (fitsMainAxis(options, opposite)) {
      actual = opposite
      flipped = true
    }
  }

  const position = shiftIntoView(options, basePosition(options, actual), actual)

  return { top: position.top, left: position.left, placement: actual, flipped }
}

/**
 * 从 DOM 读取元素的视口矩形
 * @param element 目标元素
 * @returns 矩形；无 DOM 时返回零矩形
 */
export function srGetRect(element: Element | null | undefined): SrRect {
  if (!element || typeof element.getBoundingClientRect !== 'function') {
    return { top: 0, left: 0, width: 0, height: 0 }
  }

  const rect = element.getBoundingClientRect()
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}
