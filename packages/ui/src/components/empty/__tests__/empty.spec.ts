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

  it('尺寸生成对应类名', () => {
    const wrapper = mount(SrEmpty, { props: { size: 'lg' } })
    expect(wrapper.classes()).toContain('sr-empty--lg')
    wrapper.unmount()
  })
})
