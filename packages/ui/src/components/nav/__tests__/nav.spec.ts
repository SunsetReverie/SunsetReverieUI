import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { SrNav } from '..'

/** 导航项 */
const items = [
  { key: 'home', label: '首页', icon: 'lucide:house' },
  { key: 'list', label: '列表', badge: 3 },
  { key: 'done', label: '已完成', disabled: true },
]

describe('SrNav', () => {
  it('渲染全部导航项', () => {
    const wrapper = mount(SrNav, { props: { items, modelValue: 'home' } })

    expect(wrapper.findAll('.sr-nav__item')).toHaveLength(3)
    expect(wrapper.find('.sr-nav__icon').exists()).toBe(true)
    expect(wrapper.find('.sr-nav__badge').text()).toBe('3')
    wrapper.unmount()
  })

  it('选中项标记 is-active 与 aria-current', () => {
    const wrapper = mount(SrNav, { props: { items, modelValue: 'list' } })
    const active = wrapper.findAll('.sr-nav__item')[1]

    expect(active?.classes()).toContain('is-active')
    expect(active?.attributes('aria-current')).toBe('page')
    wrapper.unmount()
  })

  it('点击切换并派发事件', async () => {
    const wrapper = mount(SrNav, { props: { items, modelValue: 'home' } })

    await wrapper.findAll('.sr-nav__item')[1]?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['list'])
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('list')
    wrapper.unmount()
  })

  it('禁用项不可选', async () => {
    const wrapper = mount(SrNav, { props: { items, modelValue: 'home' } })

    await wrapper.findAll('.sr-nav__item')[2]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('整表禁用时全部不可点', async () => {
    const wrapper = mount(SrNav, { props: { items, modelValue: 'home', disabled: true } })

    expect(wrapper.classes()).toContain('is-disabled')
    expect(wrapper.findAll('.sr-nav__item')[0]?.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('方向生成对应类名', () => {
    const wrapper = mount(SrNav, { props: { items, mode: 'vertical' } })
    expect(wrapper.classes()).toContain('sr-nav--vertical')
    wrapper.unmount()
  })

  it('分组标题与分割线', () => {
    const wrapper = mount(SrNav, {
      props: {
        mode: 'vertical',
        items: [
          { group: '主菜单', key: 'a', label: 'A' },
          { group: '主菜单', key: 'b', label: 'B' },
          { group: '其它', key: 'c', label: 'C', divider: true },
        ],
      },
    })

    expect(wrapper.findAll('.sr-nav__group')).toHaveLength(2)
    expect(wrapper.findAll('.sr-nav__divider')).toHaveLength(1)
    wrapper.unmount()
  })
})
