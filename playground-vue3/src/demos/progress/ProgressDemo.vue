<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { SrButton, SrProgress, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'ProgressDemo' })

const basic = ref(38)
const running = ref(0)
const active = ref(false)

let timer: ReturnType<typeof setInterval> | undefined

/** 开始/继续：每 120ms 涨 4%，到 100 自动停 */
function startProgress(): void {
  if (active.value) return
  if (running.value >= 100) running.value = 0
  active.value = true
  timer = setInterval(() => {
    running.value = Math.min(100, running.value + 4)
    if (running.value >= 100) pauseProgress()
  }, 120)
}

/** 暂停：保留当前百分比，再点开始从原处继续 */
function pauseProgress(): void {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
  active.value = false
}

/** 重置 */
function resetProgress(): void {
  pauseProgress()
  running.value = 0
}

onBeforeUnmount(pauseProgress)
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <SrProgress :percent="basic" />
      <p class="hint">默认显示百分比文字，宽度与进度通过 CSS 变量驱动，过渡交给 CSS</p>
    </section>

    <section>
      <h3>环形（type="circle"）</h3>
      <div class="row">
        <SrProgress type="circle" :percent="25" />
        <SrProgress type="circle" :percent="68" status="success" />
        <SrProgress type="circle" :percent="92" status="error" />
      </div>
      <p class="hint">
        百分比居中放在圆心里：直径由 <code>width</code> 控制（默认 120），环宽仍由
        <code>strokeWidth</code> 控制；状态色与线性共用一套。弧线用 <code>stroke-dashoffset</code> 过渡，改
        <code>percent</code> 时不会重排。
      </p>
    </section>

    <section>
      <h3>四种状态</h3>
      <div class="stack">
        <SrProgress :percent="62" />
        <SrProgress :percent="100" status="success" />
        <SrProgress :percent="76" status="warning" />
        <SrProgress :percent="42" status="error" />
      </div>
    </section>

    <section>
      <h3>尺寸（size 与 strokeWidth）</h3>
      <div class="stack">
        <SrProgress :percent="58" size="xs" />
        <SrProgress :percent="58" size="sm" />
        <SrProgress :percent="58" size="md" />
        <SrProgress :percent="58" size="lg" />
        <SrProgress :percent="58" :stroke-width="14" />
      </div>
      <p class="hint">size 给出预设高度；显式传 strokeWidth 时以它为准</p>
    </section>

    <section>
      <h3>文字在轨道内（textInside）</h3>
      <SrProgress :percent="46" :stroke-width="20" text-inside />
      <p class="hint">轨道高度不足 16px 时自动退回外侧显示，避免文字溢出</p>
    </section>

    <section>
      <h3>不显示文字 / 自定义文字</h3>
      <div class="stack">
        <SrProgress :percent="72" :show-text="false" />
        <SrProgress :percent="72" :format="(p) => `已完成 ${p}%`" />
        <SrProgress :percent="3" :format="() => '准备中'" />
      </div>
    </section>

    <section>
      <h3>条纹与流动</h3>
      <div class="stack">
        <SrProgress :percent="64" striped />
        <SrProgress :percent="64" striped animated />
      </div>
      <p class="hint">用户开启「减少动效」时流动会停下，条纹本身保留</p>
    </section>

    <section>
      <h3>动态进度（模拟上传）</h3>
      <div class="dynamic">
        <SrProgress :percent="running" :status="running >= 100 ? 'success' : 'normal'" />

        <div class="dynamic__ring">
          <SrProgress
            type="circle"
            :percent="running"
            :width="140"
            :status="running >= 100 ? 'success' : 'normal'"
          />
        </div>

        <div class="row">
          <SrButton size="sm" variant="primary" @click="startProgress">开始</SrButton>
          <SrButton size="sm" variant="secondary" @click="pauseProgress">暂停</SrButton>
          <SrButton size="sm" variant="text" @click="resetProgress">重置</SrButton>
          <SrTag size="sm" :type="running >= 100 ? 'success' : active ? 'primary' : 'default'">
            {{ running >= 100 ? '已完成' : active ? '进行中' : '已暂停' }}
          </SrTag>
        </div>
      </div>
      <p class="hint">线性与环形绑同一个 <code>percent</code>；暂停保留当前值，再点开始从原处继续。</p>
    </section>

    <section>
      <h3>自定义右侧内容（默认插槽）</h3>
      <SrProgress :percent="55">
        <span style="color: var(--sr-color-primary-text); font-weight: 600">55 / 100 条</span>
      </SrProgress>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 26px;
}
h3 {
  margin: 0 0 10px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}
.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dynamic {
  display: grid;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-lg);
  background: var(--sr-color-bg-container);
}

.dynamic__ring {
  display: flex;
  justify-content: center;
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}
</style>
