# SrEmojiPicker 表情选择器

字符表情与图片表情的选择面板。插入的是**标记文本**（`[微笑]`）而非表情本身。

<script setup>
import { ref } from 'vue'

const picked = ref('')

const customPackages = [
  {
    key: 'work',
    name: '办公',
    emojis: [
      { name: '收到', char: '👌' },
      { name: '开会', char: '📅' },
      { name: '加班', char: '🌙' },
      { name: '搞定', char: '✅' },
      { name: '摸鱼', char: '🐟' },
      { name: '请假', char: '🏖️' },
    ],
  },
]
</script>

## 交互演示

<div class="sr-demo is-block">
  <div style="max-width: 300px; border: 1px solid var(--vp-c-border); border-radius: 8px; overflow: hidden">
    <SrEmojiPicker :packages="customPackages" :columns="6" @select="(item, mark) => (picked = mark)" />
  </div>
  <p style="margin: 10px 0 0; font-size: 12px; color: var(--vp-c-text-3)">
    选中的标记：<code>{{ picked || '（还没选）' }}</code>
  </p>
</div>

## 基础用法

```vue
<SrEmojiPicker @select="onSelect" />
```

不传 `packages` 时使用内置的五个分类：表情 / 手势 / 心情 / 动物 / 食物，共 200 多个字符表情。

```ts
function onSelect(item: SrEmojiItem, mark: string) {
  input.value += mark        // mark 已经拼好，形如 '[微笑]'
}
```

`select` 事件同时给出**表情项**和**标记文本**——调用方多半是往输入框里插入，让它自己拼 `[名称]` 只是多一步且容易拼错。

## 尺寸与外观

```vue
<SrEmojiPicker :width="320" :height="280" :min-height="240" />
```

| prop | 默认 | 说明 |
| --- | --- | --- |
| `width` | 占满父容器 | 数字按像素，字符串原样输出（`100%` / `20rem`） |
| `height` | 由内容决定 | 传了就是固定高度，内容区自动填充并内部滚动 |
| `minHeight` | `240` | **最小高度**：表情少的分类不会把面板塌成一条，切换时不跳 |
| `maxHeight` | `260` | 内容区最大高度，仅在未传 `height` 时生效 |

### 玻璃模式

组件自己就是一张卡片：flat 下留一道极细边框，glass 下**去掉边框改用阴影塑形**。

半透明背景上再描一道白边会把面板框得很硬，阴影既能保留「浮起来」的层次，又不切断背景透感。border 置 `0` 而不是 `display: none`，避免尺寸跳变。

## 分类栏位置

```vue
<SrEmojiPicker tab-position="bottom" />
```

| 值 | 效果 | 适合 |
| --- | --- | --- |
| `bottom`（默认） | 分类栏贴底 | 输入框旁的表情面板，和微信、飞书一致 |
| `top` | 分类栏在顶 | 弹层里空间受限，或紧挨着标题 |

分类栏按钮是**普通圆角矩形**（`--sr-emoji-tab-radius`，默认 `8px`），不是全椭圆。这个半径刻意不跟随质感令牌：glass 下 `radius-md` 是 14px，而按钮本身才 29px 高，14px 圆角在视觉上就等于椭圆了。要改就覆盖这个变量：

```css
.my-picker .sr-emoji-picker {
  --sr-emoji-tab-radius: 4px;
}
```

选中的项带浅色底 + 主色文字。不用下划线式 tab——那种样式依赖分割线定位，位置一换就容易穿帮。

## 多个表情包：tab 横向滚动

包一多（十几个）分类栏必然超出面板宽度。组件让 **tab 栏自己横向滚动，面板宽度保持不变**，滚动条隐藏。

两种操作方式：

| 操作 | 行为 |
| --- | --- |
| 鼠标滚轮悬停在 tab 栏 | 纵向滚轮映射成横向滚动 |
| 按住左右拖动 | Pointer Events 实现，鼠标 / 触摸笔 / 触屏共用一套代码 |

普通鼠标只有纵向滚轮，不接管的话在 tab 上滚动会让整个页面上下跳，完全帮不到用户。触控板的双轴手势（`deltaX` 更大）交给浏览器，不做拦截。

拖拽超过 **4px** 才判定为拖拽，手抖不影响正常点击；松手时紧随其后的 `click` 会在捕获阶段被拦下，**不会误切到起手处那个包**。拖拽期间光标变成 `grabbing`。

### 两个容易踩空的地方

**① 面板宽度不能是 `fit-content`**

它会把 tab 栏的内容宽度也算进去，于是 `overflow-x: auto` 永远触发不了，`width` 会被撑到所有包加起来那么宽。所以不传 `width` 时，宽度由 `columns` 算出：

```less
--sr-emoji-auto-width: calc(
  columns * --sr-emoji-item-size
  + (columns - 1) * --sr-emoji-gap
  + --sr-emoji-pad-x * 2
);
```

传了 `width` 则以传入值为准。

**② tab 不能换行、也不能收缩**

- 换行会把固定高度的面板撑高
- 收缩（文字截断）会让人认不出是哪个包

两者都不做，超出部分才真正落到滚动上。样式里对应 `flex-wrap: nowrap` 与 `flex: 0 0 auto`。

## 搜索

```vue
<SrEmojiPicker searchable search-placeholder="找表情" />
```

搜索**跨所有分类**按表情名称过滤，命中时分类栏临时隐藏，顶部信息行显示结果数。关键词变化派发 `search-change`。

表情包多起来之后，翻找不如搜名称快。

## 信息行

面板顶部有一行小字，平时显示当前分类名，鼠标悬停表情时改成该表情的**名称**。键盘 focus 到按钮上也会显示，方便确认 `[标记名]` 具体是什么。

## 自定义表情包

```vue
<SrEmojiPicker :packages="myPackages" />
```

```ts
const myPackages = [
  {
    key: 'doge',
    name: '神烦狗',
    emojis: [
      { name: '得意', url: '/emojis/doge-1.png' },
      { name: '鄙视', url: '/emojis/doge-2.png' },
    ],
  },
]
```

| 字段 | 说明 |
| --- | --- |
| `key` | 包标识，用于 tab 定位 |
| `name` | 显示在 tab 上的名称，建议 2~4 个字 |
| `emojis[].name` | **插入文本时用的标记名**，同批数据内必须唯一 |
| `emojis[].url` | 图片地址，与 `char` 二选一 |
| `emojis[].char` | 字符表情，与 `url` 二选一 |

不额外设 `type` 字段区分字符与图片，靠 `url` / `char` 哪个存在来判断——多一个字段就多一处可能与实际内容不一致的地方。

## 标记文本机制

这是整个设计的核心。

**编辑器插入的是 `[微笑]`，不是 `😀`。**

好处是表情包可以整体替换：字符换成图片、换一套画风、甚至换一整套表情——**历史内容里存的标记不用动**，渲染时重新查表即可。

代价是渲染端必须认识这套标记，否则用户看到的是一串 `[表情名]` 纯文本。

> **必须保证编辑器与渲染端用同一份 `packages`。**
> 两边配置不一致时，用户在编辑器里插的表情在正文里查不到，会静默降级成纯文本。
> 这类问题排查起来很费时——看到的是"表情没渲染"，根因却是两份数据不同。

## 导出的工具函数

```ts
import { buildEmojiMap, parseEmojiText, stringifyEmoji } from '@sunset-reverie/ui'
```

| 函数 | 签名 | 说明 |
| --- | --- | --- |
| `buildEmojiMap` | `(packages) => Map<string, SrEmojiItem>` | 建「名称 → 表情」查找表 |
| `parseEmojiText` | `(text, map) => SrEmojiTextSegment[]` | 把文本切成普通片段与表情片段 |
| `stringifyEmoji` | `(item) => string` | 表情项 → `[名称]` |

渲染端用法：

```ts
const map = buildEmojiMap(packages)
const segments = parseEmojiText('今天[微笑]了', map)
```

```vue
<template v-for="(seg, i) in segments" :key="i">
  <img v-if="seg.emoji?.url" :src="seg.emoji.url" :alt="seg.emoji.name" />
  <span v-else-if="seg.emoji">{{ seg.emoji.char }}</span>
  <span v-else>{{ seg.value }}</span>
</template>
```

**查不到的名称原样当作文本**返回，不丢内容——这样正文里写 `[这段是加注]` 这类方括号内容不会被误吞。

## 交互反馈

| 状态 | 表现 |
| --- | --- |
| 鼠标悬停 | 主题色浅底（**8px 圆角**）+ 放大 1.14 倍 + 上浮 1px + 轻阴影，字符/图片一起动 |
| 按下 | 缩小到 0.94，底色加深 |
| 点选后 | 一次 420ms 的「放大再收回」脉冲，连选时看得清点中了哪个 |
| 键盘 focus | 与 hover 一致的底色与放大，不只是 outline |
| 分类按钮 | hover 上浮、按下缩小，选中态有过渡 |
| 搜索框 / 清空按钮 | focus 与 hover 都有过渡 |

形变用回弹曲线 `cubic-bezier(0.34, 1.56, 0.64, 1)`，标准缓动在「点着玩」的控件上会显得太沉。

悬停背景的圆角由 `--sr-emoji-item-radius`（默认 `8px`）控制，和分类按钮的 `--sr-emoji-tab-radius` 成对。两者都不跟随质感令牌——glass 下 `--sr-radius-sm` 只有 2px，浮出的底色几乎是方的。

**减少动态效果**：系统开启后关掉所有位移与脉冲，只保留背景色变化——依然看得出 hover，但不会跳。

**连选不会跳视图**：选完表情仍停留在当前分类，只有主动点「最近」才会切过去。早期版本用「空 activeTab」兼任最近视图，导致点一个表情后面板只剩那一个，连选根本没法用。

## 连选与关闭

默认选中后面板不关，方便连着插几个表情。需要「选一个就收起」时：

```vue
<SrEmojiPicker close-on-select @close="visible = false" @select="onSelect" />
```

组件只派发 `close`，**不自己隐藏**——它可能嵌在弹层、抽屉或行内展开区，收起方式由外层决定。

## 最近使用

`showRecent` 默认开启。选过的表情会进入「最近」tab，最多 16 个，去重后置顶。

**只在本次会话内保留，不持久化**——组件不该替宿主决定存哪（localStorage / 服务端 / 根本不存）。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `packages` | `SrEmojiPackage[]` | `[]` | 表情包列表，不传用内置 |
| `columns` | `number` | `8` | 每行几个 |
| `tabPosition` | `'top' \| 'bottom'` | `'bottom'` | 分类栏位置 |
| `width` | `number \| string` | — | 面板宽度 |
| `height` | `number \| string` | — | 面板高度，固定 |
| `minHeight` | `number` | `240` | 最小高度（px） |
| `maxHeight` | `number` | `260` | 内容区最大高度（px） |
| `searchable` | `boolean` | `false` | 显示搜索框 |
| `searchPlaceholder` | `string` | `'搜索表情'` | 搜索占位文案 |
| `showRecent` | `boolean` | `true` | 显示「最近」tab |
| `closeOnSelect` | `boolean` | `false` | 选中后派发 `close` |
| `size` | `SrSize` | `'md'` | 尺寸档位 |
| `disabled` | `boolean` | `false` | 禁用 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `select` | `item, mark` | 选中表情，`mark` 是已经拼好的标记文本 |
| `close` | — | 请求关闭（仅 `closeOnSelect`） |
| `search-change` | `keyword` | 搜索关键词变化 |

## 注意事项

- **面板不带浮层定位**。它只负责内容，弹层由调用方（如 Markdown 编辑器的表情按钮）用 Teleport + 定位逻辑包起来。这样它能被放进弹层、抽屉、行内展开区，形态不受限。
- **重名以先出现的为准**，开发环境会 `console.warn`。新旧表情包混用时会遇到同名，静默取第一个比抛错更实用。
- **既无 `char` 又无 `url` 的项被跳过**，不会渲染成空格子。
- **图片表情不打包**。内置的三个包全是字符表情，图片表情由宿主按需传入。
- **标记名不要包含方括号**，否则无法解析。
