<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { SrButton, SrTable, srToast, type SrTableColumn, type SrTableRow } from '@sunset-reverie/ui'

defineOptions({ name: 'TableView' })

/** 基础列 */
const columns: SrTableColumn[] = [
  { key: 'name', title: '组件', sortable: true, minWidth: 140 },
  { key: 'type', title: '类型', width: 110 },
  { key: 'size', title: '样式体积', sortable: true, align: 'right', width: 120 },
  { key: 'status', title: '状态', width: 110, align: 'center' },
  { key: 'updated', title: '更新时间', sortable: true, width: 150 },
]

/** 行数据 */
const rows: SrTableRow[] = [
  { id: 1, name: 'SrButton', type: '基础', size: 6.8, status: 'stable', updated: '2026-10-28' },
  { id: 2, name: 'SrInput', type: '表单', size: 4.7, status: 'stable', updated: '2026-10-30' },
  { id: 3, name: 'SrSelect', type: '表单', size: 5.2, status: 'beta', updated: '2026-11-04' },
  { id: 4, name: 'SrTable', type: '数据展示', size: 7.9, status: 'beta', updated: '2026-11-05' },
  { id: 5, name: 'SrModal', type: '反馈', size: 3.6, status: 'stable', updated: '2026-10-31' },
  { id: 6, name: 'SrToast', type: '反馈', size: 3.2, status: 'stable', updated: '2026-10-31' },
  { id: 7, name: 'SrTooltip', type: '反馈', size: 2.4, status: 'beta', updated: '2026-11-03' },
  { id: 8, name: 'SrForm', type: '表单', size: 3.1, status: 'beta', updated: '2026-11-04' },
]

/** 已选行 */
const selected = ref<(string | number)[]>([])
/** 展开行 */
const expanded = ref<(string | number)[]>([])
/** 加载态 */
const loading = ref(false)

/** 大数据集（用于验证 1000 行渲染） */
const bigData = ref<SrTableRow[]>([])

/** 大数据集列 */
const bigColumns: SrTableColumn[] = [
  { key: 'name', title: '名称', sortable: true, minWidth: 160 },
  { key: 'index', title: '序号', sortable: true, align: 'right', width: 100 },
  { key: 'value', title: '数值', sortable: true, align: 'right', width: 120 },
]

/**
 * 生成 1000 行数据
 */
function loadBigData(): void {
  const start = performance.now()
  bigData.value = Array.from({ length: 1000 }, (_, index) => ({
    id: index + 1,
    name: `记录 ${index + 1}`,
    index: index + 1,
    value: Math.round(Math.random() * 10000),
  }))
  srToast.info(`已生成 1000 行（${(performance.now() - start).toFixed(1)} ms）`, {
    position: 'bottom-right',
  })
}

/** 状态文案映射 */
const statusText: Record<string, string> = {
  stable: '稳定',
  beta: '预览',
}

/**
 * 模拟刷新
 */
function reload(): void {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
    srToast.success('已刷新')
  }, 1200)
}

// ?big=1 自动生成 1000 行：无头截图无法点击按钮，用它验证大数据渲染
onMounted(() => {
  if (new URLSearchParams(window.location.search).get('big') === '1') loadBigData()
})

/**
 * 排序变化回调
 * @param payload 排序信息
 */
function onSortChange(payload: { key: string; order: 'asc' | 'desc' | null }): void {
  srToast.info(
    payload.order ? `按 ${payload.key} ${payload.order === 'asc' ? '升序' : '降序'}` : '已取消排序',
    { duration: 1600, position: 'bottom-right' },
  )
}
</script>

<template>
  <div>
    <section class="panel">
      <h2 class="panel__title">基础表格</h2>
      <p class="panel__desc">
        列配置驱动，单元格用 <code style="font-family: var(--sr-font-family-mono)">#cell-&lt;key&gt;</code>
        插槽自定义。点击「组件」「样式体积」表头可排序，第三次点击取消排序。
      </p>

      <sr-table :columns="columns" :data="rows" @sort-change="onSortChange">
        <template #cell-status="{ value }">
          <span class="badge" :class="value === 'stable' ? 'badge--ok' : 'badge--warn'">
            {{ statusText[value as string] ?? value }}
          </span>
        </template>

        <template #cell-size="{ value }">{{ Number(value).toFixed(1) }} KB</template>
      </sr-table>
    </section>

    <section class="panel">
      <h2 class="panel__title">选择与批量操作</h2>
      <p class="panel__desc">
        表头复选框支持半选；点击选择列不会触发行点击事件。 当前已选
        <strong>{{ selected.length }}</strong> 项。
      </p>

      <div style="display: flex; gap: 10px; margin-bottom: 12px; align-items: center">
        <sr-button variant="primary" size="sm" :disabled="selected.length === 0">
          批量处理（{{ selected.length }}）
        </sr-button>
        <sr-button variant="text" size="sm" @click="selected = []">清空选择</sr-button>
      </div>

      <sr-table v-model:selected-keys="selected" :columns="columns" :data="rows" selectable stripe>
        <template #cell-status="{ value }">
          <span class="badge" :class="value === 'stable' ? 'badge--ok' : 'badge--warn'">
            {{ statusText[value as string] ?? value }}
          </span>
        </template>
      </sr-table>
    </section>

    <section class="panel">
      <h2 class="panel__title">固定表头与展开行</h2>
      <p class="panel__desc">
        设置 <code style="font-family: var(--sr-font-family-mono)">max-height</code> 后表头自动吸顶，
        无需额外开关。展开列可放置详情内容。
      </p>

      <sr-table
        v-model:expanded-keys="expanded"
        :columns="columns"
        :data="rows"
        :max-height="280"
        bordered
        expandable
      >
        <template #expand="{ row }">
          <div style="display: grid; gap: 6px; font-size: 13px">
            <div>
              <strong>{{ row.name }}</strong> 属于「{{ row.type }}」类组件。
            </div>
            <div style="color: var(--sr-color-text-secondary)">
              样式体积 {{ Number(row.size).toFixed(1) }} KB，最近更新于 {{ row.updated }}。
            </div>
          </div>
        </template>

        <template #cell-status="{ value }">
          <span class="badge" :class="value === 'stable' ? 'badge--ok' : 'badge--warn'">
            {{ statusText[value as string] ?? value }}
          </span>
        </template>
      </sr-table>
    </section>

    <section class="panel">
      <h2 class="panel__title">加载与空状态</h2>
      <p class="panel__desc">加载遮罩盖在内容上而不是替换内容，表格高度不会跳动。</p>

      <div style="display: flex; gap: 10px; margin-bottom: 12px">
        <sr-button size="sm" variant="secondary" @click="reload">模拟刷新</sr-button>
      </div>

      <sr-table :columns="columns" :data="rows" :loading="loading" :max-height="240" />

      <div style="margin-top: 28px">
        <div style="margin-bottom: 8px; font-size: 12px; color: var(--sr-color-text-secondary)">空数据</div>
        <sr-table :columns="columns" :data="[]" empty-text="这个筛选条件下没有组件" />
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">大数据量</h2>
      <p class="panel__desc">
        一期不做虚拟滚动（规划文档 D-07 放在 P2 评估）。1000 行直接渲染 + 吸顶表头，
        用来确认当前实现在常见规模下够用。
      </p>

      <div style="display: flex; gap: 10px; margin-bottom: 12px; align-items: center">
        <sr-button size="sm" variant="secondary" @click="loadBigData">生成 1000 行</sr-button>
        <span style="font-size: 12px; color: var(--sr-color-text-secondary)">
          当前 {{ bigData.length }} 行
        </span>
      </div>

      <sr-table :columns="bigColumns" :data="bigData" :max-height="320" bordered>
        <template #empty>点击上方按钮生成数据</template>
      </sr-table>
    </section>

    <section class="panel">
      <h2 class="panel__title">窄屏卡片视图</h2>
      <p class="panel__desc">
        开启 <code style="font-family: var(--sr-font-family-mono)">responsive</code> 后， 视口进入 xs
        档时自动切换为卡片。<strong>把窗口拖窄到 576px 以下</strong>试试。
      </p>

      <sr-table :columns="columns" :data="rows.slice(0, 3)" responsive />
    </section>
  </div>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: var(--sr-radius-full);
  font-size: 12px;
  line-height: 1.6;
}

.badge--ok {
  background: var(--sr-color-success-bg);
  color: var(--sr-color-success-text);
}

.badge--warn {
  background: var(--sr-color-warning-bg);
  color: var(--sr-color-warning-text);
}
</style>
