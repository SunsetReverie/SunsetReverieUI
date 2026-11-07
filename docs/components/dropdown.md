# SrDropdown 下拉菜单

点击或悬停触发的浮层。传 `items` 走内置菜单，不传则用 `#menu` 插槽放任意内容（设置面板、筛选器之类）。

<script setup>
import { ref } from 'vue'
import { srToast } from '@sunset-reverie/ui'

const lastPicked = ref('')
const currentTheme = ref('light')

const plainItems = [
  { key: 'edit', label: '编辑' },
  { key: 'copy', label: '复制' },
  { key: 'delete', label: '删除', danger: true, divided: true },
]

const iconItems = [
  { key: 'edit', label: '编辑', icon: 'lucide:pencil' },
  { key: 'copy', label: '复制', icon: 'lucide:inbox' },
  { key: 'share', label: '分享', icon: 'lucide:heart' },
]

const groupedItems = [
  { group: '常用', key: 'edit', label: '编辑', icon: 'lucide:pencil' },
  { group: '常用', key: 'copy', label: '复制', icon: 'lucide:inbox' },
  { group: '危险操作', key: 'trash', label: '移入回收站', icon: 'lucide:trash', divided: true },
  { group: '危险操作', key: 'delete', label: '永久删除', icon: 'lucide:x', danger: true },
]

const stateItems = [
  { key: 'pin', label: '置顶', icon: 'lucide:house', selected: true },
  { key: 'mute', label: '免打扰', icon: 'lucide:settings' },
  { key: 'share', label: '分享给他人', icon: 'lucide:heart', disabled: true },
]

const themeOptions = [
  { key: 'light', label: '亮色' },
  { key: 'dark', label: '暗色' },
  { key: 'auto', label: '跟随' },
]

function pick(key, item) {
  lastPicked.value = item?.label ?? key
  srToast.success(`选中：${lastPicked.value}`)
}
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrDropdown } from '@sunset-reverie/ui'

const items = [
  { key: 'edit', label: '编辑' },
  { key: 'delete', label: '删除', danger: true, divided: true },
]
</script>

<template>
  <SrDropdown :items="items" @select="(key) => console.log(key)">
    <SrButton>操作</SrButton>
  </SrDropdown>
</template>
```

## 纯文字菜单

<div class="sr-demo">
  <SrDropdown :items="plainItems" @select="pick">
    <SrButton variant="outline" size="sm">更多操作</SrButton>
  </SrDropdown>

  <SrDropdown :items="iconItems" @select="pick">
    <SrButton variant="outline" size="sm">带图标</SrButton>
  </SrDropdown>

  <SrDropdown :items="groupedItems" @select="pick">
    <SrButton variant="outline" size="sm">分组 + 危险项</SrButton>
  </SrDropdown>

  <span style="font-size: 13px; color: var(--vp-c-text-3)">
    最近选择：{{ lastPicked || '—' }}
  </span>
</div>

## 选中与禁用

`items[].selected` 会在右侧显示勾选标记，`disabled` 置灰不可点：

<div class="sr-demo">
  <SrDropdown :items="stateItems" @select="pick">
    <SrButton variant="outline" size="sm">状态示例</SrButton>
  </SrDropdown>
</div>

## 触发方式

`trigger` 支持 `click`（默认）和 `hover`。悬停触发时带了 160ms 的延迟关闭——鼠标从触发器移到面板的途中不会误关。

<div class="sr-demo">
  <SrDropdown :items="iconItems" trigger="hover" @select="pick">
    <SrButton variant="text" size="sm">悬停我</SrButton>
  </SrDropdown>
</div>

## 自定义面板

不传 `items` 时，`#menu` 插槽接管整个面板。做设置面板这类内容时通常配三个属性：

| 属性 | 作用 |
| --- | --- |
| `flush` | 去掉面板内边距，留白交给内容自己控制 |
| `role="dialog"` | 面板语义从菜单改成对话框，A11y 才正确 |
| `:min-width` | 放宽最小宽度，容得下横向布局 |

<div class="sr-demo">
  <SrDropdown flush role="dialog" :min-width="260">
    <SrButton variant="outline" size="sm">外观设置</SrButton>
    <template #menu>
      <div style="padding: 14px 16px; min-width: 240px">
        <p style="margin: 0 0 10px; font-weight: 600; font-size: 13px">主题</p>
        <SrTabs v-model="currentTheme" :items="themeOptions" type="pill" size="sm" />
        <p style="margin: 14px 0 0; font-size: 12px; color: var(--vp-c-text-3)">
          这是 #menu 插槽，里面可以是任意内容
        </p>
      </div>
    </template>
  </SrDropdown>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `SrDropdownItem[]` | `[]` | 菜单项；传了就走内置菜单 |
| `trigger` | `'click' \| 'hover'` | `'click'` | 触发方式 |
| `placement` | `SrPlacement` | `'bottom-start'` | 弹出位置，12 方向 |
| `size` | `SrSize` | 继承配置 | 菜单项密度 |
| `minWidth` | `string \| number` | `160` | 菜单最小宽度，数字按 px |
| `flush` | `boolean` | `false` | 去掉面板内边距 |
| `role` | `string` | `'menu'` | 面板 ARIA role，自定义面板建议 `dialog` |
| `disabled` | `boolean` | `false` | 禁用整个下拉 |

### SrDropdownItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 唯一标识，选择时回传 |
| `label` | `string` | 文案 |
| `icon` | `string` | 图标名 |
| `disabled` | `boolean` | 不可点 |
| `danger` | `boolean` | 危险项，文字与悬停底色变红 |
| `selected` | `boolean` | 右侧显示勾选标记 |
| `divided` | `boolean` | 上方加分割线 |
| `group` | `string` | 分组标题，与上一项不同时渲染 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `select` | `key, item` | 选中菜单项（`#menu` 插槽模式下不会触发） |
| `visible-change` | `visible` | 面板开合 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 触发器内容 |
| `menu` | 自定义面板，覆盖内置菜单 |

## 注意事项

- **同一组内图标要么全有、要么全无**。混搭会让菜单看起来像随手拼的。
- 面板被 Teleport 到 `body`，所以尺寸相关的 CSS 变量定义在面板自身上，不继承触发器。
- 页面滚动时面板跟随触发器重新定位；触发器完全滚出视口则自动关闭。
- 点面板外部、按 Esc 都会关闭。
