import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'

import { SrForm, SrFormItem, type SrFormRule } from '..'
import { SrInput } from '../../input'

/**
 * 构造一个带输入框的表单
 * @param rules 字段规则
 * @param initial 初始值
 * @returns 包装器与数据对象
 */
function mountForm(
  rules: Record<string, SrFormRule | SrFormRule[]> = {},
  initial: Record<string, unknown> = { name: '' },
) {
  const model = reactive<Record<string, unknown>>({ ...initial })

  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(SrForm, { model, rules }, () => [
            h(SrFormItem, { prop: 'name', label: '用户名' }, () =>
              h(SrInput, {
                modelValue: model.name as string,
                'onUpdate:modelValue': (value: string | number) => {
                  model.name = value
                },
              }),
            ),
          ])
      },
    }),
    { attachTo: document.body },
  )

  return { wrapper, model }
}

describe('SrForm / SrFormItem', () => {
  it('hideRequiredMark 在根元素上加类名', () => {
    const wrapper = mount(SrForm, { props: { model: {}, hideRequiredMark: true } })
    expect(wrapper.classes()).toContain('is-hide-required-mark')
    wrapper.unmount()
  })

  it('默认不加隐藏类名', () => {
    const wrapper = mount(SrForm, { props: { model: {} } })
    expect(wrapper.classes()).not.toContain('is-hide-required-mark')
    wrapper.unmount()
  })

  it('渲染标签与必填星号', () => {
    const { wrapper } = mountForm({ name: { required: true } })

    expect(wrapper.find('.sr-form-item__label').text()).toBe('用户名')
    expect(wrapper.find('.sr-form-item').classes()).toContain('is-required')

    wrapper.unmount()
  })

  it('required 为空时在失焦后报错', async () => {
    const { wrapper } = mountForm({ name: { required: true, message: '用户名不能为空' } })

    expect(wrapper.find('.sr-form-item__error').exists()).toBe(false)

    await wrapper.find('input').trigger('blur')
    await flushPromises()
    await nextTick()

    expect(wrapper.find('.sr-form-item__error').text()).toBe('用户名不能为空')
    expect(wrapper.find('.sr-form-item').classes()).toContain('is-error')

    wrapper.unmount()
  })

  it('错误文案出现后，改正即消失（错误态实时校验）', async () => {
    const { wrapper, model } = mountForm({ name: { required: true } })

    await wrapper.find('input').trigger('blur')
    await flushPromises()
    expect(wrapper.find('.sr-form-item__error').exists()).toBe(true)

    model.name = '夕梦'
    await nextTick()
    // 触发一次输入，让表单项重新校验
    await wrapper.find('input').setValue('夕梦')
    await flushPromises()

    expect(wrapper.find('.sr-form-item__error').exists()).toBe(false)

    wrapper.unmount()
  })

  it('pattern 规则生效', async () => {
    const { wrapper } = mountForm({
      name: { pattern: /^[a-z]+$/, message: '只能是小写字母' },
    })

    await wrapper.find('input').setValue('ABC')
    await wrapper.find('input').trigger('blur')
    await flushPromises()

    expect(wrapper.find('.sr-form-item__error').text()).toBe('只能是小写字母')

    wrapper.unmount()
  })

  it('min / max 对字符串长度生效', async () => {
    const { wrapper } = mountForm({
      name: { min: 3, max: 5, message: '长度需在 3-5 之间' },
    })

    await wrapper.find('input').setValue('ab')
    await wrapper.find('input').trigger('blur')
    await flushPromises()
    expect(wrapper.find('.sr-form-item__error').text()).toBe('长度需在 3-5 之间')

    await wrapper.find('input').setValue('abcd')
    await flushPromises()
    expect(wrapper.find('.sr-form-item__error').exists()).toBe(false)

    wrapper.unmount()
  })

  it('自定义校验支持返回字符串与 Promise', async () => {
    const { wrapper } = mountForm({
      name: {
        validator: async (value: unknown) => {
          await Promise.resolve()
          return value === 'admin' ? '该用户名已被占用' : true
        },
      },
    })

    await wrapper.find('input').setValue('admin')
    await wrapper.find('input').trigger('blur')
    await flushPromises()

    expect(wrapper.find('.sr-form-item__error').text()).toBe('该用户名已被占用')

    wrapper.unmount()
  })

  it('输入框自动获得 aria-labelledby / aria-describedby / aria-invalid', async () => {
    const { wrapper } = mountForm({ name: { required: true } })

    const labelId = wrapper.find('.sr-form-item__label').attributes('id')
    expect(wrapper.find('input').attributes('aria-labelledby')).toBe(labelId)

    await wrapper.find('input').trigger('blur')
    await flushPromises()
    await nextTick()

    const input = wrapper.find('input')
    const messageId = wrapper.find('.sr-form-item__error').attributes('id')

    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(messageId)

    wrapper.unmount()
  })

  it('form.validate() 汇总全部字段，不短路', async () => {
    const model = reactive<Record<string, unknown>>({ a: '', b: '' })
    const formRef = ref<InstanceType<typeof SrForm> | null>(null)

    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              SrForm,
              {
                ref: formRef,
                model,
                rules: {
                  a: { required: true, message: 'A 必填' },
                  b: { required: true, message: 'B 必填' },
                },
              },
              () => [
                h(SrFormItem, { prop: 'a', label: 'A' }, () => h(SrInput, { modelValue: '' })),
                h(SrFormItem, { prop: 'b', label: 'B' }, () => h(SrInput, { modelValue: '' })),
              ],
            )
        },
      }),
      { attachTo: document.body },
    )

    const valid = await formRef.value?.validate()

    expect(valid).toBe(false)
    // 两个字段同时暴露错误，而不是只报第一个
    const errors = wrapper.findAll('.sr-form-item__error').map((node) => node.text())
    expect(errors).toEqual(['A 必填', 'B 必填'])

    wrapper.unmount()
  })

  it('showMessage 关闭时只变边框不给文案', async () => {
    const model = reactive<Record<string, unknown>>({ name: '' })

    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(SrForm, { model, rules: { name: { required: true } }, showMessage: false }, () => [
              h(SrFormItem, { prop: 'name', label: '用户名' }, () => h(SrInput, { modelValue: '' })),
            ])
        },
      }),
      { attachTo: document.body },
    )

    await wrapper.find('input').trigger('blur')
    await flushPromises()

    expect(wrapper.find('.sr-form-item__error').exists()).toBe(false)
    expect(wrapper.find('.sr-input').classes()).toContain('sr-input--error')

    wrapper.unmount()
  })

  it('字段级规则优先于表单级', async () => {
    const model = reactive<Record<string, unknown>>({ name: '' })

    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(SrForm, { model, rules: { name: { required: true, message: '表单级文案' } } }, () => [
              h(
                SrFormItem,
                { prop: 'name', label: '用户名', rules: { required: true, message: '字段级文案' } },
                () => h(SrInput, { modelValue: '' }),
              ),
            ])
        },
      }),
      { attachTo: document.body },
    )

    await wrapper.find('input').trigger('blur')
    await flushPromises()

    expect(wrapper.find('.sr-form-item__error').text()).toBe('字段级文案')

    wrapper.unmount()
  })

  it('labelPosition=left 时生成对应类名与标签宽度变量', () => {
    const model = reactive<Record<string, unknown>>({ name: '' })

    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(SrForm, { model, labelPosition: 'left', labelWidth: 120 }, () => [
              h(SrFormItem, { prop: 'name', label: '用户名' }, () => h(SrInput, {})),
            ])
        },
      }),
      { attachTo: document.body },
    )

    expect(wrapper.find('form').classes()).toContain('sr-form--label-left')
    expect(
      (wrapper.find('form').element as HTMLElement).style.getPropertyValue('--sr-form-label-width'),
    ).toBe('120px')

    wrapper.unmount()
  })
})
