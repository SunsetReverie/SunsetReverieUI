import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import SrCascader from '../index'

/** 演示数据：省 / 市 / 区 */
const options = [
  {
    value: 'zj',
    label: '浙江',
    children: [
      {
        value: 'hz',
        label: '杭州',
        children: [
          { value: 'xh', label: '西湖区' },
          { value: 'sc', label: '上城区' },
        ],
      },
      { value: 'nb', label: '宁波', children: [{ value: 'hs', label: '海曙区' }] },
    ],
  },
  {
    value: 'js',
    label: '江苏',
    children: [{ value: 'nj', label: '南京', children: [{ value: 'gl', label: '鼓楼区' }] }],
  },
  { value: 'disabled-province', label: '禁用省', disabled: true },
]

beforeAll(() => {
  // Teleport 到 body，需要把容器高度算出来
  Element.prototype.scrollIntoView = () => {}
})

/**
 * 挂载级联选择
 * @param props 组件 props
 * @returns 包装器
 */
function mountCascader(props: Record<string, unknown> = {}) {
  return mount(SrCascader, {
    props: { options, ...props },
    attachTo: document.body,
    global: { stubs: { SrIcon: true } },
  })
}

/**
 * 取当前面板
 * @returns 面板元素集合
 */
function panel() {
  return document.querySelector('.sr-cascader__panel')
}

describe('SrCascader', () => {
  it('默认显示占位文案', () => {
    const wrapper = mountCascader({ placeholder: '请选择地区' })

    expect(wrapper.find('.sr-cascader__placeholder').text()).toBe('请选择地区')
    wrapper.unmount()
  })

  it('点击触发器展开面板', async () => {
    const wrapper = mountCascader()

    await wrapper.find('.sr-cascader__trigger').trigger('click')
    await nextTick()
    await nextTick()

    expect(panel()).toBeTruthy()
    expect(wrapper.find('.sr-cascader').classes()).toContain('is-open')
    wrapper.unmount()
  })

  it('首列渲染根节点', async () => {
    const wrapper = mountCascader()

    await wrapper.find('.sr-cascader__trigger').trigger('click')
    await nextTick()
    await nextTick()

    const firstColumn = document.querySelectorAll('.sr-cascader__column')[0]
    expect(firstColumn?.querySelectorAll('.sr-cascader__option')).toHaveLength(3)
    wrapper.unmount()
  })

  it('点有子节点的项展开下一列', async () => {
    const wrapper = mountCascader()

    await wrapper.find('.sr-cascader__trigger').trigger('click')
    await nextTick()
    await nextTick()

    const option = document.querySelectorAll('.sr-cascader__option')[0] as HTMLElement
    option.click()
    await nextTick()

    expect(document.querySelectorAll('.sr-cascader__column')).toHaveLength(2)
    wrapper.unmount()
  })

  it('点叶子节点提交路径', async () => {
    const wrapper = mountCascader()

    await wrapper.find('.sr-cascader__trigger').trigger('click')
    await nextTick()
    await nextTick()

    // 浙江 → 杭州 → 西湖区
    ;(document.querySelectorAll('.sr-cascader__option')[0] as HTMLElement).click()
    await nextTick()
    ;(
      document
        .querySelectorAll('.sr-cascader__column')[1]
        ?.querySelectorAll('.sr-cascader__option')[0] as HTMLElement
    ).click()
    await nextTick()
    ;(
      document
        .querySelectorAll('.sr-cascader__column')[2]
        ?.querySelectorAll('.sr-cascader__option')[0] as HTMLElement
    ).click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['zj', 'hz', 'xh']])
    wrapper.unmount()
  })

  it('有值时显示完整路径', () => {
    const wrapper = mountCascader({ modelValue: ['zj', 'hz', 'xh'] })

    expect(wrapper.find('.sr-cascader__values').text()).toBe('浙江 / 杭州 / 西湖区')
    wrapper.unmount()
  })

  it('showAllLevels=false 只显示最后一级', () => {
    const wrapper = mountCascader({ modelValue: ['zj', 'hz', 'xh'], showAllLevels: false })

    expect(wrapper.find('.sr-cascader__values').text()).toBe('西湖区')
    wrapper.unmount()
  })

  it('自定义分隔符', () => {
    const wrapper = mountCascader({ modelValue: ['zj', 'hz'], separator: ' > ' })

    expect(wrapper.find('.sr-cascader__values').text()).toBe('浙江 > 杭州')
    wrapper.unmount()
  })

  it('禁用的选项点不动', async () => {
    const wrapper = mountCascader()

    await wrapper.find('.sr-cascader__trigger').trigger('click')
    await nextTick()
    await nextTick()

    const disabled = document.querySelectorAll('.sr-cascader__option')[2] as HTMLElement
    disabled.click()
    await nextTick()

    // 没有新增列，也没有提交值
    expect(document.querySelectorAll('.sr-cascader__column')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('整体禁用时不展开', async () => {
    const wrapper = mountCascader({ disabled: true })

    await wrapper.find('.sr-cascader__trigger').trigger('click')
    await nextTick()

    expect(panel()).toBeNull()
    wrapper.unmount()
  })

  it('清空按钮重置值', async () => {
    const wrapper = mountCascader({ modelValue: ['zj', 'hz'], clearable: true })

    await wrapper.find('.sr-cascader__clear').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]])
    wrapper.unmount()
  })

  it('多选时渲染标签', () => {
    const wrapper = mountCascader({
      multiple: true,
      modelValue: [
        ['zj', 'hz'],
        ['js', 'nj'],
      ],
    })

    expect(wrapper.findAll('.sr-cascader__tag')).toHaveLength(2)
    wrapper.unmount()
  })

  it('多选时移除标签', async () => {
    const wrapper = mountCascader({
      multiple: true,
      modelValue: [
        ['zj', 'hz'],
        ['js', 'nj'],
      ],
    })

    await wrapper.findAll('.sr-cascader__tag-close')[0]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[['js', 'nj']]])
    wrapper.unmount()
  })

  it('filterable 时显示搜索框', async () => {
    const wrapper = mountCascader({ filterable: true })

    await wrapper.find('.sr-cascader__trigger').trigger('click')
    await nextTick()
    await nextTick()

    expect(document.querySelector('.sr-cascader__search-input')).toBeTruthy()
    wrapper.unmount()
  })

  it('搜索命中叶子节点', async () => {
    const wrapper = mountCascader({ filterable: true })

    await wrapper.find('.sr-cascader__trigger').trigger('click')
    await nextTick()
    await nextTick()

    const input = document.querySelector('.sr-cascader__search-input') as HTMLInputElement
    input.value = '西湖'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    await nextTick()

    const results = document.querySelectorAll('.sr-cascader__result')
    expect(results).toHaveLength(1)
    expect(results[0]?.textContent).toContain('浙江 / 杭州 / 西湖区')
    wrapper.unmount()
  })

  it('搜索无结果时显示空状态', async () => {
    const wrapper = mountCascader({ filterable: true, emptyText: '没找到' })

    await wrapper.find('.sr-cascader__trigger').trigger('click')
    await nextTick()
    await nextTick()

    const input = document.querySelector('.sr-cascader__search-input') as HTMLInputElement
    input.value = '不存在的地方'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    await nextTick()

    expect(document.querySelector('.sr-cascader__empty')?.textContent).toContain('没找到')
    wrapper.unmount()
  })

  it('尺寸生成对应类名', () => {
    const wrapper = mountCascader({ size: 'large' })
    expect(wrapper.find('.sr-cascader').classes()).toContain('sr-cascader--large')
    wrapper.unmount()
  })

  it('校验态生成对应类名', () => {
    const wrapper = mountCascader({ status: 'error' })
    expect(wrapper.find('.sr-cascader').classes()).toContain('sr-cascader--error')
    wrapper.unmount()
  })
})
