import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { SrInputNumber, srClampNumber, srNumberPrecision } from '..'

describe('srNumberPrecision / srClampNumber', () => {
  it('能识别普通小数与科学计数法的精度', () => {
    expect(srNumberPrecision(1)).toBe(0)
    expect(srNumberPrecision(0.1)).toBe(1)
    expect(srNumberPrecision(0.25)).toBe(2)
    expect(srNumberPrecision(1e-7)).toBe(7)
  })

  it('钳制边界并按精度抹平浮点误差', () => {
    expect(srClampNumber(0.1 + 0.2, -Infinity, Infinity, 1)).toBe(0.3)
    expect(srClampNumber(120, 0, 100, 0)).toBe(100)
    expect(srClampNumber(-5, 0, 100, 0)).toBe(0)
  })
})

describe('SrInputNumber', () => {
  it('渲染为 sr-input 外壳，展示按精度格式化的值', () => {
    const wrapper = mount(SrInputNumber, { props: { modelValue: 3, step: 0.1 } })

    expect(wrapper.classes()).toContain('sr-input')
    expect(wrapper.classes()).toContain('sr-input-number')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('3.0')
  })

  it('点击加减按钮派发新值与 step 事件', async () => {
    const wrapper = mount(SrInputNumber, { props: { modelValue: 5 } })

    await wrapper.find('.sr-input-number__btn--up').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([6])
    expect(wrapper.emitted('step')?.[0]).toEqual([6, 'increase'])

    await wrapper.setProps({ modelValue: 6 })
    await wrapper.find('.sr-input-number__btn--down').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([5])
    expect(wrapper.emitted('step')?.[1]).toEqual([5, 'decrease'])
  })

  it('到达 min/max 时按钮禁用且不再派发', async () => {
    const wrapper = mount(SrInputNumber, { props: { modelValue: 10, min: 0, max: 10 } })

    const up = wrapper.find('.sr-input-number__btn--up')
    expect(up.attributes('disabled')).toBeDefined()
    await up.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.setProps({ modelValue: 0 })
    const down = wrapper.find('.sr-input-number__btn--down')
    expect(down.attributes('disabled')).toBeDefined()
  })

  it('小数步进不产生浮点尾数', async () => {
    const wrapper = mount(SrInputNumber, { props: { modelValue: 0.1, step: 0.1 } })

    await wrapper.find('.sr-input-number__btn--up').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0.2])
  })

  it('方向键步进', async () => {
    const wrapper = mount(SrInputNumber, { props: { modelValue: 1 } })
    const input = wrapper.find('input')

    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])

    await wrapper.setProps({ modelValue: 2 })
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([1])
  })

  it('失焦时把越界输入钳制回边界', async () => {
    const wrapper = mount(SrInputNumber, { props: { modelValue: 5, min: 0, max: 10 } })
    const input = wrapper.find('input')

    await input.setValue('999')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([10])
    expect((input.element as HTMLInputElement).value).toBe('10')
  })

  it('非法文本不派发，失焦回退到上次有效值', async () => {
    const wrapper = mount(SrInputNumber, { props: { modelValue: 7 } })
    const input = wrapper.find('input')

    await input.setValue('abc')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await input.trigger('blur')
    expect((input.element as HTMLInputElement).value).toBe('7')
  })

  it('清空时派发 null', async () => {
    const wrapper = mount(SrInputNumber, { props: { modelValue: 3 } })
    await wrapper.find('input').setValue('')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })

  it('controls=false 不渲染步进按钮', () => {
    const wrapper = mount(SrInputNumber, { props: { controls: false } })
    expect(wrapper.find('.sr-input-number__btn').exists()).toBe(false)
  })

  it('controlsPosition=both 时渲染两侧按钮', () => {
    const wrapper = mount(SrInputNumber, { props: { controlsPosition: 'both' } })
    expect(wrapper.classes()).toContain('sr-input-number--both')
    expect(wrapper.findAll('.sr-input-number__btn--side')).toHaveLength(2)
    expect(wrapper.find('.sr-input-number__controls').exists()).toBe(false)
  })

  it('禁用与只读都不允许步进', async () => {
    const wrapper = mount(SrInputNumber, { props: { modelValue: 1, disabled: true } })
    expect(wrapper.find('.sr-input-number__btn').exists()).toBe(false)

    const readonly = mount(SrInputNumber, { props: { modelValue: 1, readonly: true } })
    await readonly.find('.sr-input-number__btn--up').trigger('click')
    expect(readonly.emitted('update:modelValue')).toBeUndefined()
  })

  it('校验态跟随自身 status', () => {
    const wrapper = mount(SrInputNumber, { props: { status: 'error' } })
    expect(wrapper.classes()).toContain('sr-input--error')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })
})
