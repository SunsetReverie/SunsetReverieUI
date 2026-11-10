<script setup lang="ts">
import { SrButton, SrDivider } from '@sunset-reverie/ui'

defineOptions({ name: 'DividerDemo' })
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <p class="text">上方内容</p>
      <SrDivider />
      <p class="text">下方内容</p>
      <p class="hint">默认水平，上下各 16px 外边距</p>
    </section>

    <section>
      <h3>带文字</h3>
      <SrDivider>分组一</SrDivider>
      <SrDivider content-position="left">左对齐标题</SrDivider>
      <SrDivider content-position="right">右对齐标题</SrDivider>
      <p class="hint">
        线由 <code>::before</code> / <code>::after</code> 两段拼成，文字压在中间；中段无线，文字不铺底色
      </p>
    </section>

    <section>
      <h3>虚线</h3>
      <SrDivider dashed />
      <SrDivider dashed>虚线段落</SrDivider>
      <p class="hint">虚线用 repeating-linear-gradient 画：4px 实 + 4px 空</p>
    </section>

    <section>
      <h3>垂直分割</h3>
      <div class="row">
        <SrButton size="sm" variant="text">编辑</SrButton>
        <SrDivider direction="vertical" />
        <SrButton size="sm" variant="text">复制</SrButton>
        <SrDivider direction="vertical" />
        <SrButton size="sm" variant="text">删除</SrButton>
      </div>
      <p class="hint">垂直分割线用 align-self: stretch 撑满父容器，所以父级需要有确定高度</p>
    </section>

    <section>
      <h3>实际场景：表单分组</h3>
      <div class="card">
        <SrDivider content-position="left">基本信息</SrDivider>
        <div class="field-row"><span class="field-label">姓名</span><span>林深</span></div>
        <div class="field-row"><span class="field-label">公司</span><span>夕梦科技</span></div>
        <SrDivider content-position="left">联系方式</SrDivider>
        <div class="field-row"><span class="field-label">邮箱</span><span>lin@example.com</span></div>
        <div class="field-row"><span class="field-label">电话</span><span>138 **** 0000</span></div>
      </div>
      <p class="hint">比用标题层级更轻，适合同一张卡片里切分字段区块</p>
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

.text {
  margin: 0;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
}

.row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card {
  padding: 16px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.field-row {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  font-size: 13px;
}

.field-label {
  flex: 0 0 64px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
