<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrLoading, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'LoadingDemo' })

/** 包裹式 */
const wrapping = ref(false)

/** 全屏 */
const fullscreen = ref(false)

/** 延迟演示 */
const delayed = ref(false)

/** 无遮罩 */
const bare = ref(false)

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
      <h3>基础</h3>
      <div class="row">
        <SrLoading text="加载中…" />
        <SrLoading />
        <SrTag size="sm">独立使用时不需要包裹内容</SrTag>
      </div>
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
