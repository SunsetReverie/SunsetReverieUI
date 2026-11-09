import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import SrCodeBlock from '../index'

const { srCopyText } = vi.hoisted(() => ({ srCopyText: vi.fn() }))

vi.mock('../../../utils/clipboard', () => ({ srCopyText }))

const noopStub = { global: { stubs: { SrIcon: true } } }

describe('SrCodeBlock', () => {
  it('渲染代码内容', () => {
    const wrapper = mount(SrCodeBlock, { props: { code: 'const a = 1' }, ...noopStub })

    expect(wrapper.find('.sr-code__code').text()).toBe('const a = 1')
    wrapper.unmount()
  })

  it('不传高亮时按纯文本转义', () => {
    const wrapper = mount(SrCodeBlock, { props: { code: '<script>alert(1)</script>' }, ...noopStub })

    const html = wrapper.find('.sr-code__code').html()
    // 转义成实体，而不是真的插入 script 标签
    expect(html).toContain('&lt;script&gt;')
    expect(wrapper.find('.sr-code__code').element.querySelector('script')).toBeNull()
    wrapper.unmount()
  })

  it('调用传入的高亮函数', () => {
    const highlight = vi.fn((code: string) => `<span class="kw">${code}</span>`)
    const wrapper = mount(SrCodeBlock, {
      props: { code: 'const', highlight, lang: 'ts' },
      ...noopStub,
    })

    expect(highlight).toHaveBeenCalledWith('const', 'ts')
    expect(wrapper.find('.kw').text()).toBe('const')
    wrapper.unmount()
  })

  it('高亮函数抛错时退回纯文本', () => {
    const highlight = vi.fn(() => {
      throw new Error('boom')
    })
    const wrapper = mount(SrCodeBlock, { props: { code: 'x = 1', highlight }, ...noopStub })

    expect(wrapper.find('.sr-code__code').text()).toBe('x = 1')
    wrapper.unmount()
  })

  it('lineNumbers 渲染正确的行数', () => {
    const wrapper = mount(SrCodeBlock, {
      props: { code: 'a\nb\nc', lineNumbers: true },
      ...noopStub,
    })

    const gutter = wrapper.find('.sr-code__gutter')
    expect(gutter.exists()).toBe(true)
    expect(gutter.text().split('\n')).toEqual(['1', '2', '3'])
    wrapper.unmount()
  })

  it('行号是独立一列，不混进代码', () => {
    const wrapper = mount(SrCodeBlock, {
      props: { code: 'a\nb', lineNumbers: true },
      ...noopStub,
    })

    expect(wrapper.find('.sr-code__code').text()).toBe('a\nb')
    expect(wrapper.find('.sr-code__gutter').text()).toBe('1\n2')
    wrapper.unmount()
  })

  it('默认不显示行号', () => {
    const wrapper = mount(SrCodeBlock, { props: { code: 'a' }, ...noopStub })
    expect(wrapper.find('.sr-code__gutter').exists()).toBe(false)
    wrapper.unmount()
  })

  it('折行时隐藏行号', () => {
    const wrapper = mount(SrCodeBlock, {
      props: { code: 'a\nb', lineNumbers: true, wrap: true },
      ...noopStub,
    })

    expect(wrapper.classes()).toContain('is-wrap')
    expect(wrapper.find('.sr-code__gutter').exists()).toBe(false)
    wrapper.unmount()
  })

  it('顶栏优先显示 title，其次语言', () => {
    const withTitle = mount(SrCodeBlock, {
      props: { code: 'a', title: 'main.ts', lang: 'ts' },
      ...noopStub,
    })
    expect(withTitle.find('.sr-code__title').text()).toBe('main.ts')
    withTitle.unmount()

    const withLang = mount(SrCodeBlock, { props: { code: 'a', lang: 'ts' }, ...noopStub })
    expect(withLang.find('.sr-code__title').text()).toBe('ts')
    withLang.unmount()
  })

  it('text 语言不显示顶栏标题', () => {
    const wrapper = mount(SrCodeBlock, { props: { code: 'a' }, ...noopStub })
    expect(wrapper.find('.sr-code__title').text()).toBe('')
    wrapper.unmount()
  })

  it('copyable 默认开启，复制成功后文案变「已复制」', async () => {
    srCopyText.mockResolvedValue(true)
    const wrapper = mount(SrCodeBlock, { props: { code: 'abc' }, ...noopStub })
    await nextTick()

    const button = wrapper.find('.sr-code__copy')
    expect(button.text()).toContain('复制')

    await button.trigger('click')
    await nextTick()

    expect(srCopyText).toHaveBeenCalledWith('abc')
    expect(button.text()).toContain('已复制')
    expect(wrapper.classes()).toContain('is-copied')
    wrapper.unmount()
  })

  it('复制失败时提示失败', async () => {
    srCopyText.mockResolvedValue(false)
    const wrapper = mount(SrCodeBlock, { props: { code: 'abc' }, ...noopStub })
    await nextTick()

    await wrapper.find('.sr-code__copy').trigger('click')
    await nextTick()

    expect(wrapper.find('.sr-code__copy').text()).toContain('复制失败')
    expect(wrapper.classes()).toContain('is-copy-fail')
    wrapper.unmount()
  })

  it('copyable 为 false 时不渲染按钮', () => {
    const wrapper = mount(SrCodeBlock, { props: { code: 'a', copyable: false }, ...noopStub })
    expect(wrapper.find('.sr-code__copy').exists()).toBe(false)
    wrapper.unmount()
  })

  it('size 生成对应类名', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const wrapper = mount(SrCodeBlock, { props: { code: 'a', size }, ...noopStub })
      expect(wrapper.classes()).toContain(`sr-code--${size}`)
      wrapper.unmount()
    }
  })
})
