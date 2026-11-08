<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

/**
 * 组件水合冒烟页
 *
 * 目的不是演示用法，而是把每个组件都真实走一遍 SSR → 水合，
 * 由 sr-hydration-watch 插件收集控制台告警，页面直接把条数暴露给 e2e 断言。
 */

/** 水合告警（由 plugins/sr-hydration-watch.client.ts 收集） */
const hydrationWarnings = useState<string[]>('sr-hydration-warnings', () => [])

/** 是否已完成客户端水合 */
const hydrated = ref(false)

onMounted(() => {
  hydrated.value = true
})

// ---------- 各组件所需的最小状态 ----------
const inputValue = ref('文本')
const numberValue = ref(3)
const selectValue = ref('a')
const multiValue = ref(['a'])
const checked = ref(true)
const checkGroup = ref(['a'])
const radioValue = ref('a')
const radioGroupValue = ref('a')
const switchValue = ref(true)
const tabValue = ref('a')
const page = ref(1)
const panelOpen = ref(true)
const tagClosed = ref(false)

/** 表格列 */
const columns = [
  { key: 'name', title: '名称', width: 120, fixed: 'left' as const },
  { key: 'id', title: 'ID', width: 80 },
]

/** 表格数据 */
const data = [
  { id: 1, name: '组件 A' },
  { id: 2, name: '组件 B' },
]

/** 下拉选项 */
const options = [
  { value: 'a', label: '选项 A' },
  { value: 'b', label: '选项 B' },
]

/** 选项卡 */
const tabItems = [
  { key: 'a', label: '概览' },
  { key: 'b', label: '配置', disabled: true },
]

/** 面包屑 */
const crumbs = [{ label: '首页', href: '#', icon: 'lucide:house' }, { label: '组件' }, { label: '冒烟' }]

/** 时间轴数据 */
const timelineItems = [
  { content: '提交申请', timestamp: '10:24', type: 'primary' },
  { content: '审核通过', timestamp: '14:02', type: 'success' },
]

/** 分段控制器选项 */
const segOptions = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
]

/** 穿梭框数据 */
const transferData = [
  { value: 'a', label: '选项 A' },
  { value: 'b', label: '选项 B' },
]

/** 级联数据 */
const cascaderOptions = [
  {
    value: 'zj',
    label: '浙江',
    children: [
      { value: 'hz', label: '杭州' },
      { value: 'nb', label: '宁波' },
    ],
  },
  { value: 'js', label: '江苏' },
]

/** 虚拟列表数据 */
const vlistItems = Array.from({ length: 200 }, (_, i) => i)

/** 折叠面板数据 */
const collapseItems = [
  { key: 'a', title: '基础设置', content: '内容 A' },
  { key: 'b', title: '高级设置', content: '内容 B' },
]

/** 描述列表数据 */
const descItems = [
  { label: '姓名', value: '林深' },
  { label: '公司', value: '夕梦科技' },
]

/** 步骤条数据 */
const stepItems = [
  { title: '填写', description: '基础资料' },
  { title: '上传', description: '材料' },
  { title: '完成' },
]

/** 树数据 */
const treeData = [
  { key: 'a', label: '设计', children: [{ key: 'a1', label: 'Token' }] },
  { key: 'b', label: '工程' },
]

/** 日期选择器的初始值 */
const pickDate = new Date(2026, 10, 8)

/** 轮播数据 */
const slides = [{ t: '一' }, { t: '二' }, { t: '三' }]

/** 导航项 */
const navItems = [
  { key: 'home', label: '首页', icon: 'lucide:house' },
  { key: 'list', label: '列表', badge: 3 },
  { key: 'done', label: '已完成', disabled: true },
]

/** 下拉菜单 */
const menuItems = [
  { key: 'x', label: '编辑', icon: 'lucide:pencil' },
  { key: 'y', label: '删除', icon: 'lucide:trash', danger: true, divided: true },
]

/** 告警条数，供 e2e 读取 */
const warningCount = computed(() => hydrationWarnings.length)
</script>

<template>
  <div class="smoke">
    <header class="smoke__head">
      <h1>组件水合冒烟</h1>

      <p
        class="smoke__status"
        data-hydration-count
        :data-count="warningCount"
        :data-hydrated="hydrated ? '1' : '0'"
      >
        水合告警：<strong>{{ warningCount }}</strong> 条 ·
        {{ hydrated ? '已水合' : '仅 SSR' }}
      </p>

      <ul v-if="warningCount" class="smoke__warnings">
        <li v-for="(item, index) in hydrationWarnings" :key="index">{{ item }}</li>
      </ul>
    </header>

    <section class="smoke__grid">
      <div class="cell">
        <span class="cell__label">Button</span>
        <div class="cell__body">
          <sr-button variant="primary" size="sm">主要</sr-button>
          <sr-button variant="outline" size="sm">次要</sr-button>
          <sr-icon name="lucide:check" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Row / Col / Spinner</span>
        <div class="cell__body cell__body--column">
          <sr-row :gutter="[8, 8]">
            <sr-col :span="12"><div class="chip">A</div></sr-col>
            <sr-col :span="12"><div class="chip">B</div></sr-col>
          </sr-row>
          <sr-spinner size="md" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Tag / Badge</span>
        <div class="cell__body">
          <sr-tag v-if="!tagClosed" type="success" closable @close="tagClosed = true">稳定</sr-tag>
          <sr-tag type="warning" variant="dark" round>预览</sr-tag>
          <sr-badge :value="120"><span class="chip">消息</span></sr-badge>
          <sr-badge status="processing" text="部署中" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Avatar</span>
        <div class="cell__body">
          <sr-avatar alt="林深" />
          <sr-avatar alt="周夏" size="lg" />
          <sr-avatar alt="陈默" color="#8b5cf6" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Card / Panel</span>
        <div class="cell__body cell__body--column">
          <sr-card title="卡片标题" subtitle="副标题" hoverable>
            <p>卡片内容</p>
            <template #extra><sr-tag type="info">extra</sr-tag></template>
            <template #footer><sr-button size="sm" variant="text">更多</sr-button></template>
          </sr-card>

          <sr-panel v-model="panelOpen" title="分区面板" collapsible>
            <p>面板内容</p>
          </sr-panel>
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Empty / Breadcrumb</span>
        <div class="cell__body cell__body--column">
          <sr-empty bordered description="暂无数据" size="sm" />
          <sr-breadcrumb :items="crumbs" separator-icon="lucide:chevron-right" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Tabs（四种外观）</span>
        <div class="cell__body cell__body--column">
          <sr-tabs v-model="tabValue" :items="tabItems">
            <template #panel="{ item }">{{ item.label }} 的内容</template>
          </sr-tabs>
          <sr-tabs :items="tabItems" type="pill" :model-value="'a'" size="sm" />
          <sr-tabs :items="tabItems" type="segment" :model-value="'a'" size="sm" />
          <sr-tabs :items="tabItems" type="card" :model-value="'a'" size="sm" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Pagination / LoadMore</span>
        <div class="cell__body cell__body--column">
          <sr-pagination v-model="page" :total="120" size="sm" />
          <sr-load-more status="loading" size="sm" />
          <sr-load-more status="done" size="sm" />
        </div>
      </div>

      <div class="cell cell--wide">
        <span class="cell__label">Table（含固定列与分页）</span>
        <div class="cell__body cell__body--column">
          <sr-table :columns="columns" :data="data" :pagination="{ pageSize: 5 }" bordered />
          <sr-table :columns="columns" :data="[]" empty-text="空空如也" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Input / InputNumber</span>
        <div class="cell__body cell__body--column">
          <sr-input v-model="inputValue" placeholder="请输入" />
          <sr-input-number v-model="numberValue" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Select</span>
        <div class="cell__body cell__body--column">
          <sr-select v-model="selectValue" :options="options" />
          <sr-select v-model="multiValue" :options="options" multiple />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Checkbox / Radio / Switch</span>
        <div class="cell__body cell__body--column">
          <sr-checkbox v-model="checked">同意</sr-checkbox>
          <sr-checkbox-group v-model="checkGroup">
            <sr-checkbox value="a">A</sr-checkbox>
          </sr-checkbox-group>
          <sr-radio v-model="radioValue" value="a">单选</sr-radio>
          <sr-radio-group v-model="radioGroupValue">
            <sr-radio value="a">A</sr-radio>
          </sr-radio-group>
          <sr-switch v-model="switchValue" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Form</span>
        <div class="cell__body cell__body--column">
          <sr-form :model="{ name: 'x' }">
            <sr-form-item label="名称">
              <sr-input :model-value="'x'" />
            </sr-form-item>
          </sr-form>
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Tree</span>
        <div class="cell__body cell__body--column">
          <sr-tree :data="treeData" checkable default-expand-all />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">DatePicker</span>
        <div class="cell__body cell__body--column">
          <sr-date-picker :model-value="pickDate" />
          <sr-date-picker type="daterange" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Transfer</span>
        <div class="cell__body cell__body--column">
          <sr-transfer :data="transferData" :model-value="['a']" :height="120" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Cascader</span>
        <div class="cell__body cell__body--column">
          <sr-cascader :options="cascaderOptions" :model-value="['zj', 'hz']" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">VirtualList</span>
        <div class="cell__body cell__body--column">
          <sr-virtual-list :items="vlistItems" :item-height="28" :height="120">
            <template #default="{ item }">
              <div style="font-size: 12px">第 {{ item }} 条</div>
            </template>
          </sr-virtual-list>
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Result</span>
        <div class="cell__body cell__body--column">
          <sr-result status="success" title="提交成功" sub-title="服务端渲染的结果页" compact />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Slider</span>
        <div class="cell__body cell__body--column">
          <sr-slider :model-value="42" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Timeline</span>
        <div class="cell__body cell__body--column">
          <sr-timeline :items="timelineItems" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Segmented</span>
        <div class="cell__body cell__body--column">
          <sr-segmented :options="segOptions" model-value="day" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Collapse</span>
        <div class="cell__body cell__body--column">
          <sr-collapse :items="collapseItems" :model-value="['a']" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Descriptions</span>
        <div class="cell__body cell__body--column">
          <sr-descriptions :items="descItems" :column="2" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Steps</span>
        <div class="cell__body cell__body--column">
          <sr-steps :items="stepItems" :current="1" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Alert</span>
        <div class="cell__body cell__body--column">
          <sr-alert type="info" title="提示" description="服务端渲染的警告条" />
          <sr-alert type="error" title="出错了" closable />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Skeleton</span>
        <div class="cell__body cell__body--column">
          <sr-skeleton :rows="3" avatar />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Progress</span>
        <div class="cell__body cell__body--column">
          <sr-progress :percent="62" />
          <sr-progress :percent="100" status="success" :show-text="false" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Upload</span>
        <div class="cell__body cell__body--column">
          <sr-upload :show-file-list="false" tip="支持拖拽" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Carousel</span>
        <div class="cell__body cell__body--column">
          <sr-carousel :items="slides" :model-value="1" :height="120" :arrows="false">
            <template #item="{ item }">
              <div class="chip">{{ item.t }}</div>
            </template>
          </sr-carousel>
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Nav</span>
        <div class="cell__body cell__body--column">
          <sr-nav :items="navItems" :model-value="'home'" size="sm" />
          <sr-nav :items="navItems" :model-value="'list'" mode="vertical" size="sm" />
        </div>
      </div>

      <div class="cell">
        <span class="cell__label">Tooltip / Dropdown</span>
        <div class="cell__body">
          <sr-tooltip content="提示文案">
            <sr-button size="sm" variant="outline">悬停</sr-button>
          </sr-tooltip>

          <sr-dropdown :items="menuItems">
            <sr-button size="sm" variant="outline">菜单</sr-button>
          </sr-dropdown>
        </div>
      </div>
    </section>

    <!-- 浮层默认关闭：服务端不渲染，水合后也不该有结构差异 -->
    <sr-modal :model-value="false" title="弹窗">弹窗内容</sr-modal>
    <sr-drawer :model-value="false" title="抽屉">抽屉内容</sr-drawer>
    <sr-drawer :model-value="false" title="圆角抽屉" inset>抽屉内容</sr-drawer>
  </div>
</template>

<style scoped>
.smoke {
  padding: 24px;
  font-family: var(--sr-font-family);
}

.smoke__head {
  margin-bottom: 20px;
}

.smoke__head h1 {
  margin: 0 0 8px;
  font-size: 20px;
}

.smoke__status {
  margin: 0;
  font-size: 14px;
  color: var(--sr-color-text-secondary);
}

.smoke__warnings {
  margin: 8px 0 0;
  padding-left: 18px;
  color: var(--sr-color-danger-text);
  font-size: 12px;
}

.smoke__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.cell {
  padding: 14px 16px;
  border: 1px solid var(--sr-color-border);
  border-radius: var(--sr-radius-base);
  background: var(--sr-color-bg-container);
}

.cell--wide {
  grid-column: 1 / -1;
}

.cell__label {
  display: block;
  margin-bottom: 10px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.cell__body {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.cell__body--column {
  flex-direction: column;
  align-items: stretch;
}

.cell__body p {
  margin: 0;
  font-size: 13px;
}

.chip {
  padding: 2px 10px;
  border: 1px solid var(--sr-color-border);
  border-radius: var(--sr-radius-sm);
  font-size: 13px;
}
</style>
