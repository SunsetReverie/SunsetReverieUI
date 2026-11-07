<script setup lang="ts">
import { SrButton, SrIcon, SrTooltip } from '@sunset-reverie/ui'

defineOptions({ name: 'TooltipDemo' })

const placements = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
] as const
</script>

<template>
  <div class="demo">
    <section>
      <h3>两种配色</h3>
      <div class="row">
        <SrTooltip content="深色玻璃（默认）">
          <SrButton variant="outline" size="sm">dark</SrButton>
        </SrTooltip>
        <SrTooltip content="浅色玻璃" variant="light">
          <SrButton variant="outline" size="sm">light</SrButton>
        </SrTooltip>
        <SrTooltip content="自定义背景色" background-color="#8b5cf6">
          <SrButton variant="outline" size="sm">自定义色</SrButton>
        </SrTooltip>
      </div>
    </section>

    <section>
      <h3>12 个方位</h3>
      <div class="placements">
        <SrTooltip v-for="p in placements" :key="p" :content="p" :placement="p">
          <SrButton variant="text" size="xs">{{ p }}</SrButton>
        </SrTooltip>
      </div>
      <p class="hint">空间不足时会自动翻到反方向，可以滚动到页面边缘试试</p>
    </section>

    <section>
      <h3>延迟</h3>
      <div class="row">
        <SrTooltip content="立刻出现" :show-delay="0">
          <SrButton variant="outline" size="sm">showDelay 0</SrButton>
        </SrTooltip>
        <SrTooltip content="等 600ms 才出现" :show-delay="600">
          <SrButton variant="outline" size="sm">showDelay 600</SrButton>
        </SrTooltip>
        <SrTooltip content="离开后停留 600ms" :hide-delay="600">
          <SrButton variant="outline" size="sm">hideDelay 600</SrButton>
        </SrTooltip>
      </div>
    </section>

    <section>
      <h3>无箭头 / 自定义间距 / 最大宽度</h3>
      <div class="row">
        <SrTooltip content="没有小三角" :arrow="false">
          <SrButton variant="outline" size="sm">arrow false</SrButton>
        </SrTooltip>
        <SrTooltip content="距离更远" :offset="20">
          <SrButton variant="outline" size="sm">offset 20</SrButton>
        </SrTooltip>
        <SrTooltip
          content="这段文字比较长，会被限制在 160px 内自动换行，用来验证 maxWidth 的效果"
          :max-width="160"
        >
          <SrButton variant="outline" size="sm">maxWidth 160</SrButton>
        </SrTooltip>
      </div>
    </section>

    <section>
      <h3>富内容（#content 插槽）</h3>
      <div class="row">
        <SrTooltip>
          <template #content>
            <strong style="display: block; margin-bottom: 4px">标题</strong>
            <span>支持换行与任意结构，比如列表：</span>
            <ul style="margin: 6px 0 0; padding-left: 16px">
              <li>第一项</li>
              <li>第二项</li>
            </ul>
          </template>
          <SrIcon name="lucide:info" :size="18" />
        </SrTooltip>
      </div>
    </section>

    <section>
      <h3>禁用</h3>
      <div class="row">
        <SrTooltip content="不会显示" disabled>
          <SrButton variant="outline" size="sm">disabled</SrButton>
        </SrTooltip>
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
  margin: 10px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
.placements {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 720px;
}
</style>
