import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import SrResult from '../index'

describe('SrResult', () => {
  it('渲染标题与副标题', () => {
    const wrapper = mount(SrResult, {
      props: { title: '提交成功', subTitle: '我们会在 1 个工作日内联系你' },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.sr-result__title').text()).toBe('提交成功')
    expect(wrapper.find('.sr-result__subtitle').text()).toBe('我们会在 1 个工作日内联系你')
    wrapper.unmount()
  })

  it('四种状态生成对应类名', () => {
    for (const status of ['success', 'error', 'warning', 'info'] as const) {
      const wrapper = mount(SrResult, {
        props: { status },
        global: { stubs: { SrIcon: true } },
      })
      expect(wrapper.classes()).toContain(`sr-result--${status}`)
      wrapper.unmount()
    }
  })

  it('默认显示状态图标', () => {
    const wrapper = mount(SrResult, { global: { stubs: { SrIcon: true } } })
    expect(wrapper.find('.sr-result__icon sr-icon-stub').exists()).toBe(true)
    wrapper.unmount()
  })

  it('自定义 icon 覆盖状态图标', () => {
    const wrapper = mount(SrResult, {
      props: { icon: 'lucide:heart' },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.sr-result__icon sr-icon-stub').attributes('name')).toBe('lucide:heart')
    wrapper.unmount()
  })

  it('没有副标题时不渲染', () => {
    const wrapper = mount(SrResult, {
      props: { title: '只有标题' },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.sr-result__subtitle').exists()).toBe(false)
    wrapper.unmount()
  })

  it('compact 生成对应类名', () => {
    const wrapper = mount(SrResult, {
      props: { compact: true },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.classes()).toContain('is-compact')
    wrapper.unmount()
  })

  it('默认插槽渲染额外内容', () => {
    const wrapper = mount(SrResult, {
      props: { title: '详情' },
      slots: { default: () => h('div', { class: 'detail' }, '订单号 20261108001') },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.sr-result__content .detail').text()).toBe('订单号 20261108001')
    wrapper.unmount()
  })

  it('extra 插槽渲染操作区', () => {
    const wrapper = mount(SrResult, {
      props: { title: '完成' },
      slots: { extra: () => h('button', { class: 'act' }, '返回列表') },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.sr-result__extra .act').text()).toBe('返回列表')
    wrapper.unmount()
  })

  it('没有 extra 插槽时不渲染操作区', () => {
    const wrapper = mount(SrResult, {
      props: { title: '完成' },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.sr-result__extra').exists()).toBe(false)
    wrapper.unmount()
  })

  it('icon 插槽可放自定义图标', () => {
    const wrapper = mount(SrResult, {
      slots: { icon: () => h('span', { class: 'custom-icon' }, '✓') },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.custom-icon').text()).toBe('✓')
    wrapper.unmount()
  })

  it('title 插槽可放富内容', () => {
    const wrapper = mount(SrResult, {
      slots: { title: () => h('strong', { class: 'rich' }, '富标题') },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.rich').text()).toBe('富标题')
    wrapper.unmount()
  })

  it('带 role="status"', () => {
    const wrapper = mount(SrResult, {
      props: { title: '完成' },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.attributes('role')).toBe('status')
    wrapper.unmount()
  })
})
