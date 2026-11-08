<script setup lang="ts">
import { SrButton, SrSpace, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'SpaceDemo' })
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <SrSpace>
        <SrButton size="sm">上一步</SrButton>
        <SrButton size="sm" variant="primary">下一步</SrButton>
        <SrButton size="sm" variant="outline">保存草稿</SrButton>
      </SrSpace>
      <p class="hint">用 flex + gap 实现，不给子元素加 margin——避免和外层间距叠加</p>
    </section>

    <section>
      <h3>间距档位</h3>
      <div class="stack">
        <div v-for="s in ['xs', 'sm', 'md', 'lg']" :key="s" class="size-row">
          <span class="size-label">{{ s }}</span>
          <SrSpace :size="s as 'sm'">
            <SrTag size="sm">标签甲</SrTag>
            <SrTag size="sm">标签乙</SrTag>
            <SrTag size="sm">标签丙</SrTag>
          </SrSpace>
        </div>
        <div class="size-row">
          <span class="size-label">24</span>
          <SrSpace :size="24">
            <SrTag size="sm">标签甲</SrTag>
            <SrTag size="sm">标签乙</SrTag>
            <SrTag size="sm">标签丙</SrTag>
          </SrSpace>
        </div>
      </div>
      <p class="hint">传档位走设计令牌（xs 4 / sm 8 / md 12 / lg 16），传数字直接当像素</p>
    </section>

    <section>
      <h3>纵向</h3>
      <SrSpace direction="vertical" align="start" :size="10">
        <span class="line">第一行内容</span>
        <span class="line">第二行内容稍长一些</span>
        <span class="line">第三行</span>
      </SrSpace>
      <p class="hint">direction="vertical" 时 align 控制的是水平对齐</p>
    </section>

    <section>
      <h3>换行</h3>
      <div class="narrow">
        <SrSpace wrap :size="8">
          <SrTag v-for="i in 12" :key="i" size="sm">选项 {{ i }}</SrTag>
        </SrSpace>
      </div>
      <p class="hint">容器不够宽时自动换行，行间距与列间距共用同一个 gap</p>
    </section>

    <section>
      <h3>对齐方式</h3>
      <div class="align-demo">
        <div v-for="a in ['start', 'center', 'end', 'baseline']" :key="a" class="align-row">
          <span class="size-label">{{ a }}</span>
          <div class="align-box">
            <SrSpace :align="a as 'start'" :size="6">
              <span class="box box--sm">小</span>
              <span class="box box--lg">大块</span>
            </SrSpace>
          </div>
        </div>
      </div>
      <p class="hint">start / center / end 按交叉轴对齐；baseline 按文字基线，适合大小字混排</p>
    </section>

    <section>
      <h3>行内模式</h3>
      <p class="inline-text">
        这里是一段文字，
        <SrSpace inline :size="4">
          <SrTag size="sm" type="primary">行内</SrTag>
          <SrTag size="sm">标签</SrTag>
        </SrSpace>
        后面继续写。
      </p>
      <p class="hint">inline 用 inline-flex，能夹在段落里而不独占一行</p>
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

.stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.size-row,
.align-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.size-label {
  flex: 0 0 48px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.line {
  color: var(--sr-color-text-secondary);
  font-size: 13px;
}

.narrow {
  max-width: 260px;
  padding: 12px;
  border: 1px dashed var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
}

.align-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.align-box {
  min-height: 52px;
  padding: 8px;
  border: 1px dashed var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-sm);
}

.box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--sr-radius-sm);
  background: color-mix(in srgb, var(--sr-color-primary) 12%, transparent);
  color: var(--sr-color-primary-text);
  font-size: 12px;
}

.box--sm {
  width: 40px;
  height: 24px;
}

.box--lg {
  width: 56px;
  height: 40px;
}

.inline-text {
  margin: 0;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  line-height: 1.9;
}
</style>
