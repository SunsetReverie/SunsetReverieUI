/**
 * 组件清单（自动生成，请勿手改）
 *
 * 由 `pnpm gen:components` 扫描 packages/ui/src/components 生成。
 * Nuxt module 依赖这份列表在启动时批量 addComponent。
 */

/** 所有组件的 PascalCase 名（不含 Sr 前缀） */
export const SR_COMPONENT_NAMES = [
  'Button',
  'Checkbox',
  'CheckboxGroup',
  'Col',
  'ConfigProvider',
  'Form',
  'FormItem',
  'Icon',
  'Input',
  'Modal',
  'Radio',
  'RadioGroup',
  'Row',
  'Select',
  'Spinner',
  'Switch',
  'Tooltip',
  'Transition',
] as const

/** 组件名联合类型，供类型体操与文档生成使用 */
export type SrComponentName = (typeof SR_COMPONENT_NAMES)[number]
