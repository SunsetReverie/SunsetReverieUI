<script setup lang="ts">
import { computed, ref } from 'vue'
import { SrButton, SrTable, SrTag, type SrTableColumn, type SrTableRow } from '@sunset-reverie/ui'

defineOptions({ name: 'TableDemo' })

/** 基础数据 */
const rows: SrTableRow[] = [
  { id: 1, name: 'SrTable', owner: '林深', status: 'stable', updated: '11-06' },
  { id: 2, name: 'SrNav', owner: '周夏', status: 'beta', updated: '11-07' },
  { id: 3, name: 'SrDrawer', owner: '陈默', status: 'stable', updated: '11-05' },
  { id: 4, name: 'SrTag', owner: '苏白', status: 'beta', updated: '11-07' },
  { id: 5, name: 'SrTabs', owner: '顾言', status: 'stable', updated: '11-04' },
  { id: 6, name: 'SrModal', owner: '沈川', status: 'beta', updated: '11-03' },
]

/** 基础列 */
const columns: SrTableColumn[] = [
  { key: 'name', title: '组件', minWidth: 140, sortable: true },
  { key: 'owner', title: '负责人', width: 110 },
  { key: 'status', title: '状态', width: 110 },
  { key: 'updated', title: '更新时间', width: 120, align: 'right' },
]

const statusText: Record<string, string> = { stable: '稳定', beta: '预览版' }
const statusType: Record<string, 'success' | 'warning'> = { stable: 'success', beta: 'warning' }

/* ---------- 多选 ---------- */
const selected = ref<(string | number)[]>([])

/* ---------- 展开行 ---------- */
const expanded = ref<(string | number)[]>([])

/* ---------- 服务端排序 ---------- */
const serverRows = ref([...rows])
const serverSort = ref('默认顺序')

function onSort(payload: { key: string; order: 'asc' | 'desc' | null }): void {
  serverSort.value = payload.order ? `${payload.key} ${payload.order}` : '已取消排序'
  const list = [...rows]
  if (payload.order) {
    list.sort((a, b) => {
      const av = String(a[payload.key] ?? '')
      const bv = String(b[payload.key] ?? '')
      return payload.order === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }
  serverRows.value = list
}

/* ---------- 固定列 ---------- */
const wideColumns: SrTableColumn[] = [
  { key: 'id', title: 'ID', width: 80, fixed: 'left' },
  { key: 'name', title: '组件', width: 150, fixed: 'left' },
  { key: 'owner', title: '负责人', width: 140 },
  { key: 'status', title: '状态', width: 140 },
  { key: 'updated', title: '更新时间', width: 140 },
  { key: 'version', title: '版本', width: 140 },
  { key: 'actions', title: '操作', width: 140, fixed: 'right' },
]

const wideRows = rows.map((row, i) => ({ ...row, version: `0.${i + 2}.1` }))

/* ---------- 分页 ---------- */
const page = ref(1)

/* ---------- 懒加载 ---------- */
const lazyRows = ref(rows.slice(0, 3))
const loadingMore = ref(false)
const hasMore = ref(true)

function loadMore(): void {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  setTimeout(() => {
    const next = rows.slice(lazyRows.value.length, lazyRows.value.length + 3)
    lazyRows.value = [...lazyRows.value, ...next]
    hasMore.value = lazyRows.value.length < rows.length
    loadingMore.value = false
  }, 700)
}

/* ---------- formatter ---------- */
const formattedColumns: SrTableColumn[] = [
  { key: 'name', title: '组件' },
  { key: 'owner', title: '负责人' },
  {
    key: 'status',
    title: '状态（formatter）',
    formatter: (row) => statusText[String(row.status)] ?? String(row.status),
  },
]

/* ---------- loading / 空 ---------- */
const loading = ref(true)
setTimeout(() => {
  loading.value = false
}, 1200)

const selectedCount = computed(() => selected.value.length)

/* ---------- 事件日志 ---------- */
const eventLogs = ref<string[]>([])

/**
 * 记录表格事件
 * @param text 内容
 */
function logEvent(text: string): void {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  eventLogs.value = [`${time}  ${text}`, ...eventLogs.value].slice(0, 5)
}

/* ---------- 列布局 ---------- */
/** 定宽列（tableLayout = fixed） */
const fixedLayoutColumns: SrTableColumn[] = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '组件', width: 160 },
  { key: 'owner', title: '负责人', width: 120 },
  { key: 'updated', title: '更新时间', width: 120, align: 'right' },
]

/** 自适应列（tableLayout = auto） */
const autoLayoutColumns: SrTableColumn[] = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: '组件名称（内容长的会自动变宽）' },
  { key: 'owner', title: '负责人' },
  { key: 'updated', title: '更新时间' },
]
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础（可排序 + 自定义单元格）</h3>
      <SrTable :columns="columns" :data="rows">
        <template #cell-status="{ value }">
          <SrTag :type="statusType[value as string]" size="sm" round>
            {{ statusText[value as string] ?? value }}
          </SrTag>
        </template>
      </SrTable>
    </section>

    <section>
      <h3>多选（表头半选）</h3>
      <SrTable v-model:selected-keys="selected" :columns="columns" :data="rows" selectable>
        <template #cell-status="{ value }">
          <SrTag :type="statusType[value as string]" size="sm" round>
            {{ statusText[value as string] ?? value }}
          </SrTag>
        </template>
      </SrTable>
      <p class="hint">已选 {{ selectedCount }} 行</p>
    </section>

    <section>
      <h3>展开行</h3>
      <SrTable v-model:expanded-keys="expanded" :columns="columns" :data="rows" expandable>
        <template #expand="{ row }">
          <p style="margin: 0; font-size: 13px">
            {{ row.name }} 的详情：负责人 {{ row.owner }}，最近更新 {{ row.updated }}。
          </p>
        </template>
      </SrTable>
    </section>

    <section>
      <h3>服务端排序（sort-mode="server"）</h3>
      <SrTable
        :columns="columns"
        :data="serverRows"
        sort-mode="server"
        :default-sort="{ key: 'name', order: 'asc' }"
        @sort-change="onSort"
      />
      <p class="hint">当前排序：{{ serverSort }}</p>
    </section>

    <section>
      <h3>固定列（横向滚动看效果）</h3>
      <SrTable :columns="wideColumns" :data="wideRows" bordered>
        <template #cell-status="{ value }">
          <SrTag :type="statusType[value as string]" size="sm" round>
            {{ statusText[value as string] ?? value }}
          </SrTag>
        </template>
        <template #cell-actions>
          <SrButton size="xs" variant="primary">编辑</SrButton>
        </template>
      </SrTable>
    </section>

    <section>
      <h3>斑马纹 + 吸顶表头</h3>
      <SrTable :columns="columns" :data="[...rows, ...rows]" stripe :max-height="220">
        <template #cell-status="{ value }">
          <SrTag :type="statusType[value as string]" size="sm" round>
            {{ statusText[value as string] ?? value }}
          </SrTag>
        </template>
      </SrTable>
    </section>

    <section>
      <h3>前端分页</h3>
      <SrTable v-model:page="page" :columns="columns" :data="rows" :pagination="{ pageSize: 3 }">
        <template #cell-status="{ value }">
          <SrTag :type="statusType[value as string]" size="sm" round>
            {{ statusText[value as string] ?? value }}
          </SrTag>
        </template>
      </SrTable>
    </section>

    <section>
      <h3>懒加载（maxHeight + lazy）</h3>
      <SrTable
        :columns="columns"
        :data="lazyRows"
        lazy
        :has-more="hasMore"
        :loading-more="loadingMore"
        :max-height="240"
        @load-more="loadMore"
      >
        <template #cell-status="{ value }">
          <SrTag :type="statusType[value as string]" size="sm" round>
            {{ statusText[value as string] ?? value }}
          </SrTag>
        </template>
      </SrTable>
    </section>

    <section>
      <h3>自定义空状态（#empty 插槽）</h3>
      <div class="grid">
        <div>
          <span class="tag">默认空状态</span>
          <SrTable :data="[]" :columns="columns" />
        </div>
        <div>
          <span class="tag">#empty 插槽</span>
          <SrTable :data="[]" :columns="columns">
            <template #empty>
              <div class="empty">
                <p class="empty__title">还没有组件记录</p>
                <p class="empty__desc">点击右上角「新建」开始添加</p>
                <SrButton size="xs" variant="primary">新建组件</SrButton>
              </div>
            </template>
          </SrTable>
        </div>
      </div>
      <p class="hint">
        插槽比 <code>emptyText</code> 灵活：可以放按钮、插画；只改图标用 <code>emptyIcon</code>
      </p>
    </section>

    <section>
      <h3>事件</h3>
      <div class="row">
        <div style="flex: 1 1 420px; min-width: 320px">
          <SrTable
            :data="rows"
            :columns="columns"
            selectable
            @row-click="logEvent(`row-click: ${($event as SrTableRow).name}`)"
            @selection-change="logEvent(`selection-change: ${($event as (string | number)[]).length} 项`)"
            @sort-change="
              logEvent(
                `sort-change: ${($event as { key: string; order: string | null }).key} ${($event as { order: string | null }).order ?? '取消'}`,
              )
            "
          />
        </div>
        <div class="log">
          <p v-if="!eventLogs.length" class="hint" style="margin: 0">
            点行、勾选、点表头排序，事件会记在这里
          </p>
          <p v-for="(line, i) in eventLogs" :key="i" class="log__line">{{ line }}</p>
        </div>
      </div>
      <p class="hint">三个事件可以同时监听，互不影响</p>
    </section>

    <section>
      <h3>列布局（tableLayout）</h3>
      <div class="stack">
        <div>
          <span class="tag">fixed：按 width 定宽，内容超长省略</span>
          <SrTable :data="rows" :columns="fixedLayoutColumns" table-layout="fixed" />
        </div>
        <div>
          <span class="tag">auto：列宽按内容自适应</span>
          <SrTable :data="rows" :columns="autoLayoutColumns" table-layout="auto" />
        </div>
      </div>
      <p class="hint">定宽适合列数固定、需要对齐的后台表格；自适应适合内容长短差异大的场景</p>
    </section>

    <section>
      <h3>formatter（无插槽时生效）</h3>
      <SrTable :columns="formattedColumns" :data="rows" />
    </section>

    <section>
      <h3>加载中 / 空状态</h3>
      <div class="two-col">
        <SrTable :columns="columns" :data="rows" loading />
        <SrTable :columns="columns" :data="[]" empty-text="还没有组件" empty-icon="lucide:inbox" />
        <SrTable :columns="columns" :data="[]" empty-text="已关闭图标" empty-icon="" />
      </div>
    </section>

    <section>
      <h3>尺寸与边框</h3>
      <div class="two-col">
        <SrTable :columns="columns" :data="rows.slice(0, 2)" size="sm" />
        <SrTable :columns="columns" :data="rows.slice(0, 2)" bordered :hoverable="false" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6px;
  padding: 20px 0;
}

.empty__title {
  margin: 4px 0 0;
  color: var(--sr-color-text);
  font-size: 13px;
  font-weight: var(--sr-font-weight-medium);
}

.empty__desc {
  margin: 0 0 6px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.log {
  flex: 1 1 240px;
  min-width: 240px;
  padding: 10px 12px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: var(--sr-color-bg-sunken);
  font-family: var(--sr-font-family-mono);
  font-size: 11.5px;
  line-height: 1.9;
}

.log__line {
  margin: 0;
  color: var(--sr-color-text-secondary);
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.tag {
  display: block;
  margin-bottom: 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

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
.two-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}
</style>
