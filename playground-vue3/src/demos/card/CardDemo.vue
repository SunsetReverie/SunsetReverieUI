<script setup lang="ts">
import { SrButton, SrCard, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'CardDemo' })
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础与副标题</h3>
      <div class="grid">
        <SrCard title="组件状态" subtitle="近 7 天的构建结果">
          <p style="margin: 0; font-size: 13px">主体内容放这里，支持任意结构。</p>
        </SrCard>

        <SrCard title="发布配置">
          <template #extra>
            <SrTag type="primary" size="sm" round>预览版</SrTag>
          </template>
          <p style="margin: 0; font-size: 13px">头部右侧的 extra 插槽。</p>
          <template #footer>
            <SrButton size="sm" variant="text">取消</SrButton>
            <SrButton size="sm" variant="primary">保存</SrButton>
          </template>
        </SrCard>
      </div>
    </section>

    <section>
      <h3>描边与悬停</h3>
      <div class="grid">
        <SrCard title="有描边" style="cursor: default">
          <p style="margin: 0; font-size: 13px">bordered = true（默认）</p>
        </SrCard>
        <SrCard title="无描边" :bordered="false">
          <p style="margin: 0; font-size: 13px">改用阴影托住边界</p>
        </SrCard>
        <SrCard title="可悬停" hoverable>
          <p style="margin: 0; font-size: 13px">上浮 + 主色描边</p>
        </SrCard>
      </div>
    </section>

    <section>
      <h3>内边距</h3>
      <div class="grid">
        <SrCard title="padding = none" padding="none">
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 68px;
              background: linear-gradient(
                120deg,
                var(--sr-color-primary-alpha-12),
                var(--sr-color-primary-alpha-08)
              );
              color: var(--sr-color-primary-text);
              font-size: 13px;
            "
          >
            内容贴边，头部仍保留内边距
          </div>
        </SrCard>
        <SrCard title="padding = lg" padding="lg">
          <p style="margin: 0; font-size: 13px">更大留白，内容少的卡片用它不显局促。</p>
        </SrCard>
      </div>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 22px;
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
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
</style>
