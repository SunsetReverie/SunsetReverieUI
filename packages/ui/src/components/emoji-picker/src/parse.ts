/**
 * 表情标记的解析与反解析。
 *
 * @remarks
 * 编辑器插入的是**标记文本**（`[微笑]`）而不是表情本身（`😀`）。
 * 这样表情包可以整体替换——字符换成图片、换一套画风——
 * 而历史内容里存的标记不用动，渲染时重新查表即可。
 *
 * 代价是渲染端必须认识这套标记，否则用户看到的是一串 `[表情名]` 纯文本。
 * 所以**编辑器与渲染端必须用同一份 `packages`**。
 */

import type { SrEmojiItem, SrEmojiPackage } from './emoji-picker'

/**
 * 文本片段。
 *
 * @remarks `type` 为 `text` 时 `value` 是原文，`emoji` 为空；
 * 为 `emoji` 时 `value` 是原始标记（如 `[微笑]`），`emoji` 是对应的表情项
 * （可能为空——查不到时调用方应原样输出 `value`）。
 */
export interface SrEmojiTextSegment {
  type: 'text' | 'emoji'
  value: string
  emoji?: SrEmojiItem
}

/** 标记的匹配规则：`[名称]`，名称内不允许再出现方括号 */
const MARK_PATTERN = /\[([^[\]]+)\]/g

/**
 * 建「名称 → 表情」查找表。
 *
 * @remarks
 * 重名时**以先出现的为准**。同名但一个字符一个图片的情况在新旧表情包
 * 混用时会遇到，静默取第一个比抛错更实用——渲染结果至少是确定的。
 * 开发环境下额外告警，方便在数据源头修正。
 *
 * @param packages 表情包列表
 * @returns 查找表
 */
export function buildEmojiMap(packages: SrEmojiPackage[]): Map<string, SrEmojiItem> {
  const map = new Map<string, SrEmojiItem>()

  for (const pack of packages) {
    for (const item of pack.emojis) {
      // 既没 char 也没 url 的项无法渲染，直接跳过
      if (!item.char && !item.url) continue

      if (map.has(item.name)) {
        if (import.meta.env?.DEV) {
          console.warn(`[SrEmojiPicker] 表情名重复："${item.name}"，以先出现的为准`)
        }
        continue
      }

      map.set(item.name, item)
    }
  }

  return map
}

/**
 * 把文本切成「普通文本 / 表情」片段。
 *
 * @remarks
 * 查不到的名称**原样当作文本**返回，不丢内容。这样用户在正文里写
 * `[这段是加注]` 这类方括号内容不会被误吞。
 *
 * @param text 原始文本
 * @param map 查找表
 * @returns 片段列表
 */
export function parseEmojiText(text: string, map: Map<string, SrEmojiItem>): SrEmojiTextSegment[] {
  if (!text) return []

  const segments: SrEmojiTextSegment[] = []
  let lastIndex = 0

  // 每次调用前重置 lastIndex，避免 g 标志的残留状态
  MARK_PATTERN.lastIndex = 0

  let match = MARK_PATTERN.exec(text)

  while (match) {
    const name = match[1] ?? ''
    const item = map.get(name)

    if (item) {
      // 把标记前的文本先收进去
      if (match.index > lastIndex) {
        segments.push({ type: 'text', value: text.slice(lastIndex, match.index) })
      }

      segments.push({ type: 'emoji', value: match[0], emoji: item })
      lastIndex = match.index + match[0].length
    }

    match = MARK_PATTERN.exec(text)
  }

  // 尾部剩余文本
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }

  // 一个标记都没命中时，整段就是文本
  return segments.length ? segments : [{ type: 'text', value: text }]
}

/**
 * 表情项转标记文本。
 *
 * @param item 表情项
 * @returns 标记，如 `[微笑]`
 */
export function stringifyEmoji(item: SrEmojiItem): string {
  return `[${item.name}]`
}
