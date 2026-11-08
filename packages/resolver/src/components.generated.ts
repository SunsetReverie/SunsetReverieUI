/**
 * 组件清单（自动生成，请勿手改）
 *
 * 由 `pnpm gen:components` 扫描 packages/ui/src/components 生成。
 * resolver 依赖这份列表把 <sr-button> 解析到 @sunset-reverie/ui/button。
 */

/** 所有组件的 PascalCase 名（不含 Sr 前缀） */
export const SR_COMPONENT_NAMES = [
  'Alert',
  'Avatar',
  'Badge',
  'Breadcrumb',
  'Button',
  'Card',
  'Carousel',
  'Cascader',
  'Checkbox',
  'CheckboxGroup',
  'Col',
  'Collapse',
  'ColorPicker',
  'ConfigProvider',
  'Confirm',
  'DatePicker',
  'Descriptions',
  'Divider',
  'Drawer',
  'Dropdown',
  'Empty',
  'Form',
  'FormItem',
  'Icon',
  'Image',
  'Input',
  'InputNumber',
  'LoadMore',
  'Modal',
  'Nav',
  'Pagination',
  'Panel',
  'Progress',
  'QRCode',
  'Radio',
  'RadioGroup',
  'Result',
  'Row',
  'Segmented',
  'Select',
  'Skeleton',
  'Slider',
  'Space',
  'Spinner',
  'Steps',
  'Switch',
  'Table',
  'Tabs',
  'Tag',
  'Timeline',
  'Tooltip',
  'Transfer',
  'Transition',
  'Tree',
  'Upload',
  'VirtualList',
] as const

/** 组件名联合类型，供类型体操与文档生成使用 */
export type SrComponentName = (typeof SR_COMPONENT_NAMES)[number]
