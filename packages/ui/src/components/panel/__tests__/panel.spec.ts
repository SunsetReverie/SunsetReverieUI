import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { SrPanel } from '..'

describe('SrPanel', () => {
  it('渲染标题、说明与内容', () => {
    const wrapper = mount(SrPanel, {
      props: { title: '基础表格', description: '列配置驱动' },
      slots: { default: () => '正文' },
    })

    expect(wrapper.find('.sr-panel__title').text()).toBe('基础表格')
    expect(wrapper.find('.sr-panel__description').text()).toBe('列配置驱动')
    expect(wrapper.find('.sr-panel__body').text()).toBe('正文')
    wrapper.unmount()
  })

  it('无标题无插槽时不渲染头部', () => {
    const wrapper = mount(SrPanel, { slots: { default: () => 'x' } })
    expect(wrapper.find('.sr-panel__header').exists()).toBe(false)
    wrapper.unmount()
  })

  it('可折叠时点击头部收起并派发事件', async () => {
    const wrapper = mount(SrPanel, { props: { title: '分组', collapsible: true } })

    await wrapper.find('.sr-panel__header').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    expect(wrapper.classes()).toContain('is-collapsed')
    expect(wrapper.find('.sr-panel__body').attributes('style')).toContain('display: none')
    wrapper.unmount()
  })

  it('不可折叠时点击无效', async () => {
    const wrapper = mount(SrPanel, { props: { title: '分组' } })

    await wrapper.find('.sr-panel__header').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('extra 插槽渲染到右侧', () => {
    const wrapper = mount(SrPanel, {
      props: { title: '分组' },
      slots: { extra: () => '更多' },
    })

    expect(wrapper.find('.sr-panel__extra').text()).toContain('更多')
    wrapper.unmount()
  })
})
