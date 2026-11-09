import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

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
    global: { stubs: { SrIcon: true } },
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
