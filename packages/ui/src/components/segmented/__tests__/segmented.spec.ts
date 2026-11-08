import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SrSegmented from '../index'

/** 演示选项 */
const options = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
]

/**
 * 挂载分段控制器
 * @param props 组件 props
 * @returns 包装器
 */
function mountSegmented(props: Record<string, unknown> = {}) {
  return mount(SrSegmented, {
    props: { options, ...props },
    global: { stubs: { SrIcon: true } },
  })
}

describe('SrSegmented', () => {
  it('渲染所有选项', () => {
    const wrapper = mountSegmented()
    expect(wrapper.findAll('.sr-segmented__item')).toHaveLength(3)
    wrapper.unmount()
  })

  it('选中项带 is-active', () => {
    const wrapper = mountSegmented({ modelValue: 'week' })
    const buttons = wrapper.findAll('.sr-segmented__item')

    expect(buttons[1]?.classes()).toContain('is-active')
    expect(buttons[0]?.classes()).not.toContain('is-active')
    wrapper.unmount()
  })

  it('点击未选中项派发事件', async () => {
    const wrapper = mountSegmented({ modelValue: 'day' })

    await wrapper.findAll('.sr-segmented__item')[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['month'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['month'])
    wrapper.unmount()
  })

  it('点击已选中项不派发', async () => {
    const wrapper = mountSegmented({ modelValue: 'day' })

    await wrapper.findAll('.sr-segmented__item')[0]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('禁用项点击无效', async () => {
    const wrapper = mountSegmented({
      modelValue: 'day',
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b', disabled: true },
      ],
    })

    await wrapper.findAll('.sr-segmented__item')[1]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('整体禁用时点击无效', async () => {
    const wrapper = mountSegmented({ modelValue: 'day', disabled: true })

    await wrapper.findAll('.sr-segmented__item')[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('滑块按选中下标平移', () => {
    const wrapper = mountSegmented({ modelValue: 'month' })
    const indicator = wrapper.find('.sr-segmented__indicator')

    // 3 个选项、选中第 3 个（index 2）→ 宽度 33.33%、位移 200%
    expect(indicator.attributes('style')).toContain('translateX(200%)')
    expect(indicator.attributes('style')).toContain('33.33')
    wrapper.unmount()
  })

  it('未选中时不渲染滑块', () => {
    const wrapper = mountSegmented()
    expect(wrapper.find('.sr-segmented__indicator').exists()).toBe(false)
    wrapper.unmount()
  })

  it('block 生成对应类名', () => {
    const wrapper = mountSegmented({ block: true })
    expect(wrapper.classes()).toContain('is-block')
    wrapper.unmount()
  })

  it('尺寸生成对应类名', () => {
    const wrapper = mountSegmented({ size: 'large' })
    expect(wrapper.classes()).toContain('sr-segmented--large')
    wrapper.unmount()
  })

  it('选项数量写入 CSS 变量', () => {
    const wrapper = mountSegmented()
    expect(wrapper.attributes('style')).toContain('--sr-segmented-count: 3')
    wrapper.unmount()
  })

  it('图标选项渲染图标', () => {
    const wrapper = mountSegmented({
      options: [{ label: '列表', value: 'list', icon: 'lucide:menu' }],
    })

    expect(wrapper.find('sr-icon-stub').exists()).toBe(true)
    wrapper.unmount()
  })

  it('aria-selected 标记选中项', () => {
    const wrapper = mountSegmented({ modelValue: 'week' })
    const buttons = wrapper.findAll('.sr-segmented__item')

    expect(buttons[1]?.attributes('aria-selected')).toBe('true')
    expect(buttons[0]?.attributes('aria-selected')).toBe('false')
    wrapper.unmount()
  })
})
