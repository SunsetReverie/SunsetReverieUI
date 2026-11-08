import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SrTile from '../index'

describe('SrTile', () => {
  it('渲染图标与标题', () => {
    const wrapper = mount(SrTile, {
      props: { icon: 'lucide:heart', title: '收藏' },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.sr-tile__icon').exists()).toBe(true)
    expect(wrapper.find('.sr-tile__title').text()).toBe('收藏')
    wrapper.unmount()
  })

  it('渲染描述', () => {
    const wrapper = mount(SrTile, { props: { title: '标题', description: '补充说明' } })
    expect(wrapper.find('.sr-tile__desc').text()).toBe('补充说明')
    wrapper.unmount()
  })

  it('点击派发事件', async () => {
    const wrapper = mount(SrTile, { props: { title: 'A' } })
    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    wrapper.unmount()
  })

  it('禁用时不派发', async () => {
    const wrapper = mount(SrTile, { props: { title: 'A', disabled: true } })
    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeUndefined()
    expect(wrapper.classes()).toContain('is-disabled')
    wrapper.unmount()
  })

  it('选中态', () => {
    const wrapper = mount(SrTile, { props: { title: 'A', active: true } })

    expect(wrapper.classes()).toContain('is-active')
    expect(wrapper.attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('.sr-tile__check').exists()).toBe(true)
    wrapper.unmount()
  })

  it('语义色生成对应类名', () => {
    for (const type of ['primary', 'success', 'warning', 'error'] as const) {
      const wrapper = mount(SrTile, { props: { title: 'A', type } })
      expect(wrapper.classes()).toContain(`sr-tile--${type}`)
      wrapper.unmount()
    }
  })

  it('尺寸生成对应类名', () => {
    const wrapper = mount(SrTile, { props: { size: 'lg' } })
    expect(wrapper.classes()).toContain('sr-tile--lg')
    wrapper.unmount()
  })

  it('横向布局类名', () => {
    const wrapper = mount(SrTile, { props: { horizontal: true } })
    expect(wrapper.classes()).toContain('is-horizontal')
    wrapper.unmount()
  })

  it('图标插槽覆盖 icon 属性', () => {
    const wrapper = mount(SrTile, {
      props: { icon: 'lucide:heart' },
      slots: { icon: '<span class="custom">★</span>' },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.custom').text()).toBe('★')
    wrapper.unmount()
  })
})
