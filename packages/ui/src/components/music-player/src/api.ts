/**
 * Meting API 封装。
 *
 * @remarks
 * Meting 是一个「把各家音乐平台的接口统一成同一套 URL」的中间件，
 * 所有查询都走同一组参数：`server` / `type` / `id`。
 *
 * 原始响应字段名直接沿用（`name` / `artist` / `url` / `pic` / `lrc`），
 * 组件里不再做命名转换。
 */

import type { SrMusicQueryType, SrMusicServer, SrMusicTrack } from './types'

/**
 * 拼一个 Meting 请求地址
 *
 * @param api API 域名，如 `https://meting-api.shurans.cn/`（不带 `?type=` 部分）
 * @param server 音源
 * @param type 查询类型
 * @param id 歌单 id、歌曲 id 或关键词
 * @returns 完整地址
 *
 * @remarks 用 `URL` 而不是字符串拼接：域名结尾带不带斜杠、原本有没有 query 都能容错。
 */
export function buildMusicApiUrl(
  api: string,
  server: SrMusicServer,
  type: SrMusicQueryType,
  id: string | number,
): string {
  const url = new URL(api)
  url.searchParams.set('server', server)
  url.searchParams.set('type', type)
  url.searchParams.set('id', String(id))

  return url.toString()
}

/**
 * 从播放地址里反解曲目 id
 *
 * @param url 播放地址
 * @returns id，拿不到时返回空串
 *
 * @remarks 不抛错：拿不到 id 只退化成「没有稳定的列表 key」，
 * 不该让整张歌单加载失败。
 */
export function extractTrackId(url: string): string {
  try {
    return new URL(url).searchParams.get('id') ?? ''
  } catch {
    return ''
  }
}

/**
 * 把接口返回的一条原始数据规整成曲目
 *
 * @param raw 原始数据
 * @returns 曲目；数据不可用时返回 `null`
 *
 * @remarks
 * `url` 为空必须剔除：音源对下架歌曲会返回空 url，
 * 留在列表里就是「点了没声音」，比少一条更让人困惑。
 */
function normalizeTrack(raw: unknown): SrMusicTrack | null {
  if (!raw || typeof raw !== 'object') return null

  const item = raw as Record<string, unknown>
  if (typeof item.url !== 'string' || !item.url) return null

  return {
    name: typeof item.name === 'string' && item.name ? item.name : '未知曲目',
    artist: typeof item.artist === 'string' && item.artist ? item.artist : '未知艺术家',
    url: item.url,
    pic: typeof item.pic === 'string' ? item.pic : '',
    lrc: typeof item.lrc === 'string' ? item.lrc : '',
    album: typeof item.album === 'string' && item.album ? item.album : undefined,
    id: extractTrackId(item.url),
  }
}

/**
 * 把服务端的错误文案翻译成能指导操作的提示
 *
 * @param raw 服务端原文
 * @returns 提示文案
 *
 * @remarks 一律附上原文——翻译可能不准，英文原文才是排查问题的唯一线索。
 */
function describeMusicError(raw: string): string {
  const lower = raw.toLowerCase()

  if (lower.includes('unknown playlist')) return `歌单不存在，请检查 id（${raw}）`
  if (lower.includes('unknown song')) return `歌曲不存在，请检查 id（${raw}）`
  if (lower.includes('unknown album')) return `专辑不存在，请检查 id（${raw}）`
  if (lower.includes('unknown')) return `资源不存在，请检查参数（${raw}）`

  return raw
}

/**
 * 拉取歌单 / 单曲列表
 *
 * @param api API 域名
 * @param server 音源
 * @param type 列表类型
 * @param id 歌单或歌曲 id
 * @param signal 取消信号
 * @returns 曲目列表
 *
 * @throws Error 网络失败、HTTP 非 2xx、服务端返回错误、数据格式不对时抛出
 *
 * @remarks
 * Meting 对不存在的 id 会返回 **HTTP 200 + `{"error": "..."}`**，
 * 只看 `response.ok` 会把「id 写错了」误报成「格式不正确」，所以要先探 `error`。
 */
export async function fetchMusicTracks(
  api: string,
  server: SrMusicServer,
  type: SrMusicQueryType,
  id: string | number,
  signal?: AbortSignal,
): Promise<SrMusicTrack[]> {
  const response = await fetch(buildMusicApiUrl(api, server, type, id), { signal })

  if (!response.ok) {
    throw new Error(`歌单请求失败（HTTP ${response.status}）`)
  }

  const data: unknown = await response.json()

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const message = (data as Record<string, unknown>).error
    if (typeof message === 'string' && message) {
      throw new Error(describeMusicError(message))
    }
  }

  if (!Array.isArray(data)) {
    throw new Error('歌单数据格式不正确')
  }

  return data.map(normalizeTrack).filter((track): track is SrMusicTrack => track !== null)
}

/**
 * 拉取歌词文本
 *
 * @param url 歌词地址
 * @param signal 取消信号
 * @returns LRC 文本，失败返回空串
 *
 * @remarks
 * 歌词是锦上添花：纯音乐、冷门曲没有歌词是常态，
 * 任何失败都静默返回空串，绝不影响播放。
 */
export async function fetchMusicLyric(url: string, signal?: AbortSignal): Promise<string> {
  if (!url) return ''

  try {
    const response = await fetch(url, { signal })
    if (!response.ok) return ''

    return await response.text()
  } catch {
    return ''
  }
}
