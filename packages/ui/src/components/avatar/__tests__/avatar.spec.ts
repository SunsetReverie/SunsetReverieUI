import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { SrAvatar } from '..'

describe('SrAvatar', () => {
  it('无图时显示名称前两个字符', () => {
    const wrapper = mount(SrAvatar, { props: { alt: '林深' } })
    expect(wrapper.text()).toBe('林深')
    wrapper.unmount()
  })

  it('有图时渲染 img', () => {
    const wrapper = mount(SrAvatar, { props: { src: '/a.png', alt: '林深' } })
    expect(wrapper.find('.sr-avatar__image').attributes('src')).toBe('/a.png')
    wrapper.unmount()
  })

  it('图片加载失败回退到文字', async () => {
    const wrapper = mount(SrAvatar, { props: { src: '/broken.png', alt: '周夏' } })

    await wrapper.find('.sr-avatar__image').trigger('error')

    expect(wrapper.find('.sr-avatar__image').exists()).toBe(false)
    expect(wrapper.text()).toBe('周夏')
    wrapper.unmount()
  })

  it('icon 优先于文字', () => {
    const wrapper = mount(SrAvatar, { props: { alt: '林深', icon: 'lucide:user' } })
    expect(wrapper.find('.sr-avatar__icon').exists()).toBe(true)
    wrapper.unmount()
  })

  it('尺寸与形状生成类名', () => {
    const wrapper = mount(SrAvatar, { props: { size: 'lg', shape: 'square' } })
    expect(wrapper.classes()).toContain('sr-avatar--lg')
    expect(wrapper.classes()).toContain('is-square')
    wrapper.unmount()
  })

  it('数字尺寸走内联变量', () => {
    const wrapper = mount(SrAvatar, { props: { size: 48 } })
    expect(wrapper.attributes('style')).toContain('--sr-avatar-size: 48px')
    wrapper.unmount()
  })
})
