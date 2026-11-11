# 版本升级

夕梦 UI 通过私有 Git tag 分发，升级不是 `npm update`，而是**把锁定的 tag 换成新版本**，再按 CHANGELOG 处理变更。下面以 `1.0 → 1.1` 为例；当前仓库的具体版本号以 `packages/ui/package.json` 与 Git tag 为准，`0.x` 阶段同样按这套流程走。

## 第一步：先看变更，不先改依赖

仓库根目录的 `CHANGELOG.md` 按版本记录三类内容：

| 标记 | 含义 | 升级时 |
| --- | --- | --- |
| **BREAKING** | Props / 事件 / 插槽 / 类型有破坏性变更 | 必须按条目改代码，不能只换版本号 |
| 新增 | 新组件、新可选 prop | 不调用就没有影响，按需接入 |
| 修复 | 行为修正、样式修正 | 一般无需改代码，但要跑一遍回归 |

先确认目标版本，再决定升级窗口：

```bash
# 查看当前锁定版本
grep sunset-reverie package.json

# 查看目标 tag 的变更（仓库已打 tag 时）
git fetch --tags
git log --oneline v1.0.0..v1.1.0 -- CHANGELOG.md
```

## 第二步：替换版本

只改 `package.json` 里的 tag，或直接重新安装：

```bash
# 方式一：直接安装到目标 tag
pnpm add git+https://<你的 Git 地址>/sunset-reverie-ui.git#v1.1.0

# 方式二：改 package.json 后统一安装
# "dependencies": { "@sunset-reverie/ui": "git+https://...#v1.1.0" }
pnpm install
```

如果同时用了 Nuxt 模块或 resolver，四个包是**同版本发布**的，要一起升级：

```json
{
  "dependencies": {
    "@sunset-reverie/ui": "git+https://<你的 Git 地址>/sunset-reverie-ui.git#v1.1.0",
    "@sunset-reverie/nuxt": "git+https://<你的 Git 地址>/sunset-reverie-ui.git#v1.1.0",
    "@sunset-reverie/resolver": "git+https://<你的 Git 地址>/sunset-reverie-ui.git#v1.1.0"
  }
}
```

> 不要只升 `ui` 而留着旧版 `nuxt` / `resolver`：resolver 负责样式子路径，Nuxt 模块负责自动注册，版本错位会出现「组件能渲染但样式路径 404」。

## 第三步：跑升级检查

```bash
pnpm typecheck   # Props / 事件 / 插槽类型有没有对不上
pnpm test        # 业务侧单测
pnpm build       # 样式与按需入口是否都能解析
```

升级后重点看三处：

1. **手动抄过主题初始化脚本的**：用新版的 `SR_THEME_INIT_SNIPPET` 替换，或改用 `srThemeInitScript()` 生成，别让旧脚本继续写旧键名。
2. **覆盖过组件变量的**：对照[主题与 Token](/guide/theming) 确认变量名仍在；变量被删时整条声明会静默失效，不会报错。
3. **用 resolver 的**：检查构建日志里还有没有 `components/*/style.css` 解析失败；按需路径在 MINOR 内不会改名，但 tag 要与其他包一致。

## 本次横向升级包含什么

下面这些是 0.1.0 之后已经进入源码、会出现在下一个发布版里的变化。发布时把对应条目抄进 `CHANGELOG.md`，并给破坏性项加 **BREAKING**：

| 类别 | 变更 | 使用方要做什么 |
| --- | --- | --- |
| 新增 | 组件数 34 → 69：补齐评论、音乐播放器、树、级联、穿梭框、颜色选择、二维码、Markdown、Markdown 编辑器、表情选择等 | 不调用就无影响；按需 import 或让 resolver 解析 |
| 新增 | `SrEmojiPicker` 的 `tipMode`：`meta` / `tooltip` / `none` 三选一 | 不传保持信息行模式 |
| 新增 | `SrNav` 的 `filterActive`：搜索期间临时忽略分组折叠 | 侧栏搜索时建议绑定搜索词非空 |
| 修复 | `SrDatePicker` 的 `valueFormat` 现在按同一模板回显字符串 | 删掉业务侧的 `as unknown as Date` 之类的绕行 |
| 类型 | `SrSelectOption` 允许自定义字段 | 扩展选项不再需要 `as` 断言 |
| 类型 | `SrCarouselItem` 带索引签名 | 插槽里可直接读自定义字段 |
| 修复 | `SrContextMenu` 补上浮层强模糊档 | 纯视觉变化，无需改代码 |
| 行为 | `SrMusicPlayer` 吸附态支持整卡点击展开（控件区域除外） | 若自建了遮罩/阻止冒泡，确认不会拦截卡片点击 |

这些都是**新增或兼容性修正**，没有必须改的业务代码；如果下一个版本被定为 MAJOR，破坏性项会单独列在 CHANGELOG 的 **BREAKING** 段。

## 兼容性约定

- 版本号遵循 SemVer；`0.x` 阶段破坏性变更进 MINOR，PATCH 只放修复；`1.x` 起破坏性变更只进 MAJOR。
- 废弃 API 至少保留一个 MINOR，并在控制台给出迁移提示，不会直接删除。
- CSS 变量名按层管理：L1/L2 由 Token 生成，L3 属于组件；删除或改名都会在 CHANGELOG 标注。

## 回滚

```bash
# 把 tag 改回原版本
pnpm add git+https://<你的 Git 地址>/sunset-reverie-ui.git#v1.0.0
pnpm install
pnpm build
```

主题与 Token 是随包构建的，回滚版本即可一起回滚，不需要单独恢复 CSS 文件。

## 发布方清单（维护者）

1. 本次改动已带 changeset：`pnpm changeset`；
2. `pnpm version-packages` 汇总版本与 CHANGELOG；
3. 提交后打 tag：`git tag v1.1.0 && git push --tags`；
4. 文档站用新版本重新构建：`pnpm --filter @sunset-reverie/docs build`；
5. 把本文「本次横向升级包含什么」换成该版本的真实条目，再发布。
