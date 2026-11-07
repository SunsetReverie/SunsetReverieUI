# 组件概览

当前共 **34 个组件**（含 `SrTransition`、`SrConfigProvider` 两个基建件）。命名统一用 `Sr` 前缀，全部支持亮色/暗色 × 毛玻璃/扁平四种组合。

## 已完成的组件

| 分类 | 组件 |
| --- | --- |
| 基础 | `SrIcon`、`SrButton`、`SrSpinner`、`SrTag` |
| 布局 | `SrRow`、`SrCol`、`SrCard`、`SrPanel`、`SrConfigProvider` |
| 数据录入 | `SrInput`、`SrInputNumber`、`SrSelect`、`SrCheckbox`、`SrCheckboxGroup`、`SrRadio`、`SrRadioGroup`、`SrSwitch`、`SrForm`、`SrFormItem` |
| 数据展示 | `SrTable`、`SrPagination`、`SrLoadMore`、`SrBadge`、`SrAvatar`、`SrEmpty` |
| 导航 | `SrNav`、`SrTabs`、`SrBreadcrumb`、`SrDropdown` |
| 反馈 | `SrModal`、`SrDrawer`、`SrToast`、`SrMessage`、`SrNotification`、`SrConfirm`、`SrTooltip` |
| 基建 | `SrTransition` |

## 文档状态

| 状态 | 组件 |
| --- | --- |
| 已写文档 | 30 篇：基础（Button / Input / Icon / Spinner）、布局（Row / Col / ConfigProvider / Transition）、表单（Form / Select / InputNumber / Checkbox / Radio / Switch）、展示（Table / Pagination / LoadMore / Tag / Badge / Avatar / Empty / Card / Panel）、导航（Nav / Tabs / Dropdown / Breadcrumb）、反馈（Modal / Drawer / Tooltip） |
| 待补文档 | 4 个：`SrConfirm`、`SrToast`、`SrMessage`、`SrNotification` |

> 文档按「每篇对照组件源码的 props / emits / slots 声明」来写，不依赖演示站的速查表。API 事实由 `pnpm docs:api`（`scripts/extract-api.mjs`）从源码提取，保证不遗漏。

## 演示站

组件的实际效果在演示站里看，比文档截图更直观：

| 页面 | 内容 |
| --- | --- |
| 概览 | 栅格与基础能力 |
| 基础组件 | Button / Icon / Tag / Pagination / LoadMore |
| 表单 | Input / Select / 表单校验 |
| 选择控件 | Checkbox / Radio / Switch |
| 数据表格 | 排序、多选、展开、固定列、分页、懒加载 |
| 容器与展示 | Card / Panel / Tabs / Drawer / Dropdown / Nav 等 |
| 反馈 | Modal / Toast / Message / Notification / Confirm |
| 后台布局 | 侧栏 + header 的完整骨架 |
| 主题实验室 | 主色、质感、动效的实时切换 |
| 断点实验室 | 响应式行为 |
| 视觉审计 | 四种组合的对照验收 |
