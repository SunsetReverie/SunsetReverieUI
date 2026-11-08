import { onBeforeUnmount, ref } from 'vue'

/**
 * 拖拽排序
 *
 * 用 Pointer Events 实现，鼠标、触摸、手写笔共用一套逻辑——
 * 原生 HTML5 Drag & Drop 在触摸屏上根本不触发，所以不能用它。
 *
 * 三个关键行为：
 * - 鼠标移动超过阈值才开始拖（否则点击会被误判）
 * - 触摸需要长按才启动（否则和页面滚动打架）
 * - 手指一动就取消长按（说明用户想滚动，不是想拖）
 */

/** 落点类型 */
export type SrDragDropType = 'before' | 'inside' | 'after'

/** 可拖拽项的标识 */
export type SrDragKey = string | number

export interface SrDragSortOptions {
  /** 排列方向，纵向时按 Y 判断落点 @default 'vertical' */
  orientation?: 'vertical' | 'horizontal'
  /** 鼠标移动多少像素后认定开始拖拽 @default 4 */
  threshold?: number
  /** 触摸长按多久启动拖拽（毫秒） @default 260 */
  holdDelay?: number
  /** 某项是否禁止拖拽 */
  isDisabled?: (key: SrDragKey) => boolean
  /** 判断能否放在某处，返回 false 时该落点不生效 */
  canDrop?: (dragKey: SrDragKey, overKey: SrDragKey, type: SrDragDropType) => boolean
  /** 放下回调 */
  onDrop: (dragKey: SrDragKey, overKey: SrDragKey, type: SrDragDropType) => void
}

/**
 * 拖拽排序
 * @param options 配置
 * @returns 状态与事件
 */
export function useSrDragSort(options: SrDragSortOptions) {
  const vertical = (options.orientation ?? 'vertical') === 'vertical'
  const threshold = options.threshold ?? 4
  const holdDelay = options.holdDelay ?? 260

  /** 是否正在拖拽（用于加全局样式） */
  const dragging = ref(false)

  /** 正在拖的项 */
  const dragKey = ref<SrDragKey | null>(null)

  /** 当前落点项 */
  const overKey = ref<SrDragKey | null>(null)

  /** 当前落点位置 */
  const overType = ref<SrDragDropType | null>(null)

  /** 已注册的元素：落点计算全靠它 */
  const elements = new Map<SrDragKey, HTMLElement>()

  /** 按下但还没进入拖拽的项 */
  let pendingKey: SrDragKey | null = null

  /** 按下坐标 */
  let startX = 0
  let startY = 0

  /** 长按定时器 */
  let holdTimer: ReturnType<typeof setTimeout> | undefined

  /**
   * 注册某一项的元素
   *
   * `ref` 回调里直接调用，传 null 表示卸载。
   * @param key 项标识
   * @param element 元素
   */
  function register(key: SrDragKey, element: Element | null): void {
    if (element instanceof HTMLElement) elements.set(key, element)
    else elements.delete(key)
  }

  /**
   * 指针按下
   * @param key 项标识
   * @param event 指针事件
   */
  function onPointerDown(key: SrDragKey, event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (options.isDisabled?.(key)) return

    pendingKey = key
    startX = event.clientX
    startY = event.clientY

    if (event.pointerType === 'touch') {
      holdTimer = setTimeout(() => {
        if (pendingKey !== null) begin(pendingKey)
      }, holdDelay)
    }

    attach()
  }

  /**
   * 进入拖拽态
   * @param key 项标识
   */
  function begin(key: SrDragKey): void {
    dragKey.value = key
    dragging.value = true
    if (typeof document !== 'undefined') document.body.style.userSelect = 'none'
  }

  /**
   * 指针移动
   *
   * 分两段：还没进入拖拽时只判断「该不该开始」，
   * 进入之后才算落点。
   * @param event 指针事件
   */
  function onPointerMove(event: PointerEvent): void {
    if (pendingKey === null) return

    const dx = event.clientX - startX
    const dy = event.clientY - startY
    const moved = vertical ? Math.abs(dy) : Math.abs(dx)

    if (!dragging.value) {
      if (event.pointerType === 'touch') {
        // 手指一动就说明是想滚动，撤掉长按
        if (moved > 8) reset()
        return
      }

      if (moved <= threshold) return
      if (pendingKey !== null) begin(pendingKey)
    }

    if (dragKey.value === null) return

    const hit = findKeyAt(event)
    if (hit === null || hit === dragKey.value) {
      overKey.value = null
      overType.value = null
      return
    }

    const type = resolveType(hit, event)
    if (options.canDrop && !options.canDrop(dragKey.value, hit, type)) {
      overKey.value = null
      overType.value = null
      return
    }

    overKey.value = hit
    overType.value = type
  }

  /**
   * 指针松开
   */
  function onPointerUp(): void {
    const drag = dragKey.value
    const over = overKey.value
    const type = overType.value

    if (drag !== null && over !== null && drag !== over && type) {
      options.onDrop(drag, over, type)
    }

    reset()
  }

  /** 清理所有状态与监听 */
  function reset(): void {
    if (holdTimer) {
      clearTimeout(holdTimer)
      holdTimer = undefined
    }

    pendingKey = null
    dragging.value = false
    dragKey.value = null
    overKey.value = null
    overType.value = null

    if (typeof document !== 'undefined') document.body.style.userSelect = ''
    detach()
  }

  /**
   * 根据指针位置找落在哪一项上
   * @param event 指针事件
   * @returns 项标识
   */
  function findKeyAt(event: PointerEvent): SrDragKey | null {
    const point = vertical ? event.clientY : event.clientX

    let last: SrDragKey | null = null
    let lastEnd = Number.NEGATIVE_INFINITY

    for (const [key, element] of elements) {
      const rect = element.getBoundingClientRect()
      const start = vertical ? rect.top : rect.left
      const end = vertical ? rect.bottom : rect.right

      if (point >= start && point <= end) return key
      if (end > lastEnd) {
        lastEnd = end
        last = key
      }
    }

    // 落在最后一项之下：归到最后一项
    return point > lastEnd ? last : null
  }

  /**
   * 判断落在项内的哪个位置
   *
   * 上下各 1/4 是 before / after，中间一半是 inside——
   * 文件树的通用约定，用户不用额外学习。
   * @param key 项标识
   * @param event 指针事件
   * @returns 落点类型
   */
  function resolveType(key: SrDragKey, event: PointerEvent): SrDragDropType {
    const element = elements.get(key)
    if (!element) return 'after'

    const rect = element.getBoundingClientRect()
    const size = vertical ? rect.height : rect.width
    if (!size) return 'after'

    const offset = vertical ? event.clientY - rect.top : event.clientX - rect.left
    const ratio = offset / size

    if (ratio < 0.25) return 'before'
    if (ratio > 0.75) return 'after'
    return 'inside'
  }

  /** 挂到 document 上：拖出元素范围后仍要跟踪 */
  function attach(): void {
    if (typeof document === 'undefined') return
    document.addEventListener('pointermove', onPointerMove, true)
    document.addEventListener('pointerup', onPointerUp, true)
    document.addEventListener('pointercancel', onPointerUp, true)
  }

  /** 解绑 */
  function detach(): void {
    if (typeof document === 'undefined') return
    document.removeEventListener('pointermove', onPointerMove, true)
    document.removeEventListener('pointerup', onPointerUp, true)
    document.removeEventListener('pointercancel', onPointerUp, true)
  }

  /**
   * 某一项的落点类型
   * @param key 项标识
   * @returns 落点类型或 null
   */
  function dropTypeOf(key: SrDragKey): SrDragDropType | null {
    return overKey.value === key ? overType.value : null
  }

  onBeforeUnmount(reset)

  return {
    /** 是否正在拖拽 */
    dragging,
    /** 正在拖的项 */
    dragKey,
    /** 当前落点项 */
    overKey,
    /** 当前落点位置 */
    overType,
    /** 注册元素 */
    register,
    /** 指针按下 */
    onPointerDown,
    /** 某一项的落点类型 */
    dropTypeOf,
    /** 主动取消 */
    cancel: reset,
  }
}
