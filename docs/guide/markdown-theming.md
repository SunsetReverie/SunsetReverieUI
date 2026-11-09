# Markdown 渲染样式定制

`SrMarkdown` 的四套内置模板、全部排版规则都由一组 `--sr-md-*` CSS 变量驱动。本文是这套变量的完整参考与定制指南。

> 面向的场景：前台文章页要贴合自己的品牌色、编辑器预览要和前台一致、导出 PDF 时需要一套黑白样式，或者干脆做第五套模板。

---

## 一、先理解工作原理

### 变量定义在哪

组件根节点 `.sr-md` 上挂着两层类名：

```html
<div class="sr-md sr-md--md sr-md--theme-vivid">
  <div class="sr-md__content">
    <!-- 引擎产出的 HTML -->
  </div>
</div>
```

- `.sr-md--{size}` 定义字号、行高、段间距
- `.sr-md--theme-{theme}` 定义颜色、装饰、圆角、阴影等其余全部变量

**所有变量都定义在根节点上，后代元素通过 CSS 变量继承拿到值。** 这意味着：

> 覆盖根节点上的变量就够了，**不需要给每个元素重写一条选择器**。

```css
/* 一行就能把整篇文档的强调色换掉 */
.article .sr-md { --sr-md-accent: #7c5cff; }
```

标题、链接、引用色条、列表圆点、渐变分割线会一起跟着变——它们都读同一个变量。

### 装饰的「有无」也是变量

模板之间不只是换个颜色，装饰的有无也用变量控制：

```less
/* 样式表里 h1 的伪元素，四套模板共用这一条规则 */
&__content > h1::after {
  width: var(--sr-md-h1-bar-width, 0);
  height: var(--sr-md-h1-bar-height, 0);
  background: var(--sr-md-h1-bar-bg, transparent);
}
```

- `plain` 把宽高都设成 `0` → 短线不可见
- `vivid` 设成 `48px × 3px` + 渐变 → 出现短装饰线
- `editorial` 设成 `100% × 1px` → 变成全宽细分隔线
- `glass` 设成 `64px × 3px` → 另一种长度的短线

所以定制时**不需要写 `display: none` 去关装饰**，把宽度设为 0 即可。

### 选择器挂在标准标签上

样式规则挂在 `h1` / `p` / `blockquote` / `table` / `pre` / `code` 等标准标签上，不是 `.sr-md__*` 类名。

内置解析器输出「带类的标准标签」，markdown-it 输出「不带类的标准标签」——两者都能套上同一套样式。这点对定制很重要：**你自己写的覆盖规则也应该针对标准标签**，不要只针对内置解析器的类名，否则换引擎后覆盖会失效。

---

## 二、三个定制层次

| 层次 | 做法 | 适合 |
| --- | --- | --- |
| ① 换模板 | `theme="editorial"` | 只需一种现成风格 |
| ② 覆盖变量 | 在根节点上写 `--sr-md-*` | 品牌色、字号节奏、局部微调，**推荐** |
| ③ 自己写 CSS | 直接给 `h1` / `blockquote` 等写规则 | 变量表达不了的复杂改动 |

绝大多数需求停在第②层就够了。第③层要注意作用域问题，见第六节。

---

## 三、完整变量参考

共 52 个。除标注「有 fallback」的外，其余都由模板提供值；**覆盖时请基于现有一套模板**，不要清空整组变量。

### 3.1 排版基础

| 变量 | 作用 | 典型值 |
| --- | --- | --- |
| `--sr-md-font-size` | 正文字号 | `14px`（由 `size` 控制：sm 13 / md 14 / lg 15.5） |
| `--sr-md-line-height` | 正文行高 | `1.75` |
| `--sr-md-gap` | 相邻块之间的基准间距，标题/引用/表格的外距由它换算 | `14px` |

改 `size` 会覆盖这三个值。想整体调紧，直接覆盖 `--sr-md-gap` 比逐个改 `margin` 干净。

### 3.2 标题

| 变量 | 作用 | 说明 |
| --- | --- | --- |
| `--sr-md-accent` | 全局强调色 | 被标题左边条、引用色条、h1 短线渐变、分割线渐变共同引用，改一处全变 |
| `--sr-md-heading-color` | 标题文字色 | `vivid` 用主色，`plain` / `editorial` / `glass` 用正文色 |
| `--sr-md-heading-font` | 标题字体族 | `editorial` 用衬线；默认 `inherit` |
| `--sr-md-heading-weight` | 标题字重 | `600` / `700` |
| `--sr-md-heading-bar-width` | 标题左侧竖条宽度（有 fallback `0`） | 想做「左边条标题」设成 `4px` |
| `--sr-md-heading-bar-gap` | 标题文字与左竖条的间距（有 fallback `0`） | 配合上面的宽度，一般 `12px` |
| `--sr-md-h1-bar-width` | h1 下方短线的宽度（有 fallback `0`） | `0` / `48px` / `100%` / `64px` |
| `--sr-md-h1-bar-height` | h1 下方短线的高度（有 fallback `0`） | `0` / `3px` / `1px` |
| `--sr-md-h1-bar-bg` | 短线的填充（有 fallback `transparent`） | 纯色或 `linear-gradient(...)` |
| `--sr-md-h2-underline` | h2 底部横线宽度（有 fallback `0`） | `0` / `1px` |

> 标题的**字号比例**（h1 1.6em、h2 1.32em、h3 1.15em…）没有做成变量。要改请走第③层，用 `.sr-md__content > h1 { font-size: ... }` 覆盖。

### 3.3 行内文字与链接

| 变量 | 作用 |
| --- | --- |
| `--sr-md-strong-color` | 加粗文字色（有 fallback `inherit`） |
| `--sr-md-link-color` | 链接文字色 |
| `--sr-md-link-hover` | 链接悬停色（有 fallback：退回 link-color） |
| `--sr-md-link-weight` | 链接字重（有 fallback `400`） |
| `--sr-md-link-decoration` | 是否带下划线（有 fallback `none`） |
| `--sr-md-link-underline-color` | 下划线颜色（有 fallback `currentcolor`） |
| `--sr-md-inline-bg` | 行内代码底色 |
| `--sr-md-inline-color` | 行内代码文字色 |
| `--sr-md-inline-border` | 行内代码边框（有 fallback：1px 细边） |
| `--sr-md-inline-radius` | 行内代码圆角（有 fallback `radius-sm`） |
| `--sr-md-inline-weight` | 行内代码字重（有 fallback `400`） |

`vivid` 让链接常驻细下划线是有意为之：**只靠颜色区分链接，对色觉障碍用户不友好**。做定制时建议保留 `text-decoration` 或换一种非颜色区分方式。

行内代码默认**不加边框**（`--sr-md-inline-border: 0`）：中文正文里代码常夹在句中，边框会把一行切开。

### 3.4 引用

| 变量 | 作用 |
| --- | --- |
| `--sr-md-quote-bg` | 引用底色（有 fallback `transparent`） |
| `--sr-md-quote-bar` | 左侧色条，是一整条 `border-left` 声明（有 fallback：3px 淡主色） |
| `--sr-md-quote-border` | 其余三边的边框（有 fallback `0`） |
| `--sr-md-quote-radius` | 圆角（有 fallback `0`） |
| `--sr-md-quote-padding` | 内边距（有 fallback `0.2em 0 0.2em 1em`） |
| `--sr-md-quote-color` | 文字色（有 fallback：次级文字色） |
| `--sr-md-quote-style` | 字体样式（有 fallback `normal`），`editorial` 设成 `italic` |

> **一个坑**：左边有色条时，圆角不要给左上角和左下角，否则 `border-left` 会沿圆角弯成弧形。四套模板都用 `0 <radius> <radius> 0` 这种只圆右侧的写法。

### 3.5 列表与图片

| 变量 | 作用 |
| --- | --- |
| `--sr-md-marker-color` | 列表圆点 / 序号颜色（有 fallback `inherit`），作用在 `::marker` 上 |
| `--sr-md-img-radius` | 图片圆角（有 fallback `0`） |
| `--sr-md-img-shadow` | 图片阴影（有 fallback `none`） |

### 3.6 代码块

| 变量 | 作用 |
| --- | --- |
| `--sr-md-code-bg` | 代码块底色 |
| `--sr-md-code-color` | 代码文字色 |
| `--sr-md-code-border` | 边框（有 fallback：1px 细边） |
| `--sr-md-code-radius` | 圆角（有 fallback `radius-base`） |
| `--sr-md-code-padding` | 内边距（有 fallback `12px 14px`） |
| `--sr-md-code-shadow` | 阴影（有 fallback `none`） |
| `--sr-md-code-bar-border` | 顶栏分隔线（有 fallback：1px 细边） |
| `--sr-md-code-bar-color` | 顶栏文字色（有 fallback：三级文字色） |
| `--sr-md-code-lang-bg` | 顶栏语言标签底色（有 fallback `bg-sunken`） |

`vivid` 在明暗主题下都用固定的深色代码块（`#1e2330`），和正文形成明确分区。想跟随系统明暗，就把它改成 `var(--sr-color-bg-sunken)`。

**代码高亮的 token 配色不在这里**：那是 highlight.js / shiki 的样式表职责，独立组件 `SrCodeBlock` 也不内置。改代码块底色时记得同步检查高亮器主题是否还看得清。

### 3.7 表格

| 变量 | 作用 |
| --- | --- |
| `--sr-md-table-bg` | 表格容器底色（有 fallback `transparent`） |
| `--sr-md-table-head-bg` | 表头底色（有 fallback `bg-sunken`） |
| `--sr-md-table-head-color` | 表头文字色（有 fallback 正文色） |
| `--sr-md-table-zebra` | 偶数行底色（有 fallback `transparent`） |
| `--sr-md-table-border` | 容器边框（有 fallback：1px 细边） |
| `--sr-md-table-radius` | 容器圆角（有 fallback `0`） |
| `--sr-md-table-shadow` | 容器阴影（有 fallback `none`） |
| `--sr-md-cell-border` | 单元格边框（有 fallback：1px 细边） |

内置解析器会在 `<table>` 外面包一层 `.sr-md__table-wrap` 做横向滚动；markdown-it 直接输出 `<table>`。样式对两者都做了处理，容器变量只作用于有 wrap 的情况。

### 3.8 其他

| 变量 | 作用 |
| --- | --- |
| `--sr-md-hr-bg` | 分割线填充，通常给渐变 |
| `--sr-color-primary-*` 等全局令牌 | 模板里大量引用，改主题色会连带影响渲染器 |

---

## 四、四套模板的差异对照

| 变量 | `plain` | `vivid` | `editorial` | `glass` |
| --- | --- | --- | --- | --- |
| 标题色 | 正文色 | 主色 | 正文色 | 正文色 |
| 标题字体 | inherit | inherit | 衬线 | inherit |
| h1 装饰 | 无 | 48px 渐变短线 | 全宽 1px 细线 | 64px 渐变短线 |
| h2 下划线 | 无 | 1px | 无 | 无 |
| `strong` | 正文色 | 主色 | 正文色 | 主色 |
| 行内代码 | 灰底 + 细边 | 主色淡底、无边框 | 透明底 + 细边 | 半透明底 + 玻璃边 |
| 引用 | 透明 + 淡色条 | 主色淡底 + 主色条 | 透明 + 细线 + 斜体 | 半透明白 + 主色条 |
| 列表圆点 | 灰色 | 主色 | 灰色 | 主色 |
| 代码块 | 浅灰 | **深色** `#1e2330` | 浅灰无边 | 半透明 + 模糊 |
| 表格 | 灰表头、无斑马纹 | 主色表头 + 斑马纹 + 阴影 | 只留横线 | 半透明 + 柔光 |
| 分割线 | 纯色 | 主色渐隐 | 两端渐隐 | 玻璃边渐隐 |

---

## 五、实战案例

### 案例 1：换成自己的品牌色

基于 `vivid`，只改强调色相关的几个变量：

```vue
<template>
  <div class="article">
    <SrMarkdown :source="content" :engine="md" theme="vivid" />
  </div>
</template>

<style>
.article .sr-md {
  --sr-md-accent: #7c5cff;
  --sr-md-heading-color: #6d4de0;
  --sr-md-strong-color: #6d4de0;
  --sr-md-link-color: #7c5cff;
  --sr-md-marker-color: #7c5cff;
  --sr-md-inline-bg: rgb(124 92 255 / 12%);
  --sr-md-inline-color: #6d4de0;
  --sr-md-quote-bg: rgb(124 92 255 / 8%);
  --sr-md-h1-bar-bg: linear-gradient(90deg, #7c5cff, transparent);
  --sr-md-hr-bg: linear-gradient(90deg, #7c5cff, transparent);
}
</style>
```

注意 `--sr-md-h1-bar-bg` 和 `--sr-md-hr-bg` 在 `vivid` 里是引用主色的渐变，**不会自动跟随 `--sr-md-accent`**，要一起改。

### 案例 2：编辑器预览与前台完全一致

两份样式不要各写一遍，抽成一个文件两边引：

```css
/* markdown-theme.css —— 前台和后台共用 */
.content-surface .sr-md {
  --sr-md-accent: #7c5cff;
  --sr-md-heading-color: #6d4de0;
  /* ... */
}
```

```vue
<!-- 前台 -->
<div class="content-surface">
  <SrMarkdown :source="content" :engine="md" theme="vivid" />
</div>

<!-- 后台编辑：外层同一个类，theme 传同一个值 -->
<div class="content-surface">
  <SrMarkdownEditor v-model="content" :engine="md" theme="vivid" />
</div>
```

`SrMarkdownEditor` 会把 `engine` / `extensions` / `theme` 全部透传给内部预览用的 `SrMarkdown`。**模板不一致也算预览偏差**——写作者看到的和发布后不同，会反复踩坑。

### 案例 3：只调阅读节奏，不动配色

```css
.article .sr-md {
  --sr-md-font-size: 16px;
  --sr-md-line-height: 1.9;
  --sr-md-gap: 20px;
  --sr-md-heading-weight: 600;
  --sr-md-h1-bar-width: 0;      /* 去掉装饰 */
  --sr-md-h1-bar-height: 0;
  --sr-md-h2-underline: 0;
  --sr-md-table-zebra: transparent;
}
```

这是一套「长文阅读」配置：字号放大、行距放松、去掉花哨装饰。

### 案例 4：打印 / 导出 PDF

```css
@media print {
  .article .sr-md {
    --sr-md-heading-color: #000;
    --sr-md-strong-color: #000;
    --sr-md-link-color: #000;
    --sr-md-link-decoration: underline;
    --sr-md-inline-bg: transparent;
    --sr-md-inline-border: 1px solid #ccc;
    --sr-md-quote-bg: transparent;
    --sr-md-quote-bar: 2px solid #999;
    --sr-md-code-bg: #f5f5f5;
    --sr-md-code-color: #000;
    --sr-md-code-shadow: none;
    --sr-md-table-bg: transparent;
    --sr-md-table-head-bg: #eee;
    --sr-md-table-shadow: none;
    --sr-md-img-shadow: none;
    --sr-md-h1-bar-bg: #000;
    --sr-md-hr-bg: #999;
  }
}
```

要点：去掉所有阴影和半透明底色（打印机不吃这些），把强调色统一压成黑色，链接保留下划线以免打印后认不出来。

### 案例 5：暗色主题下单独调整

```css
[data-sr-theme='dark'] .article .sr-md {
  --sr-md-code-bg: #0f1117;
  --sr-md-inline-bg: rgb(124 92 255 / 18%);
  --sr-md-quote-bg: rgb(124 92 255 / 12%);
  --sr-md-table-bg: transparent;
}
```

`vivid` 的代码块本来就是深色，明暗主题下都够用；这里主要是把半透明底色调浓一点，暗底上 8% / 12% 太淡。

### 案例 6：做第五套模板

不需要改 `theme` prop（它只接受四个值）。给外层容器加自己的类，在里面覆盖一组变量：

```vue
<div class="my-theme">
  <SrMarkdown :source="content" theme="plain" />
</div>
```

```css
/* 以 plain 打底，只加自己要的装饰 */
.my-theme .sr-md {
  --sr-md-accent: #e05252;
  --sr-md-heading-color: #c73e3e;
  --sr-md-heading-bar-width: 4px;
  --sr-md-heading-bar-gap: 12px;
  --sr-md-h1-bar-width: 0;
  --sr-md-h1-bar-height: 0;
  --sr-md-inline-bg: rgb(224 82 82 / 10%);
  --sr-md-inline-color: #c73e3e;
  --sr-md-quote-bg: rgb(224 82 82 / 6%);
  --sr-md-quote-radius: 0 8px 8px 0;
  --sr-md-marker-color: #e05252;
  --sr-md-hr-bg: linear-gradient(90deg, #e05252, transparent);
}
```

这套用「标题左边条」代替「标题下短线」，气质和四套内置的都不一样。

---

## 六、作用域与优先级

### 为什么要加外层类

组件根节点自己带着 `.sr-md--theme-vivid`，那上面已经定义了一组变量。你的覆盖规则需要**同等或更高特异性，并且在它之后加载**：

```css
/* ✓ 推荐：加一层作用域，特异性更高 */
.article .sr-md { --sr-md-accent: #7c5cff; }

/* ✗ 有风险：同特异性，谁后加载谁生效；打包顺序变了就失效 */
.sr-md { --sr-md-accent: #7c5cff; }

/* ✗ 全局污染：影响页面里所有渲染器，包括编辑器的预览 */
:root { --sr-md-accent: #7c5cff; }
```

`:root` 那写法还有个陷阱：组件根节点上的模板变量会**覆盖**继承来的值，所以写在 `:root` 上根本不起作用。

### 覆盖变量时可以用 scoped

变量定义在根节点 `.sr-md` 上，而根节点是**组件模板里的真实元素**，带 `data-v-xxx` 属性，所以 scoped 样式能命中它，变量也会正常继承给所有后代：

```vue
<style scoped>
/* ✓ 可以：命中根节点，变量向下继承 */
:deep(.sr-md) { --sr-md-accent: #7c5cff; }
</style>
```

### 但要给具体元素写样式时，scoped 会失效

`v-html` 插入的 `h1` / `blockquote` 等节点**拿不到 `data-v-xxx`**，scoped 选择器匹配不上：

```vue
<style scoped>
/* ✗ 不生效：编译成 .sr-md__content > h1[data-v-xxx]，而 h1 没这个属性 */
.sr-md__content > h1 { color: red; }
</style>
```

三种解法：

1. 用 `:deep()`：`:deep(.sr-md__content > h1) { ... }`
2. 把覆盖写进非 scoped 的全局样式块
3. 优先用变量覆盖，避免直接写元素选择器（**最推荐**）

### 变量未定义会让整条声明失效

CSS 里 `border-left: var(--sr-md-heading-bar-width, 0) solid var(--sr-md-accent)`，如果 `--sr-md-accent` 完全没定义，整条 `border-left` 声明会被丢弃，而不只是颜色没了。

所以：

- 覆盖时**基于现有一套模板**，不要清空整组变量
- 自定义变量一定要给值
- 有 fallback 的变量（表格里标了「有 fallback」）才能安全省略

---

## 七、排查清单

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 改了变量没反应 | 特异性不够，或样式加载在组件样式之前 | 加外层类提高特异性；确认打包顺序 |
| 写在 `:root` 上没反应 | 组件根节点的模板变量覆盖了继承值 | 改成 `.article .sr-md` |
| 只有 `h1` 没样式 | 用了 scoped 且直接写标签选择器 | 用 `:deep()` 或全局样式 |
| 换成 markdown-it 后整篇掉样式 | 覆盖规则只针对 `.sr-md__*` 类名 | 改成标准标签选择器；组件自带样式已同时支持两者 |
| 引用左侧色条弯成弧形 | 四角圆角 + `border-left` | 圆角改成 `0 R R 0` |
| 玻璃模式下颜色发灰 | `color-mix()` 与半透明底色叠加 | 用 `[data-sr-style='glass']` 单独覆盖 |
| 代码块换底色后高亮看不清 | 高亮器主题是独立样式表 | 同步调整 highlight.js / shiki 主题 |
| 短线 / 装饰没出现 | 宽或高被设成 `0` | 检查 `--sr-md-h1-bar-width` / `height` |
| 某条规则整体消失 | 引用的变量未定义且无 fallback | 补齐变量，或基于内置模板覆盖 |

---

## 八、相关文档

- [SrMarkdown 渲染器](/components/markdown) — 引擎、短代码扩展、安全边界
- [SrMarkdownEditor 编辑器](/components/markdown-editor) — 工具栏、预览一致性
- [SrCodeBlock 代码块](/components/code-block) — 独立代码块与高亮接入
