import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'

import SrSlider from '../index'

// jsdom 没有 PointerEvent
class FakePointerEvent extends MouseEvent {
  pointerType: string

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.pointerType = init.pointerType ?? 'mouse'
  }
}

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).PointerEvent = FakePointerEvent
})

/**
 * 给元素编一个矩形（jsdom 默认全是 0）
 * @param element 元素
 * @param left 左侧位置
 * @param width 宽度
 */
function mockRect(element: HTMLElement, left: number, width: number): void {
  element.getBoundingClientRect = () =>
    ({
      top: 0,
      bottom: 10,
      left,
      right: left + width,
      width,
      height: 10,
      x: left,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect
}

/**
 * 挂载滑块
 * @param props 组件 props
 * @returns 包装器
 */
function mountSlider(props: Record<string, unknown> = {}) {
  return mount(SrSlider, { props, attachTo: document.body })
}

describe('SrSlider', () => {
  it('渲染轨道和滑块', () => {
    const wrapper = mountSlider({ modelValue: 30 })

    expect(wrapper.find('.sr-slider__track').exists()).toBe(true)
    expect(wrapper.findAll('.sr-slider__handle')).toHaveLength(1)
    wrapper.unmount()
  })

  it('填充宽度跟随数值', () => {
    const wrapper = mountSlider({ modelValue: 30, min: 0, max: 100 })

    expect(wrapper.find('.sr-slider__fill').attributes('style')).toContain('30%')
    wrapper.unmount()
  })

  it('滑块位置跟随数值', () => {
    const wrapper = mountSlider({ modelValue: 75 })

    expect(wrapper.find('.sr-slider__handle').attributes('style')).toContain('75%')
    wrapper.unmount()
  })

  it('超出范围的值被夹住', () => {
    const wrapper = mountSlider({ modelValue: 150, min: 0, max: 100 })

    expect(wrapper.find('.sr-slider__handle').attributes('style')).toContain('100%')
    wrapper.unmount()
  })

  it('区间模式渲染两个滑块', () => {
    const wrapper = mountSlider({ modelValue: [20, 60], range: true })

    expect(wrapper.findAll('.sr-slider__handle')).toHaveLength(2)
    wrapper.unmount()
  })

  it('区间模式填充段从左侧值到右侧值', () => {
    const wrapper = mountSlider({ modelValue: [20, 60], range: true })
    const style = wrapper.find('.sr-slider__fill').attributes('style')

    expect(style).toContain('left: 20%')
    expect(style).toContain('width: 40%')
    wrapper.unmount()
  })

  it('键盘方向键调整数值', async () => {
    const wrapper = mountSlider({ modelValue: 50, step: 5 })

    await wrapper.find('.sr-slider__handle').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([55])
    wrapper.unmount()
  })

  it('Home / End 跳到两端', async () => {
    const wrapper = mountSlider({ modelValue: 50 })

    await wrapper.find('.sr-slider__handle').trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([100])

    await wrapper.find('.sr-slider__handle').trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([0])
    wrapper.unmount()
  })

  it('禁用时键盘无效', async () => {
    const wrapper = mountSlider({ modelValue: 50, disabled: true })

    await wrapper.find('.sr-slider__handle').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('禁用生成对应类名', () => {
    const wrapper = mountSlider({ disabled: true })
    expect(wrapper.classes()).toContain('is-disabled')
    wrapper.unmount()
  })

  it('纵向生成对应类名', () => {
    const wrapper = mountSlider({ vertical: true })
    expect(wrapper.classes()).toContain('is-vertical')
    wrapper.unmount()
  })

  it('showStops 渲染间断点', () => {
    const wrapper = mountSlider({ min: 0, max: 100, step: 25, showStops: true })

    // 0/25/50/75/100 → 中间 3 个间断点
    expect(wrapper.findAll('.sr-slider__stop')).toHaveLength(3)
    wrapper.unmount()
  })

  it('不开启 showStops 时没有间断点', () => {
    const wrapper = mountSlider({ min: 0, max: 100, step: 25 })
    expect(wrapper.findAll('.sr-slider__stop')).toHaveLength(0)
    wrapper.unmount()
  })

  it('拖动指针改变数值', () => {
    const wrapper = mountSlider({ modelValue: 0, min: 0, max: 100 })
    const track = wrapper.find('.sr-slider__track').element as HTMLElement
    mockRect(track, 0, 200)

    const handle = wrapper.find('.sr-slider__handle').element as HTMLElement
    handle.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 5, bubbles: true }))
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 5, bubbles: true }))

    // 拖到一半 → 50
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([50])

    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 100, clientY: 5, bubbles: true }))
    expect(wrapper.emitted('change')).toBeTruthy()
    wrapper.unmount()
  })

  it('formatTooltip 影响提示文案', async () => {
    const wrapper = mountSlider({ modelValue: 30, formatTooltip: (v: number) => `${v}°C` })

    // 拖动时才显示提示，先按下
    const handle = wrapper.find('.sr-slider__handle').element as HTMLElement
    handle.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 5, bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.sr-slider__tooltip').text()).toBe('30°C')

    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 0, clientY: 5, bubbles: true }))
    wrapper.unmount()
  })

  it('showTooltip 为 false 时不渲染提示', async () => {
    const wrapper = mountSlider({ modelValue: 30, showTooltip: false })

    const handle = wrapper.find('.sr-slider__handle').element as HTMLElement
    handle.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 5, bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.sr-slider__tooltip').exists()).toBe(false)

    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 0, clientY: 5, bubbles: true }))
    wrapper.unmount()
  })

  it('尺寸生成对应类名', () => {
    const wrapper = mountSlider({ size: 'large' })
    expect(wrapper.classes()).toContain('sr-slider--large')
    wrapper.unmount()
  })

  it('滑块带 aria 属性', () => {
    const wrapper = mountSlider({ modelValue: 40, min: 0, max: 100 })
    const handle = wrapper.find('.sr-slider__handle')

    expect(handle.attributes('aria-valuenow')).toBe('40')
    expect(handle.attributes('aria-valuemin')).toBe('0')
    expect(handle.attributes('aria-valuemax')).toBe('100')
    wrapper.unmount()
  })
})
