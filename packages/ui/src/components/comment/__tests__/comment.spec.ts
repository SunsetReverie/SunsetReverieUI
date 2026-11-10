import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SrComment from '../index'
import { srFormatDateTime, srFormatRelativeTime, srToTimestamp } from '../src/format'

import type { SrCommentData } from '../src/types'

/** 固定参照时刻，避免测试随时间漂移 */
const NOW = new Date('2026-11-10T12:00:00').getTime()

/** 一分钟 */
const MINUTE = 60 * 1000

/** 一条最小评论 */
function makeComment(overrides: Partial<SrCommentData> = {}): SrCommentData {
  return {
    id: 1,
    author: { id: 'u1', name: '苏晚' },
    content: '你好',
    createdAt: NOW,
    ...overrides,
  }
}

/**
 * 挂载
 * @param props 组件 props
 * @returns 包装器
 */
function mountComment(props: Record<string, unknown> = {}) {
  return mount(SrComment, { props: { comments: [], ...props } })
}

describe('srToTimestamp', () => {
  it('毫秒时间戳原样返回', () => {
    expect(srToTimestamp(NOW)).toBe(NOW)
  })

  it('秒级时间戳按 1000 倍处理', () => {
    expect(srToTimestamp(Math.floor(NOW / 1000))).toBe(Math.floor(NOW / 1000) * 1000)
  })

  it('数字字符串按时间戳处理，不当日期字符串', () => {
    expect(srToTimestamp(String(NOW))).toBe(NOW)
  })

  it('Date 与日期字符串', () => {
    expect(srToTimestamp(new Date(NOW))).toBe(NOW)
    expect(srToTimestamp('2026-11-10 12:00:00')).toBe(NOW)
  })

  it('空值时返回 0', () => {
    expect(srToTimestamp('')).toBe(0)
    expect(srToTimestamp('  ')).toBe(0)
  })
})

describe('srFormatRelativeTime', () => {
  it('一分钟内是「刚刚」', () => {
    expect(srFormatRelativeTime(NOW - 10 * 1000, NOW)).toBe('刚刚')
  })

  it('未来时间也归入「刚刚」', () => {
    expect(srFormatRelativeTime(NOW + 30 * 1000, NOW)).toBe('刚刚')
  })

  it('按分钟 / 小时 / 天递进', () => {
    expect(srFormatRelativeTime(NOW - 5 * MINUTE, NOW)).toBe('5 分钟前')
    expect(srFormatRelativeTime(NOW - 3 * 60 * MINUTE, NOW)).toBe('3 小时前')
    expect(srFormatRelativeTime(NOW - 2 * 24 * 60 * MINUTE, NOW)).toBe('2 天前')
  })

  it('超过 30 天退回日期', () => {
    expect(srFormatRelativeTime(NOW - 40 * 24 * 60 * MINUTE, NOW)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('srFormatDateTime', () => {
  it('输出日期与时分', () => {
    expect(srFormatDateTime(NOW)).toBe('2026-11-10 12:00')
  })
})

describe('SrComment', () => {
  it('渲染条目与回复', () => {
    const wrapper = mountComment({
      comments: [
        makeComment({
          replies: [makeComment({ id: 2, content: '回复内容', replyTo: { id: 'u1', name: '苏晚' } })],
        }),
      ],
    })

    expect(wrapper.findAll('.sr-comment-item')).toHaveLength(2)
    expect(wrapper.text()).toContain('回复 @苏晚')
    wrapper.unmount()
  })

  it('软删除显示占位且不渲染操作区', () => {
    const wrapper = mountComment({ comments: [makeComment({ deleted: true })] })

    expect(wrapper.find('.sr-comment-item__deleted').exists()).toBe(true)
    expect(wrapper.find('.sr-comment-item__actions').exists()).toBe(false)
    wrapper.unmount()
  })

  it('表情标记渲染成字符，不产生 img', () => {
    const wrapper = mountComment({
      comments: [makeComment({ content: '你好[微笑]' })],
      emojiPackages: [
        {
          key: 't',
          name: '测试',
          emojis: [
            { name: '微笑', char: '🙂' },
            { name: '狗头', url: 'https://cdn.example.com/dog.png' },
          ],
        },
      ],
    })

    expect(wrapper.text()).toContain('🙂')
    expect(wrapper.find('.sr-comment-item__emoji').exists()).toBe(false)
    wrapper.unmount()
  })

  it('图片表情渲染成 img', () => {
    const wrapper = mountComment({
      comments: [makeComment({ content: '[狗头]' })],
      emojiPackages: [
        {
          key: 't',
          name: '测试',
          emojis: [{ name: '狗头', url: 'https://cdn.example.com/dog.png' }],
        },
      ],
    })

    const img = wrapper.find('.sr-comment-item__emoji')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://cdn.example.com/dog.png')
    wrapper.unmount()
  })

  it('点赞只派发事件，不改数据', async () => {
    const comment = makeComment({ likes: 3 })
    const wrapper = mountComment({ comments: [comment] })

    await wrapper.find('.sr-comment-item__action').trigger('click')

    expect(wrapper.emitted('like')?.[0]).toEqual([comment])
    expect(comment.likes).toBe(3)
    wrapper.unmount()
  })

  it('删除按钮只在 isSelf 时出现', () => {
    const mine = mountComment({ comments: [makeComment({ author: { id: 'me', name: '我', isSelf: true } })] })
    expect(mine.find('.sr-comment-item__action.is-danger').exists()).toBe(true)
    mine.unmount()

    const other = mountComment({ comments: [makeComment()] })
    expect(other.find('.sr-comment-item__action.is-danger').exists()).toBe(false)
    other.unmount()
  })

  it('回复超过阈值时折叠', () => {
    const replies = Array.from({ length: 4 }, (_, index) => makeComment({ id: 100 + index }))
    const wrapper = mountComment({ comments: [makeComment({ replies })], replyCollapseLimit: 2 })

    expect(wrapper.findAll('.sr-comment-item__replies .sr-comment-item')).toHaveLength(2)
    expect(wrapper.find('.sr-comment-item__more').text()).toContain('展开另外 2 条回复')
    wrapper.unmount()
  })

  it('游客态渲染三个身份字段', () => {
    const wrapper = mountComment({ user: null, allowGuest: true })

    expect(wrapper.find('.sr-comment-editor__guest').exists()).toBe(true)
    expect(wrapper.findAll('.sr-comment-editor__guest .sr-input')).toHaveLength(3)
    wrapper.unmount()
  })

  it('不允许游客且未登录时给登录引导', () => {
    const wrapper = mountComment({ user: null, allowGuest: false })

    expect(wrapper.find('.sr-comment-editor__login').exists()).toBe(true)
    expect(wrapper.find('.sr-textarea').exists()).toBe(false)
    wrapper.unmount()
  })

  it('pager 模式只渲染当前页', () => {
    const comments = Array.from({ length: 5 }, (_, index) => makeComment({ id: index + 1 }))
    const wrapper = mountComment({ comments, pagination: 'pager', pageSize: 2 })

    expect(wrapper.findAll('.sr-comment-item')).toHaveLength(2)
    wrapper.unmount()
  })

  it('切换排序派发事件并回到第一页', async () => {
    const comments = Array.from({ length: 5 }, (_, index) => makeComment({ id: index + 1 }))
    const wrapper = mountComment({ comments, pagination: 'pager', pageSize: 2 })

    await wrapper.findAll('.sr-comment__sort')[2]?.trigger('click')

    expect(wrapper.emitted('sort-change')?.[0]).toEqual(['hottest'])
    wrapper.unmount()
  })

  it('空列表渲染空态文案', () => {
    const wrapper = mountComment({ emptyText: '还没有人说话' })

    expect(wrapper.text()).toContain('还没有人说话')
    wrapper.unmount()
  })
})
