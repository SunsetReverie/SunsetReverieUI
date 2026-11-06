import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import { SrCard } from '..'

describe('SrCard', () => {
  it('渲染默认插槽内容', () => {
    const wrapper = mount(SrCard, { slots: { default: () => '正文' } })
    expect(wrapper.find('.sr-card__body').text()).toBe('正文')
    wrapper.unmount()
  })

  it('有标题时渲染头部', () => {
    const wrapper = mount(SrCard, { props: { title: '组件概览', subtitle: '近 7 天' } })

    expect(wrapper.find('.sr-card__title').text()).toBe('组件概览')
    expect(wrapper.find('.sr-card__subtitle').text()).toBe('近 7 天')
    wrapper.unmount()
  })

  it('无标题且无 header 插槽时不渲染头部', () => {
    const wrapper = mount(SrCard, { slots: { default: () => '正文' } })
    expect(wrapper.find('.sr-card__header').exists()).toBe(false)
    wrapper.unmount()
  })

  it('footer 插槽存在时才渲染底部', () => {
    const plain = mount(SrCard, { slots: { default: () => 'x' } })
    expect(plain.find('.sr-card__footer').exists()).toBe(false)
    plain.unmount()

    const withFooter = mount(SrCard, {
      slots: { default: () => 'x', footer: () => h('button', '确定') },
    })
    expect(withFooter.find('.sr-card__footer').text()).toBe('确定')
    withFooter.unmount()
  })

  it('bordered / hoverable 生成类名', () => {
    const wrapper = mount(SrCard, { props: { bordered: false, hoverable: true } })
    expect(wrapper.classes()).not.toContain('is-bordered')
    expect(wrapper.classes()).toContain('is-hoverable')
    wrapper.unmount()
  })
})
