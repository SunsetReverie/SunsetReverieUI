/**
 * LRC 歌词解析与定位。
 *
 * @remarks
 * LRC 是最朴素的「时间标签 + 一行文本」，但实际数据里有不少坑：
 * 一行多个标签、元信息行、纯时间标记行、行序与时间不一致。
 * 这里逐条处理，保证输出是**按时间升序**、可以直接二分的数组。
 */

import type { SrLyricLine } from './types'

/**
 * 时间标签：`[mm:ss]`、`[mm:ss.xx]`、`[mm:ss:xx]`
 *
 * @remarks 分钟允许 1~3 位（长音频会超过 99 分），
 * 小数位允许 `.` 或 `:` 两种写法，常见于不同导出工具。
 */
const TIME_PATTERN = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g

/** 元信息行：`[ti:歌名]`、`[ar:歌手]`、`[offset:0]` 等 */
const META_PATTERN = /^\[(ar|ti|al|by|offset|re|ve|length):/i

/**
 * 把时间标签转成秒
 *
 * @param minute 分钟
 * @param second 秒
 * @param fraction 小数部分（可能是 2 位也可能是 3 位）
 * @returns 秒数
 */
function toSeconds(minute: string, second: string, fraction?: string): number {
  const base = Number(minute) * 60 + Number(second)
  if (!fraction) return base

  // `.5` 与 `.500` 都表示半秒，补零到三位再除
  return base + Number(fraction.padEnd(3, '0')) / 1000
}

/**
 * 解析 LRC 文本
 *
 * @param raw LRC 原文
 * @returns 按时间升序的歌词行
 *
 * @remarks
 * - 元信息行整行跳过（不能当成时间标签行）
 * - 一行有多个标签时**拆成多条**（副歌会在不同时间重复出现）
 * - 纯时间标记行保留，打 `empty` 标记：删掉的话列表高度会随播放跳动
 * - 同一时间出现两行时，第二行视作**翻译**合并进 `translation`
 *   （网易云的双语歌词就是这种形态）
 */
export function parseLrc(raw: string): SrLyricLine[] {
  if (!raw) return []

  const lines: SrLyricLine[] = []

  for (const rawLine of raw.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    if (META_PATTERN.test(line)) continue

    // 找出这一行所有的标签；没有标签说明是「暂无歌词」这类提示，直接丢
    const stamps = [...line.matchAll(TIME_PATTERN)]
    if (!stamps.length) continue

    const text = line.replace(TIME_PATTERN, '').trim()

    for (const stamp of stamps) {
      lines.push({
        time: toSeconds(stamp[1] ?? '0', stamp[2] ?? '0', stamp[3]),
        text,
        empty: text === '',
      })
    }
  }

  // 行序不可靠：多标签行拆开后必须重排，后面才能二分
  lines.sort((a, b) => a.time - b.time)

  return mergeTranslations(lines)
}

/**
 * 合并同一时间的多行文本
 *
 * @param lines 已排序的歌词行
 * @returns 合并后的歌词行
 *
 * @remarks 第一条作为正文，其余作为翻译用小字显示。
 * 三条以上（合唱）用 ` / ` 连接，保持在一行里。
 */
function mergeTranslations(lines: SrLyricLine[]): SrLyricLine[] {
  const result: SrLyricLine[] = []

  for (const line of lines) {
    const last = result[result.length - 1]

    if (last && Math.abs(last.time - line.time) < 0.001) {
      // 主行是空行时，用这一行补正文，避免只剩一句译文
      if (last.empty && !line.empty) {
        last.text = line.text
        last.empty = false
        continue
      }

      if (!line.empty) {
        last.translation = last.translation ? `${last.translation} / ${line.text}` : line.text
      }

      continue
    }

    result.push({ ...line })
  }

  return result
}

/**
 * 找出当前时刻对应的歌词行
 *
 * @param lines 歌词行
 * @param currentTime 当前播放秒数
 * @param offset 偏移秒数，正数表示歌词延后
 * @returns 行索引，还没到第一句时返回 -1
 *
 * @remarks
 * 时间标签标记的是该行**开始**时刻，所以要取「最后一个 `time <= target`」。
 * 播放期间每秒要查好几次，上百行用二分而不是线性扫描。
 */
export function findLyricIndex(lines: SrLyricLine[], currentTime: number, offset = 0): number {
  if (!lines.length) return -1

  const target = currentTime + offset
  if (target < (lines[0]?.time ?? 0)) return -1

  let low = 0
  let high = lines.length - 1
  let result = 0

  while (low <= high) {
    const mid = (low + high) >> 1
    const midTime = lines[mid]?.time ?? 0

    if (midTime <= target) {
      result = mid
      low = mid + 1
      continue
    }

    high = mid - 1
  }

  return result
}

/**
 * 取当前应显示的歌词文本
 *
 * @param lines 歌词行
 * @param index 当前行索引
 * @param span 最多向前回退几行
 * @returns 文本，取不到时返回空串
 *
 * @remarks
 * 当前行是间奏空行时显示上一句，避免底部歌词「消失—出现」地闪。
 * 回退有上限，长间奏不会翻出很久以前的那句。
 */
export function resolveLyricText(lines: SrLyricLine[], index: number, span = 8): string {
  if (index < 0 || index >= lines.length) return ''

  for (let cursor = index; cursor >= Math.max(0, index - span); cursor -= 1) {
    const line = lines[cursor]
    if (line && !line.empty && line.text) return line.text
  }

  return ''
}
