<script setup lang="ts">
import { ref } from 'vue'
import { SrMusicPlayer, SrPanel, SrSwitch, SrTabs } from '@sunset-reverie/ui'
import type { SrMusicPlacement, SrMusicTrack, SrTabsItem } from '@sunset-reverie/ui'

defineOptions({ name: 'MusicPlayerDemo' })

/** 公共 Meting 实例：生产环境建议自建 */
const API = 'https://meting-api.shurans.cn/'

/** 网易云歌单 id，从分享链接里取 */
const PLAYLIST_ID = '2585465480'

/** 事件日志 */
const events = ref<string[]>([])

/**
 * 记一条日志
 * @param text 文案
 */
function log(text: string): void {
  events.value = [text, ...events.value].slice(0, 4)
}

/**
 * 切歌
 * @param track 曲目
 * @param index 索引
 */
function onChange(track: SrMusicTrack, index: number): void {
  log(`切歌：${track.name}（#${index + 1}）`)
}

/**
 * 播放状态
 * @param playing 是否在播
 */
function onPlay(playing: boolean): void {
  log(playing ? '开始播放' : '暂停')
}

/**
 * 加载失败
 * @param error 错误
 */
function onError(error: Error): void {
  log(`加载失败：${error.message}`)
}

/** 吸附模式是否显示 */
const attachOn = ref(false)

/** 吸附位置 */
const attachPlacement = ref<SrMusicPlacement>('bottomRight')

/** 精简模式是否显示 */
const miniOn = ref(false)

/** 精简位置（与吸附分开，两者收起态都是独立的 fixed 元素） */
const miniPlacement = ref<SrMusicPlacement>('bottomLeft')

/** 精简模式是否开全局歌词 */
const miniGlobalLyrics = ref(false)

/** 全局底部歌词演示是否显示 */
const globalOn = ref(false)

/** 位置标签 */
const placementTabs: SrTabsItem[] = [
  { key: 'topLeft', label: '左上' },
  { key: 'topRight', label: '右上' },
  { key: 'bottomLeft', label: '左下' },
  { key: 'bottomRight', label: '右下' },
]

/**
 * 切换吸附位置
 * @param value 标签 key
 */
function setAttachPlacement(value: string): void {
  attachPlacement.value = value as SrMusicPlacement
}

/**
 * 切换精简位置
 * @param value 标签 key
 */
function setMiniPlacement(value: string): void {
  miniPlacement.value = value as SrMusicPlacement
}
</script>

<template>
  <div class="demo">
    <SrPanel title="完整模式" description="常驻显示封面、歌曲信息、进度、控制条与歌词面板">
      <SrMusicPlayer
        :id="PLAYLIST_ID"
        :api="API"
        server="netease"
        type="playlist"
        @change="onChange"
        @play="onPlay"
        @error="onError"
      />

      <div class="notes">
        <p class="note">
          封面在播放时会缓慢自转，暂停则停在当前角度——用
          <code>animation-play-state</code> 实现，而不是关掉再打开动画：后者每次都从 0°
          重新开始，视觉上是「跳一下再转」，而真实唱片暂停后再播是从原处继续的。
        </p>
        <p class="note">
          转的是封面图本身，不是叠在上面那圈唱片分隔环。分隔环是轴对称图形，转它肉眼完全看不出变化；
          封面图带图案和文字，转起来才看得出「正在播」。
        </p>
        <p class="note">
          进度条与音量用的都是原生 <code>input[type=range]</code>：键盘方向键、无障碍朗读、移动端手势
          全都是白送的。自定义 div 要补一大堆 ARIA 与键盘处理，还容易漏。
        </p>
        <p class="note">
          右上角的全局歌词图标在那个角落，默认是关的：图标常驻而不是按 <code>global-lyrics</code>
          显隐——传参只决定初始状态，运行时的开关归用户，图标时有时无反而让人以为功能丢了。
        </p>
        <p class="hint">事件：{{ events.length ? events.join(' · ') : '（还没有事件）' }}</p>
      </div>
    </SrPanel>

    <SrPanel title="吸附模式 attach">
      <div class="toolbar">
        <SrTabs
          :model-value="attachPlacement"
          :items="placementTabs"
          type="pill"
          size="sm"
          @update:model-value="setAttachPlacement"
        />
        <SrSwitch v-model="attachOn" size="sm" />
      </div>

      <SrMusicPlayer
        v-if="attachOn"
        :id="PLAYLIST_ID"
        :api="API"
        mode="attach"
        :placement="attachPlacement"
      />
      <div v-if="!attachOn" class="placeholder">
        未启用。打开上方开关后，收起态会作为一个贴边圆钮出现在对应角落。
      </div>

      <div class="notes">
        <p class="note">
          收起为贴着屏幕边缘的小圆钮，鼠标移入先展开<strong>精简卡片</strong>：封面、歌名、进度、 上一首 /
          播放 /
          下一首，外加右上角的展开按钮。<strong>点卡片任意空白处</strong>（封面、歌名、留白）或右上角展开按钮，
          都会铺开<strong>完整面板</strong>（循环、歌词、歌单、音量）；播放、切歌、进度条这些可操控控件仍只做自己的事，
          不会顺带展开。圆钮在播放时会自转，暗示「正在响」；暂停则停住。
        </p>
        <p class="note">
          分两段而不是一步到位：悬停是「顺手看一眼、随手暂停」的轻动作，一上来就弹出歌词和 148
          首歌的歌单太压人； 真要看歌词或选歌，多一次点击也明确得多。展开热区覆盖整卡，是为了不用瞄准那个 15px
          的小箭头；控件用事件委托统一排除，新增按钮也不会误触。每次重新悬停都会退回精简卡片，不会记住上次的展开状态。
        </p>
        <p class="note">
          精简卡片的右上角让给了展开按钮，所以这一阶段没有全局歌词开关——同一个角落塞两个图标，位置会随形态左右跳，
          用户记不住。铺开成完整面板后它就在那儿，且默认关闭。
        </p>
        <p class="note">
          鼠标移出后 320ms
          自动收起，无需关闭按钮。不立即收起是因为鼠标从圆钮移向面板、或在面板内部从一个子元素移到另一个时，
          中途会短暂掠出边界，立即收起会让面板不停闪烁；320ms 足够走完这段距离，又短到不觉得拖沓。
        </p>
        <p class="note">
          圆钮是完整正圆，只是把圆心推到屏幕边缘外侧 12px，视觉上咬住边缘、不留悬空的切点感。
          刻意不做「贴边切平」——封面播放时会自转，方形封面转到直角边时，直边与弧边对比强烈，整个钮看起来就是方的。
        </p>
        <p class="note">
          层级：面板与圆钮都 <code>Teleport</code> 到 <code>body</code>，配合最高的
          <code>--sr-z-popover</code>。两者缺一不可——<code>fixed</code> 元素若留在祖先链里， 任意一个带
          <code>transform</code> / <code>filter</code> 的祖先都会创建 stacking context 把它困住， 此时
          <code>z-index</code> 只在那个局部语境里比较，页面外层随便一个定位元素都能压住它。
        </p>
      </div>
    </SrPanel>

    <SrPanel title="精简模式 mini">
      <div class="toolbar">
        <SrTabs
          :model-value="miniPlacement"
          :items="placementTabs"
          type="pill"
          size="sm"
          @update:model-value="setMiniPlacement"
        />
        <div class="toolbar-group">
          <span class="row-label">全局歌词</span>
          <SrSwitch v-model="miniGlobalLyrics" size="sm" />
          <SrSwitch v-model="miniOn" size="sm" />
        </div>
      </div>

      <SrMusicPlayer
        v-if="miniOn"
        :id="PLAYLIST_ID"
        :api="API"
        mode="mini"
        :placement="miniPlacement"
        :global-lyrics="miniGlobalLyrics"
      />
      <div v-if="!miniOn" class="placeholder">
        未启用。打开上方开关后，收起态会作为一条贴边胶囊条出现在屏幕边缘。
      </div>

      <div class="notes">
        <p class="note">
          收起为贴近屏幕边缘的常驻胶囊条（封面 + 歌名 - 歌手），不需要鼠标移入唤出——它一直就在那儿，随时可用。
        </p>
        <p class="note">
          封面就是播放开关——悬停会盖上一层播放/暂停图标，点了直接控制播放，不用先展开面板。
          点歌名才展开完整播放器。
        </p>
        <p class="note">
          播放时文字区会变成当前歌词，随播放逐行切换（主色显示，与歌名区分）；暂停或无歌词则回退成「歌名 -
          歌手」。
          所以胶囊任何时候都有内容，不会出现空白，常驻在屏幕上也不像个静止的装饰。歌词取值与底部全局歌词同源
          （<code>resolveLyricText</code>），间奏回退等规则一致。
        </p>
        <p class="note">
          这与 <code>attach</code> 的关键差别在收起态能做什么：<code>attach</code>
          收起时只是一个圆钮，想暂停得先悬停唤出精简卡片再点；<code>mini</code>
          收起时就能直接播放，展开退为备选动作。需要「一眼看到在放什么、随手能暂停」就用 <code>mini</code>
          。
        </p>
        <p class="note">
          悬停封面时只加遮罩、不做缩放——那是圆形按钮的常见手法，但这里封面还在自转，缩放会让「圆形在转」变成「圆形在跳」。
        </p>
      </div>
    </SrPanel>

    <SrPanel title="全局底部歌词">
      <div class="toolbar">
        <SrSwitch v-model="globalOn" size="sm" />
      </div>

      <SrMusicPlayer
        v-if="globalOn"
        :id="PLAYLIST_ID"
        :api="API"
        mode="attach"
        placement="bottomLeft"
        global-lyrics
        :show-lyrics="false"
      />
      <div v-if="!globalOn" class="placeholder">
        未启用。打开上方开关后，左下角会出现一个贴边圆钮，播放时屏幕底部会固定显示当前歌词。
        它与吸附模式的圆钮是两个独立的播放器实例——同时打开就会看到两个圆钮，不是重复渲染。
      </div>

      <div class="notes">
        <p class="note">
          <code>global-lyrics</code>
          开启后在屏幕底部固定一条当前歌词，与页面内容无关——滚到哪都能看到，适合做「字幕」。
        </p>
        <p class="note">
          面板右上角的歌词图标<strong>常驻</strong>，默认关闭，不随传参显隐——传参只决定初始状态，
          运行时的开关归用户，图标时有时无反而让人以为功能丢了。临时关掉字幕通常是一次性的观看偏好，
          没有持久化价值，不该逼着宿主回去改传参。
        </p>
        <p class="note">
          图标开着也不等于歌词条一直在：条只在<strong>播放中且当前有词</strong>时出现，暂停就整条隐去——
          静止地挂一句再也不变的词，看着像加载卡住了。
        </p>
        <p class="note">
          歌词条 <code>Teleport</code> 到 <code>body</code>，不受父级 <code>overflow</code> 影响； 并且
          <code>pointer-events: none</code>——它只是字幕，不该挡住页面上的按钮。
        </p>
        <p class="note">
          当前行是间奏（空行）时会向前回退到最近一句有词的，而不是显示空白——空行会让歌词条间歇性消失再出现，看起来很抖。
        </p>
      </div>
    </SrPanel>

    <SrPanel title="API 配置">
      <pre class="code">{{ `<SrMusicPlayer
  api="${API}"
  server="netease"
  type="playlist"
  id="${PLAYLIST_ID}"
/>` }}</pre>

      <ul class="list">
        <li>
          <code>api</code> 只填到域名（含协议），不要带 <code>/api</code> 之类的路径后缀——
          不同部署方式的路径不一样，组件会自行拼接查询参数。
        </li>
        <li><code>server</code>：<code>netease</code>（默认）/ <code>tencent</code>。</li>
        <li>
          <code>type</code>：组件只接受能返回歌曲列表的 <code>playlist</code>（默认）与 <code>song</code>。
        </li>
        <li>
          <code>id</code>：歌单 id 从分享链接取，如 <code>music.163.com/playlist?id=2585465480</code>
          中的数字部分。
        </li>
        <li>换音源必须换 id：各音源曲库不同，同一个 id 在不同音源下指向完全不同的内容。</li>
        <li>
          id 写错不会报 HTTP 错误：接口返回 <code>{'{"error":"unknown playlist id"}'}</code> 且状态码仍是
          200。 这类「成功状态码 + 错误内容」的响应只能靠解析 body
          才能发现，组件会识别并把服务端的错误原样透出。
        </li>
        <li>
          除上面两个列表类型，接口还支持单字段查询：<code>name</code> 歌名、<code>artist</code> 歌手、
          <code>url</code> 播放链接、<code>pic</code> 封面、<code>lrc</code> 歌词。它们返回的是纯字符串
          （部分是重定向地址），不是歌曲列表，无法驱动播放，但宿主可以用
          <code>buildMusicApiUrl()</code> 单独调用。
        </li>
        <li>
          演示用的是公共 Meting 服务（<code>meting-api.shurans.cn</code>），仅用于开发与体验。生产环境请自建：
          公共服务的带宽、可用性、曲库变动都不受你控制。
        </li>
        <li>
          另外注意 HTTPS：页面是 https 时 <code>api</code> 也必须用
          https，否则音频与封面会被浏览器按混合内容拦截。
        </li>
      </ul>
    </SrPanel>

    <SrPanel title="实现说明">
      <ul class="list">
        <li>只负责播放与展示：不内置曲库、不依赖任何第三方播放器库，歌单完全由 Meting API 提供。</li>
        <li>
          三种形态共用一套面板，差别只在外壳：<code>full</code> 常驻原地，<code>attach</code> /
          <code>mini</code>
          收起为贴边元素；写成两套模板的话任何改动都要同步两遍。
        </li>
        <li>歌词二分查找：播放期间每秒会查好几次，上百行歌词用线性扫描纯属浪费。</li>
        <li>
          歌词自动居中用 <code>scrollTo</code> 而不用
          <code>scrollIntoView</code>——后者会连带滚动所有可滚祖先，
          包括整个页面，用户正在看评论时页面会突然跳一下。
        </li>
        <li>
          <code>autoplay</code> 要捕获 Promise：无用户交互时浏览器会拒绝播放，不捕获会产生未处理的 Promise
          警告，按钮状态也会与实际不符。
        </li>
        <li>
          间奏不隐藏：空行保留为时间锚点，显示成「· · ·」而不是隐藏，否则歌词列表的高度会随播放不断变化。
        </li>
        <li>
          歌单与歌词面板都不显示滚动条：滚动轨道是矩形的，容器却有四角圆角，滚动条会从圆角外缘冒出来，
          颜色怎么调都对不齐。靠滚轮与触摸滚动即可，另加
          <code>overscroll-behavior: contain</code>
          拦住滚动链，免得滚到列表尽头又带动外层页面。顺带也绕开了
          <code>scrollbar-width</code>
          /
          <code>scrollbar-color</code>
          的继承问题——这两个是继承属性，紧凑形态 <code>Teleport</code> 到
          <code>body</code>
          后继承链变了，就会退回系统默认的粗滚动条。
        </li>
      </ul>
    </SrPanel>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.row-label {
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.notes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}

.hint {
  color: var(--sr-color-text-tertiary);
  font-size: 12.5px;
  line-height: 1.7;
}

.note {
  margin: 0;
  color: var(--sr-color-text-secondary);
  font-size: 12.5px;
  line-height: 1.8;
}

.placeholder {
  padding: 14px 16px;
  border: 1px dashed var(--sr-color-border);
  border-radius: var(--sr-radius-md);
  color: var(--sr-color-text-tertiary);
  font-size: 12.5px;
  line-height: 1.7;
}

.code {
  margin: 0 0 12px;
  padding: 12px 14px;
  overflow-x: auto;
  border-radius: var(--sr-radius-md);
  background: var(--sr-color-bg-sunken);
  font-family: var(--sr-font-family-mono);
  font-size: 12px;
}

.list {
  margin: 0;
  padding-left: 18px;
  color: var(--sr-color-text-secondary);
  font-size: 12.5px;
  line-height: 1.9;
}
</style>
