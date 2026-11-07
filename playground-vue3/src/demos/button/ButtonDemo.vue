<script setup lang="ts">
import { SrButton } from '@sunset-reverie/ui'

defineOptions({ name: 'ButtonDemo' })

const variants = ['primary', 'secondary', 'outline', 'text', 'success', 'warning', 'danger'] as const
</script>

<template>
  <div class="demo">
    <section>
      <h3>变体</h3>
      <div class="row">
        <SrButton v-for="v in variants" :key="v" :variant="v">{{ v }}</SrButton>
      </div>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row">
        <SrButton size="xs">xs</SrButton>
        <SrButton size="sm">sm</SrButton>
        <SrButton size="md">md</SrButton>
        <SrButton size="lg">lg</SrButton>
      </div>
    </section>

    <section>
      <h3>图标位置（iconPosition）</h3>
      <div class="row">
        <SrButton icon="lucide:heart" variant="outline">图标在左（默认）</SrButton>
        <SrButton icon="lucide:arrow-right" icon-position="right" variant="primary">图标在右</SrButton>
        <SrButton icon="lucide:chevron-right" icon-position="right" variant="text">下一步</SrButton>
        <SrButton icon="lucide:download" icon-position="right" :loading="false">下载</SrButton>
      </div>
      <p class="hint">iconPosition 只接受 left / right；图标尺寸自动跟随按钮字号，不用单独传 size</p>
    </section>

    <section>
      <h3>图标颜色继承</h3>
      <div class="row">
        <SrButton icon="lucide:check" variant="success">跟随文字色（默认）</SrButton>
        <SrButton icon="lucide:trash" variant="danger" icon-position="right">危险按钮里也是同色</SrButton>
        <span style="color: #8b5cf6">
          <SrButton icon="lucide:heart" variant="text">被父级 color 影响</SrButton>
        </span>
      </div>
      <p class="hint">按钮内的图标不写死颜色，跟随按钮自身的文字色；除非宿主元素设置了 color</p>
    </section>

    <section>
      <h3>状态</h3>
      <div class="row">
        <SrButton loading>加载中</SrButton>
        <SrButton disabled>禁用</SrButton>
        <SrButton round variant="primary">胶囊</SrButton>
        <SrButton block variant="outline" style="max-width: 240px">占满父容器（block）</SrButton>
      </div>
    </section>

    <section>
      <h3>自定义背景色与圆角</h3>
      <div class="row">
        <SrButton bg="#8b5cf6">紫（bg）</SrButton>
        <SrButton bg="#0ea5e9" round>天蓝 + 胶囊</SrButton>
        <SrButton bg="#10b981" color="#052e16">自定义文字色</SrButton>
        <SrButton variant="outline" :radius="0">圆角 0</SrButton>
        <SrButton variant="outline" radius="14px">圆角 14px</SrButton>
      </div>
      <p class="hint">bg 会自动派生 hover / active 与同色辉光，不需要另外指定</p>
    </section>

    <section>
      <h3>响应式尺寸</h3>
      <div class="row">
        <SrButton xs="xs" md="lg" variant="outline">xs → md:lg（拖动窗口看变化）</SrButton>
      </div>
      <p class="hint">也可以用 size 传对象：:size="{ xs: 'xs', md: 'lg' }"</p>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  gap: 10px;
}
.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
