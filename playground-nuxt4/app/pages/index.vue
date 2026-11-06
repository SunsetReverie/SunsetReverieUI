<script setup lang="ts">
import { SrButton, SrCol, SrIcon, SrRow, useSrBreakpoint, useSrTheme } from '@sunset-reverie/ui'

/**
 * SSR 阶段生成的标识
 * 该值随 payload 传给客户端，水合后应完全一致；若不一致会直接触发告警
 */
const ssrStamp = useState('sr-ssr-stamp', () => new Date().toISOString())

/** 水合告警（由 plugins/sr-theme.ts 收集） */
const hydrationWarnings = useState<string[]>('sr-hydration-warnings', () => [])

const { resolved, style, toggleTheme, toggleStyle } = useSrTheme()
const { current: breakpoint, width } = useSrBreakpoint()

/** 是否已完成客户端水合 */
const hydrated = ref(false)

onMounted(() => {
  hydrated.value = true

  // 调试便利：?srTheme=dark 写入偏好，下次访问即可验证「脚本从 localStorage 恢复主题」
  const route = useRoute()
  const preset = route.query.srTheme
  if (preset === 'light' || preset === 'dark') {
    window.localStorage.setItem('sr-theme', preset)
  }
})
</script>

<template>
  <div class="page">
    <header class="bar">
      <div class="brand">
        <span class="sun" />
        夕梦 UI · Nuxt 4 SSR
      </div>
      <div class="actions">
        <!--
          这三个值都不能在 SSR 阶段直接渲染：
          - breakpoint / width 依赖 window.innerWidth（SSR 时固定用 md 下界）
          - resolved / style 依赖 localStorage（SSR 时读不到用户偏好）
          直接输出会导致水合不匹配。统一在水合完成后才显示真实值 ——
          对应规划文档 5.3「三条铁律」第 1、2 条。
        -->
        <span class="pill">{{ hydrated ? `${breakpoint} · ${width}px` : '—' }}</span>
        <span class="pill">{{ hydrated ? resolved : '—' }}</span>
        <span class="pill">{{ hydrated ? style : '—' }}</span>
        <sr-button size="sm" variant="secondary" @click="toggleTheme">切主题</sr-button>
        <sr-button size="sm" variant="secondary" @click="toggleStyle">切风格</sr-button>
      </div>
    </header>

    <main class="body">
      <section class="panel">
        <h2>SSR / 水合状态</h2>
        <div class="kv">
          <span class="key">渲染阶段</span>
          <span class="val">{{ hydrated ? '已水合（客户端接管）' : '仅 SSR（服务端输出）' }}</span>
        </div>
        <div class="kv">
          <span class="key">SSR 时间戳</span>
          <span class="val">{{ ssrStamp }}</span>
        </div>
        <div class="kv">
          <span class="key">水合告警</span>
          <span class="val" :style="hydrationWarnings.length ? 'color: var(--sr-color-danger)' : ''">
            {{ hydrationWarnings.length ? `${hydrationWarnings.length} 条` : '无' }}
          </span>
        </div>
        <ul v-if="hydrationWarnings.length" class="warnings">
          <li v-for="(item, index) in hydrationWarnings" :key="index">{{ item }}</li>
        </ul>
      </section>

      <section class="panel">
        <h2>栅格</h2>
        <sr-row :gutter="[16, 16]">
          <sr-col v-for="n in 6" :key="n" :span="{ xs: 24, sm: 12, lg: 8 }">
            <div class="cell">卡片 {{ n }}</div>
          </sr-col>
        </sr-row>
      </section>

      <section class="panel">
        <h2>按钮与图标</h2>
        <div class="row">
          <sr-button variant="primary">主要按钮</sr-button>
          <sr-button variant="secondary">次要按钮</sr-button>
          <sr-button variant="outline" icon="lucide:check">带图标</sr-button>
          <sr-button variant="danger" :size="{ xs: 'sm', md: 'md' }">危险操作</sr-button>
        </div>
        <div class="row" style="margin-top: 14px">
          <sr-icon name="lucide:house" :size="22" />
          <sr-icon name="lucide:search" :size="22" />
          <sr-icon name="lucide:loader-circle" :size="22" spin />
          <sr-icon name="lucide:sun" :size="22" color="var(--sr-color-primary)" />
          <sr-icon name="lucide:moon-star" :size="22" />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--sr-color-bg-page);
  color: var(--sr-color-text);
  font-family: var(--sr-font-family-base);
}

.bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 20px;
  background: var(--sr-color-bg-container);
  border-bottom: 1px solid var(--sr-color-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.sun {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: linear-gradient(160deg, var(--sr-sunset-300), var(--sr-ember-500));
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-inline-start: auto;
}

.pill {
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid var(--sr-color-border);
  background: var(--sr-color-bg-sunken);
  font-family: var(--sr-font-family-mono);
  font-size: 12px;
  color: var(--sr-color-text-secondary);
}

.body {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.panel {
  background: var(--sr-color-bg-container);
  border: 1px solid var(--sr-color-border);
  border-radius: var(--sr-radius-base);
  box-shadow: var(--sr-shadow-sm);
  padding: 20px;
  margin-bottom: 16px;
}

h2 {
  margin: 0 0 12px;
  font-size: var(--sr-font-size-md);
  font-weight: 600;
}

.kv {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px dashed var(--sr-color-border-subtle);
  font-size: var(--sr-font-size-sm);
}

.kv:last-child {
  border-bottom: 0;
}

.key {
  color: var(--sr-color-text-secondary);
  font-family: var(--sr-font-family-mono);
  font-size: 12px;
}

.val {
  font-family: var(--sr-font-family-mono);
  word-break: break-all;
}

.warnings {
  margin: 10px 0 0;
  padding-left: 18px;
  color: var(--sr-color-danger);
  font-size: 12px;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-radius: var(--sr-radius-sm);
  background: var(--sr-color-primary-alpha-12);
  border: 1px dashed var(--sr-color-primary-alpha-25);
  color: var(--sr-color-primary);
  font-family: var(--sr-font-family-mono);
  font-size: 12px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
