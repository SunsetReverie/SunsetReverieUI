# SrTextarea 文本域

自适应高度、字数统计、背景图与背景文字，以及**内联表情渲染**——为评论框这类场景准备的多行输入。

<script setup>
import { DEFAULT_EMOJI_PACKAGES, SrButton } from '@sunset-reverie/ui'
import { computed, ref } from 'vue'

const basic = ref('')
const withBg = ref('')
const rich = ref('这个输入框能内联渲染表情，[微笑] 会变成表情本身。')
const submitted = ref('')
const bgMode = ref('text')

const bgOptions = [
  { label: '无背景', value: 'none' },
  { label: '背景图', value: 'image' },
  { label: '背景文字', value: 'text' },
]

const dotPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='3' cy='3' r='1.4' fill='%237c3aed' fill-opacity='0.18'/%3E%3C/svg%3E\")"

const backgroundImage = computed(() => (bgMode.value === 'image' ? dotPattern : ''))
const backgroundText = computed(() => (bgMode.value === 'text' ? '说点什么' : ''))

const bgPosition = ref('center')
const bgTextSize = ref(40)

const bgPositionOptions = [
  { label: '居中', value: 'center' },
  { label: '左上', value: 'top-left' },
  { label: '右上', value: 'top-right' },
  { label: '左下', value: 'bottom-left' },
  { label: '右下', value: 'bottom-right' },
]
const emojiPackages = DEFAULT_EMOJI_PACKAGES
const quickEmojis = DEFAULT_EMOJI_PACKAGES[0]?.emojis.slice(0, 10) ?? []

const richRef = ref(null)

function pickEmoji(item) {
  richRef.value?.insertEmoji(item)
}

function onSubmit(value) {
  submitted.value = value
}
</script>

## 交互演示

<div class="sr-demo">
  <SrTextarea v-model="basic" placeholder="写点什么……" :maxlength="200" show-count />
</div>

## 基础用法

```vue
<SrTextarea v-model="content" placeholder="写点什么……" />
```

`v-model` 收发的是**纯文本**；传了 `emoji-packages` 之后收发的是**标记文本**（`你好[微笑]`），两种模式完全一致，换模式不用改上层代码。

## 自适应高度

```vue
<!-- 默认开启，长到 maxRows 行后转为内部滚动 -->
<SrTextarea v-model="content" :rows="3" :max-rows="8" />

<!-- 关掉，高度固定为 rows 行 -->
<SrTextarea v-model="content" :rows="4" :autosize="false" />
```

高度由内容实测得出，不靠字符数估算——中英文混排、粘贴多行文本都能贴合。

## 字数统计

```vue
<SrTextarea v-model="content" :maxlength="200" show-count />
```

字数按**用户看到的字符**算：一个表情标记（`[微笑]`）只算 1 个字，而不是 4 个。

没有 `footer` 插槽时，字数浮在输入区右下角，**不额外占一行**；用了工具栏则同排显示在最右。两种情况编辑区都会自动留出位置，不会压住最后一行文字。

超限只变红、不阻止输入——硬截断会让用户丢失已写内容。

## 背景图与背景文字

<div class="sr-demo">
  <div style="display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap;">
    <SrSegmented v-model="bgMode" :options="bgOptions" size="sm" />
  </div>
  <div style="display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; align-items: center;">
    <SrSegmented v-model="bgPosition" :options="bgPositionOptions" size="sm" />
    <SrInputNumber v-model="bgTextSize" :min="12" :max="120" :step="4" size="sm" style="width: 130px" />
    <span style="color: var(--sr-color-text-tertiary); font-size: 12px">字号 px</span>
  </div>
  <SrTextarea
    v-model="withBg"
    :rows="4"
    :background-image="backgroundImage"
    :background-text="backgroundText"
    :background-position="bgPosition"
    :background-text-size="bgTextSize"
    placeholder="背景只是装饰，内容照常输入"
  />
</div>

```vue
<!-- 水印文字：右下角、40px -->
<SrTextarea
  v-model="content"
  background-text="说点什么"
  background-position="bottom-right"
  :background-text-size="40"
/>

<!-- 背景图：url() / 渐变函数 / 裸地址都可以 -->
<SrTextarea v-model="content" background-image="url(/assets/paper.png)" background-size="contain" />
<SrTextarea v-model="content" background-image="linear-gradient(135deg, #eef, #fee)" />
```

`backgroundPosition` 是九宫格，**图片与文字共用**：

| 取值 | 位置 |
| --- | --- |
| `top-left` / `top` / `top-right` | 上排左中右 |
| `left` / `center` / `right` | 中排左中右 |
| `bottom-left` / `bottom` / `bottom-right` | 下排左中右 |

尺寸分两个口子：`backgroundTextSize`（水印字号，px，不传则跟随组件字号）与 `backgroundSize`（背景图尺寸，默认 `cover`，也接受 `120px 80px` 这类 CSS 值）。

背景是**独立的一层**，铺在内容下方：

- `pointer-events: none`，不抢焦点、不挡点击
- 不参与选中，全选复制不会带出背景文字
- 裸地址会先校验协议（只放行 `http(s)`、`data:image`、相对路径）再包成 `url()`

## 内联表情

<div class="sr-demo">
  <SrTextarea
    ref="richRef"
    v-model="rich"
    :emoji-packages="emojiPackages"
    :rows="4"
    :maxlength="500"
    show-count
  >
    <template #footer="{ submit }">
      <button
        v-for="item in quickEmojis"
        :key="item.name"
        type="button"
        style="width: 26px; height: 26px; border: 0; background: none; font-size: 16px; cursor: pointer"
        :title="item.name"
        @click="pickEmoji(item)"
      >
        {{ item.char }}
      </button>
      <SrButton size="sm" @click="submit()">发表</SrButton>
    </template>
  </SrTextarea>
</div>

```vue
<SrTextarea ref="editor" v-model="content" :emoji-packages="packages">
  <template #footer="{ submit }">
    <button @click="editor?.insertEmoji(item)">😀</button>
    <SrButton size="sm" @click="submit()">发表</SrButton>
  </template>
</SrTextarea>
```

传了 `emoji-packages` 才会进**富文本模式**：输入区从原生 `textarea` 换成 `contenteditable`，表情按 `char` / `url` 内联渲染成字符或图片。

关键在于**进出都是标记文本**：

| 环节 | 内容 |
| --- | --- |
| `v-model` 收到的 | `你好[微笑]` |
| 编辑区里看到的 | `你好` + 表情本身 |
| 存库 / 传后端 | 还是 `你好[微笑]` |

表情节点用 `data-mark` 记住自己的标记，序列化时直接取回——所以**换一整套表情包不用改历史内容**，渲染时重新查表即可。

::: warning 只在浏览器端
`contenteditable` 的读写依赖 DOM，富文本模式没有服务端渲染产物。SSR 场景请让它在 `onMounted` 之后再启用（传空的 `emoji-packages` 走纯文本模式即可）。
:::

## 回车提交

<div class="sr-demo">
  <SrTextarea
    v-model="basic"
    :rows="2"
    submit-on-enter
    placeholder="Enter 提交，Shift + Enter 换行"
    @submit="onSubmit"
  />
  <p style="margin: 8px 0 0; color: var(--sr-color-text-tertiary); font-size: 12.5px">
    最近一次提交：{{ submitted || '（还没提交）' }}
  </p>
</div>

```vue
<SrTextarea v-model="content" submit-on-enter @submit="publish" />
```

输入法组合中的回车不会误触发——中文候选词确认是回车，若不做判断会直接把半截话发出去。

## API

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | 内容，支持 v-model |
| `placeholder` | `string` | `''` | 占位文案 |
| `rows` | `number` | `3` | 初始行数 |
| `autosize` | `boolean` | `true` | 高度跟随内容 |
| `maxRows` | `number` | `0` | 自动增高上限，0 不限 |
| `maxlength` | `number` | — | 最大长度 |
| `showCount` | `boolean` | `false` | 显示字数统计 |
| `size` | `SrSize` | `'md'` | 尺寸档位 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
| `status` | `'default' \| 'error' \| 'warning' \| 'success'` | `'default'` | 校验态 |
| `resize` | `'none' \| 'vertical'` | `'none'` | 允许用户纵向拖拽 |
| `backgroundImage` | `string` | `''` | 背景图，`url()` / 渐变 / 裸地址 |
| `backgroundPosition` | `'top-left' \| 'top' \| 'top-right' \| 'left' \| 'center' \| 'right' \| 'bottom-left' \| 'bottom' \| 'bottom-right'` | `'center'` | 背景九宫格，图片与文字共用 |
| `backgroundSize` | `string` | `'cover'` | 背景图尺寸，也接受 CSS 值 |
| `backgroundText` | `string` | `''` | 背景水印文字 |
| `backgroundTextSize` | `number` | `0` | 水印字号（px），0 跟随组件字号 |
| `backgroundTextOpacity` | `number` | `0.06` | 水印不透明度 |
| `emojiPackages` | `SrEmojiPackage[]` | `[]` | 表情包，传了才进富文本模式 |
| `submitOnEnter` | `boolean` | `false` | Enter 提交，Shift+Enter 换行 |

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `string` | v-model |
| `change` | `string` | 内容变化（与 update 同时派发） |
| `focus` / `blur` | `FocusEvent` | 原生焦点事件 |
| `submit` | `string` | `submitOnEnter` 下按 Enter，或调用 `submit()` |

| 插槽 | 作用域 | 说明 |
| --- | --- | --- |
| `footer` | `count, maxlength, submit` | 底部工具栏，常用于放表情按钮与提交按钮 |

| 暴露方法 | 说明 |
| --- | --- |
| `focus()` / `blur()` | 聚焦 / 失焦，光标落到末尾 |
| `clear()` | 清空内容 |
| `insertEmoji(item)` | 在光标处插入表情（仅富文本模式） |
| `insertText(text)` | 在光标处插入纯文本 |
| `submit()` | 主动派发 `submit` 事件 |
| `getValue()` | 读取当前值 |

## 关于 `$attrs`

`$attrs` 落到**内层编辑元素**（`textarea` 或 `contenteditable` 容器），不是外层外壳。这样 `aria-*`、`data-*`、`autocomplete` 都能直接生效。

## 样式接入

```ts
import '@sunset-reverie/ui/components/textarea/style.css'
```

## 注意事项

- **放进 `SrFormItem` 后会自动参与校验**：内容变化时通知表单，触发 `change` 类型规则；表单级 `disabled` 也会通过上下文下发。

- **两种模式的分界是 `emojiPackages`**。不传走原生 `textarea`，行为与普通输入框完全一致；传了才切 `contenteditable`。判断依据是「有没有表情要渲染」，不是「要不要富文本」。
- **富文本模式只收纯文本粘贴**。评论框里粘进带样式的网页内容会带一堆颜色和字体，这里统一转成纯文本。
- **不要在 `resize: vertical` 和 `autosize` 同时开启时追求精确高度**：一个由用户拖拽、一个由内容测量，两者会互相覆盖，`maxRows` 生效时尤其明显。
- **`insertEmoji` 在纯文本模式下是空操作**。没有地方承载内联图片，硬塞 `[名称]` 会让用户以为没生效。
- **字数与 `maxlength` 都是软限制**，不做硬截断。
