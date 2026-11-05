# SunsetReverie-UI（夕梦 UI）

自用 / 团队内部的 Vue 3 + Nuxt 4 UI 组件库。**不发布到 NPM**，只托管在私有 Git 仓库，通过 tag 分发。

- 品牌缩写：**SR**
- 技术栈：Vue 3 · Nuxt 4 · TypeScript · Less · Vite（库模式）· pnpm monorepo
- 规划文档：[`docs/夕梦UI组件库开发规划.md`](./docs/夕梦UI组件库开发规划.md)

---

## 当前进度：W7（Nuxt 集成与文档站）已完成

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

W8 开始 P1 组件：`SrCheckbox` / `SrRadio` / `SrSwitch` / `SrSpinner` / `SrTooltip`。

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
├── playground-vue3/         # Vite + Vue 3 调试站（直连源码）
├── playground-nuxt4/        # Nuxt 4 调试站（SSR / 水合验证）
├── scripts/                 # 命名 / 图标 / 产物校验
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
| `pnpm dev` | 启动 playground-vue3（直连源码，HMR） |
| `pnpm gen:icons` | 扫描源码图标名并子集化离线集合 |
| `pnpm gen:components` | 同步 resolver 的组件清单（新增组件后必跑） |
| `pnpm --filter playground-nuxt4 dev` | 启动 Nuxt 4 调试站 |
| `pnpm --filter @sunset-reverie/docs dev` | 启动文档站（VitePress） |
| `pnpm build:tokens` | 生成 Token 四份产物（改 `tokens.ts` / `semantic.ts` 后必跑） |
| `pnpm build:gallery` | 生成 Token 验证页到 `docs/public/token-gallery.html` |
| `pnpm build` | 全量构建（严格按 tokens → icons → ui → resolver 顺序） |
| `pnpm lint` | ESLint + Stylelint |
| `pnpm lint:naming` | 命名规范校验（组件目录、组件名、CSS 变量与类名前缀） |
| `pnpm lint:icons` | 图标离线集合校验 |
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
