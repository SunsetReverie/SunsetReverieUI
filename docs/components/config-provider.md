# SrConfigProvider 全局配置

通过 `provide/inject` 给子树里的组件下发默认值，避免每个组件都重复传同样的 props。

```vue
<script setup lang="ts">
import { SrConfigProvider, SrForm, SrFormItem, SrInput } from '@sunset-reverie/ui'
</script>

<template>
  <SrConfigProvider size="sm">
    <SrForm :model="model">
      <SrFormItem prop="name" label="名称">
        <SrInput v-model="model.name" />
      </SrFormItem>
    </SrForm>
  </SrConfigProvider>
</template>
```

## 效果对比

上方是默认尺寸，下方包了一层 `size="sm"`——里面的组件全部变小，但代码里没有给任何一个组件传 `size`：

<div class="sr-demo is-column">
  <div style="display: flex; align-items: center; gap: 10px">
    <span class="sr-demo__label" style="margin: 0; min-width: 84px">默认（md）</span>
    <SrButton>按钮</SrButton>
    <SrInput placeholder="输入" style="width: 140px" />
  </div>

  <SrConfigProvider size="sm">
    <div style="display: flex; align-items: center; gap: 10px">
      <span class="sr-demo__label" style="margin: 0; min-width: 84px">size = sm</span>
      <SrButton>按钮</SrButton>
      <SrInput placeholder="输入" style="width: 140px" />
    </div>
  </SrConfigProvider>
</div>

## 尺寸下发

包一层 `size="sm"` 后，里面所有支持尺寸的组件（`SrInput`、`SrSelect`、`SrButton`、`SrTable` 等）都默认用小尺寸，不用逐个传：

```vue
<SrConfigProvider size="sm">
  <SrInput v-model="a" />
  <SrSelect v-model="b" :options="options" />
  <SrButton>提交</SrButton>
</SrConfigProvider>
```

子组件自己传 `size` 时以子组件的为准——内部配置只是兜底默认值。

## 弹层层级

`zIndex` 设置层级基数，Modal / Drawer / Dropdown 等浮层在此基础上叠加，避免和宿主页面的浮层打架：

```vue
<SrConfigProvider :z-index="3000">
  <SrModal v-model="open" title="弹窗">…</SrModal>
</SrConfigProvider>
```

## 嵌套

`SrConfigProvider` 可以嵌套，内层覆盖外层：

```vue
<SrConfigProvider size="md">
  <SrConfigProvider size="sm">
    <!-- 这里都是 sm -->
  </SrConfigProvider>
  <!-- 这里还是 md -->
</SrConfigProvider>
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `SrSize` | — | 子组件的默认尺寸；不传则沿用上层配置，最外层未配置时用 `md` |
| `zIndex` | `number` | — | 弹层层级基数，浮层在其之上叠加 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 需要共享配置的子树 |

## 注意事项

- **必须在组件树的上层**。`provide/inject` 只对后代生效，同级或父级拿不到。
- 它不渲染任何 DOM，只传递配置，不会影响布局。
- `size` 只是「默认值」，组件上显式传的 `size` 永远优先——所以渐进式接入时不用改已有代码。
- 弹层层级只在组件自己没传 `zIndex` 时生效。
