import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import { SrTag } from '..'

describe('SrTag', () => {
  it('渲染插槽内容', () => {
    const wrapper = mount(SrTag, { slots: { default: () => '稳定' } })

    expect(wrapper.classes()).toContain('sr-tag')
    expect(wrapper.text()).toBe('稳定')
  })

  it('类型与尺寸生成对应类名', () => {
    const wrapper = mount(SrTag, {
      props: { type: 'success', size: 'sm' },
      slots: { default: () => 'x' },
    })

    expect(wrapper.classes()).toContain('sr-tag--success')
    expect(wrapper.classes()).toContain('sr-tag--sm')
  })

  it('round 生成胶囊类名', () => {
    const wrapper = mount(SrTag, { props: { round: true }, slots: { default: () => 'x' } })
    expect(wrapper.classes()).toContain('is-round')
  })

  it('closable 时渲染关闭按钮并派发 close', async () => {
    const wrapper = mount(SrTag, {
      props: { closable: true },
      slots: { default: () => 'x' },
    })

    const button = wrapper.find('.sr-tag__close')
    expect(button.exists()).toBe(true)

    await button.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('不可关闭时不渲染关闭按钮', () => {
    const wrapper = mount(SrTag, { slots: { default: () => 'x' } })
    expect(wrapper.find('.sr-tag__close').exists()).toBe(false)
  })

  it('关闭按钮点击不冒泡到外层', async () => {
    let outer = 0
    const wrapper = mount({
      render: () =>
        h('div', { class: 'outer', onClick: () => (outer += 1) }, [h(SrTag, { closable: true }, () => 'x')]),
    })

    await wrapper.find('.sr-tag__close').trigger('click')
    expect(outer).toBe(0)
  })
})
