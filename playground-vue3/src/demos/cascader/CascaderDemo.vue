<script setup lang="ts">
import { computed, ref } from 'vue'
import { SrCascader, SrTag, type SrCascaderOption, type SrCascaderValue } from '@sunset-reverie/ui'

defineOptions({ name: 'CascaderDemo' })

/** 省市数据 */
const regions: SrCascaderOption[] = [
  {
    value: 'zj',
    label: '浙江省',
    children: [
      {
        value: 'hz',
        label: '杭州市',
        children: [
          { value: 'xh', label: '西湖区' },
          { value: 'sc', label: '上城区' },
          { value: 'yh', label: '余杭区' },
        ],
      },
      {
        value: 'nb',
        label: '宁波市',
        children: [
          { value: 'hs', label: '海曙区' },
          { value: 'jd', label: '江东区', disabled: true },
        ],
      },
    ],
  },
  {
    value: 'js',
    label: '江苏省',
    children: [
      {
        value: 'nj',
        label: '南京市',
        children: [
          { value: 'gl', label: '鼓楼区' },
          { value: 'xw', label: '玄武区' },
        ],
      },
    ],
  },
  {
    value: 'gd',
    label: '广东省',
    children: [
      {
        value: 'gz',
        label: '广州市',
        children: [
          { value: 'th', label: '天河区' },
          { value: 'yx', label: '越秀区' },
        ],
      },
    ],
  },
]

/** 部门数据（两层） */
const departments: SrCascaderOption[] = [
  {
    value: 'tech',
    label: '技术中心',
    children: [
      { value: 'fe', label: '前端组' },
      { value: 'be', label: '后端组' },
      { value: 'qa', label: '测试组' },
    ],
  },
  {
    value: 'design',
    label: '设计中心',
    children: [
      { value: 'ui', label: '视觉组' },
      { value: 'ux', label: '交互组' },
    ],
  },
  { value: 'admin', label: '行政部门' },
]

/** 单选值 */
const single = ref<SrCascaderValue[]>(['zj', 'hz', 'xh'])

/** 多选值 */
const multi = ref<SrCascaderValue[][]>([
  ['zj', 'hz', 'xh'],
  ['js', 'nj', 'gl'],
])

/** 可搜索值 */
const searchable = ref<SrCascaderValue[]>([])

/** 部门值 */
const dept = ref<SrCascaderValue[]>(['tech', 'fe'])

/** 悬停展开 */
const hoverValue = ref<SrCascaderValue[]>([])

/** 变更日志 */
const lastChange = ref('')

/** 多选标签文案 */
const multiText = computed(() => (multi.value.length ? `${multi.value.length} 个地区` : '未选择'))

/**
 * 记录变更
 * @param value 值
 * @param labels 标签
 */
function onChange(value: SrCascaderValue[], labels: string[]): void {
  lastChange.value = `${labels.join(' / ')}  →  [${value.join(', ')}]`
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础用法</h3>
      <div class="row">
        <div class="field" style="width: 260px">
          <SrCascader v-model="single" :options="regions" clearable />
        </div>
        <SrTag size="sm">值：{{ single.join(' / ') || '空' }}</SrTag>
      </div>
      <p class="hint">级联值是**从根到叶子的完整路径数组**，不是单个叶子值——这样才能还原显示层级</p>
    </section>

    <section>
      <h3>多选</h3>
      <div class="row">
        <div class="field" style="width: 380px">
          <SrCascader v-model="multi" :options="regions" multiple clearable />
        </div>
        <SrTag size="sm">{{ multiText }}</SrTag>
      </div>
      <p class="hint">多选时值是「路径数组的数组」，每个标签可以单独移除</p>
    </section>

    <section>
      <h3>可搜索</h3>
      <div class="field" style="width: 260px">
        <SrCascader v-model="searchable" :options="regions" filterable clearable placeholder="搜索区县" />
      </div>
      <p class="hint">搜索框在面板底部，输入后平铺展示命中的叶子并显示完整路径，选中即提交</p>
    </section>

    <section>
      <h3>只显示最后一级</h3>
      <div class="row">
        <div class="field" style="width: 200px">
          <span class="label">showAllLevels = true</span>
          <SrCascader :model-value="['zj', 'hz', 'xh']" :options="regions" />
        </div>
        <div class="field" style="width: 200px">
          <span class="label">showAllLevels = false</span>
          <SrCascader :model-value="['zj', 'hz', 'xh']" :options="regions" :show-all-levels="false" />
        </div>
      </div>
      <p class="hint">关掉后触发器只显示「西湖区」，更省空间但看不出属于哪个省</p>
    </section>

    <section>
      <h3>自定义分隔符</h3>
      <div class="row">
        <div class="field" style="width: 220px">
          <span class="label">默认 ' / '</span>
          <SrCascader :model-value="['tech', 'fe']" :options="departments" />
        </div>
        <div class="field" style="width: 220px">
          <span class="label">separator = ' · '</span>
          <SrCascader :model-value="['tech', 'fe']" :options="departments" separator=" · " />
        </div>
        <div class="field" style="width: 220px">
          <span class="label">separator = '>'</span>
          <SrCascader :model-value="['tech', 'fe']" :options="departments" separator=">" />
        </div>
      </div>
    </section>

    <section>
      <h3>悬停展开（expandTrigger）</h3>
      <div class="row">
        <div class="field" style="width: 240px">
          <span class="label">click（默认）</span>
          <SrCascader v-model="hoverValue" :options="regions" />
        </div>
        <div class="field" style="width: 240px">
          <span class="label">hover</span>
          <SrCascader v-model="hoverValue" :options="regions" expand-trigger="hover" />
        </div>
      </div>
      <p class="hint">层级浅、想快速扫过去时用 hover；层级深或要精确点选时用 click</p>
    </section>

    <section>
      <h3>禁用</h3>
      <div class="row">
        <div class="field" style="width: 220px">
          <span class="label">整体禁用</span>
          <SrCascader :model-value="['zj', 'hz']" :options="regions" disabled />
        </div>
        <div class="field" style="width: 220px">
          <span class="label">含禁用项（宁波 → 江东区）</span>
          <SrCascader v-model="dept" :options="regions" />
        </div>
      </div>
      <p class="hint">禁用的节点点击无反应，但仍能展开它下面的其它分支</p>
    </section>

    <section>
      <h3>尺寸与校验态</h3>
      <div class="row">
        <div v-for="s in ['sm', 'md', 'lg']" :key="s" class="field" style="width: 180px">
          <span class="label">{{ s }}</span>
          <SrCascader :model-value="['tech', 'fe']" :options="departments" :size="s as 'sm'" />
        </div>
        <div class="field" style="width: 180px">
          <span class="label">error</span>
          <SrCascader :model-value="[]" :options="departments" status="error" />
        </div>
      </div>
    </section>

    <section>
      <h3>事件</h3>
      <div class="field" style="width: 280px">
        <SrCascader v-model="searchable" :options="regions" @change="onChange" />
      </div>
      <p class="hint">
        <code>change</code> 带 <code>(value, labels)</code>，label 已拼好可以直接展示
        <span v-if="lastChange">；最近一次：{{ lastChange }}</span>
      </p>
    </section>

    <section>
      <h3>空数据</h3>
      <div class="row">
        <div class="field" style="width: 200px">
          <SrCascader :model-value="[]" :options="[]" empty-text="还没有配置地区" />
        </div>
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

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--sr-color-bg-sunken);
  font-family: var(--sr-font-family-mono);
  font-size: 11.5px;
}

.row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 200px;
}

.label {
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}
</style>
