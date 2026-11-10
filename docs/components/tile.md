# SrTile 图标砖

图标 + 标题的方块入口。用于功能宫格、快捷导航，也可以当图标选择器用。

<script setup>
import { ref } from 'vue'

const picked = ref('lucide:heart')
</script>

## 交互演示

<div class="sr-demo is-block">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; max-width: 640px">
    <SrTile icon="lucide:user" title="用户管理" description="账号与权限" type="primary" />
    <SrTile icon="lucide:shopping-cart" title="订单中心" description="交易记录" type="success" />
    <SrTile icon="lucide:chart-bar" title="数据报表" description="经营分析" type="warning" />
    <SrTile icon="lucide:settings" title="系统设置" description="参数配置" />
  </div>
</div>

## 基础用法

```vue
<SrTile icon="lucide:user" title="用户管理" description="账号与权限" />
```

三个内容位都可以省略：只给图标就是个方块按钮，只给标题就是个文字入口。

## 语义色

`type` 决定图标区域的底色：

| 值 | 用途 |
| --- | --- |
| `default` | 中性功能 |
| `primary` | 主功能 |
| `success` | 已完成 / 正向 |
| `warning` | 需注意 |
| `error` | 危险 / 不可逆 |

同一排里用不同颜色分组，比全灰更容易扫读。

## 可选中

<div class="sr-demo is-block">
  <div style="display: flex; gap: 10px">
    <SrTile
      v-for="icon in ['lucide:heart', 'lucide:star', 'lucide:bookmark', 'lucide:bell']"
      :key="icon"
      :icon="icon"
      :active="picked === icon"
      size="sm"
      @click="picked = icon"
    />
  </div>
  <p style="margin: 10px 0 0; font-size: 12px; color: var(--vp-c-text-3)">当前选中：{{ picked }}</p>
</div>

```vue
<SrTile :icon="icon" :active="picked === icon" @click="picked = icon" />
```

选中后右上角出现对勾，`aria-pressed` 同步。**这就是「图标选择器」的用法**——一排图标砖，靠 `active` 表示选中。

## 横向布局

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 10px; max-width: 360px">
    <SrTile icon="lucide:user" title="用户管理" description="账号与权限" type="primary" horizontal />
    <SrTile icon="lucide:chart-bar" title="数据报表" description="经营分析" type="warning" horizontal />
  </div>
</div>

图标在左、文字在右，适合列表式的快捷入口。

## 尺寸

<div class="sr-demo">
  <SrTile icon="lucide:heart" title="收藏" size="xs" />
  <SrTile icon="lucide:heart" title="收藏" size="sm" />
  <SrTile icon="lucide:heart" title="收藏" />
  <SrTile icon="lucide:heart" title="收藏" size="lg" />
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `icon` | `string` | `''` | 图标名 |
| `title` | `string` | `''` | 标题 |
| `description` | `string` | `''` | 描述 |
| `active` | `boolean` | `false` | 选中态 |
| `disabled` | `boolean` | `false` | 禁用 |
| `type` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'error'` | `'default'` | 图标配色 |
| `size` | `SrSize` | `'md'` | 尺寸 |
| `horizontal` | `boolean` | `false` | 横向排布 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `click` | `MouseEvent` | 点击，禁用时不派发 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| `icon` | 自定义图标区域（可放 SVG 或图片） |
| `title` | 自定义标题 |
| `description` | 自定义描述 |

## 注意事项

- **不负责网格布局**。多個砖的排列交给外层 `grid`，组件只管自己那块方块。
- **标题和描述都是单行省略**。宫格宽度有限，长文字会被截断——需要多行就自己用插槽。
- **`disabled` 时 hover 不再上浮**，视觉上明确表达「点不了」。
- **图标底块的圆角跟尺寸等比缩放**：40px 的块是 10px，`xs` / `lg` 自动收放；外层方块的圆角不小于内块，内块不会看起来比卡片更圆。
- **`active` 只影响样式与 `aria-pressed`**，选中逻辑要自己在 `@click` 里维护。
