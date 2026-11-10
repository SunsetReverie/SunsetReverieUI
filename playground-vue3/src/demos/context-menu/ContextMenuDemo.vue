<script setup lang="ts">
import { ref } from 'vue'
import { SrContextMenu, SrTag, type SrContextMenuItem } from '@sunset-reverie/ui'

defineOptions({ name: 'ContextMenuDemo' })

/** 基础菜单项 */
const basicItems: SrContextMenuItem[] = [
  { key: 'copy', label: '复制', icon: 'lucide:copy' },
  { key: 'paste', label: '粘贴', icon: 'lucide:clipboard' },
  { key: 'cut', label: '剪切', icon: 'lucide:scissors', divider: true },
]

/** 带禁用的菜单 */
const mixedItems: SrContextMenuItem[] = [
  { key: 'open', label: '打开', icon: 'lucide:external-link' },
  { key: 'rename', label: '重命名', icon: 'lucide:pencil' },
  { key: 'share', label: '分享', icon: 'lucide:share', disabled: true },
  { key: 'remove', label: '删除', icon: 'lucide:trash', danger: true, divider: true },
]

/** 表格行的菜单 */
const rowItems: SrContextMenuItem[] = [
  { key: 'view', label: '查看详情', icon: 'lucide:eye' },
  { key: 'edit', label: '编辑', icon: 'lucide:pencil' },
  { key: 'duplicate', label: '复制一份', icon: 'lucide:copy' },
  { key: 'remove', label: '删除', icon: 'lucide:trash', danger: true, divider: true },
]

/** 最近一次操作 */
const lastAction = ref('')

/** 表格数据 */
const rows = [
  { id: 1, name: 'SrTable', owner: '林深' },
  { id: 2, name: 'SrTree', owner: '周夏' },
  { id: 3, name: 'SrSelect', owner: '陈默' },
]

/** 当前右键的行 */
const currentRow = ref('')

/** 表格行共用的菜单实例 */
const rowMenu = ref<{ open: (event: MouseEvent) => void } | null>(null)

/**
 * 选中菜单项
 * @param key 菜单项 key
 * @param item 菜单项
 */
function onSelect(_key: string, item: SrContextMenuItem): void {
  lastAction.value = `${item.label}${currentRow.value ? ` · ${currentRow.value}` : ''}`
}

/**
 * 右键某一行：记住是哪一行，再手动打开菜单
 * @param name 行名称
 * @param event 鼠标事件
 */
function onRowMenu(name: string, event: MouseEvent): void {
  event.preventDefault()
  currentRow.value = name
  rowMenu.value?.open(event)
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <SrContextMenu :items="basicItems" @select="onSelect">
        <div class="zone">在这块区域内点右键</div>
      </SrContextMenu>
      <p class="hint">
        组件包裹的区域会自动接管右键并阻止浏览器默认菜单。最近操作：
        <code>{{ lastAction || '—' }}</code>
      </p>
    </section>

    <section>
      <h3>禁用项与危险操作</h3>
      <SrContextMenu :items="mixedItems" @select="onSelect">
        <div class="zone">右键看看禁用项</div>
      </SrContextMenu>
      <p class="hint">
        <code>disabled</code> 的项变灰且点了没反应；<code>danger</code> 的项文字标红， 用于删除这类不可逆操作
      </p>
    </section>

    <section>
      <h3>实际场景：表格行操作</h3>
      <SrContextMenu ref="rowMenu" :items="rowItems" @select="onSelect">
        <div class="table">
          <div class="table__head">
            <span>组件</span>
            <span>负责人</span>
          </div>
          <div
            v-for="row in rows"
            :key="row.id"
            class="table__row"
            @contextmenu="onRowMenu(row.name, $event)"
          >
            <span class="table__name">{{ row.name }}</span>
            <span class="table__owner">{{ row.owner }}</span>
          </div>
        </div>
      </SrContextMenu>
      <p class="hint">每行一个菜单实例。右键时先记住当前行，选中菜单项后再用这个上下文去操作</p>
    </section>

    <section>
      <h3>与 Dropdown 的区别</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">SrDropdown</span>
          <p class="hint" style="margin: 0">点击触发，位置跟随触发元素，适合「操作」按钮</p>
        </div>
        <div class="card">
          <span class="tag">SrContextMenu</span>
          <p class="hint" style="margin: 0">右键触发，位置跟随鼠标，适合列表项、画布、表格行</p>
        </div>
      </div>
    </section>

    <section>
      <h3>禁用整个菜单</h3>
      <SrContextMenu :items="basicItems" disabled>
        <div class="zone zone--disabled">这块区域禁用了右键菜单</div>
      </SrContextMenu>
      <p class="hint">禁用后仍会阻止浏览器默认菜单（避免露出原生菜单），只是不弹出自己的</p>
    </section>

    <section>
      <h3>最近操作</h3>
      <SrTag size="sm" :type="lastAction ? 'success' : 'info'">
        {{ lastAction || '还没有操作' }}
      </SrTag>
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

.zone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 280px;
  height: 90px;
  border: 1px dashed var(--sr-color-border);
  border-radius: var(--sr-radius-base);
  color: var(--sr-color-text-tertiary);
  font-size: 12.5px;
  user-select: none;
}

.zone--disabled {
  background: var(--sr-color-bg-sunken);
}

.table {
  max-width: 420px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  overflow: hidden;
}

.table__head {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-tertiary);
  font-size: 11.5px;
}

.table__head span:first-child {
  flex: 1 1 auto;
}

.table__head span:last-child {
  flex: 0 0 80px;
}

.table__row {
  display: flex;
  gap: 12px;
  padding: 9px 12px;
  border-top: 1px solid var(--sr-color-border-subtle);
  font-size: 13px;
  cursor: context-menu;
}

.table__row:hover {
  background: var(--sr-color-bg-sunken);
}

.table__name {
  flex: 1 1 auto;
  color: var(--sr-color-text);
}

.table__owner {
  flex: 0 0 80px;
  color: var(--sr-color-text-tertiary);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.card {
  padding: 14px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.tag {
  display: block;
  margin-bottom: 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}
</style>
