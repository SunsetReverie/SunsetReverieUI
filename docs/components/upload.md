# SrUpload 上传

文件选择、拖拽、进度与预览。不内置请求库——上传逻辑通过 `httpRequest` 交给调用方，用什么 HTTP 客户端自己决定。

<script setup>
import { ref } from 'vue'
import { srToast } from '@sunset-reverie/ui'

const manualFiles = ref([])
const manualRef = ref(null)

/** 模拟上传：每 120ms 涨 10% */
function mockRequest(file, onProgress) {
  return new Promise((resolve) => {
    let percent = 0
    const timer = setInterval(() => {
      percent += 10
      onProgress(Math.min(percent, 100))
      if (percent >= 100) {
        clearInterval(timer)
        resolve(URL.createObjectURL(file))
      }
    }, 120)
  })
}

function submitManual() {
  const count = manualFiles.value.length
  srToast.success(count ? `模拟提交 ${count} 个文件` : '还没有文件')
}
</script>

```vue
<script setup lang="ts">
import { SrUpload, type SrUploadRequest } from '@sunset-reverie/ui'

const upload: SrUploadRequest = (file, onProgress) =>
  fetch('/api/upload', { method: 'POST', body: file })
    .then((res) => res.json())
    .then((data) => data.url)
</script>

<template>
  <SrUpload :http-request="upload" multiple tip="单个文件不超过 10MB" />
</template>
```

## 基础用法

<div class="sr-demo is-block">
  <SrUpload :http-request="mockRequest" multiple tip="单个文件不超过 10MB" />
</div>

拖拽时边框变实线、文案变成「松开即可上传」。上传中显示进度条，成功显示对勾，失败显示重试按钮。

## 数量与大数限制

<div class="sr-demo is-block">
  <SrUpload :http-request="mockRequest" multiple :max-count="3" tip="最多 3 个，达到后拖拽区置灰" />
</div>

`maxCount` 达到后拖拽区变灰并提示「最多 N 个文件」，继续拖入会派发 `exceed` 事件。

超过 `maxSize`（单位 MB）或 `accept` 不匹配的文件不会进入列表，直接派发 `error`——避免用户看到条目出现又立刻消失。

## 卡片模式

`list-type="card"` 把列表变成网格，图片生成缩略图，点击看大图：

<div class="sr-demo is-block">
  <SrUpload :http-request="mockRequest" multiple accept="image/*" list-type="card" tip="选几张图片试试" />
</div>

非图片类型没有缩略图，显示占位图标。

## 手动上传

`auto-upload="false"` 时组件只收集文件，提交时机由调用方决定：

<div class="sr-demo is-block">
  <SrUpload ref="manualRef" v-model:files="manualFiles" :auto-upload="false" multiple tip="选完后点下面的按钮提交" />
  <p style="margin: 10px 0 0">
    <SrButton size="sm" variant="primary" @click="submitManual">提交 {{ manualFiles.length }} 个文件</SrButton>
  </p>
</div>

配合实例方法 `submit(files)` 可以直接把外部拿到的文件塞进来：

```ts
uploadRef.value?.submit([file1, file2])
uploadRef.value?.clear()
```

## 自定义触发区

`#trigger` 插槽替换整个拖拽区：

```vue
<SrUpload :http-request="upload">
  <template #trigger>
    <div class="my-zone">自定义内容</div>
  </template>
</SrUpload>
```

## 上传函数

```ts
type SrUploadRequest = (
  file: File,
  onProgress: (percent: number) => void,
) => Promise<string | void>
```

- 返回字符串时，该地址会作为 `file.url`（图片缩略图会换成它）
- 抛错即视为失败，条目保留、显示错误文案与重试按钮
- 不传 `httpRequest` 时组件只收集文件，不会自动上传

> **不内置请求**：这个库零运行时依赖，用什么客户端由调用方决定。同时这也意味着进度回调由你负责调用 `onProgress`——`fetch` 没有原生上传进度，需要 `XMLHttpRequest` 或 `axios` 的 `onUploadProgress`。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `accept` | `string` | `''` | 接受的文件类型，写法同原生 input |
| `multiple` | `boolean` | `false` | 允许多选 |
| `maxCount` | `number` | `0` | 最多保留几个文件，0 表示不限 |
| `maxSize` | `number` | `0` | 单文件大小上限（MB），0 表示不限 |
| `listType` | `'list' \| 'card'` | `'list'` | 列表形态 |
| `draggable` | `boolean` | `true` | 允许拖拽上传 |
| `disabled` | `boolean` | `false` | 禁用 |
| `autoUpload` | `boolean` | `true` | 选择后立即调用 `httpRequest` |
| `showFileList` | `boolean` | `true` | 显示文件列表 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |
| `dragText` | `string` | `'点击或拖拽文件到这里'` | 拖拽区主文案 |
| `tip` | `string` | `''` | 拖拽区下方的提示 |
| `httpRequest` | `SrUploadRequest` | — | 自定义上传函数 |

### SrUploadFile

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `uid` | `string` | 唯一标识 |
| `name` | `string` | 文件名 |
| `size` | `number` | 字节数 |
| `type` | `string` | MIME 类型 |
| `url` | `string` | 预览地址 |
| `status` | `'ready' \| 'uploading' \| 'success' \| 'error'` | 状态 |
| `percent` | `number` | 进度 0-100 |
| `error` | `string` | 失败原因 |
| `raw` | `File` | 原始文件 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:files` | `files` | 列表变化，配合 `v-model:files` |
| `change` | `files, file?` | 新增或删除 |
| `success` | `file, url?` | 单个文件上传成功 |
| `error` | `file, reason` | 上传失败，或被校验拒绝 |
| `exceed` | `maxCount` | 超出数量上限 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `trigger` | 自定义拖拽区，覆盖默认样式 |

## 暴露的方法

| 方法 | 说明 |
| --- | --- |
| `submit(files?)` | 手动添加文件 |
| `clear()` | 清空列表并释放预览地址 |
| `files` | 当前文件列表 |

## 注意事项

- **需要客户端环境**。图片预览用 `URL.createObjectURL`，服务端渲染时不会执行；列表本身是空数组，所以 SSR 安全。
- 删除图片时会 `revokeObjectURL`，但**上传成功后换成的远程地址不会释放**——那是服务器的资源，不归这里管。
- `maxSize` 单位是 **MB**，可以传小数（`0.5` 就是 512KB）。
- `accept` 同时用于原生 input 与拖拽校验。拖拽时浏览器不会自动过滤，所以校验必须在组件里做。
- 组件不处理并发限制，多文件会同时发起全部请求。需要串行或限流时自己在外层包一层。
