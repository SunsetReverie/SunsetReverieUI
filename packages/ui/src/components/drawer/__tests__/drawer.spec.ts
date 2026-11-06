import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { SrDrawer } from '..'

/**
 * 挂载抽屉
 * @param props 组件 props
 * @returns 包装器
 */
function mountDrawer(props: Record<string, unknown> = {}) {
  return mount(SrDrawer, {
    props: { modelValue: true, ...props },
    slots: { default: () => '抽屉内容' },
    attachTo: document.body,
    global: { stubs: { teleport: true, transition: false } },
  })
}

describe('SrDrawer', () => {
  it('打开时渲染面板与内容', () => {
    const wrapper = mountDrawer({ title: '筛选条件' })

    expect(wrapper.find('.sr-drawer').exists()).toBe(true)
    expect(wrapper.find('.sr-drawer__title').text()).toBe('筛选条件')
    expect(wrapper.text()).toContain('抽屉内容')
    wrapper.unmount()
  })

  it('关闭时不渲染面板', () => {
    const wrapper = mountDrawer({ modelValue: false })
    expect(wrapper.find('.sr-drawer').exists()).toBe(false)
    wrapper.unmount()
  })

  it('方向生成对应类名', () => {
    const wrapper = mountDrawer({ placement: 'left' })
    expect(wrapper.find('.sr-drawer').classes()).toContain('is-left')
    wrapper.unmount()
  })

  it('点击关闭按钮派发事件', async () => {
    // 关闭按钮在头部内，需要 title 或 header 插槽才会渲染
    const wrapper = mountDrawer({ title: '筛选条件' })

    await wrapper.find('.sr-drawer__close').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    expect(wrapper.emitted('close')?.[0]).toEqual(['close'])
    wrapper.unmount()
  })

  it('点击遮罩关闭，maskClosable 为 false 时不关闭', async () => {
    const wrapper = mountDrawer()
    await wrapper.find('.sr-drawer__mask').trigger('click')
    expect(wrapper.emitted('close')?.[0]).toEqual(['mask'])
    wrapper.unmount()

    const keep = mountDrawer({ maskClosable: false })
    await keep.find('.sr-drawer__mask').trigger('click')
    expect(keep.emitted('close')).toBeUndefined()
    keep.unmount()
  })

  it('数字尺寸转为 px 并落在正确轴上', () => {
    const right = mountDrawer({ size: 480 })
    expect(right.find('.sr-drawer').attributes('style')).toContain('width: 480px')
    right.unmount()

    const top = mountDrawer({ placement: 'top', size: 260 })
    expect(top.find('.sr-drawer').attributes('style')).toContain('height: 260px')
    top.unmount()
  })

  it('size 预设映射到对应像素', () => {
    const sm = mountDrawer({ size: 'sm' })
    expect(sm.find('.sr-drawer').attributes('style')).toContain('width: 320px')
    sm.unmount()

    const lg = mountDrawer({ size: 'lg' })
    expect(lg.find('.sr-drawer').attributes('style')).toContain('width: 600px')
    lg.unmount()
  })

  it('zIndex 同时作用到面板与遮罩', () => {
    const wrapper = mountDrawer({ zIndex: 2400 })
    const style = wrapper.find('.sr-drawer').attributes('style') ?? ''

    expect(style).toContain('z-index: 2400')
    // 遮罩用变量，比面板低一层
    expect(style).toContain('--sr-drawer-z: 2399')
    wrapper.unmount()
  })

  it('closable 为 false 时不渲染关闭按钮', () => {
    const wrapper = mountDrawer({ title: '详情', closable: false })
    expect(wrapper.find('.sr-drawer__close').exists()).toBe(false)
    wrapper.unmount()
  })

  it('打开时派发 visible-change', async () => {
    const wrapper = mountDrawer({ modelValue: false })

    await wrapper.setProps({ modelValue: true })
    await nextTick()

    expect(wrapper.emitted('visible-change')).toBeTruthy()
    wrapper.unmount()
  })
})
