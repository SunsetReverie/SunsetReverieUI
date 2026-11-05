/**
 * L2 语义层 / 质感层 Token 定义
 *
 * 与 tokens.ts 的分工：
 * - tokens.ts  → L1 原始层（色板、间距、字号、动效），不随主题变化
 * - semantic.ts → L2 语义层与质感层，随 [data-sr-theme] 与 [data-sr-style] 重定义
 *
 * 键名不含 --sr- 前缀，由 scripts/build.ts 统一拼接生成 CSS。
 * 值允许直接写 var(--sr-xxx) 引用 L1，这是分层设计的正常用法。
 */

/**
 * 结构型语义：与主题、风格无关，但需要在 :root 上可用
 * 放在这里而不是 tokens.ts，因为它们描述的是「语义用途」而非「原始数值」
 */
export const structural: Record<string, string> = {
  'font-family-base': "'Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif",
  'font-family-mono': "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",

  'font-weight-regular': '400',
  'font-weight-medium': '500',
  'font-weight-semibold': '600',

  'border-width': '1px',
  'border-width-thick': '2px',

  // 层级：只增不减，新增层需插入到合适位置并同步文档 4.9
  'z-base': '0',
  'z-sticky': '100',
  'z-dropdown': '1000',
  'z-mask': '2000',
  'z-modal': '2001',
  'z-popover': '2100',
  'z-toast': '3000',
  'z-tooltip': '3100',
}

/** 状态色（success / warning / danger / info）的语义映射，亮暗两套共用结构 */
interface StatusTokens {
  [key: string]: string
}

/**
 * 生成一组状态色的语义键
 * @param name 状态名，如 success
 * @param map 四个层级的取值：本体 / 浅底 / 边框 / 文本
 * @returns 语义键值对
 */
function statusTokens(
  name: string,
  map: { base: string; bg: string; border: string; text: string },
): StatusTokens {
  return {
    [`color-${name}`]: map.base,
    [`color-${name}-bg`]: map.bg,
    [`color-${name}-border`]: map.border,
    [`color-${name}-text`]: map.text,
  }
}

/**
 * L2 语义层 · 亮色
 * 说明：L1 与 L2 的依赖方向是单向的，这里可以引用原始色板，反之不行
 */
export const semanticLight: Record<string, string> = {
  // ---------- 背景层级 ----------
  'color-bg-page': 'var(--sr-night-50)',
  'color-bg-container': '#ffffff',
  'color-bg-elevated': '#ffffff',
  'color-bg-sunken': 'var(--sr-night-100)',
  'color-bg-hover': 'rgba(16, 20, 26, 0.04)',
  'color-bg-active': 'rgba(16, 20, 26, 0.07)',
  'color-bg-disabled': 'var(--sr-night-100)',

  // ---------- 文本 ----------
  'color-text': 'var(--sr-night-900)',
  'color-text-secondary': 'var(--sr-night-600)',
  'color-text-tertiary': 'var(--sr-night-400)',
  'color-text-disabled': 'var(--sr-night-300)',
  'color-text-inverse': '#ffffff',

  // ---------- 边框 ----------
  'color-border': 'var(--sr-night-200)',
  'color-border-strong': 'var(--sr-night-300)',
  'color-border-subtle': 'var(--sr-night-100)',
  'color-border-disabled': 'var(--sr-night-200)',

  // ---------- 主色 ----------
  'color-primary': 'var(--sr-sunset-500)',
  'color-primary-hover': 'var(--sr-sunset-600)',
  'color-primary-active': 'var(--sr-sunset-700)',
  'color-primary-disabled': 'var(--sr-sunset-200)',
  'color-on-primary': '#ffffff',
  // 文字专用主色：直接拿 sunset-500 当文字只有约 2.9:1，达不到正文 4.5:1
  'color-primary-text': 'var(--sr-sunset-700)',
  // alpha 派生：运行期切换主题色时由 useSrTheme 用 color-mix 覆写
  'color-primary-alpha-25': 'rgba(255, 122, 69, 0.25)',
  'color-primary-alpha-12': 'rgba(255, 122, 69, 0.12)',
  'color-primary-alpha-08': 'rgba(255, 122, 69, 0.08)',

  // ---------- 状态色 ----------
  ...statusTokens('success', {
    base: 'var(--sr-success-500)',
    bg: 'var(--sr-success-50)',
    border: 'var(--sr-success-200)',
    text: 'var(--sr-success-700)',
  }),
  ...statusTokens('warning', {
    base: 'var(--sr-warning-500)',
    bg: 'var(--sr-warning-50)',
    border: 'var(--sr-warning-200)',
    text: 'var(--sr-warning-700)',
  }),
  ...statusTokens('danger', {
    base: 'var(--sr-danger-500)',
    bg: 'var(--sr-danger-50)',
    border: 'var(--sr-danger-200)',
    text: 'var(--sr-danger-700)',
  }),
  // 危险操作按钮需要独立的交互态（主色的 hover 不适用于 danger）
  'color-danger-hover': 'var(--sr-danger-600)',
  'color-danger-active': 'var(--sr-danger-700)',
  ...statusTokens('info', {
    base: 'var(--sr-info-500)',
    bg: 'var(--sr-info-50)',
    border: 'var(--sr-info-200)',
    text: 'var(--sr-info-700)',
  }),

  // ---------- 遮罩 ----------
  'color-mask': 'rgba(16, 20, 26, 0.45)',
}

/**
 * L2 语义层 · 暗色
 * 关键：主色提亮一阶（500 → 400），状态色同理，否则深底上对比度不足
 */
export const semanticDark: Record<string, string> = {
  // ---------- 背景层级 ----------
  'color-bg-page': 'var(--sr-night-950)',
  'color-bg-container': 'var(--sr-night-900)',
  'color-bg-elevated': 'var(--sr-night-800)',
  'color-bg-sunken': '#0b0e12',
  'color-bg-hover': 'rgba(255, 255, 255, 0.06)',
  'color-bg-active': 'rgba(255, 255, 255, 0.1)',
  'color-bg-disabled': 'var(--sr-night-800)',

  // ---------- 文本 ----------
  'color-text': 'var(--sr-night-50)',
  'color-text-secondary': 'var(--sr-night-300)',
  'color-text-tertiary': 'var(--sr-night-500)',
  'color-text-disabled': 'var(--sr-night-600)',
  'color-text-inverse': 'var(--sr-night-950)',

  // ---------- 边框 ----------
  'color-border': 'var(--sr-night-700)',
  'color-border-strong': 'var(--sr-night-600)',
  'color-border-subtle': 'var(--sr-night-800)',
  'color-border-disabled': 'var(--sr-night-700)',

  // ---------- 主色 ----------
  'color-primary': 'var(--sr-sunset-400)',
  'color-primary-hover': 'var(--sr-sunset-300)',
  'color-primary-active': 'var(--sr-sunset-200)',
  'color-primary-disabled': 'var(--sr-sunset-900)',
  'color-on-primary': '#1a0e05',
  'color-primary-text': 'var(--sr-sunset-300)',
  'color-primary-alpha-25': 'rgba(255, 139, 82, 0.25)',
  'color-primary-alpha-12': 'rgba(255, 139, 82, 0.12)',
  'color-primary-alpha-08': 'rgba(255, 139, 82, 0.08)',

  // ---------- 状态色 ----------
  ...statusTokens('success', {
    base: 'var(--sr-success-400)',
    bg: 'var(--sr-success-900)',
    border: 'var(--sr-success-700)',
    text: 'var(--sr-success-300)',
  }),
  ...statusTokens('warning', {
    base: 'var(--sr-warning-400)',
    bg: 'var(--sr-warning-900)',
    border: 'var(--sr-warning-700)',
    text: 'var(--sr-warning-300)',
  }),
  ...statusTokens('danger', {
    base: 'var(--sr-danger-400)',
    bg: 'var(--sr-danger-900)',
    border: 'var(--sr-danger-700)',
    text: 'var(--sr-danger-300)',
  }),
  'color-danger-hover': 'var(--sr-danger-300)',
  'color-danger-active': 'var(--sr-danger-200)',
  ...statusTokens('info', {
    base: 'var(--sr-info-400)',
    bg: 'var(--sr-info-900)',
    border: 'var(--sr-info-700)',
    text: 'var(--sr-info-300)',
  }),

  // ---------- 遮罩 ----------
  'color-mask': 'rgba(0, 0, 0, 0.65)',
}

/**
 * 质感层 · flat
 * 与 glass 共享同一批变量名，只覆写值 —— 组件样式因此无需写风格分支
 */
export const qualityFlat: Record<string, string> = {
  'radius-none': '0',
  'radius-sm': '2px',
  'radius-base': '6px',
  'radius-md': '8px',
  'radius-lg': '12px',
  'radius-xl': '16px',
  'radius-2xl': '24px',
  'radius-full': '9999px',

  'shadow-sm': '0 1px 2px rgba(16, 20, 26, 0.06)',
  'shadow-md': '0 2px 8px rgba(16, 20, 26, 0.08)',
  'shadow-lg': '0 8px 24px rgba(16, 20, 26, 0.1)',
  'shadow-xl': '0 16px 48px rgba(16, 20, 26, 0.14)',
  'shadow-focus': '0 0 0 3px var(--sr-color-primary-alpha-25)',
  'shadow-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',

  'glass-blur': '0px',
  'glass-saturate': '100%',
  'glass-opacity': '1',
  // flat 用 none 而非 blur(0)：后者仍会创建无意义的合成层
  'glass-filter': 'none',
  // 注意不能写 none：surface mixin 会拼成 `box-shadow: var(--sr-shadow-sm), var(--sr-glass-highlight)`，
  // 若这里是 none 会导致整条 box-shadow 非法而失效。用零尺寸透明阴影占位。
  'glass-highlight': '0 0 0 0 transparent',
  'glass-border-width': '1px',
  'glass-border-color': 'var(--sr-color-border)',

  // 位移：flat 用完整距离
  'motion-distance-sm': '6px',
  'motion-distance-md': '12px',
  'motion-distance-lg': '24px',
}

/** 质感层 · glass */
export const qualityGlass: Record<string, string> = {
  'radius-none': '0',
  'radius-sm': '2px',
  'radius-base': '12px',
  'radius-md': '14px',
  'radius-lg': '18px',
  'radius-xl': '22px',
  'radius-2xl': '28px',
  'radius-full': '9999px',

  'shadow-sm': '0 2px 8px rgba(16, 20, 26, 0.06)',
  'shadow-md': '0 8px 24px -6px rgba(16, 20, 26, 0.12)',
  'shadow-lg': '0 16px 48px -12px rgba(16, 20, 26, 0.18)',
  'shadow-xl': '0 32px 80px -16px rgba(16, 20, 26, 0.24)',
  'shadow-focus': '0 0 0 3px var(--sr-color-primary-alpha-25)',
  'shadow-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.24)',

  'glass-blur': '16px',
  'glass-saturate': '180%',
  'glass-opacity': '0.72',
  'glass-filter': 'blur(16px) saturate(180%)',
  'glass-highlight': 'inset 0 1px 0 rgba(255, 255, 255, 0.55)',
  'glass-border-width': '1px',
  'glass-border-color': 'rgba(255, 255, 255, 0.55)',

  // 位移衰减：毛玻璃层内做位移动画会掉帧，距离减半
  'motion-distance-sm': '3px',
  'motion-distance-md': '6px',
  'motion-distance-lg': '12px',
}

/**
 * 交叉修正 · 暗色 + 玻璃
 * 暗底上的玻璃要更暗更透，高光要更弱
 */
export const glassDark: Record<string, string> = {
  'glass-opacity': '0.6',
  'glass-border-color': 'rgba(255, 255, 255, 0.14)',
  'glass-highlight': 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
}

/**
 * 阴影补偿 · 暗色 + 扁平
 * 亮色阴影在暗底上完全不可见，必须换成黑色系
 */
export const shadowDarkFlat: Record<string, string> = {
  'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.5)',
  'shadow-md': '0 2px 8px rgba(0, 0, 0, 0.5)',
  'shadow-lg': '0 8px 24px rgba(0, 0, 0, 0.55)',
  'shadow-xl': '0 16px 48px rgba(0, 0, 0, 0.6)',
}

/**
 * 阴影补偿 · 暗色 + 玻璃
 * 必须写成「主题 + 风格」交叉选择器：若只写在 [data-sr-theme='dark'] 里，
 * 会被后面的 [data-sr-style='flat'|'glass'] 覆盖（特异性相同，后写者胜出）
 */
export const shadowDarkGlass: Record<string, string> = {
  'shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.5)',
  'shadow-md': '0 10px 28px -8px rgba(0, 0, 0, 0.6)',
  'shadow-lg': '0 18px 52px -14px rgba(0, 0, 0, 0.7)',
  'shadow-xl': '0 34px 84px -18px rgba(0, 0, 0, 0.8)',
}

/**
 * 暗色 + 玻璃的完整覆盖块（玻璃修正 + 阴影补偿）
 * @returns 合并后的键值对
 */
export function themedDarkGlass(): Record<string, string> {
  return { ...glassDark, ...shadowDarkGlass }
}
