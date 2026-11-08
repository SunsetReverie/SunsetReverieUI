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
      <h3>自定义配色</h3>
      <div class="row">
        <SrButton
          size="sm"
          variant="outline"
          @click="srMessage('浅色底（文字不用改）', { backgroundColor: '#fdf2e9' })"
        >
          浅色底
        </SrButton>
        <SrButton
          size="sm"
          variant="outline"
          @click="
            srMessage('深色底要配浅色文字', {
              backgroundColor: '#1f2937',
              color: '#f1f5f9',
              iconColor: '#60a5fa',
            })
          "
        >
          深色底 + 浅色文字
        </SrButton>
        <SrButton
          size="sm"
          variant="outline"
          @click="
            srMessage('品牌紫，白色文字', {
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              iconColor: '#e9d5ff',
            })
          "
        >
          品牌紫 + 白字
        </SrButton>
      </div>
      <p class="hint">
        只改背景不改文字时，深色底会让文字完全看不见——深色背景必须同时传
        <code>color</code>；<code>iconColor</code> 不传则跟随消息类型的主色
      </p>
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
