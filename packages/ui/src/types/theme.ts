import type { SrBreakpoint } from '../tokens/generated'

/** 明暗模式：具体值 + 跟随系统 */
export type SrThemeMode = 'light' | 'dark' | 'auto'

/** 实际生效的明暗（auto 解析后的结果） */
export type SrResolvedTheme = 'light' | 'dark'

/** 质感风格：毛玻璃 / 扁平 */
export type SrStyleMode = 'glass' | 'flat'

/**
 * 响应式值：单值，或按断点分档的对象
 * 例：span 传 { xs: 24, md: 12 } 表示小屏占满、中屏起占一半
 */
export type SrResponsive<T> = T | Partial<Record<SrBreakpoint, T>>
