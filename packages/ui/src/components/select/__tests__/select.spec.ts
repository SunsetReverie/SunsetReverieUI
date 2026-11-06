import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

import { SrSelect } from '..'

/** 演示选项 */
const options = [
  { value: 'a', label: '苹果' },
  { value: 'b', label: '香蕉' },
  { value: 'c', label: '樱桃', disabled: true },
]

/**
 * 挂载选择器（stub 掉 Teleport，便于原方位断言）
 * @param props 组件 props
 * @returns 包装器
 */
function mountSelect(props: Record<string, unknown> = {}) {
  return mount(SrSelect, {
    props: { options, ...props },
    global: { stubs: { teleport: true } },
    attachTo: document.body,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('SrSelect', () => {
  it('未选中时显示占位文案', () => {
    const wrapper = mountSelect({ placeholder: '请选择水果' })

    expect(wrapper.find('.sr-select__placeholder').text()).toBe('请选择水果')
    expect(wrapper.find('.sr-select__trigger').attributes('role')).toBe('combobox')
    wrapper.unmount()
  })

  it('已选中时显示对应文案', () => {
    const wrapper = mountSelect({ modelValue: 'b' })

    expect(wrapper.find('.sr-select__single').text()).toBe('香蕉')
    wrapper.unmount()
  })

  it('点击触发器展开面板，aria-expanded 同步', async () => {
    const wrapper = mountSelect()

    expect(wrapper.find('.sr-select__trigger').attributes('aria-expanded')).toBe('false')

    await wrapper.find('.sr-select__trigger').trigger('click')

    expect(wrapper.find('.sr-select__trigger').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.sr-select__panel').isVisible()).toBe(true)
    expect(wrapper.emitted('visible-change')?.[0]).toEqual([true])

    wrapper.unmount()
  })

  it('单选：点击选项后派发并关闭面板', async () => {
    const wrapper = mountSelect()
    await wrapper.find('.sr-select__trigger').trigger('click')

    const items = wrapper.findAll('.sr-select__option')
    await items[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['b'])
    expect(wrapper.find('.sr-select__trigger').attributes('aria-expanded')).toBe('false')

    wrapper.unmount()
  })

  it('多选：切换标签且不关闭面板', async () => {
    const value = ref<(string | number)[]>(['a'])

    const wrapper = mount(SrSelect, {
      props: {
        options,
        multiple: true,
        modelValue: value.value,
        // 多选场景运行时只会派发数组，类型上仍需兼容单选与 undefined
        'onUpdate:modelValue': (next: string | number | (string | number)[] | undefined) => {
          value.value = Array.isArray(next) ? next : []
        },
      },
      global: { stubs: { teleport: true } },
      attachTo: document.body,
    })

    await wrapper.find('.sr-select__trigger').trigger('click')
    await wrapper.findAll('.sr-select__option')[1].trigger('click')
    await nextTick()

    expect(value.value).toEqual(['a', 'b'])
    // 面板仍然打开
    expect(wrapper.find('.sr-select__trigger').attributes('aria-expanded')).toBe('true')

    wrapper.unmount()
  })

  it('多选：标签上的关闭按钮可移除单项', async () => {
    const wrapper = mountSelect({ multiple: true, modelValue: ['a', 'b'] })

    // 标签改为复用 SrTag，关闭按钮类名随组件走
    const closeButtons = wrapper.findAll('.sr-tag__close')
    expect(closeButtons).toHaveLength(2)

    await closeButtons[0].trigger('click')
    // 多选时 payload 本身是数组，emitted 记录的是参数列表，因此是 [['b']]
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['b']])

    wrapper.unmount()
  })

  it('禁用选项不可选中', async () => {
    const wrapper = mountSelect()
    await wrapper.find('.sr-select__trigger').trigger('click')

    await wrapper.findAll('.sr-select__option')[2].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('filterable：输入关键字过滤选项', async () => {
    const wrapper = mountSelect({ filterable: true })
    await wrapper.find('.sr-select__trigger').trigger('click')

    const search = wrapper.find('.sr-select__search-input')
    await search.setValue('樱')
    await nextTick()

    const items = wrapper.findAll('.sr-select__option')
    expect(items).toHaveLength(1)
    expect(items[0].text()).toContain('樱桃')
    expect(wrapper.emitted('search')?.at(-1)).toEqual(['樱'])

    wrapper.unmount()
  })

  it('filterable：无匹配时显示空状态', async () => {
    const wrapper = mountSelect({ filterable: true, emptyText: '没有结果' })
    await wrapper.find('.sr-select__trigger').trigger('click')

    await wrapper.find('.sr-select__search-input').setValue('zzz')
    await nextTick()

    expect(wrapper.find('.sr-select__empty').text()).toBe('没有结果')
    wrapper.unmount()
  })

  it('clearable：清空按钮派发空值', async () => {
    const wrapper = mountSelect({ modelValue: 'a', clearable: true })

    await wrapper.find('.sr-select__clear').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([undefined])
    wrapper.unmount()
  })

  it('未选中时不显示清空按钮', () => {
    const wrapper = mountSelect({ clearable: true })
    expect(wrapper.find('.sr-select__clear').exists()).toBe(false)
    wrapper.unmount()
  })

  it('disabled：不响应点击，tabindex 为 -1', async () => {
    const wrapper = mountSelect({ disabled: true })

    expect(wrapper.find('.sr-select__trigger').attributes('tabindex')).toBe('-1')
    expect(wrapper.classes()).toContain('is-disabled')

    await wrapper.find('.sr-select__trigger').trigger('click')
    expect(wrapper.find('.sr-select__trigger').attributes('aria-expanded')).toBe('false')

    wrapper.unmount()
  })

  it('键盘：ArrowDown 打开并把高亮定位到已选项', async () => {
    const wrapper = mountSelect({ modelValue: 'b' })

    await wrapper.find('.sr-select__trigger').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    expect(wrapper.find('.sr-select__trigger').attributes('aria-expanded')).toBe('true')

    const active = wrapper.findAll('.sr-select__option.is-active')
    expect(active).toHaveLength(1)
    expect(active[0].text()).toContain('香蕉')

    wrapper.unmount()
  })

  it('键盘：Enter 选中高亮项', async () => {
    const wrapper = mountSelect()
    const trigger = wrapper.find('.sr-select__trigger')

    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await trigger.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
    wrapper.unmount()
  })

  it('键盘：Esc 关闭面板', async () => {
    const wrapper = mountSelect()
    const trigger = wrapper.find('.sr-select__trigger')

    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await trigger.trigger('keydown', { key: 'Escape' })

    expect(trigger.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('选项带 role="option" 与 aria-selected', async () => {
    const wrapper = mountSelect({ modelValue: 'a' })
    await wrapper.find('.sr-select__trigger').trigger('click')

    const items = wrapper.findAll('.sr-select__option')
    expect(items[0].attributes('role')).toBe('option')
    expect(items[0].attributes('aria-selected')).toBe('true')
    expect(items[1].attributes('aria-selected')).toBe('false')

    wrapper.unmount()
  })

  it('面板通过 aria-controls 与触发器关联', async () => {
    const wrapper = mountSelect()
    await wrapper.find('.sr-select__trigger').trigger('click')

    const controls = wrapper.find('.sr-select__trigger').attributes('aria-controls')
    expect(controls).toBeTruthy()
    expect(wrapper.find('.sr-select__panel').attributes('id')).toBe(controls)

    wrapper.unmount()
  })

  it('点击外部关闭面板', async () => {
    const wrapper = mountSelect()
    await wrapper.find('.sr-select__trigger').trigger('click')

    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()

    expect(wrapper.find('.sr-select__trigger').attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('status 生成对应修饰类', () => {
    const wrapper = mountSelect({ status: 'error' })
    expect(wrapper.classes()).toContain('sr-select--error')
    wrapper.unmount()
  })
})
