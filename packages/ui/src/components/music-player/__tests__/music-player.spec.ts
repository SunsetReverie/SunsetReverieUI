import { describe, expect, it } from 'vitest'

import { buildMusicApiUrl, extractTrackId } from '../src/api'
import { findLyricIndex, parseLrc, resolveLyricText } from '../src/lrc'

describe('parseLrc', () => {
  it('解析基础行并按时间升序', () => {
    const lines = parseLrc('[00:05.00]第二句\n[00:01.00]第一句')

    expect(lines.map((line) => line.text)).toEqual(['第一句', '第二句'])
    expect(lines[0]?.time).toBe(1)
    expect(lines[1]?.time).toBe(5)
  })

  it('跳过元信息行', () => {
    const lines = parseLrc('[ti:歌名]\n[ar:歌手]\n[00:01.00]正文')

    expect(lines).toHaveLength(1)
    expect(lines[0]?.text).toBe('正文')
  })

  it('一行多个时间标签拆成多条', () => {
    const lines = parseLrc('[00:01.00][00:10.00]副歌')

    expect(lines).toHaveLength(2)
    expect(lines.map((line) => line.time)).toEqual([1, 10])
  })

  it('纯时间标记行保留并打 empty 标记', () => {
    const lines = parseLrc('[00:01.00]正文\n[00:05.00]')

    expect(lines[1]?.empty).toBe(true)
    expect(lines[1]?.text).toBe('')
  })

  it('没有时间标签的行被丢弃', () => {
    expect(parseLrc('暂无歌词')).toEqual([])
  })

  it('同一时间的第二行合并为翻译', () => {
    const lines = parseLrc('[00:01.00]Hello\n[00:01.00]你好')

    expect(lines).toHaveLength(1)
    expect(lines[0]?.text).toBe('Hello')
    expect(lines[0]?.translation).toBe('你好')
  })

  it('小数位不足三位也能算对', () => {
    const lines = parseLrc('[00:01.5]半秒\n[00:02.05]五十毫秒')

    expect(lines[0]?.time).toBeCloseTo(1.5)
    expect(lines[1]?.time).toBeCloseTo(2.05)
  })

  it('空文本返回空数组', () => {
    expect(parseLrc('')).toEqual([])
  })
})

describe('findLyricIndex', () => {
  const lines = parseLrc('[00:01.00]一\n[00:05.00]二\n[00:10.00]三')

  it('还没到第一句返回 -1', () => {
    expect(findLyricIndex(lines, 0)).toBe(-1)
  })

  it('取最后一个开始时间不晚于当前时刻的行', () => {
    expect(findLyricIndex(lines, 1)).toBe(0)
    expect(findLyricIndex(lines, 4.9)).toBe(0)
    expect(findLyricIndex(lines, 5)).toBe(1)
    expect(findLyricIndex(lines, 99)).toBe(2)
  })

  it('offset 用于校正歌词延迟', () => {
    expect(findLyricIndex(lines, 4, 2)).toBe(1)
  })

  it('空歌词返回 -1', () => {
    expect(findLyricIndex([], 3)).toBe(-1)
  })
})

describe('resolveLyricText', () => {
  it('取当前行文本', () => {
    const lines = parseLrc('[00:01.00]一\n[00:05.00]二')

    expect(resolveLyricText(lines, 1)).toBe('二')
  })

  it('当前行是空行时回退到上一句', () => {
    const lines = parseLrc('[00:01.00]一\n[00:05.00]\n[00:06.00]三')

    expect(resolveLyricText(lines, 1)).toBe('一')
  })

  it('越界返回空串', () => {
    const lines = parseLrc('[00:01.00]一')

    expect(resolveLyricText(lines, -1)).toBe('')
    expect(resolveLyricText(lines, 9)).toBe('')
  })
})

describe('buildMusicApiUrl', () => {
  it('拼上 server / type / id', () => {
    const url = new URL(buildMusicApiUrl('https://meting-api.shurans.cn/', 'netease', 'playlist', 2585465480))

    expect(url.searchParams.get('server')).toBe('netease')
    expect(url.searchParams.get('type')).toBe('playlist')
    expect(url.searchParams.get('id')).toBe('2585465480')
  })

  it('域名结尾没有斜杠也能用', () => {
    expect(buildMusicApiUrl('https://cdn.example.com', 'tencent', 'song', 'abc')).toContain('type=song')
  })
})

describe('extractTrackId', () => {
  it('从播放地址里取出 id', () => {
    expect(extractTrackId('https://meting-api.shurans.cn/?server=netease&type=url&id=473740555')).toBe(
      '473740555',
    )
  })

  it('地址非法时返回空串而不是抛错', () => {
    expect(extractTrackId('not a url')).toBe('')
  })
})
