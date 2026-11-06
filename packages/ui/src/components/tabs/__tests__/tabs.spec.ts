import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { SrTabs } from '..'

/** 标签配置 */
const items = [
  { key: 'a', label: '概览' },
  { key: 'b', label: '配置' },
  { key: 'c', label: '日志', disabled: true },
]

describe('SrTabs', () => {
  it('渲染标签与面板', () => {
    const wrapper = mount(SrTabs, {
      props: { items, modelValue: 'a' },
      slots: { 'panel-a': () => 'A 内容' },
    })

    expect(wrapper.findAll('.sr-tabs__tab')).toHaveLength(3)
    expect(wrapper.findAll('.sr-tabs__panel')).toHaveLength(3)
    expect(wrapper.text()).toContain('A 内容')
    wrapper.unmount()
  })

  it('点击切换并派发事件', async () => {
    const wrapper = mount(SrTabs, { props: { items, modelValue: 'a' } })

    await wrapper.findAll('.sr-tabs__tab')[1]?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['b'])
    wrapper.unmount()
  })

  it('禁用标签不可切换', async () => {
    const wrapper = mount(SrTabs, { props: { items, modelValue: 'a' } })

    await wrapper.findAll('.sr-tabs__tab')[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('tab-click')).toBeUndefined()
    wrapper.unmount()
  })

  it('aria 角色与选中态正确', () => {
    const wrapper = mount(SrTabs, { props: { items, modelValue: 'b' } })

    expect(wrapper.find('.sr-tabs__nav').attributes('role')).toBe('tablist')
    const tabs = wrapper.findAll('.sr-tabs__tab')
    expect(tabs[1]?.attributes('aria-selected')).toBe('true')
    expect(tabs[1]?.classes()).toContain('is-active')
    wrapper.unmount()
  })

  it('可关闭时渲染关闭按钮并派发 close', async () => {
    const wrapper = mount(SrTabs, { props: { items, modelValue: 'a', closable: true } })

    const closeButtons = wrapper.findAll('.sr-tabs__close')
    expect(closeButtons).toHaveLength(3)

    await closeButtons[0]?.trigger('click')
    expect(wrapper.emitted('close')?.[0]).toEqual(['a'])
    wrapper.unmount()
  })

  it('lazy 模式下未激活面板不渲染内容', async () => {
    const wrapper = mount(SrTabs, {
      props: { items, modelValue: 'a', lazy: true },
      slots: { 'panel-b': () => 'B 内容' },
    })

    expect(wrapper.text()).not.toContain('B 内容')

    await wrapper.setProps({ modelValue: 'b' })
    await nextTick()
    expect(wrapper.text()).toContain('B 内容')
    wrapper.unmount()
  })
})
