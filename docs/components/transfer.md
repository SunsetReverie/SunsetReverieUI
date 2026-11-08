# SrTransfer 穿梭框

两列列表，勾选后点箭头把项从一边移到另一边。用于权限分配、字段选择这类「从一堆里挑一部分」的场景。

<script setup>
import { ref } from 'vue'

const allItems = [
  { value: 'dashboard', label: '仪表盘' },
  { value: 'users', label: '用户管理' },
  { value: 'roles', label: '角色权限' },
  { value: 'audit', label: '审计日志' },
  { value: 'billing', label: '账单中心' },
  { value: 'settings', label: '系统设置' },
]

const basic = ref(['users', 'roles'])
const titled = ref([])
</script>

## 交互演示

<div class="sr-demo is-block">
  <SrTransfer v-model="basic" :data="allItems" />
</div>

## 基础用法

```vue
<SrTransfer v-model="selected" :data="items" />
```

```ts
const items = [
  { value: 'dashboard', label: '仪表盘' },
  { value: 'users', label: '用户管理' },
]

const selected = ref(['users'])   // 右侧的值
```

## 值只记「在哪一边」

`modelValue` 存的是**右侧所有值的数组**，不包含位置或顺序信息：

```ts
selected.value = ['users', 'roles']
```

两侧列表都由它算出来：

```
左侧 = data 里不在 selected 中的项
右侧 = data 里在 selected 中的项
```

**顺序永远跟 `data` 一致**。所以右侧的项不会因为你先移哪个而乱序——这比「记录移动顺序」更符合直觉，刷新后也稳定。

## 可搜索

```vue
<SrTransfer v-model="selected" :data="items" filterable />
```

<div class="sr-demo is-block">
  <SrTransfer v-model="titled" :data="allItems" filterable :titles="['全部权限', '已授权']" />
</div>

两侧各有独立搜索框，互不影响。搜索只过滤显示，**不改变已勾选状态**——搜走的那部分如果原本勾着，仍然是勾着的。

## 全选

表头的复选框是全选：

- 点一下选中**当前列表中所有可用的项**
- 已有部分选中时显示为半选
- **禁用项会被跳过**

从左边全选右移时，禁用的那几项会留在原地。

## 禁用

**整体禁用**：两侧都变灰、按钮不可点，适合「只读查看」的权限页。

**单项禁用**：数据里写 `disabled: true`，该项不能被勾选、也不会被全选带走。

```ts
{ value: 'billing', label: '账单中心', disabled: true }
```

## 自定义标题

```vue
<SrTransfer :titles="['可选角色', '已分配角色']" />
```

`titles` 是一个二元组，对应左右两列。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `SrTransferValue[]` | `[]` | 右侧的值 |
| `data` | `SrTransferItem[]` | `[]` | 全部数据 |
| `titles` | `[string, string]` | `['待选', '已选']` | 两侧标题 |
| `filterable` | `boolean` | `false` | 两侧可搜索 |
| `disabled` | `boolean` | `false` | 禁用 |
| `height` | `number` | `260` | 列表高度（px） |
| `emptyText` | `string` | `'暂无数据'` | 空状态文案 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |

### SrTransferItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| number` | 值 |
| `label` | `string` | 显示文案 |
| `disabled` | `boolean` | 禁用，不可移动 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 右侧值变化 |
| `change` | `value, direction` | `direction` 是 `'right'`（移入）或 `'left'`（移出） |

## 注意事项

- **移动后勾选会清空**。移完一批，那批的勾选状态被重置，避免「不小心又移回去」。
- **搜索不影响勾选**。过滤只是隐藏，勾着的项即使看不见仍在选中集合里，点箭头照样会被移动。
- **全选只作用于可用项**。禁用的项不会被全选带走，这是刻意的——否则「全选后移动」会移动不了（因为禁用项不能动）。
- **两侧数量大时建议开 `filterable`**。40 项以上没有搜索很难找。
- **窄屏自动竖排**：640px 以下变成上下两列，按钮移到中间横排。
