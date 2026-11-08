# SrQRCode 二维码

把文本编码成二维码。**零运行时依赖**——Reed-Solomon 纠错、掩码选择、矩阵布局全部自研。

<script setup>
import { ref } from 'vue'

const text = ref('https://sunset-reverie.dev')
</script>

## 交互演示

<div class="sr-demo is-block">
  <div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap">
    <SrQRCode :value="text" :size="140" />
    <div style="flex: 1 1 240px; max-width: 320px">
      <SrInput v-model="text" placeholder="改这里，码会实时重算" clearable />
    </div>
  </div>
</div>

## 基础用法

```vue
<SrQRCode value="https://example.com" />
```

用 **SVG** 绘制，不是 canvas：

- 缩放到任意尺寸都不模糊
- 服务端渲染直接可用（canvas 需要 JS 才能画）
- 码点合并成一条 `<path>`，一万个模块也只有一个节点

## 容量有限，注意内容长度

只实现到**版本 4**，够用于 URL、短文本、Wi-Fi 配置，但不能塞长文章：

| 纠错等级 | 最大字节数 |
| --- | --- |
| `L` | 78 |
| `M`（默认） | 62 |
| `Q` | 46 |
| `H` | 34 |

**中文按 UTF-8 算，一个汉字 3 字节**。所以 `H` 等级下最多约 11 个汉字。

超长会派发 `error` 事件并且不渲染码：

```vue
<SrQRCode :value="veryLongText" @error="handleTooLong" />
```

```ts
function handleTooLong(reason: string) {
  srMessage.error('内容太长，无法生成二维码')
}
```

## 纠错等级

<div class="sr-demo is-block">
  <div style="display: flex; gap: 18px; flex-wrap: wrap">
    <div v-for="lv in ['L', 'M', 'Q', 'H']" :key="lv" style="text-align: center">
      <SrQRCode :value="text" :size="110" :level="lv" />
      <p style="margin: 6px 0 0; font-size: 11px; color: var(--vp-c-text-3)">{{ lv }}</p>
    </div>
  </div>
</div>

| 等级 | 可恢复比例 | 用途 |
| --- | --- | --- |
| `L` | 约 7% | 内容尽量短、环境干净 |
| `M` | 约 15% | 默认，多数场景够用 |
| `Q` | 约 25% | 可能被轻微遮挡 |
| `H` | 约 30% | **中间放图标时必须用这个** |

等级越高，同样内容需要的码点越多（看上面四张图的密度差异）。版本不变的情况下，等级越高能装的内容越少。

## 中心图标

```vue
<SrQRCode value="https://example.com" icon="lucide:heart" level="H" :icon-size="32" />
```

<div class="sr-demo is-block">
  <div style="display: flex; gap: 18px; flex-wrap: wrap">
    <SrQRCode :value="text" :size="140" icon="lucide:heart" level="H" :icon-size="32" />
    <SrQRCode :value="text" :size="140" icon="lucide:box" level="H" :icon-size="32" />
  </div>
</div>

图标会**挡住中间的码点**，靠纠错冗余补回来。所以：

- 图标必须配 `level="H"`
- 图标不要太大，`icon-size` 建议不超过边长的 1/4
- 图标底下有一层白底 + 3px 白边，避免和深色码点糊在一起

## 颜色

```vue
<SrQRCode value="..." color="#3e3edc" background-color="#f0fdf4" />
```

<div class="sr-demo is-block">
  <div style="display: flex; gap: 18px; flex-wrap: wrap">
    <SrQRCode :value="text" :size="110" color="#3e3edc" />
    <SrQRCode :value="text" :size="110" color="#1f7a4d" background-color="#f0fdf4" />
  </div>
</div>

**必须深色前景 + 浅色背景**。反过来的（浅码点画在深底上）多数扫码器认不出——规范里对比度是硬的，不是审美问题。

## 状态

<div class="sr-demo is-block">
  <div style="display: flex; gap: 18px; flex-wrap: wrap">
    <SrQRCode :value="text" :size="120" />
    <SrQRCode :value="text" :size="120" status="loading" />
    <SrQRCode :value="text" :size="120" status="expired" />
  </div>
</div>

| 状态 | 表现 | 场景 |
| --- | --- | --- |
| `active` | 正常渲染 | 默认 |
| `loading` | 显示加载占位 | 内容还没拿到 |
| `expired` | 保留码点 + 遮罩 + 「已失效」 | 登录码、支付码超时 |

`expired` 保留码点是刻意的：让用户看出「这里原本有个码，只是过期了」，比整块空白清楚。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | `''` | 要编码的内容 |
| `size` | `number` | `160` | 渲染尺寸（px） |
| `level` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'` | 纠错等级 |
| `margin` | `number` | `2` | 静区宽度（模块数） |
| `color` | `string` | `'#000000'` | 前景色 |
| `backgroundColor` | `string` | `'#ffffff'` | 背景色 |
| `icon` | `string` | `''` | 中心图标名 |
| `iconSize` | `number` | `28` | 图标尺寸（px） |
| `status` | `'active' \| 'loading' \| 'expired'` | `'active'` | 状态 |
| `expiredText` | `string` | `'二维码已失效'` | 失效提示文案 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `error` | `reason` | 内容超出可编码容量 |

## 编码工具

编码器也导出了，需要自己画（canvas、图片、终端输出）时可以直接用：

```ts
import { encodeQr, getCapacity, pickVersion } from '@sunset-reverie/ui'

const result = encodeQr('HELLO', 'M')
// { modules: boolean[][], version: 1, level: 'M' }

result?.modules.forEach((row) => {
  console.log(row.map((dark) => (dark ? '█' : ' ')).join(''))
})
```

`modules` 是 `true` 表示黑色的二维数组，直接拿去渲染即可。

## 注意事项

- **只支持版本 1~4**。再大的版本需要更多对齐图案和更复杂的块交织，这不是本库的目标场景。超长内容请走后端出图。
- **只做了字节模式**。数字和字母数字模式能压缩约 30% 的体积，但那只是优化，字节模式什么都能编，这里选了通用性。
- **`margin` 默认 2 而不是规范的 4**。小尺寸下 4 个模块的静区会显得四周很空，2 在主流扫码器上够用；对印刷品建议调回 4。
- **拖拽和动画都别加**。二维码周围不要放旋转、缩放动画，也不要用半透明，会显著降低识别率。
- **`expired` 不是自动的**。组件不管理有效期，需要你在业务里定时把 `status` 改成 `expired`。
