/**
 * 组件清单（自动生成，请勿手改）
 *
 * 由 `pnpm gen:components` 扫描 packages/ui/src/components 生成。
 * Nuxt module 依赖这份列表在启动时批量 addComponent。
 */

/** 所有组件的 PascalCase 名（不含 Sr 前缀） */
export const SR_COMPONENT_NAMES = [
  'Avatar',
  'Badge',
  'Breadcrumb',
  'Button',
  'Card',
  'Carousel',
  'Checkbox',
  'CheckboxGroup',
  'Col',
  'ConfigProvider',
  'Confirm',
  'DatePicker',
  'Drawer',
  'Dropdown',
  'Empty',
  'Form',
  'FormItem',
  'Icon',
  'Input',
  'InputNumber',
  'LoadMore',
  'Modal',
  'Nav',
  'Pagination',
  'Panel',
  'Progress',
  'Radio',
  'RadioGroup',
  'Row',
  'Select',
  'Skeleton',
  'Spinner',
  'Switch',
  'Table',
  'Tabs',
  'Tag',
  'Tooltip',
  'Transition',
  'Tree',
  'Upload',
] as const

/** 组件名联合类型，供类型体操与文档生成使用 */
export type SrComponentName = (typeof SR_COMPONENT_NAMES)[number]
