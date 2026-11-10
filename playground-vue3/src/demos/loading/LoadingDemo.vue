<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrLoading, SrSegmented, SrSpinner, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'LoadingDemo' })

/** 包裹式 */
const wrapping = ref(false)

/** 全屏 */
const fullscreen = ref(false)

/** 延迟演示 */
const delayed = ref(false)

/** 无遮罩 */
const bare = ref(false)

/** 当前动画样式 */
const variant = ref<'ring' | 'dots' | 'pulse' | 'bars' | 'orbit' | 'gradient'>('ring')

/** 同色系：由浅到深，最协调 */
const warmColors = ['#ffd8a8', '#ffc078', '#ffa94d', '#ff922b']

/** 四色：区分明显 */
const vividColors = ['#fca5a5', '#fcd34d', '#86efac', '#93c5fd']

/** 动画样式选项 */
const variantOptions = [
  { label: '圆环', value: 'ring' },
  { label: '三点', value: 'dots' },
  { label: '扩散', value: 'pulse' },
  { label: '竖条', value: 'bars' },
  { label: '绕轨', value: 'orbit' },
  { label: '渐变', value: 'gradient' },
]

/** 六种动画的展示卡：大尺寸才看得清每种动效的差别 */
const variantCards = [
  { key: 'ring', name: '圆环旋转', desc: '最通用，语义最明确' },
  { key: 'gradient', name: '渐变环', desc: '有品牌感，适合首屏' },
  { key: 'dots', name: '三点跳动', desc: '轻快，适合按钮内' },
  { key: 'bars', name: '柱状波动', desc: '横向展开，适合卡片占位' },
  { key: 'pulse', name: '同心圆扩散', desc: '最安静，不抢注意力' },
  { key: 'orbit', name: '小球绕轨', desc: '动感最强，适合首屏' },
] as const

/**
 * 模拟请求
 * @param assign 开关
 * @param ms 耗时
 */
function simulate(assign: (v: boolean) => void, ms = 1200): void {
  assign(true)
  setTimeout(() => assign(false), ms)
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>六种动画</h3>
      <div class="variant-grid">
        <div v-for="card in variantCards" :key="card.key" class="variant-card">
          <div class="variant-card__stage">
            <SrSpinner :size="56" :variant="card.key" />
          </div>
          <p class="variant-card__title">{{ card.name }}</p>
          <SrTag size="sm">{{ card.key }}</SrTag>
          <p class="variant-card__desc">{{ card.desc }}</p>
        </div>
      </div>
      <p class="hint">
        统一放大到 56px 才看得出每种动效的差别：六种全部由 CSS 绘制，不引图标或图片；
        内部元素全用百分比，所以同一套代码在 12px 和 56px 下都不会走形。
      </p>
    </section>

    <section>
      <h3>基础</h3>
      <div class="row">
        <SrLoading size="lg" text="加载中…" />
        <SrLoading size="lg" />
        <SrTag size="sm">独立使用时不需要包裹内容</SrTag>
      </div>
    </section>

    <section>
      <h3>在 SrLoading 里切换 variant</h3>
      <div class="row" style="margin-bottom: 14px">
        <SrSegmented v-model="variant" :options="variantOptions" size="sm" />
      </div>
      <div class="row">
        <SrLoading size="lg" :variant="variant" text="加载中…" />
        <div class="wrap-box">
          <SrLoading :loading="true" :variant="variant" text="提交中…">
            <div class="content content--slim">
              <p class="content__title">被遮住的内容</p>
            </div>
          </SrLoading>
        </div>
      </div>
      <p class="hint">
        上面那排大图由 <code>SrSpinner</code> 直接渲染（尺寸可以传像素值）；<code>SrLoading</code> 的
        <code>variant</code> 用的是同一套动画，只是外面多了遮罩、文案与形态。
      </p>
    </section>

    <section>
      <h3>多色（colors）</h3>
      <div class="grid">
        <div class="color-card">
          <div class="color-card__stage">
            <SrSpinner :size="40" variant="dots" :colors="warmColors" />
          </div>
          <p class="color-card__name">同色系（3 点）</p>
          <p class="color-card__desc">由浅到深，最协调</p>
        </div>
        <div class="color-card">
          <div class="color-card__stage">
            <SrSpinner :size="40" variant="bars" :colors="warmColors" />
          </div>
          <p class="color-card__name">同色系（4 条）</p>
          <p class="color-card__desc">像一组并列的进度</p>
        </div>
        <div class="color-card">
          <div class="color-card__stage">
            <SrSpinner :size="40" variant="dots" :colors="vividColors" />
          </div>
          <p class="color-card__name">四色（3 点）</p>
          <p class="color-card__desc">取前 3 个，区分明显</p>
        </div>
        <div class="color-card">
          <div class="color-card__stage">
            <SrSpinner :size="40" variant="bars" :colors="vividColors" />
          </div>
          <p class="color-card__name">四色（4 条）</p>
          <p class="color-card__desc">适合「多个任务并行」</p>
        </div>
        <div class="color-card">
          <div class="color-card__stage">
            <SrSpinner :size="40" variant="pulse" :colors="['#fca5a5', '#93c5fd']" />
          </div>
          <p class="color-card__name">双色（2 圈）</p>
          <p class="color-card__desc">两圈不同色，层次更清楚</p>
        </div>
        <div class="color-card">
          <div class="color-card__stage">
            <SrSpinner :size="40" variant="bars" />
          </div>
          <p class="color-card__name">不传（对照）</p>
          <p class="color-card__desc">全部用主色单色</p>
        </div>
      </div>
      <p class="hint">
        放大到 40px 才看得清配色：数量不足会循环取用；<code>ring</code> / <code>gradient</code> /
        <code>orbit</code> 只有一个元素，仍是单色。<code>colors</code> 在 <code>SrSpinner</code> 与
        <code>SrLoading</code> 上是同一个 prop，后者原样传给前者。
      </p>
    </section>

    <section>
      <h3>包裹内容</h3>
      <div class="row" style="align-items: flex-start">
        <div class="wrap-box">
          <SrLoading :loading="wrapping" text="提交中…">
            <div class="content">
              <p class="content__title">订单详情</p>
              <p class="content__line">这是一块会被遮住的内容，loading 结束后恢复交互。</p>
            </div>
          </SrLoading>
        </div>
        <SrButton size="sm" variant="primary" @click="simulate((v) => (wrapping = v))">
          触发 1.2 秒
        </SrButton>
      </div>
      <p class="hint">遮罩是半透明 + 轻模糊，能看出下面还有内容，只是暂时不能点</p>
    </section>

    <section>
      <h3>全屏</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="simulate((v) => (fullscreen = v))">全屏加载</SrButton>
        <span class="hint" style="margin: 0">全屏时锁定页面滚动</span>
      </div>
      <SrLoading :loading="fullscreen" fullscreen text="正在保存…" />
    </section>

    <section>
      <h3>延迟显示（delay）</h3>
      <div class="row">
        <div class="wrap-box">
          <SrLoading :loading="delayed" :delay="400" text="延迟 400ms 才出现">
            <div class="content">
              <p class="content__title">快请求不闪</p>
              <p class="content__line">接口 200ms 返回的话，loading 根本不会出现。</p>
            </div>
          </SrLoading>
        </div>
        <div class="stack-btns">
          <SrButton size="sm" variant="outline" @click="simulate((v) => (delayed = v), 200)">
            200ms 请求（不闪）
          </SrButton>
          <SrButton size="sm" variant="outline" @click="simulate((v) => (delayed = v), 1200)">
            1.2s 请求（会闪）
          </SrButton>
        </div>
      </div>
      <p class="hint">delay 是最实用的参数：短请求完全不闪，长请求才显示。关闭时立即生效，不会等延迟</p>
    </section>

    <section>
      <h3>无遮罩</h3>
      <div class="row">
        <div class="wrap-box">
          <SrLoading :loading="bare" :mask="false" text="后台同步中">
            <div class="content">
              <p class="content__title">不影响操作</p>
              <p class="content__line">没有遮罩时可以继续点下面的东西。</p>
            </div>
          </SrLoading>
        </div>
        <SrButton size="sm" variant="outline" @click="simulate((v) => (bare = v))">切换</SrButton>
      </div>
      <p class="hint">mask=false 只剩转圈和文字，适合「后台刷新」这类不阻塞的操作</p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row">
        <div v-for="s in ['sm', 'md', 'lg']" :key="s" class="size-item">
          <SrLoading :size="s as 'md'" />
          <span class="label">{{ s }}</span>
        </div>
      </div>
    </section>

    <section>
      <h3>和 Spinner 的分工</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">SrSpinner</span>
          <p class="hint" style="margin: 0">只有一个转圈，放在按钮里、表格里，或任何需要「局部等待」的位置</p>
        </div>
        <div class="card">
          <span class="tag">SrLoading</span>
          <p class="hint" style="margin: 0">转圈 + 遮罩 + 文案，用于「整块区域等待」或全屏</p>
        </div>
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

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.wrap-box {
  width: 300px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  overflow: hidden;
}

.content {
  padding: 16px;
}

/* 遮罩会盖在这上面，内容保持单行，避免和提示文字叠得看不清 */
.content--slim {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96px;
}

.content__title {
  margin: 0;
  color: var(--sr-color-text);
  font-size: 13px;
  font-weight: 600;
}

.content__line {
  margin: 6px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 1.6;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.color-card {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 3px;
  padding: 14px 10px 10px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.color-card__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72px;
}

/* 六种动画放大展示：舞台足够高，动画不会被卡片挤成一团 */
.variant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
}

.variant-card {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 16px 12px 14px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-lg);
  background: var(--sr-color-bg-container);
  text-align: center;
}

.variant-card__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 96px;
}

/* 扩散圈与绕轨默认 1.5px 描边，放大到 56px 后细得几乎看不见。
   子组件根节点带父级 scope 标记，所以这里不需要 :deep()。 */
.variant-card__stage .sr-spinner {
  --sr-spinner-stroke: 3px;
}

.variant-card__title {
  margin: 4px 0 0;
  color: var(--sr-color-text);
  font-size: 13px;
  font-weight: var(--sr-font-weight-semibold);
}

.variant-card__desc {
  margin: 2px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 11.5px;
  line-height: 1.5;
}

.color-card__name {
  margin: 2px 0 0;
  color: var(--sr-color-text);
  font-size: 12.5px;
  font-weight: var(--sr-font-weight-medium);
}

.color-card__desc {
  margin: 0;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
  text-align: center;
}

.stack-btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.size-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px;
  border: 1px dashed var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-sm);
}

.label {
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.card {
  padding: 14px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.tag {
  display: block;
  margin-bottom: 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}
</style>
