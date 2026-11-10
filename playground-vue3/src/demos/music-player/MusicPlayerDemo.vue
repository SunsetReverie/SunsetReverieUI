<script setup lang="ts">
import { ref } from 'vue'
import { SrMusicPlayer, SrSegmented, SrSwitch, SrTag } from '@sunset-reverie/ui'
import type { SrMusicPlacement, SrMusicTrack } from '@sunset-reverie/ui'

defineOptions({ name: 'MusicPlayerDemo' })

/** 公共 Meting 实例：生产环境建议自建，公共实例随时可能限流 */
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
  events.value = [text, ...events.value].slice(0, 5)
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

/** 胶囊模式是否显示 */
const miniOn = ref(false)

/** 胶囊位置（与吸附分开，两者收起态都是独立的 fixed 元素） */
const miniPlacement = ref<SrMusicPlacement>('bottomLeft')

/** 位置选项 */
const placementOptions = [
  { label: '左上', value: 'topLeft' },
  { label: '右上', value: 'topRight' },
  { label: '左下', value: 'bottomLeft' },
  { label: '右下', value: 'bottomRight' },
]
</script>

<template>
  <div class="demo">
    <section>
      <h3>完整模式</h3>
      <SrMusicPlayer
        :id="PLAYLIST_ID"
        :api="API"
        server="netease"
        type="playlist"
        @change="onChange"
        @play="onPlay"
        @error="onError"
      />
      <p class="hint">
        封面在播放时缓慢自转——转的是封面图而不是外圈，外圈是轴对称的转起来看不出来； 暂停用的是
        <code>animation-play-state</code>，不会回到 0° 重来。
      </p>
      <p class="hint">事件：{{ events.length ? events.join(' · ') : '（还没开始播放）' }}</p>
    </section>

    <section>
      <h3>吸附模式 attach</h3>
      <div class="row">
        <SrSwitch v-model="attachOn" size="sm" />
        <span class="row-label">显示悬浮圆钮</span>
        <SrSegmented v-model="attachPlacement" :options="placementOptions" size="sm" />
      </div>
      <SrTag size="sm">默认关闭，避免和下面的胶囊条叠在同一个角</SrTag>
      <SrMusicPlayer
        v-if="attachOn"
        :id="PLAYLIST_ID"
        :api="API"
        mode="attach"
        :placement="attachPlacement"
      />
      <p class="hint">
        收起时是贴边圆钮，悬停即展开、移开 320ms 后自动收回。面板被 Teleport 到 body—— 留在祖先链里会被带
        <code>transform</code> 的父级困在低层级 stacking context 里，
        <code>z-index</code> 再高也压不住别的元素。
      </p>
    </section>

    <section>
      <h3>精简模式 mini</h3>
      <div class="row">
        <SrSwitch v-model="miniOn" size="sm" />
        <span class="row-label">显示胶囊条</span>
        <SrSegmented v-model="miniPlacement" :options="placementOptions" size="sm" />
      </div>
      <SrMusicPlayer
        v-if="miniOn"
        :id="PLAYLIST_ID"
        :api="API"
        mode="mini"
        :placement="miniPlacement"
        global-lyrics
      />
      <p class="hint">
        封面本身就是播放开关，点文字区域才展开面板；播放时有歌词就显示当前歌词，暂停则回到歌名。 和 attach
        的关键差别：胶囊条常驻可见，不需要悬停。
      </p>
    </section>

    <section>
      <h3>API 配置</h3>
      <pre
        class="code"
      >{{ `<SrMusicPlayer api="${API}" server="netease" type="playlist" id="${PLAYLIST_ID}" />` }}</pre>
      <ul class="list">
        <li><code>api</code> 只填到域名，<code>?server=&amp;type=&amp;id=</code> 由组件拼。</li>
        <li>
          <code>server</code> 支持 <code>netease</code> / <code>tencent</code>，<strong
            >换音源必须换 id</strong
          >，同一个歌单 id 两家不通用。
        </li>
        <li>
          <code>type</code> 只接受 <code>playlist</code> 与 <code>song</code>；单字段查询（name / artist / url
          / pic / lrc）用导出的 <code>buildMusicApiUrl</code> 自己调。
        </li>
        <li>
          Meting 对不存在的 id 会返回 <strong>HTTP 200 + <code>{"error":"..."}</code></strong
          >，组件已经先探 error 再判断，报错文案里保留服务端原文。
        </li>
        <li>页面是 https 时 API 也必须 https，否则音频会被混合内容策略拦掉。</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.demo section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hint {
  color: var(--sr-color-text-tertiary);
  font-size: 12.5px;
  line-height: 1.7;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.row-label {
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.code {
  margin: 0;
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
