<script setup lang="ts">
import { ref } from 'vue'
import { SrPagination } from '@sunset-reverie/ui'

import EventLog from '../../components/EventLog.vue'

defineOptions({ name: 'PaginationDemo' })

const page = ref(1)
const pageSize = ref(10)
const simplePage = ref(1)
const fullPage = ref(1)
const fullSize = ref(10)

/** 最近的分页事件 */
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
 * 页码或每页条数变化
 * @param nextPage 新页码
 * @param nextSize 新每页条数
 * @returns 无
 */
function onChange(nextPage: number, nextSize: number): void {
  log(`change: page=${nextPage}, pageSize=${nextSize}`)
}

/**
 * 每页条数变化
 * @param nextSize 新每页条数
 * @returns 无
 */
function onSizeChange(nextSize: number): void {
  log(`size-change: ${nextSize}`)
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础（页码收敛）</h3>
      <SrPagination v-model="page" :total="120" />
      <p class="hint">当前第 {{ page }} 页</p>
    </section>

    <section>
      <h3>每页条数与跳页</h3>
      <SrPagination v-model="page" v-model:page-size="pageSize" :total="200" show-jumper />
      <p class="hint">每页 {{ pageSize }} 条</p>
    </section>

    <section>
      <h3>全套能力与事件日志</h3>
      <SrPagination
        v-model="fullPage"
        v-model:page-size="fullSize"
        :total="236"
        :page-size-options="[10, 20, 50, 100]"
        show-total
        show-sizer
        show-jumper
        @change="onChange"
        @size-change="onSizeChange"
      />
      <p class="hint">
        `change` 在页码或条数变化后都触发，`size-change` 只在条数变化时触发；
        改条数会把页码夹回合法范围，避免停在不存在的页。
      </p>
      <EventLog :events="events" title="分页事件" @clear="events = []" />
    </section>

    <section>
      <h3>简洁模式与禁用</h3>
      <SrPagination v-model="simplePage" :total="200" simple />
      <div class="row">
        <SrPagination :model-value="3" :total="200" size="sm" disabled />
        <span class="hint">禁用态仍展示当前位置，只是无法切换</span>
      </div>
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
.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 1.7;
}
.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
}
</style>
