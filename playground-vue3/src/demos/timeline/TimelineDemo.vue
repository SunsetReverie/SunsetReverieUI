<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrTag, SrTimeline, type SrTimelineItem } from '@sunset-reverie/ui'

defineOptions({ name: 'TimelineDemo' })

/** 基础节点 */
const basicItems: SrTimelineItem[] = [
  { content: '创建项目', timestamp: '2026-11-08 09:12' },
  { content: '配置 Token', timestamp: '2026-11-08 10:24' },
  { content: '接入组件库', timestamp: '2026-11-08 14:02' },
  { content: '上线测试环境', timestamp: '2026-11-08 16:30' },
]

/** 带类型的审批流 */
const approvalItems: SrTimelineItem[] = [
  { content: '提交申请 · 林深', timestamp: '11-08 10:24', type: 'primary' },
  { content: '初审通过 · 王敏', timestamp: '11-08 14:02', type: 'success' },
  { content: '复审中 · 待处理', timestamp: '11-08 16:30', type: 'warning' },
  { content: '放款', timestamp: '待处理', hollow: true },
]

/** 带图标的发布记录 */
const releaseItems: SrTimelineItem[] = [
  { content: 'v1.2.0 发布 · 新增 4 个组件', timestamp: '11-08', icon: 'lucide:check', type: 'success' },
  { content: 'v1.1.0 发布 · 浮层材质统一', timestamp: '11-05', icon: 'lucide:check', type: 'success' },
  { content: 'v1.0.0 发布 · 首个稳定版', timestamp: '11-01', icon: 'lucide:check', type: 'success' },
]

/** 倒序开关 */
const reversed = ref(false)

/** 活动日志 */
const logItems: SrTimelineItem[] = [
  { content: '提交了首个版本', timestamp: '2026-09-14' },
  { content: '补全单元测试，覆盖率 82%', timestamp: '2026-09-12' },
  { content: '依赖升级时发现一处不兼容，已回滚', timestamp: '2026-09-08' },
  { content: '创建仓库', timestamp: '2026-09-01' },
]

/** 错误示例 */
const errorItems: SrTimelineItem[] = [
  { content: '开始构建', timestamp: '09:00', type: 'success' },
  { content: '类型检查通过', timestamp: '09:02', type: 'success' },
  { content: '样式构建失败 · 变量未定义', timestamp: '09:05', type: 'error' },
  { content: '部署已跳过', timestamp: '—', hollow: true },
]
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础用法</h3>
      <SrTimeline :items="basicItems" />
      <p class="hint">默认时间戳在右侧；圆点是灰色实心</p>
    </section>

    <section>
      <h3>时间戳在左侧（mode = left）</h3>
      <SrTimeline :items="basicItems" mode="left" />
      <p class="hint">时间放左边、内容放右边，适合时间占位固定的日志列表</p>
    </section>

    <section>
      <h3>节点类型</h3>
      <SrTimeline :items="approvalItems" />
      <p class="hint">
        primary / success / warning / error 分别对应不同颜色；<code>hollow</code>
        是空心圆点，用来表示「还没到」
      </p>
    </section>

    <section>
      <h3>自定义图标</h3>
      <SrTimeline :items="releaseItems" />
      <p class="hint">传了 icon 就替换掉圆点，同时节点会撑大一点容纳图标</p>
    </section>

    <section>
      <h3>时间在上（mode = top）</h3>
      <SrTimeline :items="logItems" mode="top" />
      <p class="hint">时间挤在内容上方，仍保留圆点与连接线；适合时间需要强调、内容较长的场景</p>
    </section>

    <section>
      <h3>无节点（plain）</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">plain</span>
          <SrTimeline :items="logItems" plain />
        </div>
        <div class="card">
          <span class="tag">plain + reverse（最新在上）</span>
          <SrTimeline :items="logItems" plain reverse />
        </div>
      </div>
      <p class="hint">隐藏圆点与连接线，时间自动移到内容上方——活动日志、提交记录的常见排版</p>
    </section>

    <section>
      <h3>倒序（reverse）</h3>
      <div class="row" style="margin-bottom: 12px">
        <SrButton size="xs" :variant="reversed ? 'primary' : 'outline'" @click="reversed = !reversed">
          {{ reversed ? '已倒序' : '正序' }}
        </SrButton>
      </div>
      <SrTimeline :items="basicItems" :reverse="reversed" />
      <p class="hint">倒序把最新的一条放最上面，适合「操作日志」这类场景</p>
    </section>

    <section>
      <h3>错误节点</h3>
      <SrTimeline :items="errorItems" />
      <p class="hint">出错那一步用 error，后面的步骤用 hollow 表示「被跳过」</p>
    </section>

    <section>
      <h3>自定义内容（插槽）</h3>
      <SrTimeline
        :items="[
          { content: '部署成功', timestamp: '11-08 16:30', type: 'success' },
          { content: '回滚到上一版', timestamp: '11-08 17:10', type: 'warning' },
        ]"
      >
        <template #content="{ item }">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
            <span>{{ item.content }}</span>
            <SrTag :type="item.type === 'success' ? 'success' : 'warning'" size="sm">
              {{ item.timestamp }}
            </SrTag>
          </div>
        </template>
      </SrTimeline>
      <p class="hint">content 插槽能放标签、按钮，甚至另一个卡片</p>
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
  margin: 10px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 1.6;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.card {
  padding: 14px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.tag {
  display: block;
  margin-bottom: 10px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}
</style>
