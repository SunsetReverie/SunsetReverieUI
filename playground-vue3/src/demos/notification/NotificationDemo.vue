<script setup lang="ts">
import { SrButton, srNotification } from '@sunset-reverie/ui'

defineOptions({ name: 'NotificationDemo' })

const positions = [
  { key: 'top-right', label: 'top-right' },
  { key: 'top-left', label: 'top-left' },
  { key: 'bottom-right', label: 'bottom-right' },
  { key: 'bottom-left', label: 'bottom-left' },
] as const
</script>

<template>
  <div class="demo">
    <section>
      <h3>四种类型</h3>
      <div class="row">
        <SrButton
          size="sm"
          variant="outline"
          @click="srNotification.info({ title: '新版本可用', message: 'v1.3.0 已发布，包含 8 项改进' })"
        >
          info
        </SrButton>
        <SrButton
          size="sm"
          variant="outline"
          @click="srNotification.success({ title: '部署完成', message: 'v1.2.0 已发布到生产环境' })"
        >
          success
        </SrButton>
        <SrButton
          size="sm"
          variant="outline"
          @click="srNotification.warning({ title: '存储空间不足', message: '已使用 92%，请及时清理' })"
        >
          warning
        </SrButton>
        <SrButton
          size="sm"
          variant="outline"
          @click="srNotification.error({ title: '同步失败', message: '网络异常，请稍后重试' })"
        >
          error
        </SrButton>
      </div>
      <p class="hint">第一个参数是对象（不像 Toast 那样先接字符串）</p>
    </section>

    <section>
      <h3>四个角落</h3>
      <div class="row">
        <SrButton
          v-for="p in positions"
          :key="p.key"
          size="sm"
          variant="text"
          @click="srNotification({ title: p.label, message: '通知只出现在四角，不做居中', position: p.key })"
        >
          {{ p.label }}
        </SrButton>
      </div>
    </section>

    <section>
      <h3>只有标题 / 只有详情</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="srNotification({ type: 'success', title: '只有标题' })">
          只有标题
        </SrButton>
        <SrButton
          size="sm"
          variant="outline"
          @click="srNotification({ type: 'info', message: '只有一段描述，没有标题' })"
        >
          只有详情
        </SrButton>
      </div>
    </section>

    <section>
      <h3>时长与关闭按钮</h3>
      <div class="row">
        <SrButton
          size="sm"
          variant="outline"
          @click="srNotification({ title: '常驻通知', message: '需要手动关闭', duration: 0 })"
        >
          duration 0
        </SrButton>
        <SrButton
          size="sm"
          variant="outline"
          @click="
            srNotification({
              title: '没有关闭按钮',
              message: '只能等它自己消失',
              closable: false,
              duration: 5000,
            })
          "
        >
          closable false
        </SrButton>
        <SrButton size="sm" variant="outline" @click="srNotification.closeAll()">全部关闭</SrButton>
      </div>
    </section>

    <section>
      <h3>自定义背景色</h3>
      <div class="row">
        <SrButton
          size="sm"
          variant="outline"
          @click="
            srNotification({
              title: '紫色通知',
              message: 'backgroundColor 覆盖预设玻璃底',
              backgroundColor: '#8b5cf6',
            })
          "
        >
          紫色
        </SrButton>
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
