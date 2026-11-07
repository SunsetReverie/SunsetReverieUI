<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { SrButton, SrProgress } from '@sunset-reverie/ui'

defineOptions({ name: 'ProgressDemo' })

const basic = ref(38)
const running = ref(0)

let timer: ReturnType<typeof setInterval> | undefined

/** 模拟上传：每 200ms 涨 8% */
function simulate(): void {
  if (timer) return
  running.value = 0
  timer = setInterval(() => {
    running.value += 8
    if (running.value >= 100) {
      running.value = 100
      if (timer) clearInterval(timer)
      timer = undefined
    }
  }, 200)
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <SrProgress :percent="basic" />
      <p class="hint">默认显示百分比文字，宽度与进度通过 CSS 变量驱动，过渡交给 CSS</p>
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
      <SrProgress :percent="running" :status="running >= 100 ? 'success' : 'normal'" />
      <div class="row">
        <SrButton size="sm" variant="outline" @click="simulate">开始</SrButton>
        <SrButton size="sm" variant="text" @click="running = 0">重置</SrButton>
      </div>
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
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}
</style>
