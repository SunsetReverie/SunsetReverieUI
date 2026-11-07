<script setup lang="ts">
import { SrCol, SrRow } from '@sunset-reverie/ui'

defineOptions({ name: 'RowDemo' })
</script>

<template>
  <div class="demo">
    <section>
      <h3>等分（span 之和 = 24）</h3>
      <SrRow :gutter="12">
        <SrCol :span="8"><div class="box">8</div></SrCol>
        <SrCol :span="8"><div class="box">8</div></SrCol>
        <SrCol :span="8"><div class="box">8</div></SrCol>
      </SrRow>
    </section>

    <section>
      <h3>间隔（单值 / 水平垂直 / 按断点）</h3>
      <div class="stack">
        <SrRow :gutter="24">
          <SrCol :span="6"><div class="box">gutter 24</div></SrCol>
          <SrCol :span="6"><div class="box">gutter 24</div></SrCol>
          <SrCol :span="6"><div class="box">gutter 24</div></SrCol>
          <SrCol :span="6"><div class="box">gutter 24</div></SrCol>
        </SrRow>

        <SrRow :gutter="[20, 12]">
          <SrCol :span="8"><div class="box">gutter [20, 12]</div></SrCol>
          <SrCol :span="8"><div class="box">换行后有垂直间隔</div></SrCol>
          <SrCol :span="8"><div class="box">第三列</div></SrCol>
          <SrCol :span="8"><div class="box">第四列（换行）</div></SrCol>
        </SrRow>

        <SrRow :gutter="{ xs: 6, md: 24 }">
          <SrCol :span="6"><div class="box">{ xs: 6, md: 24 }</div></SrCol>
          <SrCol :span="6"><div class="box">窄屏更紧</div></SrCol>
          <SrCol :span="6"><div class="box">宽屏更松</div></SrCol>
          <SrCol :span="6"><div class="box">看浏览器宽度变化</div></SrCol>
        </SrRow>
      </div>
    </section>

    <section>
      <h3>响应式 span（窄屏自动堆叠）</h3>
      <SrRow :gutter="12">
        <SrCol :span="{ xs: 24, sm: 12, md: 8 }"><div class="box">xs 24 / sm 12 / md 8</div></SrCol>
        <SrCol :span="{ xs: 24, sm: 12, md: 8 }"><div class="box">xs 24 / sm 12 / md 8</div></SrCol>
        <SrCol :span="{ xs: 24, sm: 12, md: 8 }"><div class="box">xs 24 / sm 12 / md 8</div></SrCol>
      </SrRow>
      <p class="hint">也可以写具名 prop：&lt;SrCol xs="24" md="8" /&gt;</p>
    </section>

    <section>
      <h3>对齐（justify / align）</h3>
      <div class="stack">
        <SrRow justify="space-between" class="align-row">
          <SrCol :span="5"><div class="box">space-between</div></SrCol>
          <SrCol :span="5"><div class="box">两端对齐</div></SrCol>
        </SrRow>

        <SrRow justify="center" class="align-row">
          <SrCol :span="5"><div class="box">justify center</div></SrCol>
        </SrRow>

        <SrRow align="middle" class="align-row tall">
          <SrCol :span="8"><div class="box short">middle</div></SrCol>
          <SrCol :span="8"><div class="box">较高的列</div></SrCol>
          <SrCol :span="8"><div class="box short">也会居中</div></SrCol>
        </SrRow>
      </div>
    </section>

    <section>
      <h3>偏移（offset）</h3>
      <SrRow :gutter="12">
        <SrCol :span="6"><div class="box">6</div></SrCol>
        <SrCol :span="6" :offset="6"><div class="box">6 + offset 6</div></SrCol>
      </SrRow>
    </section>

    <section>
      <h3>推拉（push / pull，只改视觉顺序）</h3>
      <SrRow :gutter="12">
        <SrCol :span="12" :push="12"><div class="box">视觉在右（DOM 在前）</div></SrCol>
        <SrCol :span="12" :pull="12"><div class="box">视觉在左（DOM 在后）</div></SrCol>
      </SrRow>
      <p class="hint">读屏与 Tab 顺序仍按 DOM，需要语义一致请直接调整结构</p>
    </section>

    <section>
      <h3>弹性宽度（flex 覆盖 span）</h3>
      <SrRow :gutter="12">
        <SrCol :span="8"><div class="box">固定 8</div></SrCol>
        <SrCol flex="auto"><div class="box">flex: auto，吃掉剩余空间</div></SrCol>
      </SrRow>
    </section>

    <section>
      <h3>不换行（wrap = false）</h3>
      <SrRow :gutter="12" :wrap="false">
        <SrCol :span="10"><div class="box">10</div></SrCol>
        <SrCol :span="10"><div class="box">10</div></SrCol>
        <SrCol :span="10"><div class="box">10（溢出，不换行）</div></SrCol>
      </SrRow>
    </section>

    <section>
      <h3>语义化标签（tag）</h3>
      <SrRow tag="section" :gutter="12">
        <SrCol tag="article" :span="12"><div class="box">SrRow 渲染成 section</div></SrCol>
        <SrCol tag="article" :span="12"><div class="box">SrCol 渲染成 article</div></SrCol>
      </SrRow>
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
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 8px;
  border-radius: 8px;
  background: var(--sr-color-primary-alpha-12);
  color: var(--sr-color-primary-text);
  font-size: 12px;
  text-align: center;
}

.box.short {
  min-height: 28px;
}

.align-row {
  padding: 6px;
  border-radius: 8px;
  background: var(--sr-color-primary-alpha-08);
}

.align-row.tall .box {
  min-height: 64px;
}
</style>
