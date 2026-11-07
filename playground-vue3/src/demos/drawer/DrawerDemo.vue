<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrEmpty, SrInput } from '@sunset-reverie/ui'

defineOptions({ name: 'DrawerDemo' })

const right = ref(false)
const left = ref(false)
const top = ref(false)
const bottom = ref(false)
const sm = ref(false)
const lg = ref(false)
const inset = ref(false)
const noHead = ref(false)
const noClose = ref(false)
const noMask = ref(false)
const customWidth = ref(false)

/** 关闭原因记录 */
const lastReason = ref('')
</script>

<template>
  <div class="demo">
    <section>
      <h3>四个方向</h3>
      <div class="row">
        <SrButton variant="primary" size="sm" @click="right = true">右侧（默认）</SrButton>
        <SrButton variant="outline" size="sm" @click="left = true">左侧</SrButton>
        <SrButton variant="outline" size="sm" @click="top = true">顶部</SrButton>
        <SrButton variant="outline" size="sm" @click="bottom = true">底部</SrButton>
      </div>
      <p class="hint">左右方向 size 是宽度，上下方向是高度</p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row">
        <SrButton variant="outline" size="sm" @click="sm = true">sm（320）</SrButton>
        <SrButton variant="outline" size="sm" @click="lg = true">lg（600）</SrButton>
        <SrButton variant="outline" size="sm" @click="customWidth = true">自定义 520</SrButton>
      </div>
    </section>

    <section>
      <h3>圆角形态（inset）</h3>
      <div class="row">
        <SrButton variant="outline" size="sm" @click="inset = true">贴边 + 四角圆角</SrButton>
      </div>
      <p class="hint">仍然贴视口边缘，只把四个角做成圆角；磨砂质感在这种形态下更明显</p>
    </section>

    <section>
      <h3>头部与关闭方式</h3>
      <div class="row">
        <SrButton variant="outline" size="sm" @click="noHead = true">无头部（无 title）</SrButton>
        <SrButton variant="outline" size="sm" @click="noClose = true">保留标题但隐藏 ×</SrButton>
        <SrButton variant="outline" size="sm" @click="noMask = true">无遮罩</SrButton>
      </div>
      <p class="hint">close 事件的 reason：{{ lastReason || '—' }}（close / mask / esc）</p>
    </section>
  </div>

  <SrDrawer v-model="right" title="筛选条件" @close="(r) => (lastReason = String(r))">
    <p style="margin: 0 0 12px">点右上角 ×、按 Esc、点遮罩都能关闭。</p>
    <SrInput placeholder="搜索条件" />
    <template #footer>
      <SrButton size="sm" variant="text" @click="right = false">重置</SrButton>
      <SrButton size="sm" variant="primary" @click="right = false">应用</SrButton>
    </template>
  </SrDrawer>

  <SrDrawer v-model="left" title="左侧抽屉" placement="left">
    <p style="margin: 0">用于导航或大纲。</p>
  </SrDrawer>

  <SrDrawer v-model="top" title="顶部抽屉" placement="top" size="sm">
    <p style="margin: 0">上下方向的 size 是高度。</p>
  </SrDrawer>

  <SrDrawer v-model="bottom" title="底部抽屉" placement="bottom" size="sm">
    <p style="margin: 0">移动端常用的底部弹出。</p>
  </SrDrawer>

  <SrDrawer v-model="sm" title="窄抽屉" size="sm">
    <p style="margin: 0">size = sm，宽 320px。</p>
  </SrDrawer>

  <SrDrawer v-model="lg" title="宽抽屉" size="lg">
    <p style="margin: 0">size = lg，宽 600px。</p>
  </SrDrawer>

  <SrDrawer v-model="customWidth" title="自定义宽度" :size="520">
    <p style="margin: 0">size 传数字按 px 处理。</p>
  </SrDrawer>

  <SrDrawer v-model="inset" title="圆角抽屉" inset :size="420">
    <p style="margin: 0 0 12px">四角圆角，仍然贴边。</p>
    <SrEmpty description="内容区能透出背后的页面" size="sm" />
  </SrDrawer>

  <SrDrawer v-model="noHead" :size="420">
    <p style="margin: 0 0 12px">没有 title 时整块头部不渲染，也没有右上角关闭按钮。</p>
    <SrButton size="sm" @click="noHead = false">关闭</SrButton>
  </SrDrawer>

  <SrDrawer v-model="noClose" title="隐藏关闭按钮" :closable="false" :size="420">
    <p style="margin: 0">标题还在，但右上角没有 ×。</p>
  </SrDrawer>

  <SrDrawer v-model="noMask" title="无遮罩" :mask="false" :size="420">
    <p style="margin: 0">mask = false，背后页面仍可交互。</p>
  </SrDrawer>
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
