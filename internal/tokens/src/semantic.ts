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
  // 反色表面：Tooltip 气泡这类「浮在内容之上、需要与页面反衬」的场景
  'color-bg-inverse': 'var(--sr-night-900)',

  // ---------- 边框 ----------
  // 边框统一改为低透明度黑：实色色阶在白底上偏重，且叠在半透明玻璃上会发灰
  'color-border': 'rgba(15, 18, 22, 0.11)',
  'color-border-strong': 'rgba(15, 18, 22, 0.18)',
  'color-border-subtle': 'rgba(15, 18, 22, 0.07)',
  'color-border-disabled': 'rgba(15, 18, 22, 0.08)',

  // ---------- 主色 ----------
  'color-primary': 'var(--sr-sunset-500)',
  'color-primary-hover': 'var(--sr-sunset-600)',
  'color-primary-active': 'var(--sr-sunset-700)',
  'color-primary-disabled': 'var(--sr-sunset-200)',
  'color-on-primary': '#ffffff',

  // ---------- 实心按钮专用色板 ----------
  // on-solid 两套主题都是白色：实心按钮的文字不随主题翻转。
  // 因为文字固定为白，背景必须选足够深的色阶（尤其 warning，亮黄底白字不可读）。
  'color-on-solid': '#ffffff',
  // 必须引用语义变量而非硬编码色阶：主题色切换时 --sr-color-primary 会被
  // 内联样式或 [data-sr-primary] 覆写，这里的 color-mix 会自动跟着重算。
  // warning 基础色偏亮，压暗一档才能让白字达到可读对比度。
  'color-solid-primary': 'var(--sr-color-primary)',
  // 用 600 阶而非压暗 500 阶：新色板里 600 本身就是高饱和的翡翠/琥珀，
  // 再 color-mix 加黑会退回老气的深绿/土棕
  'color-solid-success': 'var(--sr-success-600)',
  'color-solid-warning': 'var(--sr-warning-600)',
  'color-solid-danger': 'var(--sr-danger-600)',

  // 文字专用主色：直接拿 sunset-500 当文字只有约 2.9:1，达不到正文 4.5:1
  'color-primary-text': 'var(--sr-sunset-700)',
  // alpha 派生：运行期切换主题色时由 useSrTheme 用 color-mix 覆写
  // 必须由 --sr-color-primary 派生：写死 rgba 会让主题色切到绿/紫后
  // hover 与焦点环仍是橙色。srgb 空间混合才等价于「原色 + 透明度」。
  'color-primary-alpha-25': 'color-mix(in srgb, var(--sr-color-primary) 25%, transparent)',
  'color-primary-alpha-12': 'color-mix(in srgb, var(--sr-color-primary) 12%, transparent)',
  'color-primary-alpha-08': 'color-mix(in srgb, var(--sr-color-primary) 8%, transparent)',

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
  // 骨架屏：底色比 border-subtle 略深一点，才能在浅底上分辨出「这是一块占位」
  'skeleton-bg': 'rgba(16, 20, 26, 0.07)',
  // 扫光的高光，比底色亮一档
  'skeleton-shine': 'rgba(255, 255, 255, 0.65)',
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
  'color-bg-inverse': 'var(--sr-night-100)',

  // ---------- 边框 ----------
  'color-border': 'rgba(255, 255, 255, 0.12)',
  'color-border-strong': 'rgba(255, 255, 255, 0.22)',
  'color-border-subtle': 'rgba(255, 255, 255, 0.08)',
  'color-border-disabled': 'rgba(255, 255, 255, 0.10)',

  // ---------- 主色 ----------
  'color-primary': 'var(--sr-sunset-400)',
  'color-primary-hover': 'var(--sr-sunset-300)',
  'color-primary-active': 'var(--sr-sunset-200)',
  'color-primary-disabled': 'var(--sr-sunset-900)',
  'color-on-primary': '#1a0e05',

  // 实心按钮：文字仍固定白色，背景改用 600 阶保证对比度
  // （暗色下原先的 400 阶太亮，白字会糊在一起）
  'color-on-solid': '#ffffff',
  // 同样从动态语义色派生；暗色下 400 阶太亮，统一压暗 22%
  'color-solid-primary': 'color-mix(in oklab, var(--sr-color-primary) 78%, black)',
  // 状态色不跟主题色变化，两套主题统一用 600 阶即可；
  // 只有 primary 需要压暗，因为它跟随动态主色
  'color-solid-success': 'var(--sr-success-600)',
  'color-solid-warning': 'var(--sr-warning-600)',
  'color-solid-danger': 'var(--sr-danger-600)',

  'color-primary-text': 'var(--sr-sunset-300)',
  'color-primary-alpha-25': 'color-mix(in srgb, var(--sr-color-primary) 25%, transparent)',
  'color-primary-alpha-12': 'color-mix(in srgb, var(--sr-color-primary) 12%, transparent)',
  'color-primary-alpha-08': 'color-mix(in srgb, var(--sr-color-primary) 8%, transparent)',

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
  // 暗色下用白色低透明度做底，高光反过来用「更亮」的白
  'skeleton-bg': 'rgba(255, 255, 255, 0.09)',
  'skeleton-shine': 'rgba(255, 255, 255, 0.14)',
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

  // 按钮圆角单独收敛：玻璃风格下全局 radius-base 是 12px，
  // 按钮跟着用会显得过于圆润（像药丸），这里保持扁平风格一致
  'button-radius': 'var(--sr-radius-base)',

  // 表单控件圆角：固定值，不随质感也不随尺寸变化。
  // glass 的 radius-base 是 12px，而 xs 输入框只有 24px 高 ——
  // 12px 恰好是高度的一半，会变成半圆/药丸；各尺寸统一 6px 才利落。
  'form-radius': '6px',

  // 弹层（select 菜单等）独立取更透的底 + 玻璃亮边。
  // bg-elevated 在 glass 下仍是 0.84 不透明，backdrop-filter 几乎看不出效果。
  'color-bg-popover': 'var(--sr-color-bg-elevated)',
  'color-bg-modal': 'var(--sr-color-bg-elevated)',
  'popover-border-color': 'var(--sr-color-border)',

  // 复选框「一点点」圆角：比 radius-sm(2px) 明显，又不到 form-radius(6px) 那么圆润
  'control-radius': '4px',

  // Switch 滑块：它是浮在轨道上的实体，flat 下就是纯白，不该透出轨道色
  'switch-handle-bg': '#ffffff',
  'switch-handle-shadow': 'var(--sr-shadow-sm)',

  // Tooltip 黑 / 白两套预设底色，flat 下用实色
  'tooltip-bg-dark': '#1c2027',
  'tooltip-bg-light': '#ffffff',
  'tooltip-border-light': 'var(--sr-color-border)',
  // 单行气泡只有约 30px 高，跟随 glass 的 radius-base(12px) 会变成椭圆；
  // 圆角固定小值，与表单控件一致
  'tooltip-radius': '6px',
  'tooltip-sheen': 'none',
  // 反馈浮层（轻提示 / 全局消息 / 通知）共用底色：flat 下实色
  'feedback-bg': 'var(--sr-color-bg-elevated)',
  'feedback-sheen': 'none',
  'feedback-radius': '8px',

  'shadow-sm': '0 1px 2px rgba(16, 20, 26, 0.06)',
  'shadow-md': '0 2px 8px rgba(16, 20, 26, 0.08)',
  'shadow-lg': '0 8px 24px rgba(16, 20, 26, 0.1)',
  'shadow-xl': '0 16px 48px rgba(16, 20, 26, 0.14)',
  'shadow-focus': '0 0 0 3px var(--sr-color-primary-alpha-25)',
  'shadow-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
  // 彩色辉光半径：flat 为 0（视觉无辉光），glass 才是真的发光
  'shadow-glow-blur': '0px',

  'glass-blur': '0px',
  'glass-saturate': '100%',
  // flat 用 none 而非 blur(0)：后者仍会创建无意义的合成层
  'glass-filter': 'none',
  'glass-filter-strong': 'none',
  'glass-filter-hero': 'none',
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

  // 比全局 radius-base（12px）小 2px —— 只影响按钮，其它表面保持原有圆角
  'button-radius': 'calc(var(--sr-radius-base) - 2px)',

  // 表单控件沿用扁平档圆角，避免小尺寸变药丸
  'form-radius': '6px',
  'color-bg-popover': 'var(--sr-color-bg-elevated)',
  'popover-border-color': 'var(--sr-glass-border-color)',

  'shadow-sm': '0 2px 8px rgba(16, 20, 26, 0.06)',
  'shadow-md': '0 8px 24px -6px rgba(16, 20, 26, 0.12)',
  'shadow-lg': '0 16px 48px -12px rgba(16, 20, 26, 0.18)',
  'shadow-xl': '0 32px 80px -16px rgba(16, 20, 26, 0.24)',
  'shadow-focus': '0 0 0 3px var(--sr-color-primary-alpha-25)',
  'shadow-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.24)',
  // 玻璃质感的核心特征之一：实体按钮向外散发同色柔光
  'shadow-glow-blur': '22px',

  'glass-blur': '16px',
  'glass-saturate': '180%',
  'glass-filter': 'blur(16px) saturate(180%)',
  // 浮层（下拉菜单等）用更强的模糊：面积小、悬浮在内容之上，
  // 模糊不足时半透明底会显得像"没生效的白板"
  'glass-filter-strong': 'blur(28px) saturate(200%)',
  // 面积小但内容密集的面板（日期选择器）再强一档：
  // 28px 不足以把背后的正文糊成色块，文字轮廓会干扰阅读
  'glass-filter-hero': 'blur(40px) saturate(220%)',
  'glass-highlight': 'inset 0 1px 0 rgba(255, 255, 255, 0.55)',
  'glass-border-width': '1px',
  'glass-border-color': 'rgba(255, 255, 255, 0.55)',

  'control-radius': '4px',

  // Switch 滑块原本取 --sr-color-bg-container(0.72)，叠在主色轨道上会透成浅蓝，
  // 看着只是「变了透明度」。收实到 0.92，再补顶部高光与主色柔光做出体积感。
  'switch-handle-bg': 'rgba(255, 255, 255, 0.92)',
  'switch-handle-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 2px 8px rgba(16, 20, 26, 0.14)',

  // Tooltip 换半透玻璃底，模糊与亮边由组件叠加
  // 气泡面积小，0.7+ 的不透明度会把模糊完全盖住，只显得「颜色变浅」。
  // 放到 0.55 左右并配强模糊，才能看到背后被磨砂的内容
  // 黑气泡太透会发灰、文字发虚；收实到 0.82，玻璃感交给模糊 / 高光 / 反光
  // 深色气泡在白底上本来就有对比，可以实一点；浅色气泡压在浅色页面上
  // 必须更透才能看出玻璃，否则就是一块白
  'tooltip-bg-dark': 'rgba(22, 26, 33, 0.78)',
  'tooltip-bg-light': 'rgba(255, 255, 255, 0.44)',
  // 白气泡叠在浅色页面上时白亮边会整个融掉，改用可见的深色细线
  'tooltip-border-light': 'rgba(16, 20, 26, 0.2)',
  'tooltip-radius': '6px',
  // 斜向反光：玻璃片的标志，比单纯半透色块更容易被认出来
  'tooltip-sheen': 'linear-gradient(155deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 55%)',
  // 反馈浮层比容器更透，才看得到背后被磨砂的内容
  'feedback-sheen': 'linear-gradient(155deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0) 55%)',
  'feedback-radius': '8px',

  // 位移衰减：毛玻璃层内做位移动画会掉帧，距离减半
  'motion-distance-sm': '3px',
  'motion-distance-md': '6px',
  'motion-distance-lg': '12px',
}

/**
 * 玻璃质感 · 亮色表面
 *
 * 关键：背景必须半透明。若仍是 #fff 实色，backdrop-filter 背后没有任何东西可模糊，
 * 视觉上就只剩边框和圆角变化 —— 等于毛玻璃完全失效。
 */
export const glassSurfaceLight: Record<string, string> = {
  'color-bg-container': 'rgba(255, 255, 255, 0.72)',
  'color-bg-elevated': 'rgba(255, 255, 255, 0.84)',
  'color-bg-sunken': 'rgba(237, 239, 243, 0.55)',
  // 浮层比容器更透，才看得到背后被模糊的内容。
  // 这一档是基准：下拉菜单用它，效果最接近「玻璃」。
  'color-bg-popover': 'rgba(255, 255, 255, 0.42)',
  // 弹窗面积大、内容多，比下拉实一档，但仍要能看出被模糊的背景
  'color-bg-modal': 'rgba(255, 255, 255, 0.68)',
  // 提示类向 popover 靠：它们只是小块浮层，太实就没有玻璃感了
  'feedback-bg': 'rgba(255, 255, 255, 0.48)',
}

/** 玻璃质感 · 暗色表面 */
export const glassSurfaceDark: Record<string, string> = {
  'color-bg-container': 'rgba(28, 32, 39, 0.62)',
  'color-bg-elevated': 'rgba(43, 48, 56, 0.74)',
  'color-bg-sunken': 'rgba(11, 14, 18, 0.6)',
  'color-bg-popover': 'rgba(38, 43, 51, 0.52)',
  'color-bg-modal': 'rgba(38, 43, 51, 0.7)',
  'feedback-bg': 'rgba(38, 43, 51, 0.56)',
}

/**
 * 交叉修正 · 暗色 + 玻璃
 * 暗底上的玻璃要更暗更透，高光要更弱
 */
export const glassDark: Record<string, string> = {
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
  return { ...glassSurfaceDark, ...glassDark, ...shadowDarkGlass }
}
