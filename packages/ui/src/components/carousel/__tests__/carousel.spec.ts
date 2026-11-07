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

  it('关闭指示器与箭头', () => {
    const wrapper = mountCarousel({ indicators: false, arrows: false })

    expect(wrapper.find('.sr-carousel__indicators').exists()).toBe(false)
    expect(wrapper.find('.sr-carousel__arrow').exists()).toBe(false)
    wrapper.unmount()
  })
})
