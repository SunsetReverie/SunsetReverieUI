import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { SrConfigProvider } from '..'

/**
 * 构造一个读取当前配置的探针组件
 * @returns 组件定义
 */
function createProbe() {
  return defineComponent({
    name: 'ConfigProbe',
    setup() {
      const config = useSrConfig()
      return () => h('span', { class: 'probe' }, `${config.value.size}/${config.value.zIndex}`)
    },
  })
}

describe('SrConfigProvider', () => {
  it('无 provider 时回落到默认配置', () => {
    const wrapper = mount(createProbe())
    expect(wrapper.text()).toBe('md/1000')
  })

  it('下发 size 与 zIndex', () => {
    const Probe = createProbe()
    const wrapper = mount(
      defineComponent({
        render: () => h(SrConfigProvider, { size: 'sm', zIndex: 2000 }, () => h(Probe)),
      }),
    )

    expect(wrapper.find('.probe').text()).toBe('sm/2000')
  })

  it('嵌套 provider 逐层继承并覆盖', () => {
    const Probe = createProbe()

    const wrapper = mount(
      defineComponent({
        render: () =>
          h(SrConfigProvider, { size: 'lg' }, () => [
            h(SrConfigProvider, { size: 'xs' }, () => h(Probe)),
            h(SrConfigProvider, { zIndex: 3000 }, () => h(Probe)),
          ]),
      }),
    )

    const probes = wrapper.findAll('.probe')
    // 内层只覆盖 size，zIndex 从外层继承
    expect(probes[0].text()).toBe('xs/1000')
    // 内层只覆盖 zIndex，size 从外层继承
    expect(probes[1].text()).toBe('lg/3000')
  })

  it('不渲染额外 DOM，只透传插槽', () => {
    const wrapper = mount(
      defineComponent({
        render: () => h(SrConfigProvider, { size: 'sm' }, () => h('div', { class: 'child' }, '内容')),
      }),
    )

    expect(wrapper.find('.child').exists()).toBe(true)
    expect(wrapper.html()).not.toContain('sr-config-provider')
  })
})
