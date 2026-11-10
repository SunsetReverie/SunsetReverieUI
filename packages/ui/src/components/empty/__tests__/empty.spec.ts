import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import { SrEmpty } from '..'

describe('SrEmpty', () => {
  it('渲染默认描述与图标', () => {
    const wrapper = mount(SrEmpty)

    expect(wrapper.text()).toContain('暂无数据')
    expect(wrapper.find('.sr-empty__icon').exists()).toBe(true)
    wrapper.unmount()
  })

  it('icon 传空串时不渲染图标', () => {
    const wrapper = mount(SrEmpty, { props: { icon: '' } })
    expect(wrapper.find('.sr-empty__icon').exists()).toBe(false)
    wrapper.unmount()
  })

  it('默认插槽覆盖描述', () => {
    const wrapper = mount(SrEmpty, { slots: { default: () => '没有匹配的组件' } })
    expect(wrapper.text()).toContain('没有匹配的组件')
    expect(wrapper.text()).not.toContain('暂无数据')
    wrapper.unmount()
  })

  it('action 插槽渲染操作区', () => {
    const wrapper = mount(SrEmpty, {
      slots: { action: () => h('button', '新建') },
    })

    expect(wrapper.find('.sr-empty__action').text()).toBe('新建')
    wrapper.unmount()
  })

  it('bordered 生成虚线框类名', () => {
    const wrapper = mount(SrEmpty, { props: { bordered: true } })
    expect(wrapper.classes()).toContain('is-bordered')
    wrapper.unmount()
  })

  it('image 优先于图标', () => {
    const wrapper = mount(SrEmpty, { props: { image: '/empty.png' } })

    expect(wrapper.find('.sr-empty__image').attributes('src')).toBe('/empty.png')
    expect(wrapper.find('.sr-empty__icon').exists()).toBe(false)
    wrapper.unmount()
  })

  it('尺寸生成对应类名', () => {
    const wrapper = mount(SrEmpty, { props: { size: 'lg' } })
    expect(wrapper.classes()).toContain('sr-empty--lg')
    wrapper.unmount()
  })

  it('type 预设决定默认文案', () => {
    const wrapper = mount(SrEmpty, { props: { type: 'search' } })
    expect(wrapper.text()).toContain('没有找到匹配的结果')
    wrapper.unmount()
  })

  it('显式 description 覆盖预设文案', () => {
    const wrapper = mount(SrEmpty, { props: { type: 'data', description: '还没有组件' } })
    expect(wrapper.text()).toContain('还没有组件')
    expect(wrapper.text()).not.toContain('还没有创建任何内容')
    wrapper.unmount()
  })

  it('错误场景走 danger 色调', () => {
    const wrapper = mount(SrEmpty, { props: { type: 'error' } })
    expect(wrapper.classes()).toContain('is-tone-danger')
    wrapper.unmount()
  })

  it('网络与权限场景走 warning 色调', () => {
    const network = mount(SrEmpty, { props: { type: 'network' } })
    expect(network.classes()).toContain('is-tone-warning')

    const permission = mount(SrEmpty, { props: { type: 'permission' } })
    expect(permission.classes()).toContain('is-tone-warning')

    network.unmount()
    permission.unmount()
  })

  it('icon 覆盖预设图标', () => {
    const wrapper = mount(SrEmpty, { props: { type: 'search', icon: 'lucide:heart' } })
    expect(wrapper.find('.sr-empty__icon').exists()).toBe(true)
    wrapper.unmount()
  })
})
