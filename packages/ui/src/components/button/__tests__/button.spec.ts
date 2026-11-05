import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import { SrButton } from '..'
import { SrConfigProvider } from '../../config-provider'

/**
 * 读取元素上的自定义属性
 * @param wrapper 挂载结果
 * @param name 变量名
 * @returns 变量值
 */
function cssVar(wrapper: ReturnType<typeof mount>, name: string): string {
  return (wrapper.element as HTMLElement).style.getPropertyValue(name)
}

describe('SrButton', () => {
  it('渲染原生 button 与基础类名', () => {
    const wrapper = mount(SrButton, { slots: { default: '提交' } })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.classes()).toContain('sr-button')
    expect(wrapper.classes()).toContain('sr-button--secondary')
    expect(wrapper.text()).toBe('提交')
  })

  it('variant 生成对应修饰类', () => {
    const wrapper = mount(SrButton, { props: { variant: 'primary' } })
    expect(wrapper.classes()).toContain('sr-button--primary')
  })

  it('固定 size 只写基础变量', () => {
    const wrapper = mount(SrButton, { props: { size: 'lg' } })
    expect(cssVar(wrapper, '--sr-button-height')).toBe('44px')
    expect(cssVar(wrapper, '--sr-button-height-md')).toBe('')
  })

  it('响应式 size 逐断点写变量', () => {
    const wrapper = mount(SrButton, { props: { size: { xs: 'sm', md: 'lg' } } })
    expect(cssVar(wrapper, '--sr-button-height-xs')).toBe('28px')
    expect(cssVar(wrapper, '--sr-button-height-md')).toBe('44px')
  })

  it('未传 size 时继承 SrConfigProvider', () => {
    const host = defineComponent({
      render: () => h(SrConfigProvider, { size: 'xs' }, () => h(SrButton, null, () => 'btn')),
    })

    const wrapper = mount(host)
    const button = wrapper.find('.sr-button')

    expect((button.element as HTMLElement).style.getPropertyValue('--sr-button-height')).toBe('24px')
  })

  it('disabled 使用原生 disabled 并标记 aria', () => {
    const wrapper = mount(SrButton, { props: { disabled: true } })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.classes()).toContain('is-disabled')
  })

  it('loading 时禁用交互并标记 aria-busy', () => {
    const wrapper = mount(SrButton, { props: { loading: true } })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('.sr-button__spinner').exists()).toBe(true)
    expect(wrapper.classes()).toContain('is-loading')
  })

  it('disabled 时点击不触发', async () => {
    const onClick = vi.fn()
    const wrapper = mount(SrButton, { props: { disabled: true }, attrs: { onClick } })

    await wrapper.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('block 与 round 生成对应状态类', () => {
    const wrapper = mount(SrButton, { props: { block: true, round: true } })
    expect(wrapper.classes()).toContain('is-block')
    expect(wrapper.classes()).toContain('is-round')
  })

  it('htmlType 落到原生 type 属性', () => {
    const wrapper = mount(SrButton, { props: { htmlType: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('外部 class 与内部 class 合并，原生属性透传', () => {
    const wrapper = mount(SrButton, { attrs: { class: 'my-cta', 'data-test': 'btn' } })

    expect(wrapper.classes()).toContain('my-cta')
    expect(wrapper.classes()).toContain('sr-button')
    expect(wrapper.attributes('data-test')).toBe('btn')
  })

  it('icon 渲染为图标容器', () => {
    const wrapper = mount(SrButton, { props: { icon: 'mdi:check' } })
    expect(wrapper.find('.sr-button__icon').exists()).toBe(true)
  })
})
