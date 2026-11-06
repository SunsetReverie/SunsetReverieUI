/**
 * 组件清单（自动生成，请勿手改）
 *
 * 由 `pnpm gen:components` 扫描 packages/ui/src/components 生成。
 * resolver 依赖这份列表把 <sr-button> 解析到 @sunset-reverie/ui/button。
 */

/** 所有组件的 PascalCase 名（不含 Sr 前缀） */
export const SR_COMPONENT_NAMES = [
  'Button',
  'Checkbox',
  'CheckboxGroup',
  'Col',
  'ConfigProvider',
  'Confirm',
  'Form',
  'FormItem',
  'Icon',
  'Input',
  'InputNumber',
  'LoadMore',
  'Modal',
  'Pagination',
  'Radio',
  'RadioGroup',
  'Row',
  'Select',
  'Spinner',
  'Switch',
  'Table',
  'Tag',
  'Tooltip',
  'Transition',
] as const

/** 组件名联合类型，供类型体操与文档生成使用 */
export type SrComponentName = (typeof SR_COMPONENT_NAMES)[number]
