<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrInput, SrModal } from '@sunset-reverie/ui'

defineOptions({ name: 'ModalDemo' })

const basic = ref(false)
const noMaskClose = ref(false)
const noEsc = ref(false)
const noClosable = ref(false)
const centered = ref(false)
const wide = ref(false)
const custom = ref(false)
const nested = ref(false)
const inner = ref(false)
const noMask = ref(false)
/** 各弹窗的关闭原因 */
const reasons = ref<string[]>([])
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <div class="row">
        <SrButton variant="primary" size="sm" @click="basic = true">打开弹窗</SrButton>
        <SrButton variant="outline" size="sm" @click="wide = true">宽弹窗（width 640）</SrButton>
        <SrButton variant="outline" size="sm" @click="centered = true">垂直居中</SrButton>
      </div>
      <p class="hint">默认顶部对齐，centered 让它在视口垂直居中</p>
    </section>

    <section>
      <h3>关闭方式</h3>
      <div class="row">
        <SrButton variant="outline" size="sm" @click="noMaskClose = true">点遮罩不关闭</SrButton>
        <SrButton variant="outline" size="sm" @click="noEsc = true">Esc 不关闭</SrButton>
        <SrButton variant="outline" size="sm" @click="noClosable = true">隐藏关闭按钮</SrButton>
        <SrButton variant="outline" size="sm" @click="noMask = true">无遮罩</SrButton>
      </div>
      <p class="hint">三种关闭入口可以分别关掉，用于「必须先完成」的表单</p>
    </section>

    <section>
      <h3>插槽：header / default / footer</h3>
      <div class="row">
        <SrButton variant="outline" size="sm" @click="custom = true">自定义头部与底部</SrButton>
      </div>
    </section>

    <section>
      <h3>嵌套弹窗</h3>
      <div class="row">
        <SrButton variant="outline" size="sm" @click="nested = true">打开外层</SrButton>
      </div>
      <p class="hint">外层里再开一个，焦点陷阱与 Esc 各自独立</p>
    </section>

    <SrModal v-model="basic" title="基础弹窗" @close="(r) => reasons.push(String(r))">
      <p style="margin: 0">按 Esc、点遮罩、点关闭按钮都能关掉。</p>
      <template #footer>
        <SrButton size="sm" variant="text" @click="basic = false">取消</SrButton>
        <SrButton size="sm" variant="primary" @click="basic = false">确定</SrButton>
      </template>
    </SrModal>

    <SrModal v-model="wide" title="宽弹窗" :width="640">
      <p style="margin: 0">width 支持数字（按 px）或字符串。</p>
    </SrModal>

    <SrModal v-model="centered" title="垂直居中" centered>
      <p style="margin: 0">centered 让面板在视口中垂直居中，而不是从顶部开始。</p>
    </SrModal>

    <SrModal v-model="noMaskClose" title="点遮罩不关闭" :mask-closable="false">
      <p style="margin: 0">只能通过关闭按钮或 Esc 关掉。</p>
    </SrModal>

    <SrModal v-model="noEsc" title="Esc 不关闭" :esc-to-close="false">
      <p style="margin: 0">escToClose = false，Esc 不起作用。</p>
    </SrModal>

    <SrModal v-model="noClosable" title="隐藏关闭按钮" :closable="false">
      <p style="margin: 0">没有右上角 ×，需要自己放一个关闭按钮。</p>
      <template #footer>
        <SrButton size="sm" variant="primary" @click="noClosable = false">关闭</SrButton>
      </template>
    </SrModal>

    <SrModal v-model="noMask" title="无遮罩" :show-mask="false">
      <p style="margin: 0">showMask = false，背后页面仍可交互。</p>
    </SrModal>

    <SrModal v-model="custom" :width="480">
      <template #header>
        <div style="display: flex; align-items: center; gap: 10px">
          <SrIcon name="lucide:info" :size="18" />
          <strong style="font-size: 15px">自定义头部</strong>
        </div>
      </template>
      <p style="margin: 0 0 12px">头部整块替换，可以是任意结构。</p>
      <SrInput placeholder="表单字段" />
      <template #footer>
        <SrButton size="sm" variant="text" @click="custom = false">稍后</SrButton>
        <SrButton size="sm" variant="primary" @click="custom = false">保存</SrButton>
      </template>
    </SrModal>

    <SrModal v-model="nested" title="外层弹窗">
      <p style="margin: 0 0 12px">点击下方按钮打开内层。</p>
      <SrButton size="sm" variant="outline" @click="inner = true">打开内层</SrButton>

      <SrModal v-model="inner" title="内层弹窗" :width="380">
        <p style="margin: 0">内层关闭后外层仍在。</p>
      </SrModal>
    </SrModal>
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
