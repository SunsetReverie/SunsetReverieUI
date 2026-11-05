/**
 * 响应式断点内核
 *
 * 设计要点：
 * 1. SSR 安全 —— 服务端固定返回 ssrWidth（默认 md 下界），客户端首帧一致，不会水合不匹配
 * 2. 数值全部来自 tokens 生成物，与 CSS 媒体查询共用同一份断点定义
 * 3. resize 用 rAF 节流，滚动/拖拽窗口时每帧最多计算一次
 *
 * 与规划文档 6.6 的差异：文档示例用 matchMedia 逐个监听，
 * 这里改用 resize + rAF 读取真实宽度 —— 因为调试页需要显示精确视口宽度，
 * 而 matchMedia 只能推算区间下界。断点判定逻辑完全一致。
 */

import { computed, getCurrentScope, onScopeDispose, readonly, ref } from 'vue'

import { SR_BREAKPOINTS, SR_BREAKPOINT_KEYS, type SrBreakpoint } from '../tokens/generated'

/** 断点顺序，用于计算「当前最大满足断点」 */
const ORDER: readonly SrBreakpoint[] = SR_BREAKPOINT_KEYS

/** useSrBreakpoint 的可选配置 */
export interface UseSrBreakpointOptions {
  /**
   * 服务端推断的视口宽度
   * Nuxt 下可由 UA 推断后传入，减少移动端首帧结构跳变
   * @default SR_BREAKPOINTS.md（768）
   */
  ssrWidth?: number
}

/**
 * 响应式断点状态
 *
 * @param options 配置项
 * @returns 当前宽度、断点代号与便捷判断
 */
export function useSrBreakpoint(options: UseSrBreakpointOptions = {}) {
  const initialWidth = options.ssrWidth ?? SR_BREAKPOINTS.md
  const width = ref(initialWidth)

  /**
   * 根据宽度计算当前断点（取最大满足者）
   * @returns 断点代号
   */
  const current = computed<SrBreakpoint>(() => {
    let hit: SrBreakpoint = 'xs'
    for (const bp of ORDER) {
      if (width.value >= SR_BREAKPOINTS[bp]) hit = bp
    }
    return hit
  })

  /**
   * 是否 ≥ 指定断点
   * @param bp 断点代号
   * @returns 判断结果（在模板中调用会建立响应式依赖）
   */
  const isUp = (bp: SrBreakpoint): boolean => width.value >= SR_BREAKPOINTS[bp]

  /**
   * 是否 < 指定断点
   * @param bp 断点代号
   * @returns 判断结果
   */
  const isDown = (bp: SrBreakpoint): boolean => width.value < SR_BREAKPOINTS[bp]

  /** 手机档：xs / sm */
  const isMobile = computed(() => current.value === 'xs' || current.value === 'sm')
  /** 平板档：md */
  const isTablet = computed(() => current.value === 'md')
  /** 桌面档：lg / xl */
  const isDesktop = computed(() => current.value === 'lg' || current.value === 'xl')

  if (typeof window !== 'undefined') {
    /** 读取一次真实视口宽度 */
    const sync = (): void => {
      width.value = window.innerWidth
    }
    sync()

    // rAF 节流：resize 高频触发时每帧只更新一次，避免布局抖动
    let ticking = false
    /** resize 处理函数 */
    const onResize = (): void => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        sync()
        ticking = false
      })
    }

    window.addEventListener('resize', onResize, { passive: true })

    // 只有在组件/effect 作用域内才注册清理，避免在 setup 外调用时告警
    if (getCurrentScope()) {
      onScopeDispose(() => {
        window.removeEventListener('resize', onResize)
      })
    }
  }

  return {
    /** 当前视口宽度（服务端为 ssrWidth） */
    width: readonly(width),
    /** 当前断点代号 */
    current,
    /** 是否手机档 */
    isMobile,
    /** 是否平板档 */
    isTablet,
    /** 是否桌面档 */
    isDesktop,
    isUp,
    isDown,
  }
}
