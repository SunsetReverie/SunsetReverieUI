# SrContextMenu 右键菜单

右键唤出的菜单。位置跟随鼠标，用于列表项、表格行、画布这类「对着某个目标操作」的场景。

<script setup>
import { ref } from 'vue'

const lastAction = ref('')

const items = [
  { key: 'copy', label: '复制', icon: 'lucide:copy' },
  { key: 'paste', label: '粘贴', icon: 'lucide:clipboard' },
  { key: 'cut', label: '剪切', icon: 'lucide:scissors', divider: true },
]

const dangerItems = [
  { key: 'open', label: '打开', icon: 'lucide:external-link' },
  { key: 'share', label: '分享', icon: 'lucide:share', disabled: true },
  { key: 'remove', label: '删除', icon: 'lucide:trash', danger: true, divider: true },
]
</script>

## 交互演示

<div class="sr-demo is-block">
  <SrContextMenu :items="items" @select="lastAction = $event">
    <div style="display: flex; align-items: center; justify-content: center; width: 280px; height: 90px; border: 1px dashed var(--vp-c-border); border-radius: 8px; font-size: 12.5px; color: var(--vp-c-text-3); user-select: none">
      在这块区域内点右键
    </div>
  </SrContextMenu>
  <p style="margin: 10px 0 0; font-size: 12px; color: var(--vp-c-text-3)">
    最近操作：{{ lastAction || '—' }}
  </p>
</div>

## 基础用法

```vue
<SrContextMenu :items="items" @select="onSelect">
  <div class="zone">右键区域</div>
</SrContextMenu>
```

```ts
const items = [
  { key: 'copy', label: '复制', icon: 'lucide:copy' },
  { key: 'paste', label: '粘贴', icon: 'lucide:clipboard' },
]

function onSelect(key, item) {
  if (key === 'copy') doCopy()
}
```

组件包裹的区域会自动接管右键，并**阻止浏览器默认菜单**——不阻止的话会同时弹出原生菜单，很难看。

## 禁用项与危险操作

<div class="sr-demo is-block">
  <SrContextMenu :items="dangerItems" @select="lastAction = $event">
    <div style="display: flex; align-items: center; justify-content: center; width: 280px; height: 90px; border: 1px dashed var(--vp-c-border); border-radius: 8px; font-size: 12.5px; color: var(--vp-c-text-3); user-select: none">
      右键看看
    </div>
  </SrContextMenu>
</div>

| 字段 | 效果 |
| --- | --- |
| `disabled` | 变灰、不可点 |
| `danger` | 文字与图标标红 |
| `divider` | 上方加一条分割线 |

`danger` 用于删除这类不可逆操作，让用户在点之前慢一下。

## 手动打开（表格行场景）

不需要给每一行都包一个实例，一个实例 + `ref.open(event)` 就够：

```vue
<SrContextMenu ref="menu" :items="items" @select="onSelect">
  <table>...</table>
</SrContextMenu>
```

```ts
const menu = ref()
const currentRow = ref(null)

function onRowMenu(row, event) {
  event.preventDefault()
  currentRow.value = row      // 记住上下文
  menu.value?.open(event)
}
```

**先记上下文再打开菜单**，这样 `onSelect` 里才知道操作的是哪一行。

## 关闭时机

菜单会在这些情况下自动关闭：

- 点菜单项
- 点菜单外部
- 按 `Esc`
- 页面滚动
- 窗口失焦

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `SrContextMenuItem[]` | `[]` | 菜单项 |
| `disabled` | `boolean` | `false` | 禁用整个菜单 |

### SrContextMenuItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 唯一标识 |
| `label` | `string` | 文案 |
| `icon` | `string` | 图标名 |
| `disabled` | `boolean` | 禁用该项 |
| `danger` | `boolean` | 危险操作 |
| `divider` | `boolean` | 上方加分割线 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `select` | `key, item` | 选中某一项 |
| `visible-change` | `visible` | 显隐 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| `default` | 右键区域的内容，组件在这一层拦截 `contextmenu` |

## 暴露方法

| 方法 | 说明 |
| --- | --- |
| `open(event)` | 在鼠标位置打开 |
| `close()` | 关闭 |

## 注意事项

- **`disabled` 仍会阻止原生菜单**。只是不弹出自己的，避免露出浏览器菜单。
- **位置会自动纠偏**。靠近屏幕右/下边缘时改为向左/上展开，不会被裁掉。
- **滚动即关闭**。滚动后菜单还挂在原来的坐标上会错位，所以直接收起来。
- **和 `SrDropdown` 的分工**：Dropdown 是点击触发、跟随触发元素；ContextMenu 是右键触发、跟随鼠标。
- **移动端没有右键**。触屏上需要长按触发，要自己监听 `touchstart` 并调 `open()`。
