# SrInput 输入框

支持单行与多行，前后缀、清空、密码切换、字数统计与校验态。

## 基础用法

```vue
<sr-input v-model="value" placeholder="请输入内容" />
```

## 前后缀

前后缀不参与输入，只用于单位、协议等固定文本或图标。

```vue
<sr-input v-model="url">
  <template #prefix><span>URL</span></template>
</sr-input>

<sr-input placeholder="搜索">
  <template #prefix><sr-icon name="lucide:search" /></template>
</sr-input>

<sr-input placeholder="0.00">
  <template #suffix><span>元</span></template>
</sr-input>
```

## 清空与密码

```vue
<sr-input v-model="value" clearable />
<sr-input v-model="password" type="password" show-password />
```

清空后会自动回焦；密码切换会保留光标位置。这两个按钮 `tabindex="-1"`，不打断键盘输入流。

## 字数统计与校验态

```vue
<sr-input v-model="text" :maxlength="20" show-count />
<sr-input v-model="email" status="error" />
```

校验态只改变边框与焦点环颜色，`status="error"` 时同时输出 `aria-invalid="true"`。错误文案与布局由 `SrFormItem` 负责（尚未实现）。

## 多行

```vue
<sr-input v-model="text" type="textarea" :rows="3" />
<sr-input v-model="text" type="textarea" autosize />
```

`autosize` 让高度随内容增长，省掉手动拖拽。

## 尺寸

```vue
<sr-input size="sm" />
<sr-input :size="{ xs: 'sm', md: 'lg' }" />
```

## API

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | `''` | 值，支持 v-model |
| `type` | `string` | `'text'` | `textarea` 走独立分支 |
| `size` | `SrSize \| 响应式` | 继承配置 | 尺寸档位 |
| `placeholder` | `string` | `''` | 占位文案 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
| `clearable` | `boolean` | `false` | 有值时显示清空按钮 |
| `showPassword` | `boolean` | `false` | 密码可见切换 |
| `maxlength` | `number` | — | 最大长度 |
| `showCount` | `boolean` | `false` | 显示字数统计 |
| `status` | `'default' \| 'error' \| 'warning' \| 'success'` | `'default'` | 校验态 |
| `rows` | `number` | `3` | textarea 行数 |
| `autosize` | `boolean` | `false` | textarea 高度自适应 |

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `string \| number` | v-model |
| `change` | `string \| number` | 值变化（中文输入法下等组合结束后才触发） |
| `clear` | — | 点击清空 |
| `enter` | `KeyboardEvent` | 单行输入框回车 |
| `focus` / `blur` | `FocusEvent` | 原生焦点事件 |

| 插槽 | 说明 |
| --- | --- |
| `prefix` | 输入框左侧内容 |
| `suffix` | 输入框右侧内容 |

## 关于 `$attrs`

`$attrs` 落到**内层原生 `<input>`**，不是外层 wrapper。这样 `autocomplete`、`inputmode`、`maxlength`、`data-*` 都能直接生效。`class` 与 `style` 仍作用于 wrapper。

## 样式接入

```ts
import '@sunset-reverie/ui/components/input/style.css'
```
