<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, srConfirm } from '@sunset-reverie/ui'

defineOptions({ name: 'ConfirmDemo' })

const result = ref('')
const asyncResult = ref('')

/** 普通确认 */
async function askBasic(): Promise<void> {
  const ok = await srConfirm({ title: '确认离开？', content: '未保存的修改会丢失' })
  result.value = ok ? '用户点了确认' : '用户取消了'
}

/** 简写：只传字符串 */
async function askShort(): Promise<void> {
  const ok = await srConfirm('确定删除这条记录？')
  result.value = ok ? '已删除' : '已取消'
}

/** 异步确认：onConfirm 返回 Promise，按钮进入 loading */
async function askAsync(): Promise<void> {
  const ok = await srConfirm.danger({
    title: '删除这条记录？',
    content: '删除后不可恢复',
    onConfirm: () =>
      new Promise((resolve) => {
        setTimeout(resolve, 900)
      }),
  })
  asyncResult.value = ok ? '请求完成并关闭' : '已取消'
}

/** 异步失败：弹窗保持打开 */
async function askFail(): Promise<void> {
  const ok = await srConfirm.warning({
    title: '同步数据？',
    content: '点确认后会故意抛错，弹窗应该保持打开',
    onConfirm: () =>
      new Promise((_resolve, reject) => {
        setTimeout(() => reject(new Error('网络异常')), 700)
      }),
  })
  asyncResult.value = ok ? '不可能走到这里' : '已取消'
}

/** 只有确认按钮 */
async function askSingle(): Promise<void> {
  const ok = await srConfirm({
    type: 'primary',
    title: '知道了',
    content: 'showCancel = false，只有一个确认按钮',
    showCancel: false,
    maskClosable: false,
    confirmText: '我明白了',
  })
  result.value = ok ? '用户已确认' : '已取消'
}

/** 自定义文案与宽度 */
async function askCustom(): Promise<void> {
  const ok = await srConfirm({
    type: 'warning',
    title: '切换分支？',
    content: '当前分支有未提交的改动',
    confirmText: '仍然切换',
    cancelText: '留在这里',
    width: 480,
  })
  result.value = ok ? '已切换' : '已留在当前分支'
}

/** 不可点遮罩关闭 */
async function askNoMaskClose(): Promise<void> {
  const ok = await srConfirm({
    title: '必须做出选择',
    content: 'maskClosable = false，点遮罩不会关闭',
    maskClosable: false,
  })
  result.value = ok ? '已确认' : '已取消'
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>三种类型</h3>
      <div class="row">
        <SrButton
          size="sm"
          variant="outline"
          @click="srConfirm({ type: 'primary', title: '提交表单？', content: '提交后仍可修改' })"
        >
          primary
        </SrButton>
        <SrButton
          size="sm"
          variant="outline"
          @click="srConfirm({ type: 'warning', title: '离开当前页面？', content: '未保存的内容会丢失' })"
        >
          warning
        </SrButton>
        <SrButton
          size="sm"
          variant="outline"
          @click="srConfirm({ type: 'danger', title: '永久删除？', content: '该操作不可撤销' })"
        >
          danger
        </SrButton>
      </div>
    </section>

    <section>
      <h3>Promise 返回值</h3>
      <div class="row">
        <SrButton size="sm" variant="primary" @click="askBasic">普通确认</SrButton>
        <SrButton size="sm" variant="outline" @click="askShort">字符串简写</SrButton>
      </div>
      <p class="hint">结果：{{ result || '—' }}</p>
    </section>

    <section>
      <h3>异步确认（onConfirm 返回 Promise）</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="askAsync">成功（按钮 loading）</SrButton>
        <SrButton size="sm" variant="outline" @click="askFail">抛错（弹窗不关）</SrButton>
      </div>
      <p class="hint">结果：{{ asyncResult || '—' }}</p>
    </section>

    <section>
      <h3>按钮配置</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="askSingle">只有确认按钮</SrButton>
        <SrButton size="sm" variant="outline" @click="askCustom">自定义文案与宽度</SrButton>
        <SrButton size="sm" variant="outline" @click="askNoMaskClose">点遮罩不关闭</SrButton>
      </div>
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
