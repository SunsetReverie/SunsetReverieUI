import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { SrBreadcrumb } from '..'

/** 条目 */
const items = [{ label: '首页', href: '/' }, { label: '组件' }, { label: '表格' }]

describe('SrBreadcrumb', () => {
  it('渲染全部条目与分隔符', () => {
    const wrapper = mount(SrBreadcrumb, { props: { items } })

    expect(wrapper.findAll('.sr-breadcrumb__item')).toHaveLength(3)
    // 三项之间两个分隔符
    expect(wrapper.findAll('.sr-breadcrumb__separator')).toHaveLength(2)
    wrapper.unmount()
  })

  it('末项标记为当前页且不渲染链接', () => {
    const wrapper = mount(SrBreadcrumb, { props: { items } })

    const last = wrapper.findAll('.sr-breadcrumb__item').at(-1)
    expect(last?.classes()).toContain('is-last')
    expect(last?.find('.sr-breadcrumb__link').exists()).toBe(false)
    expect(last?.find('.sr-breadcrumb__text').attributes('aria-current')).toBe('page')
    wrapper.unmount()
  })

  it('非末项有 href 时渲染链接', () => {
    const wrapper = mount(SrBreadcrumb, { props: { items } })
    expect(wrapper.find('.sr-breadcrumb__link').attributes('href')).toBe('/')
    wrapper.unmount()
  })

  it('自定义分隔符', () => {
    const wrapper = mount(SrBreadcrumb, { props: { items, separator: '>' } })
    expect(wrapper.find('.sr-breadcrumb__separator').text()).toBe('>')
    wrapper.unmount()
  })

  it('separatorIcon 用图标替代文字分隔符', () => {
    const wrapper = mount(SrBreadcrumb, {
      props: { items, separatorIcon: 'lucide:chevron-right' },
    })

    const separator = wrapper.find('.sr-breadcrumb__separator')
    expect(separator.find('svg').exists()).toBe(true)
    expect(separator.text()).toBe('')
    wrapper.unmount()
  })

  it('disabled 项不渲染链接', () => {
    const wrapper = mount(SrBreadcrumb, {
      props: {
        items: [
          { label: '首页', href: '/' },
          { label: '已归档', href: '/x', disabled: true },
          { label: '详情' },
        ],
      },
    })

    // 只有首项是链接
    expect(wrapper.findAll('.sr-breadcrumb__link')).toHaveLength(1)
    expect(wrapper.find('.sr-breadcrumb__item.is-disabled').exists()).toBe(true)
    wrapper.unmount()
  })

  it('超过 maxItems 时中间折叠', () => {
    const many = [{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }, { label: 'E' }]
    const wrapper = mount(SrBreadcrumb, { props: { items: many, maxItems: 4 } })

    expect(wrapper.find('.sr-breadcrumb__ellipsis').exists()).toBe(true)
    // 首项 + 省略号 + 末两项
    expect(wrapper.findAll('.sr-breadcrumb__item')).toHaveLength(4)
    wrapper.unmount()
  })
})
