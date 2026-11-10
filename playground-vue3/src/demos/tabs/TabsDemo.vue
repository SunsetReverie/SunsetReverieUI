<script setup lang="ts">
import { ref } from 'vue'
import { SrTabs, type SrTabsItem } from '@sunset-reverie/ui'

defineOptions({ name: 'TabsDemo' })

/** 基础项（含禁用） */
const baseItems: SrTabsItem[] = [
  { key: 'a', label: '概览' },
  { key: 'b', label: '配置' },
  { key: 'c', label: '禁用', disabled: true },
]

/** 带图标 */
const iconItems: SrTabsItem[] = [
  { key: 'a', label: '首页', icon: 'lucide:house' },
  { key: 'b', label: '文件', icon: 'lucide:inbox' },
  { key: 'c', label: '设置', icon: 'lucide:settings' },
]

const line = ref('a')
const card = ref('a')
const segment = ref('a')
const pill = ref('a')
const plain = ref('a')
const vertical = ref('a')
const lazy = ref('a')
const closable = ref('a')
const sizes = ref('a')
const iconTab = ref('a')

/** 可关闭列表 */
const closing = ref<SrTabsItem[]>([
  { key: 'a', label: '标签一' },
  { key: 'b', label: '标签二' },
  { key: 'c', label: '标签三' },
])

function removeTab(key: string): void {
  closing.value = closing.value.filter((item) => item.key !== key)
}

/** 前台列表排序：一档排序一组内容 */
const sortItems: SrTabsItem[] = [
  { key: 'latest', label: '最新' },
  { key: 'hot', label: '最热' },
  { key: 'pick', label: '推荐' },
]

/** 当前排序档位 */
const sort = ref('latest')

/** 各档位下的文章列表 */
const postRanks: Record<string, { title: string; meta: string }[]> = {
  latest: [
    { title: 'Vue 3.5 的响应式又快了三成', meta: '3 小时前' },
    { title: 'Nuxt 4 目录结构迁移笔记', meta: '昨天' },
    { title: '用 CSS 变量做主题切换的三种姿势', meta: '2 天前' },
  ],
  hot: [
    { title: '一张图看懂 SSR 与 CSR 的取舍', meta: '阅读 1.2w' },
    { title: '手写一个虚拟滚动列表', meta: '阅读 8k' },
    { title: 'TypeScript 泛型约束的实战清单', meta: '阅读 6k' },
  ],
  pick: [
    { title: '组件库的视觉一致性怎么守', meta: '编辑推荐' },
    { title: '从零搭建一套设计令牌', meta: '编辑推荐' },
    { title: '前端监控的三根支柱', meta: '编辑推荐' },
  ],
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>四种外观</h3>
      <div class="stack">
        <div>
          <span class="tag">line（默认）</span>
          <SrTabs v-model="line" :items="baseItems">
            <template #panel-a>概览面板</template>
            <template #panel-b>配置面板</template>
          </SrTabs>
        </div>

        <div>
          <span class="tag">card（连接式）</span>
          <SrTabs v-model="card" :items="baseItems" type="card">
            <template #panel-a>概览面板</template>
            <template #panel-b>配置面板</template>
          </SrTabs>
        </div>

        <div>
          <span class="tag">segment（分段控件）</span>
          <SrTabs v-model="segment" :items="iconItems" type="segment" />
        </div>

        <div>
          <span class="tag">pill（实色圆角）</span>
          <SrTabs v-model="pill" :items="baseItems" type="pill" />
        </div>
      </div>
    </section>

    <section>
      <h3>前台列表排序（pill 圆角标签）</h3>
      <SrTabs v-model="sort" :items="sortItems" type="pill" size="sm">
        <template #panel="{ item }">
          <ul class="ranks">
            <li v-for="(post, index) in postRanks[item.key]" :key="post.title">
              <span class="ranks__no" :class="{ 'is-top': index === 0 }">{{ index + 1 }}</span>
              <span class="ranks__title">{{ post.title }}</span>
              <span class="ranks__meta">{{ post.meta }}</span>
            </li>
          </ul>
        </template>
      </SrTabs>
      <p class="hint">最新 / 最热 / 推荐三档排序：标签是圆角矩形而不是全圆胶囊，一排文字更像栏目导航</p>
    </section>

    <section>
      <h3>无背板（bordered = false）</h3>
      <SrTabs v-model="plain" :items="baseItems" type="pill" :bordered="false" />
    </section>

    <section>
      <h3>垂直方向</h3>
      <SrTabs v-model="vertical" :items="baseItems" direction="vertical" style="min-height: 140px">
        <template #panel-a>左栏点击切换</template>
        <template #panel-b>这是配置面板</template>
      </SrTabs>
    </section>

    <section>
      <h3>懒加载（lazy，未激活过的面板不渲染）</h3>
      <SrTabs v-model="lazy" :items="baseItems" lazy>
        <template #panel-a>这一块在第一次点开「概览」时才挂载</template>
        <template #panel-b>配置面板</template>
      </SrTabs>
    </section>

    <section>
      <h3>可关闭</h3>
      <SrTabs v-model="closable" :items="closing" type="card" closable @close="removeTab">
        <template #panel-a>标签一的内容</template>
        <template #panel-b>标签二的内容</template>
        <template #panel-c>标签三的内容</template>
      </SrTabs>
      <p class="hint">点标签上的 × 会真的移除，移除逻辑由调用方维护</p>
    </section>

    <section>
      <h3>通用面板插槽（#panel，所有标签共用）</h3>
      <SrTabs v-model="iconTab" :items="iconItems" type="segment">
        <template #panel="{ item }">
          <p style="margin: 0; font-size: 13px">当前标签：{{ item.label }}（key = {{ item.key }}）</p>
        </template>
      </SrTabs>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="stack">
        <SrTabs
          v-for="s in ['xs', 'sm', 'md', 'lg']"
          :key="s"
          v-model="sizes"
          :items="baseItems"
          :size="s as 'md'"
        />
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
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tag {
  display: block;
  margin-bottom: 6px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}
.ranks {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 2px;
    border-bottom: 1px dashed var(--sr-color-border-subtle);
  }
  li:last-child {
    border-bottom: 0;
  }
}
.ranks__no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: var(--sr-color-primary-alpha-08);
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.ranks__no.is-top {
  background: var(--sr-color-primary);
  color: #fff;
}
.ranks__title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ranks__meta {
  flex: 0 0 auto;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
