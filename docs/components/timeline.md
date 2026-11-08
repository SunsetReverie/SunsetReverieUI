# SrTimeline 时间轴

按时间顺序展示一串事件。用于操作日志、审批记录、版本历史这类「有先后顺序」的列表。

<script setup>
import { ref } from 'vue'

const basicItems = [
  { content: '创建项目', timestamp: '2026-11-08 09:12' },
  { content: '配置 Token', timestamp: '2026-11-08 10:24' },
  { content: '接入组件库', timestamp: '2026-11-08 14:02' },
  { content: '上线测试环境', timestamp: '2026-11-08 16:30' },
]

const approvalItems = [
  { content: '提交申请 · 林深', timestamp: '11-08 10:24', type: 'primary' },
  { content: '初审通过 · 王敏', timestamp: '11-08 14:02', type: 'success' },
  { content: '复审中 · 待处理', timestamp: '11-08 16:30', type: 'warning' },
  { content: '放款', timestamp: '待处理', hollow: true },
]

const reversed = ref(false)
</script>

## 交互演示

<div class="sr-demo is-block">
  <SrTimeline :items="basicItems" />
</div>

## 基础用法

```vue
<SrTimeline :items="[
  { content: '创建项目', timestamp: '2026-11-08 09:12' },
  { content: '配置 Token', timestamp: '2026-11-08 10:24' },
]" />
```

时间戳默认在右侧。圆点是灰色实心，最后一项不画连接线。

## 时间戳位置

`mode="left"` 把时间挪到左边：

<div class="sr-demo is-block">
  <SrTimeline :items="basicItems" mode="left" />
</div>

适合时间占位固定的日志列表——左边一列时间对齐，扫一眼就能定位。

## 节点类型

| `type` | 颜色 | 用途 |
| --- | --- | --- |
| `default` | 灰色 | 普通事件 |
| `primary` | 主色 | 起点、当前动作 |
| `success` | 绿色 | 完成、通过 |
| `warning` | 黄色 | 待处理、有风险 |
| `error` | 红色 | 失败 |

<div class="sr-demo is-block">
  <SrTimeline :items="approvalItems" />
</div>

`hollow: true` 是空心圆点，用来表示「还没走到」——比灰色实心更弱一档。

## 自定义图标

```vue
<SrTimeline :items="[
  { content: 'v1.2.0 发布', timestamp: '11-08', icon: 'lucide:check', type: 'success' },
]" />
```

<div class="sr-demo is-block">
  <SrTimeline :items="[
    { content: 'v1.2.0 发布 · 新增 4 个组件', timestamp: '11-08', icon: 'lucide:check', type: 'success' },
    { content: 'v1.1.0 发布 · 浮层材质统一', timestamp: '11-05', icon: 'lucide:check', type: 'success' },
    { content: 'v1.0.0 发布 · 首个稳定版', timestamp: '11-01', icon: 'lucide:check', type: 'success' },
  ]" />
</div>

传了 `icon` 会替换圆点，同时节点自动撑大到 18px 容纳图标。

## 倒序

`reverse` 把最新的一条放最上面：

<div class="sr-demo is-block">
  <SrButton size="xs" :variant="reversed ? 'primary' : 'outline'" @click="reversed = !reversed">
    {{ reversed ? '已倒序' : '正序' }}
  </SrButton>
  <div style="margin-top: 12px">
    <SrTimeline :items="basicItems" :reverse="reversed" />
  </div>
</div>

操作日志通常用倒序——用户关心的是「刚刚发生了什么」。

## 错误节点

<div class="sr-demo is-block">
  <SrTimeline :items="[
    { content: '开始构建', timestamp: '09:00', type: 'success' },
    { content: '类型检查通过', timestamp: '09:02', type: 'success' },
    { content: '样式构建失败 · 变量未定义', timestamp: '09:05', type: 'error' },
    { content: '部署已跳过', timestamp: '—', hollow: true },
  ]" />
</div>

出错那步用 `error`，后续被跳过的步骤用 `hollow`——比直接不显示更清楚。

## 自定义内容

`#content` 插槽能放标签、按钮：

<div class="sr-demo is-block">
  <SrTimeline
    :items="[
      { content: '部署成功', timestamp: '11-08 16:30', type: 'success' },
      { content: '回滚到上一版', timestamp: '11-08 17:10', type: 'warning' },
    ]"
  >
    <template #content="{ item }">
      <span style="display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap">
        {{ item.content }}
        <SrTag :type="item.type === 'success' ? 'success' : 'warning'" size="sm">{{ item.timestamp }}</SrTag>
      </span>
    </template>
  </SrTimeline>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `SrTimelineItem[]` | `[]` | 节点列表 |
| `mode` | `'left' \| 'right'` | `'right'` | 时间戳位置 |
| `reverse` | `boolean` | `false` | 倒序排列 |

### SrTimelineItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `content` | `string` | 内容 |
| `timestamp` | `string` | 时间戳 |
| `type` | `SrTimelineType` | 节点颜色，默认 `default` |
| `icon` | `string` | 自定义图标，替换圆点 |
| `hollow` | `boolean` | 空心圆点 |

## 插槽

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `content` | `{ item, index }` | 自定义节点内容 |

## 注意事项

- **`reverse` 只改渲染顺序**，不会改动你传进来的数组。所以 `#content` 插槽拿到的 `index` 是渲染后的下标。
- **`hollow` 和 `type` 可以叠加**：空心 + 红色表示「本该出错但被跳过了」。
- **连接线是绝对定位的**，贯穿到下一项的圆点上方。最后一项不画，所以不会有多余的尾巴。
- **节点数量多时考虑分页**。几百条的时间轴没有虚拟滚动，DOM 会全部渲染。
