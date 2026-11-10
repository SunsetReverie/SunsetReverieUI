import type { ExtractPropTypes, PropType } from 'vue'

import type { SrMusicListType, SrMusicLoop, SrMusicMode, SrMusicPlacement, SrMusicServer } from './types'

export const musicPlayerProps = {
  /**
   * Meting API 地址 @default 'https://meting-api.shurans.cn/'
   *
   * @remarks 只填到域名，`?server=&type=&id=` 由组件拼。
   * 生产环境建议自建，公共实例随时可能限流。
   */
  api: {
    type: String,
    default: 'https://meting-api.shurans.cn/',
  },
  /**
   * 音源 @default 'netease'
   *
   * @remarks 换音源必须同时换 `id`：同一个歌单 id 在两家平台之间不通用。
   */
  server: {
    type: String as PropType<SrMusicServer>,
    default: 'netease',
  },
  /** 查询类型 @default 'playlist' */
  type: {
    type: String as PropType<SrMusicListType>,
    default: 'playlist',
  },
  /**
   * 歌单 / 单曲 id
   *
   * @remarks 从分享链接里取：`music.163.com/playlist?id=2585465480` 里的那一串。
   */
  id: {
    type: [String, Number] as PropType<string | number>,
    default: '',
  },
  /** 展示形态 @default 'full' */
  mode: {
    type: String as PropType<SrMusicMode>,
    default: 'full',
  },
  /** 贴边位置，仅 `attach` / `mini` 生效 @default 'bottomRight' */
  placement: {
    type: String as PropType<SrMusicPlacement>,
    default: 'bottomRight',
  },
  /** 距屏幕边缘的距离，数字按 px @default 16 */
  offset: {
    type: [Number, String] as PropType<number | string>,
    default: 16,
  },
  /** 显示歌词面板 @default true */
  showLyrics: {
    type: Boolean,
    default: true,
  },
  /** 显示底部全局歌词条 @default false */
  globalLyrics: {
    type: Boolean,
    default: false,
  },
  /** 自动播放 @default false */
  autoplay: {
    type: Boolean,
    default: false,
  },
  /** 初始音量 0~1 @default 0.7 */
  volume: {
    type: Number,
    default: 0.7,
  },
  /** 初始循环模式 @default 'list' */
  loop: {
    type: String as PropType<SrMusicLoop>,
    default: 'list',
  },
  /** 显示播放列表 @default true */
  showPlaylist: {
    type: Boolean,
    default: true,
  },
  /**
   * 歌词偏移秒数 @default 0
   *
   * 正数表示歌词延后显示，用于校正某些音源的几十毫秒偏差。
   */
  lyricOffset: {
    type: Number,
    default: 0,
  },
  /** 加载失败时的兜底文案 */
  errorText: {
    type: String,
    default: '音乐加载失败，请检查 Meting API 配置',
  },
} as const

export type SrMusicPlayerProps = ExtractPropTypes<typeof musicPlayerProps>

/** 循环模式的图标与文案 */
export const MUSIC_LOOP_MAP: Record<SrMusicLoop, { icon: string; label: string }> = {
  list: { icon: 'lucide:repeat', label: '列表循环' },
  one: { icon: 'lucide:repeat-1', label: '单曲循环' },
  random: { icon: 'lucide:shuffle', label: '随机播放' },
}

/** 循环模式的切换顺序 */
export const MUSIC_LOOP_ORDER: SrMusicLoop[] = ['list', 'one', 'random']
