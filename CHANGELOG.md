# 更新日志

本文件记录每次发布的变更。版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)，
当前处于 `0.x` 阶段：**破坏性变更只进 MINOR**，PATCH 只放修复。

---

## [0.1.0] - 2026-11-07

首个开发预览版。34 个组件、双风格主题系统、SSR 与水合保障链路。

> 这是 `0.x` 阶段的起点，API 仍可能变动。接入时请锁定 tag，并留意 CHANGELOG 里的 **BREAKING** 标注。

### 新增 · 组件（34 个）

**基础**

- `SrButton` — 变体 / 尺寸 / 加载 / 图标 / 圆角与自定义背景色
- `SrIcon` — Iconify 离线子集，编译期扫描、运行时不发请求
- `SrSpinner` — 环形加载指示器
- `SrTag` — 六种语义色、深浅两档、自定义基色、可关闭

**布局**

- `SrRow` / `SrCol` — 24 栅格，响应式 span 全部由 CSS 媒体查询完成
- `SrCard` — 三段式容器，`padding` 可单独覆盖档位
- `SrPanel` — 轻量分区面板，支持折叠
- `SrConfigProvider` — 尺寸与弹层层级下发

**表单**

- `SrInput` — 前后缀 / 清空 / 密码可见 / 字数统计 / 校验态
- `SrInputNumber` — 范围、步长、精度（自动抹平浮点误差）
- `SrSelect` — 单选 / 多选 / 搜索 / 可清空
- `SrCheckbox` / `SrCheckboxGroup` — 单用与组用两种模式，支持半选
- `SrRadio` / `SrRadioGroup` — 组内互斥，方向键切换
- `SrSwitch` — 三元状态（正常 / 禁用 / 加载）
- `SrForm` / `SrFormItem` — 规则校验（含异步）、三种标签布局、`validate` / `validateField` / `clearValidate`

**数据展示**

- `SrTable` — 列配置驱动，排序（客户端 / 服务端）、多选、展开行、固定列、分页、懒加载、窄屏卡片视图
- `SrPagination` — 页码收敛、每页条数、跳页、简洁模式
- `SrLoadMore` — 三态枚举，自动模式会探测最近的滚动祖先
- `SrBadge` — 数字角标与状态点（`processing` 呼吸脉冲）
- `SrAvatar` — 图片失败回退，底色按 `alt` 散列自动取色
- `SrEmpty` — 图标 / 插图 / 虚线框 / 操作区

**导航**

- `SrNav` — 水平与垂直、分组折叠、两级子菜单、整体收起、品牌区与底部区、`activeStyle` 双激活语言、`bare` 去壳模式
- `SrTabs` — 四种外观（line / card / segment / pill）、垂直方向、透明模式、懒加载
- `SrBreadcrumb` — 图标分隔符、超长折叠、禁用项
- `SrDropdown` — 内置菜单与 `#menu` 自定义面板、点击 / 悬停触发、视口变化重定位

**反馈**

- `SrModal` — 遮罩 / 焦点陷阱 / 嵌套 / 全屏
- `SrDrawer` — 四方向、尺寸预设、圆角形态（`inset`）、滚动锁
- `SrTooltip` — 12 方向、自动翻转、延迟显隐
- `SrToast` / `SrMessage` / `SrNotification` — 命令式全局提示，各自的位置、时长与承载能力不同
- `SrConfirm` — 命令式确认框，`Promise<boolean>`，`onConfirm` 返回 Promise 时自动 loading

**基建**

- `SrTransition` — 五套预设过渡，统一处理 `prefers-reduced-motion`

### 新增 · 设计系统

- **三层 Token**：L1 原始色板 → L2 语义映射 → L3 组件级，由 TypeScript 单一源生成 Less 变量、TS 常量与 CSS 变量
- **双质感风格**：`glass` 与 `flat` 共享同一批变量名、只覆写值，组件样式只写一次
- **亮暗双主题**：`light` / `dark` / `auto`，内联脚本在首帧前决定，无闪烁
- **品牌色预设**：8 组预设 + 任意自定义主色（派生 hover / active / text / 三档透明度）
- **动效三档**：`none` / `light` / `strong`，归零时不产生任何过渡帧
- **响应式内核**：`useSrBreakpoint`（resize + rAF），五档断点

### 新增 · 工程能力

- **构建**：多入口 + 独立 CSS，`exports` 顺序处理了 `./*` 通配截获样式子路径的坑
- **按需引入**：resolver 插件按需解析组件与样式
- **Nuxt 集成**：`@sunset-reverie/nuxt` module，自动注册组件、注入样式、防闪烁
- **SSR 冒烟测试**：30 个组件在 node 环境渲染，抓出过 `SrDrawer` 的 `document is not defined`
- **水合校验**：`pnpm check:hydration` 启动 Nuxt 产物 + Playwright，断言告警数为 0
- **覆盖守护**：`pnpm lint:smoke` 保证新组件必须进冒烟页，否则报错
- **Token 校验**：`pnpm lint:tokens` 对齐变量定义与引用，防「拼错变量名导致整条声明静默失效」
- **文档站**：34 篇组件文档，markdown 内直接渲染真实组件

### 已知限制

- 尚未实现 `SrDatePicker`、`SrTree`、`SrCarousel`、`SrUpload`
- `SrSelect` 只支持平铺选项，无分组与远程加载
- `SrTable` 的 `pagination` 与 `lazy` 语义互斥，同时开启会出现「加载没反应」
- Nuxt 演示站只覆盖 SSR 与水合验收，没有完整演示页面

---

## 发布流程备忘

```bash
pnpm changeset          # 描述本次变更
pnpm version-packages   # 汇总 changeset、升版本、写本文件
git commit -am "chore(release): vX.Y.Z"
git tag -a vX.Y.Z -m "release: X.Y.Z"
```

`0.x` 阶段破坏性变更进 MINOR，并在本文件中用 **BREAKING** 标注迁移方式。
