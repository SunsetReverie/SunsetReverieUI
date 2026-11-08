<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrStatistic } from '@sunset-reverie/ui'

defineOptions({ name: 'StatisticDemo' })

/** 可变的数值 */
const users = ref(1280)
const revenue = ref(86420.5)
const rate = ref(0.856)

/** 加载状态 */
const loading = ref(false)

/**
 * 模拟刷新
 */
function refresh(): void {
  loading.value = true
  setTimeout(() => {
    users.value = 1000 + Math.floor(Math.random() * 5000)
    revenue.value = Math.round(Math.random() * 200000 * 100) / 100
    rate.value = Math.round(Math.random() * 1000) / 1000
    loading.value = false
  }, 900)
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <SrStatistic title="总用户数" :value="users" />
      <p class="hint">整数默认加千分位；数值用等宽数字，刷新时宽度不跳</p>
    </section>

    <section>
      <h3>前缀与后缀</h3>
      <div class="row">
        <SrStatistic title="本月收入" :value="revenue" :precision="2" prefix="¥" />
        <SrStatistic
          title="转化率"
          :value="rate"
          :precision="1"
          suffix="%"
          :formatter="(v: number) => (v * 100).toFixed(1)"
        />
        <SrStatistic title="平均时长" :value="128" suffix="秒" />
      </div>
      <p class="hint">传 formatter 时完全接管显示，precision 与 separator 不再生效</p>
    </section>

    <section>
      <h3>精度</h3>
      <div class="row">
        <SrStatistic title="precision 0" :value="3.7" :precision="0" />
        <SrStatistic title="precision 2" :value="3.7" :precision="2" />
        <SrStatistic title="precision 4" :value="3.7" :precision="4" />
      </div>
      <p class="hint">不足补零、超出四舍五入</p>
    </section>

    <section>
      <h3>千分位</h3>
      <div class="row">
        <SrStatistic title="默认逗号" :value="1234567" />
        <SrStatistic title="空格分隔" :value="1234567" separator=" " />
        <SrStatistic title="关闭分组" :value="1234567" separator="" />
      </div>
      <p class="hint">separator 传空字符串关闭分组；负数同样能正确分组</p>
    </section>

    <section>
      <h3>数值颜色</h3>
      <div class="row">
        <SrStatistic title="同比增长" :value="12.4" :precision="1" suffix="%" value-color="#1f7a4d" />
        <SrStatistic title="同比下降" :value="-8.2" :precision="1" suffix="%" value-color="#d64545" />
      </div>
      <p class="hint">valueColor 接受任意 CSS 颜色</p>
    </section>

    <section>
      <h3>加载中</h3>
      <div class="row" style="align-items: flex-end">
        <SrStatistic title="总用户数" :value="users" :loading="loading" />
        <SrStatistic title="本月收入" :value="revenue" :precision="2" prefix="¥" :loading="loading" />
        <SrButton size="sm" variant="outline" :disabled="loading" @click="refresh">刷新数据</SrButton>
      </div>
      <p class="hint">loading 时显示占位条，不显示数字，避免「0」误导</p>
    </section>

    <section>
      <h3>实际场景：数据概览卡片</h3>
      <div class="grid">
        <div class="card">
          <SrStatistic title="今日访问" :value="12846" :loading="loading" />
        </div>
        <div class="card">
          <SrStatistic title="订单数" :value="864" :loading="loading" />
        </div>
        <div class="card">
          <SrStatistic title="成交额" :value="126800.4" :precision="2" prefix="¥" :loading="loading" />
        </div>
        <div class="card">
          <SrStatistic
            title="退款率"
            :value="0.032"
            :precision="1"
            suffix="%"
            :formatter="(v: number) => (v * 100).toFixed(1)"
            :loading="loading"
          />
        </div>
      </div>
      <p class="hint">四张卡片共用同一个 loading，刷新时一起显示占位</p>
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
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 28px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.card {
  padding: 16px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}
</style>
