import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { SrSwitch } from '..'

describe('SrSwitch', () => {
  it('用 button + role="switch" 承载，自带键盘支持', () => {
    const wrapper = mount(SrSwitch)

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('role')).toBe('switch')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('aria-checked 跟随状态', async () => {
    const wrapper = mount(SrSwitch, { props: { modelValue: false } })
    expect(wrapper.attributes('aria-checked')).toBe('false')

    await wrapper.setProps({ modelValue: true })
    expect(wrapper.attributes('aria-checked')).toBe('true')
  })

  it('点击切换并派发事件', async () => {
    const wrapper = mount(SrSwitch, { props: { modelValue: false } })

    await wrapper.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    expect(wrapper.emitted('change')?.[0]).toEqual([true])
  })

  it('禁用时原生 disabled 生效，点击不派发', async () => {
    const wrapper = mount(SrSwitch, { props: { disabled: true } })

    expect(wrapper.attributes('disabled')).toBeDefined()
    await wrapper.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('加载中同样禁止交互并显示指示器', () => {
    const wrapper = mount(SrSwitch, { props: { loading: true } })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('is-loading')
    expect(wrapper.find('.sr-spinner').exists()).toBe(true)
  })

  it('文字随状态切换', async () => {
    const wrapper = mount(SrSwitch, {
      props: { modelValue: false, checkedText: '开', uncheckedText: '关' },
    })

    expect(wrapper.text()).toContain('关')

    await wrapper.setProps({ modelValue: true })
    expect(wrapper.text()).toContain('开')
  })

  it('无文字时可用 label 提供无障碍名称', () => {
    const wrapper = mount(SrSwitch, { props: { label: '启用通知' } })
    expect(wrapper.attributes('aria-label')).toBe('启用通知')
  })

  it('尺寸生成修饰类', () => {
    const wrapper = mount(SrSwitch, { props: { size: 'sm' } })
    expect(wrapper.classes()).toContain('sr-switch--sm')
  })
})
