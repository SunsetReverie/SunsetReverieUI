import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SrCarousel from '../index'

/** 三张卡片的最小数据集 */
const items = [{ text: 'A' }, { text: 'B' }, { text: 'C' }]

/**
 * 挂载轮播
 * @param props 覆盖默认 props
 * @returns 挂载结果
 */
function mountCarousel(props: Record<string, unknown> = {}) {
  return mount(SrCarousel, {
    props: { items, modelValue: 0, ...props },
    slots: {
      item: '<div class="slide-body">{{ params.item.text }}</div>',
    },
    global: {
      stubs: { SrIcon: true },
    },
  })
}

describe('SrCarousel', () => {
  it('按 items 渲染对应数量的幻灯片', () => {
    const wrapper = mountCarousel()

    expect(wrapper.findAll('.sr-carousel__slide')).toHaveLength(3)
    expect(wrapper.find('.slide-body').text()).toBe('A')
    wrapper.unmount()
  })

  it('第一张默认激活', () => {
    const wrapper = mountCarousel()

    expect(wrapper.findAll('.sr-carousel__slide')[0]?.classes()).toContain('is-active')
    expect(wrapper.findAll('.sr-carousel__slide')[1]?.classes()).not.toContain('is-active')
    wrapper.unmount()
  })

  it('点击下一张派发新索引', async () => {
    const wrapper = mountCarousel()

    await wrapper.find('.sr-carousel__arrow--next').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
    expect(wrapper.emitted('change')?.[0]).toEqual([1, 0])
    wrapper.unmount()
  })

  it('循环开启时从末张继续到首张', async () => {
    const wrapper = mountCarousel({ modelValue: 2, loop: true })

    await wrapper.find('.sr-carousel__arrow--next').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
    wrapper.unmount()
  })

  it('循环关闭时在末张不再前进', async () => {
    const wrapper = mountCarousel({ modelValue: 2, loop: false })

    const next = wrapper.find('.sr-carousel__arrow--next')
    expect(next.attributes('disabled')).toBeDefined()

    await next.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('指示器数量与 items 一致，点击直接跳转', async () => {
    const wrapper = mountCarousel()

    const indicators = wrapper.findAll('.sr-carousel__indicator')
    expect(indicators).toHaveLength(3)

    await indicators[2]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
    wrapper.unmount()
  })

  it('只有一张时不渲染箭头与指示器', () => {
    const wrapper = mountCarousel({ items: [{ text: 'only' }] })

    expect(wrapper.find('.sr-carousel__arrow').exists()).toBe(false)
    expect(wrapper.find('.sr-carousel__indicators').exists()).toBe(false)
    wrapper.unmount()
  })

  it('禁用时不响应任何切换', async () => {
    const wrapper = mountCarousel({ disabled: true })

    await wrapper.find('.sr-carousel__arrow--next').trigger('click')
    await wrapper.findAll('.sr-carousel__indicator')[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('索引越界时夹到合法范围', () => {
    const wrapper = mountCarousel({ modelValue: 99 })

    // items 变短或外部传了越界值时，不应停在不存在的位置
    const slides = wrapper.findAll('.sr-carousel__slide')
    expect(slides[2]?.classes()).toContain('is-active')
    wrapper.unmount()
  })

  it('fade 效果用透明度而不是位移', () => {
    const wrapper = mountCarousel({ effect: 'fade', modelValue: 1 })

    expect(wrapper.classes()).toContain('sr-carousel--fade')
    const first = wrapper.findAll('.sr-carousel__slide')[0]
    expect(first?.attributes('style')).toContain('opacity: 0')
    wrapper.unmount()
  })

  it('纵向模式生成对应类名', () => {
    const wrapper = mountCarousel({ direction: 'vertical' })

    expect(wrapper.classes()).toContain('sr-carousel--vertical')
    wrapper.unmount()
  })

  it('overlay 插槽渲染在 slide 内部', () => {
    const wrapper = mount(SrCarousel, {
      props: { items, modelValue: 0 },
      slots: {
        item: '<div class="body" />',
        overlay: '<span class="cap">{{ params.item.text }}</span>',
      },
      global: { stubs: { SrIcon: true } },
    })

    const slides = wrapper.findAll('.sr-carousel__slide')
    expect(slides[0]?.find('.sr-carousel__overlay').exists()).toBe(true)
    expect(slides[0]?.find('.cap').text()).toBe('A')
    wrapper.unmount()
  })

  it('鼠标拖过阈值后翻页', async () => {
    const wrapper = mountCarousel()
    // jsdom 里没有真实布局，手动给个宽度让阈值计算有意义
    Object.defineProperty(wrapper.element, 'clientWidth', { value: 400, configurable: true })

    await wrapper.trigger('pointerdown', { clientX: 300, pointerType: 'mouse', button: 0 })
    await wrapper.trigger('pointermove', { clientX: 200 })
    await wrapper.trigger('pointerup', { clientX: 200 })

    // 位移 100px > 400 * 0.15 = 60px
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
    wrapper.unmount()
  })

  it('拖动不足阈值时回弹，不翻页', async () => {
    const wrapper = mountCarousel()
    Object.defineProperty(wrapper.element, 'clientWidth', { value: 400, configurable: true })

    await wrapper.trigger('pointerdown', { clientX: 300, pointerType: 'mouse', button: 0 })
    await wrapper.trigger('pointermove', { clientX: 280 })
    await wrapper.trigger('pointerup', { clientX: 280 })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('关闭 draggable 时鼠标拖不动', async () => {
    const wrapper = mountCarousel({ draggable: false })
    Object.defineProperty(wrapper.element, 'clientWidth', { value: 400, configurable: true })

    await wrapper.trigger('pointerdown', { clientX: 300, pointerType: 'mouse', button: 0 })
    await wrapper.trigger('pointerup', { clientX: 100 })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('触摸拖动受 touchable 控制', async () => {
    const wrapper = mountCarousel({ touchable: false })
    Object.defineProperty(wrapper.element, 'clientWidth', { value: 400, configurable: true })

    await wrapper.trigger('pointerdown', { clientX: 300, pointerType: 'touch' })
    await wrapper.trigger('pointerup', { clientX: 100 })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('点击箭头能翻页（pointerdown 不抢走点击）', async () => {
    const wrapper = mountCarousel()
    Object.defineProperty(wrapper.element, 'clientWidth', { value: 400, configurable: true })

    // 模拟真实点击：按下与抬起位置一致，没有位移就不该进入拖动
    await wrapper.trigger('pointerdown', { clientX: 100, pointerType: 'mouse', button: 0 })
    await wrapper.trigger('pointerup', { clientX: 100 })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.find('.sr-carousel__arrow--next').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
    wrapper.unmount()
  })

  it('拖动阈值可按比例调整', async () => {
    const wrapper = mountCarousel({ dragThreshold: 0.5 })
    Object.defineProperty(wrapper.element, 'clientWidth', { value: 400, configurable: true })

    // 位移 100px，阈值 400 * 0.5 = 200px，不应翻页
    await wrapper.trigger('pointerdown', { clientX: 300, pointerType: 'mouse', button: 0 })
    await wrapper.trigger('pointermove', { clientX: 200 })
    await wrapper.trigger('pointerup', { clientX: 200 })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('height 传纯数字字符串时补上 px', () => {
    const wrapper = mountCarousel({ height: '180' })
    expect((wrapper.element as HTMLElement).style.height).toBe('180px')
    wrapper.unmount()
  })

  it('关闭指示器与箭头', () => {
    const wrapper = mountCarousel({ indicators: false, arrows: false })

    expect(wrapper.find('.sr-carousel__indicators').exists()).toBe(false)
    expect(wrapper.find('.sr-carousel__arrow').exists()).toBe(false)
    wrapper.unmount()
  })
})
