import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SrTextarea from '../index'
import {
  BG_POSITION_MAP,
  srBuildTextareaEmojiMap,
  srCountTextareaText,
  srNormalizeBackgroundImage,
  srRenderRich,
  srSerializeRich,
} from '../src/textarea'

import type { SrEmojiPackage } from '../../emoji-picker/src/emoji-picker'

/** 一份最小表情包：一个字符表情 + 一个图片表情 */
const packages: SrEmojiPackage[] = [
  {
    key: 'test',
    name: '测试',
    emojis: [
      { name: '微笑', char: '🙂' },
      { name: '狗头', url: 'https://cdn.example.com/dog.png' },
    ],
  },
]

/** 查找表 */
const emojiMap = srBuildTextareaEmojiMap(packages)

/**
 * 挂载
 * @param props 组件 props
 * @returns 包装器
 */
function mountArea(props: Record<string, unknown> = {}) {
  return mount(SrTextarea, { props })
}

describe('srNormalizeBackgroundImage', () => {
  it('裸地址包成 url()', () => {
    expect(srNormalizeBackgroundImage('/assets/paper.png')).toBe('url("/assets/paper.png")')
    expect(srNormalizeBackgroundImage('https://cdn.example.com/a.png')).toBe(
      'url("https://cdn.example.com/a.png")',
    )
  })

  it('渐变与 url() 原样返回', () => {
    const gradient = 'linear-gradient(135deg, #eef, #fee)'
    expect(srNormalizeBackgroundImage(gradient)).toBe(gradient)
    expect(srNormalizeBackgroundImage('url(/a.png)')).toBe('url(/a.png)')
  })

  it('危险协议与空值被拦掉', () => {
    expect(srNormalizeBackgroundImage('javascript:alert(1)')).toBe('')
    expect(srNormalizeBackgroundImage('   ')).toBe('')
  })
})

describe('富文本序列化', () => {
  it('标记 → 节点 → 标记，往返一致', () => {
    const el = document.createElement('div')
    srRenderRich(el, '你好[微笑][狗头]', emojiMap)

    expect(el.querySelectorAll('[data-mark]')).toHaveLength(2)
    expect(srSerializeRich(el)).toBe('你好[微笑][狗头]')
  })

  it('换行往返', () => {
    const el = document.createElement('div')
    srRenderRich(el, '第一行\n第二行', emojiMap)

    expect(srSerializeRich(el)).toBe('第一行\n第二行')
  })

  it('不认识的标记原样保留，不吞内容', () => {
    const el = document.createElement('div')
    srRenderRich(el, '这是[注]释', emojiMap)

    expect(el.querySelectorAll('[data-mark]')).toHaveLength(0)
    expect(srSerializeRich(el)).toBe('这是[注]释')
  })

  it('不换行空格归一成普通空格', () => {
    const el = document.createElement('div')
    el.textContent = 'a\u00A0b'

    expect(srSerializeRich(el)).toBe('a b')
  })

  it('表情节点不可编辑', () => {
    const el = document.createElement('div')
    srRenderRich(el, '[微笑][狗头]', emojiMap)

    const nodes = [...el.querySelectorAll('[data-mark]')]
    expect(nodes.every((node) => node.getAttribute('contenteditable') === 'false')).toBe(true)
  })
})

describe('srCountTextareaText', () => {
  it('一个表情算一个字', () => {
    expect(srCountTextareaText('[微笑][狗头]', emojiMap)).toBe(2)
    expect(srCountTextareaText('你好[微笑]', emojiMap)).toBe(3)
  })

  it('没有表情表时按码点计数', () => {
    expect(srCountTextareaText('🙂ab')).toBe(3)
  })
})

describe('SrTextarea', () => {
  it('不传表情包时走原生 textarea', () => {
    const wrapper = mountArea({ modelValue: '你好' })

    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('.sr-textarea__rich').exists()).toBe(false)
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('你好')
    wrapper.unmount()
  })

  it('传表情包时走富文本，并把标记渲染成表情', () => {
    const wrapper = mountArea({ modelValue: '你好[微笑]', emojiPackages: packages })

    expect(wrapper.find('textarea').exists()).toBe(false)
    const rich = wrapper.find('.sr-textarea__rich')
    expect(rich.exists()).toBe(true)
    expect(rich.findAll('[data-mark]')).toHaveLength(1)
    wrapper.unmount()
  })

  it('字数按可见字符算，并在插槽里给出', () => {
    const wrapper = mountArea({ modelValue: '你好[微笑]', emojiPackages: packages, showCount: true })

    expect(wrapper.find('.sr-textarea__count').text()).toContain('3')
    wrapper.unmount()
  })

  it('超限时计数标红', () => {
    const wrapper = mountArea({ modelValue: '这段文字超了', maxlength: 2, showCount: true })

    expect(wrapper.find('.sr-textarea__count').classes()).toContain('is-over')
    wrapper.unmount()
  })

  it('背景文字渲染在背景层里', () => {
    const wrapper = mountArea({ backgroundText: '水印' })

    const text = wrapper.find('.sr-textarea__bg-text')
    expect(text.exists()).toBe(true)
    expect(text.text()).toBe('水印')
    wrapper.unmount()
  })

  it('submitOnEnter 下 Enter 派发 submit，Shift + Enter 不派发', async () => {
    const wrapper = mountArea({ modelValue: 'hi', submitOnEnter: true })
    const textarea = wrapper.find('textarea')

    await textarea.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('submit')?.[0]).toEqual(['hi'])

    await textarea.trigger('keydown', { key: 'Enter', shiftKey: true })
    expect(wrapper.emitted('submit')).toHaveLength(1)

    wrapper.unmount()
  })

  it('传了 footer 插槽才渲染底部', () => {
    const wrapper = mount(SrTextarea, {
      props: { modelValue: '' },
      slots: { footer: '<button class="ok">发表</button>' },
    })

    expect(wrapper.find('.ok').exists()).toBe(true)
    wrapper.unmount()
  })

  it('没有 footer 时字数浮在输入区，不占独立一行', () => {
    const wrapper = mountArea({ modelValue: 'hi', maxlength: 10, showCount: true })

    expect(wrapper.classes()).toContain('is-count-inline')
    expect(wrapper.find('.sr-textarea__count--inline').exists()).toBe(true)
    expect(wrapper.find('.sr-textarea__footer').exists()).toBe(false)
    wrapper.unmount()
  })

  it('有 footer 时字数回到工具栏', () => {
    const wrapper = mount(SrTextarea, {
      props: { modelValue: 'hi', showCount: true },
      slots: { footer: '<span class="ok">工具</span>' },
    })

    expect(wrapper.find('.sr-textarea__footer .sr-textarea__count').exists()).toBe(true)
    expect(wrapper.find('.sr-textarea__count--inline').exists()).toBe(false)
    wrapper.unmount()
  })

  it('背景位置映射到九宫格对齐', () => {
    const wrapper = mountArea({ backgroundText: '水印', backgroundPosition: 'bottom-right' })
    const bg = wrapper.find('.sr-textarea__bg').element as HTMLElement

    expect(bg.style.justifyContent).toBe('flex-end')
    expect(bg.style.alignItems).toBe('flex-end')
    wrapper.unmount()
  })

  it('背景文字字号与不透明度可按属性覆盖', () => {
    const wrapper = mountArea({
      backgroundText: '水印',
      backgroundTextSize: 40,
      backgroundTextOpacity: 0.2,
    })
    const text = wrapper.find('.sr-textarea__bg-text').element as HTMLElement

    expect(text.style.fontSize).toBe('40px')
    expect(text.style.opacity).toBe('0.2')
    wrapper.unmount()
  })
})

describe('BG_POSITION_MAP', () => {
  it('九宫格全都有映射', () => {
    expect(Object.keys(BG_POSITION_MAP)).toHaveLength(9)
    expect(BG_POSITION_MAP.center.image).toBe('center center')
  })
})
