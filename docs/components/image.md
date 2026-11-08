# SrImage 图片

带加载占位、失败兜底、懒加载与点击预览的图片。后台列表里的缩略图基本都要这三样。

<script setup>
import { ref } from 'vue'

function svgImage(from, to, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
    </linearGradient></defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <text x="200" y="158" font-family="system-ui,sans-serif" font-size="26" fill="#fff"
      text-anchor="middle">${label}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const demoImage = svgImage('#3e3edc', '#8b5cf6', '示例图')
const greenImage = svgImage('#1f7a4d', '#0ea5e9', '风景')
const orangeImage = svgImage('#ff7a45', '#e0b100', '产品图')

const lastEvent = ref('')
</script>


## 交互演示

<div class="sr-demo is-block">
  <div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap">
    <SrImage :src="demoImage" alt="示例图" :width="160" :height="120" radius="8" preview />
    <div style="flex: 1 1 220px">
      <p style="margin: 0; font-size: 12px; color: var(--vp-c-text-3)">点图打开大图，Esc 或点遮罩关闭</p>
      <p style="margin: 6px 0 0; font-size: 12px; color: var(--vp-c-text-3)">最近事件：{{ lastEvent || '—' }}</p>
    </div>
  </div>
</div>

## 基础用法

```vue
<SrImage src="/photo.jpg" alt="风景照" :width="160" :height="120" radius="8" />
```

`width` / `height` / `radius` **传数字按像素，传字符串原样输出**：

```vue
<SrImage :width="'100%'" :radius="'50%'" />
```

## 填充方式

<div class="sr-demo is-block">
  <div style="display: flex; gap: 14px; flex-wrap: wrap">
    <div v-for="f in ['cover', 'contain', 'fill', 'none', 'scale-down']" :key="f" style="text-align: center">
      <div style="padding: 4px; border: 1px dashed var(--vp-c-border)">
        <SrImage :src="orangeImage" :alt="f" :fit="f" :width="100" :height="80" />
      </div>
      <p style="margin: 6px 0 0; font-size: 11px; color: var(--vp-c-text-3)">{{ f }}</p>
    </div>
  </div>
</div>

| 值 | 行为 |
| --- | --- |
| `cover`（默认） | 保持比例铺满，超出部分裁掉 |
| `contain` | 保持比例完整显示，留白 |
| `fill` | 拉伸填满，会变形 |
| `none` | 原尺寸居中，可能被裁 |
| `scale-down` | 取 `none` 与 `contain` 中较小的 |

缩略图用 `cover`，证件照、图表用 `contain`。

## 失败兜底

<div class="sr-demo is-block">
  <div style="display: flex; gap: 16px; flex-wrap: wrap">
    <div style="text-align: center">
      <SrImage src="/not-exist.png" alt="坏图" :width="120" :height="90" radius="6" @error="lastEvent = 'error（无兜底）'" />
      <p style="margin: 6px 0 0; font-size: 11px; color: var(--vp-c-text-3)">无兜底</p>
    </div>
    <div style="text-align: center">
      <SrImage
        src="/not-exist.png"
        alt="坏图"
        :width="120"
        :height="90"
        radius="6"
        :fallback="demoImage"
        @error="lastEvent = 'error（有兜底）'"
      />
      <p style="margin: 6px 0 0; font-size: 11px; color: var(--vp-c-text-3)">有兜底图</p>
    </div>
  </div>
</div>

不传 `fallback` 时显示占位图标 + 替代文本；传了就换成兜底图。两种情况都会派发 `error`。

## 懒加载

```vue
<SrImage src="/photo.jpg" lazy />
```

用 `IntersectionObserver`，**进入视口前不请求图片**，还留了 100px 的预加载余量。

环境不支持 `IntersectionObserver` 时（老浏览器、部分测试环境）直接加载，不会把图卡死。

## 点击预览

用 `preview` 开启：点缩略图弹出遮罩层，显示原图。

```vue
<SrImage src="/photo.jpg" alt="产品主图" :width="160" :height="120" preview />
```

<div class="sr-demo is-block">
  <SrImage :src="demoImage" alt="点开看大图" :width="160" :height="120" radius="8" preview />
</div>

预览层里能做的事：

| 操作 | 效果 |
| --- | --- |
| 滚轮 | 缩放，范围 1× ~ 4× |
| 双击 | 在 1× 与 2.5× 之间切换 |
| 放大后拖动 | 平移查看局部 |
| Esc / 点遮罩 / 右上角按钮 | 关闭 |

几个细节：

- **加载完成后才能点开**，失败态不响应
- **右下角 hover 才出现放大图标**，列表里不会满屏图标
- **放大后顶部显示当前比例**（如 `270%`）
- **拖动过就不算点击**，松手不会误关闭
- 预览层 Teleport 到 `body`，不会被父级的 `overflow: hidden` 裁掉

## 预览层的实现取舍

大图按**原始尺寸**显示，最大不超过视口——不做放大到铺满。

因为放大原图只会让它变模糊，看不清细节；要看清细节靠的是滚轮缩放，而不是让它铺满屏幕。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | `''` | 图片地址 |
| `alt` | `string` | `''` | 替代文本，同时作为无障碍描述 |
| `width` | `string \| number` | — | 宽度 |
| `height` | `string \| number` | — | 高度 |
| `fit` | `'fill' \| 'contain' \| 'cover' \| 'none' \| 'scale-down'` | `'cover'` | 填充方式 |
| `radius` | `string \| number` | `0` | 圆角 |
| `lazy` | `boolean` | `false` | 懒加载 |
| `preview` | `boolean` | `false` | 点击放大 |
| `fallback` | `string` | `''` | 加载失败的兜底图 |
| `placeholder` | `string` | `''` | 加载中的占位图 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `load` | `Event` | 加载完成 |
| `error` | `Event` | 加载失败 |
| `preview-change` | `open` | 预览开关 |

## 注意事项

- **不传 `width` / `height` 时容器会塌**。图片未加载时没有任何尺寸参考，建议至少给一个，或用外层约束。
- **`alt` 不只是无障碍**。失败占位的提示文字直接用它，所以填「产品主图」比填「image1」有用。
- **`placeholder` 会被虚化**。传一张小图的模糊版本效果最好，直接传原图会先看到清晰的缩略图再跳变。
- **懒加载依赖视口检测**。元素在 `display: none` 的容器里永远不会触发，切回来时也不会自动补，需要用 `v-if` 控制挂载。
- **预览层不锁滚动**。长页面里打开大图后仍能滚背景，需要的话自己加 `body { overflow: hidden }`。
- **1× 时不能拖动**。拖拽只在放大后生效，1× 下按需求应该是「点遮罩关闭」。
- **缩放上限 4×**。再高就开始看到像素化，没有实际意义。
