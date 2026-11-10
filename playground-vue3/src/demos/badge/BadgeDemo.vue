<script setup lang="ts">
import { SrBadge, SrButton } from '@sunset-reverie/ui'

defineOptions({ name: 'BadgeDemo' })

const types = ['danger', 'primary', 'success', 'warning', 'info'] as const
const statuses = [
  { status: 'processing', text: '部署中' },
  { status: 'success', text: '运行正常' },
  { status: 'warning', text: '资源紧张' },
  { status: 'danger', text: '已停止' },
  { status: 'default', text: '未启用' },
] as const
</script>

<template>
  <div class="demo">
    <section>
      <h3>数字角标</h3>
      <div class="row">
        <SrBadge :value="12"><SrButton variant="outline" size="sm">消息</SrButton></SrBadge>
        <SrBadge :value="120"><SrButton variant="outline" size="sm">超上限折叠</SrButton></SrBadge>
        <SrBadge dot><SrButton variant="outline" size="sm">圆点</SrButton></SrBadge>
        <SrBadge :value="0" show-zero><SrButton variant="outline" size="sm">显示 0</SrButton></SrBadge>
      </div>
    </section>

    <section>
      <h3>语义类型</h3>
      <div class="row">
        <SrBadge v-for="t in types" :key="t" :value="3" :type="t">
          <SrButton variant="outline" size="sm">{{ t }}</SrButton>
        </SrBadge>
      </div>
    </section>

    <section>
      <h3>状态点</h3>
      <div class="row" style="gap: 18px">
        <SrBadge v-for="s in statuses" :key="s.status" :status="s.status" :text="s.text" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 22px;
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
  gap: 10px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
</style>
