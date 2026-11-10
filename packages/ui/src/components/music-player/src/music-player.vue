<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import SrTooltip from '../../tooltip/src/tooltip.vue'
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
let miniLeaveTimer: ReturnType<typeof setTimeout> | null = null

/** 鼠标移出后多久收起：太短会在面板内移动时闪烁，太长又拖沓 */
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
const activeLyric = computed(() => resolveLyricText(lyrics.value, lyricIndex.value))

/** 底部全局歌词文字：暂停时退回歌名，避免静止地挂一句歌词 */
const globalLyricText = computed(() => (playing.value ? activeLyric.value : ''))
const pillMeta = computed(() => (currentTrack.value ? `${currentTrack.value.name}` : '音乐播放器'))

/** 是否显示全局歌词条 */
const showGlobalLyric = computed(() => globalLyricOpen.value && !!globalLyricText.value && !loadError.value)

/** 是否紧凑形态 */
const isCompact = computed(() => props.mode !== 'full')

/** 面板是否可见 */
const showPanel = computed(() => props.mode === 'full' || miniExpanded.value)

/** 循环模式信息 */
const loopInfo = computed(() => MUSIC_LOOP_MAP[loopMode.value])

/** 停靠的水平侧 */
const anchorSide = computed<'left' | 'right'>(() => (props.placement.endsWith('Left') ? 'left' : 'right'))

/** 停靠的垂直侧 */
const anchorVertical = computed<'top' | 'bottom'>(() =>
  props.placement.startsWith('top') ? 'top' : 'bottom',
)

/**
 * 停靠距离
 *
 * @remarks 圆钮、胶囊、展开面板都读这两个变量，保证落在同一个角；
 * 各自写死的话改一处就会错位。
 */
const anchorStyle = computed(() => {
  const distance = typeof props.offset === 'number' ? `${props.offset}px` : props.offset

  return {
    '--sr-music-anchor-x': distance,
    '--sr-music-anchor-y': distance,
  }
})

/** 面板类名 */
const panelClass = computed(() => ({
  'sr-music--mini-panel': isCompact.value,
  [`sr-music__mini-panel--${anchorSide.value}`]: isCompact.value,
  [`sr-music__mini-panel--${anchorVertical.value}`]: isCompact.value,
  'is-playing': playing.value,
}))

/** 圆钮类名 */
const miniClass = computed(() => ({
  [`sr-music__mini--${anchorSide.value}`]: true,
  [`sr-music__mini--${anchorVertical.value}`]: true,
  'is-playing': playing.value,
}))

/** 胶囊类名 */
const pillClass = computed(() => ({
  [`sr-music__pill--${anchorSide.value}`]: true,
  [`sr-music__pill--${anchorVertical.value}`]: true,
}))

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

/** 拉取歌单 */
async function loadTracks(): Promise<void> {
  trackController?.abort()
  const controller = new AbortController()
  trackController = controller

  loading.value = true
  loadError.value = ''

  if (!props.api || !props.id) {
    loading.value = false
    loadError.value = props.errorText
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
    if (controller.signal.aborted) return

    loadError.value = error instanceof Error ? error.message : props.errorText
    emit('error', error instanceof Error ? error : new Error(props.errorText))
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}

/** 拉取当前曲目的歌词，失败静默为空 */
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

/** 播放；浏览器的自动播放策略会拒绝无用户手势的调用，必须 catch */
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
 * 等 `src` 落到 audio 上再播
 *
 * @remarks `:src` 是响应式更新，改完立刻 `play()` 播的还是上一首；
 * `nextTick` 之后还要让出一个宏任务，浏览器才会重新加载资源。
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
    selectTrack(total === 1 ? 0 : Math.floor(Math.random() * total))
    return
  }

  selectTrack((currentIndex.value + direction + total) % total)
}

/** 播放结束：单曲循环手动归零，其余切下一首 */
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
 * @param event 原生 input 事件
 */
function handleSeek(event: Event): void {
  const seconds = Number((event.target as HTMLInputElement).value)
  currentTime.value = seconds

  if (audioRef.value) audioRef.value.currentTime = seconds
}

/**
 * 调整音量
 *
 * @param event 原生 input 事件
 */
function handleVolume(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  volume.value = value
  muted.value = value === 0

  const audio = audioRef.value
  if (!audio) return

  audio.volume = value
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
 * 点歌词跳转
 *
 * @param line 目标行
 */
function seekToLyric(line: SrLyricLine): void {
  if (line.empty) return

  currentTime.value = line.time

  if (audioRef.value) audioRef.value.currentTime = line.time
}

/**
 * 当前歌词行滚到容器中间
 *
 * @remarks 用 `scrollTo` 而不是 `scrollIntoView`：后者会连带滚动所有可滚祖先，
 * 包括整个页面。位置用两个矩形相减算，不依赖 `offsetTop` 的定位祖先。
 */
function scrollLyricToCenter(): void {
  const box = lyricBoxRef.value
  if (!box) return

  const active = box.querySelector<HTMLElement>('.is-active')
  if (!active) return

  const offsetInView = active.getBoundingClientRect().top - box.getBoundingClientRect().top

  box.scrollTo({
    top: box.scrollTop + offsetInView - box.clientHeight / 2 + active.clientHeight / 2,
    behavior: 'smooth',
  })
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
 * 元数据就绪：同步时长与音量
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

/** 音频加载失败：跳过这首，避免整个播放器卡死 */
function handleAudioError(): void {
  if (tracks.value.length <= 1) return
  step(1)
}

/** 取消自动收起 */
function cancelMiniLeave(): void {
  if (!miniLeaveTimer) return

  clearTimeout(miniLeaveTimer)
  miniLeaveTimer = null
}

/** 鼠标移出面板：延时收起 */
function handleMiniLeave(): void {
  if (!isCompact.value) return

  cancelMiniLeave()
  miniLeaveTimer = setTimeout(() => {
    miniExpanded.value = false
    miniLeaveTimer = null
  }, MINI_LEAVE_DELAY)
}

/** 从胶囊展开面板 */
function openPanelFromPill(): void {
  miniExpanded.value = true
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

watch(lyricIndex, () => void nextTick(scrollLyricToCenter))

/**
 * 歌词面板从收起变为展开时补滚一次
 *
 * @remarks 收起状态下容器不在 DOM 里，期间的行变化都被早退吞掉。
 */
watch(lyricOpen, (open) => {
  if (open) void nextTick(scrollLyricToCenter)
})

watch(currentIndex, () => {
  if (lyricBoxRef.value) lyricBoxRef.value.scrollTop = 0
})

watch(
  () => [props.api, props.server, props.type, props.id],
  () => void loadTracks(),
)

watch(
  () => props.volume,
  (value) => {
    volume.value = value
    if (audioRef.value) audioRef.value.volume = value
  },
)

watch(
  () => props.globalLyrics,
  (value) => {
    globalLyricOpen.value = value
  },
)

onMounted(async () => {
  await loadTracks()

  if (props.autoplay) void replayAfterSrcChange()
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
  <!-- 音频元素本身不需要可见 -->
  <audio
    ref="audioRef"
    :src="currentTrack?.url"
    preload="metadata"
    @play="handlePlay"
    @pause="handlePause"
    @ended="handleEnded"
    @timeupdate="handleTimeUpdate"
    @loadedmetadata="handleLoadedMetadata"
    @error="handleAudioError"
  />

  <!-- 全局底部歌词：与播放器位置无关 -->
  <Teleport to="body">
    <Transition name="sr-music-global-lyric">
      <div v-if="showGlobalLyric" class="sr-music-global-lyric">
        <img
          v-if="currentTrack?.pic"
          class="sr-music-global-lyric__cover"
          :class="{ 'is-playing': playing }"
          :src="currentTrack.pic"
          alt=""
        />

        <span class="sr-music-global-lyric__text">{{ globalLyricText }}</span>

        <span v-if="currentTrack" class="sr-music-global-lyric__name">
          {{ currentTrack.name }} - {{ currentTrack.artist }}
        </span>
      </div>
    </Transition>
  </Teleport>

  <!-- 吸附模式收起态：贴边圆钮 -->
  <Teleport to="body">
    <button
      v-if="mode === 'attach' && !miniExpanded"
      class="sr-music__mini"
      :class="miniClass"
      :style="anchorStyle"
      type="button"
      aria-label="展开播放器"
      :title="currentTrack ? `${currentTrack.name} - ${currentTrack.artist}` : '音乐播放器'"
      @mouseenter="miniExpanded = true"
      @click="miniExpanded = true"
    >
      <img v-if="currentTrack?.pic" :src="currentTrack.pic" alt="" />

      <span v-else class="sr-music__mini-fallback">
        <SrIcon name="lucide:music" :size="22" />
      </span>
    </button>
  </Teleport>

  <!-- 精简模式收起态：胶囊条 -->
  <Teleport to="body">
    <Transition name="sr-music-pill">
      <div
        v-if="mode === 'mini' && !miniExpanded && hasTracks"
        class="sr-music__pill"
        :class="pillClass"
        :style="anchorStyle"
      >
        <button
          class="sr-music__pill-cover"
          :class="{ 'is-playing': playing }"
          type="button"
          :aria-label="playing ? '暂停' : '播放'"
          :title="playing ? '暂停' : '播放'"
          @click="toggle"
        >
          <img v-if="currentTrack?.pic" :src="currentTrack.pic" alt="" />

          <span v-else class="sr-music__pill-fallback">
            <SrIcon name="lucide:music" :size="20" />
          </span>

          <span class="sr-music__pill-overlay" aria-hidden="true">
            <SrIcon :name="playing ? 'lucide:pause' : 'lucide:play'" :size="18" />
          </span>
        </button>

        <button
          class="sr-music__pill-text"
          type="button"
          aria-label="展开完整播放器"
          title="展开完整播放器"
          @click="openPanelFromPill"
        >
          <Transition name="sr-music-pill-lyric" mode="out-in">
            <span v-if="playing && globalLyricText" :key="globalLyricText" class="sr-music__pill-lyric">
              {{ globalLyricText }}
            </span>

            <span v-else :key="'meta'" class="sr-music__pill-meta">
              <span class="sr-music__pill-name">{{ pillMeta }}</span>
              <span class="sr-music__pill-artist">{{ currentTrack?.artist }}</span>
            </span>
          </Transition>
        </button>
      </div>
    </Transition>
  </Teleport>

  <!-- 完整面板：紧凑形态要 Teleport，否则会被祖先的 transform 困住层级 -->
  <Teleport to="body" :disabled="mode === 'full'">
    <Transition name="sr-music-mini">
      <div
        v-if="showPanel"
        class="sr-music"
        :class="panelClass"
        :style="anchorStyle"
        @mouseenter="cancelMiniLeave"
        @mouseleave="handleMiniLeave"
      >
        <!-- 加载 / 失败 -->
        <div v-if="loading" class="sr-music__status">正在加载歌单…</div>

        <div v-else-if="loadError" class="sr-music__status">{{ loadError }}</div>

        <template v-else-if="hasTracks">
          <!-- 顶部：封面 + 歌曲信息 -->
          <div class="sr-music__head">
            <div class="sr-music__cover" :class="{ 'is-playing': playing }">
              <img v-if="currentTrack?.pic" :src="currentTrack.pic" alt="" />
            </div>

            <div class="sr-music__info">
              <p class="sr-music__name">{{ currentTrack?.name }}</p>
              <p class="sr-music__artist">{{ currentTrack?.artist }}</p>
            </div>

            <div class="sr-music__top-actions">
              <SrTooltip v-if="globalLyrics" :content="globalLyricOpen ? '关闭全局歌词' : '开启全局歌词'">
                <button
                  class="sr-music__btn sr-music__btn--sm"
                  :class="{ 'is-active': globalLyricOpen }"
                  type="button"
                  :aria-label="globalLyricOpen ? '关闭全局歌词' : '开启全局歌词'"
                  :aria-pressed="globalLyricOpen"
                  @click="globalLyricOpen = !globalLyricOpen"
                >
                  <SrIcon name="lucide:captions" :size="15" />
                </button>
              </SrTooltip>
            </div>
          </div>

          <!-- 进度 -->
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

          <!-- 控制区 -->
          <div class="sr-music__controls">
            <SrTooltip :content="loopInfo.label">
              <button class="sr-music__btn" type="button" :aria-label="loopInfo.label" @click="cycleLoop">
                <SrIcon :name="loopInfo.icon" :size="18" />
              </button>
            </SrTooltip>

            <SrTooltip content="上一首">
              <button class="sr-music__btn" type="button" aria-label="上一首" @click="step(-1)">
                <SrIcon name="lucide:skip-back" :size="18" />
              </button>
            </SrTooltip>

            <SrTooltip :content="playing ? '暂停' : '播放'">
              <button
                class="sr-music__btn sr-music__btn--main"
                type="button"
                :aria-label="playing ? '暂停' : '播放'"
                @click="toggle"
              >
                <SrIcon :name="playing ? 'lucide:pause' : 'lucide:play'" :size="20" />
              </button>
            </SrTooltip>

            <SrTooltip content="下一首">
              <button class="sr-music__btn" type="button" aria-label="下一首" @click="step(1)">
                <SrIcon name="lucide:skip-forward" :size="18" />
              </button>
            </SrTooltip>

            <SrTooltip v-if="showLyrics" :content="lyricOpen ? '收起歌词' : '展开歌词'">
              <button
                class="sr-music__btn"
                :class="{ 'is-active': lyricOpen }"
                type="button"
                :aria-label="lyricOpen ? '收起歌词' : '展开歌词'"
                :aria-pressed="lyricOpen"
                @click="lyricOpen = !lyricOpen"
              >
                <SrIcon name="lucide:mic-vocal" :size="18" />
              </button>
            </SrTooltip>

            <SrTooltip v-if="showPlaylist" :content="`播放列表（${tracks.length} 首）`">
              <button
                class="sr-music__btn"
                :class="{ 'is-active': playlistOpen }"
                type="button"
                :aria-label="`播放列表，共 ${tracks.length} 首`"
                :aria-expanded="playlistOpen"
                @click="playlistOpen = !playlistOpen"
              >
                <SrIcon name="lucide:list-music" :size="18" />
              </button>
            </SrTooltip>
          </div>

          <!-- 音量：单独一行，和主控制条分开 -->
          <div class="sr-music__volume">
            <SrTooltip :content="muted ? '取消静音' : `音量 ${Math.round(volume * 100)}%`">
              <button
                class="sr-music__btn"
                type="button"
                :aria-label="muted ? '取消静音' : `音量 ${Math.round(volume * 100)}%`"
                @click="toggleMute"
              >
                <SrIcon :name="muted || volume === 0 ? 'lucide:volume-x' : 'lucide:volume-2'" :size="18" />
              </button>
            </SrTooltip>

            <input
              class="sr-music__range"
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

          <!-- 歌词面板 -->
          <div v-if="showLyrics && lyricOpen" ref="lyricBoxRef" class="sr-music__lyrics is-scrollable">
            <div v-if="lyricLoading" class="sr-music__lyric-empty">歌词加载中…</div>

            <div v-else-if="!lyrics.length" class="sr-music__lyric-empty">暂无歌词</div>

            <ul v-else class="sr-music__lyric-list">
              <li v-for="(line, index) in lyrics" :key="`${line.time}-${index}`">
                <button
                  class="sr-music__lyric-line"
                  :class="{ 'is-active': index === lyricIndex, 'is-empty': line.empty }"
                  type="button"
                  :disabled="line.empty"
                  @click="seekToLyric(line)"
                >
                  {{ line.empty ? '· · ·' : line.text }}
                  <span v-if="line.translation" class="sr-music__lyric-trans">
                    {{ line.translation }}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          <!-- 播放列表 -->
          <div v-if="showPlaylist && playlistOpen" class="sr-music__playlist">
            <button
              v-for="(track, index) in tracks"
              :key="track.id || `${track.name}-${index}`"
              class="sr-music__playlist-item"
              :class="{ 'is-active': index === currentIndex }"
              type="button"
              @click="selectTrack(index)"
            >
              <SrIcon
                v-if="index === currentIndex"
                :name="playing ? 'lucide:volume-2' : 'lucide:play'"
                :size="12"
              />

              <span class="sr-music__playlist-name">{{ track.name }}</span>
              <span class="sr-music__playlist-artist">{{ track.artist }}</span>
            </button>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>
