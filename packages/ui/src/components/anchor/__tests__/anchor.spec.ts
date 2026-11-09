import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import SrAnchor, { type SrAnchorItem } from '../index'

/** 基础数据：两级 */
const items: SrAnchorItem[] = [
  { key: 'intro', title: '介绍' },
  {
    key: 'usage',
    title: '用法',
    children: [
      { key: 'install', title: '安装' },
      { key: 'config', title: '配置' },
    ],
  },
  { key: 'faq', title: '常见问题' },
]

/**
 * 给元素一个假的矩形
 * @param el 元素
 * @param top 顶部坐标
 * @param height 高度
 */
function stubRect(el: HTMLElement, top: number, height = 40): void {
  el.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + height,
      height,
      left: 0,
      right: 0,
      width: 200,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect
}

/**
 * 在页面里造出锚点目标
 * @param tops 各 id 的顶部坐标
 */
function mountTargets(tops: Record<string, number>): void {
  for (const [id, top] of Object.entries(tops)) {
    const el = document.createElement('section')
    el.id = id
    document.body.appendChild(el)
    stubRect(el, top)
  }
}

/**
 * 设置 window 的滚动位置
 * @param y 距离
 */
function setScrollY(y: number): void {
  Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true })
}

/**
 * 等一帧 rAF
 */
async function nextFrame(): Promise<void> {
  await new Promise((resolve) => requestAnimationFrame(resolve))
  await nextTick()
}

/**
 * 挂载锚点
 * @param props 组件 props
 * @returns 包装器
 */
function mountAnchor(props: Record<string, unknown> = {}) {
  return mount(SrAnchor, {
    props: { items, ...props },
    attachTo: document.body,
  })
}

beforeEach(() => {
  setScrollY(0)
  vi.stubGlobal('scrollTo', vi.fn())
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('SrAnchor', () => {
  it('渲染所有锚点（含子项）', () => {
    const wrapper = mountAnchor()
    expect(wrapper.findAll('.sr-anchor__link')).toHaveLength(5)
    wrapper.unmount()
  })

  it('递归渲染任意层级', () => {
    const deep: SrAnchorItem[] = [
      {
        key: 'a',
        title: '一级',
        children: [{ key: 'b', title: '二级', children: [{ key: 'c', title: '三级' }] }],
      },
    ]
    const wrapper = mount(SrAnchor, { props: { items: deep } })

    expect(wrapper.findAll('.sr-anchor__link')).toHaveLength(3)
    expect(wrapper.text()).toContain('三级')
    wrapper.unmount()
  })

  it('链接 href 默认指向 #key', () => {
    const wrapper = mountAnchor()
    expect(wrapper.findAll('.sr-anchor__link')[0]?.attributes('href')).toBe('#intro')
    wrapper.unmount()
  })

  it('自定义 href 时保留原值', () => {
    const wrapper = mount(SrAnchor, {
      props: { items: [{ key: 'x', title: '外链', href: 'https://example.com' }] },
    })

    expect(wrapper.find('.sr-anchor__link').attributes('href')).toBe('https://example.com')
    wrapper.unmount()
  })

  it('点击时阻止默认并滚动', async () => {
    mountTargets({ intro: 500 })
    const wrapper = mountAnchor()
    await nextTick()

    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    wrapper.findAll('.sr-anchor__link')[0]?.element.dispatchEvent(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(window.scrollTo).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('点击自定义 href 的项不阻止默认', () => {
    const wrapper = mount(SrAnchor, {
      props: { items: [{ key: 'x', title: '外链', href: 'https://example.com' }] },
    })

    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    wrapper.find('.sr-anchor__link').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.emitted('click')).toBeTruthy()
    wrapper.unmount()
  })

  it('点击后派发 click 事件', async () => {
    mountTargets({ intro: 500 })
    const wrapper = mountAnchor()
    await nextTick()

    await wrapper.findAll('.sr-anchor__link')[0]?.trigger('click')

    expect(wrapper.emitted('click')?.[0]?.[0]).toBe('intro')
    wrapper.unmount()
  })

  it('affix 加吸顶类名与偏移', () => {
    const wrapper = mountAnchor({ affix: true, affixOffset: 64 })

    expect(wrapper.classes()).toContain('is-affix')
    expect(wrapper.attributes('style')).toContain('64px')
    wrapper.unmount()
  })

  it('direction 生成类名', () => {
    const wrapper = mountAnchor({ direction: 'horizontal' })
    expect(wrapper.classes()).toContain('sr-anchor--horizontal')
    wrapper.unmount()
  })

  it('showMarker 控制滑块', () => {
    const withMarker = mountAnchor()
    expect(withMarker.find('.sr-anchor__marker').exists()).toBe(true)
    withMarker.unmount()

    const without = mountAnchor({ showMarker: false })
    expect(without.find('.sr-anchor__marker').exists()).toBe(false)
    without.unmount()
  })

  it('滚动时更新激活项', async () => {
    mountTargets({ intro: 0, usage: 600, faq: 1200 })
    const wrapper = mountAnchor()
    await nextTick()
    await nextTick()

    setScrollY(700)
    window.dispatchEvent(new Event('scroll'))
    await nextFrame()

    expect(wrapper.emitted('update:activeKey')?.at(-1)).toEqual(['usage'])
    wrapper.unmount()
  })

  it('offsetTop 参与判定', async () => {
    mountTargets({ intro: 0, usage: 600, faq: 1200 })
    const wrapper = mountAnchor({ offsetTop: 100 })
    await nextTick()
    await nextTick()

    // 滚动 550 + 偏移 100 = 判定线 650，已越过 usage
    setScrollY(550)
    window.dispatchEvent(new Event('scroll'))
    await nextFrame()

    expect(wrapper.emitted('update:activeKey')?.at(-1)).toEqual(['usage'])
    wrapper.unmount()
  })

  it('受控 activeKey 时以外部为准', async () => {
    mountTargets({ intro: 0, usage: 600, faq: 1200 })
    const wrapper = mountAnchor({ activeKey: 'intro' })
    await nextTick()
    await nextTick()

    setScrollY(700)
    window.dispatchEvent(new Event('scroll'))
    await nextFrame()

    expect(wrapper.find('[aria-current="location"]').text()).toBe('介绍')
    wrapper.unmount()
  })

  it('激活子项时父级也高亮', async () => {
    const wrapper = mountAnchor({ activeKey: 'install' })
    await nextTick()

    const activeTexts = wrapper
      .findAll('.sr-anchor__item.is-active > .sr-anchor__row > .sr-anchor__link')
      .map((el) => el.text())

    expect(activeTexts).toContain('用法')
    expect(activeTexts).toContain('安装')
    wrapper.unmount()
  })

  it('syncHash 写入地址栏', async () => {
    mountTargets({ intro: 500 })
    const wrapper = mountAnchor({ syncHash: true })
    await nextTick()

    await wrapper.findAll('.sr-anchor__link')[0]?.trigger('click')

    expect(window.location.hash).toBe('#intro')
    wrapper.unmount()
  })

  it('导航区域带无障碍标签', () => {
    const wrapper = mountAnchor({ ariaLabel: '目录' })

    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('目录')
    wrapper.unmount()
  })

  it('activeVariant 生成对应类名', () => {
    for (const variant of ['background', 'bar', 'pill', 'bold', 'dot'] as const) {
      const wrapper = mountAnchor({ activeVariant: variant })
      expect(wrapper.classes(), variant).toContain(`sr-anchor--active-${variant}`)
      wrapper.unmount()
    }
  })

  it('maxDepth 限制渲染层级', () => {
    const deep: SrAnchorItem[] = [
      {
        key: 'a',
        title: '一级',
        children: [{ key: 'b', title: '二级', children: [{ key: 'c', title: '三级' }] }],
      },
    ]

    const all = mount(SrAnchor, { props: { items: deep } })
    expect(all.findAll('.sr-anchor__link')).toHaveLength(3)
    all.unmount()

    const two = mount(SrAnchor, { props: { items: deep, maxDepth: 2 } })
    expect(two.findAll('.sr-anchor__link')).toHaveLength(2)
    expect(two.text()).not.toContain('三级')
    two.unmount()

    const one = mount(SrAnchor, { props: { items: deep, maxDepth: 1 } })
    expect(one.findAll('.sr-anchor__link')).toHaveLength(1)
    one.unmount()
  })

  it('collapsible 为父级渲染折叠箭头', () => {
    const wrapper = mountAnchor({ collapsible: true })

    // 只有带子项的「用法」有箭头
    expect(wrapper.findAll('.sr-anchor__toggle')).toHaveLength(1)
    wrapper.unmount()
  })

  it('不传 collapsible 时没有箭头', () => {
    const wrapper = mountAnchor()
    expect(wrapper.findAll('.sr-anchor__toggle')).toHaveLength(0)
    wrapper.unmount()
  })

  it('默认全部展开', () => {
    const wrapper = mountAnchor({ collapsible: true })

    const toggle = wrapper.find('.sr-anchor__toggle')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })

  it('点击箭头可折叠子级', async () => {
    const wrapper = mountAnchor({ collapsible: true })

    await wrapper.find('.sr-anchor__toggle').trigger('click')
    await nextTick()

    expect(wrapper.find('.sr-anchor__toggle').attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['usage', false])
    expect(wrapper.emitted('update:expandedKeys')).toBeTruthy()
    wrapper.unmount()
  })

  it('defaultExpandAll 为 false 时初始收起', () => {
    const wrapper = mountAnchor({ collapsible: true, defaultExpandAll: false })

    expect(wrapper.find('.sr-anchor__toggle').attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('子项激活时自动展开父级', async () => {
    const wrapper = mountAnchor({
      collapsible: true,
      defaultExpandAll: false,
      activeKey: 'install',
    })

    await nextTick()
    await nextTick()

    expect(wrapper.find('.sr-anchor__toggle').attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })

  it('autoExpand 为 false 时不自动展开', async () => {
    const wrapper = mountAnchor({
      collapsible: true,
      defaultExpandAll: false,
      autoExpand: false,
      activeKey: 'install',
    })

    await nextTick()
    await nextTick()

    expect(wrapper.find('.sr-anchor__toggle').attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('受控 expandedKeys 时以外部为准', async () => {
    const wrapper = mountAnchor({ collapsible: true, expandedKeys: [] })

    expect(wrapper.find('.sr-anchor__toggle').attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('activate 子项时自动展开父级', async () => {
    const wrapper = mountAnchor({
      collapsible: true,
      defaultExpandAll: false,
      activeKey: 'intro',
    })
    await nextTick()
    await nextTick()
    expect(wrapper.find('.sr-anchor__toggle').attributes('aria-expanded')).toBe('false')

    await wrapper.setProps({ activeKey: 'install' })
    await nextTick()
    await nextTick()
    expect(wrapper.find('.sr-anchor__toggle').attributes('aria-expanded')).toBe('true')

    wrapper.unmount()
  })

  it('离开该章节后不会自动折叠', async () => {
    const wrapper = mountAnchor({
      collapsible: true,
      defaultExpandAll: false,
      activeKey: 'install',
    })
    await nextTick()
    await nextTick()
    expect(wrapper.find('.sr-anchor__toggle').attributes('aria-expanded')).toBe('true')

    // 切到一个完全无关的顶层项，父级应保持展开
    await wrapper.setProps({ activeKey: 'faq' })
    await nextTick()
    await nextTick()
    expect(wrapper.find('.sr-anchor__toggle').attributes('aria-expanded')).toBe('true')

    wrapper.unmount()
  })

  it('手动折叠后仍是展开状态，直到用户再点一次', async () => {
    const wrapper = mountAnchor({
      collapsible: true,
      defaultExpandAll: false,
      activeKey: 'install',
    })
    await nextTick()
    await nextTick()

    // 手动收起
    await wrapper.find('.sr-anchor__toggle').trigger('click')
    await nextTick()
    expect(wrapper.find('.sr-anchor__toggle').attributes('aria-expanded')).toBe('false')

    // 再切子项，会被自动展开（这是预期：只展开不折叠）
    await wrapper.setProps({ activeKey: 'config' })
    await nextTick()
    await nextTick()
    expect(wrapper.find('.sr-anchor__toggle').attributes('aria-expanded')).toBe('true')

    wrapper.unmount()
  })

  it('不同父级互不影响', async () => {
    const twoBranches: SrAnchorItem[] = [
      { key: 'p1', title: '父一', children: [{ key: 'c1', title: '子一' }] },
      { key: 'p2', title: '父二', children: [{ key: 'c2', title: '子二' }] },
    ]

    const wrapper = mount(SrAnchor, {
      props: {
        items: twoBranches,
        collapsible: true,
        defaultExpandAll: false,
        activeKey: 'c1',
      },
    })
    await nextTick()
    await nextTick()

    let toggles = wrapper.findAll('.sr-anchor__toggle')
    expect(toggles[0]?.attributes('aria-expanded')).toBe('true')
    expect(toggles[1]?.attributes('aria-expanded')).toBe('false')

    await wrapper.setProps({ activeKey: 'c2' })
    await nextTick()
    await nextTick()

    toggles = wrapper.findAll('.sr-anchor__toggle')
    expect(toggles[0]?.attributes('aria-expanded')).toBe('true')
    expect(toggles[1]?.attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })

  it('当前项带 aria-current', async () => {
    const wrapper = mountAnchor({ activeKey: 'faq' })
    await nextTick()

    const current = wrapper.findAll('[aria-current="location"]')
    expect(current).toHaveLength(1)
    expect(current[0]?.text()).toBe('常见问题')
    wrapper.unmount()
  })
})
