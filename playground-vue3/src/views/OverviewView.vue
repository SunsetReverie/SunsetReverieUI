<script setup lang="ts">
import { computed } from 'vue'

import { SrCol, SrIcon, SrRow, SrPanel } from '@sunset-reverie/ui'

import { demoEntries } from '../demos/registry'

defineOptions({ name: 'OverviewView' })

/** 等分示例：24 栅格的常见切分方式 */
const equalSplits = [
  { span: 12, label: '12 / 24' },
  { span: 8, label: '8 / 24' },
  { span: 6, label: '6 / 24' },
  { span: 4, label: '4 / 24' },
]

/** 卡片里的六个卖点 */
interface IntroPoint {
  /** Lucide 图标名 */
  icon: string
  /** 一句话标题 */
  title: string
  /** 展开说明，写机制不写形容词 */
  text: string
}

/**
 * 组件库卖点
 *
 * 每一条都对应仓库里可验证的机制（令牌生成脚本、lint 守卫、SSR 冒烟），
 * 不写「高性能」「易用」这类无法证伪的形容词。
 */
const introPoints: IntroPoint[] = [
  {
    icon: 'lucide:layers',
    title: '三层 Token',
    text: 'L1 原始色板 → L2 语义映射 → L3 组件级，一个 TypeScript 文件生成 Less 变量、TS 常量与 CSS 变量，改一处全站生效。',
  },
  {
    icon: 'lucide:sparkles',
    title: '玻璃 / 扁平双风格',
    text: '两套质感共享变量名、只覆写值，组件样式只写一次。没有 if 分支，也就不存在「另一个风格忘记维护」的角落。',
  },
  {
    icon: 'lucide:zap',
    title: '首帧即定稿',
    text: '根属性在首次绘制前由内联脚本写入，服务端输出确定标记，Nuxt 下切换明暗不闪白、不重排。',
  },
  {
    icon: 'lucide:boxes',
    title: '中后台主干不拼装',
    text: '从表单、表格固定列与分页，到侧栏导航、四种外观的标签页、拖拽排序，主干能力自带而不依赖第三方拼装。',
  },
  {
    icon: 'lucide:shield-check',
    title: '抗回归的守卫',
    text: '单测 + SSR 冒烟 + Nuxt 水合 e2e 三层防线，断言水合告警为 0；新组件漏测会被 lint 直接拦下。',
  },
  {
    icon: 'lucide:braces',
    title: '类型不掉队',
    text: 'props 全部由 TS 推导，插槽用 defineSlots 声明，Volar 里模板内就有补全与类型报错。',
  },
]

/**
 * 关键数字
 *
 * 组件数跟着演示注册表走（新增组件不必回来改文案），其余三项是机制常量，
 * 不会随版本漂移。
 */
const introStats = computed(() => [
  { value: String(demoEntries.length), label: '个组件' },
  { value: '3', label: '层 Token' },
  { value: '2', label: '套质感' },
  { value: '3', label: '档动效' },
])
</script>

<template>
  <div>
    <!-- 开场面板：先说清这个库是谁、解决什么问题，再往下才是栅格演算 -->
    <SrPanel flush class="intro">
      <div class="intro__inner">
        <div class="intro__glow" aria-hidden="true"></div>

        <div class="intro__head">
          <span class="intro__eyebrow">
            <SrIcon name="lucide:moon-star" :size="13" />
            夕梦 UI · SunsetReverie-UI
          </span>
          <h1 class="intro__title">为「需要长期维护的中后台」而设计</h1>
          <p class="intro__text">
            Vue 3 / Nuxt 4 组件库，视觉取自黄昏：暖橙、霞紫、暮蓝三段过渡。明暗、质感、动效全部由 CSS
            变量驱动，组件里没有写死的颜色与时长 —— 换风格是换一组变量，不是改一版组件。
          </p>
        </div>

        <ul class="intro__stats">
          <li v-for="stat in introStats" :key="stat.label" class="intro__stat">
            <b>{{ stat.value }}</b>
            <span>{{ stat.label }}</span>
          </li>
        </ul>

        <ul class="intro__points">
          <li v-for="point in introPoints" :key="point.title" class="intro__point">
            <span class="intro__icon">
              <SrIcon :name="point.icon" :size="15" />
            </span>
            <div class="intro__point-body">
              <h3 class="intro__point-title">{{ point.title }}</h3>
              <p class="intro__point-text">{{ point.text }}</p>
            </div>
          </li>
        </ul>

        <p class="intro__hint">
          右上「外观设置」里可以当场切换明暗、品牌色、玻璃 / 扁平与动效档位，本页会实时跟着变。
        </p>
      </div>
    </SrPanel>

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

<style scoped lang="less">
// 开场面板：一张玻璃卡，右上一团暖光先把「黄昏」立住。
// 与下方的栅格演示共用同一套变量，切到扁平时光斑减弱、模糊归零，不需要分支。
.intro {
  position: relative;
  overflow: hidden;
  // isolate：让负层级的光斑只落在本卡背景之上、文字之下
  isolation: isolate;
  border: var(--sr-glass-border-width) solid var(--sr-glass-border-color);
  border-radius: var(--sr-radius-lg);
  background: color-mix(in srgb, var(--sr-color-bg-container) 66%, transparent);
  box-shadow: var(--sr-shadow-md), var(--sr-glass-highlight);
  // 页面内的大容器走常规档（16px），不是浮层那档强模糊
  backdrop-filter: var(--sr-glass-filter);
  -webkit-backdrop-filter: var(--sr-glass-filter);

  // SrPanel 的 body 自带内边距，会与下面 __inner 的留白叠加
  :deep(.sr-panel__body) {
    padding: 0;
  }

  &__inner {
    position: relative;
    padding: var(--sr-space-6) var(--sr-space-6) var(--sr-space-5);
  }

  // 光斑压在文字下层：负 z-index 在有 isolation 的父级里不会跑到父背景后面。
  // 铺满整卡而不是溢出摆放 —— 溢出时渐变的椭圆半径会超出元素边界，
  // 在边缘处 alpha 不为零，就会看到一条竖直的硬切边
  &__glow {
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(ellipse 62% 58% at 84% 6%, var(--sr-color-primary-alpha-25), transparent 70%),
      radial-gradient(ellipse 48% 46% at 98% 76%, var(--sr-color-primary-alpha-12), transparent 74%);
    pointer-events: none;
  }

  &__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px 3px 8px;
    border: 1px solid var(--sr-color-primary-alpha-25);
    border-radius: var(--sr-radius-full);
    background: var(--sr-color-primary-alpha-08);
    color: var(--sr-color-primary-text);
    font-size: 11.5px;
    letter-spacing: 0.03em;
  }

  &__title {
    margin: var(--sr-space-4) 0 10px;
    color: var(--sr-color-text);
    font-size: clamp(22px, 2.4vw, var(--sr-font-size-2xl));
    font-weight: var(--sr-font-weight-semibold);
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  &__text {
    max-width: 640px;
    margin: 0;
    color: var(--sr-color-text-secondary);
    font-size: 13px;
    line-height: 1.78;
  }

  // 数字条：用等宽字体，读起来像仪表而不是文案
  &__stats {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin: var(--sr-space-5) 0 0;
    padding: 0;
    list-style: none;
  }

  &__stat {
    display: flex;
    align-items: baseline;
    gap: 5px;
    padding: 0 var(--sr-space-4);

    &:first-child {
      padding-left: 0;
    }

    & + & {
      border-left: 1px solid var(--sr-color-border-subtle);
    }

    b {
      color: var(--sr-color-primary-text);
      font-family: var(--sr-font-family-mono);
      font-size: 21px;
      font-weight: var(--sr-font-weight-semibold);
      font-variant-numeric: tabular-nums;
    }

    span {
      color: var(--sr-color-text-tertiary);
      font-size: 11.5px;
    }
  }

  // 卖点网格：窄屏一列、宽屏两列。下限 360px 是刻意的 —— 再小就会挤成三列，
  // 每条说明要折成四五行，读起来像墓碑
  &__points {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr));
    gap: var(--sr-space-3);
    margin: var(--sr-space-5) 0 0;
    padding: 0;
    list-style: none;
  }

  &__point {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid var(--sr-color-border-subtle);
    border-radius: var(--sr-radius-base);
    // 比卡片更淡一层：卖点条目要弱化到「注释」的位置，不抢标题
    background: color-mix(in srgb, var(--sr-color-bg-container) 42%, transparent);
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 26px;
    height: 26px;
    border-radius: var(--sr-radius-sm);
    background: var(--sr-color-primary-alpha-08);
    color: var(--sr-color-primary);
  }

  &__point-body {
    min-width: 0;
  }

  &__point-title {
    margin: 0 0 3px;
    color: var(--sr-color-text);
    font-size: 13px;
    font-weight: var(--sr-font-weight-semibold);
  }

  &__point-text {
    margin: 0;
    color: var(--sr-color-text-tertiary);
    font-size: 12px;
    line-height: 1.68;
  }

  &__hint {
    margin: var(--sr-space-5) 0 0;
    padding-top: 12px;
    border-top: 1px dashed var(--sr-color-border-subtle);
    color: var(--sr-color-text-tertiary);
    font-size: 12px;
  }
}

// 扁平风格下收一收：光斑减弱（没有模糊托底时大块渐变会显脏），
// 表面改成实色 —— 半透明底在扁平里会透出页面光晕，与「实色」的取向相悖
html[data-sr-style='flat'] .intro {
  background: var(--sr-color-bg-container);
}

html[data-sr-style='flat'] .intro__glow {
  opacity: 0.45;
}

html[data-sr-style='flat'] .intro__point {
  background: var(--sr-color-bg-elevated);
}
</style>
