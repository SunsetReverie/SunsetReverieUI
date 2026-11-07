<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrPanel } from '@sunset-reverie/ui'

defineOptions({ name: 'PanelDemo' })

const open = ref(true)
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础与折叠</h3>
      <SrPanel title="筛选条件" description="勾选后立即生效">
        <p style="margin: 0; font-size: 13px">默认没有边框与背景，比 Card 更轻。</p>
      </SrPanel>

      <SrPanel v-model="open" title="高级配置" description="点标题右侧箭头折叠" collapsible>
        <p style="margin: 0; font-size: 13px">当前状态：{{ open ? '展开' : '收起' }}</p>
      </SrPanel>
    </section>

    <section>
      <h3>自定义头部与操作区</h3>
      <SrPanel>
        <template #header>
          <h4 style="margin: 0; font-size: 14px; font-weight: 600">自定义头部</h4>
          <p style="margin: 4px 0 0; font-size: 12px; color: var(--sr-color-text-tertiary)">
            整块替换，可以是任意结构
          </p>
        </template>
        <template #extra>
          <SrButton size="xs" variant="text">查看全部</SrButton>
        </template>
        <p style="margin: 0; font-size: 13px">主体内容</p>
      </SrPanel>
    </section>

    <section>
      <h3>去内边距（flush）</h3>
      <SrPanel title="调用趋势" flush>
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 90px;
            background: linear-gradient(120deg, var(--sr-color-primary-alpha-08), transparent);
            color: var(--sr-color-primary-text);
            font-size: 13px;
          "
        >
          图表、表格这类自带间距的内容用 flush
        </div>
      </SrPanel>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
h3 {
  margin: 0;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}
</style>
