import { describe, expect, it } from 'vitest'

import {
  addDays,
  addMonths,
  daysInMonth,
  formatDate,
  getMonthGrid,
  getWeekLabels,
  isInRange,
  isOutOfRange,
  isSameDay,
  parseDate,
  startOfDay,
  toDate,
} from '../src/date-utils'

describe('date-utils', () => {
  it('格式化与解析可以往返', () => {
    const date = new Date(2026, 10, 8, 14, 5, 9)

    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-11-08')
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2026-11-08 14:05:09')

    const parsed = parseDate('2026-11-08 14:05:09', 'YYYY-MM-DD HH:mm:ss')
    expect(parsed?.getTime()).toBe(date.getTime())
  })

  it('解析非法字符串返回 null', () => {
    expect(parseDate('', 'YYYY-MM-DD')).toBeNull()
    expect(parseDate('abc', 'YYYY-MM-DD')).toBeNull()
  })

  it('空的或非法日期格式化为空串', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(new Date('invalid'))).toBe('')
  })

  it('addMonths 不会让月末日期溢出', () => {
    // 1 月 31 日加一个月：直接 setMonth 会变成 3 月 3 日
    const result = addMonths(new Date(2026, 0, 31), 1)
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(1)
  })

  it('addDays 跨月与跨年都正确', () => {
    expect(formatDate(addDays(new Date(2026, 11, 31), 1))).toBe('2027-01-01')
    expect(formatDate(addDays(new Date(2026, 0, 1), -1))).toBe('2025-12-31')
  })

  it('daysInMonth 处理闰年', () => {
    expect(daysInMonth(2024, 1)).toBe(29)
    expect(daysInMonth(2026, 1)).toBe(28)
  })

  it('月历固定 42 格且首行对齐起始日', () => {
    // 2026-11-01 是周日；firstDayOfWeek=1 时，首格应是 10-26（周一）
    const cells = getMonthGrid(2026, 10, 1)

    expect(cells).toHaveLength(42)
    expect(formatDate(cells[0]?.date ?? null)).toBe('2026-10-26')
    expect(cells[0]?.inMonth).toBe(false)
  })

  it('firstDayOfWeek=0 时从周日起', () => {
    const cells = getMonthGrid(2026, 10, 0)
    expect(cells[0]?.date.getDay()).toBe(0)
  })

  it('星期表头随起始日旋转', () => {
    expect(getWeekLabels(1)).toEqual(['一', '二', '三', '四', '五', '六', '日'])
    expect(getWeekLabels(0)[0]).toBe('日')
  })

  it('isSameDay 只比日期不比时间', () => {
    expect(isSameDay(new Date(2026, 10, 8, 1), new Date(2026, 10, 8, 23))).toBe(true)
    expect(isSameDay(new Date(2026, 10, 8), new Date(2026, 10, 9))).toBe(false)
  })

  it('区间判断含端点', () => {
    const range: [Date, Date] = [new Date(2026, 10, 1), new Date(2026, 10, 10)]

    expect(isInRange(new Date(2026, 10, 1), range)).toBe(true)
    expect(isInRange(new Date(2026, 10, 10), range)).toBe(true)
    expect(isInRange(new Date(2026, 10, 11), range)).toBe(false)
    // 顺序反了也能判断
    expect(isInRange(new Date(2026, 10, 5), [range[1], range[0]])).toBe(true)
  })

  it('isOutOfRange 按天比较，忽略时间', () => {
    const min = new Date(2026, 10, 5, 18, 0)

    expect(isOutOfRange(new Date(2026, 10, 5, 1, 0), min)).toBe(false)
    expect(isOutOfRange(new Date(2026, 10, 4, 23, 0), min)).toBe(true)
  })

  it('toDate 接受 Date / 数字 / 字符串', () => {
    expect(toDate(new Date(2026, 10, 8))?.getDate()).toBe(8)
    expect(toDate(new Date(2026, 10, 8).getTime())?.getDate()).toBe(8)
    expect(toDate('2026-11-08')?.getDate()).toBe(8)
    expect(toDate(null)).toBeNull()
  })

  it('startOfDay 归零时分秒', () => {
    const result = startOfDay(new Date(2026, 10, 8, 15, 30, 45, 500))
    expect([result.getHours(), result.getMinutes(), result.getSeconds(), result.getMilliseconds()]).toEqual([
      0, 0, 0, 0,
    ])
  })
})
