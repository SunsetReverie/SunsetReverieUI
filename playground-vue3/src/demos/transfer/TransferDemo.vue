<script setup lang="ts">
import { computed, ref } from 'vue'
import { SrTransfer, type SrTransferItem, type SrTransferValue } from '@sunset-reverie/ui'

defineOptions({ name: 'TransferDemo' })

/** 基础数据 */
const allItems: SrTransferItem[] = [
  { value: 'dashboard', label: '仪表盘' },
  { value: 'users', label: '用户管理' },
  { value: 'roles', label: '角色权限' },
  { value: 'audit', label: '审计日志' },
  { value: 'billing', label: '账单中心' },
  { value: 'settings', label: '系统设置' },
]

/** 基础值 */
const basic = ref<SrTransferValue[]>(['users', 'roles'])

/** 可搜索 */
const searchable = ref<SrTransferValue[]>(['audit'])

/** 大列表 */
const bigItems: SrTransferItem[] = Array.from({ length: 40 }, (_, i) => ({
  value: i,
  label: `权限项 ${String(i + 1).padStart(2, '0')}`,
  disabled: i === 5 || i === 12,
}))

const bigValue = ref<SrTransferValue[]>([0, 1, 20])

/** 禁用演示 */
const disabledValue = ref<SrTransferValue[]>(['a'])

/** 自定义标题 */
const titledValue = ref<SrTransferValue[]>([])

/** 变更日志 */
const lastChange = ref('')

/** 基础值文案 */
const basicText = computed(() => (basic.value.length ? basic.value.join(', ') : '空'))

/**
 * 记录变更
 * @param value 值
 * @param direction 方向
 */
function onChange(value: SrTransferValue[], direction: 'left' | 'right'): void {
  lastChange.value = `${direction === 'right' ? '移入' : '移出'} ${value.length} 项`
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础用法</h3>
      <SrTransfer v-model="basic" :data="allItems" @change="onChange" />
      <p class="hint">
        已选 <code>{{ basicText }}</code>
        <span v-if="lastChange">；最近一次：{{ lastChange }}</span>
      </p>
      <p class="hint">
        <code>modelValue</code> 只存「在哪一边」，不存顺序——顺序始终跟 <code>data</code> 一致
      </p>
    </section>

    <section>
      <h3>可搜索</h3>
      <SrTransfer v-model="searchable" :data="allItems" filterable :titles="['全部权限', '已授权']" />
      <p class="hint">两侧各有独立搜索框，互不影响</p>
    </section>

    <section>
      <h3>大列表 + 禁用项</h3>
      <SrTransfer v-model="bigValue" :data="bigItems" filterable :height="240" />
      <p class="hint">40 条数据，其中「权限项 06」「权限项 13」是禁用的——全选时会被跳过</p>
    </section>

    <section>
      <h3>整体禁用</h3>
      <SrTransfer v-model="disabledValue" :data="allItems.slice(0, 4)" disabled />
      <p class="hint">禁用状态下两侧都变灰，按钮不可点，适合「只读查看」的权限页</p>
    </section>

    <section>
      <h3>自定义标题</h3>
      <SrTransfer v-model="titledValue" :data="allItems" :titles="['可选角色', '已分配角色']" />
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="stack">
        <div v-for="s in ['sm', 'md', 'lg']" :key="s" class="size-row">
          <span class="size-row__label">{{ s }}</span>
          <SrTransfer
            :model-value="['users']"
            :data="allItems.slice(0, 4)"
            :titles="[s, s]"
            :size="s as 'sm'"
            :height="140"
          />
        </div>
      </div>
    </section>

    <section>
      <h3>空状态</h3>
      <SrTransfer :model-value="[]" :data="[]" empty-text="还没有可分配的权限" :height="140" />
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

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--sr-color-bg-sunken);
  font-family: var(--sr-font-family-mono);
  font-size: 11.5px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.size-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.size-row__label {
  flex: 0 0 32px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 28px;
}
</style>
