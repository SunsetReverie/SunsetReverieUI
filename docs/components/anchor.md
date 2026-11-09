# SrAnchor 锚点导航

长文档的章节导航。滚动时自动高亮当前章节，点击平滑跳转到目标位置。

比 `position: sticky` 多做了两件关键的事：**知道你在哪**，和**带你去那**。

<script setup>
const customItems = [
  { key: 'c-intro', title: '组件简介' },
  {
    key: 'c-usage',
    title: '快速开始',
    children: [
      { key: 'c-install', title: '安装' },
      { key: 'c-import', title: '引入' },
    ],
  },
  { key: 'c-config', title: '配置项' },
  { key: 'c-faq', title: '常见问题' },
]
</script>

## 基础用法

```vue
<SrAnchor :items="items" />
```

```ts
const items = [
  { key: 'intro', title: '简介' },
  { key: 'usage', title: '用法' },
]
```

每条数据的 `key` 对应页面里某个元素的 `id`：

```html
<h2 id="intro">简介</h2>
<p>...</p>
<h2 id="usage">用法</h2>
```

组件本身不渲染正文，只负责「目录」这一部分，两侧通过 `id` 建立联系。

## 多级目录

用一个 `children` 就能嵌套，层级不限（内部是递归渲染）：

```ts
const items = [
  {
    key: 'chapter-1',
    title: '第一章',
    children: [
      { key: 'section-1-1', title: '1.1 环境准备',
        children: [{ key: 'section-1-1-1', title: '1.1.1 Node 版本' }] },
      { key: 'section-1-2', title: '1.2 初始化' },
    ],
  },
]
```

**子项激活时父级也会高亮**，这样能看出自己在哪个大章节里。

但两者不是同一种高亮：**只有当前项铺底色，祖先只变色**。都铺底色的话，「父章节 + 子章节」两块会连成一片，看不出是哪一层。层级关系靠缩进和字号区分，不额外加符号。

## 吸顶

```vue
<SrAnchor :items="items" affix :affix-offset="64" />
```

用 `position: sticky` 实现，**需要父容器有确定高度**才会生效——通常放在侧边栏那一列，让它 `align-self: stretch`。

吸顶后的底色是 55% 半透明 + `blur(14px)` 毛玻璃，另外加了边框和投影补足层次感。

> **一个物理限制**：毛玻璃需要有内容从它**下方**滚过才看得出来。两栏布局里如果目录是独立一列、下方没有内容经过，模糊就没有可模糊的对象——这是布局决定的，不是样式失效。想要明确看出「这是一层浮层」，边框和投影比模糊更有效，所以两者都保留了。

## 偏移（最容易踩的坑）

```vue
<SrAnchor :items="items" :offset-top="64" affix :affix-offset="64" />
```

页面上有固定头栏时，**必须把 `offsetTop` 设成头栏高度**，否则：

- 点击跳转后标题被头栏盖住一截
- 滚动判定偏早，还没到章节就已经高亮了

`offsetTop` 同时作用于「判定当前章节」和「点击滚动后的位置」，一个参数管两件事。

## 横向模式

```vue
<SrAnchor :items="items" direction="horizontal" />
```

滑块从左侧竖线变成底部横条。子级会自动隐藏——横向空间有限，塞进多级就挤不下了。超宽时可以横向滚动，但不显示滚动条。

## 自定义滚动容器

默认监听 `window`。如果页面用的是独立滚动容器（后台布局里的内容区就是这样），要显式传进去：

```vue
<SrAnchor :items="items" container=".layout__body" />
```

```ts
// 也可以传元素本身
const el = document.querySelector('.layout__body')
```

**这是最容易出错的地方**：容器传错的话，滚动监听永远不会触发，高亮就一直停在第一项。

## 地址栏同步

```vue
<SrAnchor :items="items" sync-hash />
```

打开后：

- 点击会写入 `#key`（用 `replaceState`，不污染历史记录）
- 打开带 hash 的链接时，**自动滚动到对应章节**
- 浏览器前进后退时跟随

前台文章页通常要开——分享出去的链接能直接定位到某个小节。

## 受控激活项

```vue
<SrAnchor v-model:active-key="activeKey" :items="items" />
```

传了 `activeKey` 就以外部为准，组件不再自己改。滚动和点击仍然会派发 `update:activeKey`，由你决定是否接受。

用于「目录和正文高亮要联动其他 UI」的场景。

## 激活样式

五种内置，用 `activeVariant` 选：

```vue
<SrAnchor :items="items" active-variant="bar" />
```

| `activeVariant` | 观感 | 适合 |
| --- | --- | --- |
| `line`（默认） | 左侧竖线 + 文字同色 | 通用。目录只是「指路」，不该和正文抢注意力 |
| `block` | 底色块 + 主色文字 | 需要强调当前项时 |
| `pill` | 圆角胶囊 | 圆润风格、偏移动端 |
| `dot` | 左侧小圆点 | 克制，有指示感 |
| `bold` | 只变粗变色，**连竖线也不要** | 最轻，几乎无干扰 |

**默认是 `line`**。锚点导航在页面里通常处于次要地位，大块底色会不断吸走视线——只有竖线和文字的变化就够了。

`line` 下**当前项的文字和竖线同色**（都取 `--sr-anchor-marker`），改一个变量两者一起变，不会出现「线是主色、字是黑色」的割裂感。祖先项只加深到正文色，不跟主色——整条链都染成主色会分不清哪一项才是当前。

三个行为细节：

- **底色块挂在整行上**（箭头 + 文字），不是只有文字。这样箭头属于选中区域的一部分，竖线也贴在整行左边缘，不会出现「竖线夹在箭头和文字中间」。
- **`block` / `pill` 的底色从竖线位置开始**，覆盖竖线所在的区域，两者不会分离。
- **`bold` 会隐藏竖线**。它的定位是「最轻」，多一根线就自相矛盾了。

## 完全自定义样式

组件所有视觉都通过 CSS 变量下发，默认值只是一套合理的起点。前台项目要贴合自己的设计语言时，覆盖变量即可，不需要碰组件样式：

```css
.article-sidebar .sr-anchor {
  --sr-anchor-font-size: 15px;
  --sr-anchor-row-pad-y: 9px;
  --sr-anchor-line-gap: 18px;
  --sr-anchor-marker: #7c5cff;
  --sr-anchor-marker-width: 4px;
  --sr-anchor-color: #6b7280;
}
```

<div class="sr-demo is-block">
  <div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start">
    <div style="--sr-anchor-font-size: 15px; --sr-anchor-font-size-sub: 13px; --sr-anchor-row-pad-y: 9px; --sr-anchor-line-gap: 18px; --sr-anchor-sub-indent: 16px; --sr-anchor-marker: #7c5cff; --sr-anchor-marker-width: 4px; --sr-anchor-color: #6b7280; --sr-anchor-color-sub: #9ca3af; width: 220px">
      <SrAnchor :items="customItems" :container="'.pg__body'" :offset-top="24" :active-key="'c-usage'" />
    </div>
    <div style="width: 220px">
      <SrAnchor :items="customItems" :container="'.pg__body'" :offset-top="24" :active-key="'c-usage'" />
    </div>
  </div>
  <p style="margin: 10px 0 0; font-size: 12px; color: var(--vp-c-text-3)">左：覆盖变量后；右：默认</p>
</div>

### 尺寸

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--sr-anchor-font-size` | `13px` | 一级项字号 |
| `--sr-anchor-font-size-sub` | `12px` | 二级项字号 |
| `--sr-anchor-font-size-sub-deep` | `11.5px` | 三级及更深 |
| `--sr-anchor-max-width` | `220px` | 最大宽度 |
| `--sr-anchor-row-pad-y` | `6px` | 行上下内边距（决定行高） |
| `--sr-anchor-row-pad-right` | `8px` | 行右内边距 |
| `--sr-anchor-item-gap` | `0` | 项之间的间距 |
| `--sr-anchor-line-gap` | `12px` | 竖线到文字的间距 |
| `--sr-anchor-sub-indent` | `12px` | 每深一层的额外缩进 |
| `--sr-anchor-line-height` | `1.5` | 行高倍率 |

### 颜色

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--sr-anchor-color` | `text-secondary` | 一级项文字 |
| `--sr-anchor-color-hover` | `text` | 悬停文字 |
| `--sr-anchor-color-sub` | `text-tertiary` | 二级项文字 |
| `--sr-anchor-bg-hover` | `bg-sunken` | 悬停底色 |
| `--sr-anchor-active-color` | 跟随竖线色 | 当前项文字 |
| `--sr-anchor-active-bg` | `transparent` | 当前项底色 |
| `--sr-anchor-active-weight` | `semibold` | 当前项字重 |
| `--sr-anchor-active-radius` | `radius-sm` | 行圆角 |
| `--sr-anchor-ancestor-color` | `text` | 祖先项文字 |

### 竖线

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--sr-anchor-marker` | 主色 | 竖线颜色，同时决定当前项文字色 |
| `--sr-anchor-marker-width` | `3px` | 竖线宽度 |
| `--sr-anchor-marker-radius` | `radius-full` | 竖线圆角 |
| `--sr-anchor-marker-offset` | `0` | 距容器左边缘的偏移 |

### 箭头

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--sr-anchor-toggle-size` | `16px` | 箭头按钮尺寸 |
| `--sr-anchor-toggle-color` | `text-tertiary` | 箭头颜色 |
| `--sr-anchor-toggle-opacity` | `0.7` | 箭头透明度（悬停变 1） |

### 吸顶

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--sr-anchor-affix-bg` | 55% 容器色 | 吸顶背景 |
| `--sr-anchor-affix-blur` | `14px` | 毛玻璃模糊半径 |
| `--sr-anchor-affix-saturate` | `150%` | 毛玻璃饱和度 |
| `--sr-anchor-affix-shadow` | 细线 + 投影 | 吸顶阴影 |
| `--sr-anchor-affix-radius` | `radius-base` | 吸顶圆角 |
| `--sr-anchor-affix-pad-y` | `6px` | 吸顶上下内边距 |
| `--sr-anchor-affix-pad-right` | `8px` | 吸顶右内边距 |

### 横向

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--sr-anchor-h-gap` | `4px` | 项之间的水平间距 |
| `--sr-anchor-h-pad-y` | `4px` | 项上下内边距 |
| `--sr-anchor-h-pad-x` | `10px` | 项左右内边距 |
| `--sr-anchor-h-marker-height` | `2px` | 底部横条高度 |

> 覆盖时建议加自己的作用域（如 `.article-sidebar .sr-anchor`），避免影响页面里其他锚点。

### 内置变体也是变量

`activeVariant` 的五个值本质上只是给变量赋了不同的值：

```less
/* block 变体做的事 */
&--active-block {
  --sr-anchor-active-color: var(--sr-color-primary-text);
  --sr-anchor-active-bg: var(--sr-color-primary-alpha-12);
}
```

所以「选内置变体」和「自己写一组变量」是同一套机制，两者可以叠加使用——先选 `line` 打底，再覆盖几个变量微调。

## 折叠

```vue
<SrAnchor :items="items" collapsible />
```

每个有子项的父级前面会出现箭头：

- **点箭头**折叠 / 展开子级
- **点文字**仍然跳转（两件事分开，不会误触）

| 参数 | 默认 | 说明 |
| --- | --- | --- |
| `collapsible` | `false` | 父级可折叠 |
| `showToggle` | `true` | 显示折叠箭头 |
| `togglePosition` | `'left'` | 箭头位置，`right` 靠右对齐 |
| `defaultExpandAll` | `true` | 初始全部展开（仅在 `autoExpand: false` 时生效） |
| `autoExpand` | `true` | 跟随当前章节自动开合 |

### 自动开合是「手风琴」语义

滚到某个子章节时，只保留它所在的那条路径展开，**其他分支自动收起**：

```vue
<SrAnchor collapsible :items="items" />
```

比如目录是「一、安装」和「二、配置」两支，滚到「1.1 依赖」时：

- 「一、安装」展开
- 「二、配置」收起

这样目录始终只展示当前所在的这一条线，不会随着滚动越变越长。

**如果想要「只展开、不收起」**，把 `autoExpand` 关掉，改用 `defaultExpandAll` 控制初始状态——但那样多滚几节之后，所有分支都会处于展开态，目录会很长。

**`autoExpand` 是折叠功能的关键**：默认收起时，用户往下滚动经过一个子章节，那个子章节的父级要自动打开，否则高亮点了却看不见它。

**会自动收起其他分支。** 这是 `autoExpand` 的完整语义：跟随当前章节重新计算展开集合，只留当前路径。

手动折叠后，只要激活项没变化就不会被重开；一旦滚到别的章节，展开集合会按新的位置重算。

受控用法：

```vue
<SrAnchor v-model:expanded-keys="expanded" collapsible :items="items" />
```

## 限制显示层级

```vue
<SrAnchor :items="items" :max-depth="2" />
```

`0`（默认）表示不限。设为 `2` 时只渲染前两层，更深的子级不出现也不参与滚动判定。

目录太长、层级太深时用它能收敛住——三层以上的目录在小屏幕里往往挤成一团。

## 关闭滑块

```vue
<SrAnchor :items="items" :show-marker="false" />
```

只靠文字颜色和底色表达激活态。目录本身已经很显眼时，滑块会显得多余。

## 插槽

### #title 自定义每一项

作用域参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `item` | `SrAnchorItem` | 当前项数据 |
| `depth` | `number` | 层级，0 是顶层 |
| `index` | `number` | 同层内的序号，从 1 开始 |
| `active` | `boolean` | 是否在当前路径上（含祖先） |
| `current` | `boolean` | 是否是当前项本身 |

```vue
<SrAnchor :items="items">
  <template #title="{ item, index, current }">
    <span class="row" :class="{ 'is-current': current }">
      <span class="row__idx">{{ String(index).padStart(2, '0') }}</span>
      <span class="row__text">{{ item.title }}</span>
      <span v-if="current" class="row__badge">当前</span>
    </span>
  </template>
</SrAnchor>
```

加序号、图标、角标、阅读进度，都靠这个插槽。`depth` 和 `index` 分开给，所以想做「1.2.3」这种多级编号也能拼出来。

**注意**：插槽只替换内容，链接元素（`<a>`）和点击行为不变，滚动跳转、`aria-current` 都照常工作。

### #toggle 自定义折叠图标

```vue
<template #toggle="{ expanded }">
  <SrIcon :name="expanded ? 'lucide:minus' : 'lucide:plus'" :size="12" />
</template>
```

只替换图标本身，按钮的尺寸、`aria-expanded`、旋转动画都保留。

## 插槽

### #title 自定义每一项

作用域参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `item` | `SrAnchorItem` | 当前项数据 |
| `depth` | `number` | 层级，0 是顶层 |
| `index` | `number` | 同层内的序号，从 1 开始 |
| `active` | `boolean` | 是否在当前路径上（含祖先） |
| `current` | `boolean` | 是否是当前项本身 |

```vue
<SrAnchor :items="items">
  <template #title="{ item, index, current }">
    <span class="row" :class="{ 'is-current': current }">
      <span class="row__idx">{{ String(index).padStart(2, '0') }}</span>
      <span class="row__text">{{ item.title }}</span>
    </span>
  </template>
</SrAnchor>
```

加序号、图标、角标、阅读进度都靠它。`depth` 和 `index` 分开提供，所以「1.2.3」这种多级编号也能拼出来。

**只替换文字内容**：外层 `<a>`、点击行为、`aria-current`、滚动跳转都保持不变。

> 任意层级都能用。组件内部把插槽函数作为 prop 逐层下传，而不是用 `<template>` 递归转发——后者在递归组件里会让 Vue 判定插槽不稳定、反复触发子组件更新，最终把页面卡死。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `SrAnchorItem[]` | `[]` | 锚点数据 |
| `container` | `string \| HTMLElement` | `window` | 滚动容器 |
| `offsetTop` | `number` | `0` | 顶部偏移，同时作用于判定与跳转 |
| `bounds` | `number` | `4` | 判定边界（像素） |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | 排列方向 |
| `affix` | `boolean` | `false` | 吸顶 |
| `affixOffset` | `number` | `0` | 吸顶时的 top 偏移 |
| `smooth` | `boolean` | `true` | 平滑滚动 |
| `activeKey` | `string` | — | 当前激活项（受控） |
| `showMarker` | `boolean` | `true` | 高亮滑块 |
| `syncHash` | `boolean` | `false` | 同步地址栏 hash |
| `ariaLabel` | `string` | `'页面导航'` | 无障碍标签 |
| `activeVariant` | `'line' \| 'block' \| 'pill' \| 'dot' \| 'bold'` | `'line'` | 激活项样式 |
| `collapsible` | `boolean` | `false` | 父级可折叠 |
| `showToggle` | `boolean` | `true` | 显示折叠箭头 |
| `togglePosition` | `'left' \| 'right'` | `'left'` | 箭头位置 |
| `defaultExpandAll` | `boolean` | `true` | 初始全部展开 |
| `autoExpand` | `boolean` | `true` | 子项激活时自动展开父级 |
| `expandedKeys` | `string[]` | — | 展开的父级（受控） |
| `maxDepth` | `number` | `0` | 最多显示的层级，0 不限 |

### SrAnchorItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 目标元素 id |
| `title` | `string` | 显示文案 |
| `href` | `string` | 自定义链接；给了就交给浏览器跳转，不滚动 |
| `children` | `SrAnchorItem[]` | 子项 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:activeKey` | `key` | 激活项变化（滚动和点击都会触发） |
| `change` | `key, item` | 同上，带完整数据 |
| `click` | `key, item, event` | 用户点击 |
| `update:expandedKeys` | `keys` | 展开集合变化 |
| `toggle` | `key, expanded` | 某个父级折叠状态切换 |

## 常见问题

**高亮在相邻两节之间反复跳**

把 `bounds` 调大一点（比如 10）。它决定「标题越过判定线多少像素才算进入」，太小的话滚动时的抖动会让它来回切。

**永远高亮第一项**

三个原因，按可能性排序：

1. `container` 传错了，监听的不是真正在滚动的那个元素
2. 内容不足一屏，没有可滚动空间（这是正常的）
3. 目标元素在组件测量时还没渲染出来——数据是异步来的话，`items` 变化后组件会自动重测，但如果正文是 `v-if` 延迟挂载的，建议挂载完再传 `items`

**点击后标题被头栏挡住**

`:offset-top` 没设，或者设的值和头栏实际高度不一致。

**吸顶后看不出毛玻璃**

目录下方没有内容经过（两栏布局里正文不会流到目录那一列）。这是布局决定的，模糊没有可模糊的对象——边框和投影能补足「浮层感」，但真正的毛玻璃需要目录压在内容上。

**折叠后高亮位置偏了**

组件在折叠时会重新测量，但如果你的正文用了高度过渡动画（比如 `max-height` 过渡），测量时机可能早于动画结束。这种情况给 `items` 换一个引用，或者延迟改 `activeKey`。

**吸顶不生效**

`position: sticky` 要求父容器有确定高度。侧边栏那一列如果也是 `height: auto` 且内容很短，sticky 没有活动空间。

**内容里有图片，加载完成后高亮错位**

组件内部用 `ResizeObserver` 监听尺寸变化，图片加载后会重新测量。如果图片是异步插入且容器尺寸没变（比如固定高度容器内换图），需要手动触发一次——改一下 `items` 的引用即可。

## 注意事项

- **不渲染正文**。它只是目录，正文的 `id` 要自己加。
- **`key` 必须和 DOM 的 `id` 严格一致**。大小写敏感。
- **滚动监听是 `passive` + `requestAnimationFrame` 节流**，不会阻塞滚动。
- **测量用 `getBoundingClientRect` 而不是 `offsetTop`**：后者受定位祖先影响，在本组件里会一直返回 0。
- **底部兜底**：滚到底部时激活最后一项，否则最后几节因为太短、永远越不过判定线，会一直高亮不到。
- **`href` 会跳过滚动**。给了外部链接就交回浏览器，只派发 `click` 事件。
