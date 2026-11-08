import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import SrContextMenu from '../index'

// jsdom 没有 PointerEvent
class FakePointerEvent extends MouseEvent {
  pointerType: string

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.pointerType = init.pointerType ?? 'mouse'
  }
}

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).PointerEvent = FakePointerEvent
})

/** 菜单项 */
const items = [
  { key: 'copy', label: '复制', icon: 'lucide:copy' },
  { key: 'paste', label: '粘贴', disabled: true },
  { key: 'remove', label: '删除', danger: true, divider: true },
]

/**
 * 挂载右键菜单
 * @param props 组件 props
 * @returns 包装器
 */
function mountMenu(props: Record<string, unknown> = {}) {
  return mount(SrContextMenu, {
    props: { items, ...props },
    slots: { default: '<div class="area">右键区域</div>' },
    attachTo: document.body,
    global: { stubs: { SrIcon: true } },
  })
}

/**
 * 取菜单面板
 * @returns 面板元素
 */
function panel(): HTMLElement | null {
  return document.querySelector('.sr-context-menu__panel')
}

/** 清掉上个用例残留的面板 */
function cleanup(): void {
  document.querySelectorAll('.sr-context-menu__panel').forEach((node) => node.remove())
}

/**
 * 触发右键
 * @param wrapper 包装器
 * @param x 横坐标
 * @param y 纵坐标
 * @returns 事件对象
 */
function fire(wrapper: ReturnType<typeof mountMenu>, x = 10, y = 10): MouseEvent {
  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  })
  wrapper.find('.area').element.dispatchEvent(event)
  return event
}

describe('SrContextMenu', () => {
  it('渲染包裹内容', () => {
    const wrapper = mountMenu()
    expect(wrapper.find('.area').text()).toBe('右键区域')
    wrapper.unmount()
  })

  it('右键打开菜单并阻止默认', async () => {
    cleanup()
    const wrapper = mountMenu()

    const event = fire(wrapper, 120, 80)
    await nextTick()
    await nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(panel()).not.toBeNull()
    wrapper.unmount()
  })

  it('渲染菜单项与分割线', async () => {
    cleanup()
    const wrapper = mountMenu()

    fire(wrapper)
    await nextTick()
    await nextTick()

    expect(document.querySelectorAll('.sr-context-menu__item')).toHaveLength(3)
    expect(document.querySelector('.sr-context-menu__divider')).not.toBeNull()
    wrapper.unmount()
  })

  it('点击菜单项派发 select 并关闭', async () => {
    cleanup()
    const wrapper = mountMenu()

    fire(wrapper)
    await nextTick()
    await nextTick()

    ;(document.querySelectorAll('.sr-context-menu__item')[0] as HTMLElement).click()
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('copy')
    expect(panel()).toBeNull()
    wrapper.unmount()
  })

  it('禁用的项不派发', async () => {
    cleanup()
    const wrapper = mountMenu()

    fire(wrapper)
    await nextTick()
    await nextTick()

    ;(document.querySelectorAll('.sr-context-menu__item')[1] as HTMLElement).click()
    await nextTick()

    expect(wrapper.emitted('select')).toBeUndefined()
    wrapper.unmount()
  })

  it('危险项带 is-danger', async () => {
    cleanup()
    const wrapper = mountMenu()

    fire(wrapper)
    await nextTick()
    await nextTick()

    const last = document.querySelectorAll('.sr-context-menu__item')[2] as HTMLElement
    expect(last.className).toContain('is-danger')
    wrapper.unmount()
  })

  it('整体禁用时不打开但仍阻止默认菜单', async () => {
    cleanup()
    const wrapper = mountMenu({ disabled: true })

    const event = fire(wrapper)
    await nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(panel()).toBeNull()
    wrapper.unmount()
  })

  it('Esc 关闭', async () => {
    cleanup()
    const wrapper = mountMenu()

    fire(wrapper)
    await nextTick()
    await nextTick()
    expect(panel()).not.toBeNull()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    await nextTick()

    expect(panel()).toBeNull()
    wrapper.unmount()
  })

  it('点外部关闭', async () => {
    cleanup()
    const wrapper = mountMenu()

    fire(wrapper)
    await nextTick()
    await nextTick()

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await nextTick()
    await nextTick()

    expect(panel()).toBeNull()
    wrapper.unmount()
  })

  it('没有菜单项时不打开', async () => {
    cleanup()
    const wrapper = mountMenu({ items: [] })

    fire(wrapper)
    await nextTick()

    expect(panel()).toBeNull()
    wrapper.unmount()
  })
})
