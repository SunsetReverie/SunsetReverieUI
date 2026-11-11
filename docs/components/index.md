---
pageClass: components-index
---

# 组件概览

当前共 **71 个组件**，每篇都有独立文档。命名统一用 `Sr` 前缀，全部支持亮色/暗色 × 毛玻璃/扁平四种组合。下表分组与侧边栏一致，点击即可进入对应文档。

## 组件索引

| 分类 | 组件 |
| --- | --- |
| 基础 | [`SrButton`](/components/button)、[`SrInput`](/components/input)、[`SrTextarea`](/components/textarea)、[`SrComment`](/components/comment)、[`SrMusicPlayer`](/components/music-player)、[`SrIcon`](/components/icon)、[`SrSpinner`](/components/spinner)、[`SrProgress`](/components/progress)、[`SrStatistic`](/components/statistic)、[`SrTile`](/components/tile)、[`SrLoading`](/components/loading) |
| 布局与配置 | [`SrRow`](/components/row)、[`SrCol`](/components/col)、[`SrConfigProvider`](/components/config-provider)、[`SrTransition`](/components/transition) |
| 浮层 | [`SrTooltip`](/components/tooltip) |
| 数据录入 | [`SrForm`](/components/form)、[`SrSelect`](/components/select)、[`SrCascader`](/components/cascader)、[`SrTransfer`](/components/transfer)、[`SrColorPicker`](/components/color-picker)、[`SrEmojiPicker`](/components/emoji-picker)、[`SrQRCode`](/components/qrcode)、[`SrCodeBlock`](/components/code-block)、[`SrMarkdown`](/components/markdown)、[`SrMarkdownEditor`](/components/markdown-editor)、[`SrInputNumber`](/components/input-number)、[`SrCheckbox`](/components/checkbox)、[`SrRadio`](/components/radio)、[`SrSwitch`](/components/switch)、[`SrSlider`](/components/slider)、[`SrDatePicker`](/components/date-picker)、[`SrCalendar`](/components/calendar) |
| 数据展示 | [`SrChart`](/components/chart)、[`SrChinaMap`](/components/china-map)、[`SrTable`](/components/table)、[`SrPagination`](/components/pagination)、[`SrLoadMore`](/components/load-more)、[`SrUpload`](/components/upload)、[`SrTree`](/components/tree)、[`SrVirtualList`](/components/virtual-list) |
| 展示元素 | [`SrTag`](/components/tag)、[`SrAlert`](/components/alert)、[`SrSteps`](/components/steps)、[`SrDescriptions`](/components/descriptions)、[`SrCollapse`](/components/collapse)、[`SrSegmented`](/components/segmented)、[`SrTimeline`](/components/timeline)、[`SrBadge`](/components/badge)、[`SrAvatar`](/components/avatar)、[`SrImage`](/components/image)、[`SrEmpty`](/components/empty)、[`SrResult`](/components/result)、[`SrSkeleton`](/components/skeleton) |
| 容器 | [`SrCard`](/components/card)、[`SrDivider`](/components/divider)、[`SrSpace`](/components/space)、[`SrPanel`](/components/panel)、[`SrCarousel`](/components/carousel) |
| 导航 | [`SrNav`](/components/nav)、[`SrTabs`](/components/tabs)、[`SrDropdown`](/components/dropdown)、[`SrContextMenu`](/components/context-menu)、[`SrBreadcrumb`](/components/breadcrumb)、[`SrAnchor`](/components/anchor) |
| 反馈 | [`SrModal`](/components/modal)、[`SrDrawer`](/components/drawer)、[`SrConfirm`](/components/confirm) |
| 全局提示 | [`SrToast`](/components/toast)、[`SrMessage`](/components/message)、[`SrNotification`](/components/notification) |

`SrRow` 与 `SrCol` 共用一套栅格演示，但各有独立文档与 Props 表；[Row 文档](/components/row) 里同时列出两者的来源分组。

## 文档状态

| 状态 | 数量 |
| --- | --- |
| 组件目录 | 71 |
| 组件文档 | 71 篇 |
| 组件演示 | 70 页（`SrCol` 并入 Row 演示） |
| API 事实源 | 71 组，由 `pnpm gen:demo-props` 从源码提取 |

> 文档按「每篇对照组件源码的 props / emits / slots 声明」来写，不依赖演示站的速查表。`pnpm lint` 里的 `check-docs` 会核对 Props / 事件 / 插槽表、站内链接与侧边栏覆盖，防止文档与代码脱节。

## 演示站

组件的实际效果在演示站里看，比文档截图更直观：

| 页面 | 内容 |
| --- | --- |
| 概览 | 开场介绍（定位与卖点）+ 24 栅格的等分、响应式、间隔与位移演算 |
| 主题实验室 | 明暗 / 质感 / 主题色的状态与根属性、flat 与 glass 并排对比、玻璃参数与派生色阶 |
| 断点实验室 | 断点比例尺、区间表、响应式栅格示例、`useSrBreakpoint` 与媒体查询的同源用法 |
| 视觉审计 | 四个「明暗 × 质感」组合下按钮 / 表单 / 反馈 / 数据的对照，外加按真实计算色算出的 WCAG 对比度读数 |
| 后台布局 | 侧栏可折叠 + 固定 header + 独立滚动内容区的完整骨架，表格与统计接真实注册表数据 |
| 拖拽排序 | 列表 / 卡片 / 树三种拖拽场景 |
| 组件演示 | 一组件一页，共 68 页；顶栏可搜索，每页都能展开并复制该页真实源码 |

演示站的命令见根目录 README：`pnpm dev` 起本地站，`pnpm check:demo` 遍历全部演示页做冒烟，`pnpm check:visual` 比对视觉基线。
