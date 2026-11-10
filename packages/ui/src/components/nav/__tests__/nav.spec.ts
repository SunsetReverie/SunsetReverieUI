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
  it('activeStyle 生成对应类名', () => {
    const pill = mount(SrNav, { props: { items, activeStyle: 'pill' } })
    expect(pill.classes()).toContain('sr-nav--active-pill')
    pill.unmount()

    const bar = mount(SrNav, { props: { items, activeStyle: 'bar' } })
    expect(bar.classes()).toContain('sr-nav--active-bar')
    bar.unmount()
  })

  it('有子项的节点点击展开，不改变选中', async () => {
    const wrapper = mount(SrNav, {
      props: {
        mode: 'vertical',
        modelValue: 'home',
        items: [
          { key: 'home', label: '首页' },
          { key: 'res', label: '资源', children: [{ key: 'file', label: '文件' }] },
        ],
      },
    })

    await wrapper.findAll('.sr-nav__item')[1]?.trigger('click')
    await nextTick()

    expect(wrapper.find('.sr-nav__children').exists()).toBe(true)
    expect(wrapper.find('.sr-nav__item--child').text()).toBe('文件')
    // 父节点只负责展开，不抢选中
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('收起态只留图标，徽标退化成圆点', () => {
    const wrapper = mount(SrNav, {
      props: { items, modelValue: 'home', collapsed: true },
    })

    expect(wrapper.classes()).toContain('is-collapsed')
    expect(wrapper.findAll('.sr-nav__label')).toHaveLength(0)
    expect(wrapper.find('.sr-nav__dot').exists()).toBe(true)
    wrapper.unmount()
  })

  it('分组可折叠，collapsible 为 false 时不可点', async () => {
    const wrapper = mount(SrNav, {
      props: {
        mode: 'vertical',
        items: [
          { group: '基础', key: 'a', label: 'A' },
          { group: '说明', key: 'b', label: 'B', collapsible: false },
        ],
      },
    })

    const groups = wrapper.findAll('.sr-nav__group')
    await groups[0]?.trigger('click')
    await nextTick()
    // 第一组收起后，组内条目隐藏
    expect(wrapper.findAll('.sr-nav__item')).toHaveLength(1)

    expect(groups[1]?.classes()).not.toContain('is-toggle')
    wrapper.unmount()
  })

  it('搜索期间忽略分组折叠，结束后恢复原状态', async () => {
    const wrapper = mount(SrNav, {
      props: {
        mode: 'vertical',
        items: [
          { group: '基础', key: 'a', label: 'A' },
          { group: '基础', key: 'b', label: 'B' },
        ],
      },
    })

    await wrapper.findAll('.sr-nav__group')[0]?.trigger('click')
    expect(wrapper.findAll('.sr-nav__item')).toHaveLength(0)

    await wrapper.setProps({ filterActive: true, items: [{ group: '基础', key: 'b', label: 'B' }] })
    expect(wrapper.findAll('.sr-nav__item')).toHaveLength(1)
    expect(wrapper.findAll('.sr-nav__group')[0]?.attributes('disabled')).toBeDefined()

    await wrapper.setProps({
      filterActive: false,
      items: [
        { group: '基础', key: 'a', label: 'A' },
        { group: '基础', key: 'b', label: 'B' },
      ],
    })
    expect(wrapper.findAll('.sr-nav__item')).toHaveLength(0)
    wrapper.unmount()
  })
  it('收起态不渲染分组标题，避免留下可点的空白', () => {
    const wrapper = mount(SrNav, {
      props: {
        mode: 'vertical',
        collapsed: true,
        items: [
          { group: '工作台', key: 'a', label: 'A' },
          { group: '系统', key: 'b', label: 'B' },
        ],
      },
    })

    // 分组标题按钮在收起态既是空按钮又会占高度，必须整块不渲染
    expect(wrapper.findAll('.sr-nav__group')).toHaveLength(0)
    expect(wrapper.findAll('.sr-nav__item')).toHaveLength(2)
    wrapper.unmount()
  })
  it('品牌区渲染图标与标题', () => {
    const wrapper = mount(SrNav, {
      props: { items, logo: 'lucide:moon-star', title: '夕梦 UI' },
    })

    expect(wrapper.find('.sr-nav__brand').exists()).toBe(true)
    expect(wrapper.find('.sr-nav__brand-title').text()).toBe('夕梦 UI')
    expect(wrapper.find('.sr-nav__brand-mark').exists()).toBe(true)
    wrapper.unmount()
  })

  it('收起态隐藏品牌标题，只留图标', () => {
    const wrapper = mount(SrNav, {
      props: { items, logo: 'lucide:moon-star', title: '夕梦 UI', collapsed: true },
    })

    expect(wrapper.find('.sr-nav__brand-mark').exists()).toBe(true)
    expect(wrapper.find('.sr-nav__brand-title').exists()).toBe(false)
    wrapper.unmount()
  })

  it('未传 logo 与 title 时不渲染品牌区', () => {
    const wrapper = mount(SrNav, { props: { items } })
    expect(wrapper.find('.sr-nav__brand').exists()).toBe(false)
    wrapper.unmount()
  })
})
