<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrLoadMore, type SrLoadMoreStatus } from '@sunset-reverie/ui'

import EventLog from '../../components/EventLog.vue'

defineOptions({ name: 'LoadMoreDemo' })

const status = ref<SrLoadMoreStatus>('idle')

/** 点击模式的事件日志 */
const events = ref<string[]>([])

/** 自动模式的滚动列表 */
const list = ref<string[]>(['评论 1', '评论 2', '评论 3'])
/** 自动模式当前状态 */
const autoStatus = ref<SrLoadMoreStatus>('idle')

/** 是否正在加载，防止观察器重复派发时并发追加 */
let loading = false

/**
 * 写一条事件日志
 * @param text 事件描述
 * @returns 无；只保留最近 6 条
 */
function log(text: string): void {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  events.value = [`${time}  ${text}`, ...events.value].slice(0, 6)
}

/** 点击模式：模拟一次 900ms 的请求 */
function load(): void {
  log('load（点击）')
  status.value = 'loading'
  setTimeout(() => {
    status.value = 'done'
  }, 900)
}

/**
 * 自动模式：追加一批评论，到第 12 条为止
 * @returns 无；加载中或已到底时直接返回
 */
function loadNext(): void {
  if (loading || autoStatus.value === 'done') return
  loading = true
  autoStatus.value = 'loading'
  log('load（进入可视区）')

  setTimeout(() => {
    const start = list.value.length + 1
    list.value.push(...Array.from({ length: 3 }, (_, i) => `评论 ${start + i}`))
    autoStatus.value = list.value.length >= 12 ? 'done' : 'idle'
    loading = false
  }, 600)
}

/** 重置自动模式 */
function resetAuto(): void {
  loading = false
  list.value = ['评论 1', '评论 2', '评论 3']
  autoStatus.value = 'idle'
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>三态（点一下看过程）</h3>
      <SrLoadMore :status="status" @load="load" />
      <div class="row">
        <SrButton v-if="status === 'done'" size="xs" variant="text" @click="status = 'idle'"> 重置 </SrButton>
        <span class="hint">当前状态：{{ status }}</span>
      </div>
    </section>

    <section>
      <h3>自定义文案与禁用</h3>
      <SrLoadMore status="idle" load-text="加载更多评论" loading-text="正在加载" done-text="已经到底啦" />
      <SrLoadMore status="idle" disabled load-text="禁用后不可点" />
    </section>

    <section>
      <h3>自动模式（滚到底自动加载）</h3>
      <p class="hint">
        `auto` 打开 IntersectionObserver，元素进入可视区就派发 `load`；下面的容器只有 180px
        高，往下滚即可看到列表自动追加，到第 12 条切为 `done`。
      </p>
      <div class="scroller">
        <p v-for="item in list" :key="item" class="scroller__item">{{ item }}</p>
        <SrLoadMore :status="autoStatus" auto root-margin="0px" load-text="继续加载" @load="loadNext" />
      </div>
      <div class="row">
        <SrButton size="xs" variant="text" @click="resetAuto">重置列表</SrButton>
        <span class="hint">{{ list.length }} 条 · {{ autoStatus }}</span>
      </div>
      <EventLog :events="events" title="load 事件" @clear="events = []" />
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
h3 {
  margin: 0 0 10px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}
.hint {
  margin: 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 1.7;
}
.scroller {
  height: 180px;
  margin-top: 10px;
  padding: 0 10px;
  overflow-y: auto;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-sunken) 50%, transparent);
}
.scroller__item {
  margin: 0;
  padding: 10px 2px;
  border-bottom: 1px dashed var(--sr-color-border-subtle);
  color: var(--sr-color-text-secondary);
  font-size: 12.5px;
}
</style>
