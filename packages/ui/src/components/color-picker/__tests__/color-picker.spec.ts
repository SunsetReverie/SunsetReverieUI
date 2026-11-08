import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import SrColorPicker from '../index'

/**
 * 挂载颜色选择器
 * @param props 组件 props
 * @returns 包装器
 */
function mountPicker(props: Record<string, unknown> = {}) {
  return mount(SrColorPicker, {
    props,
    attachTo: document.body,
    global: { stubs: { SrIcon: true } },
  })
}

/**
 * 取面板
 * @returns 面板元素
 */
function panel() {
  return document.querySelector('.sr-color-picker__panel')
}

/**
 * 清掉上一个用例留在 body 上的 Teleport 节点
 *
 * 组件卸载时 Transition 可能还没执行完离场动画，节点会残留到下一个用例，
 * 导致「禁用时不展开」这类断言拿到别人的面板。
 */
function cleanup(): void {
  document.querySelectorAll('.sr-color-picker__panel').forEach((node) => node.remove())
}

describe('SrColorPicker', () => {
  it('无值时显示占位文案', () => {
    cleanup()
    const wrapper = mountPicker({ placeholder: '选个颜色' })

    expect(wrapper.find('.sr-color-picker__value').text()).toBe('选个颜色')
    expect(wrapper.find('.sr-color-picker__value').classes()).toContain('is-placeholder')
    wrapper.unmount()
  })

  it('有值时显示颜色文本与色块', () => {
    cleanup()
    const wrapper = mountPicker({ modelValue: '#3e3edc' })

    expect(wrapper.find('.sr-color-picker__value').text()).toBe('#3e3edc')
    expect(wrapper.find('.sr-color-picker__swatch').attributes('style')).toContain('rgb')
    wrapper.unmount()
  })

  it('点击触发器展开面板', async () => {
    cleanup()
    const wrapper = mountPicker({ modelValue: '#3e3edc' })

    await wrapper.find('.sr-color-picker__trigger').trigger('click')
    await nextTick()
    await nextTick()

    expect(panel()).toBeTruthy()
    expect(wrapper.find('.sr-color-picker').classes()).toContain('is-open')
    wrapper.unmount()
  })

  it('面板包含饱和度区与色相条', async () => {
    cleanup()
    const wrapper = mountPicker({ modelValue: '#3e3edc' })

    await wrapper.find('.sr-color-picker__trigger').trigger('click')
    await nextTick()
    await nextTick()

    expect(document.querySelector('.sr-color-picker__area')).toBeTruthy()
    expect(document.querySelector('.sr-color-picker__hue')).toBeTruthy()
    wrapper.unmount()
  })

  it('从 hex 值反推色相与饱和度', async () => {
    cleanup()
    const wrapper = mountPicker({ modelValue: '#ff0000' })

    await wrapper.find('.sr-color-picker__trigger').trigger('click')
    await nextTick()
    await nextTick()

    // 纯红：色相 0，饱和度 100，亮度 50
    const cursor = document.querySelector('.sr-color-picker__area-cursor') as HTMLElement
    expect(cursor.style.left).toBe('100%')
    expect(cursor.style.top).toBe('50%')
    wrapper.unmount()
  })

  it('点预设色直接提交', async () => {
    cleanup()
    const wrapper = mountPicker({
      modelValue: '#000000',
      presets: ['#ff0000', '#00ff00'],
    })

    await wrapper.find('.sr-color-picker__trigger').trigger('click')
    await nextTick()
    await nextTick()

    const preset = document.querySelectorAll('.sr-color-picker__preset')[0] as HTMLElement
    preset.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['#ff0000'])
    wrapper.unmount()
  })

  it('输出格式跟随 format', async () => {
    cleanup()
    const wrapper = mountPicker({
      modelValue: '#000000',
      format: 'rgb',
      presets: ['#3e3edc'],
    })

    await wrapper.find('.sr-color-picker__trigger').trigger('click')
    await nextTick()
    await nextTick()

    const preset = document.querySelector('.sr-color-picker__preset') as HTMLElement
    preset.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('rgb(62, 62, 220)')
    wrapper.unmount()
  })

  it('hsl 格式输出', async () => {
    cleanup()
    const wrapper = mountPicker({
      modelValue: '#000000',
      format: 'hsl',
      presets: ['#3e3edc'],
    })

    await wrapper.find('.sr-color-picker__trigger').trigger('click')
    await nextTick()
    await nextTick()

    const preset = document.querySelector('.sr-color-picker__preset') as HTMLElement
    preset.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toContain('hsl(')
    wrapper.unmount()
  })

  it('hex 输入框修改颜色', async () => {
    cleanup()
    const wrapper = mountPicker({ modelValue: '#000000' })

    await wrapper.find('.sr-color-picker__trigger').trigger('click')
    await nextTick()
    await nextTick()

    const input = document.querySelector('.sr-color-picker__hex') as HTMLInputElement
    input.value = '#00ff00'
    input.dispatchEvent(new Event('input'))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['#00ff00'])
    wrapper.unmount()
  })

  it('非法 hex 不派发事件', async () => {
    cleanup()
    const wrapper = mountPicker({ modelValue: '#000000' })

    await wrapper.find('.sr-color-picker__trigger').trigger('click')
    await nextTick()
    await nextTick()

    const input = document.querySelector('.sr-color-picker__hex') as HTMLInputElement
    input.value = '#xyz'
    input.dispatchEvent(new Event('input'))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('showAlpha 渲染透明度条', async () => {
    cleanup()
    const wrapper = mountPicker({ modelValue: 'rgba(0, 0, 0, 0.5)', showAlpha: true })

    await wrapper.find('.sr-color-picker__trigger').trigger('click')
    await nextTick()
    await nextTick()

    expect(document.querySelector('.sr-color-picker__alpha')).toBeTruthy()
    wrapper.unmount()
  })

  it('不开 showAlpha 时没有透明度条', async () => {
    cleanup()
    const wrapper = mountPicker({ modelValue: '#000000' })

    await wrapper.find('.sr-color-picker__trigger').trigger('click')
    await nextTick()
    await nextTick()

    expect(document.querySelector('.sr-color-picker__alpha')).toBeNull()
    wrapper.unmount()
  })

  it('清空按钮重置值', async () => {
    cleanup()
    const wrapper = mountPicker({ modelValue: '#3e3edc', clearable: true })

    await wrapper.find('.sr-color-picker__clear').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    wrapper.unmount()
  })

  it('禁用时不展开', async () => {
    cleanup()
    const wrapper = mountPicker({ modelValue: '#3e3edc', disabled: true })

    await wrapper.find('.sr-color-picker__trigger').trigger('click')
    await nextTick()

    expect(panel()).toBeNull()
    wrapper.unmount()
  })

  it('尺寸生成对应类名', () => {
    cleanup()
    const wrapper = mountPicker({ size: 'large' })
    expect(wrapper.find('.sr-color-picker').classes()).toContain('sr-color-picker--large')
    wrapper.unmount()
  })

  it('面板包含预览与输入框', async () => {
    cleanup()
    const wrapper = mountPicker({ modelValue: '#3e3edc' })

    await wrapper.find('.sr-color-picker__trigger').trigger('click')
    await nextTick()
    await nextTick()

    expect(document.querySelector('.sr-color-picker__preview')).toBeTruthy()
    expect(document.querySelector('.sr-color-picker__hex')).toBeTruthy()
    wrapper.unmount()
  })
})
