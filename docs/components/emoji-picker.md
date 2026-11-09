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

不传 `packages` 时使用内置的字符表情包（常用 / 手势 / 符号三组）。

```ts
function onSelect(item: SrEmojiItem, mark: string) {
  input.value += mark        // mark 已经拼好，形如 '[微笑]'
}
```

`select` 事件同时给出**表情项**和**标记文本**——调用方多半是往输入框里插入，让它自己拼 `[名称]` 只是多一步且容易拼错。

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

## 最近使用

`showRecent` 默认开启。选过的表情会进入「最近」tab，最多 16 个，去重后置顶。

**只在本次会话内保留，不持久化**——组件不该替宿主决定存哪（localStorage / 服务端 / 根本不存）。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `packages` | `SrEmojiPackage[]` | `[]` | 表情包列表，不传用内置 |
| `columns` | `number` | `8` | 每行几个 |
| `showRecent` | `boolean` | `true` | 显示「最近」tab |
| `size` | `SrSize` | `'md'` | 尺寸档位 |
| `maxHeight` | `number` | `260` | 面板最大高度（px） |
| `disabled` | `boolean` | `false` | 禁用 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `select` | `item, mark` | 选中表情，`mark` 是已经拼好的标记文本 |

## 注意事项

- **面板不带浮层定位**。它只负责内容，弹层由调用方（如 Markdown 编辑器的表情按钮）用 Teleport + 定位逻辑包起来。这样它能被放进弹层、抽屉、行内展开区，形态不受限。
- **重名以先出现的为准**，开发环境会 `console.warn`。新旧表情包混用时会遇到同名，静默取第一个比抛错更实用。
- **既无 `char` 又无 `url` 的项被跳过**，不会渲染成空格子。
- **图片表情不打包**。内置的三个包全是字符表情，图片表情由宿主按需传入。
- **标记名不要包含方括号**，否则无法解析。
