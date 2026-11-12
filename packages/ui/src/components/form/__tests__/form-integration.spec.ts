import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, reactive, type Component } from 'vue'

import SrCheckbox from '../../checkbox/src/checkbox.vue'
import SrDatePicker from '../../date-picker/src/date-picker.vue'
import SrInputNumber from '../../input-number/src/input-number.vue'
import SrRadio from '../../radio/src/radio.vue'
import SrSwitch from '../../switch/src/switch.vue'
import SrFormItem from '../src/form-item.vue'
import SrForm from '../src/form.vue'

/**
 * 把一个控件包进表单里
 *
 * 规则用「永远失败」的 validator：只要控件上报了 notify，
 * 就一定会出现错误文案，据此判断集成是否成立。
 * @param control 控件组件
 * @param prop 字段名
 * @returns 挂载结果
 */
function mountInForm(
  control: Component,
  prop: string,
  initial: unknown = false,
  extraProps: Record<string, unknown> = {},
) {
  // 初值不能为空：runRule 遇到空值会直接判定通过、跳过 validator
  const model = reactive<Record<string, unknown>>({ [prop]: initial })

  // 返回字符串表示失败（返回 true 才算通过）
  const rules = {
    [prop]: [{ validator: () => '上报后就会失败', trigger: 'change' as const }],
  }

  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(SrForm, { model, rules }, () => [
            h(SrFormItem, { label: '字段', prop }, () =>
              h(control, { modelValue: model[prop], ...extraProps }),
            ),
          ])
      },
    }),
    { attachTo: document.body, global: { stubs: { SrIcon: true } } },
  )

  return wrapper
}

describe('表单与控件的校验集成', () => {
  it('SrSwitch 切换后触发校验', async () => {
    const wrapper = mountInForm(SrSwitch, 'agree')

    expect(wrapper.find('.sr-form-item__error').exists()).toBe(false)

    await wrapper.find('.sr-switch').trigger('click')
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(wrapper.find('.sr-form-item__error').text()).toContain('上报后就会失败')
    wrapper.unmount()
  })

  it('SrCheckbox 勾选后触发校验', async () => {
    const wrapper = mountInForm(SrCheckbox, 'accept')

    expect(wrapper.find('.sr-form-item__error').exists()).toBe(false)

    await wrapper.find('input[type="checkbox"]').trigger('change')
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(wrapper.find('.sr-form-item__error').text()).toContain('上报后就会失败')
    wrapper.unmount()
  })

  it('SrRadio 选中后触发校验', async () => {
    const wrapper = mountInForm(SrRadio, 'choice', 'a', { value: 'a' })

    expect(wrapper.find('.sr-form-item__error').exists()).toBe(false)

    await wrapper.find('input[type="radio"]').trigger('change')
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(wrapper.find('.sr-form-item__error').text()).toContain('上报后就会失败')
    wrapper.unmount()
  })

  it('SrInputNumber 改值后触发校验', async () => {
    const wrapper = mountInForm(SrInputNumber, 'count', 1)

    expect(wrapper.find('.sr-form-item__error').exists()).toBe(false)

    const input = wrapper.find('input')
    await input.setValue('12')
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(wrapper.find('.sr-form-item__error').text()).toContain('上报后就会失败')
    wrapper.unmount()
  })

  it('SrInput 输入后触发校验（对照组）', async () => {
    const wrapper = mountInForm(
      defineComponent({
        props: { modelValue: { type: String, default: '' } },
        emits: ['update:modelValue'],
        setup() {
          return () => h('input', { class: 'fake-input', value: '' })
        },
      }),
      'name',
    )

    // 假控件不上报，错误不会出现——说明上面的用例确实是靠 notify 触发的
    await wrapper.find('.fake-input').trigger('input')
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(wrapper.find('.sr-form-item__error').exists()).toBe(false)
    wrapper.unmount()
  })

  it('控件在表单外不报错', () => {
    const wrapper = mount(SrSwitch, { props: { modelValue: false } })

    expect(wrapper.find('.sr-switch').exists()).toBe(true)
    wrapper.unmount()
  })

  it('SrDatePicker 在表单内能正常挂载', () => {
    const wrapper = mountInForm(SrDatePicker, 'day', new Date(2026, 10, 8))

    expect(wrapper.find('.sr-date-picker').exists()).toBe(true)
    wrapper.unmount()
  })
})
