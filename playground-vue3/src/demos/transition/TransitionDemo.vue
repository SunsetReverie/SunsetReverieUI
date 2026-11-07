<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrTransition } from '@sunset-reverie/ui'

defineOptions({ name: 'TransitionDemo' })

const show = ref(true)
const enabled = ref(true)
const appear = ref(false)

/** 五种预设各自的显隐状态 */
const states = ref<Record<string, boolean>>({
  fade: true,
  'fade-up': true,
  zoom: true,
  collapse: true,
})

/** 列表项 */
const items = ref([1, 2, 3])
let seed = 3

function addItem(): void {
  seed += 1
  items.value = [...items.value, seed]
}

function removeItem(): void {
  items.value = items.value.slice(0, -1)
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>四种预设</h3>
      <div class="stack">
        <div v-for="(_, name) in states" :key="name" class="preset">
          <div class="preset__head">
            <span class="label">{{ name }}</span>
            <SrButton size="xs" variant="text" @click="states[name] = !states[name]">
              {{ states[name] ? '隐藏' : '显示' }}
            </SrButton>
          </div>

          <SrTransition :name="name as 'fade'">
            <div v-if="states[name]" class="block">过渡效果：{{ name }}</div>
          </SrTransition>
        </div>
      </div>
    </section>

    <section>
      <h3>启用 / 关闭动画</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="enabled = !enabled">
          {{ enabled ? '关闭动画' : '开启动画' }}
        </SrButton>
        <SrButton size="sm" variant="primary" @click="show = !show">
          {{ show ? '隐藏' : '显示' }}
        </SrButton>
      </div>

      <SrTransition name="fade-up" :enabled="enabled">
        <div v-if="show" class="block">enabled = {{ enabled }}，切换时无过渡帧但语义不变</div>
      </SrTransition>
    </section>

    <section>
      <h3>进出模式（mode）</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="appear = !appear">{{
          appear ? '切回 A' : '切到 B'
        }}</SrButton>
      </div>
      <SrTransition name="fade" mode="out-in">
        <div v-if="!appear" class="block">内容 A（out-in：旧的先退场）</div>
        <div v-else class="block">内容 B（新的再进场）</div>
      </SrTransition>
    </section>

    <section>
      <h3>列表（list 用于 v-for）</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="addItem">添加</SrButton>
        <SrButton size="sm" variant="outline" @click="removeItem">移除</SrButton>
      </div>

      <TransitionGroup name="sr-list" tag="ul" class="list">
        <li v-for="item in items" :key="item" class="list__item">第 {{ item }} 项</li>
      </TransitionGroup>
      <p class="hint">列表过渡用 Vue 的 TransitionGroup，每个项必须有稳定 key</p>
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
.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}
.hint {
  margin: 10px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preset {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--sr-color-primary-alpha-08);
}

.preset__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.label {
  color: var(--sr-color-text-tertiary);
  font-family: var(--sr-font-family-mono);
  font-size: 12px;
}

.block {
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--sr-color-bg-container);
  color: var(--sr-color-primary-text);
  font-size: 13px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.list__item {
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--sr-color-bg-container);
  color: var(--sr-color-text-secondary);
  font-size: 13px;
}
</style>
