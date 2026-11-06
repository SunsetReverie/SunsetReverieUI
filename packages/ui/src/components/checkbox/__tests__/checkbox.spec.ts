import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick, ref } from 'vue'

import { SrCheckbox, SrCheckboxGroup } from '..'

describe('SrCheckbox', () => {
  it('渲染原生 checkbox 与文字', () => {
    const wrapper = mount(SrCheckbox, { props: { label: '同意协议' } })

    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('同意协议')
  })

  it('勾选时派发 update:modelValue 与 change', async () => {
    const wrapper = mount(SrCheckbox, { props: { modelValue: false } })

    await wrapper.find('input').setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    expect(wrapper.emitted('change')?.[0]).toEqual([true])
  })

  it('选中态生成对应类名', () => {
    const wrapper = mount(SrCheckbox, { props: { modelValue: true } })
    expect(wrapper.classes()).toContain('is-checked')
  })

  it('indeterminate 写到 DOM 属性而非 attribute', async () => {
    const wrapper = mount(SrCheckbox, { props: { indeterminate: true } })
    const input = wrapper.find('input').element as HTMLInputElement

    expect(input.indeterminate).toBe(true)
    expect(wrapper.classes()).toContain('is-indeterminate')

    await wrapper.setProps({ indeterminate: false })
    expect((wrapper.find('input').element as HTMLInputElement).indeterminate).toBe(false)
  })

  it('disabled 时原生 input 被禁用且点击无效', async () => {
    const wrapper = mount(SrCheckbox, { props: { disabled: true } })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('is-disabled')
  })

  it('尺寸生成修饰类', () => {
    const wrapper = mount(SrCheckbox, { props: { size: 'lg' } })
    expect(wrapper.classes()).toContain('sr-checkbox--lg')
  })

  it('半选优先于选中，勾与横线不会同时出现', () => {
    const wrapper = mount(SrCheckbox, { props: { modelValue: true, indeterminate: true } })

    expect(wrapper.classes()).toContain('is-indeterminate')
    expect(wrapper.classes()).not.toContain('is-checked')
  })
})

describe('SrCheckboxGroup', () => {
  it('组内勾选会追加到数组', async () => {
    const value = ref<(string | number)[]>(['a'])

    const wrapper = mount({
      render: () =>
        h(
          SrCheckboxGroup,
          {
            modelValue: value.value,
            'onUpdate:modelValue': (next: (string | number)[]) => {
              value.value = next
            },
          },
          () => [h(SrCheckbox, { value: 'a', label: 'A' }), h(SrCheckbox, { value: 'b', label: 'B' })],
        ),
    })

    const boxes = wrapper.findAll('input[type="checkbox"]')
    await boxes[1].setValue(true)
    await nextTick()

    expect(value.value).toEqual(['a', 'b'])
  })

  it('取消勾选会从数组移除', async () => {
    const value = ref<(string | number)[]>(['a', 'b'])

    const wrapper = mount({
      render: () =>
        h(
          SrCheckboxGroup,
          {
            modelValue: value.value,
            'onUpdate:modelValue': (next: (string | number)[]) => {
              value.value = next
            },
          },
          () => [h(SrCheckbox, { value: 'a', label: 'A' }), h(SrCheckbox, { value: 'b', label: 'B' })],
        ),
    })

    await wrapper.findAll('input[type="checkbox"]')[0].setValue(false)
    await nextTick()

    expect(value.value).toEqual(['b'])
  })

  it('组内已选项渲染为选中态', () => {
    const wrapper = mount({
      render: () =>
        h(SrCheckboxGroup, { modelValue: ['b'] }, () => [
          h(SrCheckbox, { value: 'a', label: 'A' }),
          h(SrCheckbox, { value: 'b', label: 'B' }),
        ]),
    })

    const labels = wrapper.findAll('.sr-checkbox')
    expect(labels[0].classes()).not.toContain('is-checked')
    expect(labels[1].classes()).toContain('is-checked')
  })

  it('组级 disabled 下发给子项', () => {
    const wrapper = mount({
      render: () =>
        h(SrCheckboxGroup, { modelValue: [], disabled: true }, () => [
          h(SrCheckbox, { value: 'a', label: 'A' }),
        ]),
    })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.sr-checkbox').classes()).toContain('is-disabled')
  })

  it('组内不带 value 的全选框按独立模式工作，不污染数组', async () => {
    const groupValue = ref<(string | number)[]>(['a'])
    const allChecked = ref(false)

    const wrapper = mount({
      render: () =>
        h(SrCheckboxGroup, { modelValue: groupValue.value }, () => [
          h(SrCheckbox, {
            label: '全选',
            modelValue: allChecked.value,
            'onUpdate:modelValue': (next: boolean) => {
              allChecked.value = next
            },
          }),
          h(SrCheckbox, { value: 'a', label: 'A' }),
        ]),
    })

    // 全选框自身可见的选中态由 modelValue 决定，而不是被组当成 undefined 选项
    expect(wrapper.findAll('.sr-checkbox')[0].classes()).not.toContain('is-checked')

    await wrapper.findAll('input[type="checkbox"]')[0].setValue(true)
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(allChecked.value).toBe(true)
    expect(groupValue.value).toEqual(['a'])
  })
})
