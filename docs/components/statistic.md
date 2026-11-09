# SrStatistic 统计数值

数字展示：千分位、精度、前后缀。仪表盘、数据概览卡片的标准排版。

## 交互演示

<div class="sr-demo">
  <SrStatistic title="总用户数" :value="12846" />
  <SrStatistic title="本月收入" :value="126800.4" :precision="2" prefix="¥" />
  <SrStatistic title="转化率" :value="0.856" suffix="%" :formatter="(v) => (v * 100).toFixed(1)" />
</div>

## 基础用法

```vue
<SrStatistic title="总用户数" :value="12846" />
```

整数默认加千分位：`12,846`。

## 精度

```vue
<SrStatistic :value="3.7" :precision="2" />   <!-- 3.70 -->
<SrStatistic :value="3.7" :precision="0" />   <!-- 4 -->
```

不足补零，超出四舍五入。小数部分同样参与千分位：`1234.5` → `1,234.5`。

## 千分位

```vue
<SrStatistic :value="1234567" />                  <!-- 1,234,567 -->
<SrStatistic :value="1234567" separator=" " />    <!-- 1 234 567 -->
<SrStatistic :value="1234567" separator="" />     <!-- 1234567 -->
```

负数会保留符号并正确分组：`-1234` → `-1,234`。

## 前缀与后缀

```vue
<SrStatistic :value="99" prefix="¥" suffix="元" />
```

前后缀的字号比数值小一档，颜色也更淡，不会喧宾夺主。

## 完全自定义

```vue
<SrStatistic
  :value="0.856"
  :formatter="(v) => `${(v * 100).toFixed(1)}%`"
/>
```

传 `formatter` 后 `precision` 与 `separator` 都不再生效——它接管的整个数字部分（前后缀仍会显示）。

## 数字滚动

```vue
<SrStatistic title="今日访问" :value="12846" count-up />
```

开启后挂载时从 **0 滚到目标值**，默认 1.2 秒：

<div class="sr-demo">
  <SrStatistic title="今日访问" :value="12846" count-up />
  <SrStatistic title="成交额" :value="126800.4" :precision="2" prefix="¥" count-up />
  <SrStatistic title="慢速 3 秒" :value="8642" :duration="3000" count-up />
</div>

`value` 变化时也会滚——从**当前显示值**滚到新值，不是每次都从 0 重来。刷新数据时数字平滑过渡，不会突兀跳变。

### 缓动而不是匀速

用的是 `easeOutCubic`（先快后慢）：

```ts
1 - (1 - progress) ** 3
```

匀速滚动看起来像机械计数器，而且末位会一直跑到最后一刻才停。缓动让数字在末尾自然减速，读起来更舒服。

### 时长

| `duration` | 效果 |
| --- | --- |
| `0` | 直接显示最终值，不滚 |
| `600` | 紧凑，适合频繁刷新的卡片 |
| `1200`（默认） | 大多数场景 |
| `3000` | 强调型，适合首屏大数字 |

### 尊重系统的减动效偏好

系统开启「减少动态效果」时自动跳过动画，直接显示最终值。这是无障碍要求，不需要你额外判断。

### 服务端渲染

组件**首次渲染就输出最终值**，动画在挂载后才接管。所以：

- SSR 的 HTML 里是 `12,846`，不是 `0`
- 不会出现水合不匹配的警告
- 动画起始的赋值发生在浏览器首次绘制之前，看不到闪烁

## 加载中

```vue
<SrStatistic title="总用户数" :value="users" :loading="loading" />
```

显示一条占位条而不是 `0`。用 `0` 占位容易被误读成「真实数据就是 0」。

## 数值颜色

```vue
<SrStatistic :value="12.4" suffix="%" value-color="#1f7a4d" />
<SrStatistic :value="-8.2" suffix="%" value-color="#d64545" />
```

常见用法是同比增长绿、下降红。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | `0` | 数值 |
| `title` | `string` | `''` | 标题 |
| `precision` | `number` | `0` | 小数位数 |
| `prefix` | `string` | `''` | 前缀 |
| `suffix` | `string` | `''` | 后缀 |
| `separator` | `string` | `','` | 千分位分隔符，空字符串关闭 |
| `formatter` | `(value) => string` | — | 完全接管数字显示 |
| `loading` | `boolean` | `false` | 加载中 |
| `countUp` | `boolean` | `false` | 数字滚动动画 |
| `duration` | `number` | `1200` | 滚动时长（毫秒） |
| `valueColor` | `string` | `''` | 数值颜色 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| `title` | 自定义标题 |
| `prefix` | 自定义前缀（可放图标） |
| `suffix` | 自定义后缀 |

## 注意事项

- **数值用等宽数字**（`font-variant-numeric: tabular-nums`）。数字滚动或刷新时宽度不跳，一排卡片不会左右晃。
- **`loading` 不显示 `0`**。占位条比「0」诚实。
- **没有内置数字滚动动画**。需要的话自己用 `requestAnimationFrame` 插值 `value`，`formatter` 会实时跟上。
- **`value` 只接受 `number`**。字符串会静默按 `NaN` 处理，需要格式化货币请用 `formatter`。
- **`countUp` 默认关闭**。列表页里几十个数字同时滚动会很吵，只在大数字、首屏概览这类场景开启。
- **动画过程中 `formatter` 会被调用很多次**（每帧一次）。里面别做请求或重计算，它会成为性能瓶颈。
- **`countUp` 与 `loading` 互斥**。`loading` 时显示占位条，动画不会跑；`loading` 结束后从当前值继续。
