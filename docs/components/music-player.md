# SrMusicPlayer 音乐播放器

基于 Meting API 的播放器：歌单实时拉取、LRC 歌词滚动、三种形态（完整 / 吸附 / 胶囊）。**不内置曲库**，只负责播放与展示。

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
<SrMusicPlayer
  api="https://meting-api.shurans.cn/"
  server="netease"
  type="playlist"
  id="2585465480"
/>
```

四个信息：**API 域名**、**音源**、**查询类型**、**id**。

- `api` 只填到域名，`?server=&type=&id=` 由组件拼
- `id` 从分享链接取：`music.163.com/playlist?id=2585465480` 里那一串
- **换音源必须换 id**，同一个歌单 id 在网易云和 QQ 音乐之间不通用

## 交互演示

<div class="sr-demo">
  <SrMusicPlayer
    :id="PLAYLIST_ID"
    :api="API"
    server="netease"
    type="playlist"
    @change="(track, index) => log(`切歌：${track.name}（#${index + 1}）`)"
    @play="(playing) => log(playing ? '开始播放' : '暂停')"
    @error="(error) => log(`加载失败：${error.message}`)"
  />
  <p style="margin-top: 12px; color: var(--sr-color-text-tertiary); font-size: 12.5px">
    {{ events.length ? events.join(' · ') : '（还没有事件）' }}
  </p>
</div>

## 完整模式

常驻显示封面、歌曲信息、进度、控制条与歌词面板。

```vue
<SrMusicPlayer api="..." id="..." />
```

**封面在播放时缓慢自转，暂停停在当前角度**——用 `animation-play-state` 实现，而不是关掉再打开动画：后者每次都从 0° 重新开始，视觉上是「跳一下再转」，而真实唱片暂停后再播是从原处继续的。

转的是**封面图本身**，不是叠在上面那圈唱片分隔环。分隔环是轴对称图形，转它肉眼完全看不出变化；封面图带图案和文字，转起来才看得出「正在播」。

进度条与音量用的都是原生 `input[type=range]`：键盘方向键、无障碍朗读、移动端手势全都是白送的。自定义 div 要补一大堆 ARIA 与键盘处理，还容易漏。

## 吸附模式 attach

收起为贴着屏幕边缘的小圆钮，鼠标移入或点击后展开完整播放器。适合做背景音乐——不占地方，需要时才出现。

```vue
<SrMusicPlayer api="..." id="..." mode="attach" placement="bottomRight" :offset="16" />
```

圆钮在播放时会自转，暗示「正在响」；暂停则停住。

**鼠标移出后 320ms 自动收起**，无需关闭按钮。不立即收起是因为鼠标从圆钮移向面板、或在面板内部从一个子元素移到另一个时，中途会短暂掠出边界，立即收起会让面板不停闪烁；320ms 足够走完这段距离，又短到不觉得拖沓。移回面板即取消收起。

圆钮是完整正圆，只把圆心推到屏幕边缘外侧 12px，视觉上咬住边缘、不留悬空的切点感。刻意不做「贴边切平」——封面播放时会自转，方形封面转到直角边时，直边与弧边对比强烈，整个钮看起来就是方的。

::: tip 层级：Teleport + z-index
面板与圆钮都 `Teleport` 到 `body`，配合最高的 `--sr-z-popover`。两者缺一不可——`fixed` 元素若留在祖先链里，任意一个带 `transform` / `filter` 的祖先都会创建 stacking context 把它困住，此时 `z-index` 只在那个局部语境里比较，页面外层随便一个定位元素都能压住它。
:::

## 精简模式 mini

收起为贴近屏幕边缘的常驻胶囊条（封面 + 歌名 - 歌手），不需要鼠标移入唤出——它一直就在那儿，随时可用。

```vue
<SrMusicPlayer api="..." id="..." mode="mini" placement="bottomLeft" />
```

**封面就是播放开关**——悬停会盖上一层播放/暂停图标，点了直接控制播放，不用先展开面板。点歌名才展开完整播放器。

播放时文字区会变成当前歌词，随播放逐行切换（主色显示，与歌名区分）；暂停或无歌词则回退成「歌名 - 歌手」。所以胶囊任何时候都有内容，不会出现空白。歌词取值与底部全局歌词同源（`resolveLyricText`），间奏回退等规则一致。

与 `attach` 的关键差别在**收起态能做什么**：`attach` 收起时只能展开，每次想暂停都得先展开再点；`mini` 收起时可以直接播放，展开退为备选动作。需要「一眼看到在放什么、随手能暂停」就用 `mini`。

悬停封面时只加遮罩、不做缩放——那是圆形按钮的常见手法，但这里封面还在自转，缩放会让「圆形在转」变成「圆形在跳」。

## 全局底部歌词

`global-lyrics` 开启后在屏幕底部固定一条当前歌词，与页面内容无关——滚到哪都能看到，适合做「字幕」。

```vue
<SrMusicPlayer api="..." id="..." mode="attach" global-lyrics />
```

面板右上角有同一个开关，可以在运行时临时关掉。这个开关是组件内部状态，只以 `global-lyrics` 为**初始值**——「临时关掉字幕」通常是一次性的观看偏好，没有持久化价值，不该逼着宿主回去改传参。

歌词条 `Teleport` 到 `body`，不受父级 `overflow` 影响；并且 `pointer-events: none`——它只是字幕，不该挡住页面上的按钮。

当前行是间奏（空行）时会向前回退到最近一句有词的，而不是显示空白——空行会让歌词条间歇性消失再出现，看起来很抖。回退有上限，长间奏不会翻出很久以前的歌词。

## 歌词

LRC 由组件自己解析，不依赖第三方库：

| 能力 | 说明 |
| --- | --- |
| 多时间标签 | `[00:01][00:10]副歌` 拆成两条，同一句在多段重复出现 |
| 元信息行 | `[ti:]` / `[ar:]` / `[offset:]` 整行跳过 |
| 空行锚点 | 只有时间没有文字的行保留，渲染成 `· · ·`，删掉会让列表高度随播放跳动 |
| 双语合并 | 同一时间戳的第二行视作翻译，小字显示在正文下方 |
| 二分定位 | 播放期间每秒多次查询，上百行用二分而不是线性扫描 |
| 间奏回退 | 当前行是空行时显示上一句（最多回退 8 行），避免歌词一闪一闪 |

点任意歌词行可以直接跳到那一句。`lyric-offset` 可以整体校正音源偏差：

```vue
<SrMusicPlayer api="..." id="..." :lyric-offset="0.3" />
```

## API 配置

组件拼出来的地址形如：

```
https://meting-api.shurans.cn/?server=netease&type=playlist&id=2585465480
```

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| `api` | 域名（含协议） | 不要带 `/api` 之类的路径后缀——不同部署方式路径不一样，组件自行拼查询参数 |
| `server` | `netease` / `tencent` | 音源，默认 `netease` |
| `type` | `playlist` / `song` | 只接受能返回歌曲列表的两种 |
| `id` | 歌单 / 歌曲 id | 从分享链接取，**换音源必须换 id** |

除上面两种，接口还支持单字段查询：`name` 歌名、`artist` 歌手、`url` 播放链接、`pic` 封面、`lrc` 歌词。它们返回纯字符串（部分是重定向地址），不是歌曲列表，无法驱动播放，但宿主可以用导出的 `buildMusicApiUrl()` 单独调用：

```ts
import { buildMusicApiUrl } from '@sunset-reverie/ui'

const cover = buildMusicApiUrl('https://meting-api.shurans.cn/', 'netease', 'pic', '18876415625748787')
```

::: warning id 写错不会报 HTTP 错误
接口会返回 `{"error":"unknown playlist id"}` 而状态码仍是 **200**。这类「成功状态码 + 错误内容」的响应只能靠解析 body 才能发现，组件已识别并把服务端原文透出。
:::

::: tip 生产环境请自建
演示用的是公共 Meting 服务，仅用于开发与体验。公共服务的带宽、可用性、曲库变动都不受你控制，接口限流会直接让页面上的播放器失效。
:::

::: warning HTTPS 混合内容
页面是 https 时 `api` 也必须用 https，否则音频与封面会被浏览器按混合内容拦截。
:::

## API

### SrMusicPlayer

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `api` | `string` | `'https://meting-api.shurans.cn/'` | Meting 域名 |
| `server` | `'netease' \| 'tencent'` | `'netease'` | 音源 |
| `type` | `'playlist' \| 'song'` | `'playlist'` | 查询类型 |
| `id` | `string \| number` | `''` | 歌单 / 单曲 id |
| `mode` | `'full' \| 'attach' \| 'mini'` | `'full'` | 展示形态 |
| `placement` | 四角 | `'bottomRight'` | 贴边位置，仅紧凑形态生效 |
| `offset` | `number \| string` | `16` | 距屏幕边缘距离 |
| `showLyrics` | `boolean` | `true` | 显示歌词面板 |
| `globalLyrics` | `boolean` | `false` | 底部全局歌词（初始值） |
| `autoplay` | `boolean` | `false` | 自动播放 |
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
  --sr-music-cover-size: 64px;         /* 封面直径 */
  --sr-music-radius: var(--sr-radius-xl); /* 面板圆角 */
  --sr-music-panel-bg: var(--sr-color-bg-modal); /* 面板底色 */
}
```

面板、圆钮、胶囊、底部歌词条都走玻璃配方（`.sr-glass-layer()`），底色是半透明的 `--sr-color-bg-modal`，换主题时自动跟随；其余间距、字号、按钮尺寸用设计令牌控制。

## 实现说明

- **只负责播放与展示**：不内置曲库、不依赖任何第三方播放器库，歌单完全由 Meting API 提供。
- **三种形态共用一套面板**，差别只在外壳：`full` 常驻原地，`attach` / `mini` 收起为贴边元素；写成两套模板的话任何改动都要同步两遍。
- **歌词二分查找**：播放期间每秒会查好几次，上百行歌词用线性扫描纯属浪费。
- **歌词自动居中用 `scrollTo`** 而不是 `scrollIntoView`——后者会连带滚动所有可滚祖先，包括整个页面，用户正在看评论时页面会突然跳一下。位置用两个矩形相减算，不依赖 `offsetTop` 的定位祖先。
- **`autoplay` 要捕获 Promise**：无用户交互时浏览器会拒绝播放，不捕获会产生未处理的 Promise 警告，按钮状态也会与实际不符。
- **间奏不隐藏**：空行保留为时间锚点，显示成「· · ·」，否则歌词列表高度会随播放不断变化。

## 注意事项

- **组件不缓存音频**。断网或 API 挂掉就是加载失败，没有本地兜底。
- **不要用 `<audio loop>` 做单曲循环**。原生 loop 绕过组件状态机，播放状态与切歌逻辑会失控；组件内部是手动归零再播。
- **切歌后立刻 `play()` 会播上一首**。`:src` 是响应式更新，要等 patch 完成；组件里用 `nextTick` + 一个宏任务兜住了这个时序。
- **歌单里的空 `url` 条目会被剔除**。音源对下架歌曲返回空地址，留着就是「点了没声音」。
- **列表 key 用曲目 id 而不是名字**。同名同艺术家的 Live 版 / 原版很常见，用名字会复用错乱。
- **组件卸载会暂停音频**并清掉 `src`，不会出现「关掉组件音乐还在响」。
