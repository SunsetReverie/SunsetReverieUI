<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { fetchMusicLyric, fetchMusicTracks } from './api'
import { findLyricIndex, parseLrc, resolveLyricText } from './lrc'
import { MUSIC_LOOP_MAP, MUSIC_LOOP_ORDER, musicPlayerProps } from './music-player'

import type { SrLyricLine, SrMusicLoop, SrMusicTrack } from './types'

defineOptions({ name: 'SrMusicPlayer', inheritAttrs: false })

const props = defineProps(musicPlayerProps)

const emit = defineEmits<{
  /** 切歌 */
  change: [track: SrMusicTrack, index: number]
  /** 播放状态变化 */
  play: [playing: boolean]
  /** 歌单加载失败 */
  error: [error: Error]
}>()

/** 音频元素 */
const audioRef = ref<HTMLAudioElement | null>(null)

/** 歌词滚动容器 */
const lyricBoxRef = ref<HTMLElement | null>(null)

/** 曲目列表 */
const tracks = ref<SrMusicTrack[]>([])

/** 当前曲目索引 */
const currentIndex = ref(0)

/** 是否正在播放 */
const playing = ref(false)

/** 歌单加载中 */
const loading = ref(true)

/** 歌单加载失败文案 */
const loadError = ref('')

/** 当前播放进度（秒） */
const currentTime = ref(0)

/** 总时长（秒） */
const duration = ref(0)

/** 音量 0~1 */
const volume = ref(props.volume)

/** 是否静音 */
const muted = ref(false)

/** 循环模式 */
const loopMode = ref<SrMusicLoop>(props.loop)

/** 歌词 */
const lyrics = ref<SrLyricLine[]>([])

/** 歌词加载中 */
const lyricLoading = ref(false)

/** 歌词面板展开 */
const lyricOpen = ref(props.showLyrics)

/** 歌单面板展开 */
const playlistOpen = ref(false)

/** 紧凑态是否展开 */
const miniExpanded = ref(false)

/** 底部全局歌词条是否显示 */
const globalLyricOpen = ref(props.globalLyrics)

/** 歌单请求控制器 */
let trackController: AbortController | null = null

/** 歌词请求控制器 */
let lyricController: AbortController | null = null

/** 紧凑态收起的延时句柄 */
let miniLeaveTimer: ReturnType<typeof setTimeout> | undefined

/** 鼠标移出后多久收起 */
const MINI_LEAVE_DELAY = 320

/** 当前曲目 */
const currentTrack = computed<SrMusicTrack | undefined>(() => tracks.value[currentIndex.value])

/** 是否有可播放曲目 */
const hasTracks = computed(() => tracks.value.length > 0)

/** 进度百分比 */
const progressPercent = computed(() =>
  duration.value > 0 ? Math.min(100, (currentTime.value / duration.value) * 100) : 0,
)

/** 当前歌词行索引 */
const lyricIndex = computed(() => findLyricIndex(lyrics.value, currentTime.value, props.lyricOffset))

/** 当前应展示的歌词文本 */
const activeLyric = computed(() => {
  const line = lyrics.value[lyricIndex.value]
  return line?.translation
    ? `${line.text} / ${line.translation}`
    : resolveLyricText(lyrics.value, lyricIndex.value)
})

/** 底部全局歌词文字：暂停时退回歌名，避免静止地挂一句歌词 */
const globalLyricText = computed(() => (playing.value ? activeLyric.value : ''))

/** 是否显示全局歌词条 */
const showGlobalLyric = computed(() => globalLyricOpen.value && !!globalLyricText.value && !loadError.value)

/** 是否紧凑形态 */
const isCompact = computed(() => props.mode !== 'full')

/** 面板是否可见 */
const showPanel = computed(() => props.mode === 'full' || miniExpanded.value)

/** 循环模式信息 */
const loopInfo = computed(() => MUSIC_LOOP_MAP[loopMode.value])

/** 根节点类名 */
const rootClass = computed(() => [
  `sr-music--${props.mode}`,
  `sr-music--${props.placement}`,
  {
    'is-compact': isCompact.value,
    'is-expanded': showPanel.value,
    'is-playing': playing.value,
  },
])

/**
 * 紧凑形态的定位
 *
 * @returns 定位样式；完整形态留在文档流里，不参与定位
 */
const anchorStyle = computed(() => {
  if (!isCompact.value) return undefined

  const gap = typeof props.offset === 'number' ? `${props.offset}px` : props.offset
  const horizontal = props.placement.endsWith('Left') ? 'left' : 'right'
  const vertical = props.placement.startsWith('top') ? 'top' : 'bottom'

  return {
    position: 'fixed',
    [horizontal]: gap,
    [vertical]: gap,
  } as Record<string, string>
})

/**
 * 秒数格式化为 mm:ss
 *
 * @param seconds 秒数
 * @returns 形如 `03:07`
 */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'

  const minute = Math.floor(seconds / 60)
  const second = Math.floor(seconds % 60)

  return `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
}

/**
 * 拉取歌单
 *
 * @remarks 每次重载先中断上一个请求，否则慢的旧请求会覆盖新数据。
 */
async function loadTracks(): Promise<void> {
  trackController?.abort()
  const controller = new AbortController()
  trackController = controller

  loading.value = true
  loadError.value = ''

  if (!props.id) {
    loading.value = false
    loadError.value = '缺少歌单 id'
    return
  }

  try {
    const list = await fetchMusicTracks(props.api, props.server, props.type, props.id, controller.signal)

    if (controller.signal.aborted) return

    tracks.value = list
    if (!list.length) {
      loadError.value = '这个歌单里没有可播放的曲目'
      return
    }

    currentIndex.value = 0
    void loadLyrics()
  } catch (error) {
    // 主动取消不算失败
    if (controller.signal.aborted) return

    loadError.value = error instanceof Error ? error.message : props.errorText
    emit('error', error instanceof Error ? error : new Error(props.errorText))
  } finally {
    // 被取消的旧请求不能把新请求的 loading 关掉
    if (!controller.signal.aborted) loading.value = false
  }
}

/**
 * 拉取当前曲目的歌词
 *
 * @remarks 歌词失败是常态（纯音乐、冷门曲），静默置空，不影响播放。
 */
async function loadLyrics(): Promise<void> {
  lyricController?.abort()
  const controller = new AbortController()
  lyricController = controller

  lyrics.value = []

  const track = currentTrack.value
  if (!track?.lrc) {
    lyricLoading.value = false
    return
  }

  lyricLoading.value = true

  try {
    const text = await fetchMusicLyric(track.lrc, controller.signal)
    if (controller.signal.aborted) return

    lyrics.value = parseLrc(text)
  } finally {
    if (!controller.signal.aborted) lyricLoading.value = false
  }
}

/**
 * 播放
 *
 * @remarks 浏览器的自动播放策略会拒绝没有用户手势的 `play()`，
 * 必须 catch：不捕获会留下未处理的 Promise，按钮状态也会跟实际脱节。
 */
async function play(): Promise<void> {
  const audio = audioRef.value
  if (!audio) return

  try {
    await audio.play()
  } catch {
    playing.value = false
  }
}

/** 暂停 */
function pause(): void {
  audioRef.value?.pause()
}

/** 播放 / 暂停切换 */
function toggle(): void {
  if (playing.value) {
    pause()
    return
  }

  void play()
}

/**
 * 等 `src` 真正落到 audio 上再播
 *
 * @remarks
 * `:src` 是响应式的，改完立刻 `play()` 播的还是上一首。
 * `nextTick` 之后还要再让出一个宏任务，浏览器才会重新加载资源。
 */
async function replayAfterSrcChange(): Promise<void> {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await play()
}

/**
 * 切到指定曲目
 *
 * @param index 曲目索引
 * @param autoPlay 切完是否播放
 */
function selectTrack(index: number, autoPlay = true): void {
  if (index < 0 || index >= tracks.value.length) return

  currentIndex.value = index
  currentTime.value = 0
  duration.value = 0

  void loadLyrics()

  const track = tracks.value[index]
  if (track) emit('change', track, index)

  if (autoPlay) void replayAfterSrcChange()
}

/**
 * 上一首 / 下一首
 *
 * @param direction 1 下一首，-1 上一首
 */
function step(direction: 1 | -1): void {
  const total = tracks.value.length
  if (!total) return

  if (loopMode.value === 'random') {
    // 只有一首时随机等于重播，直接算 0 省一次下标换算
    const next = total === 1 ? 0 : Math.floor(Math.random() * total)
    selectTrack(next)
    return
  }

  const next = (currentIndex.value + direction + total) % total
  selectTrack(next)
}

/**
 * 播放结束
 *
 * @remarks 刻意不用 `<audio loop>`：原生 loop 绕过组件状态机，
 * 播放状态、切歌逻辑都会失控。单曲循环自己把进度归零再播。
 */
function handleEnded(): void {
  if (loopMode.value === 'one') {
    const audio = audioRef.value
    if (!audio) return

    audio.currentTime = 0
    void play()
    return
  }

  step(1)
}

/** 循环模式轮转 */
function cycleLoop(): void {
  const index = MUSIC_LOOP_ORDER.indexOf(loopMode.value)
  loopMode.value = MUSIC_LOOP_ORDER[(index + 1) % MUSIC_LOOP_ORDER.length] ?? 'list'
}

/**
 * 拖动进度
 *
 * @param event 输入事件
 */
function handleSeek(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  currentTime.value = value

  const audio = audioRef.value
  if (audio) audio.currentTime = value
}

/**
 * 调整音量
 *
 * @param event 输入事件
 */
function handleVolume(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  volume.value = value

  const audio = audioRef.value
  if (!audio) return

  audio.volume = value
  muted.value = value === 0
  audio.muted = muted.value
}

/** 静音切换 */
function toggleMute(): void {
  const audio = audioRef.value
  if (!audio) return

  muted.value = !muted.value
  audio.muted = muted.value
}

/**
 * 点击歌词跳转
 *
 * @param time 目标秒数
 */
function seekToLyric(time: number): void {
  const audio = audioRef.value
  if (!audio) return

  audio.currentTime = time
  currentTime.value = time
}

/**
 * 同步播放进度
 *
 * @param event `timeupdate` 事件
 */
function handleTimeUpdate(event: Event): void {
  const audio = event.target as HTMLAudioElement
  currentTime.value = audio.currentTime
  if (Number.isFinite(audio.duration)) duration.value = audio.duration
}

/**
 * 元数据就绪
 *
 * @param event `loadedmetadata` 事件
 */
function handleLoadedMetadata(event: Event): void {
  const audio = event.target as HTMLAudioElement
  if (Number.isFinite(audio.duration)) duration.value = audio.duration

  audio.volume = volume.value
  audio.muted = muted.value
}

/** 播放开始 */
function handlePlay(): void {
  playing.value = true
  emit('play', true)
}

/** 播放暂停 */
function handlePause(): void {
  playing.value = false
  emit('play', false)
}

/**
 * 音频加载失败：跳过这首，避免卡住整个播放器
 */
function handleAudioError(): void {
  if (tracks.value.length <= 1) return
  step(1)
}

/** 把当前歌词滚到容器中间 */
function scrollLyricToCenter(): void {
  const box = lyricBoxRef.value
  if (!box) return

  const active = box.querySelector<HTMLElement>('.is-active')
  if (!active) return

  // 用两个矩形相减算偏移，不依赖 `offsetTop`：后者要求某个祖先是 offsetParent，
  // 布局一改就静默偏掉
  const offsetInView = active.getBoundingClientRect().top - box.getBoundingClientRect().top

  box.scrollTo({
    top: box.scrollTop + offsetInView - box.clientHeight / 2 + active.clientHeight / 2,
    behavior: 'smooth',
  })
}

/** 取消紧凑态收起 */
function cancelMiniLeave(): void {
  if (miniLeaveTimer) {
    clearTimeout(miniLeaveTimer)
    miniLeaveTimer = undefined
  }
}

/** 鼠标移出面板：延时收起，给用户留出移回来的时间 */
function handleMiniLeave(): void {
  if (!isCompact.value) return

  cancelMiniLeave()
  miniLeaveTimer = setTimeout(() => {
    miniExpanded.value = false
  }, MINI_LEAVE_DELAY)
}

/** 从胶囊展开面板 */
function openPanelFromPill(): void {
  miniExpanded.value = true
}

/** 切换全局歌词条 */
function toggleGlobalLyric(): void {
  globalLyricOpen.value = !globalLyricOpen.value
}

/**
 * 读取当前播放状态
 *
 * @returns 当前曲目、索引、播放状态与进度
 */
function getCurrent(): {
  track: SrMusicTrack | undefined
  index: number
  playing: boolean
  currentTime: number
  duration: number
} {
  return {
    track: currentTrack.value,
    index: currentIndex.value,
    playing: playing.value,
    currentTime: currentTime.value,
    duration: duration.value,
  }
}

/**
 * 跳转到指定秒数
 *
 * @param time 目标秒数
 */
function seek(time: number): void {
  const audio = audioRef.value
  if (!audio) return

  const target = Math.min(Math.max(time, 0), duration.value || time)
  audio.currentTime = target
  currentTime.value = target
}

defineExpose({
  play,
  pause,
  toggle,
  next: () => step(1),
  prev: () => step(-1),
  seek,
  getCurrent,
})

watch(lyricIndex, () => {
  void nextTick(scrollLyricToCenter)
})

watch(lyricOpen, (open) => {
  // 收起时容器不在 DOM 里，期间的行变化会被早退吞掉，展开时要补滚一次
  if (open) void nextTick(scrollLyricToCenter)
})

watch(currentIndex, () => {
  if (lyricBoxRef.value) lyricBoxRef.value.scrollTop = 0
})

watch(volume, (value) => {
  const audio = audioRef.value
  if (audio) audio.volume = value
})

watch(
  () => props.volume,
  (value) => {
    volume.value = value
  },
)

watch(
  () => props.globalLyrics,
  (value) => {
    globalLyricOpen.value = value
  },
)

watch(
  () => [props.api, props.server, props.type, props.id],
  () => void loadTracks(),
)

onMounted(async () => {
  await loadTracks()

  if (props.autoplay) {
    void replayAfterSrcChange()
  }
})

onBeforeUnmount(() => {
  trackController?.abort()
  lyricController?.abort()
  cancelMiniLeave()

  // 不暂停的话，组件卸载后音乐还在响
  const audio = audioRef.value
  if (audio) {
    audio.pause()
    audio.removeAttribute('src')
  }
})
</script>

<template>
  <Teleport to="body" :disabled="mode === 'full'">
    <div class="sr-music" :class="rootClass" :style="anchorStyle">
      <!-- 展开态面板：三种形态共用同一套结构，差别只在外壳 -->
      <div
        v-if="showPanel"
        class="sr-music__panel"
        @mouseenter="cancelMiniLeave"
        @mouseleave="handleMiniLeave"
      >
        <div class="sr-music__header">
          <div class="sr-music__cover">
            <img v-if="currentTrack?.pic" :src="currentTrack.pic" :alt="currentTrack.name" />
            <span v-else class="sr-music__cover-fallback">
              <SrIcon name="lucide:music" :size="20" />
            </span>
          </div>

          <div class="sr-music__meta">
            <p class="sr-music__name" :title="currentTrack?.name">
              {{ currentTrack?.name || '未选择曲目' }}
            </p>
            <p class="sr-music__artist" :title="currentTrack?.artist">
              {{ currentTrack?.artist || '—' }}
            </p>
          </div>

          <div class="sr-music__head-actions">
            <button
              v-if="globalLyrics"
              type="button"
              class="sr-music__icon-btn"
              :class="{ 'is-on': globalLyricOpen }"
              :aria-pressed="globalLyricOpen"
              title="底部歌词"
              @click="toggleGlobalLyric"
            >
              <SrIcon name="lucide:captions" :size="16" />
            </button>

            <button
              v-if="isCompact"
              type="button"
              class="sr-music__icon-btn"
              title="收起"
              @click="miniExpanded = false"
            >
              <SrIcon name="lucide:chevron-down" :size="16" />
            </button>
          </div>
        </div>

        <p v-if="loading" class="sr-music__tip">正在加载歌单…</p>
        <p v-else-if="loadError" class="sr-music__tip is-error">{{ loadError }}</p>

        <template v-else-if="hasTracks">
          <div v-if="lyricOpen" ref="lyricBoxRef" class="sr-music__lyrics">
            <p v-if="lyricLoading" class="sr-music__tip">歌词加载中…</p>
            <p v-else-if="!lyrics.length" class="sr-music__tip">暂无歌词</p>
            <ul v-else class="sr-music__lyric-list">
              <li v-for="(line, index) in lyrics" :key="`${line.time}-${index}`">
                <button
                  type="button"
                  class="sr-music__lyric-line"
                  :class="{ 'is-active': index === lyricIndex, 'is-empty': line.empty }"
                  :disabled="line.empty"
                  @click="seekToLyric(line.time)"
                >
                  <span class="sr-music__lyric-text">{{ line.empty ? '· · ·' : line.text }}</span>
                  <span v-if="line.translation" class="sr-music__lyric-trans">
                    {{ line.translation }}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          <div class="sr-music__progress">
            <span class="sr-music__time">{{ formatTime(currentTime) }}</span>
            <input
              class="sr-music__range"
              type="range"
              min="0"
              :max="duration || 0"
              step="0.1"
              :value="currentTime"
              :style="{ '--sr-music-progress': `${progressPercent}%` }"
              aria-label="播放进度"
              @input="handleSeek"
            />
            <span class="sr-music__time">{{ formatTime(duration) }}</span>
          </div>

          <div class="sr-music__controls">
            <button
              type="button"
              class="sr-music__icon-btn"
              :title="loopInfo.label"
              :aria-label="loopInfo.label"
              @click="cycleLoop"
            >
              <SrIcon :name="loopInfo.icon" :size="16" />
            </button>

            <button
              type="button"
              class="sr-music__icon-btn"
              title="上一首"
              aria-label="上一首"
              @click="step(-1)"
            >
              <SrIcon name="lucide:skip-back" :size="16" />
            </button>

            <button
              type="button"
              class="sr-music__main-btn"
              :title="playing ? '暂停' : '播放'"
              :aria-label="playing ? '暂停' : '播放'"
              @click="toggle"
            >
              <SrIcon :name="playing ? 'lucide:pause' : 'lucide:play'" :size="18" />
            </button>

            <button
              type="button"
              class="sr-music__icon-btn"
              title="下一首"
              aria-label="下一首"
              @click="step(1)"
            >
              <SrIcon name="lucide:skip-forward" :size="16" />
            </button>

            <button
              v-if="showLyrics"
              type="button"
              class="sr-music__icon-btn"
              :class="{ 'is-on': lyricOpen }"
              :aria-pressed="lyricOpen"
              title="歌词"
              aria-label="歌词"
              @click="lyricOpen = !lyricOpen"
            >
              <SrIcon name="lucide:mic" :size="16" />
            </button>

            <button
              v-if="showPlaylist"
              type="button"
              class="sr-music__icon-btn"
              :class="{ 'is-on': playlistOpen }"
              :aria-expanded="playlistOpen"
              :title="`播放列表（${tracks.length}）`"
              aria-label="播放列表"
              @click="playlistOpen = !playlistOpen"
            >
              <SrIcon name="lucide:list-music" :size="16" />
            </button>

            <div class="sr-music__volume">
              <button
                type="button"
                class="sr-music__icon-btn"
                :title="muted ? '取消静音' : '静音'"
                :aria-label="muted ? '取消静音' : '静音'"
                @click="toggleMute"
              >
                <SrIcon :name="muted || volume === 0 ? 'lucide:volume-x' : 'lucide:volume-2'" :size="16" />
              </button>
              <input
                class="sr-music__range sr-music__range--volume"
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="muted ? 0 : volume"
                :style="{ '--sr-music-progress': `${(muted ? 0 : volume) * 100}%` }"
                aria-label="音量"
                @input="handleVolume"
              />
            </div>
          </div>

          <ul v-if="showPlaylist && playlistOpen" class="sr-music__playlist">
            <li v-for="(track, index) in tracks" :key="track.id || `${track.name}-${index}`">
              <button
                type="button"
                class="sr-music__track"
                :class="{ 'is-active': index === currentIndex }"
                @click="selectTrack(index)"
              >
                <span class="sr-music__track-index">
                  <SrIcon
                    v-if="index === currentIndex"
                    :name="playing ? 'lucide:volume-2' : 'lucide:play'"
                    :size="12"
                  />
                  <template v-else>{{ index + 1 }}</template>
                </span>
                <span class="sr-music__track-name">{{ track.name }}</span>
                <span class="sr-music__track-artist">{{ track.artist }}</span>
              </button>
            </li>
          </ul>
        </template>
      </div>

      <!-- 收起态：贴边圆钮 -->
      <button
        v-if="mode === 'attach' && !miniExpanded"
        type="button"
        class="sr-music__attach"
        :title="currentTrack ? `${currentTrack.name} - ${currentTrack.artist}` : '音乐播放器'"
        aria-label="展开播放器"
        @mouseenter="miniExpanded = true"
        @click="miniExpanded = true"
      >
        <img v-if="currentTrack?.pic" :src="currentTrack.pic" alt="" />
        <SrIcon v-else name="lucide:music" :size="18" />
      </button>

      <!-- 收起态：胶囊条 -->
      <div v-if="mode === 'mini' && !miniExpanded" class="sr-music__pill">
        <button
          type="button"
          class="sr-music__pill-cover"
          :aria-label="playing ? '暂停' : '播放'"
          @click="toggle"
        >
          <img v-if="currentTrack?.pic" :src="currentTrack.pic" alt="" />
          <SrIcon v-else name="lucide:music" :size="16" />
          <span class="sr-music__pill-mask">
            <SrIcon :name="playing ? 'lucide:pause' : 'lucide:play'" :size="14" />
          </span>
        </button>

        <button type="button" class="sr-music__pill-text" @click="openPanelFromPill">
          <span class="sr-music__pill-lyric">{{ globalLyricText || currentTrack?.name || '音乐' }}</span>
          <span class="sr-music__pill-meta">{{ currentTrack?.artist || '—' }}</span>
        </button>
      </div>

      <audio
        ref="audioRef"
        :src="currentTrack?.url"
        preload="metadata"
        @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata"
        @ended="handleEnded"
        @play="handlePlay"
        @pause="handlePause"
        @error="handleAudioError"
      />
    </div>

    <!-- 底部全局歌词条 -->
    <Transition name="sr-music-global">
      <div v-if="showGlobalLyric" class="sr-music__global" aria-hidden="true">
        <img v-if="currentTrack?.pic" class="sr-music__global-cover" :src="currentTrack.pic" alt="" />
        <span class="sr-music__global-text">{{ globalLyricText }}</span>
        <span class="sr-music__global-meta"> {{ currentTrack?.name }} - {{ currentTrack?.artist }} </span>
      </div>
    </Transition>
  </Teleport>
</template>
