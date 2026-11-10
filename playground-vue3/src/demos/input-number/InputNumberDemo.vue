<script setup lang="ts">
import { ref } from 'vue'
import { SrInputNumber } from '@sunset-reverie/ui'

import EventLog from '../../components/EventLog.vue'

defineOptions({ name: 'InputNumberDemo' })

const count = ref(1)
const price = ref(9.9)
const plain = ref(3)
const both = ref<number | null>(5)
const empty = ref<number | null>(null)

/** 最近的输入事件 */
const events = ref<string[]>([])

/**
 * 写一条事件日志
 * @param text 事件描述
 * @returns 无；只保留最近 6 条
 */
function log(text: string): void {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  events.value = [`${time}  ${text}`, ...events.value].slice(0, 6)
}

/**
 * 值提交（失焦或回车）
 * @param value 当前值，空值为 null
 * @returns 无
 */
function onChange(value: number | null): void {
  log(`change: ${value ?? 'null'}`)
}

/**
 * 步进按钮或方向键
 * @param value 步进后的值
 * @param type 方向
 * @returns 无
 */
function onStep(value: number | null, type: 'increase' | 'decrease'): void {
  log(`step(${type}): ${value ?? 'null'}`)
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>范围限制</h3>
      <div class="row">
        <SrInputNumber v-model="count" :min="0" :max="10" style="width: 150px" />
        <span class="hint">当前 {{ count }}（0 ~ 10）</span>
      </div>
    </section>

    <section>
      <h3>步长与精度</h3>
      <div class="row">
        <SrInputNumber v-model="price" :step="0.1" :min="0" :precision="2" style="width: 150px" />
        <span class="hint">step 0.1 · precision 2，精度会抹平 0.1 + 0.2 的浮点误差</span>
      </div>
    </section>

    <section>
      <h3>两侧步进与尺寸</h3>
      <div class="row">
        <SrInputNumber v-model="both" controls-position="both" :min="0" :max="9" style="width: 160px" />
        <SrInputNumber v-model="both" size="sm" style="width: 130px" />
        <SrInputNumber v-model="both" size="lg" style="width: 150px" />
      </div>
    </section>

    <section>
      <h3>无步进按钮与校验态</h3>
      <div class="row">
        <SrInputNumber v-model="plain" :controls="false" style="width: 150px" />
        <SrInputNumber v-model="plain" status="error" style="width: 150px" />
      </div>
    </section>

    <section>
      <h3>空值、禁用、只读与事件日志</h3>
      <div class="row">
        <SrInputNumber
          v-model="empty"
          placeholder="未填写"
          style="width: 150px"
          @change="onChange"
          @step="onStep"
          @focus="log('focus')"
          @blur="log('blur')"
        />
        <SrInputNumber :model-value="3" disabled style="width: 130px" />
        <SrInputNumber :model-value="3" readonly style="width: 130px" />
        <span class="hint">空值为 null，不是 0；失焦或回车才派发 change，步进派发 step</span>
      </div>
      <EventLog :events="events" title="输入事件" @clear="events = []" />
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
  flex-wrap: wrap;
  gap: 12px;
}
.hint {
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 1.7;
}
</style>
