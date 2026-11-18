# SrChinaMap 中国地图

按省级行政区展示访客分布。纯 SVG 绘制，支持分级着色与气泡两种模式，颜色跟随主题。

**它不在主入口里**：地图数据 gzip 后约 39KB，如果挂进 `@sunset-reverie/ui` 的入口，不用地图的项目也要白背这份体积。所以单独走子路径，只有显式引入才加载：

```ts
import { SrChinaMap } from '@sunset-reverie/ui/china-map'
```

## 交互演示

<div class="sr-demo">
  <SrChinaMap
    :data="[
      { name: '广东', value: 3820 },
      { name: '江苏', value: 2960 },
      { name: '浙江', value: 2410 },
      { name: '北京', value: 2180 },
      { name: '上海', value: 2050 },
      { name: '四川', value: 1640 },
      { name: '山东', value: 1520 },
      { name: '湖北', value: 1180 },
      { name: '福建', value: 960 },
      { name: '陕西', value: 720 },
      { name: '新疆', value: 310 },
      { name: '西藏', value: 96 },
    ]"
    :height="420"
  />
</div>

鼠标移上去看数值，点击省份会抛出 `select` 事件。

## 基础用法

```vue
<script setup lang="ts">
import { SrChinaMap, type ChinaMapDatum } from '@sunset-reverie/ui/china-map'

const visitors: ChinaMapDatum[] = [
  { name: '广东', value: 3820 },
  { name: '江苏', value: 2960 },
]
</script>

<template>
  <SrChinaMap :data="visitors" />
</template>
```

没有数据的省份会画成很浅的底色，地图轮廓始终完整——访客统计页不该出现「空白地图」。

## 两种模式

**分级着色（默认）**：按数值深浅填色，适合看整体分布。

```vue
<SrChinaMap :data="visitors" mode="choropleth" />
```

**气泡**：在省会位置打点，半径按数值开方缩放，适合看排名与集中度。

<div class="sr-demo">
  <SrChinaMap
    mode="bubble"
    :data="[
      { name: '广东', value: 1820 },
      { name: '上海', value: 2050 },
      { name: '北京', value: 2180 },
      { name: '浙江', value: 1310 },
      { name: '四川', value: 980 },
      { name: '陕西', value: 640 },
    ]"
    :height="380"
  />
</div>

> 气泡落在**省的中心点**，不是城市经纬度。地图只认省级区域，写城市名（如「深圳」）不会自动聚合到「广东」，需要业务侧先归并；精确到城市的点位能力不在这一版范围内。

## 数据与名称归一

`data` 的元素是 `{ name: string, value: number }`。`name` 允许写三种形式，内部统一归一：

| 写法 | 是否可识别 |
| --- | --- |
| `广东` | ✅ 短名 |
| `广东省` | ✅ 去掉「省」 |
| `内蒙古自治区` | ✅ 去掉「自治区」 |
| `广西壮族自治区` | ✅ 去掉「壮族自治区」 |
| `香港特别行政区` | ✅ 去掉「特别行政区」 |

同一个省写多次会累加，方便把「广州 + 深圳」合并成「广东」：

```ts
const data = [
  { name: '广州', value: 800 }, // 归一到「广东」，但地图上没有「广州」这个区域，会被忽略
  { name: '广东省', value: 1200 },
]
```

> 只有 34 个省级行政区 + 南海诸岛是地图区域，城市名不会自动聚合到省，需要业务侧先归并。

## 缩放与留白

默认的 `fit="contain"` 是「等比缩放到宽高都装得下」，所以**地图大小完全由 `height` 决定**：容器变宽不会让地图变大，只会让左右留白变多。

宽面板里想让地图真正铺满，用 `fit="width"`：

```vue
<SrChinaMap :data="visitors" fit="width" height="auto" :padding="4" />
```

| `fit` | 缩放依据 | 画布尺寸 |
| --- | --- | --- |
| `contain`（默认） | `min(可用宽, 可用高)` | 与容器一致，地图居中 |
| `width` | 可用宽 | 高度由地图宽高比反推，可能超出传入的 `height` |
| `height` | 可用高 | 宽度由宽高比反推 |

实测对比（容器宽 843px）：

| 配置 | viewBox | 地图实际宽度 | 标签字号 |
| --- | --- | --- | --- |
| `contain` + `height=420` | `0 0 843 420` | 424px（一半是空白） | 11px |
| `fit="width"` + `height="auto"` | `0 0 843 819` | 835px（铺满） | 15px |

### zoom

`zoom` 在原有比例上做**中心放大**，画布尺寸不变，溢出部分由容器裁掉：

```vue
<SrChinaMap :data="visitors" :height="360" :zoom="1.2" :padding="2" />
```

适合「面板高度不变、只想让地图大一点」。代价是四角可能被裁，建议同时调小 `padding`。

### 标签密度

标签按面积从大到小放置，重叠的跳过；窄图里几个小省会互相压住，看起来像「名字显示不全」。两个手段控制：

```vue
<SrChinaMap :data="visitors" :label-min-area="6" :label-size="13" />
```

- `labelMinArea`：面积小于阈值的省**直接不画**，比让重叠检测随机丢几个更可预期
- `labelSize`：不传时按画布高度相对 420 等比缩放（夹在 9–15），大屏不至于小得看不清

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `ChinaMapDatum[]` | `[]` | 各省数值；名称写「北京」或「北京市」都能对上 |
| `mode` | `'choropleth' \| 'bubble'` | `'choropleth'` | 展示模式 |
| `height` | `number \| 'auto'` | `420` | 地图高度。`'auto'` 时按容器宽度与地图宽高比反推（仅 `fit: 'width'` 有效） |
| `fit` | `'contain' \| 'width' \| 'height'` | `'contain'` | 缩放策略，见下方「缩放与留白」 |
| `zoom` | `number` | `1` | 额外的中心缩放倍数，溢出部分被裁掉 |
| `padding` | `number` | `12` | 地图四周留白（px），`0` 表示贴边 |
| `labelMinArea` | `number` | `0` | 省份标签的最小面积阈值（平方度），小于它的省不画标签 |
| `labelSize` | `number` | `0` | 标签字号（px），`0` 表示按画布高度自动缩放（夹在 9–15） |
| `showLabel` | `boolean` | `true` | 是否显示省份名称 |
| `showLegend` | `boolean` | `true` | 是否显示色阶 / 气泡图例 |
| `showTooltip` | `boolean` | `true` | 是否显示悬停提示 |
| `emptyText` | `string` | `'暂无数据'` | 无数据时的占位文案 |
| `maxRadius` | `number` | `26` | 气泡模式下的最大半径（px） |

`data` 的元素结构：`{ name: string, value: number }`。

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `select` | `{ name: string, value: number }` | 点击省份时触发；该省无数据时 `value` 为 0 |

```vue
<SrChinaMap :data="visitors" @select="(p) => console.log(p.name, p.value)" />
```

## 关于数据与合规

地图数据由 `pnpm gen:china-map` 从阿里 DataV.GeoAtlas 的省级边界生成，经过 Douglas-Peucker 简化（容差 0.05°，约 5km）与坐标降精度（3 位小数，约 100m）：

| 项 | 数值 |
| --- | --- |
| 区域 | 34 个省级行政区 + 南海诸岛 |
| 坐标点 | 约 7500 个 |
| 源码体积 | 约 127KB |
| gzip 后 | 约 39KB（只在引入 `@sunset-reverie/ui/china-map` 时加载） |

> **合规提示**：DataV 的边界数据**不带地图审图号**。内部管理后台、公司内网系统使用一般没有问题；如果要对外发布（公开网站、需要上架的 App、对外 SaaS），依法应使用自然资源部标准地图服务（`bzdt.ch.mnr.gov.cn`）的底图并标注审图号，或先咨询法务。这个库默认按「内部自用」提供数据，对外场景请自行替换 `china-provinces.ts`。

替换数据只需保证结构一致，然后重新构建：

```ts
export interface ChinaProvinceGeo {
  name: string // 短名，如「内蒙古」
  adcode: string // 行政区划代码
  center: [number, number] // 标注锚点 [经度, 纬度]
  rings: number[][][][] // 多边形 → 环 → 点
}
```

## 在 Nuxt 4 中使用

装了 `@sunset-reverie/nuxt` 之后组件会自动注册，模板里直接写标签即可：

```vue
<sr-china-map :data="visitors" />
```

模块按组件子路径注册（`@sunset-reverie/ui/china-map`），所以不会把整个库拉进构建图。

## 注意事项

- **宽度自适应、高度固定**：容器宽度变化时重新投影，省份形状不会被拉伸；服务端渲染首帧按 640px 计算，水合后校正。
- **不显示城市**：只有省级区域，城市名不会自动归并到省，需要业务侧先合并。
- **名称可能被跳过**：上海、天津、香港、澳门这类面积很小的区域，标签会与相邻省份重叠，组件会按面积优先保留大省、跳过放不下的标签；数值仍可通过悬停查看。
- **南海诸岛单独成图**：主图取景时排除了南海诸岛（否则整体会被压扁），它在右下角以独立小图呈现，边框内是九段线与岛礁。
- **没有世界地图**：只做中国省级，不内置其它国家数据。
