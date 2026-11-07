<script setup lang="ts">
import { SrCol, SrRow, SrPanel } from '@sunset-reverie/ui'

defineOptions({ name: 'OverviewView' })

/** 等分示例：24 栅格的常见切分方式 */
const equalSplits = [
  { span: 12, label: '12 / 24' },
  { span: 8, label: '8 / 24' },
  { span: 6, label: '6 / 24' },
  { span: 4, label: '4 / 24' },
]
</script>

<template>
  <div>
    <SrPanel>
      <h2 class="panel__title">等分栅格</h2>
      <p class="panel__desc">24 栅格的优势：能被 3、4、6、8 整除，中后台常见的五等分、六等分都能落成整数。</p>

      <div v-for="split in equalSplits" :key="split.span" style="margin-bottom: 12px">
        <sr-row :gutter="12">
          <sr-col v-for="n in 24 / split.span" :key="n" :span="split.span">
            <div class="cell">{{ split.label }}</div>
          </sr-col>
        </sr-row>
      </div>
    </SrPanel>

    <SrPanel>
      <h2 class="panel__title">响应式 span</h2>
      <p class="panel__desc">
        小屏占满、中屏两列、大屏三列。拖动浏览器宽度即可看到实时切换 —— 全部由 CSS 媒体查询完成，JS
        不参与布局。
      </p>

      <sr-row :gutter="[16, 16]">
        <sr-col v-for="n in 6" :key="n" :span="{ xs: 24, sm: 12, lg: 8 }">
          <div class="cell">xs:24 / sm:12 / lg:8</div>
        </sr-col>
      </sr-row>
    </SrPanel>

    <SrPanel>
      <h2 class="panel__title">栅格间隔</h2>
      <p class="panel__desc">
        gutter 支持单值、[水平, 垂直]、以及按断点分档。水平间距由列的 padding 实现，行用负 margin
        抵消，因此首尾列与容器边缘严格对齐。
      </p>

      <div style="margin-bottom: 12px">
        <sr-row :gutter="0">
          <sr-col v-for="n in 4" :key="n" :span="6"><div class="cell">gutter 0</div></sr-col>
        </sr-row>
      </div>
      <div style="margin-bottom: 12px">
        <sr-row :gutter="24">
          <sr-col v-for="n in 4" :key="n" :span="6"><div class="cell">gutter 24</div></sr-col>
        </sr-row>
      </div>
      <div>
        <sr-row :gutter="{ xs: 8, md: [24, 24] }">
          <sr-col v-for="n in 4" :key="n" :span="6"><div class="cell">响应式 gutter</div></sr-col>
        </sr-row>
      </div>
    </SrPanel>

    <SrPanel>
      <h2 class="panel__title">偏移与位移</h2>
      <p class="panel__desc">
        offset 用 margin 占位（影响后续元素），push / pull 用相对位移（不影响文档流）。
      </p>

      <sr-row :gutter="12">
        <sr-col :span="6"><div class="cell">span 6</div></sr-col>
        <sr-col :span="6" :offset="6"><div class="cell">span 6 · offset 6</div></sr-col>
        <sr-col :span="6"><div class="cell">紧随其后</div></sr-col>
      </sr-row>

      <div style="margin-top: 12px">
        <sr-row :gutter="12">
          <sr-col :span="8"><div class="cell">span 8</div></sr-col>
          <sr-col :span="8" :push="8"><div class="cell">push 8（视觉右移）</div></sr-col>
        </sr-row>
      </div>
    </SrPanel>
  </div>
</template>
