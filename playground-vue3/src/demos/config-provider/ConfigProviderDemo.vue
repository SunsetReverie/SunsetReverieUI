<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrConfigProvider, SrInput, SrSelect, SrSwitch } from '@sunset-reverie/ui'

defineOptions({ name: 'ConfigProviderDemo' })

const name = ref('')
const role = ref('')
const on = ref(true)

const roles = [
  { value: 'dev', label: '开发' },
  { value: 'design', label: '设计' },
]

const sizes = ['xs', 'sm', 'md', 'lg'] as const
</script>

<template>
  <div class="demo">
    <section>
      <h3>尺寸下发（默认 → xs / sm / md / lg）</h3>
      <div class="stack">
        <div class="line">
          <span class="label">默认（md）</span>
          <SrButton>按钮</SrButton>
          <SrInput v-model="name" placeholder="输入" style="width: 140px" />
        </div>

        <SrConfigProvider v-for="s in sizes" :key="s" :size="s">
          <div class="line">
            <span class="label">size = {{ s }}</span>
            <SrButton>按钮</SrButton>
            <SrInput v-model="name" placeholder="输入" style="width: 140px" />
            <SrSwitch v-model="on" />
          </div>
        </SrConfigProvider>
      </div>
      <p class="hint">里面没有给任何组件传 size，全部来自外层配置</p>
    </section>

    <section>
      <h3>子组件覆盖外层配置</h3>
      <SrConfigProvider size="sm">
        <div class="line">
          <span class="label">外层 sm</span>
          <SrButton>继承 sm</SrButton>
          <SrButton size="lg">自己指定 lg</SrButton>
          <SrInput v-model="name" placeholder="继承 sm" style="width: 130px" />
          <SrInput v-model="name" size="md" placeholder="自己指定 md" style="width: 130px" />
        </div>
      </SrConfigProvider>
      <p class="hint">组件上显式传的 size 永远优先，所以渐进式接入不用改已有代码</p>
    </section>

    <section>
      <h3>嵌套覆盖</h3>
      <SrConfigProvider size="lg">
        <div class="line">
          <span class="label">lg</span>
          <SrButton>外层 lg</SrButton>
        </div>

        <SrConfigProvider size="xs">
          <div class="line">
            <span class="label">内层 xs</span>
            <SrButton>内层覆盖为 xs</SrButton>
          </div>
        </SrConfigProvider>

        <div class="line">
          <span class="label">回到 lg</span>
          <SrButton>内层结束后恢复外层</SrButton>
        </div>
      </SrConfigProvider>
    </section>

    <section>
      <h3>弹层层级（zIndex）</h3>
      <SrConfigProvider :z-index="3000">
        <div class="line">
          <span class="label">zIndex 3000</span>
          <SrSelect v-model="role" :options="roles" placeholder="选择角色" style="width: 160px" />
          <span class="hint">下拉面板的层级会基于这个值叠加</span>
        </div>
      </SrConfigProvider>
    </section>

    <section>
      <h3>不渲染 DOM</h3>
      <SrConfigProvider size="sm">
        <div class="line">
          <span class="label">容器本身</span>
          <span class="hint">SrConfigProvider 只做 provide/inject，不产生任何标签，不影响布局</span>
        </div>
      </SrConfigProvider>
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
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--sr-color-primary-alpha-08);
}

.label {
  flex: 0 0 auto;
  min-width: 92px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
