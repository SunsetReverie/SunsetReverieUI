# SrLoading 加载中

转圈 + 遮罩 + 文案。用于「整块区域等待」，比 `SrSpinner` 多一层遮罩与提示。

<script setup>
import { ref } from 'vue'

const wrapping = ref(false)
const fullscreen = ref(false)
const delayed = ref(false)

function simulate(target, ms = 1200) {
  target.value = true
  setTimeout(() => { target.value = false }, ms)
}
</script>

## 交互演示

<div class="sr-demo is-block">
  <div style="width: 280px; border: 1px solid var(--vp-c-border); border-radius: 8px; overflow: hidden">
    <SrLoading :loading="wrapping" text="提交中…">
      <div style="padding: 16px">
        <p style="margin: 0; font-size: 13px; font-weight: 600">订单详情</p>
        <p style="margin: 6px 0 0; font-size: 12px; color: var(--vp-c-text-3)">这是一块会被遮住的内容。</p>
      </div>
    </SrLoading>
  </div>
  <div style="margin-top: 12px">
    <SrButton size="sm" variant="primary" @click="simulate(wrapping)">触发 1.2 秒</SrButton>
  </div>
</div>

## 三种形态

| 形态 | 用法 | 场景 |
| --- | --- | --- |
| 包裹式 | 传默认插槽 | 盖住一块已有内容 |
| 全屏 | `fullscreen` | 整页等待（提交、跳转） |
| 行内 | 不传插槽、不传 fullscreen | 只有转圈和文字 |

```vue
<!-- 包裹式 -->
<SrLoading :loading="saving" text="保存中…">
  <OrderForm />
</SrLoading>

<!-- 全屏 -->
<SrLoading :loading="submitting" fullscreen text="正在提交" />

<!-- 行内 -->
<SrLoading text="加载中" />
```

## 延迟显示（delay）

```vue
<SrLoading :loading="loading" :delay="400" text="加载中…" />
```

这是最实用的参数。接口 200ms 返回的话 loading 根本不会出现，避免页面闪一下。

- **延迟只作用于出现**：关闭时立即生效，不会让遮罩多留一会儿
- **忙碌期间再次触发**：以最后一次的 `loading` 为准

<div class="sr-demo is-block">
  <SrButton size="sm" variant="outline" @click="simulate(delayed, 200)">200ms 请求（不闪）</SrButton>
  <SrButton size="sm" variant="outline" @click="simulate(delayed, 1200)">1.2s 请求（会闪）</SrButton>
  <SrLoading :loading="delayed" :delay="400" text="延迟 400ms 出现" />
</div>

## 无遮罩

```vue
<SrLoading :loading="syncing" :mask="false" text="后台同步中" />
```

只剩转圈和文字，下面的内容仍可操作。适合「后台刷新」这类不阻塞的动作。

## 全屏

```vue
<SrLoading :loading="submitting" fullscreen />
```

打开时自动给 `body` 加 `overflow: hidden` 锁滚动，关闭或卸载时恢复。

<div class="sr-demo">
  <SrButton size="sm" variant="outline" @click="simulate(fullscreen)">全屏加载</SrButton>
  <SrLoading :loading="fullscreen" fullscreen text="正在保存…" />
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `loading` | `boolean` | `true` | 是否显示 |
| `text` | `string` | `''` | 提示文案 |
| `fullscreen` | `boolean` | `false` | 全屏模式 |
| `mask` | `boolean` | `true` | 显示遮罩 |
| `delay` | `number` | `0` | 延迟显示（毫秒） |
| `size` | `SrSize` | — | 转圈尺寸 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| `default` | 被遮住的内容 |
| `text` | 自定义提示区 |

## 和 Spinner 的分工

| | `SrSpinner` | `SrLoading` |
| --- | --- | --- |
| 内容 | 只有转圈 | 转圈 + 遮罩 + 文案 |
| 场景 | 按钮里、表格单元格、任何局部 | 整块区域或整页 |

按钮里塞 `SrLoading` 会有遮罩铺满按钮，视觉很怪——那种场景用 `SrSpinner`。

## 注意事项

- **遮罩只是视觉，不拦交互**。需要真正阻止点击就加 `pointer-events: none` 或禁用底层按钮。
- **`delay` 不累积**。连续切换 `loading` 会重置计时，不会叠加。
- **全屏模式有且只有一个**。同时开两个会让 `body.overflow` 的恢复逻辑互相覆盖。
- **包裹式需要父容器有定位**。遮罩用 `position: absolute`，父元素是 `static` 时也能工作，但如果父级有 `overflow: hidden` 会被裁。
