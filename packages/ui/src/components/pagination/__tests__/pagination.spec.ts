import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { SrPagination } from '..'

/**
 * 挂载分页
 * @param props 组件 props
 * @returns 包装器
 */
function mountPagination(props: Record<string, unknown> = {}) {
  return mount(SrPagination, {
    props: { total: 100, pageSize: 10, ...props },
    attachTo: document.body,
  })
}

describe('SrPagination', () => {
  it('渲染总条数与页码', () => {
    const wrapper = mountPagination()

    expect(wrapper.find('.sr-pagination__total').text()).toContain('100')
    expect(wrapper.findAll('.sr-pagination__page').length).toBeGreaterThan(1)
    wrapper.unmount()
  })

  it('总页数超过 7 页时用省略号收拢', () => {
    const wrapper = mountPagination({ total: 500 })

    expect(wrapper.findAll('.sr-pagination__gap').length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('点击页码派发事件', async () => {
    const wrapper = mountPagination()

    // 100 条 / 每页 10 条共 10 页，收敛后页码是 [1, 2, …, 10]
    await wrapper.findAll('.sr-pagination__page')[1]?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(2)
    wrapper.unmount()
  })

  it('首页禁用上一页，末页禁用下一页', () => {
    const first = mountPagination({ modelValue: 1 })
    expect(first.findAll('.sr-pagination__btn')[0]?.attributes('disabled')).toBeDefined()
    expect(first.findAll('.sr-pagination__btn')[1]?.attributes('disabled')).toBeUndefined()
    first.unmount()

    const last = mountPagination({ modelValue: 10 })
    expect(last.findAll('.sr-pagination__btn')[0]?.attributes('disabled')).toBeUndefined()
    expect(last.findAll('.sr-pagination__btn')[1]?.attributes('disabled')).toBeDefined()
    last.unmount()
  })

  it('simple 模式只保留上一页 / 下一页', () => {
    const wrapper = mountPagination({ simple: true })

    expect(wrapper.find('.sr-pagination__simple').exists()).toBe(true)
    expect(wrapper.findAll('.sr-pagination__page')).toHaveLength(0)
    wrapper.unmount()
  })

  it('showTotal 为 false 时不渲染总条数', () => {
    const wrapper = mountPagination({ showTotal: false })
    expect(wrapper.find('.sr-pagination__total').exists()).toBe(false)
    wrapper.unmount()
  })

  it('切换每页条数回到第一页', async () => {
    const wrapper = mountPagination({ modelValue: 5 })

    wrapper.findComponent({ name: 'SrSelect' }).vm.$emit('update:modelValue', 20)
    await nextTick()

    expect(wrapper.emitted('update:pageSize')?.[0]).toEqual([20])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
    wrapper.unmount()
  })

  it('跳页输入回车后翻页', async () => {
    const wrapper = mountPagination({ showJumper: true })

    const input = wrapper.find('.sr-pagination__jumper-input input')
    await input.setValue('4')
    await wrapper.find('.sr-pagination__jumper').trigger('keydown.enter')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([4])
    wrapper.unmount()
  })
})
