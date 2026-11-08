# SrDivider 分割线

分区内容的细线。比标题层级更轻，适合同一张卡片里切分字段区块。

## 交互演示

<div class="sr-demo is-block">
  <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2)">上方内容</p>
  <SrDivider />
  <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2)">下方内容</p>
</div>

## 基础用法

```vue
<SrDivider />
```

默认水平、占满整行、上下各 16px 外边距。

## 带文字

<div class="sr-demo is-block">
  <SrDivider>居中</SrDivider>
  <SrDivider content-position="left">左对齐</SrDivider>
  <SrDivider content-position="right">右对齐</SrDivider>
</div>

```vue
<SrDivider content-position="left">基本信息</SrDivider>
```

线由 `::before` / `::after` 两段拼成，文字压在中间。文字自带底色，所以不会出现线穿过文字的情况。

`content-position` 只在水平方向生效，垂直方向会忽略。

## 虚线

<div class="sr-demo is-block">
  <SrDivider dashed />
  <SrDivider dashed>虚线段落</SrDivider>
</div>

虚线用 `repeating-linear-gradient` 画：4px 实 + 4px 空。带文字时两段都是虚线。

## 垂直分割

<div class="sr-demo">
  <SrButton size="sm" variant="text">编辑</SrButton>
  <SrDivider direction="vertical" />
  <SrButton size="sm" variant="text">复制</SrButton>
  <SrDivider direction="vertical" />
  <SrButton size="sm" variant="text">删除</SrButton>
</div>

```vue
<div style="display: flex; align-items: center">
  <a>编辑</a>
  <SrDivider direction="vertical" />
  <a>删除</a>
</div>
```

用 `align-self: stretch` 撑满父容器高度，所以**父容器必须有确定高度**，否则线会塌成 0 高。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 方向 |
| `dashed` | `boolean` | `false` | 虚线 |
| `contentPosition` | `'left' \| 'center' \| 'right'` | `'center'` | 文字位置 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| `default` | 分割线中间的文字 |

## 注意事项

- **垂直方向需要父容器有高度**。`align-self: stretch` 在高度不确定的容器里会塌掉。
- **垂直方向不显示文字**。1px 宽的容器放不下内容，`contentPosition` 也会被忽略。
- **自带上下外边距 16px**。需要更紧凑时覆盖 `.sr-divider` 的 `margin`，不要在外层再叠 margin，否则间距会翻倍。
- **`role="separator"` 与 `aria-orientation` 已带**，读屏软件能正确识别分隔。
