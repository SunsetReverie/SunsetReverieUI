/**
 * 时间格式化。
 *
 * @remarks
 * 评论列表里满屏「2026-11-10 14:32:07」没人看，但只写「3 天前」又不好定位。
 * 所以采用阶梯降级：近处用相对时间，远了退回日期。
 */

/** 一分钟的毫秒数 */
const MINUTE = 60 * 1000

/** 一小时的毫秒数 */
const HOUR = 60 * MINUTE

/** 一天的毫秒数 */
const DAY = 24 * HOUR

/**
 * 把各种时间写法统一成时间戳
 *
 * @param value 时间戳、日期字符串或 `Date`
 * @returns 毫秒时间戳，无法解析时返回 0
 *
 * @remarks
 * 数字字符串必须单独处理：`new Date('1726000000000')` 会当成
 * 一个无效日期字符串，而 `new Date(1726000000000)` 才是时间戳。
 * 服务端返「秒级时间戳」时也会走到这里，所以小于 1e11 的数字按秒处理。
 */
export function srToTimestamp(value: string | number | Date): number {
  if (value instanceof Date) return value.getTime()

  if (typeof value === 'number') {
    // 10 位是秒级时间戳，13 位是毫秒级
    return value < 1e11 ? value * 1000 : value
  }

  const trimmed = value.trim()
  if (!trimmed) return 0

  // 纯数字字符串按数字处理，避免被当成日期字符串解析
  if (/^\d+$/.test(trimmed)) {
    const num = Number(trimmed)
    return num < 1e11 ? num * 1000 : num
  }

  const parsed = Date.parse(trimmed.replace(/-/g, '/'))
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * 格式化成 `YYYY-MM-DD`
 *
 * @param timestamp 毫秒时间戳
 * @returns 日期字符串
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * 相对时间
 *
 * @param value 时间戳、日期字符串或 `Date`
 * @param now 参照时刻，默认取当前时间；测试里传固定值更稳
 * @returns 形如「刚刚」「5 分钟前」「2026-11-10」
 *
 * @remarks 未来时间（负 diff，常见于客户端时钟偏差）统一归入「刚刚」，
 * 不显示「-3 分钟前」这种让人困惑的文案。
 */
export function srFormatRelativeTime(value: string | number | Date, now: number = Date.now()): string {
  const timestamp = srToTimestamp(value)
  if (!timestamp) return ''

  const diff = now - timestamp

  if (diff < MINUTE) return '刚刚'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} 分钟前`
  if (diff < DAY) return `${Math.floor(diff / HOUR)} 小时前`
  if (diff < 30 * DAY) return `${Math.floor(diff / DAY)} 天前`

  return formatDate(timestamp)
}

/**
 * 完整时间，用于 `title` 提示
 *
 * @param value 时间戳、日期字符串或 `Date`
 * @returns `YYYY-MM-DD HH:mm`
 */
export function srFormatDateTime(value: string | number | Date): string {
  const timestamp = srToTimestamp(value)
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${formatDate(timestamp)} ${hour}:${minute}`
}
