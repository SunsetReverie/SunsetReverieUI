import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'

import { SrModal } from '..'
import { srResetScrollLock } from '../../../utils/scroll-lock'

/**
 * 挂载弹窗并 stub 掉 Teleport，让内容渲染在组件原位便于断言
 * @param props 组件 props
 * @returns 包装器
 */
function mountModal(props: Record<string, unknown> = {}) {
  return mount(SrModal, {
    props: { modelValue: false, ...props },
    slots: { default: () => h('div', { class: 'body-content' }, '内容') },
    global: { stubs: { teleport: true, transition: false } },
    attachTo: document.body,
  })
}

afterEach(() => {
  srResetScrollLock()
  document.body.innerHTML = ''
})

describe('SrModal', () => {
  it('关闭状态下不可见但仍保留 DOM（供过渡使用）', () => {
    const wrapper = mountModal()
    const root = wrapper.find('.sr-modal')

    expect(root.exists()).toBe(true)
    expect(root.isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('打开后可见并挂载内容', async () => {
    const wrapper = mountModal({ modelValue: true })
    await nextTick()

    expect(wrapper.find('.sr-modal').isVisible()).toBe(true)
    expect(wrapper.find('.body-content').exists()).toBe(true)

    wrapper.unmount()
  })

  it('打开时锁定页面滚动，关闭后恢复', async () => {
    const wrapper = mountModal({ modelValue: false })

    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ modelValue: false })
    await nextTick()
    expect(document.body.style.overflow).toBe('')

    wrapper.unmount()
  })

  it('提供 dialog 语义与 aria 属性', async () => {
    const wrapper = mountModal({ modelValue: true, title: '标题' })
    await nextTick()

    const panel = wrapper.find('.sr-modal__panel')
    expect(panel.attributes('role')).toBe('dialog')
    expect(panel.attributes('aria-modal')).toBe('true')

    // aria-labelledby 指向标题元素
    const labelledBy = panel.attributes('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(wrapper.find(`#${labelledBy}`).text()).toBe('标题')

    wrapper.unmount()
  })

  it('Esc 关闭并派发 close 事件', async () => {
    const wrapper = mountModal({ modelValue: true })
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    expect(wrapper.emitted('close')?.[0]).toEqual(['esc'])

    wrapper.unmount()
  })

  it('escToClose 为 false 时 Esc 不关闭', async () => {
    const wrapper = mountModal({ modelValue: true, escToClose: false })
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('点击遮罩关闭，maskClosable 为 false 时不关闭', async () => {
    const closable = mountModal({ modelValue: true })
    await nextTick()
    await closable.find('.sr-modal__mask').trigger('click')
    expect(closable.emitted('close')?.[0]).toEqual(['mask'])
    closable.unmount()

    const locked = mountModal({ modelValue: true, maskClosable: false })
    await nextTick()
    await locked.find('.sr-modal__mask').trigger('click')
    expect(locked.emitted('close')).toBeUndefined()
    locked.unmount()
  })

  it('关闭按钮派发 close-button 原因', async () => {
    const wrapper = mountModal({ modelValue: true })
    await nextTick()

    await wrapper.find('.sr-modal__close').trigger('click')

    expect(wrapper.emitted('close')?.[0]).toEqual(['close-button'])
    wrapper.unmount()
  })

  it('closable 为 false 时不渲染关闭按钮', async () => {
    const wrapper = mountModal({ modelValue: true, closable: false, title: '仅标题' })
    await nextTick()

    expect(wrapper.find('.sr-modal__close').exists()).toBe(false)
    wrapper.unmount()
  })

  it('打开时把焦点移入面板', async () => {
    const wrapper = mountModal({ modelValue: false, title: '标题' })
    await wrapper.setProps({ modelValue: true })
    await nextTick()

    const panel = wrapper.find('.sr-modal__panel').element as HTMLElement
    expect(panel.contains(document.activeElement)).toBe(true)

    wrapper.unmount()
  })

  it('Tab 键在面板内循环', async () => {
    const wrapper = mountModal({ modelValue: true, title: '标题' })
    await nextTick()

    const focusables = wrapper.findAll('.sr-modal__panel button')
    const last = focusables[focusables.length - 1].element as HTMLElement
    last.focus()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    await nextTick()

    // 从最后一个 Tab 应回到第一个
    const first = focusables[0].element as HTMLElement
    expect(document.activeElement).toBe(first)

    wrapper.unmount()
  })

  it('嵌套时 Esc 只关闭最顶层', async () => {
    const outer = mountModal({ modelValue: true, title: '外层' })
    await nextTick()

    const inner = mountModal({ modelValue: true, title: '内层' })
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(inner.emitted('close')).toHaveLength(1)
    expect(outer.emitted('close')).toBeUndefined()

    inner.unmount()
    outer.unmount()
  })

  it('width 支持数字与字符串', async () => {
    const numeric = mountModal({ modelValue: true, width: 520 })
    await nextTick()
    expect(
      (numeric.find('.sr-modal__panel').element as HTMLElement).style.getPropertyValue('--sr-modal-width'),
    ).toBe('520px')
    numeric.unmount()

    const textual = mountModal({ modelValue: true, width: '60%' })
    await nextTick()
    expect(
      (textual.find('.sr-modal__panel').element as HTMLElement).style.getPropertyValue('--sr-modal-width'),
    ).toBe('60%')
    textual.unmount()
  })

  it('footer 插槽存在时才渲染操作区', async () => {
    const withoutFooter = mountModal({ modelValue: true })
    await nextTick()
    expect(withoutFooter.find('.sr-modal__footer').exists()).toBe(false)
    withoutFooter.unmount()

    const withFooter = mount(SrModal, {
      props: { modelValue: true },
      slots: { footer: () => h('button', { class: 'ok' }, '确定') },
      global: { stubs: { teleport: true, transition: false } },
      attachTo: document.body,
    })
    await nextTick()

    expect(withFooter.find('.sr-modal__footer').exists()).toBe(true)
    expect(withFooter.find('.ok').exists()).toBe(true)

    withFooter.unmount()
  })

  it('关闭后焦点归还触发元素', async () => {
    const trigger = document.createElement('button')
    trigger.textContent = '打开'
    document.body.appendChild(trigger)
    trigger.focus()

    const wrapper = mountModal({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
    await nextTick()

    await wrapper.setProps({ modelValue: false })
    await nextTick()

    expect(document.activeElement).toBe(trigger)

    wrapper.unmount()
  })

  it('打开时派发 open，关闭后派发 afterClose', async () => {
    const wrapper = mountModal({ modelValue: false })

    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(wrapper.emitted('open')).toHaveLength(1)

    await wrapper.setProps({ modelValue: false })
    await nextTick()
    expect(wrapper.emitted('afterClose')).toHaveLength(1)

    wrapper.unmount()
  })

  it('组件在打开状态下被销毁时清理滚动锁', async () => {
    const wrapper = mountModal({ modelValue: true })
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('zIndex 依次递增，后打开的在上层', async () => {
    const first = mountModal({ modelValue: true, title: 'A' })
    await nextTick()
    const second = mountModal({ modelValue: true, title: 'B' })
    await nextTick()

    const zOf = (wrapper: ReturnType<typeof mountModal>) =>
      Number((wrapper.find('.sr-modal').element as HTMLElement).style.getPropertyValue('--sr-modal-z'))

    expect(zOf(second)).toBeGreaterThan(zOf(first))

    first.unmount()
    second.unmount()
  })
})
