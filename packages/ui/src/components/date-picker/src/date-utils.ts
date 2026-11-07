/**
 * 日期工具
 *
 * 全部是纯函数，不依赖任何日期库：这个库零运行时依赖，日历逻辑自己实现可控。
 * 所有函数都按**本地时区**处理，不做 UTC 转换 —— 日期选择器的语义就是「用户的日历上那一天」。
 */

/** 补零 */
function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0')
}

/**
 * 格式化日期
 *
 * 支持的占位符：YYYY / MM / DD / HH / mm / ss
 * @param date 日期
 * @param pattern 模板
 * @returns 格式化字符串
 */
export function formatDate(date: Date | null | undefined, pattern = 'YYYY-MM-DD'): string {
  if (!date || Number.isNaN(date.getTime())) return ''

  return pattern
    .replace(/YYYY/g, String(date.getFullYear()))
    .replace(/MM/g, pad(date.getMonth() + 1))
    .replace(/DD/g, pad(date.getDate()))
    .replace(/HH/g, pad(date.getHours()))
    .replace(/mm/g, pad(date.getMinutes()))
    .replace(/ss/g, pad(date.getSeconds()))
}

/**
 * 解析日期字符串
 *
 * 只认 formatDate 的同款模板，避免引入完整的解析器。
 * @param value 字符串
 * @param pattern 模板
 * @returns 日期，解析失败返回 null
 */
export function parseDate(value: string, pattern = 'YYYY-MM-DD'): Date | null {
  if (!value) return null

  const tokens: { key: string; length: number }[] = []
  for (const match of pattern.matchAll(/YYYY|MM|DD|HH|mm|ss/g)) {
    tokens.push({ key: match[0], length: match[0].length })
  }

  const numbers: number[] = []
  let cursor = 0
  for (const token of tokens) {
    const raw = value.slice(cursor, cursor + token.length)
    const parsed = Number(raw)
    if (Number.isNaN(parsed)) return null
    numbers.push(parsed)
    // 跳过模板里的分隔符
    cursor += token.length
    while (cursor < pattern.length && !/[YMDHms]/.test(pattern[cursor] ?? '')) cursor += 1
  }

  const get = (key: string, fallback: number): number => {
    const index = tokens.findIndex((token) => token.key === key)
    return index >= 0 ? (numbers[index] ?? fallback) : fallback
  }

  const date = new Date(
    get('YYYY', 1970),
    get('MM', 1) - 1,
    get('DD', 1),
    get('HH', 0),
    get('mm', 0),
    get('ss', 0),
  )

  return Number.isNaN(date.getTime()) ? null : date
}

/** 是否为同一天 */
export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** 是否为同一个月 */
export function isSameMonth(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/** 当天 00:00:00 */
export function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

/** 当天 23:59:59 */
export function endOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

/**
 * 加减天数
 * @param date 基准
 * @param days 天数，可为负
 * @returns 新日期
 */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/**
 * 加减月份
 *
 * 用「先把日设为 1 再设月」的方式，避免 1 月 31 日加一个月变成 3 月 3 日。
 * @param date 基准
 * @param months 月数，可为负
 * @returns 新日期
 */
export function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  next.setDate(1)
  next.setMonth(next.getMonth() + months)
  return next
}

/** 该月有多少天 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** 日历格子 */
export interface SrCalendarCell {
  /** 该格对应的日期 */
  date: Date
  /** 是否属于当前月份（前后补齐的日期为 false） */
  inMonth: boolean
}

/**
 * 生成月历网格
 *
 * 固定 6 行 × 7 列 = 42 格。固定行数避免面板高度在切换月份时抖动。
 * @param year 年
 * @param month 月（0-11）
 * @param firstDayOfWeek 一周从周几开始，0 为周日、1 为周一
 * @returns 42 个格子
 */
export function getMonthGrid(year: number, month: number, firstDayOfWeek = 1): SrCalendarCell[] {
  const first = new Date(year, month, 1)
  // getDay() 周日为 0，需要按起始日偏移
  const offset = (first.getDay() - firstDayOfWeek + 7) % 7
  const start = addDays(first, -offset)

  const cells: SrCalendarCell[] = []
  for (let index = 0; index < 42; index += 1) {
    const date = addDays(start, index)
    cells.push({ date, inMonth: date.getMonth() === month })
  }

  return cells
}

/**
 * 日期是否超出允许范围
 * @param date 日期
 * @param min 最小
 * @param max 最大
 * @returns 是否越界
 */
export function isOutOfRange(date: Date, min?: Date | null, max?: Date | null): boolean {
  const day = startOfDay(date).getTime()
  if (min && day < startOfDay(min).getTime()) return true
  if (max && day > startOfDay(max).getTime()) return true
  return false
}

/**
 * 是否落在区间内（含端点）
 * @param date 日期
 * @param range 区间
 * @returns 是否在区间内
 */
export function isInRange(date: Date, range: [Date, Date] | null): boolean {
  if (!range) return false
  const day = startOfDay(date).getTime()
  const [from, to] = range[0] <= range[1] ? range : [range[1], range[0]]
  return day >= startOfDay(from).getTime() && day <= startOfDay(to).getTime()
}

/** 星期名称，索引与 firstDayOfWeek 对齐前的原始顺序 */
export const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']

/**
 * 按起始日排好的星期表头
 * @param firstDayOfWeek 起始日
 * @returns 7 个标签
 */
export function getWeekLabels(firstDayOfWeek = 1): string[] {
  return Array.from({ length: 7 }, (_, index) => WEEK_LABELS[(index + firstDayOfWeek) % 7] ?? '')
}

/** 月份名称 */
export const MONTH_LABELS = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
]

/**
 * 归一化输入值
 *
 * 支持 Date、时间戳、字符串；字符串按 pattern 解析。
 * @param value 原始值
 * @param pattern 解析模板
 * @returns 日期或 null
 */
export function toDate(value: unknown, pattern = 'YYYY-MM-DD'): Date | null {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'number') return new Date(value)
  if (typeof value === 'string') return parseDate(value, pattern)
  return null
}
