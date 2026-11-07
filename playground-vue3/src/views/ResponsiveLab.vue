<script setup lang="ts">
import { computed } from 'vue'

import { SR_BREAKPOINTS, SrCol, SrRow, useSrBreakpoint, SrPanel } from '@sunset-reverie/ui'

defineOptions({ name: 'ResponsiveLab' })

const { width, current, isMobile, isTablet, isDesktop, isUp, isDown } = useSrBreakpoint()

/** 断点刻度（用于可视化条） */
const breakpoints = Object.entries(SR_BREAKPOINTS).map(([name, min]) => ({
  name: name as keyof typeof SR_BREAKPOINTS,
  min,
}))

/** 刻度条最大量程 */
const SCALE = 1440

/**
 * 把宽度换算为刻度条上的百分比
 * @param px 宽度
 * @returns 0~100 的百分比数值
 */
function toPercent(px: number): number {
  return Math.min(100, Math.max(0, (px / SCALE) * 100))
}

/** 当前视口宽度在刻度条上的位置 */
const pointerPercent = computed(() => toPercent(width.value))

/** 断点判断矩阵 */
const matrix = computed(() =>
  breakpoints.map((bp) => ({
    ...bp,
    isUp: isUp(bp.name),
    isDown: isDown(bp.name),
    isCurrent: current.value === bp.name,
  })),
)
</script>

<template>
  <div>
    <SrPanel>
      <h2 class="panel__title">当前断点</h2>
      <p class="panel__desc">
        useSrBreakpoint 基于 resize + rAF 读取真实视口宽度，断点数值与 CSS 媒体查询共用同一份 token。
      </p>

      <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px">
        <strong style="font-size: 44px; line-height: 1; color: var(--sr-color-primary)">{{ current }}</strong>
        <span style="font-family: var(--sr-font-family-mono); color: var(--sr-color-text-secondary)">
          {{ width }}px
        </span>
        <span class="pg__pill">mobile {{ isMobile }}</span>
        <span class="pg__pill">tablet {{ isTablet }}</span>
        <span class="pg__pill">desktop {{ isDesktop }}</span>
      </div>

      <div
        style="
          position: relative;
          height: 40px;
          margin-top: 16px;
          border-radius: var(--sr-radius-base);
          background: var(--sr-color-bg-sunken);
          border: 1px solid var(--sr-color-border);
          overflow: hidden;
        "
      >
        <div
          v-for="bp in breakpoints"
          :key="bp.name"
          :style="{
            position: 'absolute',
            left: toPercent(bp.min) + '%',
            top: '0',
            bottom: '0',
            width: '1px',
            background: 'var(--sr-color-border-strong)',
          }"
        />
        <div
          :style="{
            position: 'absolute',
            left: pointerPercent + '%',
            top: '0',
            bottom: '0',
            width: '3px',
            background: 'var(--sr-color-primary)',
            transform: 'translateX(-1.5px)',
          }"
        />
        <span
          v-for="bp in breakpoints"
          :key="'label-' + bp.name"
          :style="{
            position: 'absolute',
            left: 'calc(' + toPercent(bp.min) + '% + 4px)',
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'var(--sr-font-family-mono)',
            fontSize: '10px',
            color: 'var(--sr-color-text-tertiary)',
          }"
        >
          {{ bp.name }}
        </span>
      </div>
    </SrPanel>

    <SrPanel>
      <h2 class="panel__title">判断矩阵</h2>
      <p class="panel__desc">isUp / isDown 在模板中调用会自动建立响应式依赖，无需额外监听。</p>

      <div v-for="row in matrix" :key="row.name" class="kv">
        <span class="kv__key">{{ row.name }} · {{ row.min }}px</span>
        <span class="kv__val">
          isUp: {{ row.isUp }} / isDown: {{ row.isDown }} / current: {{ row.isCurrent }}
        </span>
      </div>
    </SrPanel>

    <SrPanel>
      <h2 class="panel__title">栅格随断点变化</h2>
      <p class="panel__desc">
        下面 6 张卡片：xs 占满、sm 两列、lg 三列。改成 4 列只需改一个对象，不需要写媒体查询。
      </p>

      <sr-row :gutter="[16, 16]">
        <sr-col v-for="n in 6" :key="n" :span="{ xs: 24, sm: 12, lg: 8 }">
          <div class="cell">卡片 {{ n }}</div>
        </sr-col>
      </sr-row>
    </SrPanel>
  </div>
</template>
