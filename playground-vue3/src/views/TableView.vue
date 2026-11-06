<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { SrButton, SrTable, SrTag, srToast, type SrTableColumn, type SrTableRow } from '@sunset-reverie/ui'

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

/** 固定列演示：总宽超出容器才需要横向滚动 */
const wideColumns: SrTableColumn[] = [
  { key: 'id', title: 'ID', width: 80, fixed: 'left' },
  { key: 'name', title: '组件', width: 170, fixed: 'left' },
  { key: 'type', title: '类型', width: 130 },
  { key: 'owner', title: '负责人', width: 130 },
  { key: 'version', title: '版本', width: 120 },
  { key: 'size', title: '体积', width: 120, align: 'right' },
  { key: 'status', title: '状态', width: 130 },
  { key: 'updated', title: '更新时间', width: 160 },
  { key: 'actions', title: '操作', width: 210, fixed: 'right' },
]

/** 固定列演示数据 */
const wideRows: SrTableRow[] = rows.map((row, index) => ({
  ...row,
  owner: ['林深', '周夏', '陈默', '苏白'][index % 4],
  version: `0.${index + 2}.1`,
  actions: '编辑',
}))

/** 分页演示的当前页 */
const page = ref(1)

/** 懒加载数据 */
const lazyRows = ref<SrTableRow[]>([])
/** 是否正在加载更多 */
const lazyLoading = ref(false)
/** 是否还有更多 */
const lazyHasMore = ref(true)
/** 已加载条数游标 */
let lazyCursor = 0

/** 懒加载演示的列 */
const lazyColumns: SrTableColumn[] = [
  { key: 'id', title: 'ID', width: 90 },
  { key: 'name', title: '数据', minWidth: 180 },
  { key: 'source', title: '来源', width: 140 },
]

/** 模拟分页请求下一批数据 */
async function loadMore(): Promise<void> {
  if (lazyLoading.value || !lazyHasMore.value) return
  lazyLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))

  const batch = Array.from({ length: 8 }, (_, index) => ({
    id: lazyCursor + index + 1,
    name: `数据 ${lazyCursor + index + 1}`,
    source: '滚动加载',
  }))
  lazyRows.value = [...lazyRows.value, ...batch]
  lazyCursor += batch.length
  lazyHasMore.value = lazyCursor < 24
  lazyLoading.value = false
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
  void loadMore()
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
          <SrTag :type="value === 'stable' ? 'success' : 'warning'" round size="sm">
            {{ statusText[value as string] ?? value }}
          </SrTag>
        </template>

        <template #cell-size="{ value }">{{ Number(value).toFixed(1) }} KB</template>
      </sr-table>
    </section>

    <section class="panel">
      <h2 class="panel__title">固定列</h2>
      <p class="panel__desc">
        给列配置 <code style="font-family: var(--sr-font-family-mono)">fixed: 'left' | 'right'</code>
        后，横向滚动时这两列钉在两侧。固定列必须给出 px 宽度 —— 偏移量是按前面的列宽累加出来的。
      </p>

      <sr-table :columns="wideColumns" :data="wideRows" bordered>
        <template #cell-status="{ value }">
          <SrTag :type="value === 'stable' ? 'success' : 'warning'" round size="sm">
            {{ statusText[value as string] ?? value }}
          </SrTag>
        </template>
        <template #cell-actions>
          <div class="row-actions">
            <sr-button size="xs" variant="primary">编辑</sr-button>
            <sr-button size="xs" variant="outline">复制</sr-button>
            <sr-button size="xs" variant="text" class="row-actions__danger">删除</sr-button>
          </div>
        </template>
      </sr-table>
    </section>

    <section class="panel">
      <h2 class="panel__title">分页</h2>
      <p class="panel__desc">
        传 <code style="font-family: var(--sr-font-family-mono)">pagination</code> 开启前端分页， 配合
        <code style="font-family: var(--sr-font-family-mono)">v-model:page</code> 拿当前页。 共
        {{ rows.length }} 条，每页 3 条，当前第 {{ page }} 页。
      </p>

      <sr-table v-model:page="page" :columns="columns" :data="rows" :pagination="{ pageSize: 3 }">
        <template #cell-status="{ value }">
          <SrTag :type="value === 'stable' ? 'success' : 'warning'" round size="sm">
            {{ statusText[value as string] ?? value }}
          </SrTag>
        </template>
      </sr-table>
    </section>

    <section class="panel">
      <h2 class="panel__title">懒加载</h2>
      <p class="panel__desc">
        开启 <code style="font-family: var(--sr-font-family-mono)">lazy</code> 后，滚动到底部自动派发
        <code style="font-family: var(--sr-font-family-mono)">load-more</code>，
        底部还会给一个「加载更多」按钮兜底。已加载 <strong>{{ lazyRows.length }}</strong> / 24 条。
      </p>

      <sr-table
        :columns="lazyColumns"
        :data="lazyRows"
        lazy
        :has-more="lazyHasMore"
        :loading-more="lazyLoading"
        :max-height="260"
        @load-more="loadMore"
      />
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
          <SrTag :type="value === 'stable' ? 'success' : 'warning'" round size="sm">
            {{ statusText[value as string] ?? value }}
          </SrTag>
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
          <SrTag :type="value === 'stable' ? 'success' : 'warning'" round size="sm">
            {{ statusText[value as string] ?? value }}
          </SrTag>
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

    <section class="panel">
      <h2 class="panel__title">SrTable Props 速查</h2>
      <p class="panel__desc">
        列级配置见 <code style="font-family: var(--sr-font-family-mono)">SrTableColumn</code>： key / title /
        width / minWidth / align / sortable / ellipsis / fixed / slot / formatter。
      </p>

      <table class="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>data</code></td>
            <td><code>SrTableRow[]</code></td>
            <td><code>[]</code></td>
            <td>行数据</td>
          </tr>
          <tr>
            <td><code>columns</code></td>
            <td><code>SrTableColumn[]</code></td>
            <td><code>[]</code></td>
            <td>列配置</td>
          </tr>
          <tr>
            <td><code>rowKey</code></td>
            <td><code>string | Function</code></td>
            <td><code>'id'</code></td>
            <td>行唯一键字段或取值函数</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>'xs' | 'sm' | 'md' | 'lg'</code></td>
            <td>全局配置</td>
            <td>行高与字号档位</td>
          </tr>
          <tr>
            <td><code>bordered</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>显示竖线与外框</td>
          </tr>
          <tr>
            <td><code>stripe</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>斑马纹</td>
          </tr>
          <tr>
            <td><code>hoverable</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>悬停高亮</td>
          </tr>
          <tr>
            <td><code>maxHeight</code></td>
            <td><code>number | string</code></td>
            <td>—</td>
            <td>滚动区最大高度，设置后表头吸顶</td>
          </tr>
          <tr>
            <td><code>loading</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>加载遮罩</td>
          </tr>
          <tr>
            <td><code>emptyText</code></td>
            <td><code>string</code></td>
            <td><code>'暂无数据'</code></td>
            <td>空数据文案</td>
          </tr>
          <tr>
            <td><code>emptyIcon</code></td>
            <td><code>string</code></td>
            <td><code>'lucide:inbox'</code></td>
            <td>空数据图标，传空串则不显示</td>
          </tr>
          <tr>
            <td><code>selectable</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>显示多选列</td>
          </tr>
          <tr>
            <td><code>selectedKeys</code></td>
            <td><code>SrTableRowKey[]</code></td>
            <td><code>[]</code></td>
            <td>已选行，支持 v-model</td>
          </tr>
          <tr>
            <td><code>expandable</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>显示展开列</td>
          </tr>
          <tr>
            <td><code>expandedKeys</code></td>
            <td><code>SrTableRowKey[]</code></td>
            <td><code>[]</code></td>
            <td>展开行，支持 v-model</td>
          </tr>
          <tr>
            <td><code>responsive</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>xs 档自动切换卡片视图</td>
          </tr>
          <tr>
            <td><code>sortMode</code></td>
            <td><code>'client' | 'server'</code></td>
            <td><code>'client'</code></td>
            <td>排序由本地还是调用方处理</td>
          </tr>
          <tr>
            <td><code>defaultSort</code></td>
            <td><code>{ key, order }</code></td>
            <td>—</td>
            <td>默认排序</td>
          </tr>
          <tr>
            <td><code>tableLayout</code></td>
            <td><code>'auto' | 'fixed'</code></td>
            <td><code>'auto'</code></td>
            <td>表格布局算法</td>
          </tr>
          <tr>
            <td><code>pagination</code></td>
            <td><code>boolean | { pageSize }</code></td>
            <td><code>false</code></td>
            <td>开启前端分页</td>
          </tr>
          <tr>
            <td><code>page</code></td>
            <td><code>number</code></td>
            <td><code>1</code></td>
            <td>当前页，支持 v-model:page</td>
          </tr>
          <tr>
            <td><code>pageSize</code></td>
            <td><code>number</code></td>
            <td><code>10</code></td>
            <td>每页条数</td>
          </tr>
          <tr>
            <td><code>lazy</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>滚动到底派发 load-more</td>
          </tr>
          <tr>
            <td><code>hasMore</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>是否还有更多数据</td>
          </tr>
          <tr>
            <td><code>loadingMore</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>底部显示加载中</td>
          </tr>
        </tbody>
      </table>

      <h3 style="font-size: 14px; margin: 20px 0 8px">事件</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>事件</th>
            <th>参数</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>sort-change</code></td>
            <td><code>{ key, order }</code></td>
            <td>排序变化</td>
          </tr>
          <tr>
            <td><code>row-click</code></td>
            <td><code>(row, index)</code></td>
            <td>行点击</td>
          </tr>
          <tr>
            <td><code>selection-change</code></td>
            <td><code>(keys, rows)</code></td>
            <td>选中集合变化</td>
          </tr>
          <tr>
            <td><code>expand-change</code></td>
            <td><code>(keys, rows)</code></td>
            <td>展开集合变化</td>
          </tr>
          <tr>
            <td><code>page-change</code></td>
            <td><code>(page)</code></td>
            <td>页码变化</td>
          </tr>
          <tr>
            <td><code>load-more</code></td>
            <td>—</td>
            <td>滚动到底部，懒加载</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
/* 操作列：三个小按钮挤在一格里 */
.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.row-actions__danger {
  color: var(--sr-color-danger) !important;
}
</style>
