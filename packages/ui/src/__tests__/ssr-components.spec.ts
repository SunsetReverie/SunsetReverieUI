// @vitest-environment node
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h, type Component } from 'vue'

import {
  SrAvatar,
  SrBadge,
  SrBreadcrumb,
  SrButton,
  SrCard,
  SrCheckbox,
  SrCheckboxGroup,
  SrDrawer,
  SrDropdown,
  SrEmpty,
  SrForm,
  SrFormItem,
  SrIcon,
  SrInput,
  SrInputNumber,
  SrLoadMore,
  SrModal,
  SrPagination,
  SrPanel,
  SrRadio,
  SrRadioGroup,
  SrSelect,
  SrSpinner,
  SrSwitch,
  SrTable,
  SrTabs,
  SrTag,
  SrTooltip,
} from '..'

/**
 * 在无 DOM 环境下渲染组件，返回 HTML 字符串
 * @param component 组件
 * @param props 组件 props
 * @param slot 插槽内容
 * @returns 渲染结果
 */
async function render(
  component: Component,
  props: Record<string, unknown> = {},
  slot?: string,
): Promise<string> {
  return renderToString(
    createSSRApp({
      render: () => h(component as Component, props, slot ? { default: () => slot } : undefined),
    }),
  )
}

/**
 * 冒烟断言：服务端能渲染出非空结构且不抛错
 * @param component 组件
 * @param props 组件 props
 * @param slot 插槽内容
 */
async function expectRenderable(
  component: Component,
  props: Record<string, unknown> = {},
  slot?: string,
): Promise<void> {
  const html = await render(component, props, slot)
  expect(html.length).toBeGreaterThan(0)
}

/** 表格列 */
const columns = [{ key: 'name', title: '名称' }]

/** 表格数据 */
const data = [{ id: 1, name: '组件' }]

/** 选项卡 */
const tabItems = [
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B' },
]

/** 下拉项 */
const menuItems = [
  { key: 'x', label: 'X' },
  { key: 'y', label: 'Y', disabled: true },
]

/** 面包屑 */
const crumbs = [{ label: '首页', href: '/' }, { label: '组件' }]

describe('展示型组件的 SSR 渲染', () => {
  it('SrButton', async () => {
    await expectRenderable(SrButton, { variant: 'primary' }, '按钮')
  })

  it('SrIcon', async () => {
    await expectRenderable(SrIcon, { name: 'lucide:check' })
  })

  it('SrTag', async () => {
    await expectRenderable(SrTag, { type: 'success', closable: true }, '稳定')
  })

  it('SrBadge 数值与状态点两种形态', async () => {
    await expectRenderable(SrBadge, { value: 120 }, '消息')
    await expectRenderable(SrBadge, { status: 'processing', text: '部署中' })
  })

  it('SrAvatar 图片、文字与自动取色', async () => {
    await expectRenderable(SrAvatar, { alt: '林深' })
    await expectRenderable(SrAvatar, { src: '/a.png', alt: '周夏' })
    await expectRenderable(SrAvatar, { alt: '陈默', color: '#8b5cf6' })
  })

  it('SrCard', async () => {
    await expectRenderable(SrCard, { title: '标题', subtitle: '副标题' }, '正文')
  })

  it('SrPanel 折叠态', async () => {
    await expectRenderable(SrPanel, { title: '分区', collapsible: true }, '内容')
    await expectRenderable(SrPanel, { title: '分区', modelValue: false }, '内容')
  })

  it('SrEmpty', async () => {
    await expectRenderable(SrEmpty, { description: '暂无数据' })
    await expectRenderable(SrEmpty, { bordered: true, image: '/e.png' })
  })

  it('SrBreadcrumb 含禁用项', async () => {
    await expectRenderable(SrBreadcrumb, { items: crumbs, separatorIcon: 'lucide:chevron-right' })
  })

  it('SrSpinner', async () => {
    await expectRenderable(SrSpinner, { size: 'md' })
  })
})

describe('导航与数据组件的 SSR 渲染', () => {
  it('SrTabs 四种外观', async () => {
    for (const type of ['line', 'card', 'segment', 'pill'] as const) {
      await expectRenderable(SrTabs, { items: tabItems, modelValue: 'a', type })
    }
  })

  it('SrTabs 垂直方向', async () => {
    await expectRenderable(SrTabs, { items: tabItems, modelValue: 'a', direction: 'vertical' })
  })

  it('SrPagination', async () => {
    await expectRenderable(SrPagination, { total: 120, pageSize: 10, showJumper: true })
  })

  it('SrLoadMore 三种状态', async () => {
    for (const status of ['idle', 'loading', 'done'] as const) {
      await expectRenderable(SrLoadMore, { status })
    }
  })

  it('SrTable 基础与空态', async () => {
    await expectRenderable(SrTable, { columns, data })
    await expectRenderable(SrTable, { columns, data: [], emptyText: '空空如也' })
  })

  it('SrTable 分页与固定列', async () => {
    await expectRenderable(SrTable, {
      columns: [
        { key: 'name', title: '名称', width: 100, fixed: 'left' },
        { key: 'id', title: 'ID', width: 80 },
      ],
      data,
      pagination: { pageSize: 5 },
    })
  })
})

describe('表单组件的 SSR 渲染', () => {
  it('SrInput 与 SrInputNumber', async () => {
    await expectRenderable(SrInput, { modelValue: '文本', placeholder: '请输入' })
    await expectRenderable(SrInputNumber, { modelValue: 1 })
  })

  it('SrSelect 单选与多选', async () => {
    await expectRenderable(SrSelect, {
      modelValue: 'a',
      options: [{ value: 'a', label: 'A' }],
    })
    await expectRenderable(SrSelect, {
      modelValue: ['a'],
      multiple: true,
      options: [{ value: 'a', label: 'A' }],
    })
  })

  it('SrCheckbox 与 SrRadio', async () => {
    await expectRenderable(SrCheckbox, { modelValue: true }, '选中')
    await expectRenderable(SrRadio, { modelValue: 'a', value: 'a' }, '选项')
  })

  it('SrCheckboxGroup 与 SrRadioGroup', async () => {
    await expectRenderable(SrCheckboxGroup, { modelValue: ['a'] }, '分组')
    await expectRenderable(SrRadioGroup, { modelValue: 'a' }, '分组')
  })

  it('SrSwitch', async () => {
    await expectRenderable(SrSwitch, { modelValue: true })
  })

  it('SrForm 与 SrFormItem', async () => {
    await expectRenderable(SrForm, { model: {} }, '表单')
    await expectRenderable(SrFormItem, { label: '名称' }, '内容')
  })
})

describe('浮层组件在服务端不渲染到主文档流', () => {
  it('SrModal 关闭时不输出内容', async () => {
    const html = await render(SrModal, { modelValue: false, title: '弹窗' }, '内容')
    expect(html).not.toContain('内容')
  })

  it('SrDrawer 关闭时不输出内容', async () => {
    const html = await render(SrDrawer, { modelValue: false, title: '抽屉' }, '内容')
    expect(html).not.toContain('内容')
  })

  it('SrDrawer 圆角形态可渲染', async () => {
    const html = await render(SrDrawer, { modelValue: true, inset: true, title: '抽屉' }, '内容')
    expect(html.length).toBeGreaterThan(0)
  })

  it('SrDropdown 收起时不输出菜单', async () => {
    const html = await render(SrDropdown, { items: menuItems }, '触发')
    expect(html).toContain('触发')
    expect(html).not.toContain('sr-dropdown__panel')
  })

  it('SrTooltip 收起时不输出浮层', async () => {
    const html = await render(SrTooltip, { content: '提示' }, '触发')
    expect(html).not.toContain('sr-tooltip__content')
  })
})

describe('SSR 与客户端首帧的一致性风险点', () => {
  it('SrAvatar 自动取色是纯函数，两次渲染结果一致', async () => {
    const first = await render(SrAvatar, { alt: '林深' })
    const second = await render(SrAvatar, { alt: '林深' })
    expect(first).toBe(second)
  })

  it('SrTabs 未传 modelValue 时服务端不标记任何选中项', async () => {
    // 客户端在 onMounted 里才补默认项，服务端必须保持一致（无 is-active）
    const html = await render(SrTabs, { items: tabItems })
    expect(html).not.toContain('is-active')
  })

  it('SrPagination 页码计算与数据无关，输出稳定', async () => {
    const first = await render(SrPagination, { total: 100 })
    const second = await render(SrPagination, { total: 100 })
    expect(first).toBe(second)
  })
})
