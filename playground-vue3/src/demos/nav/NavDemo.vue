<script setup lang="ts">
import { ref } from 'vue'
import { SrAvatar, SrButton, SrNav, type SrNavItem } from '@sunset-reverie/ui'

defineOptions({ name: 'NavDemo' })

/** 基础项 */
const horizontalKey = ref('home')
const baseItems: SrNavItem[] = [
  { key: 'home', label: '首页', icon: 'lucide:house' },
  { key: 'list', label: '组件', icon: 'lucide:inbox', badge: 12 },
  { key: 'fav', label: '收藏', icon: 'lucide:heart' },
  { key: 'setting', label: '设置', icon: 'lucide:settings', disabled: true },
]

/** 分组项 */
const groupedKey = ref('overview')
const groupedItems: SrNavItem[] = [
  { group: '工作台', key: 'overview', label: '概览', icon: 'lucide:house' },
  { group: '工作台', key: 'message', label: '消息', icon: 'lucide:inbox', badge: 5 },
  { group: '工作台', key: 'team', label: '团队', icon: 'lucide:heart' },
  { group: '系统', key: 'setting', label: '设置', icon: 'lucide:settings', divider: true },
  { group: '系统', key: 'trash', label: '回收站', icon: 'lucide:trash' },
]

/** 子菜单项 */
const nestedKey = ref('member')
const nestedItems: SrNavItem[] = [
  { key: 'overview', label: '概览', icon: 'lucide:house' },
  {
    key: 'res',
    label: '资源',
    icon: 'lucide:inbox',
    children: [
      { key: 'file', label: '文件' },
      { key: 'image', label: '图片' },
      { key: 'video', label: '视频' },
    ],
  },
  {
    key: 'team',
    label: '团队',
    icon: 'lucide:heart',
    children: [
      { key: 'member', label: '成员' },
      { key: 'role', label: '角色' },
    ],
  },
  { key: 'setting', label: '设置', icon: 'lucide:settings' },
]

/** 整体收起 */
const collapsed = ref(false)

/** 可折叠分组 */
const collapsibleKey = ref('a')
const collapsibleItems: SrNavItem[] = [
  { group: '设计系统', key: 'a', label: 'Token', icon: 'lucide:box' },
  { group: '设计系统', key: 'b', label: '主题', icon: 'lucide:sun' },
  { group: '说明', key: 'c', label: '不可折叠的组', icon: 'lucide:info', collapsible: false },
]
</script>

<template>
  <div class="demo">
    <section>
      <h3>水平（水平模式不显示分组与分割线）</h3>
      <SrNav v-model="horizontalKey" :items="baseItems" />
      <p class="hint">当前选中：{{ horizontalKey }}，徽标与禁用项都按预期</p>
    </section>

    <section>
      <h3>垂直 + pill 激活（默认）</h3>
      <div class="side">
        <SrNav v-model="groupedKey" :items="groupedItems" mode="vertical" active-style="pill" :width="220" />
      </div>
      <p class="hint">分组标题可点击折叠，divider 会在「设置」上方加一条分割线</p>
    </section>

    <section>
      <h3>垂直 + bar 激活（侧边栏常用，色弱也能分辨）</h3>
      <div class="side">
        <SrNav v-model="groupedKey" :items="groupedItems" mode="vertical" active-style="bar" :width="220" />
      </div>
    </section>

    <section>
      <h3>子菜单（两级）</h3>
      <div class="side">
        <SrNav v-model="nestedKey" :items="nestedItems" mode="vertical" :width="220" />
      </div>
      <p class="hint">点「资源」「团队」就地展开；当前子项：{{ nestedKey }}</p>
    </section>

    <section>
      <h3>整体收起（悬停图标弹出子菜单）</h3>
      <div class="side">
        <SrButton size="sm" variant="outline" @click="collapsed = !collapsed">
          {{ collapsed ? '展开' : '收起' }}
        </SrButton>
        <SrNav
          v-model="nestedKey"
          :items="nestedItems"
          mode="vertical"
          :collapsed="collapsed"
          :width="220"
          :max-height="300"
        />
      </div>
      <p class="hint">收起态徽标退化成圆点，分组标题整块不渲染</p>
    </section>

    <section>
      <h3>品牌区 + 底部区 + 去壳（bare）</h3>
      <div class="bare-side">
        <SrNav
          v-model="groupedKey"
          :items="groupedItems"
          mode="vertical"
          bare
          logo="lucide:moon-star"
          title="夕梦 UI"
          :width="210"
        >
          <template #footer>
            <SrAvatar alt="林" size="sm" />
            <span class="user">
              <span class="user__name">林深</span>
              <span class="user__role">组件库维护</span>
            </span>
          </template>
        </SrNav>
      </div>
      <p class="hint">bare 去掉自身外壳，高度撑满父容器，适合放在通栏侧栏里</p>
    </section>

    <section>
      <h3>可折叠分组 / 不可折叠分组</h3>
      <div class="side">
        <SrNav v-model="collapsibleKey" :items="collapsibleItems" mode="vertical" :width="220" />
      </div>
      <p class="hint">「说明」组设了 collapsible: false，标题只作说明，没有箭头也不可点</p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="sizes">
        <SrNav
          v-for="s in ['xs', 'sm', 'md', 'lg']"
          :key="s"
          :items="baseItems"
          :model-value="'home'"
          :size="s as 'md'"
        />
      </div>
    </section>

    <section>
      <h3>整体禁用</h3>
      <SrNav :items="baseItems" :model-value="'home'" disabled />
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

/* 侧栏演示需要有底色，否则 nav 的玻璃边看不出层次 */
.side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.bare-side {
  width: 210px;
  height: 300px;
  overflow: hidden;
  border-radius: var(--sr-radius-base);
  border: 1px solid var(--sr-color-border);
}

.user {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.user__name {
  color: var(--sr-color-text);
  font-size: 13px;
}
.user__role {
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.sizes {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
}
</style>
