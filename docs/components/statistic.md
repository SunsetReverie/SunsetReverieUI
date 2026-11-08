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
