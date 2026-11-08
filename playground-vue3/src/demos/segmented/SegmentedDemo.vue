<script setup lang="ts">
import { computed, ref } from 'vue'
import { SrSegmented, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'SegmentedDemo' })

/** 时间粒度 */
const range = ref<string | number>('week')

const rangeOptions = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '季', value: 'quarter' },
]

/** 视图模式（带图标） */
const view = ref<string | number>('list')

const viewOptions = [
  { label: '列表', value: 'list', icon: 'lucide:menu' },
  { label: '图表', value: 'chart', icon: 'lucide:eye' },
]

/** 状态筛选 */
const status = ref<string | number>('all')

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'done' },
  { label: '已归档（不可选）', value: 'archived', disabled: true },
]

/** 占满宽度 */
const blockValue = ref<string | number>('grid')

const blockOptions = [
  { label: '网格', value: 'grid' },
  { label: '表格', value: 'table' },
  { label: '看板', value: 'board' },
]

/** 全禁用 */
const disabledValue = ref<string | number>('a')

const disabledOptions = [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
]

/** 当前文案 */
const rangeText = computed(() => {
  const map: Record<string, string> = { day: '今天', week: '近 7 天', month: '近 30 天', quarter: '近 90 天' }
  return map[String(range.value)] ?? ''
})
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础用法</h3>
      <div class="row">
        <SrSegmented v-model="range" :options="rangeOptions" />
        <span class="hint" style="margin: 0">当前：{{ rangeText }}</span>
      </div>
      <p class="hint">选中项有一块会滑动的白色底板，切换时平滑过渡</p>
    </section>

    <section>
      <h3>带图标</h3>
      <SrSegmented v-model="view" :options="viewOptions" />
      <p class="hint">选项的 icon 会放在文案前面，适合视图切换这类有固定隐喻的场景</p>
    </section>

    <section>
      <h3>禁用项</h3>
      <SrSegmented v-model="status" :options="statusOptions" />
      <p class="hint">单项禁用不影响其它项；禁用的那项文字变淡且不可点</p>
    </section>

    <section>
      <h3>整体禁用</h3>
      <SrSegmented v-model="disabledValue" :options="disabledOptions" disabled />
      <p class="hint">disabled 传在组件上，所有选项都不可交互</p>
    </section>

    <section>
      <h3>占满宽度（block）</h3>
      <SrSegmented v-model="blockValue" :options="blockOptions" block />
      <p class="hint">block 让每项等分容器宽度，适合放在表单里和输入框对齐</p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="stack">
        <div v-for="s in ['xs', 'sm', 'md', 'lg']" :key="s" class="size-row">
          <span class="size-row__label">{{ s }}</span>
          <SrSegmented :options="rangeOptions.slice(0, 3)" :model-value="'week'" :size="s as 'sm'" />
        </div>
      </div>
    </section>

    <section>
      <h3>和 RadioGroup 的区别</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">Segmented（等分、滑块）</span>
          <SrSegmented :options="rangeOptions.slice(0, 3)" :model-value="'week'" />
          <p class="hint">像标签栏，切换是「换视图」，选中态很轻</p>
        </div>
        <div class="card">
          <span class="tag">RadioGroup（列表、圆圈）</span>
          <div style="display: flex; flex-direction: column; gap: 8px">
            <SrTag size="sm">日</SrTag>
            <SrTag size="sm" type="primary">周</SrTag>
            <SrTag size="sm">月</SrTag>
          </div>
          <p class="hint">像表单项，选中是「填了一个值」，视觉更重</p>
        </div>
      </div>
      <p class="hint">视图切换用 Segmented，表单里的单选还是用 RadioGroup</p>
    </section>

    <section>
      <h3>组合：列表页工具栏</h3>
      <div class="card">
        <div class="row" style="justify-content: space-between">
          <div class="row">
            <SrSegmented v-model="range" :options="rangeOptions" size="sm" />
            <SrSegmented v-model="view" :options="viewOptions" size="sm" />
          </div>
          <SrTag type="info" size="sm">{{ rangeText }}</SrTag>
        </div>
        <div class="divider" />
        <p class="hint" style="margin: 0">
          两个分段控制器并排，左边控制时间范围、右边控制展示方式——后台工具栏的常见组合。
        </p>
      </div>
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
  flex-wrap: wrap;
  gap: 12px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.card {
  padding: 14px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.tag {
  display: block;
  margin-bottom: 12px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.size-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.size-row__label {
  flex: 0 0 40px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.divider {
  height: 1px;
  margin: 14px 0;
  background: var(--sr-color-border-subtle);
}
</style>
