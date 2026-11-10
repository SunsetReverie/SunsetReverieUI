# SrButton 按钮

基础操作按钮，五种视觉变体，尺寸支持按断点分档。

## 变体

```vue
<sr-button variant="primary">主要</sr-button>
<sr-button variant="secondary">次要</sr-button>
<sr-button variant="outline">描边</sr-button>
<sr-button variant="text">文字</sr-button>
<sr-button variant="danger">危险</sr-button>
```

渲染效果（这一块是真的组件，不是截图）：

<div class="sr-demo">
  <SrButton variant="primary">主要</SrButton>
  <SrButton variant="secondary">次要</SrButton>
  <SrButton variant="outline">描边</SrButton>
  <SrButton variant="text">文字</SrButton>
  <SrButton variant="danger">危险</SrButton>
</div>

| 变体 | 用途 | 毛玻璃下 |
| --- | --- | --- |
| `primary` | 页面主操作，一屏最多一个 | 带同色辉光 |
| `secondary` | 默认按钮，多数场景 | 半透明表面 |
| `outline` | 次要但需要强调 | 弱辉光（12%） |
| `text` | 最弱，工具栏与链接式操作 | 无 |
| `danger` | 删除、撤销等不可逆操作 | 带红色辉光 |

## 尺寸

```vue
<sr-button size="xs">xs</sr-button>
<sr-button size="sm">sm</sr-button>
<sr-button size="md">md</sr-button>
<sr-button size="lg">lg</sr-button>
```

`size` 可以传响应式对象，切换全部由 CSS 媒体查询完成：

```vue
<sr-button :size="{ xs: 'sm', md: 'lg' }">随窗口变化</sr-button>
```

未传时继承 `SrConfigProvider` 的 `size`，最外层未配置则为 `md`。

## 图标

```vue
<sr-button icon="lucide:check">确认</sr-button>
<sr-button icon="lucide:x" icon-position="right">关闭</sr-button>

<sr-button>
  <template #icon><sr-icon name="lucide:search" /></template>
  自定义图标
</sr-button>
```

## 加载与禁用

```vue
<sr-button :loading="loading" @click="submit">提交</sr-button>
<sr-button disabled>不可用</sr-button>
```

加载态用 `opacity: 0` 隐藏内容而非移除，宽度不会塌陷，避免布局跳动。加载期间原生 `disabled` 生效，点击不会触发。

自定义指示器用 `loading` 插槽：

```vue
<sr-button loading>
  <template #loading><sr-icon name="lucide:loader-circle" spin /></template>
  处理中
</sr-button>
```

## 其他形态

```vue
<sr-button block>占满整行</sr-button>
<sr-button round>胶囊按钮</sr-button>
```

## API

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'text' \| 'danger'` | `'secondary'` | 视觉变体 |
| `size` | `SrSize \| Partial<Record<SrBreakpoint, SrSize>>` | 继承配置 | 尺寸档位 |
| `disabled` | `boolean` | `false` | 禁用 |
| `loading` | `boolean` | `false` | 加载中 |
| `block` | `boolean` | `false` | 占满父容器 |
| `round` | `boolean` | `false` | 胶囊圆角 |
| `radius` | `number \| string` | 跟随质感层 | 圆角，不传时 flat 6px / glass 10px |
| `bg` | `string` | `''` | 自定义背景色，hover/active 与辉光由 `color-mix` 自动派生 |
| `color` | `string` | `''` | 自定义文字色；配合 `bg` 时默认白色 |
| `htmlType` | `'button' \| 'submit' \| 'reset'` | `'button'` | 原生 type（避免与组件 type 冲突，故改名） |
| `icon` | `string` | `''` | 图标名 |
| `iconPosition` | `'left' \| 'right'` | `'left'` | 图标位置 |

响应式尺寸只有 `size` 一个对象入口：`:size="{ xs: 'sm', md: 'lg' }"`。组件没有 `xs` / `md` 这类具名 prop，写了只会落到 `$attrs` 上。

| 插槽 | 说明 |
| --- | --- |
| `default` | 按钮文本 |
| `icon` | 自定义图标（在文本左侧追加） |
| `loading` | 自定义加载指示器 |

`$attrs` 落到原生 `<button>` 上，`type`、`form`、`name` 等属性可直接使用。

## 样式接入

```ts
import '@sunset-reverie/ui/components/button/style.css'
```

辉光的强度与半径由 `--sr-glow-base` 和 `--sr-shadow-glow-blur` 控制，扁平风格下半径为 0，自动关闭。
