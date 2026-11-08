# SrCascader 级联选择

多级联动选择：点第一列展开第二列，点到最后一级才提交。用于省市区、部门层级这类有从属关系的数据。

<script setup>
import { ref } from 'vue'

const regions = [
  {
    value: 'zj',
    label: '浙江省',
    children: [
      {
        value: 'hz',
        label: '杭州市',
        children: [
          { value: 'xh', label: '西湖区' },
          { value: 'sc', label: '上城区' },
          { value: 'yh', label: '余杭区' },
        ],
      },
      {
        value: 'nb',
        label: '宁波市',
        children: [
          { value: 'hs', label: '海曙区' },
          { value: 'jd', label: '江东区', disabled: true },
        ],
      },
    ],
  },
  {
    value: 'js',
    label: '江苏省',
    children: [
      {
        value: 'nj',
        label: '南京市',
        children: [
          { value: 'gl', label: '鼓楼区' },
          { value: 'xw', label: '玄武区' },
        ],
      },
    ],
  },
]

const single = ref(['zj', 'hz', 'xh'])
const multi = ref([['zj', 'hz', 'xh'], ['js', 'nj', 'gl']])
</script>

## 交互演示

<div class="sr-demo is-block">
  <div style="max-width: 280px">
    <SrCascader v-model="single" :options="regions" clearable />
  </div>
  <p style="margin: 10px 0 0; font-size: 12px; color: var(--vp-c-text-3)">
    当前值：<code>{{ single.join(' / ') || '空' }}</code>
  </p>
</div>

## 值是路径，不是叶子

这是 Cascader 和 Select 最大的不同：

```ts
// Select 单选
modelValue: 'xh'

// Cascader 单选 —— 从根到叶子的完整路径
modelValue: ['zj', 'hz', 'xh']
```

**为什么存路径**：只用叶子值的话，回显时得反查整棵树才能拼出「浙江省 / 杭州市 / 西湖区」。存路径让回显变成 O(1) 的查表。

多选时是**路径数组的数组**：

```ts
modelValue: [['zj', 'hz', 'xh'], ['js', 'nj', 'gl']]
```

<div class="sr-demo is-block">
  <div style="max-width: 400px">
    <SrCascader v-model="multi" :options="regions" multiple clearable />
  </div>
</div>

每个标签可以单独移除，移除即从值里删掉对应路径。

## 基础用法

```vue
<SrCascader v-model="value" :options="regions" />
```

数据是嵌套结构：

```ts
const regions = [
  {
    value: 'zj',
    label: '浙江省',
    children: [
      { value: 'hz', label: '杭州市', children: [{ value: 'xh', label: '西湖区' }] },
    ],
  },
]
```

**有 `children` 的节点点下去是展开，没有的才是提交**。所以叶子节点别给空数组（`children: []`），会被当成「还能展开」。

## 显示完整路径

`showAllLevels: false` 只显示最后一级：

<div class="sr-demo is-block">
  <div style="display: flex; gap: 16px; flex-wrap: wrap">
    <div style="width: 200px">
      <p style="margin: 0 0 6px; font-size: 11px; color: var(--vp-c-text-3)">默认（完整路径）</p>
      <SrCascader v-model="single" :options="regions" />
    </div>
    <div style="width: 180px">
      <p style="margin: 0 0 6px; font-size: 11px; color: var(--vp-c-text-3)">只显示末级</p>
      <SrCascader v-model="single" :options="regions" :show-all-levels="false" />
    </div>
  </div>
</div>

`separator` 可以改分隔符，默认 `' / '`。

## 搜索

```vue
<SrCascader v-model="value" :options="regions" filterable />
```

<div class="sr-demo is-block">
  <div style="max-width: 260px">
    <SrCascader v-model="single" :options="regions" filterable clearable placeholder="搜索区县" />
  </div>
</div>

输入关键字后，面板里平铺展示命中的**叶子节点**，每行带完整路径。选中即提交，不会再逐级点。

匹配规则是「各级 label 拼起来包含关键字」，所以搜「浙江」「杭州」「西湖」都能命中西湖区。

## 展开方式

`expandTrigger: 'hover'` 让鼠标移入就展开下一级，适合层级浅的数据：

| 值 | 行为 | 适合 |
| --- | --- | --- |
| `click`（默认） | 点一下展开 | 层级深、要精确点选 |
| `hover` | 移入即展开 | 层级浅、快速浏览 |

## 禁用

**整体禁用**传在组件上；**单项禁用**写在数据里：

<div class="sr-demo is-block">
  <div style="max-width: 240px">
    <SrCascader v-model="single" :options="regions" disabled />
  </div>
</div>

```ts
{ value: 'jd', label: '江东区', disabled: true }
```

禁用的节点点了没反应，但**它下面其它分支仍然可以点**——只禁自己那一项。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `SrCascaderValue[] \| SrCascaderValue[][]` | `[]` | 选中值，单选是路径，多选是路径数组 |
| `options` | `SrCascaderOption[]` | `[]` | 级联数据 |
| `multiple` | `boolean` | `false` | 多选 |
| `filterable` | `boolean` | `false` | 可搜索 |
| `clearable` | `boolean` | `false` | 可清空 |
| `disabled` | `boolean` | `false` | 禁用 |
| `placeholder` | `string` | `'请选择'` | 占位文案 |
| `separator` | `string` | `' / '` | 路径分隔符 |
| `showAllLevels` | `boolean` | `true` | 显示完整路径 |
| `expandTrigger` | `'click' \| 'hover'` | `'click'` | 展开方式 |
| `maxHeight` | `number` | `280` | 面板最大高度 |
| `emptyText` | `string` | `'暂无数据'` | 空状态文案 |
| `status` | `'error' \| 'warning'` | — | 校验态 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |

### SrCascaderOption

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| number` | 值 |
| `label` | `string` | 显示文案 |
| `children` | `SrCascaderOption[]` | 子节点，有它才会展开 |
| `disabled` | `boolean` | 禁用该项 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 选中值变化 |
| `change` | `value, labels` | 选中了某一项，`labels` 是各级文案 |
| `visible-change` | `visible` | 面板显隐 |

`change` 的第二个参数省掉了「拿路径去反查文案」这一步：

```ts
function onChange(value, labels) {
  srMessage.success(`已选择 ${labels.join(' / ')}`)
}
```

## 注意事项

- **`children: []` 会被当成可展开节点**。叶子节点不要给空数组，直接省略这个字段。
- **值是路径数组，长度必须能对上**。传 `['zj', 'hz']` 但 hz 是叶子，触发器会显示「浙江省 / 杭州市」，能回显但不完整。
- **搜索只匹配叶子**。中间层级节点不出现在搜索结果里——选中中间节点没有意义，值必须到叶子。
- **面板 Teleport 到 body**，所以父容器的 `overflow: hidden` 不会裁掉它，但也不会继承父级的字体设置。
- **层级建议不超过 4 级**。再多列会很宽，横向滚动体验差；这种情况更适合做成「先选省，再换一批选项」的两段式。
