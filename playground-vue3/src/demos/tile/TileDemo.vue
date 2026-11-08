<script setup lang="ts">
import { ref } from 'vue'
import { SrTile } from '@sunset-reverie/ui'

defineOptions({ name: 'TileDemo' })

/** 功能宫格 */
const features = [
  { key: 'user', icon: 'lucide:user', title: '用户管理', desc: '账号与权限', type: 'primary' as const },
  {
    key: 'order',
    icon: 'lucide:shopping-cart',
    title: '订单中心',
    desc: '交易记录',
    type: 'success' as const,
  },
  { key: 'stat', icon: 'lucide:chart-bar', title: '数据报表', desc: '经营分析', type: 'warning' as const },
  { key: 'setting', icon: 'lucide:settings', title: '系统设置', desc: '参数配置', type: 'default' as const },
]

/** 图标选择器 */
const icons = ['lucide:heart', 'lucide:star', 'lucide:bookmark', 'lucide:bell', 'lucide:flag', 'lucide:tag']

/** 当前选中的图标 */
const picked = ref('lucide:heart')

/**
 * 选中图标
 * @param icon 图标名
 */
function pickIcon(icon: string): void {
  picked.value = icon
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>功能宫格</h3>
      <div class="tiles">
        <SrTile
          v-for="f in features"
          :key="f.key"
          :icon="f.icon"
          :title="f.title"
          :description="f.desc"
          :type="f.type"
        />
      </div>
      <p class="hint">图标 + 标题 + 描述，适合首页快捷入口；type 控制图标区域配色分组</p>
    </section>

    <section>
      <h3>图标选择器（可选中）</h3>
      <div class="tiles tiles--narrow">
        <SrTile
          v-for="icon in icons"
          :key="icon"
          :icon="icon"
          :active="picked === icon"
          size="sm"
          @click="pickIcon(icon)"
        />
      </div>
      <p class="hint">
        选中态右上角出现对勾，<code>aria-pressed</code> 同步。当前选中：
        <code>{{ picked }}</code>
      </p>
    </section>

    <section>
      <h3>横向布局</h3>
      <div class="list">
        <SrTile
          v-for="f in features.slice(0, 3)"
          :key="f.key"
          :icon="f.icon"
          :title="f.title"
          :description="f.desc"
          :type="f.type"
          horizontal
        />
      </div>
      <p class="hint">horizontal 让图标在左、文字在右，适合列表式的快捷入口</p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row">
        <div v-for="s in ['xs', 'sm', 'md', 'lg']" :key="s" class="size-item">
          <SrTile icon="lucide:heart" title="收藏" :size="s as 'sm'" />
          <span class="label">{{ s }}</span>
        </div>
      </div>
    </section>

    <section>
      <h3>禁用</h3>
      <div class="tiles tiles--narrow">
        <SrTile icon="lucide:heart" title="可用" size="sm" />
        <SrTile icon="lucide:lock" title="禁用" size="sm" disabled />
        <SrTile icon="lucide:star" title="选中" size="sm" active />
      </div>
      <p class="hint">禁用项不派发 click，hover 也不再上浮</p>
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

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  max-width: 720px;
}

.tiles--narrow {
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  max-width: 520px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
}

.row {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
}

.size-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6px;
}

.label {
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}
</style>
