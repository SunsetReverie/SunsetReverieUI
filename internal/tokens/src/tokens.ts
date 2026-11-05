/**
 * SunsetReverie-UI 设计 Token 唯一手写源
 *
 * 约定：
 * 1. 所有数值只在这里出现一次，Less / CSS / TS 三份产物由 scripts/build.ts 生成
 * 2. 键名遵循第二章命名规范（kebab-case 分段，不带 --sr- / @sr- 前缀）
 * 3. 修改本文件后必须重新执行 `pnpm build:tokens`
 */

/** 断点定义：单位 px，与 CSS 媒体查询、JS matchMedia 共用同一份数值 */
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const

/** 断点代号 */
export type SrBreakpoint = keyof typeof breakpoints

/** 断点顺序 */
export const breakpointOrder: readonly SrBreakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl']

/**
 * 间距阶梯（4px 基数）
 * 用数组而非对象：保证生成顺序稳定，且允许 '0-5' 这类非纯数字键不被打乱
 */
export const spacings: ReadonlyArray<{ name: string; value: number }> = [
  { name: '0', value: 0 },
  { name: '0-5', value: 2 },
  { name: '1', value: 4 },
  { name: '1-5', value: 6 },
  { name: '2', value: 8 },
  { name: '3', value: 12 },
  { name: '4', value: 16 },
  { name: '5', value: 20 },
  { name: '6', value: 24 },
  { name: '8', value: 32 },
  { name: '10', value: 40 },
  { name: '12', value: 48 },
  { name: '16', value: 64 },
]

/** 字号阶梯（px） */
export const fontSizes = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 38,
} as const

/** 行高（px），与字号一一对应 */
export const lineHeights = {
  xs: 20,
  sm: 20,
  base: 22,
  md: 26,
  lg: 30,
  xl: 34,
  '2xl': 40,
  '3xl': 48,
} as const

/** 动效时长（ms） */
export const durations = {
  instant: 0,
  fast: 120,
  base: 240,
  slow: 360,
  slower: 520,
} as const

/** 动效缓动曲线 */
export const easings = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  linear: 'linear',
} as const

/** 动效位移（px） */
export const distances = {
  sm: 6,
  md: 12,
  lg: 24,
} as const

/**
 * 圆角：flat / glass 两套值
 * base 是可变 Token —— 组件必须写 var(--sr-radius-base) 而不是硬编码 6px
 */
export const radii = {
  flat: { none: 0, sm: 2, base: 6, md: 8, lg: 12, xl: 16, '2xl': 24, full: 9999 },
  glass: { none: 0, sm: 2, base: 12, md: 14, lg: 18, xl: 22, '2xl': 28, full: 9999 },
} as const

/** 色阶顺序，用于生成与展示 */
export const paletteSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

/** 色系元信息：key 用于变量名，label / role 供文档与 Gallery 展示 */
export const paletteSeries = [
  { key: 'sunset', label: '落日橙', role: '主色' },
  { key: 'dusk', label: '霞紫', role: '辅色' },
  { key: 'ember', label: '霞粉', role: '强调' },
  { key: 'night', label: '暮蓝灰', role: '中性' },
  { key: 'success', label: '成功', role: '语义' },
  { key: 'warning', label: '警告', role: '语义' },
  { key: 'danger', label: '危险', role: '语义' },
  { key: 'info', label: '信息', role: '语义' },
] as const

/**
 * L1 原始色板
 * 纯数值、无语义、不随主题变化。禁止在组件中直接引用，必须经 L2 语义层。
 */
export const palette: Record<string, Record<number, string>> = {
  sunset: {
    50: '#FFF4ED',
    100: '#FFE6D5',
    200: '#FFC9A8',
    300: '#FFA877',
    400: '#FF8B52',
    500: '#FF7A45',
    600: '#F25C22',
    700: '#CC4512',
    800: '#A3370F',
    900: '#7A290C',
    950: '#451606',
  },
  dusk: {
    50: '#F5F2FA',
    100: '#E8E1F4',
    200: '#D0C4E8',
    300: '#B3A0D9',
    400: '#9580C7',
    500: '#7A64B5',
    600: '#634E9C',
    700: '#4E3D7D',
    800: '#3B2E5E',
    900: '#291F42',
    950: '#171128',
  },
  ember: {
    50: '#FFF1F3',
    100: '#FFDDE3',
    200: '#FFB8C6',
    300: '#FF8DA4',
    400: '#FF6685',
    500: '#F5456B',
    600: '#D42B51',
    700: '#AE1F3F',
    800: '#871831',
    900: '#5F1123',
    950: '#360912',
  },
  night: {
    50: '#F7F8FA',
    100: '#EDEFF3',
    200: '#DCE0E8',
    300: '#C2C8D4',
    400: '#9AA2B1',
    500: '#6E7787',
    600: '#565E6C',
    700: '#404652',
    800: '#2B3038',
    900: '#1C2027',
    950: '#0F1216',
  },
  success: {
    50: '#EAF7EE',
    100: '#CDEED6',
    200: '#9BDCB0',
    300: '#63C784',
    400: '#3CB25F',
    500: '#2E9B4E',
    600: '#227D3D',
    700: '#1A612F',
    800: '#134723',
    900: '#0C2F17',
    950: '#06180C',
  },
  warning: {
    50: '#FFF8E6',
    100: '#FFEDC2',
    200: '#FFDB8A',
    300: '#FFC64D',
    400: '#FFB01F',
    500: '#E89500',
    600: '#C07800',
    700: '#985E00',
    800: '#704500',
    900: '#482C00',
    950: '#241600',
  },
  danger: {
    50: '#FFF0F0',
    100: '#FFD9D9',
    200: '#FFB0B3',
    300: '#FF8085',
    400: '#F9555C',
    500: '#E03137',
    600: '#BC2228',
    700: '#94191E',
    800: '#6D1216',
    900: '#460B0E',
    950: '#230507',
  },
  info: {
    50: '#EDF5FF',
    100: '#D6E7FF',
    200: '#ADCFFF',
    300: '#7DB2FF',
    400: '#4D94FF',
    500: '#2578F5',
    600: '#155ED1',
    700: '#0D47A8',
    800: '#09337D',
    900: '#052154',
    950: '#02102B',
  },
}
