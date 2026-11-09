import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import SrEmojiPicker, { DEFAULT_EMOJI_PACKAGES } from '../index'

import type { SrEmojiPackage } from '../src/emoji-picker'

/** 两个包，方便测 tab 切换 */
const packages: SrEmojiPackage[] = [
  {
    key: 'a',
    name: '甲包',
    emojis: [
      { name: '微笑', char: '🙂' },
      { name: '开心', char: '😄' },
    ],
  },
  {
    key: 'b',
    name: '乙包',
    emojis: [{ name: '赞', url: '/z.png' }],
  },
]

describe('SrEmojiPicker', () => {
  it('不传 packages 时用内置表情包', () => {
    const wrapper = mount(SrEmojiPicker)

    const tabs = wrapper.findAll('.sr-emoji-picker__tab')
    expect(tabs).toHaveLength(DEFAULT_EMOJI_PACKAGES.length)
    expect(tabs[0]?.text()).toBe('表情')
    wrapper.unmount()
  })

  it('渲染自定义表情包', () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    const tabs = wrapper.findAll('.sr-emoji-picker__tab')
    expect(tabs.map((tab) => tab.text())).toEqual(['甲包', '乙包'])
    wrapper.unmount()
  })

  it('默认展示第一个包的表情', () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    const items = wrapper.findAll('.sr-emoji-picker__item')
    expect(items).toHaveLength(2)
    expect(items[0]?.attributes('aria-label')).toBe('微笑')
    wrapper.unmount()
  })

  it('切 tab 后展示对应包', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    await wrapper.findAll('.sr-emoji-picker__tab')[1]?.trigger('click')
    await nextTick()

    const items = wrapper.findAll('.sr-emoji-picker__item')
    expect(items).toHaveLength(1)
    expect(items[0]?.attributes('aria-label')).toBe('赞')
    wrapper.unmount()
  })

  it('图片表情渲染 img，字符表情渲染文本', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    expect(wrapper.findAll('.sr-emoji-picker__char')).toHaveLength(2)

    await wrapper.findAll('.sr-emoji-picker__tab')[1]?.trigger('click')
    await nextTick()

    expect(wrapper.findAll('.sr-emoji-picker__img')).toHaveLength(1)
    wrapper.unmount()
  })

  it('点击表情派发 select 并带上标记文本', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    await wrapper.findAll('.sr-emoji-picker__item')[0]?.trigger('click')

    const emitted = wrapper.emitted('select')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0]?.[0]).toMatchObject({ name: '微笑' })
    expect(emitted?.[0]?.[1]).toBe('[微笑]')
    wrapper.unmount()
  })

  it('选中后出现「最近」tab 且置顶该表情', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    // 先在甲包里选一个
    await wrapper.findAll('.sr-emoji-picker__item')[1]?.trigger('click')
    await nextTick()

    const tabs = wrapper.findAll('.sr-emoji-picker__tab')
    expect(tabs[0]?.text()).toBe('最近')

    // 「最近」是当前激活 tab，网格里第一条就是刚选的
    const items = wrapper.findAll('.sr-emoji-picker__item')
    expect(items[0]?.attributes('aria-label')).toBe('开心')
    wrapper.unmount()
  })

  it('showRecent 为 false 时不出现「最近」tab', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, showRecent: false } })

    await wrapper.findAll('.sr-emoji-picker__item')[0]?.trigger('click')
    await nextTick()

    const tabs = wrapper.findAll('.sr-emoji-picker__tab')
    expect(tabs.map((tab) => tab.text())).toEqual(['甲包', '乙包'])
    wrapper.unmount()
  })

  it('空表情包显示提示', () => {
    const wrapper = mount(SrEmojiPicker, {
      props: { packages: [{ key: 'e', name: '空包', emojis: [] }] },
    })

    expect(wrapper.find('.sr-emoji-picker__empty').exists()).toBe(true)
    wrapper.unmount()
  })

  it('columns 控制网格列数', () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, columns: 5 } })

    const grid = wrapper.find('.sr-emoji-picker__grid')
    expect(grid.attributes('style')).toContain('repeat(5, 1fr)')
    wrapper.unmount()
  })

  it('disabled 时不派发 select', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, disabled: true } })

    await wrapper.findAll('.sr-emoji-picker__item')[0]?.trigger('click')

    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.classes()).toContain('is-disabled')
    wrapper.unmount()
  })

  it('tab 默认在底部', () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })
    expect(wrapper.classes()).toContain('is-tab-bottom')
    wrapper.unmount()
  })

  it('tabPosition 可切到顶部', () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, tabPosition: 'top' } })

    expect(wrapper.classes()).toContain('is-tab-top')
    expect(wrapper.find('.sr-emoji-picker__tabs').classes()).toContain('is-top')
    wrapper.unmount()
  })

  it('内置表情包覆盖五个分类且每类都有量', () => {
    expect(DEFAULT_EMOJI_PACKAGES.map((pack) => pack.name)).toEqual(['表情', '手势', '心情', '动物', '食物'])

    for (const pack of DEFAULT_EMOJI_PACKAGES) {
      expect(pack.emojis.length).toBeGreaterThanOrEqual(20)
    }
  })

  it('maxHeight 作用在面板上', () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, maxHeight: 180 } })

    expect(wrapper.find('.sr-emoji-picker__panel').attributes('style')).toContain('max-height: 180px')
    wrapper.unmount()
  })
})
