import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { SrDropdown } from '..'

/** 菜单项 */
const items = [
  { key: 'edit', label: '编辑' },
  { key: 'copy', label: '复制' },
  { key: 'del', label: '删除', divided: true },
]

/**
 * 挂载下拉
 * @param props 组件 props
 * @returns 包装器
 */
function mountDropdown(props: Record<string, unknown> = {}) {
  return mount(SrDropdown, {
    props: { items, ...props },
    slots: { default: () => '更多' },
    attachTo: document.body,
    global: { stubs: { teleport: true, transition: false } },
  })
}

describe('SrDropdown', () => {
  it('默认收起，点击触发器展开', async () => {
    const wrapper = mountDropdown()

    expect(wrapper.find('.sr-dropdown__panel').exists()).toBe(false)

    await wrapper.find('.sr-dropdown__trigger').trigger('click')
    await nextTick()

    expect(wrapper.find('.sr-dropdown__panel').exists()).toBe(true)
    expect(wrapper.emitted('visible-change')?.[0]).toEqual([true])
    wrapper.unmount()
  })

  it('点击菜单项派发 select 并收起', async () => {
    const wrapper = mountDropdown()

    await wrapper.find('.sr-dropdown__trigger').trigger('click')
    await nextTick()

    await wrapper.findAll('.sr-dropdown__item')[1]?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('copy')
    expect(wrapper.find('.sr-dropdown__panel').exists()).toBe(false)
    wrapper.unmount()
  })

  it('禁用项不可选', async () => {
    const wrapper = mountDropdown({
      items: [{ key: 'a', label: '不可用', disabled: true }],
    })

    await wrapper.find('.sr-dropdown__trigger').trigger('click')
    await nextTick()
    await wrapper.find('.sr-dropdown__item').trigger('click')

    expect(wrapper.emitted('select')).toBeUndefined()
    wrapper.unmount()
  })

  it('divided 渲染分割线，group 渲染分组标题', async () => {
    const wrapper = mountDropdown({
      items: [
        { group: '编辑', key: 'a', label: '重命名' },
        { group: '编辑', key: 'b', label: '移动' },
        { group: '危险', key: 'c', label: '删除', divided: true },
      ],
    })

    await wrapper.find('.sr-dropdown__trigger').trigger('click')
    await nextTick()

    expect(wrapper.findAll('.sr-dropdown__group')).toHaveLength(2)
    expect(wrapper.findAll('.sr-dropdown__divider')).toHaveLength(1)
    wrapper.unmount()
  })

  it('danger 与 selected 生成对应类名', async () => {
    const wrapper = mountDropdown({
      items: [
        { key: 'a', label: '置顶', selected: true },
        { key: 'b', label: '删除', danger: true },
      ],
    })

    await wrapper.find('.sr-dropdown__trigger').trigger('click')
    await nextTick()

    expect(wrapper.find('.sr-dropdown__item.is-danger').exists()).toBe(true)
    expect(wrapper.find('.sr-dropdown__item.is-selected').exists()).toBe(true)
    expect(wrapper.find('.sr-dropdown__check').exists()).toBe(true)
    wrapper.unmount()
  })

  it('size 生成尺寸类名', () => {
    const wrapper = mountDropdown({ size: 'lg' })
    expect(wrapper.classes()).toContain('sr-dropdown--lg')
    wrapper.unmount()
  })

  it('disabled 时不展开', async () => {
    const wrapper = mountDropdown({ disabled: true })

    await wrapper.find('.sr-dropdown__trigger').trigger('click')
    await nextTick()

    expect(wrapper.find('.sr-dropdown__panel').exists()).toBe(false)
    wrapper.unmount()
  })
})
