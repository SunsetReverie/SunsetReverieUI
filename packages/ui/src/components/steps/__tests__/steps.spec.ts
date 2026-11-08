import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SrSteps from '../index'

/** 演示步骤 */
const items = [
  { title: '填写信息', description: '基础资料' },
  { title: '上传材料', description: '身份证与照片' },
  { title: '审核', description: '1 个工作日' },
  { title: '完成' },
]

/**
 * 挂载步骤条（stub 掉图标，断言只看结构）
 * @param props 组件 props
 * @returns 包装器
 */
function mountSteps(props: Record<string, unknown> = {}) {
  return mount(SrSteps, {
    props: { items, ...props },
    global: { stubs: { SrIcon: true } },
  })
}

describe('SrSteps', () => {
  it('渲染所有步骤', () => {
    const wrapper = mountSteps()
    expect(wrapper.findAll('.sr-steps__item')).toHaveLength(4)
    wrapper.unmount()
  })

  it('按 current 推导状态', () => {
    const wrapper = mountSteps({ current: 2 })
    const steps = wrapper.findAll('.sr-steps__item')

    expect(steps[0]?.classes()).toContain('is-finish')
    expect(steps[1]?.classes()).toContain('is-finish')
    expect(steps[2]?.classes()).toContain('is-process')
    expect(steps[3]?.classes()).toContain('is-wait')
    wrapper.unmount()
  })

  it('current 为 0 时只有第一步是进行中', () => {
    const wrapper = mountSteps({ current: 0 })
    const steps = wrapper.findAll('.sr-steps__item')

    expect(steps[0]?.classes()).toContain('is-process')
    expect(steps[1]?.classes()).toContain('is-wait')
    wrapper.unmount()
  })

  it('status=error 让当前步变成错误态', () => {
    const wrapper = mountSteps({ current: 1, status: 'error' })
    expect(wrapper.findAll('.sr-steps__item')[1]?.classes()).toContain('is-error')
    wrapper.unmount()
  })

  it('单项 status 覆盖推导结果', () => {
    const wrapper = mount(SrSteps, {
      props: {
        items: [{ title: 'A', status: 'error' }, { title: 'B' }],
        current: 1,
      },
      global: { stubs: { SrIcon: true } },
    })

    // 第 0 步本该是 finish，被显式改成 error
    expect(wrapper.findAll('.sr-steps__item')[0]?.classes()).toContain('is-error')
    wrapper.unmount()
  })

  it('已完成的步骤显示对勾图标', () => {
    const wrapper = mountSteps({ current: 2 })

    // 前两步用 check 图标，第 3 步用序号
    const icons = wrapper.findAll('.sr-steps__marker')
    expect(icons[0]?.find('sr-icon-stub').exists()).toBe(true)
    expect(icons[3]?.text()).toBe('4')
    wrapper.unmount()
  })

  it('未完成的步骤显示序号', () => {
    const wrapper = mountSteps({ current: 0 })
    const markers = wrapper.findAll('.sr-steps__marker')

    expect(markers[0]?.text()).toBe('1')
    expect(markers[3]?.text()).toBe('4')
    wrapper.unmount()
  })

  it('方向生成对应类名', () => {
    const horizontal = mountSteps()
    expect(horizontal.classes()).toContain('sr-steps--horizontal')
    horizontal.unmount()

    const vertical = mountSteps({ direction: 'vertical' })
    expect(vertical.classes()).toContain('sr-steps--vertical')
    vertical.unmount()
  })

  it('labelPlacement 生成对应类名', () => {
    const wrapper = mountSteps({ labelPlacement: 'vertical' })
    expect(wrapper.classes()).toContain('sr-steps--label-vertical')
    wrapper.unmount()
  })

  it('simple 模式不渲染描述', () => {
    const wrapper = mountSteps({ simple: true })

    expect(wrapper.find('.sr-steps__desc').exists()).toBe(false)
    wrapper.unmount()
  })

  it('默认渲染描述', () => {
    const wrapper = mountSteps()
    expect(wrapper.findAll('.sr-steps__desc').length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('clickable 时点击派发 change', async () => {
    const wrapper = mountSteps({ clickable: true, current: 1 })

    await wrapper.findAll('.sr-steps__item')[2]?.trigger('click')

    expect(wrapper.emitted('change')?.[0]).toEqual([2])
    wrapper.unmount()
  })

  it('点击当前步不派发事件', async () => {
    const wrapper = mountSteps({ clickable: true, current: 1 })

    await wrapper.findAll('.sr-steps__item')[1]?.trigger('click')

    expect(wrapper.emitted('change')).toBeUndefined()
    wrapper.unmount()
  })

  it('不可点击时点击无效', async () => {
    const wrapper = mountSteps({ current: 0 })

    await wrapper.findAll('.sr-steps__item')[2]?.trigger('click')

    expect(wrapper.emitted('change')).toBeUndefined()
    wrapper.unmount()
  })

  it('禁用的步骤无法点击', async () => {
    const wrapper = mount(SrSteps, {
      props: {
        items: [{ title: 'A' }, { title: 'B', disabled: true }],
        current: 0,
        clickable: true,
      },
      global: { stubs: { SrIcon: true } },
    })

    await wrapper.findAll('.sr-steps__item')[1]?.trigger('click')

    expect(wrapper.emitted('change')).toBeUndefined()
    wrapper.unmount()
  })

  it('可点击的步骤带 is-clickable 类名', () => {
    const wrapper = mountSteps({ clickable: true })
    expect(wrapper.findAll('.sr-steps__item')[1]?.classes()).toContain('is-clickable')
    wrapper.unmount()
  })

  it('最后一项没有连接线', () => {
    const wrapper = mountSteps()
    const items = wrapper.findAll('.sr-steps__item')

    // 前 3 项有 tail，最后一项没有
    expect(items[0]?.find('.sr-steps__tail').exists()).toBe(true)
    expect(items[3]?.find('.sr-steps__tail').exists()).toBe(false)
    wrapper.unmount()
  })

  it('当前步带 aria-current', () => {
    const wrapper = mountSteps({ current: 1 })
    const items = wrapper.findAll('.sr-steps__item')

    expect(items[1]?.attributes('aria-current')).toBe('step')
    expect(items[0]?.attributes('aria-current')).toBeUndefined()
    wrapper.unmount()
  })

  it('尺寸生成对应类名', () => {
    const wrapper = mountSteps({ size: 'small' })
    expect(wrapper.classes()).toContain('sr-steps--small')
    wrapper.unmount()
  })
})
