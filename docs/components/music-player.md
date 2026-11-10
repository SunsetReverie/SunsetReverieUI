# SrMusicPlayer 音乐播放器

基于 Meting API 的播放器：歌单实时拉取、LRC 歌词滚动、三种形态（完整 / 吸附 / 胶囊）。**不内置曲库**，组件只负责播放与展示。

<script setup>
import { ref } from 'vue'

const API = 'https://meting-api.shurans.cn/'
const PLAYLIST_ID = '2585465480'
const events = ref([])

function log(text) {
  events.value = [text, ...events.value].slice(0, 4)
}
</script>

## 快速上手

```vue
<SrMusicPlayer api="https://meting-api.shurans.cn/" server="netease" type="playlist" id="2585465480" />
```

四个必填信息：**API 域名**、**音源**、**查询类型**、**id**。

- `api` 只填到域名，`?server=&type=&id=` 由组件拼
- `id` 从分享链接里取：`music.163.com/playlist?id=2585465480` 里那一串
- **换音源必须换 id**，同一个歌单 id 在网易云和 QQ 音乐之间不通用

## 交互演示

<div class="sr-demo">
  <SrMusicPlayer
    :api="API"
    :id="PLAYLIST_ID"
    server="netease"
    type="playlist"
    @change="(track, index) => log(`切歌：${track.name}（#${index + 1}）`)"
    @play="(playing) => log(playing ? '开始播放' : '暂停')"
    @error="(error) => log(`加载失败：${error.message}`)"
  />
  <p style="margin-top: 12px; color: var(--sr-color-text-tertiary); font-size: 12.5px">
    {{ events.length ? events.join(' · ') : '（还没开始播放）' }}
  </p>
</div>

点封面下方的播放键开始。歌词会在播放后自动滚动并高亮当前行。

## 三种形态

| `mode` | 收起态 | 展开方式 | 适合 |
| --- | --- | --- | --- |
| `full`（默认） | 无收起态 | 常驻显示 | 音乐页、侧边栏 |
| `attach` | 贴边圆钮 | 悬停即展开，移开 320ms 收回 | 博客、文档站，不占版面 |
| `mini` | 胶囊条（封面 + 歌名） | 封面即播放开关，点文字才展开 | 需要「一直在但不打扰」 |

```vue
<!-- 贴在右下角的悬浮圆钮 -->
<SrMusicPlayer api="..." id="..." mode="attach" placement="bottomRight" :offset="24" />

<!-- 左下角的胶囊条 -->
<SrMusicPlayer api="..." id="..." mode="mini" placement="bottomLeft" />
```

`placement` 支持四角：`topLeft` / `topRight` / `bottomLeft` / `bottomRight`；`offset` 数字按 px，也可以传 `'1rem'` 这类字符串。

紧凑态的面板会被 `Teleport` 到 body——留在祖先链里会被带 `transform` 的父级困在低层级 stacking context，`z-index` 再高也压不住别的元素。

## 歌词

LRC 由组件自己解析，不依赖第三方库：

| 能力 | 说明 |
| --- | --- |
| 多时间标签 | `[00:01][00:10]副歌` 会拆成两条，同一句在多段重复出现 |
| 元信息行 | `[ti:]` / `[ar:]` / `[offset:]` 整行跳过 |
| 空行锚点 | 只有时间没有文字的行保留，渲染成 `· · ·`，删掉会让列表高度随播放跳动 |
| 双语合并 | 同一时间戳的第二行视作翻译，小字显示在正文下方 |
| 二分定位 | 播放期间每秒多次查询，上百行用二分而不是线性扫描 |
| 间奏回退 | 当前行是空行时显示上一句（最多回退 8 行），避免歌词一闪一闪 |

```vue
<!-- 歌词整体延后 0.3 秒，校正音源偏差 -->
<SrMusicPlayer api="..." id="..." :lyric-offset="0.3" :show-lyrics="false" />
```

点任意歌词行可以直接跳到那一句。

## API 配置

组件拼出来的地址形如：

```
https://meting-api.shurans.cn/?server=netease&type=playlist&id=2585465480
```

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| `server` | `netease` / `tencent` | 音源 |
| `type` | `playlist` / `song` | 歌单或单曲，返回数组 |
| `id` | 歌单 / 歌曲 id | 从分享链接取 |

除了上面两种，Meting 还支持单字段查询，返回纯字符串（部分是 302 重定向地址），组件不用但导出了工具函数：

```ts
import { buildMusicApiUrl } from '@sunset-reverie/ui'

const coverUrl = buildMusicApiUrl('https://meting-api.shurans.cn/', 'netease', 'pic', '18876415625748787')
```

::: warning Meting 的报错方式很坑
对不存在的 id，它返回 **HTTP 200 + `{"error": "unknown playlist id"}`**。
只看 `response.ok` 会把「id 写错了」误报成「格式不正确」，组件已经先探 `error` 字段，报错文案里保留服务端原文。
:::

::: tip 生产环境请自建
公共实例随时可能限流或下线。自建一个 Meting 服务只要一个 PHP 文件，成本很低。
:::

## API

### SrMusicPlayer

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `api` | `string` | `'https://meting-api.shurans.cn/'` | Meting 域名，不带 `?type=` 部分 |
| `server` | `'netease' \| 'tencent'` | `'netease'` | 音源 |
| `type` | `'playlist' \| 'song'` | `'playlist'` | 查询类型 |
| `id` | `string \| number` | `''` | 歌单 / 单曲 id |
| `mode` | `'full' \| 'attach' \| 'mini'` | `'full'` | 展示形态 |
| `placement` | 四角 | `'bottomRight'` | 贴边位置，仅紧凑形态生效 |
| `offset` | `number \| string` | `16` | 距屏幕边缘距离 |
| `showLyrics` | `boolean` | `true` | 显示歌词面板 |
| `globalLyrics` | `boolean` | `false` | 底部全局歌词条 |
| `autoplay` | `boolean` | `false` | 自动播放（会被浏览器策略拦，组件已 catch） |
| `volume` | `number` | `0.7` | 初始音量 |
| `loop` | `'list' \| 'one' \| 'random'` | `'list'` | 初始循环模式 |
| `showPlaylist` | `boolean` | `true` | 显示播放列表按钮 |
| `lyricOffset` | `number` | `0` | 歌词偏移秒数，正数表示延后 |
| `errorText` | `string` | `'音乐加载失败，请检查 Meting API 配置'` | 兜底文案 |

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | `(track, index)` | 切歌 |
| `play` | `(playing: boolean)` | 播放状态变化 |
| `error` | `(error: Error)` | 歌单加载失败（歌词失败不派发） |

| 暴露方法 | 说明 |
| --- | --- |
| `play()` / `pause()` / `toggle()` | 播放控制 |
| `next()` / `prev()` | 上一首 / 下一首 |
| `seek(seconds)` | 跳到指定秒数 |
| `getCurrent()` | 读当前 `{ track, index, playing, currentTime, duration }` |

```vue
<SrMusicPlayer ref="player" api="..." id="..." />
<SrButton @click="player?.next()">下一首</SrButton>
```

### 导出的工具

| 函数 | 说明 |
| --- | --- |
| `buildMusicApiUrl(api, server, type, id)` | 拼 Meting 地址 |
| `fetchMusicTracks(api, server, type, id, signal?)` | 拉歌单，含脏数据剔除与错误翻译 |
| `fetchMusicLyric(url, signal?)` | 拉歌词，失败返回空串 |
| `parseLrc(raw)` | LRC 解析 |
| `findLyricIndex(lines, time, offset?)` | 二分定位当前行 |
| `resolveLyricText(lines, index, span?)` | 取当前应显示文本（含间奏回退） |
| `extractTrackId(url)` | 从播放地址反解曲目 id |

## 样式接入

```ts
import '@sunset-reverie/ui/components/music-player/style.css'
```

## 样式定制

```css
.my-player {
  --sr-music-width: 420px;      /* full 模式最大宽度 */
  --sr-music-radius: 16px;      /* 面板圆角 */
  --sr-music-cover: 64px;       /* 封面直径 */
}
```

颜色、阴影、间距全部走设计令牌，换主题自动跟随；玻璃质感下会自动叠上玻璃层。

## 注意事项

- **组件不内置曲库、不缓存音频**。断网或 API 挂掉就是加载失败，没有本地兜底。
- **不要用 `<audio loop>` 做单曲循环**。原生 loop 绕过组件状态机，播放状态与切歌逻辑会失控；组件内部是手动归零再播。
- **切歌后立刻 `play()` 会播上一首**。`:src` 是响应式更新，要等 patch 完成；组件里用 `nextTick` + 一个宏任务兜住了这个时序。
- **歌词失败是常态**（纯音乐、冷门曲），组件静默显示「暂无歌词」，不影响播放。
- **浏览器会拦截无用户手势的自动播放**。`autoplay` 只对已授权站点有效，被拦时组件把状态纠正为暂停，不会卡在错误的按钮状态。
- **歌单里的空 `url` 条目会被剔除**。音源对下架歌曲返回空地址，留着就是「点了没声音」。
- **列表 key 用曲目 id 而不是名字**。同名同艺术家的 Live 版 / 原版很常见，用名字会复用错乱。
- **`mode` / `placement` 是初始值语义**，运行中改会重新计算定位；`volume` 与 `globalLyrics` 会单向同步到内部状态。
