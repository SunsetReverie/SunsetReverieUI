# SunsetReverie-UI（夕梦 UI）

自用 / 团队内部的 Vue 3 + Nuxt 4 UI 组件库。**不发布到 NPM**，只托管在私有 Git 仓库，通过 tag 分发。

- 品牌缩写：**SR**
- 技术栈：Vue 3 · Nuxt 4 · TypeScript · Less · Vite（库模式）· pnpm monorepo
- 规划文档：[`docs/夕梦UI组件库开发规划.md`](./docs/夕梦UI组件库开发规划.md)

---

## 当前进度：W10 已完成，并提前交付了一批 P2 组件

### W1 · 立项与基建

| 项 | 状态 |
| --- | --- |
| pnpm workspace 骨架 | ✅ |
| 四个子包空骨架 + 构建脚本 | ✅ |
| ESLint / Prettier / Stylelint / commitlint / husky | ✅ |
| 三个校验脚本（命名、图标、产物） | ✅ |
| CI 骨架（GitHub Actions） | ✅ |

### W2 · Token 与设计系统

| 项 | 状态 |
| --- | --- |
| L1 原始层生成（8 色系 × 11 阶、间距、字号、动效） | ✅ |
| L2 语义层生成（亮暗两套、背景层级、状态色、遮罩） | ✅ |
| 质感层生成（flat / glass 两套 + 暗色交叉修正） | ✅ |
| Less mixin（断点 5 个 + 工具 8 个） | ✅ |
| 过渡类（fade / fade-up / zoom / list / collapse） | ✅ |
| 响应式工具类（4 断点 × 10 类，≈2KB gzip） | ✅ |
| Token Gallery 生成版（由 tokens 注入，非手写） | ✅ |

### W3 · 主题与响应式内核

| 项 | 状态 |
| --- | --- |
| `useSrTheme`（状态机 / 持久化 / 系统跟随 / 跨标签页同步 / 主色注入） | ✅ |
| `useSrBreakpoint`（resize + rAF，SSR 安全，作用域外调用不告警） | ✅ |
| SSR 防闪烁脚本生成器（`srThemeInitScript` / `SR_THEME_INIT_SNIPPET`） | ✅ |
| `SrRow` / `SrCol`（24 栅格 + 响应式 span/offset/push/pull/gutter） | ✅ |
| `playground-vue3`（栅格概览 / 主题实验室 / 断点实验室） | ✅ |
| 单元测试 34 个（两个内核 + 两个组件 + 脚本生成） | ✅ |
| SSR 渲染测试 8 个（`@vitest-environment node`，无 window 环境） | ✅ |
| 水合一致性测试 4 个（SSR → hydrate，监听 Hydration 告警） | ✅ |

### W4 · 基础组件

| 项 | 状态 |
| --- | --- |
| `SrConfigProvider` + `useSrConfig`（尺寸 / 层级，支持嵌套覆盖） | ✅ |
| `SrTransition`（5 种内置过渡，`enabled` 可整体关闭） | ✅ |
| `SrIcon`（size/color/flip/rotate/spin/label，SSR 安全） | ✅ |
| 离线图标子集化（16 个图标 / 2 个集合 / ≈5KB） | ✅ |
| `SrButton`（5 变体 / 响应式 size / loading / icon / block / round） | ✅ |
| `playground-vue3` 组件页 | ✅ |
| `playground-nuxt4`（手写 plugin，SSR 水合验证，0 告警） | ✅ |
| 单元测试 77 个 | ✅ |

### W5 · 输入与反馈

| 项 | 状态 |
| --- | --- |
| `SrInput`（v-model / 前后缀 / 清空 / 密码切换 / 字数统计 / 校验态 / textarea 自适应） | ✅ |
| `SrModal`（Teleport / 焦点陷阱 / 滚动锁定 / Esc / 嵌套层级 / xs 全屏） | ✅ |
| `SrToast`（命令式 API / 6 个位置 / 队列 / 上限 5 条 / 手动关闭） | ✅ |
| `playground-vue3` 新增「表单」「反馈」两个视图 | ✅ |
| 单元测试 123 个（含 SSR 与列表渲染） | ✅ |

### W6 · 构建发布链路

| 项 | 状态 |
| --- | --- |
| 多入口构建（9 个组件各自独立入口 + 类型声明） | ✅ |
| 样式三份产出（`base.css` / `style.css` / `components/<n>/style.css`） | ✅ |
| 无样式组件产出占位 CSS（`config-provider`、`transition`） | ✅ |
| `resolver` 组件清单自动同步（`pnpm gen:components`） | ✅ |
| `@sunset-reverie/icons` 降为构建期依赖（决策 D-04 落地） | ✅ |
| 产物校验三层（exports / 组件三件套 / 清单一致性） | ✅ |
| 端到端验证：tgz 装进全新项目（Vite 8）构建并渲染通过 | ✅ |

### W7 · Nuxt 集成与文档站

| 项 | 状态 |
| --- | --- |
| `@sunset-reverie/nuxt` module（样式 / 组件 / 自动导入 / 防闪烁四合一） | ✅ |
| `playground-nuxt4` 改为两行配置接入，删掉手写 plugin | ✅ |
| SSR 输出验证：根属性正确、脚本先于 CSS、组件与图标服务端渲染 | ✅ |
| 水合 0 告警 | ✅ |
| VitePress 骨架（首页 + 指南 + 3 个组件文档） | ✅ |

### W8 · P1 组件第一批

| 项 | 状态 |
| --- | --- |
| 浮层定位内核 `srComputeFloating`（12 方位 / 自动翻转 / 边缘避让） | ✅ |
| `SrSpinner`（档位 + 像素双形态、可访问名称） | ✅ |
| `SrCheckbox` / `SrCheckboxGroup`（半选、组继承尺寸、组级禁用） | ✅ |
| `SrRadio` / `SrRadioGroup`（原生 name 互斥、自动生成组名） | ✅ |
| `SrSwitch`（`role="switch"` 原生键盘支持、加载态） | ✅ |
| `SrTooltip`（12 方位、延迟、Esc、aria-describedby、富文本） | ✅ |
| 单元测试 185 个（新增 59 个） | ✅ |

### W9 · P1 组件第二批 + E2E

| 项 | 状态 |
| --- | --- |
| `SrSelect`（单选/多选/搜索/清空/键盘导航/aria 完整） | ✅ |
| `SrForm` / `SrFormItem`（规则校验、异步 validator、错误自动下发） | ✅ |
| 表单与 `SrInput` / `SrSelect` 的校验态打通（`aria-invalid` / `aria-describedby`） | ✅ |
| Playwright 水合测试（5 条，复用系统 Edge，无需下载浏览器） | ✅ |
| 单元测试 215 个（新增 30 个） | ✅ |

### W10 · SrTable

| 项 | 状态 |
| --- | --- |
| 列配置驱动 + `#cell-<key>` 具名插槽 + `formatter` | ✅ |
| 客户端 / 服务端双排序模式（asc → desc → 取消） | ✅ |
| 多选列（表头半选、`v-model:selected-keys`） | ✅ |
| 展开行（`#expand` 插槽 + `v-model:expanded-keys`） | ✅ |
| `max-height` 表头自动吸顶 | ✅ |
| 斑马纹 / 外框 / 悬停 / 空状态 / 加载遮罩 | ✅ |
| 窄屏卡片视图（挂载后切换，避免水合不匹配） | ✅ |
| 单元测试 236 个（新增 21 个） | ✅ |

### W10 之后 · 组件补齐与演示站重构

W10 完成后按业务需要提前交付了一批 P2 组件，并对已有的交互与视觉做了系统打磨。组件总数来到 **34 个**。

#### 新增组件

| 组件 | 关键能力 |
| --- | --- |
| `SrNav` | 水平/垂直、分组折叠、两级子菜单、收起态浮层、品牌区、`#footer`、`bare` 去壳模式、`activeStyle` 双激活语言 |
| `SrTag` | 六种语义色、`light`/`dark` 两档、`color` 自定义基色、四档尺寸、可关闭 |
| `SrPagination` | 页码超 7 页自动收敛、每页条数、跳页、`simple` 精简模式 |
| `SrLoadMore` | 三态（idle/loading/done）、`auto` 自动加载、自动探测最近滚动祖先 |
| `SrConfirm` | 声明式 `SrConfirm` + 命令式 `srConfirm.danger()`，`Promise<boolean>`、异步 loading |

#### 已有组件增强

| 组件 | 增强 |
| --- | --- |
| `SrTable` | 固定列（左右 sticky + 边缘投影）、空态图标、前端分页、懒加载（复用 `SrLoadMore`） |
| `SrCard` | `padding` 独立档位（含 `none`）、`extra` 插槽、无描边时用阴影、悬停高亮描边 |
| `SrTabs` | 外观扩到 `line`/`card`/`segment`/`pill`、`direction="vertical"`、`bordered=false` 透明模式 |
| `SrBadge` | 状态点模式（`status` + 呼吸脉冲） |
| `SrAvatar` | 按 `alt` 散列自动取色，同一人始终同色 |
| `SrEmpty` | `bordered` 虚线占位、`image` 插图 |
| `SrBreadcrumb` | `separatorIcon`、`items[].disabled` |
| `SrDropdown` | `size`、`items[].danger` / `.selected`、`flush`、`role`、`#menu` 自定义面板、悬停延迟关闭、视口变化重定位 |
| `SrDrawer` | 四方向、预设尺寸、`zIndex`、四角圆角变体（`inset`）、磨砂加强 |
| `SrModal` | 内容区隐藏滚动条 |

#### 工程与演示

| 项 | 说明 |
| --- | --- |
| 演示站重构 | `vue-router`（hash 模式）+ `SrNav` 侧栏 + header + 外观设置抽屉，页面分类为开始/设计系统/组件/示例 |
| 概览页开场面板 | 首页第一屏讲清定位与六条卖点（Token 分层、双风格、首帧定稿、主干自带、回归守卫、类型），组件数与注册表联动，玻璃 / 扁平 / 暗色三态自适应 |
| 演示站可查找 | 搜索框常驻顶栏右侧（侧栏收起 / 窄屏都能用），按名称 / 分类 / 组件说明过滤并在框旁显示命中数；窄屏侧栏改抽屉 + 遮罩，输入时自动展开以露出结果；演示页可展开并复制该页真实源码（Vite `?raw`，不手抄示例） |
| 演示覆盖守卫 | `check-demo-coverage` 挂进 `pnpm lint`，对齐组件目录 / 注册表 / `props.json` / 孤儿文件；Row 与 Col 的 Props 表在同一页分两组展示 |
| 文档站守卫 | `pnpm check:docs` 按区块解析 Props / 事件 / 插槽表并与 `props.json` 精确比对，另查侧边栏覆盖、站内链接与锚点、门面数字、未转义插值；旧版只查「字符串有没有出现」 |
| 主题指南 | `docs/guide/theming.md` 讲清三层 Token、明暗/质感/主色/动效四维切换、SSR 首帧不闪白与三档玻璃强度 |
| 演示站体检 | `pnpm check:demo` 遍历注册表全部演示页，断言标题渲染、源码入口存在、无控制台错误，失败即非零退出 |
| 视觉基线 | `pnpm check:visual` 比对开场面板 / pill 标签 / 右键菜单 / 吸附播放器 5 张基线（`visual/__screenshots__`），`pnpm check:visual:update` 重建；固定亮色 + 扁平 + 无动效 |
| 演示站类型检查 | `pnpm typecheck` 现在也跑 `playground-vue3` 的 `vue-tsc`；模板里不写 TS 断言与反引号模板字符串，复杂表达式收进脚本函数 |
| API 提取器 | `extract-api.mjs` 用括号配平解析 `defineEmits` / `defineSlots`，插槽只看 `.vue` 模板；补齐 21 个组件原先为空的插槽表与嵌套事件参数 |
| 演示站事件日志 | `EventLog.vue` 复用组件，Pagination / LoadMore / InputNumber 三个偏薄演示补齐全套能力 + 实时事件日志；代码高亮色值改消费 L1 色板 |
| 类型契约补齐 | `SrDatePickerValue` 纳入字符串输出并按同模板回显、`SrSelectOption` 允许自定义字段、`SrCarouselItem` 带索引签名；吸附面板整卡点击展开（`button / input / a / [role=slider]` 用事件委托排除） |
| 搜索与分组折叠联动 | `SrNav` 新增 `filterActive`：搜索期间临时忽略分组折叠、禁用折叠按钮，清空搜索后恢复用户的折叠状态 |
| SSR 冒烟测试 | `ssr-components.spec.ts` 覆盖 30 个组件，在 node 环境下渲染，抓出过 `SrDrawer` 的服务端崩溃 |
| 水合 e2e | `pnpm check:hydration` 构建 Nuxt 站并断言水合告警为 0，另有 `lint:smoke` 保证新组件不会漏测 |
| Token 校验 | `pnpm lint:tokens` 对齐变量定义与引用，防住「变量拼错导致整条声明静默失效」 |

> W11 的重点是补齐组件文档与文档站，并把版本范围收敛为「P0 + P1 + 已完成的 P2」，不追求把所有 P2 都塞进首个正式版本。

---

## 目录结构

```
sunsetreverie-ui/
├── packages/
│   ├── ui/                  # @sunset-reverie/ui   核心组件库
│   ├── icons/               # @sunset-reverie/icons Iconify 封装与离线集合
│   ├── resolver/            # @sunset-reverie/resolver 按需引入解析器
│   └── nuxt/                # @sunset-reverie/nuxt  Nuxt Module（W7 构建）
├── internal/
│   ├── tokens/              # Token 唯一手写源 + 代码生成
│   └── examples/            # 三处共用的示例源码
├── playground-vue3/         # Vite + Vue 3 调试站（直连源码，侧栏 + 路由布局）
├── playground-nuxt4/        # Nuxt 4 调试站（SSR / 水合验证，含 smoke 冒烟页）
├── scripts/                 # 命名 / 图标 / 产物 / 变量 / 水合覆盖校验
├── docs/                    # 规划文档与 Token 验证页
├── .changeset/              # 变更说明（发版用）
└── pnpm-workspace.yaml
```

---

## 快速开始

```bash
# 环境要求：Node >= 20.11，pnpm >= 9
pnpm install

# 生成 Token（Less 变量 / TS 常量 / L1 CSS 变量）
pnpm build:tokens

# 全量构建：tokens → icons → ui → resolver
pnpm build
```

产物位置：

| 产物 | 路径 |
| --- | --- |
| 核心包 ESM + d.ts | `packages/ui/dist/` |
| 基础样式（变量 + reset） | `packages/ui/dist/base.css` |
| 全量样式 | `packages/ui/dist/style.css` |
| Token Less 变量 | `packages/ui/src/tokens/generated/vars.less` |
| Token TS 常量 | `packages/ui/src/tokens/generated/index.ts` |
| L2 语义层 CSS | `packages/ui/src/styles/base/semantic.generated.css` |
| Token 验证页 | `docs/public/token-gallery.html` |

---

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 playground-vue3（直连源码，HMR，端口 5173） |
| `pnpm check:demo` | 先起 `pnpm dev`，再遍历全部演示页做渲染 / 控制台冒烟；端口不同用 `DEMO_PORT=xxxx` |
| `pnpm check:visual` | 比对演示站视觉基线（自带 webServer，无需先 `pnpm dev`）；改动 UI 后用 `pnpm check:visual:update` 重建基线 |
| `pnpm check:docs` | 单独跑文档站守卫；`pnpm lint` 已内置，加 `--verbose` 看数据结构表的提醒明细 |
| `pnpm --filter @sunset-reverie/docs build` | 先 `build:gallery` 生成 Token 验证页，再构建 VitePress 站（干净检出也能构建） |
| `pnpm gen:icons` | 扫描源码图标名并子集化离线集合 |
| `pnpm gen:components` | 同步 resolver 的组件清单（新增组件后必跑） |
| `pnpm --filter playground-nuxt4 dev` | 启动 Nuxt 4 调试站 |
| `pnpm --filter @sunset-reverie/docs dev` | 启动文档站（VitePress） |
| `pnpm test:e2e` | 构建 Nuxt 演示站并跑 Playwright 水合测试 |
| `pnpm build:tokens` | 生成 Token 四份产物（改 `tokens.ts` / `semantic.ts` 后必跑） |
| `pnpm build:gallery` | 生成 Token 验证页到 `docs/public/token-gallery.html` |
| `pnpm build` | 全量构建（严格按 tokens → icons → ui → resolver 顺序） |
| `pnpm lint` | ESLint + Stylelint |
| `pnpm lint:naming` | 命名规范校验（组件目录、组件名、CSS 变量与类名前缀） |
| `pnpm lint:icons` | 图标离线集合校验 |
| `pnpm lint:tokens` | CSS 变量引用校验（引用与定义是否对齐，防拼错后静默失效） |
| `pnpm lint:smoke` | 水合冒烟覆盖校验（新组件是否已进入 Nuxt smoke 页） |
| `pnpm check:hydration` | 构建 Nuxt 站并跑水合校验，断言告警数为 0 |
| `pnpm typecheck` | 类型检查（会先生成 Token） |
| `pnpm test` | 单元测试（Vitest） |
| `pnpm verify:dist` | 产物校验（exports 指向的文件是否都存在） |
| `pnpm changeset` | 写一条变更说明 |
| `pnpm version-packages` | 汇总 changeset，升版本 + 写 CHANGELOG |

---

## 已落地的决策

| 编号 | 决策 | 落地位置 |
| --- | --- | --- |
| D-01 | 一期用纯 pnpm `--filter` 编排，不引入 Turborepo | 根 `package.json` 的 `build:*` 顺序脚本 |
| D-02 | 采用 changesets，只用 version + changelog | `.changeset/config.json`（四包版本 `fixed`） |
| D-03 | `dist` 由 `prepare` 构建，另推 `<tag>-dist` 兜底分支 | 待 W6 接通（根 `prepare` 现为 husky；解法见规划文档 11.9：用 `.git` 是否存在区分场景） |
| D-04 | `@sunset-reverie/icons` 内联进 ui 产物 | `packages/ui/vite.config.ts` 的 `external` 不含 icons |
| D-11 | 组件前缀固定 `Sr`，不做可配置 | 校验脚本与 resolver 均写死 `Sr` |

---

## 约定速查

| 对象 | 规范 | 示例 |
| --- | --- | --- |
| 组件 | `Sr` + PascalCase | `SrButton` |
| 标签 | `sr-` + kebab | `<sr-button>` |
| CSS 变量 | `--sr-*` | `--sr-color-primary` |
| Less 变量 | `@sr-*` | `@sr-radius-base` |
| Less mixin | `.sr-*()` | `.sr-breakpoint-md()` |
| 类名 | BEM + `sr-` | `.sr-button__icon` |
| 组合式函数 | `useSr*` | `useSrTheme` |
| 根属性 | `data-sr-*` | `data-sr-theme` |

完整清单见规划文档第二章。

---

## 提交规范

```
<type>(<scope>): <subject>

feat(button): 新增 loading 态
fix(theme): 修复 SSR 首次渲染主题闪烁
```

- `type`：feat / fix / docs / style / refactor / perf / test / build / ci / chore / revert
- `scope`：组件名或包名（见 `commitlint.config.js` 白名单）
- `subject`：中文，不超过 50 字

`pre-commit` 跑 lint-staged + 命名校验，`commit-msg` 跑 commitlint，`pre-push` 建议手动跑 `pnpm typecheck && pnpm test`。
