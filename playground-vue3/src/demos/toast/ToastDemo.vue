<script setup lang="ts">
import { SrButton, srToast } from '@sunset-reverie/ui'

defineOptions({ name: 'ToastDemo' })

const positions = [
  { key: 'top', label: 'top' },
  { key: 'top-left', label: 'top-left' },
  { key: 'top-right', label: 'top-right' },
  { key: 'bottom', label: 'bottom' },
  { key: 'bottom-left', label: 'bottom-left' },
  { key: 'bottom-right', label: 'bottom-right' },
] as const

/** 用返回的 id 手动关闭 */
function showPersistent(): void {
  const id = srToast('不会自动消失，点这里关掉', { duration: 0, closable: true })
  setTimeout(() => srToast.close(id), 4000)
}

/** 连发 7 条：模板里裸写 setTimeout 会被 vue-tsc 当成组件实例上的属性 */
function burstToasts(): void {
  for (let i = 1; i <= 7; i += 1) {
    window.setTimeout(() => srToast(`第 ${i} 条`), i * 120)
  }
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>四种类型</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="srToast.info('这是一条提示')">info</SrButton>
        <SrButton size="sm" variant="outline" @click="srToast.success('保存成功')">success</SrButton>
        <SrButton size="sm" variant="outline" @click="srToast.warning('存储空间不足')">warning</SrButton>
        <SrButton size="sm" variant="outline" @click="srToast.error('请求失败，请重试')">error</SrButton>
      </div>
    </section>

    <section>
      <h3>六个位置</h3>
      <div class="row">
        <SrButton
          v-for="p in positions"
          :key="p.key"
          size="sm"
          variant="text"
          @click="srToast(`出现在 ${p.label}`, { position: p.key })"
        >
          {{ p.label }}
        </SrButton>
      </div>
      <p class="hint">同一位置最多同时 5 条，超出时最早的被移除</p>
    </section>

    <section>
      <h3>时长与手动关闭</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="srToast('10 秒后才消失', { duration: 10000 })"
          >长停留</SrButton
        >
        <SrButton size="sm" variant="outline" @click="showPersistent"
          >不自动关闭（4 秒后自动 close）</SrButton
        >
        <SrButton size="sm" variant="outline" @click="srToast('带关闭按钮', { closable: true, duration: 0 })">
          带关闭按钮
        </SrButton>
        <SrButton size="sm" variant="outline" @click="srToast.closeAll()">全部关闭</SrButton>
      </div>
    </section>

    <section>
      <h3>自定义背景色</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="srToast('紫色提示', { backgroundColor: '#8b5cf6' })">
          紫色
        </SrButton>
        <SrButton size="sm" variant="outline" @click="srToast('深色提示', { backgroundColor: '#1f2937' })">
          深色
        </SrButton>
      </div>
    </section>

    <section>
      <h3>连发多条（验证队列与上限）</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="burstToasts"> 连发 7 条 </SrButton>
      </div>
      <p class="hint">超过 5 条时最早的会被自动移除</p>
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
.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
