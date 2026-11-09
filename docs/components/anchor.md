# SrAnchor 锚点导航

长文档的章节导航。滚动时自动高亮当前章节，点击平滑跳转到目标位置。

比 `position: sticky` 多做了两件关键的事：**知道你在哪**，和**带你去那**。

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
| `line`（默认） | 左侧竖线 + 文字加深 | 通用。目录只是「指路」，不该和正文抢注意力 |
| `block` | 底色块 + 主色文字 | 需要强调当前项时 |
| `pill` | 圆角胶囊 | 圆润风格、偏移动端 |
| `dot` | 左侧小圆点 | 克制，有指示感 |
| `bold` | 只变粗变色，**连竖线也不要** | 最轻，几乎无干扰 |

**默认是 `line`**。锚点导航在页面里通常处于次要地位，大块底色会不断吸走视线——只有竖线和文字深浅的变化就够了。

三个行为细节：

- **底色块挂在整行上**（箭头 + 文字），不是只有文字。这样箭头属于选中区域的一部分，竖线也贴在整行左边缘，不会出现「竖线夹在箭头和文字中间」。
- **`block` / `pill` 的底色从竖线位置开始**，覆盖竖线所在的区域，两者不会分离。
- **`bold` 会隐藏竖线**。它的定位是「最轻」，多一根线就自相矛盾了。

## 完全自定义激活样式

五种内置样式都是由同一组 CSS 变量驱动的，所以**覆盖变量就能完全自定义**，不需要改组件样式：

```css
.my-anchor .sr-anchor {
  --sr-anchor-active-color: #fff;
  --sr-anchor-active-bg: #1f7a4d;
  --sr-anchor-active-weight: 600;
  --sr-anchor-active-radius: 6px;
  --sr-anchor-indicator-w: 0;
}
```

可用变量：

| 变量 | 说明 | 默认 |
| --- | --- | --- |
| `--sr-anchor-active-color` | 激活项文字色 | 主色深版 |
| `--sr-anchor-active-bg` | 激活项底色 | 主色 12% |
| `--sr-anchor-active-weight` | 激活项字重 | `medium` |
| `--sr-anchor-active-radius` | 激活项圆角 | `--sr-radius-sm` |
| `--sr-anchor-indicator-w` | 左侧指示器宽 | `0`（不显示） |
| `--sr-anchor-indicator-h` | 左侧指示器高 | `0` |
| `--sr-anchor-indicator-r` | 指示器圆角 | `0` |
| `--sr-anchor-indicator-gap` | 指示器左边距 | `0` |
| `--sr-anchor-rail` | 轨道线颜色 | `border-subtle` |
| `--sr-anchor-marker` | 竖线颜色 | 主色 |
| `--sr-anchor-line-gap` | 竖线到文字的间距 | `12px` |
| `--sr-anchor-active-radius` | 底色块圆角 | `--sr-radius-sm` |

> 用深色底做自定义时记得同时改 `--sr-anchor-marker`，否则主色滑块压在深色块上会很突兀。

竖条和圆点用的是同一个伪元素，只是宽高圆角不同——所以它们不会同时出现，也不需要额外的类名。

## 折叠

```vue
<SrAnchor :items="items" collapsible />
```

每个有子项的父级前面会出现箭头：

- **点箭头**折叠 / 展开子级
- **点文字**仍然跳转（两件事分开，不会误触）

| 参数 | 默认 | 说明 |
| --- | --- | --- |
| `collapsible` | `false` | 显示折叠箭头 |
| `defaultExpandAll` | `true` | 初始全部展开 |
| `autoExpand` | `true` | 滚到子章节时自动展开父级 |

**`autoExpand` 是折叠功能的关键**：默认收起时，用户往下滚动经过一个子章节，那个子章节的父级要自动打开，否则高亮点了却看不见它。

**只做展开，从不折叠。** 滚出某个章节后，它的父级继续保持展开——否则目录会随滚动反复开合，读起来会跟丢。收起只能由你点箭头触发。

手动收起后，如果再滚到同一父级下的另一个子章节，它会重新展开（这是 `autoExpand` 的预期行为）。不需要自动展开时把它关掉即可。

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
