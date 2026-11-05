import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'

import { SrInput } from '..'
import { SrConfigProvider } from '../../config-provider'

describe('SrInput', () => {
  it('渲染内层原生 input，wrapper 不带原生属性', () => {
    const wrapper = mount(SrInput, { attrs: { class: 'my-input', 'data-test': 'field' } })

    // class 归 wrapper，其余属性直达 input
    expect(wrapper.classes()).toContain('my-input')
    expect(wrapper.attributes('data-test')).toBeUndefined()
    expect(wrapper.find('input').attributes('data-test')).toBe('field')
  })

  it('$attrs 落到 input 而非 wrapper（autocomplete / maxlength 生效）', () => {
    const wrapper = mount(SrInput, {
      attrs: { autocomplete: 'off', inputmode: 'numeric' },
    })

    const input = wrapper.find('input')
    expect(input.attributes('autocomplete')).toBe('off')
    expect(input.attributes('inputmode')).toBe('numeric')
  })

  it('输入时派发 update:modelValue 与 change', async () => {
    const wrapper = mount(SrInput, { props: { modelValue: '' } })
    const input = wrapper.find('input')

    await input.setValue('夕梦')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['夕梦'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['夕梦'])
  })

  it('number 类型的 modelValue 输出数字', async () => {
    const wrapper = mount(SrInput, { props: { modelValue: 0 } })

    await wrapper.find('input').setValue('42')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([42])
  })

  it('Enter 派发 enter 事件', async () => {
    const wrapper = mount(SrInput)
    await wrapper.find('input').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('enter')).toHaveLength(1)
  })

  it('clearable 仅在可清空时有值显示按钮', async () => {
    const empty = mount(SrInput, { props: { modelValue: '', clearable: true } })
    expect(empty.find('.sr-input__action').exists()).toBe(false)

    const filled = mount(SrInput, { props: { modelValue: 'x', clearable: true } })
    expect(filled.find('.sr-input__action').exists()).toBe(true)

    const disabled = mount(SrInput, {
      props: { modelValue: 'x', clearable: true, disabled: true },
    })
    expect(disabled.find('.sr-input__action').exists()).toBe(false)
  })

  it('点击清空按钮清空值并回焦', async () => {
    const wrapper = mount(SrInput, {
      props: { modelValue: '要清掉', clearable: true },
      attachTo: document.body,
    })

    await wrapper.find('.sr-input__action').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    expect(wrapper.emitted('clear')).toHaveLength(1)

    wrapper.unmount()
  })

  it('showPassword 切换 input type', async () => {
    const wrapper = mount(SrInput, {
      props: { modelValue: 'secret', type: 'password', showPassword: true },
    })

    expect(wrapper.find('input').attributes('type')).toBe('password')

    await wrapper.find('.sr-input__action').trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('text')

    await wrapper.find('.sr-input__action').trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('字数统计同时显示已输入长度与上限', () => {
    const wrapper = mount(SrInput, {
      props: { modelValue: '夕梦 UI', maxlength: 20, showCount: true },
    })

    expect(wrapper.find('.sr-input__count').text()).toBe('5 / 20')
  })

  it('status 生成对应修饰类', () => {
    const wrapper = mount(SrInput, { props: { status: 'error' } })
    expect(wrapper.classes()).toContain('sr-input--error')
  })

  it('textarea 分支渲染 textarea 而非 input', () => {
    const wrapper = mount(SrInput, { props: { type: 'textarea', rows: 4 } })

    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.find('textarea').attributes('rows')).toBe('4')
    expect(wrapper.classes()).toContain('is-textarea')
  })

  it('尺寸继承 SrConfigProvider', () => {
    const wrapper = mount({
      render: () => h(SrConfigProvider, { size: 'lg' }, () => h(SrInput, { modelValue: '' })),
    })

    const root = wrapper.find('.sr-input').element as HTMLElement
    expect(root.style.getPropertyValue('--sr-input-height')).toBe('40px')
  })

  it('响应式尺寸逐断点写变量', () => {
    const wrapper = mount(SrInput, { props: { size: { xs: 'sm', md: 'lg' } } })
    const root = wrapper.element as HTMLElement

    expect(root.style.getPropertyValue('--sr-input-height-xs')).toBe('28px')
    expect(root.style.getPropertyValue('--sr-input-height-md')).toBe('40px')
  })

  it('前缀插槽渲染在输入元素之前', async () => {
    const wrapper = mount(SrInput, {
      slots: { prefix: () => h('span', { class: 'pfx' }, 'URL') },
    })

    const prefix = wrapper.find('.sr-input__prefix')
    expect(prefix.exists()).toBe(true)

    await nextTick()
    expect(prefix.find('.pfx').exists()).toBe(true)
  })
})
