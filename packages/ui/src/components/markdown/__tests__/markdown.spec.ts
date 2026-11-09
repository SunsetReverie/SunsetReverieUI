import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import SrMarkdown from '../index'

import type { SrMarkdownExtension } from '../src/extensions'
import type { SrMarkdownEngine } from '../src/markdown'

/** 消息 API 的替身：测试里不该真的弹出全局消息 */
const { messageSuccess } = vi.hoisted(() => ({ messageSuccess: vi.fn() }))

vi.mock('../../message', () => ({ srMessage: { success: messageSuccess } }))

/** 同步引擎：把源码包成 h1 */
const syncEngine: SrMarkdownEngine = {
  render: (source) => `<h1>${source}</h1>`,
}

/**
 * 挂载
 * @param props 组件 props
 * @returns 包装器
 */
function mountMd(props: Record<string, unknown>) {
  return mount(SrMarkdown, { props })
}

describe('SrMarkdown', () => {
  it('engine="builtin" 用内置解析器', async () => {
    const wrapper = mountMd({ source: '# 标题', engine: 'builtin' })
    await nextTick()

    expect(wrapper.find('.sr-md__h').text()).toBe('标题')
    wrapper.unmount()
  })

  it('内置解析器渲染段落与强调', async () => {
    const wrapper = mountMd({ source: '**粗**文字', engine: 'builtin' })
    await nextTick()

    expect(wrapper.find('.sr-md__p').html()).toContain('<strong>粗</strong>')
    wrapper.unmount()
  })

  it('同步引擎直接在首次渲染出结果', () => {
    const wrapper = mountMd({ source: '内容', engine: syncEngine })

    // 没有 await：setup 阶段就同步跑完
    expect(wrapper.find('h1').text()).toBe('内容')
    wrapper.unmount()
  })

  it('异步引擎渲染后填入内容', async () => {
    const asyncEngine: SrMarkdownEngine = {
      render: async (source) => {
        await Promise.resolve()
        return `<p>${source}</p>`
      },
    }

    const wrapper = mountMd({ source: '异步', engine: asyncEngine })
    await flushPromises()

    expect(wrapper.find('p').text()).toBe('异步')
    expect(wrapper.find('.sr-md').classes()).not.toContain('is-pending')
    wrapper.unmount()
  })

  it('异步渲染期间标记 is-pending', async () => {
    const asyncEngine: SrMarkdownEngine = {
      render: () => new Promise((resolve) => setTimeout(() => resolve('<p>x</p>'), 20)),
    }

    const wrapper = mountMd({ source: 'a', engine: asyncEngine })
    await nextTick()

    expect(wrapper.find('.sr-md').classes()).toContain('is-pending')

    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(wrapper.find('.sr-md').classes()).not.toContain('is-pending')
    wrapper.unmount()
  })

  it('异步竞态时丢弃过期结果', async () => {
    let call = 0
    const slowEngine: SrMarkdownEngine = {
      render: () =>
        new Promise((resolve) => {
          call += 1
          // 第一次故意慢，第二次快
          setTimeout(() => resolve(`<p>第${call}次</p>`), call === 1 ? 60 : 10)
        }),
    }

    const wrapper = mountMd({ source: 'a', engine: slowEngine })
    await wrapper.setProps({ source: 'b' })
    await new Promise((resolve) => setTimeout(resolve, 100))

    // 先发的慢结果不能覆盖后发的快结果
    expect(wrapper.find('p').text()).toBe('第2次')
    wrapper.unmount()
  })

  it('不传引擎时原样展示源码并告警', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const wrapper = mountMd({ source: '# 未传引擎' })
    await nextTick()

    expect(wrapper.text()).toContain('# 未传引擎')
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
    wrapper.unmount()
  })

  it('引擎同步抛错时不炸整块内容', async () => {
    const badEngine: SrMarkdownEngine = {
      render: () => {
        throw new Error('boom')
      },
    }

    const wrapper = mountMd({ source: 'x', engine: badEngine })
    await nextTick()

    expect(wrapper.find('.sr-md').exists()).toBe(true)
    wrapper.unmount()
  })

  it('extensions 生效', async () => {
    const ext: SrMarkdownExtension = {
      name: 'badge',
      inline: /\{\{badge (.*?)\}\}/g,
      render: (match, ctx) => `<span class="badge">${ctx.escape(match[1] ?? '')}</span>`,
    }

    const wrapper = mountMd({ source: '{{badge 新}}', engine: 'builtin', extensions: [ext] })
    await nextTick()

    expect(wrapper.find('.badge').text()).toBe('新')
    wrapper.unmount()
  })

  it('sanitize 钩子能改写输出', async () => {
    const sanitize = vi.fn((html: string) => html.replace(/<script>/g, ''))

    const wrapper = mountMd({
      source: 'x',
      engine: { render: () => '<p><script>1</script>x</p>' },
      sanitize,
    })
    await nextTick()

    expect(sanitize).toHaveBeenCalled()
    expect(wrapper.html()).not.toContain('<script>')
    wrapper.unmount()
  })

  it('source 变化后重新渲染', async () => {
    const wrapper = mountMd({ source: 'A', engine: 'builtin' })
    await nextTick()
    expect(wrapper.text()).toBe('A')

    await wrapper.setProps({ source: 'B' })
    await nextTick()
    expect(wrapper.text()).toBe('B')
    wrapper.unmount()
  })

  it('默认是 vivid 模板', () => {
    const wrapper = mountMd({ source: 'a', engine: 'builtin' })
    expect(wrapper.classes()).toContain('sr-md--theme-vivid')
    wrapper.unmount()
  })

  it('四套模板生成对应类名', () => {
    for (const theme of ['plain', 'vivid', 'editorial', 'glass'] as const) {
      const wrapper = mountMd({ source: 'a', engine: 'builtin', theme })
      expect(wrapper.classes()).toContain(`sr-md--theme-${theme}`)
      wrapper.unmount()
    }
  })

  it('size 生成对应类名', async () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const wrapper = mountMd({ source: 'a', engine: 'builtin', size })
      await nextTick()
      expect(wrapper.classes()).toContain(`sr-md--${size}`)
      wrapper.unmount()
    }
  })

  it('代码块默认带行号与复制按钮', async () => {
    const wrapper = mountMd({ source: '```ts\nconst a = 1\n```', engine: 'builtin' })
    await nextTick()

    expect(wrapper.findAll('.sr-md__code-line')).toHaveLength(1)
    expect(wrapper.find('.sr-md__copy').exists()).toBe(true)
    wrapper.unmount()
  })

  it('codeLineNumbers=false 时不生成行号容器', async () => {
    const wrapper = mountMd({ source: '```ts\nconst a = 1\n```', engine: 'builtin', codeLineNumbers: false })
    await nextTick()

    expect(wrapper.find('.sr-md__code-line').exists()).toBe(false)
    wrapper.unmount()
  })

  it('复制成功后派发 copy 事件并按需弹消息', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    const onCopy = vi.fn()
    const wrapper = mountMd({
      source: '```ts\nconst a = 1\n```',
      engine: 'builtin',
      codeCopyNotify: true,
      onCopy,
    })
    await nextTick()

    await wrapper.find('.sr-md__copy').trigger('click')
    await flushPromises()

    // 复制内容不含行号，只有代码本身
    expect(writeText).toHaveBeenCalledWith('const a = 1')
    expect(onCopy).toHaveBeenCalledWith('const a = 1')
    expect(messageSuccess).toHaveBeenCalled()
    wrapper.unmount()
    Reflect.deleteProperty(navigator, 'clipboard')
  })
})
