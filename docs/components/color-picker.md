# SrColorPicker 颜色选择器

点开面板拖选颜色，或直接输入十六进制。支持透明度、预设色板、三种输出格式。

<script setup>
import { ref } from 'vue'

const color = ref('#3e3edc')
const rgbColor = ref('rgb(31, 122, 77)')
const alphaColor = ref('rgba(62, 62, 220, 0.6)')
const themeColor = ref('#3e3edc')

const presets = ['#3e3edc', '#ff7a45', '#1f7a4d', '#e0b100', '#d64545', '#8b5cf6', '#0ea5e9', '#64748b']
</script>

## 交互演示

<div class="sr-demo">
  <SrColorPicker v-model="color" clearable />
  <span style="margin-left: 12px; font-size: 12px; color: var(--vp-c-text-3)">{{ color || '空' }}</span>
</div>

面板里三个可拖的区域：**饱和度方块**、**色相条**、**透明度条**。也可以直接在底部的输入框里敲 hex，透明度除了拖，还能在右侧的百分比框里直接输。

## 基础用法

```vue
<SrColorPicker v-model="color" />
```

```ts
const color = ref('#3e3edc')
```

## 输入格式很宽松，输出看你指定

**输入**认三种：

```ts
'#3e3edc'              // hex（3/6/8 位都行）
'rgb(62, 62, 220)'     // rgb / rgba
'hsl(240, 69%, 55%)'   // hsl / hsla
```

**输出**由 `format` 决定：

<div class="sr-demo is-block">
  <div style="display: flex; gap: 20px; flex-wrap: wrap">
    <div>
      <p style="margin: 0 0 6px; font-size: 11px; color: var(--vp-c-text-3)">hex（默认）</p>
      <SrColorPicker v-model="color" format="hex" />
    </div>
    <div>
      <p style="margin: 0 0 6px; font-size: 11px; color: var(--vp-c-text-3)">rgb</p>
      <SrColorPicker v-model="rgbColor" format="rgb" />
    </div>
    <div>
      <p style="margin: 0 0 6px; font-size: 11px; color: var(--vp-c-text-3)">hsl</p>
      <SrColorPicker v-model="color" format="hsl" />
    </div>
  </div>
</div>

这样设计是因为：**存储格式和历史数据五花八门，展示格式由当前页面决定**。切 `format` 不会丢值。

## 透明度

```vue
<SrColorPicker v-model="color" show-alpha />
```

<div class="sr-demo is-block">
  <SrColorPicker v-model="alphaColor" show-alpha format="rgb" />
</div>

打开后多一条透明度滑条与一个百分比输入框：拖到 37% 这种精确值很难控，直接敲数字更稳。滑条与色块下面铺的是**棋盘格**——它表示「这里是透明的」，不是灰色。

输出会带 alpha：`rgba(...)` 或 `#rrggbbaa`。不开 `show-alpha` 时始终输出不透明色。

## 预设色板

```vue
<SrColorPicker v-model="color" :presets="['#3e3edc', '#ff7a45', '#1f7a4d']" />
```

<div class="sr-demo is-block">
  <SrColorPicker v-model="color" :presets="presets" />
</div>

点一下直接选中，当前色会有一圈描边标记。预设值也走 `format` 输出。

## 尺寸

<div class="sr-demo is-block">
  <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end">
    <SrColorPicker v-model="color" size="sm" />
    <SrColorPicker v-model="color" />
    <SrColorPicker v-model="color" size="lg" />
  </div>
</div>

## 组合：主题色设置

<div class="sr-demo is-block">
  <div style="padding: 16px; border: 1px solid var(--sr-color-border-subtle); border-radius: 8px; max-width: 520px">
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px">
      <div>
        <p style="margin: 0; font-size: 13px; font-weight: 600">主题色</p>
        <p style="margin: 3px 0 0; font-size: 12px; color: var(--vp-c-text-3)">用于按钮、链接、选中态</p>
      </div>
      <SrColorPicker v-model="themeColor" :presets="presets.slice(0, 6)" />
    </div>
    <div style="height: 1px; margin: 14px 0; background: var(--sr-color-border-subtle)" />
    <div style="display: flex; align-items: center; gap: 16px">
      <span :style="{ background: themeColor, color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '13px' }">主要按钮</span>
      <span :style="{ color: themeColor, fontSize: '13px', textDecoration: 'underline' }">这是链接文字</span>
      <span :style="{ background: themeColor, width: '20px', height: '20px', borderRadius: '50%', display: 'inline-block' }" />
    </div>
  </div>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | 颜色值 |
| `format` | `'hex' \| 'rgb' \| 'hsl'` | `'hex'` | 输出格式 |
| `showAlpha` | `boolean` | `false` | 显示透明度控制（滑条 + 百分比输入） |
| `presets` | `string[]` | `[]` | 预设色板 |
| `clearable` | `boolean` | `false` | 可清空 |
| `disabled` | `boolean` | `false` | 禁用 |
| `placeholder` | `string` | `'请选择颜色'` | 占位文案 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 颜色变化（拖动过程中持续触发） |
| `change` | `value` | 拖动结束或输入完成 |
| `visible-change` | `visible` | 面板显隐 |

和 `SrSlider` 一样：**拖动过程用 `update:modelValue`，要发请求用 `change`**。

## 色彩工具函数

组件同时导出了转换函数，需要单独处理颜色时可以直接用：

```ts
import { parseColor, formatColor, toHex, toRgbString, toHslString, rgbToHsl, hslToRgb, isSameColor } from '@sunset-reverie/ui'

parseColor('#3e3edc')              // { r: 62, g: 62, b: 220, a: 1 }
parseColor('hsl(240, 69%, 55%)')   // 转成 rgb
formatColor(rgba, 'rgb')           // 'rgb(62, 62, 220)'
rgbToHsl({ r: 62, g: 62, b: 220, a: 1 })   // { h: 240, s: 69, l: 55, a: 1 }
isSameColor('#3e3edc', 'rgb(62, 62, 220)') // true（不同格式同一颜色）
```

## 注意事项

- **不认命名色**。`red`、`tomato` 这类解析不了，需要先让浏览器算成 `rgb()`。写进 `presets` 也是同样限制。
- **内部按 HSL 存**。拖动时用 hsl 计算才平滑，代价是「hex → hsl → hex」会有 ±1 的往返误差。所以点预设色时**直接用原值输出**，不走 hsl 往返。
- **`isSameColor` 有 ±1 容差**。正是为了吸收上面那点误差，严格相等会误判成两个颜色。
- **透明度只在 `showAlpha` 时输出**。不开时即使内部有 alpha 值，输出也是不透明的。
- 百分比输入框只接受 0–100 的整数，超出会夹到边界；清空输入不会立刻改值，失焦后回显当前透明度。
- **`update:modelValue` 触发频繁**，拖动时每次移动都发，副作用放 `change`。
