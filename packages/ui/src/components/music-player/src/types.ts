/**
 * 音乐播放器的数据契约。
 *
 * @remarks
 * 组件**不内置曲库**：歌单由 Meting API 实时拉取，字段名与接口返回保持一致，
 * 不做中间层转换——少一层映射就少一处对不上的地方。
 */

/** 音源 */
export type SrMusicServer = 'netease' | 'tencent'

/**
 * Meting 的查询类型
 *
 * @remarks
 * `playlist` / `song` 返回曲目对象（数组），组件用这两个；
 * 其余返回纯字符串（部分是 302 重定向地址），留给宿主用 `buildApiUrl` 单独调。
 */
export type SrMusicQueryType = 'playlist' | 'song' | 'name' | 'artist' | 'url' | 'pic' | 'lrc'

/** 组件接受的列表类型 */
export type SrMusicListType = 'playlist' | 'song'

/**
 * 展示形态
 *
 * - `full`：常驻完整播放器
 * - `attach`：收起成贴边小圆钮，悬停展开、移开延时收回
 * - `mini`：收起成胶囊条，封面即播放开关，点歌名展开
 */
export type SrMusicMode = 'full' | 'attach' | 'mini'

/** 贴边位置：四角 */
export type SrMusicPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

/** 循环模式 */
export type SrMusicLoop = 'list' | 'one' | 'random'

/** 一首歌 */
export interface SrMusicTrack {
  /** 歌名 */
  name: string
  /** 艺术家，多位用 `/` 分隔 */
  artist: string
  /** 播放地址（接口会 302 到真实文件，可直接作 `src`） */
  url: string
  /** 封面地址（同样是重定向接口） */
  pic: string
  /** 歌词地址，返回 LRC 文本，需要再请求一次 */
  lrc: string
  /** 专辑名，部分音源才有 */
  album?: string
  /**
   * 曲目 id
   *
   * @remarks 接口不直接给，从 `url` 的 `id` 参数反解。
   * 列表 key 必须用它——歌单里同名同艺术家的 Live 版很常见，用名字会复用错乱。
   */
  id?: string
}

/**
 * 一行歌词
 *
 * @remarks `empty` 表示只有时间标签、没有文字的行（间奏锚点）。
 * 这类行要保留：删掉的话歌词列表高度会随播放不断变化。
 */
export interface SrLyricLine {
  /** 该行开始于第几秒 */
  time: number
  /** 文本 */
  text: string
  /** 纯时间标记行 */
  empty?: boolean
  /** 翻译（同一时间戳的第二行，双语歌词） */
  translation?: string
}
