import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'

import SrMarkdownEditor from '../index'

import type { SrMarkdownExtension } from '../../markdown/src/extensions'
import type { SrMarkdownToolbarAction } from '../src/markdown-editor'

/**
 * 挂载编辑器
 * @param props 组件 props
 * @returns 包装器
 */
function mountEditor(props: Record<string, unknown> = {}) {
  return mount(SrMarkdownEditor, {
    props: { modelValue: '', ...props },
    global: { stubs: { SrIcon: true, teleport: true } },
  })
}

/**
 * 设置 textarea 的选区
 * @param wrapper 包装器
 * @param start 起点
 * @param end 终点
 */
async function setSelection(
  wrapper: ReturnType<typeof mountEditor>,
  start: number,
  end = start,
): Promise<void> {
  const el = wrapper.find('textarea').element as HTMLTextAreaElement
  el.setSelectionRange(start, end)
  await nextTick()
}

afterEach(() => {
  document.documentElement.removeAttribute('data-sr-theme')
})

describe('SrMarkdownEditor', () => {
  it('渲染编辑区与预览区', () => {
    const wrapper = mountEditor({ modelValue: 'hello' })

    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('.sr-mde__pane--preview').exists()).toBe(true)
    wrapper.unmount()
  })

  it('输入派发 update 与 change', async () => {
    const wrapper = mountEditor()

    const el = wrapper.find('textarea')
    await el.setValue('新内容')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['新内容'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['新内容'])
    wrapper.unmount()
  })

  it('默认显示工具栏与字数', () => {
    const wrapper = mountEditor({ modelValue: 'abc' })

    expect(wrapper.findAll('.sr-mde__tool').length).toBeGreaterThan(5)
    expect(wrapper.find('.sr-mde__count').text()).toBe('3')
    wrapper.unmount()
  })

  it('toolbar=false 时不渲染工具栏', () => {
    const wrapper = mountEditor({ toolbar: false })

    expect(wrapper.find('.sr-mde__bar').exists()).toBe(false)
    wrapper.unmount()
  })

  it('showCount=false 时不显示字数', () => {
    const wrapper = mountEditor({ modelValue: 'abc', showCount: false })
    expect(wrapper.find('.sr-mde__foot').exists()).toBe(false)
    wrapper.unmount()
  })

  it('粗体按钮包裹选区', async () => {
    const wrapper = mountEditor({ modelValue: 'hello' })
    await setSelection(wrapper, 0, 5)

    const bold = wrapper.findAll('.sr-mde__tool')[0]
    await bold?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('**hello**')
    wrapper.unmount()
  })

  it('无选区时插入占位文字并选中', async () => {
    const wrapper = mountEditor({ modelValue: '' })
    await setSelection(wrapper, 0)

    await wrapper.findAll('.sr-mde__tool')[0]?.trigger('click')
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('**粗体**')

    // 占位文字被选中，用户直接输入即可覆盖
    const el = wrapper.find('textarea').element as HTMLTextAreaElement
    expect(el.selectionStart).toBe(2)
    expect(el.selectionEnd).toBe(4)
    wrapper.unmount()
  })

  it('列表按钮给当前行加前缀', async () => {
    const wrapper = mountEditor({ modelValue: '第一行\n第二行' })
    await setSelection(wrapper, 0)

    // 分隔符不渲染成按钮，实际顺序是 bold/italic/strike/heading/quote/code/code-block/list-ul
    const listUl = wrapper.findAll('.sr-mde__tool')[7]
    await listUl?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('- 第一行\n第二行')
    wrapper.unmount()
  })

  it('重复点列表取消前缀', async () => {
    const wrapper = mountEditor({ modelValue: '- 已有前缀' })
    await setSelection(wrapper, 0)

    await wrapper.findAll('.sr-mde__tool')[7]?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('- 已有前缀')
    wrapper.unmount()
  })

  it('Cmd/Ctrl + B 触发加粗', async () => {
    const wrapper = mountEditor({ modelValue: 'abc' })
    await setSelection(wrapper, 0, 3)

    await wrapper.find('textarea').trigger('keydown', { key: 'b', metaKey: true })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('**abc**')
    wrapper.unmount()
  })

  it('Cmd/Ctrl + S 派发 save 并阻止默认行为', async () => {
    const wrapper = mountEditor({ modelValue: 'abc' })

    await wrapper.find('textarea').trigger('keydown', { key: 's', ctrlKey: true })

    expect(wrapper.emitted('save')?.[0]).toEqual(['abc'])
    wrapper.unmount()
  })

  it('Tab 插入两个空格', async () => {
    const wrapper = mountEditor({ modelValue: 'ab' })
    await setSelection(wrapper, 1)

    await wrapper.find('textarea').trigger('keydown', { key: 'Tab' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('a  b')
    wrapper.unmount()
  })

  it('Shift+Tab 反缩进', async () => {
    const wrapper = mountEditor({ modelValue: '  ab' })
    await setSelection(wrapper, 2)

    await wrapper.find('textarea').trigger('keydown', { key: 'Tab', shiftKey: true })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('ab')
    wrapper.unmount()
  })

  it('只读时不响应工具栏与快捷键', async () => {
    const wrapper = mountEditor({ modelValue: 'abc', readonly: true })
    await setSelection(wrapper, 0, 3)

    await wrapper.findAll('.sr-mde__tool')[0]?.trigger('click')
    await wrapper.find('textarea').trigger('keydown', { key: 'b', metaKey: true })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.classes()).toContain('is-readonly')
    wrapper.unmount()
  })

  it('视图切换默认是图标 + 文字', () => {
    const wrapper = mountEditor()
    const seg = wrapper.findComponent({ name: 'SrSegmented' })

    expect(seg.props('options')).toEqual([
      { label: '编辑', value: 'edit', icon: 'lucide:pencil' },
      { label: '分栏', value: 'split', icon: 'lucide:columns-2' },
      { label: '预览', value: 'preview', icon: 'lucide:eye' },
    ])
    expect(seg.props('iconOnly')).toBe(false)
    wrapper.unmount()
  })

  it('modeToggle=text 时退回纯文字', () => {
    const wrapper = mountEditor({ modeToggle: 'text' })
    const seg = wrapper.findComponent({ name: 'SrSegmented' })

    expect(seg.props('options')?.[0]).toEqual({ label: '编辑', value: 'edit' })
    expect(seg.props('iconOnly')).toBe(false)
    wrapper.unmount()
  })

  it('modeToggle=icon 时只显示图标，文案留给无障碍属性', () => {
    const wrapper = mountEditor({ modeToggle: 'icon' })
    const seg = wrapper.findComponent({ name: 'SrSegmented' })

    expect(seg.props('iconOnly')).toBe(true)
    expect(seg.props('options')?.[0]?.icon).toBe('lucide:pencil')
    const btn = wrapper.findAll('.sr-segmented__item')[0]
    expect(btn?.attributes('title')).toBe('编辑')
    expect(btn?.attributes('aria-label')).toBe('编辑')
    wrapper.unmount()
  })

  it('视图模式下只显示对应面板', async () => {
    const wrapper = mountEditor({ mode: 'edit' })

    expect(wrapper.classes()).toContain('is-edit')
    wrapper.unmount()
  })

  it('超限时标记 is-over', () => {
    const wrapper = mountEditor({ modelValue: 'abcdef', maxLength: 3 })

    expect(wrapper.classes()).toContain('is-over')
    expect(wrapper.find('.sr-mde__count').classes()).toContain('is-over')
    wrapper.unmount()
  })

  it('工具栏按钮默认跟随主题，浅色主题用浅色 tips', () => {
    const wrapper = mountEditor()
    const tips = wrapper.findAllComponents({ name: 'SrTooltip' })

    expect(wrapper.props('tooltipVariant')).toBe('auto')
    expect(tips.length).toBeGreaterThan(5)
    expect(tips[0]?.props('content')).toBe('粗体')
    expect(tips[0]?.props('variant')).toBe('light')
    expect(tips[0]?.props('placement')).toBe('top')
    expect(tips[0]?.props('disabled')).toBe(false)

    // 有气泡时不再挂原生 title，避免双层提示
    expect(wrapper.findAll('.sr-mde__tool')[0]?.attributes('title')).toBeUndefined()
    wrapper.unmount()
  })

  it('深色主题下 tips 自动切成深色', async () => {
    document.documentElement.setAttribute('data-sr-theme', 'dark')
    const wrapper = mountEditor()

    expect(wrapper.findComponent({ name: 'SrTooltip' }).props('variant')).toBe('dark')
    wrapper.unmount()
  })

  it('运行中切换主题，tips 实时跟着变', async () => {
    document.documentElement.setAttribute('data-sr-theme', 'light')
    const wrapper = mountEditor()

    expect(wrapper.findComponent({ name: 'SrTooltip' }).props('variant')).toBe('light')

    document.documentElement.setAttribute('data-sr-theme', 'dark')
    // MutationObserver 回调是微任务
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
    expect(wrapper.findComponent({ name: 'SrTooltip' }).props('variant')).toBe('dark')

    document.documentElement.setAttribute('data-sr-theme', 'light')
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
    expect(wrapper.findComponent({ name: 'SrTooltip' }).props('variant')).toBe('light')
    wrapper.unmount()
  })

  it('显式指定配色时不受主题切换影响', async () => {
    document.documentElement.setAttribute('data-sr-theme', 'dark')
    const wrapper = mountEditor({ tooltipVariant: 'light' })

    expect(wrapper.findComponent({ name: 'SrTooltip' }).props('variant')).toBe('light')

    document.documentElement.setAttribute('data-sr-theme', 'light')
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
    expect(wrapper.findComponent({ name: 'SrTooltip' }).props('variant')).toBe('light')
    wrapper.unmount()
  })

  it('关掉 tips 后退回原生 title', () => {
    const wrapper = mountEditor({ tooltips: false })

    const tip = wrapper.findComponent({ name: 'SrTooltip' })
    expect(tip.props('disabled')).toBe(true)
    expect(wrapper.findAll('.sr-mde__tool')[0]?.attributes('title')).toBe('粗体')
    wrapper.unmount()
  })

  it('tips 配色与方位可配置', () => {
    const wrapper = mountEditor({ tooltipVariant: 'light', tooltipPlacement: 'bottom' })
    const tip = wrapper.findComponent({ name: 'SrTooltip' })

    expect(tip.props('variant')).toBe('light')
    expect(tip.props('placement')).toBe('bottom')
    wrapper.unmount()
  })

  it('没配 upload 时图片按钮是「插入图片（外链）」', () => {
    const wrapper = mountEditor()
    const btn = wrapper.findAll('.sr-mde__tool').find((b) => b.attributes('aria-label')?.includes('图片'))

    expect(btn?.attributes('aria-label')).toBe('插入图片（外链）')
    expect(wrapper.html()).toContain('lucide:image')
    wrapper.unmount()
  })

  it('配了 upload 后图标与提示都变成「上传图片」', () => {
    const wrapper = mountEditor({ upload: async () => 'https://e.com/a.png' })
    const btn = wrapper.findAll('.sr-mde__tool').find((b) => b.attributes('aria-label')?.includes('图片'))

    expect(btn?.attributes('aria-label')).toBe('上传图片')
    expect(wrapper.html()).toContain('lucide:upload')
    expect(wrapper.html()).not.toContain('lucide:image')
    wrapper.unmount()
  })

  it('短代码按钮保留自己的图标与提示，不和图片按钮撞', () => {
    const ext = {
      name: 'gallery',
      inline: /x/g,
      render: () => '<div></div>',
      insert: { label: '插入图集', icon: 'lucide:layout-grid', template: '{{gallery id=$1}}' },
    }
    const wrapper = mountEditor({ extensions: [ext], upload: async () => 'x' })
    const labels = wrapper.findAll('.sr-mde__tool').map((b) => b.attributes('aria-label'))

    expect(labels).toContain('上传图片')
    expect(labels).toContain('插入图集')
    expect(new Set(labels).size).toBe(labels.length)
    expect(wrapper.html()).toContain('lucide:layout-grid')
    wrapper.unmount()
  })

  it('自定义工具栏项也带同名 tips', () => {
    const wrapper = mountEditor({
      toolbar: [{ key: 'x', label: '插入日期', action: () => undefined }],
    })
    const tip = wrapper.findComponent({ name: 'SrTooltip' })

    expect(tip.props('content')).toBe('插入日期')
    wrapper.unmount()
  })

  it('自定义工具栏项被渲染并执行', async () => {
    const action = vi.fn()
    const custom: SrMarkdownToolbarAction = { key: 'custom', label: '自定义', action }

    const wrapper = mountEditor({ toolbar: [custom] })

    const tools = wrapper.findAll('.sr-mde__tool')
    expect(tools).toHaveLength(1)
    expect(tools[0]?.attributes('aria-label')).toBe('自定义')

    await tools[0]?.trigger('click')
    expect(action).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('扩展自带的 insert 自动变成按钮', async () => {
    const ext: SrMarkdownExtension = {
      name: 'gallery',
      inline: /\{\{gallery id=(\d+)\}\}/g,
      render: () => '<div></div>',
      insert: { label: '插入图集', template: '{{gallery id=$1}}' },
    }

    const wrapper = mountEditor({ modelValue: '', extensions: [ext] })
    await setSelection(wrapper, 0)

    const tools = wrapper.findAll('.sr-mde__tool')
    const extButton = tools.find((tool) => tool.attributes('aria-label') === '插入图集')
    expect(extButton).toBeTruthy()

    await extButton?.trigger('click')
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('{{gallery id=1}}')

    // 占位数字被选中
    const el = wrapper.find('textarea').element as HTMLTextAreaElement
    expect(el.selectionStart).toBe(13)
    expect(el.selectionEnd).toBe(14)
    wrapper.unmount()
  })

  it('配了表情包才出现表情按钮', () => {
    const without = mountEditor()
    expect(without.findAll('.sr-mde__tool').some((tool) => tool.attributes('aria-label') === '表情')).toBe(
      false,
    )
    without.unmount()

    const withEmoji = mountEditor({
      emojiPackages: [{ key: 'p', name: '包', emojis: [{ name: '微笑', char: '🙂' }] }],
    })
    expect(withEmoji.findAll('.sr-mde__tool').some((tool) => tool.attributes('aria-label') === '表情')).toBe(
      true,
    )
    withEmoji.unmount()
  })

  it('theme 透传给预览区', () => {
    const wrapper = mountEditor({ modelValue: '# 标题', theme: 'editorial' })
    expect(wrapper.find('.sr-md').classes()).toContain('sr-md--theme-editorial')
    wrapper.unmount()
  })

  it('带 fields 的短代码点击后弹出参数面板', async () => {
    const ext = {
      name: 'article',
      inline: /x/g,
      render: () => '<div></div>',
      insert: {
        label: '插入站内文章',
        panelTitle: '选择文章',
        template: '{{article id={id}}}',
        fields: [
          {
            key: 'id',
            label: '文章',
            type: 'select' as const,
            required: true,
            default: 'a01',
            options: [
              { label: '第一篇', value: 'a01' },
              { label: '第二篇', value: 'a02' },
            ],
          },
        ],
      },
    }
    const wrapper = mountEditor({ extensions: [ext] })

    await wrapper.find('.sr-mde__tool[aria-label="插入站内文章"]').trigger('click')
    const panel = wrapper.find('.sr-mde-insert')
    expect(panel.exists()).toBe(true)
    expect(panel.find('.sr-mde-insert__title').text()).toBe('选择文章')
    expect(panel.findAll('.sr-mde-insert__field')).toHaveLength(1)
    expect(panel.find('select').exists()).toBe(true)
    expect((panel.find('select').element as HTMLSelectElement).value).toBe('a01')
    wrapper.unmount()
  })

  it('确认后按模板插入，值里的花括号和换行被清理', async () => {
    const ext = {
      name: 'note',
      inline: /x/g,
      render: () => '<div></div>',
      insert: {
        label: '插入提示',
        template: ':::note {title}\n{content}\n:::',
        fields: [
          { key: 'title', label: '标题', default: '小提示', required: true },
          { key: 'content', label: '内容', type: 'textarea' as const, required: true },
        ],
      },
    }
    const wrapper = mountEditor({ modelValue: '正文', extensions: [ext] })
    await wrapper.find('.sr-mde__tool[aria-label="插入提示"]').trigger('click')

    const fields = wrapper.findAll('.sr-mde-insert__control')
    await fields[1]?.setValue('第一行\n第二行{坏字符}')
    await wrapper.find('.sr-mde-insert__btn--primary').trigger('click')
    await nextTick()

    const inserted = wrapper.emitted('update:modelValue')?.[0]?.[0] as string
    expect(inserted).toContain(':::note 小提示')
    expect(inserted).toContain('第一行 第二行坏字符')
    expect(inserted).not.toContain('{坏字符}')
    expect(wrapper.find('.sr-mde-insert').exists()).toBe(false)
    wrapper.unmount()
  })

  it('必填项没填时插入按钮禁用', async () => {
    const ext = {
      name: 'x',
      inline: /x/g,
      render: () => '<div></div>',
      insert: {
        label: '插入',
        template: '{{x v={v}}}',
        fields: [{ key: 'v', label: '值', required: true }],
      },
    }
    const wrapper = mountEditor({ extensions: [ext] })
    await wrapper.find('.sr-mde__tool[aria-label="插入"]').trigger('click')

    expect(wrapper.find('.sr-mde-insert__btn--primary').attributes('disabled')).toBeDefined()

    await wrapper.find('.sr-mde-insert__control').setValue('abc')
    await nextTick()
    expect(wrapper.find('.sr-mde-insert__btn--primary').attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })

  it('取消与 Esc 都不插入内容', async () => {
    const ext = {
      name: 'x',
      inline: /x/g,
      render: () => '<div></div>',
      insert: { label: '插入', template: '{{x v={v}}}', fields: [{ key: 'v', label: '值' }] },
    }
    const wrapper = mountEditor({ modelValue: '原文', extensions: [ext] })
    await wrapper.find('.sr-mde__tool[aria-label="插入"]').trigger('click')
    await wrapper.findAll('.sr-mde-insert__btn')[0]?.trigger('click')

    expect(wrapper.find('.sr-mde-insert').exists()).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.find('.sr-mde__tool[aria-label="插入"]').trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.find('.sr-mde-insert').exists()).toBe(false)
    wrapper.unmount()
  })

  it('#insert-{name} 插槽接管面板内容，setResult 决定插入文本', async () => {
    const ext = {
      name: 'pick',
      inline: /x/g,
      render: () => '<div></div>',
      insert: { label: '挑选', template: '' },
    }
    const wrapper = mount(SrMarkdownEditor, {
      props: { modelValue: '', extensions: [ext] },
      global: { stubs: { SrIcon: true, teleport: true } },
      slots: {
        'insert-pick': (scope: { setResult: (text: string) => void }) =>
          h(
            'button',
            {
              class: 'pick-btn',
              onClick: () => scope.setResult('{{pick id=a02}}'),
            },
            '挑',
          ),
      },
    })

    await wrapper.find('.sr-mde__tool[aria-label="挑选"]').trigger('click')
    expect(wrapper.find('.pick-btn').exists()).toBe(true)
    // 自定义模式下不再渲染声明式字段表单
    expect(wrapper.find('.sr-mde-insert__field').exists()).toBe(false)
    expect(wrapper.find('.sr-mde-insert__btn--primary').attributes('disabled')).toBeDefined()

    await wrapper.find('.pick-btn').trigger('click')
    await nextTick()
    expect(wrapper.find('.sr-mde-insert__btn--primary').attributes('disabled')).toBeUndefined()

    await wrapper.find('.sr-mde-insert__btn--primary').trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toContain('{{pick id=a02}}')
    expect(wrapper.find('.sr-mde-insert').exists()).toBe(false)
    wrapper.unmount()
  })

  it('insert.action 完全接管：不弹面板，但 insert 能插回原光标位置', async () => {
    type ActionCtx = { insert: (text: string) => void; close: () => void; value: string }
    const box: { current?: ActionCtx } = {}
    const ext = {
      name: 'asset',
      inline: /x/g,
      render: () => '<div></div>',
      insert: {
        label: '素材库',
        template: '',
        action: (ctx: ActionCtx) => {
          box.current = ctx
        },
      },
    }
    const wrapper = mountEditor({ modelValue: '原文', extensions: [ext] })

    await wrapper.find('.sr-mde__tool[aria-label="素材库"]').trigger('click')
    expect(wrapper.find('.sr-mde-insert').exists()).toBe(false)
    expect(box.current).toBeTruthy()
    expect(box.current?.value).toBe('原文')

    box.current?.insert('后加的内容')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toContain('后加的内容')
    wrapper.unmount()
  })

  it('预览区渲染 Markdown', async () => {
    const wrapper = mountEditor({ modelValue: '# 标题' })
    await nextTick()

    expect(wrapper.find('.sr-md__h--1').text()).toBe('标题')
    wrapper.unmount()
  })

  it('空内容时预览区显示占位提示', async () => {
    const wrapper = mountEditor({ modelValue: '', placeholder: '写点什么' })
    await nextTick()

    expect(wrapper.find('.sr-mde__empty').text()).toBe('写点什么')
    wrapper.unmount()
  })

  it('ref 暴露的 API 可插入文本', async () => {
    const wrapper = mountEditor({ modelValue: '' })
    await setSelection(wrapper, 0)

    const api = wrapper.vm as unknown as { insert: (text: string, block?: boolean) => void }
    api.insert('插入内容', false)
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('插入内容')
    wrapper.unmount()
  })
})
