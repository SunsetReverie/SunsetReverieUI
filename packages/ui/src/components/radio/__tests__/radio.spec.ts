import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick, ref } from 'vue'

import { SrRadio, SrRadioGroup } from '..'

describe('SrRadio', () => {
  it('渲染原生 radio 与文字', () => {
    const wrapper = mount(SrRadio, { props: { value: 'a', label: '选项 A' } })

    expect(wrapper.find('input[type="radio"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('选项 A')
  })

  it('单独使用时受 modelValue 控制', async () => {
    const wrapper = mount(SrRadio, { props: { value: 'a', modelValue: undefined } })

    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['a'])
  })

  it('值等于 modelValue 时为选中态', () => {
    const wrapper = mount(SrRadio, { props: { value: 'a', modelValue: 'a' } })
    expect(wrapper.classes()).toContain('is-checked')
  })

  it('没有 value 时不派发事件（避免误用）', async () => {
    const wrapper = mount(SrRadio, { props: { modelValue: undefined } })

    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('SrRadioGroup', () => {
  it('点击子项后整组切换', async () => {
    const value = ref<string | number | boolean | undefined>('a')

    const wrapper = mount({
      render: () =>
        h(
          SrRadioGroup,
          {
            modelValue: value.value,
            'onUpdate:modelValue': (next: string | number | boolean) => {
              value.value = next
            },
          },
          () => [h(SrRadio, { value: 'a', label: 'A' }), h(SrRadio, { value: 'b', label: 'B' })],
        ),
    })

    await wrapper.findAll('input[type="radio"]')[1].setValue(true)
    await nextTick()

    expect(value.value).toBe('b')
  })

  it('同组 radio 共享同一个 name，保证原生互斥', () => {
    const wrapper = mount({
      render: () =>
        h(SrRadioGroup, { modelValue: 'a', name: 'plan' }, () => [
          h(SrRadio, { value: 'a', label: 'A' }),
          h(SrRadio, { value: 'b', label: 'B' }),
        ]),
    })

    const names = wrapper.findAll('input').map((input) => input.attributes('name'))
    expect(new Set(names).size).toBe(1)
    expect(names[0]).toBe('plan')
  })

  it('未指定 name 时自动生成，不与其它组冲突', () => {
    const wrapper = mount({
      render: () => h(SrRadioGroup, { modelValue: 'a' }, () => [h(SrRadio, { value: 'a', label: 'A' })]),
    })

    expect(wrapper.find('input').attributes('name')).toBeTruthy()
  })

  it('组级 disabled 下所有子项不可交互', async () => {
    const wrapper = mount({
      render: () =>
        h(SrRadioGroup, { modelValue: 'a', disabled: true }, () => [
          h(SrRadio, { value: 'a', label: 'A' }),
          h(SrRadio, { value: 'b', label: 'B' }),
        ]),
    })

    for (const input of wrapper.findAll('input')) {
      expect(input.attributes('disabled')).toBeDefined()
    }
  })

  it('选中项渲染 is-checked', () => {
    const wrapper = mount({
      render: () =>
        h(SrRadioGroup, { modelValue: 'b' }, () => [
          h(SrRadio, { value: 'a', label: 'A' }),
          h(SrRadio, { value: 'b', label: 'B' }),
        ]),
    })

    const items = wrapper.findAll('.sr-radio')
    expect(items[0].classes()).not.toContain('is-checked')
    expect(items[1].classes()).toContain('is-checked')
  })

  it('重复选中同一项不派发事件', async () => {
    const wrapper = mount({
      render: () => h(SrRadioGroup, { modelValue: 'a' }, () => [h(SrRadio, { value: 'a', label: 'A' })]),
    })

    await wrapper.find('input').setValue(true)
    expect(wrapper.findComponent(SrRadioGroup).emitted('update:modelValue')).toBeUndefined()
  })
})
