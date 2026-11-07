<script setup lang="ts">
import { SrButton, SrEmpty } from '@sunset-reverie/ui'

defineOptions({ name: 'EmptyDemo' })
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <div class="grid">
        <SrEmpty />
        <SrEmpty description="搜索没有匹配结果" />
      </div>
    </section>

    <section>
      <h3>带操作</h3>
      <SrEmpty description="还没有创建任何组件">
        <template #action>
          <SrButton size="sm" variant="primary">新建组件</SrButton>
        </template>
      </SrEmpty>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="grid">
        <SrEmpty size="sm" description="sm：卡片或表格内部" />
        <SrEmpty size="lg" description="lg：整页占位" />
      </div>
    </section>

    <section>
      <h3>虚线框</h3>
      <SrEmpty bordered description="拖拽文件到这里，或点击上传" />
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
