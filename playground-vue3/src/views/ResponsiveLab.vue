<script setup lang="ts">
import { computed } from 'vue'

import {
  SR_BREAKPOINTS,
  SR_BREAKPOINT_KEYS,
  SrAlert,
  SrCodeBlock,
  SrDescriptions,
  SrPanel,
  SrStatistic,
  SrTable,
  SrTag,
  useSrBreakpoint,
  type SrDescriptionItem,
  type SrTableColumn,
} from '@sunset-reverie/ui'

defineOptions({ name: 'ResponsiveLab' })

const { width, current, isUp, isDown, isMobile, isTablet } = useSrBreakpoint()

/** 断点带的右边界：xl 之后没有上界，图示上按 1440 截断 */
const SCALE_MAX = 1440

/** 断点带，用于把「区间」画成一条比例尺 */
const bands = computed(() =>
  SR_BREAKPOINT_KEYS.map((key, index) => {
    const from = SR_BREAKPOINTS[key]
    const nextIndex = index + 1
    const to =
      nextIndex < SR_BREAKPOINT_KEYS.length ? SR_BREAKPOINTS[SR_BREAKPOINT_KEYS[nextIndex]] : SCALE_MAX
    return {
      key,
      from,
      to,
      /** 最后一个断点没有上界 */
      open: nextIndex >= SR_BREAKPOINT_KEYS.length,
      /** 该片段在比例尺上的占比 */
      weight: to - from,
    }
  }),
)

/** 当前视口在比例尺上的位置（百分比，超范围时贴边） */
const cursorPosition = computed(() => Math.min(Math.max(width.value, 0) / SCALE_MAX, 1) * 100)

/**
 * 断点区间文案
 * @param band 断点带
 * @returns 如 `576 – 767` 或 `≥ 1200`
 */
function rangeLabel(band: { from: number; to: number; open: boolean }): string {
  return band.open ? `≥ ${band.from}` : `${band.from} – ${band.to - 1}`
}

/** 当前状态一览 */
const stateItems = computed<SrDescriptionItem[]>(() => [
  { label: '视口宽度', value: `${width.value} px` },
  { label: '当前断点', value: current.value },
  { label: '设备档位', value: isMobile.value ? '手机' : isTablet.value ? '平板' : '桌面' },
  { label: '是否 ≥ md(768)', value: isUp('md') ? '是' : '否' },
  { label: '是否 < lg(992)', value: isDown('lg') ? '是' : '否' },
])

/** 断点表列定义 */
const columns: SrTableColumn[] = [
  { key: 'key', title: '断点', width: 90 },
  { key: 'min', title: '起点', width: 100, align: 'right' },
  { key: 'range', title: '生效区间', minWidth: 140 },
  { key: 'up', title: '≥ 该断点', width: 110, align: 'center' },
  { key: 'state', title: '当前', width: 90, align: 'center' },
]

/** 断点表数据 */
const rows = computed(() =>
  SR_BREAKPOINT_KEYS.map((key) => ({
    key,
    min: SR_BREAKPOINTS[key],
    range: rangeLabel(bands.value.find((band) => band.key === key)!),
    up: isUp(key),
    state: key === current.value,
  })),
)

/**
 * 示例栅格列数：三档而不是每档一个数
 * @returns 1 / 2 / 3
 */
const gridColumns = computed(() => (isUp('lg') ? 3 : isUp('sm') ? 2 : 1))

/** 提示当前布局决策 */
const gridHint = computed(() => {
  if (gridColumns.value === 3) return '≥ lg（992）：三列，信息密度优先'
  if (gridColumns.value === 2) return '≥ sm（576）且 < lg：两列，兼顾可读与密度'
  return '< sm（576）：单列，横向放不下两张卡'
})

/** 用法片段 */
const usageCode = `const { width, current, isUp, isDown } = useSrBreakpoint({ ssrWidth: 768 })

// current: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
// 断点数值来自 SR_BREAKPOINTS，与 CSS 媒体查询同一份定义
if (isUp('lg')) { /* 桌面布局 */ }`

/** CSS 侧的同源写法 */
const cssCode = `/* 768 就是 SR_BREAKPOINTS.md，改 token 时两边一起变 */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}`
</script>

<template>
  <div class="lab">
    <SrPanel
      title="当前断点"
      description="断点不是设备型号，是「视口够不够宽」。拖动浏览器窗口，下面会立刻跟着变。"
    >
      <div class="lab__chart">
        <div class="lab__chart-head">
          <SrStatistic :value="width" title="当前视口宽度" suffix=" px" />
          <div class="lab__chart-tags">
            <SrTag type="primary">{{ current }}</SrTag>
            <SrTag v-if="isMobile" type="info">手机</SrTag>
            <SrTag v-else-if="isTablet" type="warning">平板</SrTag>
            <SrTag v-else type="success">桌面</SrTag>
          </div>
        </div>

        <div class="lab__ruler" role="img" :aria-label="`当前断点 ${current}，视口宽度 ${width} 像素`">
          <div
            v-for="band in bands"
            :key="band.key"
            class="lab__band"
            :class="{ 'is-current': band.key === current }"
            :style="{ flexGrow: band.weight }"
          >
            <span class="lab__band-name">{{ band.key }}</span>
            <span class="lab__band-range">{{ rangeLabel(band) }}</span>
          </div>

          <div class="lab__cursor" :style="{ left: `${cursorPosition}%` }" />
        </div>

        <p class="lab__note">
          区间取「左闭右开」：
          <code>768</code>
          已经算
          <code>md</code>
          ，不是还留在
          <code>sm</code>
          ——边界值归上不归下，媒体查询里
          <code>min-width</code>
          的语义本来就是这样。
        </p>
      </div>

      <SrDescriptions :items="stateItems" :column="1" border />
    </SrPanel>

    <SrPanel
      title="断点表"
      description="五个断点就是全部，没有「超小屏」「超宽屏」这类额外档位——档位越多，样式分支越多。"
    >
      <SrTable :data="rows" :columns="columns" row-key="key" size="sm" bordered>
        <template #cell-key="{ row }">
          <SrTag :type="row.key === current ? 'primary' : 'default'" size="sm">{{ row.key }}</SrTag>
        </template>
        <template #cell-min="{ row }">
          <span class="lab__mono">{{ row.min }}</span>
        </template>
        <template #cell-range="{ row }">
          <span class="lab__mono">{{ row.range }}</span>
        </template>
        <template #cell-up="{ row }">
          <span :class="['lab__flag', { 'is-on': row.up }]">{{ row.up ? '✓' : '—' }}</span>
        </template>
        <template #cell-state="{ row }">
          <SrTag v-if="row.state" type="primary" size="sm" round>在此</SrTag>
          <span v-else class="lab__flag">—</span>
        </template>
      </SrTable>

      <p class="lab__note">
        表里「≥ 该断点」那一列就是
        <code>isUp()</code>
        的结果。写样式时用媒体查询，写行为时用
        <code>isUp()</code>
        ，两边的阈值来自同一份
        <code>SR_BREAKPOINTS</code>
        ，不会出现「CSS 在 992 切换、JS 在 1000 才切」的错位。
      </p>
    </SrPanel>

    <SrPanel title="响应式示例" description="同一份标记，只改列数——不是给每个断点写一套布局。">
      <div class="lab__toolbar">
        <SrTag type="primary">{{ gridColumns }} 列</SrTag>
        <span class="lab__hint">{{ gridHint }}</span>
      </div>

      <div class="lab__grid-demo" :style="{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }">
        <div v-for="index in 6" :key="index" class="lab__card">
          <div class="lab__card-title">数据卡 {{ index }}</div>
          <div class="lab__card-body" />
        </div>
      </div>

      <p class="lab__note">
        列的切换点是
        <code>sm</code>
        与
        <code>lg</code>
        ，中间的
        <code>md</code>
        不单独分支：768–991 这段继续用两列，硬塞第三列会把每张卡压到 220 以下。
      </p>
    </SrPanel>

    <SrPanel
      title="在 JS 里判断"
      description="只有在 JS 里做结构性切换时才需要它——纯样式切换交给媒体查询，别两头判断。"
    >
      <div class="lab__code">
        <SrCodeBlock title="useSrBreakpoint" lang="ts" :code="usageCode" />
        <SrCodeBlock title="style.css" lang="css" :code="cssCode" />
      </div>

      <p class="lab__note">
        SSR 下首帧固定按
        <code>ssrWidth</code>
        （默认
        768）算，客户端挂载后再校正——这样服务端与客户端输出的结构一致，不会出现水合不匹配。代价是移动端首帧可能先按平板排一下。
      </p>

      <SrAlert
        type="info"
        title="resize 已做 rAF 节流"
        description="拖动窗口时每帧最多读一次 innerWidth，不会因为高频 resize 触发成串的重排；自己也别再套一层监听。"
      />
    </SrPanel>
  </div>
</template>

<style lang="less" scoped>
.lab {
  display: grid;
  gap: var(--sr-space-4);
  max-width: 920px;

  &__note {
    margin: var(--sr-space-3) 0 0;
    color: var(--sr-color-text-secondary);
    font-size: var(--sr-font-size-sm);
    line-height: 1.7;

    code {
      padding: 1px 5px;
      border-radius: var(--sr-radius-sm);
      background: var(--sr-color-bg-sunken);
      color: var(--sr-color-text);
      font-size: 0.92em;
    }
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sr-space-2);
    margin-bottom: var(--sr-space-3);
  }

  &__hint {
    color: var(--sr-color-text-tertiary);
    font-size: var(--sr-font-size-sm);
  }

  &__chart {
    margin-bottom: var(--sr-space-4);
  }

  &__chart-head {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sr-space-3);
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--sr-space-3);
  }

  &__chart-tags {
    display: flex;
    gap: var(--sr-space-2);
    align-items: center;
  }

  &__ruler {
    position: relative;
    display: flex;
    overflow: hidden;
    border: 1px solid var(--sr-color-border);
    border-radius: var(--sr-radius-md);
  }

  &__band {
    display: grid;
    place-content: center;
    gap: 2px;
    min-width: 0;
    padding: var(--sr-space-2) var(--sr-space-1);
    border-inline-end: 1px solid var(--sr-color-border-subtle);
    background: var(--sr-color-bg-sunken);
    text-align: center;
    transition: background var(--sr-motion-duration-fast) var(--sr-motion-easing-standard);

    &:last-child {
      border-inline-end: none;
    }

    &.is-current {
      background: var(--sr-color-primary-alpha-12);
      box-shadow: inset 0 0 0 1px var(--sr-color-primary-alpha-25);
    }
  }

  &__band-name {
    color: var(--sr-color-text);
    font-family: var(--sr-font-family-mono);
    font-size: var(--sr-font-size-sm);
  }

  &__band-range {
    overflow: hidden;
    color: var(--sr-color-text-tertiary);
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__cursor {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--sr-color-primary);
    box-shadow: 0 0 0 2px var(--sr-color-primary-alpha-25);
    transition: left var(--sr-motion-duration-fast) var(--sr-motion-easing-standard);
    pointer-events: none;
  }

  &__mono {
    font-family: var(--sr-font-family-mono);
    font-size: var(--sr-font-size-sm);
  }

  &__flag {
    color: var(--sr-color-text-tertiary);

    &.is-on {
      color: var(--sr-color-success);
    }
  }

  &__grid-demo {
    display: grid;
    gap: var(--sr-space-2);
  }

  &__card {
    display: grid;
    gap: var(--sr-space-2);
    padding: var(--sr-space-3);
    border: 1px solid var(--sr-color-border);
    border-radius: var(--sr-radius-md);
    background: var(--sr-color-bg-container);
  }

  &__card-title {
    color: var(--sr-color-text);
    font-size: var(--sr-font-size-sm);
  }

  &__card-body {
    height: 44px;
    border-radius: var(--sr-radius-sm);
    background: var(--sr-color-primary-alpha-08);
  }

  &__code {
    display: grid;
    gap: var(--sr-space-3);
  }
}
</style>
