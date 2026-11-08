<script setup lang="ts">
import { computed, ref } from 'vue'
import { SrButton, SrSteps, SrSwitch, type SrStepItem } from '@sunset-reverie/ui'

defineOptions({ name: 'StepsDemo' })

/** 基础步骤 */
const basicSteps: SrStepItem[] = [
  { title: '填写信息', description: '基础资料与联系方式' },
  { title: '上传材料', description: '身份证、学历证明' },
  { title: '等待审核', description: '预计 1 个工作日' },
  { title: '完成', description: '可下载回执' },
]

/** 当前步 */
const current = ref(1)

/** 出错状态 */
const isError = ref(false)

/** 可点击的当前步 */
const clickableCurrent = ref(0)

/** 简洁模式 */
const simpleCurrent = ref(2)

/** 带图标的步骤 */
const iconSteps: SrStepItem[] = [
  { title: '购物车', icon: 'lucide:box' },
  { title: '地址', description: '已填写' },
  { title: '支付', description: '等待付款' },
]

/** 纵向步骤 */
const verticalSteps: SrStepItem[] = [
  { title: '提交申请', description: '11-08 10:24 已提交' },
  { title: '初审通过', description: '11-08 14:02 由林深审批' },
  { title: '复审中', description: '预计今天完成' },
  { title: '放款', description: '待处理' },
]

/** 当前状态文案 */
const statusText = computed(() => (isError.value ? 'error' : 'process'))

/**
 * 下一步
 */
function next(): void {
  if (current.value < basicSteps.length - 1) current.value += 1
}

/**
 * 上一步
 */
function prev(): void {
  if (current.value > 0) current.value -= 1
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础用法</h3>
      <SrSteps :items="basicSteps" :current="current" :status="statusText" />
      <div class="row" style="margin-top: 14px">
        <SrButton size="sm" variant="outline" :disabled="current === 0" @click="prev">上一步</SrButton>
        <SrButton size="sm" variant="primary" :disabled="current === basicSteps.length - 1" @click="next">
          下一步
        </SrButton>
        <SrSwitch v-model="isError" />
        <span class="hint" style="margin: 0">{{ isError ? '当前步出错' : '正常推进' }}</span>
      </div>
      <p class="hint">已完成显示对勾，当前步高亮，后续显示序号</p>
    </section>

    <section>
      <h3>简洁模式（simple）</h3>
      <div class="stack">
        <SrSteps :items="basicSteps" :current="simpleCurrent" simple />
      </div>
      <div class="row" style="margin-top: 12px">
        <SrButton size="xs" variant="outline" @click="simpleCurrent = Math.max(0, simpleCurrent - 1)"
          >上一步</SrButton
        >
        <SrButton size="xs" variant="outline" @click="simpleCurrent = Math.min(3, simpleCurrent + 1)"
          >下一步</SrButton
        >
      </div>
      <p class="hint">去掉描述、圆点缩小，适合塞在卡片标题栏或工具栏里</p>
    </section>

    <section>
      <h3>可点击切换（clickable）</h3>
      <SrSteps
        :items="basicSteps"
        :current="clickableCurrent"
        clickable
        @change="clickableCurrent = $event"
      />
      <p class="hint">点任意一步直接跳过去，当前步点自己无效；一般配在「已填过的步骤可以回去改」的流程里</p>
    </section>

    <section>
      <h3>标题并排（labelPlacement = vertical）</h3>
      <SrSteps :items="basicSteps" :current="1" label-placement="vertical" />
      <p class="hint">标题与描述上下排列、和圆点同一行，比默认布局更省纵向空间</p>
    </section>

    <section>
      <h3>自定义图标</h3>
      <SrSteps :items="iconSteps" :current="1" />
      <p class="hint">传了 icon 就用它，不再显示序号或状态图标</p>
    </section>

    <section>
      <h3>纵向（direction = vertical）</h3>
      <div class="grid">
        <div class="card">
          <SrSteps :items="verticalSteps" :current="2" direction="vertical" />
        </div>
        <div class="card">
          <span class="tag">虚线（lineStyle = dashed）</span>
          <SrSteps :items="verticalSteps.slice(0, 3)" :current="1" direction="vertical" line-style="dashed" />
        </div>
      </div>
      <p class="hint">纵向适合步骤描述较长、或者放在侧栏里的场景；虚线让「还没走到」的部分更明显</p>
    </section>

    <section>
      <h3>出错状态</h3>
      <div class="stack">
        <SrSteps :items="basicSteps" :current="2" status="error" />
        <SrSteps :items="basicSteps" :current="1" status="error" label-placement="vertical" />
      </div>
      <p class="hint">出错的那一步显示叉号并变红，后面的步骤停在未开始</p>
    </section>

    <section>
      <h3>单项指定状态</h3>
      <SrSteps
        :items="[
          { title: '读取配置', status: 'finish' },
          { title: '连接数据库', status: 'error' },
          { title: '同步数据' },
          { title: '清理临时文件' },
        ]"
        :current="2"
      />
      <p class="hint">items 里给某一项单独的 status 会覆盖按位置推导的结果</p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="stack">
        <div v-for="s in ['small', 'md', 'large']" :key="s" class="size-row">
          <span class="size-row__label">{{ s }}</span>
          <SrSteps :items="basicSteps.slice(0, 3)" :current="1" :size="s as 'small'" />
        </div>
      </div>
    </section>

    <section>
      <h3>组合：分步表单</h3>
      <div class="card">
        <SrSteps :items="basicSteps" :current="current" simple style="margin-bottom: 18px" />
        <p class="hint" style="margin: 0 0 12px">
          当前：<strong>{{ basicSteps[current]?.title }}</strong> —— {{ basicSteps[current]?.description }}
        </p>
        <div class="row">
          <SrButton size="sm" variant="outline" :disabled="current === 0" @click="prev">上一步</SrButton>
          <SrButton size="sm" variant="primary" :disabled="current === basicSteps.length - 1" @click="next">
            下一步
          </SrButton>
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

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.card {
  padding: 14px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.tag {
  display: block;
  margin-bottom: 12px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.size-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.size-row__label {
  flex: 0 0 48px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 22px;
}
</style>
