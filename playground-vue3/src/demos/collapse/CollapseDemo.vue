<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrCollapse, SrTag, type SrCollapseItem, type SrCollapseKey } from '@sunset-reverie/ui'

defineOptions({ name: 'CollapseDemo' })

/** 基础面板 */
const basicItems: SrCollapseItem[] = [
  {
    key: '1',
    title: '什么是设计 Token',
    content: 'Token 是设计决策的最小单位，把颜色、间距、字号这些值命名后统一管理。',
  },
  {
    key: '2',
    title: '为什么要分三层',
    content: '原始值、语义、组件三层各管一段：改一处原始色，所有语义和组件跟着变。',
  },
  {
    key: '3',
    title: 'glass 和 flat 的区别',
    content: 'glass 用半透明背景加模糊，flat 用实色。两者共用同一套语义变量。',
  },
]

/** 基础展开态 */
const basicOpen = ref<SrCollapseKey[]>(['1'])

/** 手风琴展开态 */
const accordionOpen = ref<SrCollapseKey[]>(['a'])

/** 手风琴面板 */
const accordionItems: SrCollapseItem[] = [
  { key: 'a', title: '第一步：创建项目', content: '用 pnpm create vite 建一个 Vue 3 项目，然后安装组件库。' },
  { key: 'b', title: '第二步：引入样式', content: '在 main.ts 里 import "@sunset-reverie/ui/style.css"。' },
  { key: 'c', title: '第三步：开始使用', content: '组件已全局可用，也可以按需引入。' },
]

/** 带附加信息的面板 */
const extraItems: SrCollapseItem[] = [
  { key: 'todo', title: '待办', extra: '3', content: '补文档、写测试、改样式' },
  { key: 'done', title: '已完成', extra: '12', content: '定 API、搭骨架、接接口' },
  { key: 'archived', title: '已归档（不可展开）', extra: '48', content: '这里的内容看不到', disabled: true },
]

/** 扩展信息 */
const moreInfo = ref<SrCollapseKey[]>([])

/** 当前展开项 */
const currentOpen = ref<SrCollapseKey[]>(['1'])
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础用法</h3>
      <SrCollapse v-model="basicOpen" :items="basicItems" />
      <div class="row" style="margin-top: 12px">
        <SrButton size="xs" variant="outline" @click="basicOpen = []">全部收起</SrButton>
        <SrButton size="xs" variant="outline" @click="basicOpen = ['1', '2', '3']">全部展开</SrButton>
      </div>
      <p class="hint">默认可以同时展开多个；点击标题、箭头或右侧区域都能切换</p>
    </section>

    <section>
      <h3>手风琴（accordion）</h3>
      <SrCollapse v-model="accordionOpen" :items="accordionItems" accordion />
      <p class="hint">
        同一时刻只开一个，展开新的会自动收起之前的—— 适合「步骤说明」「FAQ」这类一次只看一条的内容
      </p>
    </section>

    <section>
      <h3>附加信息与禁用</h3>
      <SrCollapse :items="extraItems" :model-value="['todo']" />
      <p class="hint">extra 放条数、状态之类；disabled 的面板点击无反应且文字变灰</p>
    </section>

    <section>
      <h3>无边框（ghost）</h3>
      <div class="card">
        <SrCollapse :items="basicItems" :model-value="['1']" ghost />
      </div>
      <p class="hint">嵌在卡片里时去掉外框和背景，避免「框中框」</p>
    </section>

    <section>
      <h3>自定义内容（插槽）</h3>
      <SrCollapse v-model="moreInfo" :items="[{ key: 'x', title: '更多信息' }]">
        <template #item>
          <ul class="list">
            <li>支持放列表、表格、表单</li>
            <li>内容高度不限，展开动画按实际高度过渡</li>
            <li>也可以嵌另一个 <code>SrCollapse</code> 做二级折叠</li>
          </ul>
        </template>
      </SrCollapse>
      <p class="hint">默认插槽替换 content，能塞任意结构</p>
    </section>

    <section>
      <h3>自定义标题（插槽）</h3>
      <SrCollapse
        v-model="currentOpen"
        :items="[
          { key: '1', title: '设计系统', content: 'Token、主题、响应式三块内容。' },
          { key: '2', title: '组件库', content: '44 个组件，覆盖后台常见场景。' },
        ]"
      >
        <template #title="{ item }">
          <span style="display: inline-flex; align-items: center; gap: 8px">
            {{ item.title }}
            <SrTag type="info" size="sm">{{ item.key === '1' ? '文档' : '代码' }}</SrTag>
          </span>
        </template>
      </SrCollapse>
    </section>

    <section>
      <h3>受控展开状态</h3>
      <SrCollapse v-model="currentOpen" :items="basicItems" />
      <p class="hint">当前展开：{{ currentOpen.length ? currentOpen.join(', ') : '无' }}</p>
    </section>

    <section>
      <h3>组合：常见设置分组</h3>
      <div class="card">
        <SrCollapse :items="basicItems" ghost accordion :model-value="['1']" />
        <div class="divider" />
        <SrButton size="sm" variant="primary">保存设置</SrButton>
      </div>
      <p class="hint">设置页里把相关项收进折叠组，能显著缩短页面长度</p>
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
  gap: 8px;
}

.card {
  padding: 14px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.9;
}

.divider {
  height: 1px;
  margin: 14px 0;
  background: var(--sr-color-border-subtle);
}
</style>
