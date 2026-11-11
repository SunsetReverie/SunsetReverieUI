import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
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

  it('选完不跳到「最近」，可以连着点', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    // 连点两个，视图必须一直停在甲包，否则第二个就点不到了
    await wrapper.findAll('.sr-emoji-picker__item')[0]?.trigger('click')
    await nextTick()
    await wrapper.findAll('.sr-emoji-picker__item')[1]?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('select')).toHaveLength(2)
    const tabs = wrapper.findAll('.sr-emoji-picker__tab')
    expect(tabs[0]?.text()).toBe('最近')
    expect(tabs[0]?.classes()).not.toContain('is-active')
    expect(tabs[1]?.classes()).toContain('is-active')
    expect(wrapper.find('.sr-emoji-picker__meta').text()).toBe('甲包')
    wrapper.unmount()
  })

  it('点「最近」才切过去，且刚选的排在最前', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    await wrapper.findAll('.sr-emoji-picker__item')[1]?.trigger('click')
    await nextTick()
    await wrapper.findAll('.sr-emoji-picker__tab')[0]?.trigger('click')
    await nextTick()

    expect(wrapper.find('.sr-emoji-picker__meta').text()).toBe('最近使用')
    expect(wrapper.findAll('.sr-emoji-picker__item')[0]?.attributes('aria-label')).toBe('开心')
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
    wrapper.unmount()
  })

  it('内置表情包覆盖五个分类且每类都有量', () => {
    expect(DEFAULT_EMOJI_PACKAGES.map((pack) => pack.name)).toEqual(['表情', '手势', '心情', '动物', '食物'])

    for (const pack of DEFAULT_EMOJI_PACKAGES) {
      expect(pack.emojis.length).toBeGreaterThanOrEqual(20)
    }
  })

  it('width / height / minHeight 都作用到根节点', () => {
    const wrapper = mount(SrEmojiPicker, {
      props: { packages, width: 360, height: '20rem', minHeight: 180 },
    })

    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('width: 360px')
    expect(style).toContain('height: 20rem')
    expect(style).toContain('min-height: 180px')
    wrapper.unmount()
  })

  it('默认有最小高度', () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })
    expect(wrapper.attributes('style')).toContain('min-height: 240px')
    wrapper.unmount()
  })

  it('传 height 时内容区不再受 maxHeight 限制', () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, height: 400 } })
    expect(wrapper.find('.sr-emoji-picker__panel').attributes('style')).toBeUndefined()
    wrapper.unmount()
  })

  it('searchable 打开搜索框并跨分类过滤', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, searchable: true } })

    expect(wrapper.find('.sr-emoji-picker__search').exists()).toBe(true)

    const input = wrapper.find('.sr-emoji-picker__search-input')
    await input.setValue('赞')

    // 「赞」在甲包里，搜索状态下分类栏隐藏
    expect(wrapper.findAll('.sr-emoji-picker__item')).toHaveLength(1)
    expect(wrapper.find('.sr-emoji-picker__tabs').exists()).toBe(false)
    expect(wrapper.find('.sr-emoji-picker__meta').text()).toBe('找到 1 个')
    expect(wrapper.emitted('search-change')?.[0]).toEqual(['赞'])
    wrapper.unmount()
  })

  it('搜索无结果时给提示', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, searchable: true } })

    await wrapper.find('.sr-emoji-picker__search-input').setValue('不存在')
    expect(wrapper.find('.sr-emoji-picker__empty').text()).toBe('没有匹配的表情')
    wrapper.unmount()
  })

  it('清空搜索后分类栏回来', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, searchable: true } })

    await wrapper.find('.sr-emoji-picker__search-input').setValue('赞')
    expect(wrapper.find('.sr-emoji-picker__tabs').exists()).toBe(false)

    await wrapper.find('.sr-emoji-picker__search-clear').trigger('click')
    expect(wrapper.find('.sr-emoji-picker__tabs').exists()).toBe(true)
    wrapper.unmount()
  })

  it('悬停时信息行显示表情名称', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    expect(wrapper.find('.sr-emoji-picker__meta').text()).toBe('甲包')
    await wrapper.findAll('.sr-emoji-picker__item')[0]?.trigger('mouseenter')
    expect(wrapper.find('.sr-emoji-picker__meta').text()).toBe('微笑')
    wrapper.unmount()
  })

  it('不再输出原生 title，名称只走 aria-label', () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    // 原生 title 会同时触发浏览器自带提示，和组件提示重复
    expect(wrapper.findAll('.sr-emoji-picker__item[title]')).toHaveLength(0)
    expect(wrapper.find('.sr-emoji-picker__item').attributes('aria-label')).toBe('微笑')
    wrapper.unmount()
  })

  it('tipMode=tooltip 时用气泡提示，并隐藏与 tab 重复的信息行', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, tipMode: 'tooltip' } })

    const items = wrapper.findAll('.sr-emoji-picker__item')
    expect(wrapper.findAll('.sr-tooltip__trigger')).toHaveLength(items.length)
    expect(wrapper.find('.sr-emoji-picker__meta').exists()).toBe(false)
    expect(wrapper.find('.sr-emoji-picker').classes()).toContain('is-meta-hidden')

    await items[0]?.trigger('mouseenter')
    expect(wrapper.find('.sr-emoji-picker__meta').exists()).toBe(false)
    wrapper.unmount()
  })

  it('tipMode=tooltip 搜索时恢复信息行显示命中数', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, tipMode: 'tooltip', searchable: true } })

    await wrapper.find('.sr-emoji-picker__search-input').setValue('赞')
    expect(wrapper.find('.sr-emoji-picker__meta').text()).toBe('找到 1 个')
    wrapper.unmount()
  })

  it('tipMode=none 时既不显示气泡也不改信息行', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, tipMode: 'none' } })

    expect(wrapper.findAll('.sr-tooltip__trigger')).toHaveLength(0)
    await wrapper.findAll('.sr-emoji-picker__item')[0]?.trigger('mouseenter')
    expect(wrapper.find('.sr-emoji-picker__meta').text()).toBe('甲包')
    wrapper.unmount()
  })

  it('closeOnSelect 时额外派发 close', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, closeOnSelect: true } })

    await wrapper.findAll('.sr-emoji-picker__item')[0]?.trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
  })

  it('点选后出现短暂选中反馈并自动复位', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    await wrapper.findAll('.sr-emoji-picker__item')[0]?.trigger('click')
    expect(wrapper.findAll('.sr-emoji-picker__item')[0]?.classes()).toContain('is-picked')

    vi.advanceTimersByTime(420)
    await nextTick()
    expect(wrapper.findAll('.sr-emoji-picker__item')[0]?.classes()).not.toContain('is-picked')

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('卸载时清理选中动画的定时器', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    await wrapper.findAll('.sr-emoji-picker__item')[0]?.trigger('click')
    expect(() => wrapper.unmount()).not.toThrow()

    vi.useRealTimers()
  })

  it('默认不派发 close，方便连选', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })

    await wrapper.findAll('.sr-emoji-picker__item')[0]?.trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
    wrapper.unmount()
  })

  it('12 个表情包时 tab 全部渲染', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      key: `p-${i}`,
      name: `包${i}`,
      emojis: [{ name: `表情${i}`, char: '🙂' }],
    }))
    const wrapper = mount(SrEmojiPicker, { props: { packages: many } })

    expect(wrapper.findAll('.sr-emoji-picker__tab')).toHaveLength(12)
    wrapper.unmount()
  })

  it('默认宽度由 columns 算出，不跟内容走', () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, columns: 6 } })

    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('width: var(--sr-emoji-auto-width)')
    expect(style).toContain('--sr-emoji-columns: 6')
    wrapper.unmount()
  })

  it('纵向滚轮在 tab 栏上转成横向滚动', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })
    const tabs = wrapper.find('.sr-emoji-picker__tabs')
    const el = tabs.element as HTMLElement
    el.scrollLeft = 0

    await tabs.trigger('wheel', { deltaY: 120, deltaX: 0 })
    expect(el.scrollLeft).toBe(120)
    wrapper.unmount()
  })

  it('横向滚轮不接管', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })
    const tabs = wrapper.find('.sr-emoji-picker__tabs')
    const el = tabs.element as HTMLElement
    el.scrollLeft = 0

    await tabs.trigger('wheel', { deltaY: 20, deltaX: 100 })
    expect(el.scrollLeft).toBe(0)
    wrapper.unmount()
  })

  it('拖拽超过 4px 才滚动，且松手不误切 tab', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })
    const tabs = wrapper.find('.sr-emoji-picker__tabs')
    const el = tabs.element as HTMLElement
    el.scrollLeft = 0

    await tabs.trigger('pointerdown', { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 200 })
    await tabs.trigger('pointermove', { pointerId: 1, clientX: 197 }) // 3px，不判定为拖拽
    expect(el.scrollLeft).toBe(0)

    await tabs.trigger('pointermove', { pointerId: 1, clientX: 150 })
    expect(el.scrollLeft).toBe(50)

    await tabs.trigger('pointerup', { pointerId: 1, clientX: 150 })

    // 拖过之后的 click 被捕获阶段拦下，tab 不切换
    const second = wrapper.findAll('.sr-emoji-picker__tab')[1]
    await second?.trigger('click')
    expect(wrapper.find('.sr-emoji-picker__meta').text()).toBe('甲包')
    wrapper.unmount()
  })

  it('按下时不能立刻捕获指针，否则 tab 的 click 会丢', async () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages } })
    const tabs = wrapper.find('.sr-emoji-picker__tabs')
    const el = tabs.element as HTMLElement

    // jsdom 没有指针捕获，手动补一个用来观察调用时机
    const capture = vi.fn()
    Object.defineProperty(el, 'setPointerCapture', { value: capture, configurable: true })

    await tabs.trigger('pointerdown', { pointerId: 2, pointerType: 'mouse', button: 0, clientX: 100 })

    // 按下就捕获的话，pointerup 与随后的 click 目标都会变成这个容器，
    // 具体 tab 按钮上的 @click 永远收不到 —— 真实浏览器里就是「点分类没反应」
    expect(capture).not.toHaveBeenCalled()

    await tabs.trigger('pointermove', { pointerId: 2, clientX: 80 })
    expect(capture).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('maxHeight 作用在面板上', () => {
    const wrapper = mount(SrEmojiPicker, { props: { packages, maxHeight: 180 } })

    expect(wrapper.find('.sr-emoji-picker__panel').attributes('style')).toContain('max-height: 180px')
    wrapper.unmount()
  })
})
