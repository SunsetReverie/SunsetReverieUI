import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import SrMusicPlayer from '../index'
import { isInteractiveTarget } from '../src/interaction'

vi.mock('../src/api', () => ({
  buildMusicApiUrl: () => '',
  extractTrackId: () => '',
  fetchMusicTracks: vi.fn(async () => [
    { name: '测试曲目', artist: '测试歌手', url: 'https://example.com/1.mp3', pic: '', lrc: '' },
  ]),
  fetchMusicLyric: vi.fn(async () => ''),
}))

beforeAll(() => {
  // jsdom 的 HTMLMediaElement.play/pause 是「未实现」，点播放按钮会抛错
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
})

/** 清掉 Teleport 到 body 的面板，避免用例互相污染 */
afterEach(() => {
  document.querySelectorAll('.sr-music, .sr-music__mini').forEach((node) => node.remove())
})

/**
 * 挂载吸附模式并唤出精简卡片
 * @returns 精简卡片元素
 */
async function openCompactCard(): Promise<HTMLElement> {
  mount(SrMusicPlayer, {
    props: { mode: 'attach', id: '123', showLyrics: false, showPlaylist: false },
    attachTo: document.body,
    global: {
      stubs: {
        SrIcon: true,
        SrTooltip: { template: '<span><slot /></span>' },
      },
    },
  })

  await flushPromises()

  const mini = document.querySelector('.sr-music__mini')
  expect(mini).not.toBeNull()
  mini?.dispatchEvent(new MouseEvent('mouseenter'))
  await nextTick()

  const card = document.querySelector('.sr-music.is-compact-card')
  expect(card).not.toBeNull()
  return card as HTMLElement
}

describe('isInteractiveTarget', () => {
  it('按钮及按钮内部元素都算控件', () => {
    const button = document.createElement('button')
    const icon = document.createElement('span')
    button.append(icon)
    document.body.append(button)

    expect(isInteractiveTarget(button)).toBe(true)
    expect(isInteractiveTarget(icon)).toBe(true)

    button.remove()
  })

  it('进度条 input 与自定义 slider 算控件，普通文字不算', () => {
    const input = document.createElement('input')
    input.type = 'range'
    const slider = document.createElement('div')
    slider.setAttribute('role', 'slider')
    const text = document.createElement('p')

    expect(isInteractiveTarget(input)).toBe(true)
    expect(isInteractiveTarget(slider)).toBe(true)
    expect(isInteractiveTarget(text)).toBe(false)
  })

  it('null 与文本节点按非控件处理', () => {
    expect(isInteractiveTarget(null)).toBe(false)
    expect(isInteractiveTarget(document.createTextNode('歌名'))).toBe(false)
  })
})

describe('attach 精简卡片点击', () => {
  it('点歌名等非控件区域铺开完整面板', async () => {
    const card = await openCompactCard()

    card.querySelector('.sr-music__name')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(document.querySelector('.sr-music.is-compact-card')).toBeNull()
    expect(document.querySelector('.sr-music')).not.toBeNull()
  })

  it('点封面区域同样展开', async () => {
    const card = await openCompactCard()

    card.querySelector('.sr-music__head')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(document.querySelector('.sr-music.is-compact-card')).toBeNull()
  })

  it('点播放按钮保持精简卡片，不误触展开', async () => {
    const card = await openCompactCard()

    card.querySelector('.sr-music__btn--main')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(document.querySelector('.sr-music.is-compact-card')).not.toBeNull()
  })

  it('点进度条保持精简卡片', async () => {
    const card = await openCompactCard()

    card.querySelector('.sr-music__range')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(document.querySelector('.sr-music.is-compact-card')).not.toBeNull()
  })

  it('右上角展开图标仍然保留且可用', async () => {
    const card = await openCompactCard()
    const expand = card.querySelector('[aria-label="展开完整播放器"]')

    expect(expand).not.toBeNull()
    expand?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(document.querySelector('.sr-music.is-compact-card')).toBeNull()
  })

  it('完整面板上的点击不会重复触发展开逻辑', async () => {
    const card = await openCompactCard()
    card.querySelector('.sr-music__name')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    const panel = document.querySelector('.sr-music') as HTMLElement
    panel.querySelector('.sr-music__name')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(document.querySelector('.sr-music.is-compact-card')).toBeNull()
    expect(document.querySelector('.sr-music__volume')).not.toBeNull()
  })
})
