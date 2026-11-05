/**
 * 预设主题色
 *
 * 走 CSS 属性选择器（`[data-sr-primary='dusk']`）而不是内联变量，
 * 好处是服务端渲染时就能输出正确颜色，无需等 JS 执行 —— 见规划文档 5.4 的方案 B。
 * 任意自定义色才走内联变量（方案 C）。
 */

/** 单个预设 */
export interface SrThemePreset {
  /** 代号，用于 data-sr-primary 属性值 */
  key: string
  /** 展示名 */
  label: string
  /** 主色 */
  primary: string
  /** 一句话说明该色的气质，供文档与 Gallery 使用 */
  mood: string
}

/** 预设主题色列表 */
export const themePresets: readonly SrThemePreset[] = [
  { key: 'sunset', label: '落日橙', primary: '#FF7A45', mood: '默认，暖而不刺' },
  { key: 'dusk', label: '霞紫', primary: '#7A64B5', mood: '沉静，适合工具型产品' },
  { key: 'ember', label: '余烬红', primary: '#F5456B', mood: '张扬，强调行动' },
  { key: 'night', label: '暮蓝', primary: '#2578F5', mood: '克制，偏企业风格' },
  { key: 'jade', label: '青苔绿', primary: '#2E9B4E', mood: '自然，偏内容型产品' },
]
