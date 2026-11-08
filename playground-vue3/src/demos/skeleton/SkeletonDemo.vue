<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { SrButton, SrSkeleton, SrSwitch, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'SkeletonDemo' })

/** 模拟加载中 */
const loading = ref(true)

/** 包内容的场景 */
const dataLoading = ref(true)

/** 模拟真实数据 */
const article = ref<{ title: string; author: string; body: string } | null>(null)

/**
 * 模拟请求：延迟后填充数据
 * @param delay 延迟毫秒
 */
function simulate(delay = 1200): void {
  dataLoading.value = true
  article.value = null

  window.setTimeout(() => {
    article.value = {
      title: '用三层 Token 撑起两套视觉',
      author: '林深',
      body: '设计系统不是把颜色写进变量就叫完成，关键是同一份语义在不同质感下都能成立。',
    }
    dataLoading.value = false
  }, delay)
}

simulate()

onBeforeUnmount(() => {
  article.value = null
})
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础形态</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">默认（标题 + 3 行）</span>
          <SrSkeleton />
        </div>
        <div class="card">
          <span class="tag">带头像</span>
          <SrSkeleton avatar round :rows="2" />
        </div>
        <div class="card">
          <span class="tag">只要标题</span>
          <SrSkeleton :rows="0" />
        </div>
        <div class="card">
          <span class="tag">多行段落（rows = 6）</span>
          <SrSkeleton :rows="6" />
        </div>
      </div>
    </section>

    <section>
      <h3>动画开关</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">animated = true（默认，扫光）</span>
          <SrSkeleton :rows="2" />
        </div>
        <div class="card">
          <span class="tag">animated = false（静态灰块）</span>
          <SrSkeleton :rows="2" :animated="false" />
        </div>
      </div>
      <p class="hint">系统开启「减弱动态效果」时会自动关掉动画，不用手动传 <code>animated</code></p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="stack">
        <div v-for="s in ['xs', 'sm', 'lg']" :key="s" class="size-row">
          <span class="size-row__label">{{ s }}</span>
          <SrSkeleton :size="s as 'sm'" avatar :rows="2" />
        </div>
      </div>
    </section>

    <section>
      <h3>包裹真实内容</h3>
      <div class="row" style="margin-bottom: 12px">
        <SrSwitch v-model="loading" />
        <span class="hint" style="margin: 0">{{ loading ? '加载中' : '已加载' }}</span>
        <SrButton size="xs" variant="outline" @click="simulate(800)">重新加载</SrButton>
      </div>

      <div class="card article">
        <SrSkeleton :loading="dataLoading" avatar :rows="3">
          <div v-if="article">
            <div class="article__head">
              <div class="article__avatar">林</div>
              <div>
                <p class="article__title">{{ article.title }}</p>
                <p class="article__author">{{ article.author }} · 11-08</p>
              </div>
            </div>
            <p class="article__body">{{ article.body }}</p>
          </div>
        </SrSkeleton>
      </div>
      <p class="hint">
        <code>loading</code> 为 true 时渲染骨架，为 false 时渲染插槽内容。上面这块每点一次会重新走一遍加载
      </p>
    </section>

    <section>
      <h3>常见组合</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">列表项（循环 3 次）</span>
          <div class="stack" style="gap: 14px">
            <SrSkeleton v-for="i in 3" :key="i" avatar round :rows="1" :size="'sm'" />
          </div>
        </div>
        <div class="card">
          <span class="tag">表格加载态</span>
          <div class="stack" style="gap: 10px">
            <SrSkeleton :rows="1" :title="false" :animated="true" />
            <SrSkeleton :rows="1" :title="false" />
            <SrSkeleton :rows="1" :title="false" />
          </div>
          <p class="hint" style="margin-top: 10px">关掉 title 之后就是纯粹的横条，适合放在表格行位置</p>
        </div>
      </div>
    </section>

    <section>
      <h3>配合 Tag 提示</h3>
      <div class="card">
        <div class="row" style="margin-bottom: 10px">
          <SrTag type="info" size="sm">加载中会占住原位置</SrTag>
          <SrTag type="success" size="sm">内容出现时不会跳变</SrTag>
        </div>
        <SrSkeleton avatar :rows="2" />
        <p class="hint">骨架的价值在于「提前占住布局」，比 Spinner 好的一点是内容出现时不会整块位移</p>
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

.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 1.6;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
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
  gap: 14px;
}

.size-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.size-row__label {
  flex: 0 0 64px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 20px;
}

.card {
  padding: 12px;
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

.article {
  max-width: 520px;
}

.article__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.article__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--sr-color-primary-alpha-12);
  color: var(--sr-color-primary-text);
  font-size: 14px;
  font-weight: 600;
}

.article__title {
  margin: 0;
  color: var(--sr-color-text);
  font-size: 14px;
  font-weight: 600;
}

.article__author {
  margin: 2px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.article__body {
  margin: 12px 0 0;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  line-height: 1.75;
}
</style>
