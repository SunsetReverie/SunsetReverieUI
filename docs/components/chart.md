# SrChart 图表

纯 SVG 手绘的轻量图表：折线、柱状、面积、饼图/环形。没有图表库依赖，颜色全部取主题变量，换肤、明暗切换、品牌色变化时自动跟随。

适合中后台里「几张图看懂趋势」的场景；海量点位（几千以上）的实时曲线不在设计目标内。

## 交互演示

<div class="sr-demo">
  <SrChart
    type="line"
    :categories="['周一', '周二', '周三', '周四', '周五', '周六', '周日']"
    :series="[{ name: '访问量', data: [820, 932, 901, 934, 1290, 1330, 1320] }, { name: '下单量', data: [320, 432, 401, 434, 690, 730, 620] }]"
    :height="260"
  />
</div>

## 基础用法

`categories` 是 x 轴分类，`series` 是数据系列，长度对应即可：

```vue
<SrChart
  :categories="['一月', '二月', '三月']"
  :series="[{ name: '收入', data: [120, 200, 150] }]"
/>
```

只传 `series`、不传 `categories` 时，tooltip 与 x 轴用 `#1`、`#2` 兜底，不会报错。

## 图表类型

| 类型 | 说明 |
| --- | --- |
| `line` | 折线图（默认），多个系列画多条线 |
| `bar` | 柱状图，多个系列并排 |
| `area` | 面积图，折线下方填充半透明区域 |
| `pie` | 饼图 / 环形图，只读取 `series[0]`，分类取自 `categories` |

## 柱状图

<div class="sr-demo">
  <SrChart
    type="bar"
    :categories="['一月', '二月', '三月', '四月']"
    :series="[{ name: '线上', data: [320, 480, 360, 520] }, { name: '线下', data: [180, 220, 260, 240] }]"
    :height="240"
  />
</div>

多系列默认并排；传 `stacked` 后按分类堆叠，y 轴按累计值取刻度：

<div class="sr-demo">
  <SrChart
    type="bar"
    stacked
    :categories="['一月', '二月', '三月', '四月']"
    :series="[{ name: '线上', data: [320, 480, 360, 520] }, { name: '线下', data: [180, 220, 260, 240] }]"
    :height="240"
  />
</div>

## 面积图

<div class="sr-demo">
  <SrChart
    type="area"
    :categories="['周一', '周二', '周三', '周四', '周五']"
    :series="[{ name: '请求数', data: [120, 240, 180, 320, 260] }]"
    :height="220"
  />
</div>

`area` 目前不做堆叠：多系列时各画各的填充，避免叠加顺序造成误读。

## 饼图与环形图

<div class="sr-demo">
  <SrChart
    type="pie"
    :categories="['直接访问', '搜索引擎', '社交媒体', '外部链接']"
    :series="[{ name: '来源', data: [335, 310, 234, 135] }]"
    :height="260"
  />
  <SrChart
    type="pie"
    :categories="['直接访问', '搜索引擎', '社交媒体', '外部链接']"
    :series="[{ name: '来源', data: [335, 310, 234, 135] }]"
    :height="260"
    :inner-radius="0.62"
  />
</div>

`innerRadius` 取 0-0.9，超过会被夹取；0 是实心饼图，0.6 左右是常见的环形。

## 颜色

不传 `colors` 时按主题色轮转：primary → success → warning → danger → info。传了就按顺序取，不够时循环：

<div class="sr-demo">
  <SrChart
    type="bar"
    :categories="['一月', '二月', '三月']"
    :series="[{ name: '收入', data: [120, 200, 150] }]"
    :colors="['var(--sr-color-info)']"
    :height="200"
  />
</div>

也可以给单个系列指定颜色，它会覆盖调色板：

```vue
<SrChart
  :categories="['一月', '二月']"
  :series="[
    { name: '收入', data: [120, 200], color: 'var(--sr-color-success)' },
    { name: '支出', data: [80, 140] },
  ]"
/>
```

## 不显示网格与图例

```vue
<SrChart :categories="categories" :series="series" :show-grid="false" :show-legend="false" />
```

## 空数据

`series` 为空、或所有系列的 `data` 都是空数组时，显示 `emptyText`（默认「暂无数据」）：

```vue
<SrChart :series="[]" empty-text="本月还没有数据" />
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'line' \| 'bar' \| 'area' \| 'pie'` | `'line'` | 图表类型 |
| `categories` | `string[]` | `[]` | x 轴分类标签；饼图里作为扇区名称 |
| `series` | `SrChartSeries[]` | `[]` | 数据系列；折线/柱状/面积可传多个，饼图只用第一个 |
| `height` | `number` | `280` | 图表高度（px） |
| `colors` | `string[]` | `undefined` | 自定义调色板（CSS 颜色或变量） |
| `showLegend` | `boolean` | `true` | 是否显示图例 |
| `showGrid` | `boolean` | `true` | 是否显示水平网格线与 y 轴刻度 |
| `smooth` | `boolean` | `true` | 折线 / 面积是否平滑 |
| `stacked` | `boolean` | `false` | 柱状是否堆叠 |
| `innerRadius` | `number` | `0` | 环形内半径占比（0-0.9，仅 `pie` 生效） |
| `showTooltip` | `boolean` | `true` | 是否显示悬停提示 |
| `emptyText` | `string` | `'暂无数据'` | 无数据时的占位文案 |

`series` 的元素结构：`{ name: string, data: number[], color?: string }`。

## 注意事项

- **宽度自适应、高度固定**：容器宽度变化时用 `ResizeObserver` 重算坐标，文字不会被拉伸变形；`height` 决定画布高度，高度变化会重新布局。服务端渲染首帧按 600px 宽度绘制，水合后立即校正。
- **纯 SVG，注意点位规模**：单个系列几百个点仍然流畅；上千点会生成上千个 DOM 节点，建议先在业务侧聚合（按小时/按天）。
- **颜色用 CSS 变量**：`colors` 里可以写 `var(--sr-color-primary)`，主题切换无需重渲染；写死十六进制色值时不会跟随暗色主题调整。
- **饼图只读第一组数据**：需要多环时放多个 `SrChart`，不要期望 `series` 拼接。
- **无动画**：图表不做入场动画，避免数据刷新时抖动，也避免与「减少动效」偏好冲突。
