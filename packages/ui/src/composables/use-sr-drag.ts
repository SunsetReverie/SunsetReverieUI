import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

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
 *
 * 支持跨列表：多个实例传同一个 `context` 即可，拖动状态在它们之间共享。
 */

/** 落点类型 */
export type SrDragDropType = 'before' | 'inside' | 'after'

/** 可拖拽项的标识 */
export type SrDragKey = string | number

/**
 * 空列表的落点标识
 *
 * 指针停在列表容器上但没有命中任何项时（典型情况：目标列表是空的），
 * `overKey` 用这个值占位，调用方据此把数据追加到末尾。
 */
export const SR_DRAG_CONTAINER_KEY = '__sr_container__'

/** 放置时的完整信息 */
export interface SrDragDropPayload {
  /** 被拖的项 */
  dragKey: SrDragKey
  /** 落点项 */
  overKey: SrDragKey
  /** 落点位置 */
  type: SrDragDropType
  /** 从哪个列表来（未分组时为空字符串） */
  fromListId: string
  /** 放到哪个列表（未分组时为空字符串） */
  toListId: string
  /** 是否跨列表 */
  acrossLists: boolean
}

/**
 * 拖拽上下文
 *
 * 多个列表要互相拖时必须共享同一个 context，
 * 否则各自只认自己的元素，指针移出边界就什么都不知道了。
 */
export interface SrDragContext {
  /** 正在拖的项 */
  dragging: Ref<{ listId: string; key: SrDragKey } | null>
  /** 当前落点 */
  over: Ref<{ listId: string; key: SrDragKey; type: SrDragDropType } | null>
  /** 已注册的容器 */
  containers: Map<string, HTMLElement>
  /** 已注册的放置处理器 */
  handlers: Map<string, (payload: SrDragDropPayload) => void>
  /** 已注册的可用性判断 */
  guards: Map<string, (payload: SrDragDropPayload) => boolean>
}

/**
 * 创建一份共享的拖拽上下文
 *
 * 两个列表想互相拖，就用同一个 context 初始化各自的 `useSrDragSort`。
 * @returns 上下文对象
 */
export function createSrDragContext(): SrDragContext {
  return {
    dragging: ref(null),
    over: ref(null),
    containers: new Map(),
    handlers: new Map(),
    guards: new Map(),
  }
}

export interface SrDragSortOptions {
  /** 排列方向，纵向时按 Y 判断落点 @default 'vertical' */
  orientation?: 'vertical' | 'horizontal'
  /** 鼠标移动多少像素后认定开始拖拽 @default 4 */
  threshold?: number
  /** 触摸长按多久启动拖拽（毫秒） @default 260 */
  holdDelay?: number
  /** 共享上下文，跨列表拖拽必传 */
  context?: SrDragContext
  /** 本列表的标识，跨列表时用于区分来源和目标 */
  listId?: string
  /** 某项是否禁止拖拽 */
  isDisabled?: (key: SrDragKey) => boolean
  /** 列表本身是否禁止作为落点（例如只读区） */
  isListDisabled?: () => boolean
  /** 判断能否放在某处，返回 false 时该落点不生效 */
  canDrop?: (payload: SrDragDropPayload) => boolean
  /** 放下回调 */
  onDrop: (payload: SrDragDropPayload) => void
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
  const listId = options.listId ?? ''
  const context = options.context
  const ownContext: SrDragContext = context ?? createSrDragContext()

  /** 是否正在拖拽（用于加全局样式） */
  const dragging = ref(false)

  /** 正在拖的项（本实例视角） */
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
   * 注册列表容器
   *
   * 空列表没有项可命中，只能靠容器本身接住拖拽。
   * @param element 容器元素
   */
  function registerContainer(element: Element | null): void {
    if (element instanceof HTMLElement) ownContext.containers.set(listId, element)
    else ownContext.containers.delete(listId)
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
  }

  /**
   * 进入拖拽态
   * @param key 项标识
   */
  function begin(key: SrDragKey): void {
    dragKey.value = key
    dragging.value = true
    // 共享上下文：别的列表靠它判断「现在有个东西被拖起来了」
    ownContext.dragging.value = { listId, key }

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
    // 别人在拖：只管算落点，不处理启动逻辑
    if (pendingKey === null) {
      if (ownContext.dragging.value) updateOver(event)
      return
    }

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

    updateOver(event)
  }

  /**
   * 计算并写入落点
   *
   * 跨列表时每个实例都会收到 pointermove，只有指针落在自己容器内
   * 或者自己列表为空（需要空列表也能接）时才接管。
   * @param event 指针事件
   */
  function updateOver(event: PointerEvent): void {
    if (options.isListDisabled?.()) {
      clearOver()
      return
    }

    const active = ownContext.dragging.value
    if (!active) return

    // 跨列表时所有实例都会收到 pointermove：只有指针在自己容器内才接管，
    // 否则两个列表会互相抢落点，最终谁后执行谁赢
    const container = ownContext.containers.get(listId)
    if (container && !isInside(container, event)) {
      if (ownContext.over.value?.listId === listId) clearOver()
      return
    }

    const hit = findKeyAt(event)

    // 没命中任何项：可能指针在列表容器上（空列表，或停在项下方之外的空白）
    if (hit === null) {
      const container = ownContext.containers.get(listId)
      if (container && isInside(container, event)) {
        const payload: SrDragDropPayload = {
          dragKey: active.key,
          overKey: SR_DRAG_CONTAINER_KEY,
          type: 'inside',
          fromListId: active.listId,
          toListId: listId,
          acrossLists: active.listId !== listId,
        }

        if (options.canDrop && !options.canDrop(payload)) {
          clearOver()
          return
        }

        overKey.value = SR_DRAG_CONTAINER_KEY
        overType.value = 'inside'
        ownContext.over.value = { listId, key: SR_DRAG_CONTAINER_KEY, type: 'inside' }
        return
      }

      clearOver()
      return
    }

    const type = resolveType(hit, event)
    const payload: SrDragDropPayload = {
      dragKey: active.key,
      overKey: hit,
      type,
      fromListId: active.listId,
      toListId: listId,
      acrossLists: active.listId !== listId,
    }

    if (options.canDrop && !options.canDrop(payload)) {
      clearOver()
      return
    }

    overKey.value = hit
    overType.value = type
    ownContext.over.value = { listId, key: hit, type }
  }

  /**
   * 指针松开
   */
  function onPointerUp(): void {
    const active = ownContext.dragging.value
    const over = ownContext.over.value

    if (active && over) {
      const payload: SrDragDropPayload = {
        dragKey: active.key,
        overKey: over.key,
        type: over.type,
        fromListId: active.listId,
        toListId: over.listId,
        acrossLists: active.listId !== over.listId,
      }

      // 交给落点所属的实例处理：只有它知道自己的数据结构
      const handler = ownContext.handlers.get(over.listId)
      if (handler) handler(payload)
      else if (over.listId === listId) options.onDrop(payload)
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
    ownContext.dragging.value = null
    ownContext.over.value = null

    if (typeof document !== 'undefined') document.body.style.userSelect = ''
    // 不解绑监听：跨列表时本实例可能还是「被动接收方」，
    // 一次拖拽结束就 detach 会让它从此收不到事件
  }

  /** 只清落点，不动拖拽态 */
  function clearOver(): void {
    overKey.value = null
    overType.value = null
    if (ownContext.over.value?.listId === listId) ownContext.over.value = null
  }

  /**
   * 根据指针位置找落在哪一项上
   * @param event 指针事件
   * @returns 项标识
   */
  function findKeyAt(event: PointerEvent): SrDragKey | null {
    if (!elements.size) return null

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

    // 落在最后一项之下：归到最后一项（这样空区域也能追加到末尾）
    return point > lastEnd ? last : null
  }

  /**
   * 指针是否在某个元素内部
   * @param element 元素
   * @param event 指针事件
   * @returns 是否在内部
   */
  function isInside(element: HTMLElement, event: PointerEvent): boolean {
    if (typeof document === 'undefined') return false

    // 用命中测试而不是 rect：容器尺寸会随内容变化，
    // rect 一旦缓存就可能过时；elementFromPoint 永远是当前布局
    const hit = document.elementFromPoint(event.clientX, event.clientY)
    return !!hit && (hit === element || element.contains(hit))
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

  // 跨列表：把自己的处理器登记进上下文，别人拖过来时由这里落地
  ownContext.handlers.set(listId, options.onDrop)

  /**
   * 某一项的落点类型
   * @param key 项标识
   * @returns 落点类型或 null
   */
  function dropTypeOf(key: SrDragKey): SrDragDropType | null {
    const over = ownContext.over.value
    if (!over || over.listId !== listId) return null
    return over.key === key ? over.type : null
  }

  /** 本列表是否正被拖入（用于空列表时显示占位提示） */
  const isDropTarget = () => ownContext.over.value?.listId === listId

  // 常驻监听：跨列表拖拽时本实例可能是被动接收方，从没按下过，
  // 等 pointerdown 才绑监听就永远收不到了
  onMounted(attach)

  onBeforeUnmount(() => {
    ownContext.handlers.delete(listId)
    ownContext.containers.delete(listId)
    detach()
    reset()
  })

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
    /** 注册列表容器（空列表也能接住拖拽） */
    registerContainer,
    /** 指针按下 */
    onPointerDown,
    /** 某一项的落点类型 */
    dropTypeOf,
    /** 本列表是否被拖入 */
    isDropTarget,
    /** 主动取消 */
    cancel: reset,
  }
}
