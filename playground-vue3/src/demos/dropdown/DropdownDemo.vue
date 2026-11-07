<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrDropdown, SrTabs, srToast, type SrDropdownItem } from '@sunset-reverie/ui'

defineOptions({ name: 'DropdownDemo' })

/** 纯文字菜单 */
const plainItems: SrDropdownItem[] = [
  { key: 'edit', label: '编辑' },
  { key: 'copy', label: '复制' },
  { key: 'delete', label: '删除', danger: true, divided: true },
]

/** 带图标 */
const iconItems: SrDropdownItem[] = [
  { key: 'edit', label: '编辑', icon: 'lucide:pencil' },
  { key: 'copy', label: '复制', icon: 'lucide:inbox' },
  { key: 'share', label: '分享', icon: 'lucide:heart' },
]

/** 分组 + 危险项 */
const groupedItems: SrDropdownItem[] = [
  { group: '常用', key: 'edit', label: '编辑', icon: 'lucide:pencil' },
  { group: '常用', key: 'copy', label: '复制', icon: 'lucide:inbox' },
  { group: '危险操作', key: 'trash', label: '移入回收站', icon: 'lucide:trash', divided: true },
  { group: '危险操作', key: 'delete', label: '永久删除', icon: 'lucide:x', danger: true },
]

/** 状态项 */
const stateItems: SrDropdownItem[] = [
  { key: 'pin', label: '置顶', icon: 'lucide:house', selected: true },
  { key: 'mute', label: '免打扰', icon: 'lucide:settings' },
  { key: 'share', label: '分享给他人', icon: 'lucide:heart', disabled: true },
]

const lastPicked = ref('')
const theme = ref('light')

const themeOptions = [
  { key: 'light', label: '亮色' },
  { key: 'dark', label: '暗色' },
  { key: 'auto', label: '跟随' },
]

/**
 * 选中回调
 * @param key 菜单 key
 * @param item 菜单项
 */
function pick(key: string, item?: SrDropdownItem): void {
  lastPicked.value = item?.label ?? key
  srToast.success(`选中：${lastPicked.value}`)
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>纯文字菜单</h3>
      <div class="row">
        <SrDropdown :items="plainItems" @select="pick">
          <SrButton variant="outline" size="sm">更多操作</SrButton>
        </SrDropdown>
        <span class="hint">最近选择：{{ lastPicked || '—' }}</span>
      </div>
    </section>

    <section>
      <h3>带图标（组内图标要么全有、要么全无）</h3>
      <div class="row">
        <SrDropdown :items="iconItems" @select="pick">
          <SrButton variant="outline" size="sm">带图标</SrButton>
        </SrDropdown>
      </div>
    </section>

    <section>
      <h3>分组 + 分割线 + 危险项</h3>
      <div class="row">
        <SrDropdown :items="groupedItems" @select="pick">
          <SrButton variant="outline" size="sm">分组菜单</SrButton>
        </SrDropdown>
      </div>
    </section>

    <section>
      <h3>选中标记 / 禁用项</h3>
      <div class="row">
        <SrDropdown :items="stateItems" @select="pick">
          <SrButton variant="outline" size="sm">状态示例</SrButton>
        </SrDropdown>
      </div>
    </section>

    <section>
      <h3>悬停触发（离开后 160ms 才关闭）</h3>
      <div class="row">
        <SrDropdown :items="iconItems" trigger="hover" @select="pick">
          <SrButton variant="text" size="sm">悬停我</SrButton>
        </SrDropdown>
      </div>
    </section>

    <section>
      <h3>弹出位置</h3>
      <div class="row">
        <SrDropdown
          v-for="p in ['bottom-start', 'bottom-end', 'top-start', 'top-end']"
          :key="p"
          :items="plainItems"
          :placement="p as 'bottom-start'"
          @select="pick"
        >
          <SrButton variant="text" size="sm">{{ p }}</SrButton>
        </SrDropdown>
      </div>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row">
        <SrDropdown
          v-for="s in ['xs', 'sm', 'md', 'lg']"
          :key="s"
          :items="iconItems"
          :size="s as 'md'"
          @select="pick"
        >
          <SrButton variant="outline" size="xs">{{ s }}</SrButton>
        </SrDropdown>
      </div>
    </section>

    <section>
      <h3>整体禁用</h3>
      <div class="row">
        <SrDropdown :items="plainItems" disabled>
          <SrButton variant="outline" size="sm" disabled>禁用</SrButton>
        </SrDropdown>
      </div>
    </section>

    <section>
      <h3>自定义面板（#menu + flush + role="dialog"）</h3>
      <div class="row">
        <SrDropdown flush role="dialog" :min-width="260">
          <SrButton variant="outline" size="sm">外观设置</SrButton>
          <template #menu>
            <div style="padding: 14px 16px; min-width: 240px">
              <p style="margin: 0 0 10px; font-weight: 600; font-size: 13px">主题</p>
              <SrTabs v-model="theme" :items="themeOptions" type="pill" size="sm" />
              <p style="margin: 14px 0 0; font-size: 12px; color: var(--sr-color-text-tertiary)">
                #menu 插槽里可以是任意内容
              </p>
            </div>
          </template>
        </SrDropdown>
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
.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.hint {
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
