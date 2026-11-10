<script setup lang="ts">
import { computed, ref } from 'vue'
import { SrButton, SrTag, SrVirtualList } from '@sunset-reverie/ui'

defineOptions({ name: 'VirtualListDemo' })

/** 一万条简单数据 */
const bigItems = Array.from({ length: 10000 }, (_, i) => i)

/** 一千条带头像的数据 */
const users = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${String(i + 1).padStart(4, '0')}`,
  email: `user${i + 1}@example.com`,
  score: Math.round(Math.random() * 100),
}))

/** 列表实例 */
const listRef = ref<InstanceType<typeof SrVirtualList> | null>(null)

/** 跳到第几条 */
const jumpTo = ref(0)

/**
 * 跳转
 */
function jump(): void {
  listRef.value?.scrollToIndex(Number(jumpTo.value) || 0)
}

/** 每条高度 */
const USER_HEIGHT = 56

/** 可视高度 */
const HEIGHT = 320

/** 实际渲染的 DOM 数（用于说明效果） */
const renderedCount = computed(() => Math.ceil(HEIGHT / USER_HEIGHT) + 6)

/** 用户行结构 */
interface UserRow {
  id: number
  name: string
  email: string
  score: number
}

/**
 * 虚拟列表的 item 是 unknown，模板表达式里不能写 `as` 断言（vue-tsc 会报语法错），
 * 取值统一收到脚本里，模板只调函数
 * @param item 列表项
 * @returns 行 key
 */
function userKey(item: unknown): number {
  return (item as UserRow).id
}

/**
 * 取用户名
 * @param item 列表项
 * @returns 姓名
 */
function userName(item: unknown): string {
  return (item as UserRow).name
}

/**
 * 取邮箱
 * @param item 列表项
 * @returns 邮箱
 */
function userMail(item: unknown): string {
  return (item as UserRow).email
}

/**
 * 取分数
 * @param item 列表项
 * @returns 分数
 */
function userScore(item: unknown): number {
  return (item as UserRow).score
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>一万条数据</h3>
      <div class="card" style="padding: 0">
        <SrVirtualList :items="bigItems" :item-height="32" :height="280">
          <template #default="{ item, index }">
            <div class="row" :class="{ 'row--alt': index % 2 === 1 }">
              <span class="row__index">{{ index }}</span>
              <span>第 {{ item }} 条数据</span>
            </div>
          </template>
        </SrVirtualList>
      </div>
      <p class="hint">10000 条数据，DOM 里始终只有十几个节点。滚动条长度仍按总高度算，所以拖动手感是对的。</p>
    </section>

    <section>
      <h3>带头像的列表</h3>
      <div class="card" style="padding: 0">
        <SrVirtualList :items="users" :item-height="USER_HEIGHT" :height="HEIGHT" :item-key="userKey">
          <template #default="{ item }">
            <div class="user">
              <div class="user__avatar">{{ userName(item).slice(-2) }}</div>
              <div class="user__main">
                <p class="user__name">{{ userName(item) }}</p>
                <p class="user__mail">{{ userMail(item) }}</p>
              </div>
              <SrTag size="sm" :type="userScore(item) > 60 ? 'success' : 'info'">
                {{ userScore(item) }} 分
              </SrTag>
            </div>
          </template>
        </SrVirtualList>
      </div>
      <p class="hint">1000 条，实际渲染约 {{ renderedCount }} 个节点；复杂行内容也能保持流畅</p>
    </section>

    <section>
      <h3>滚动到指定位置</h3>
      <div class="row" style="margin-bottom: 12px">
        <span class="label">跳到第</span>
        <input v-model.number="jumpTo" class="mini-input" type="number" min="0" max="9999" />
        <span class="label">条</span>
        <SrButton size="xs" variant="primary" @click="jump">跳转</SrButton>
        <SrButton size="xs" variant="outline" @click="listRef?.scrollToTop()">回顶部</SrButton>
      </div>
      <div class="card" style="padding: 0">
        <SrVirtualList ref="listRef" :items="bigItems" :item-height="32" :height="220">
          <template #default="{ item, index }">
            <div class="row" :class="{ 'row--alt': index % 2 === 1 }">
              <span class="row__index">{{ index }}</span>
              <span>第 {{ item }} 条数据</span>
            </div>
          </template>
        </SrVirtualList>
      </div>
      <p class="hint">通过 ref 调用 <code>scrollToIndex(n)</code> / <code>scrollToTop()</code></p>
    </section>

    <section>
      <h3>对比：普通 v-for</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">SrVirtualList（1000 条）</span>
          <div style="height: 160px; overflow: hidden">
            <SrVirtualList :items="bigItems.slice(0, 1000)" :item-height="32" :height="160">
              <template #default="{ index }">
                <div class="row">
                  <span class="row__index">{{ index }}</span>
                </div>
              </template>
            </SrVirtualList>
          </div>
          <p class="hint">DOM 节点约 14 个</p>
        </div>
        <div class="card">
          <span class="tag">普通 v-for（100 条已是上限）</span>
          <div class="plain">
            <div v-for="i in 100" :key="i" class="row">
              <span class="row__index">{{ i }}</span>
            </div>
          </div>
          <p class="hint">DOM 节点 100 个，再往上就卡了</p>
        </div>
      </div>
    </section>

    <section>
      <h3>注意事项</h3>
      <ul class="notes">
        <li>
          <strong>每项高度必须固定</strong>：传
          <code>itemHeight</code>，内容是两行还是一行都由你控制，但要保证实际高度一致
        </li>
        <li><strong>容器高度必须传</strong>：组件靠它算可视区条数，不传就没有虚拟化效果</li>
        <li>
          <strong>列表会增删时传 <code>itemKey</code></strong
          >：否则按键复用会错位，出现「滚一下内容就变了」
        </li>
      </ul>
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
  margin: 0 0 12px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 1.6;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 100%;
  padding: 0 12px;
  font-size: 13px;
}

.row--alt {
  background: color-mix(in srgb, var(--sr-color-bg-sunken) 55%, transparent);
}

.row__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 20px;
  border-radius: 4px;
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 100%;
  padding: 0 12px;
}

.user__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--sr-color-primary) 12%, transparent);
  color: var(--sr-color-primary-text);
  font-size: 11px;
  font-weight: 600;
}

.user__main {
  flex: 1 1 auto;
  min-width: 0;
}

.user__name {
  margin: 0;
  color: var(--sr-color-text);
  font-size: 13px;
}

.user__mail {
  margin: 1px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.row {
  box-sizing: border-box;
}

.card {
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
  overflow: hidden;
}

.tag {
  display: block;
  padding: 10px 12px 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.plain {
  height: 160px;
  overflow: hidden;
}

.row :deep(.row__index) {
  flex: 0 0 auto;
}

.label {
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.mini-input {
  width: 76px;
  height: 26px;
  padding: 0 6px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: 6px;
  background: var(--sr-color-bg-container);
  color: var(--sr-color-text);
  font-size: 12px;
}

.notes {
  margin: 0;
  padding-left: 18px;
  color: var(--sr-color-text-secondary);
  font-size: 12.5px;
  line-height: 2;
}

.notes code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--sr-color-bg-sunken);
  font-family: var(--sr-font-family-mono);
  font-size: 11.5px;
}
</style>
