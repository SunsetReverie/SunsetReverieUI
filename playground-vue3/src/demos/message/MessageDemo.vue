<script setup lang="ts">
import { SrButton, srMessage } from '@sunset-reverie/ui'

defineOptions({ name: 'MessageDemo' })
</script>

<template>
  <div class="demo">
    <section>
      <h3>四种类型</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="srMessage('这是一条消息')">info</SrButton>
        <SrButton size="sm" variant="outline" @click="srMessage.success('操作成功')">success</SrButton>
        <SrButton size="sm" variant="outline" @click="srMessage.warning('请先选择数据')">warning</SrButton>
        <SrButton size="sm" variant="outline" @click="srMessage.error('保存失败')">error</SrButton>
      </div>
      <p class="hint">固定顶部居中，默认停留 2000ms</p>
    </section>

    <section>
      <h3>时长</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="srMessage('5 秒后消失', { duration: 5000 })"
          >5 秒</SrButton
        >
        <SrButton size="sm" variant="outline" @click="srMessage('不会自动消失', { duration: 0 })"
          >不自动关闭</SrButton
        >
        <SrButton size="sm" variant="outline" @click="srMessage.closeAll()">全部关闭</SrButton>
      </div>
    </section>

    <section>
      <h3>自定义背景色</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="srMessage('紫色消息', { backgroundColor: '#8b5cf6' })">
          紫色
        </SrButton>
        <SrButton size="sm" variant="outline" @click="srMessage('深色消息', { backgroundColor: '#1f2937' })">
          深色
        </SrButton>
      </div>
    </section>

    <section>
      <h3>与 Toast 的差异</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="srMessage.success('Message：顶部居中，2 秒')">
          Message
        </SrButton>
        <SrButton size="sm" variant="outline" @click="srMessage('连发看堆叠上限', { duration: 3000 })">
          连发测试
        </SrButton>
      </div>
      <p class="hint">Message 没有位置与关闭按钮选项，定位就是「顺手告诉用户一声」</p>
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
