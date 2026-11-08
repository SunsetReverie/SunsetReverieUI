<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import { SrButton, SrTag, SrTree, type SrTreeKey, type SrTreeNode } from '@sunset-reverie/ui'
import DragBoard from './DragBoard.vue'

defineOptions({ name: 'TreeDemo' })

/** 目录树 */
const catalog: SrTreeNode[] = [
  {
    key: 'design',
    label: '设计系统',
    icon: 'lucide:box',
    children: [
      { key: 'token', label: 'Token', icon: 'lucide:settings' },
      {
        key: 'component',
        label: '组件',
        icon: 'lucide:box',
        children: [
          { key: 'button', label: 'SrButton' },
          { key: 'input', label: 'SrInput' },
          { key: 'table', label: 'SrTable' },
        ],
      },
    ],
  },
  {
    key: 'project',
    label: '工程',
    icon: 'lucide:settings',
    children: [
      { key: 'build', label: '构建' },
      { key: 'test', label: '测试' },
      { key: 'docs', label: '文档（禁用）', disabled: true },
    ],
  },
  { key: 'about', label: '关于' },
]

/** 选中项 */
const selected = ref<SrTreeKey[]>([])

/** 勾选项 */
const checked = ref<SrTreeKey[]>([])

/** 不联动的勾选 */
const strictChecked = ref<SrTreeKey[]>([])

/** 单选 */
const single = ref<SrTreeKey[]>([])

/** 半选 key（从 check 事件拿到） */
const halfKeys = ref<SrTreeKey[]>([])

/** 大树的节点数 */
const TOTAL = 800

/** 虚拟滚动用的大数据 */
const bigTree = computed<SrTreeNode[]>(() =>
  Array.from({ length: 40 }, (_, groupIndex) => ({
    key: `g${groupIndex}`,
    label: `分组 ${groupIndex + 1}`,
    children: Array.from({ length: TOTAL / 40 }, (_, itemIndex) => ({
      key: `g${groupIndex}-${itemIndex}`,
      label: `条目 ${groupIndex * 20 + itemIndex + 1}`,
    })),
  })),
)

/** 拖拽后的树 */
const dragTree = ref<SrTreeNode[]>(JSON.parse(JSON.stringify(catalog))) as Ref<SrTreeNode[]>

/** 最近一次拖放信息 */
const lastDrop = ref('')

/**
 * 拖放回调
 * @param detail 拖放详情
 * @param data 新树
 */
function onDrop(
  detail: { dragNode: SrTreeNode; dropNode: SrTreeNode; type: string },
  data: SrTreeNode[],
): void {
  dragTree.value = data
  const pos = detail.type === 'before' ? '之前' : detail.type === 'after' ? '之后' : '内部'
  lastDrop.value = `${detail.dragNode.label} → ${detail.dropNode.label} ${pos}`
}

/** 异步树：初始只有一层 */
const asyncTree = ref<SrTreeNode[]>([
  { key: 'docs', label: '文档' },
  { key: 'code', label: '代码' },
  { key: 'assets', label: '资源' },
])

/** 模拟请求：600ms 后返回子节点 */
async function loadChildren(node: SrTreeNode): Promise<SrTreeNode[]> {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return Array.from({ length: 4 }, (_, index) => ({
    key: `${node.key}-${index}`,
    label: `${node.label} / 子项 ${index + 1}`,
  }))
}

/** 大树的展开状态 */
const bigExpanded = ref<SrTreeKey[]>(['g0', 'g1'])

/**
 * 勾选回调：记录半选
 * @param keys 勾选结果
 * @param detail 详情
 */
function onCheck(keys: SrTreeKey[], detail: { halfCheckedKeys: SrTreeKey[] }): void {
  halfKeys.value = detail.halfCheckedKeys
}

/** 全选 / 清空 */
function checkAll(): void {
  checked.value = [
    'design',
    'token',
    'component',
    'button',
    'input',
    'table',
    'project',
    'build',
    'test',
    'about',
  ]
}

function clearAll(): void {
  checked.value = []
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础（点击箭头展开，点击文字选中）</h3>
      <div class="grid">
        <div class="card">
          <SrTree v-model="selected" :data="catalog" default-expand-all />
        </div>
        <div class="side">
          <p class="hint" style="margin: 0">当前选中</p>
          <SrTag v-if="!selected.length" size="sm">无</SrTag>
          <SrTag v-for="key in selected" :key="key" size="sm" type="primary">{{ key }}</SrTag>
        </div>
      </div>
    </section>

    <section>
      <h3>复选框（父子联动 + 半选）</h3>
      <div class="grid">
        <div class="card">
          <SrTree v-model="checked" :data="catalog" checkable default-expand-all @check="onCheck" />
        </div>
        <div class="side">
          <p class="hint" style="margin: 0">已勾选 {{ checked.length }} 个</p>
          <p class="hint" style="margin: 0">半选 {{ halfKeys.length }} 个</p>
          <div class="row">
            <SrButton size="xs" variant="outline" @click="checkAll">全选</SrButton>
            <SrButton size="xs" variant="text" @click="clearAll">清空</SrButton>
          </div>
          <p class="hint">勾父节点会带上所有子孙；子节点全选时父节点自动选中，部分选中则显示为半选</p>
        </div>
      </div>
    </section>

    <section>
      <h3>父子不联动（checkStrictly）</h3>
      <div class="grid">
        <div class="card">
          <SrTree v-model="strictChecked" :data="catalog" checkable check-strictly default-expand-all />
        </div>
        <div class="side">
          <p class="hint" style="margin: 0">已勾选 {{ strictChecked.length }} 个</p>
          <p class="hint">每个节点独立，勾父不影响子</p>
        </div>
      </div>
    </section>

    <section>
      <h3>单选（multiple = false）</h3>
      <div class="card">
        <SrTree v-model="single" :data="catalog" :multiple="false" default-expand-all />
      </div>
      <p class="hint">选中项：{{ single[0] ?? '无' }}</p>
    </section>

    <section>
      <h3>连接线（showLine）</h3>
      <div class="card">
        <SrTree :data="catalog" show-line default-expand-all checkable />
      </div>
    </section>

    <section>
      <h3>虚拟滚动（800 个节点）</h3>
      <div class="grid">
        <div class="card">
          <SrTree v-model:expanded-keys="bigExpanded" :data="bigTree" virtual :height="280" checkable />
        </div>
        <div class="side">
          <p class="hint" style="margin: 0">总共 {{ TOTAL }} 个节点</p>
          <p class="hint">
            只渲染可视区附近的十几行，滚动时才替换内容。不开虚拟滚动的话， 展开全部会有 800 个 DOM
            节点同时存在。
          </p>
        </div>
      </div>
    </section>

    <section>
      <h3>键盘操作</h3>
      <div class="grid">
        <div class="card">
          <SrTree :data="catalog" default-expand-all checkable />
        </div>
        <div class="side">
          <p class="hint" style="margin: 0">点一下任意行（或用 Tab 进入），然后：</p>
          <ul class="keys">
            <li><kbd>↑</kbd> <kbd>↓</kbd> 上下移动</li>
            <li><kbd>→</kbd> 展开 / 进子节点</li>
            <li><kbd>←</kbd> 收起 / 回父节点</li>
            <li><kbd>空格</kbd> 勾选</li>
            <li><kbd>Enter</kbd> 选中</li>
            <li><kbd>Home</kbd> <kbd>End</kbd> 跳到首尾</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h3>异步加载（loadData）</h3>
      <div class="grid">
        <div class="card">
          <SrTree :data="asyncTree" :load-data="loadChildren" @update:expanded-keys="() => {}" />
        </div>
        <div class="side">
          <p class="hint" style="margin: 0">初始只有 3 个节点，展开时才请求子节点</p>
          <p class="hint">加载期间箭头位置显示转圈，加载完自动铺开；已加载过的节点再次展开不会重复请求</p>
        </div>
      </div>
    </section>

    <section>
      <h3>拖拽排序（draggable）</h3>
      <div class="grid">
        <div class="card">
          <SrTree :data="dragTree" draggable default-expand-all @node-drop="onDrop" />
        </div>
        <div class="side">
          <p class="hint" style="margin: 0">拖动任意节点试试</p>
          <p class="hint">
            拖到行的<strong>上 1/4</strong>放到之前、<strong>下 1/4</strong
            >放到之后、<strong>中间</strong>会成为子节点
          </p>
          <p v-if="lastDrop" class="hint">最近一次：{{ lastDrop }}</p>
          <p class="hint">拖父节点进自己的子树会被拒绝（会成环）</p>
        </div>
      </div>
    </section>

    <section>
      <h3>跨列表拖拽（同一套逻辑复用到看板）</h3>
      <DragBoard />
      <p class="hint">
        两列共用 <code>createSrDragContext()</code> 创建的上下文，卡片可以在列之间拖动。
        这套逻辑和树的拖拽是同一个 <code>useSrDragSort</code>：它只认「key + 元素」，不关心数据结构。
      </p>
    </section>

    <section>
      <h3>空数据与禁用</h3>
      <div class="grid">
        <div class="card">
          <SrTree :data="[]" empty-text="这个目录是空的" />
        </div>
        <div class="card">
          <SrTree :data="catalog" disabled default-expand-all />
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
  margin: 0 0 10px;
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
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}
.row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.card {
  padding: 10px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.side {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.keys {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.keys kbd {
  display: inline-block;
  min-width: 18px;
  padding: 1px 5px;
  border: 1px solid var(--sr-color-border);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-secondary);
  font-family: var(--sr-font-family-mono);
  font-size: 11px;
  text-align: center;
}
</style>
