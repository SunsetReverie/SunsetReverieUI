import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import SrAlert from '../index'

describe('SrAlert', () => {
  it('渲染标题与描述', () => {
    const wrapper = mount(SrAlert, { props: { title: '提示', description: '这是一段说明' } })

    expect(wrapper.find('.sr-alert__title').text()).toBe('提示')
    expect(wrapper.find('.sr-alert__desc').text()).toBe('这是一段说明')
    wrapper.unmount()
  })

  it('只传描述时不渲染标题', () => {
    const wrapper = mount(SrAlert, { props: { description: '只有描述' } })

    expect(wrapper.find('.sr-alert__title').exists()).toBe(false)
    expect(wrapper.find('.sr-alert__desc').text()).toBe('只有描述')
    wrapper.unmount()
  })

  it('四种类型生成对应类名', () => {
    for (const type of ['info', 'success', 'warning', 'error'] as const) {
      const wrapper = mount(SrAlert, { props: { type } })
      expect(wrapper.classes()).toContain(`sr-alert--${type}`)
      wrapper.unmount()
    }
  })

  it('默认显示图标', () => {
    const wrapper = mount(SrAlert, { global: { stubs: { SrIcon: false } } })
    expect(wrapper.find('.sr-alert__icon').exists()).toBe(true)
    wrapper.unmount()
  })

  it('showIcon 为 false 时不渲染图标', () => {
    const wrapper = mount(SrAlert, { props: { showIcon: false } })
    expect(wrapper.find('.sr-alert__icon').exists()).toBe(false)
    wrapper.unmount()
  })

  it('closable 时点击关闭会隐藏并派发事件', async () => {
    const wrapper = mount(SrAlert, { props: { title: '可关闭', closable: true } })

    await wrapper.find('.sr-alert__close').trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.find('.sr-alert').exists()).toBe(false)
    wrapper.unmount()
  })

  it('不可关闭时没有关闭按钮', () => {
    const wrapper = mount(SrAlert, { props: { title: '常驻' } })
    expect(wrapper.find('.sr-alert__close').exists()).toBe(false)
    wrapper.unmount()
  })

  it('banner 与 center 生成对应类名', () => {
    const wrapper = mount(SrAlert, { props: { banner: true, center: true } })

    expect(wrapper.classes()).toContain('is-banner')
    expect(wrapper.classes()).toContain('is-center')
    wrapper.unmount()
  })

  it('有标题时带 is-titled 类名', () => {
    const withTitle = mount(SrAlert, { props: { title: '有标题' } })
    expect(withTitle.classes()).toContain('is-titled')
    withTitle.unmount()

    const without = mount(SrAlert, { props: { description: '没标题' } })
    expect(without.classes()).not.toContain('is-titled')
    without.unmount()
  })

  it('默认插槽可替代 description', () => {
    const wrapper = mount(SrAlert, {
      slots: { default: () => h('span', { class: 'custom' }, '插槽内容') },
    })

    expect(wrapper.find('.custom').text()).toBe('插槽内容')
    wrapper.unmount()
  })

  it('title 插槽可放富内容', () => {
    const wrapper = mount(SrAlert, {
      slots: { title: () => h('strong', { class: 'rich-title' }, '富标题') },
    })

    expect(wrapper.find('.rich-title').text()).toBe('富标题')
    wrapper.unmount()
  })

  it('带 role="alert" 供读屏识别', () => {
    const wrapper = mount(SrAlert, { props: { title: '注意' } })
    expect(wrapper.attributes('role')).toBe('alert')
    wrapper.unmount()
  })
})
