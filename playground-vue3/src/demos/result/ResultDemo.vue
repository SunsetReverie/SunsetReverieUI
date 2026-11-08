<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrResult, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'ResultDemo' })

/** 演示用的切换 */
const status = ref<'success' | 'error' | 'warning' | 'info'>('success')
</script>

<template>
  <div class="demo">
    <section>
      <h3>四种状态</h3>
      <div class="grid">
        <div class="card">
          <SrResult status="success" title="提交成功" sub-title="我们会在 1 个工作日内联系你" compact />
        </div>
        <div class="card">
          <SrResult status="error" title="提交失败" sub-title="服务暂时不可用，请稍后重试" compact />
        </div>
        <div class="card">
          <SrResult status="warning" title="等待审核" sub-title="资料已收到，审核通过后会邮件通知" compact />
        </div>
        <div class="card">
          <SrResult status="info" title="暂无权限" sub-title="请联系管理员开通此模块的访问权限" compact />
        </div>
      </div>
      <p class="hint">图标底色是状态色的低透明度叠加，比纯色块轻，也不会挡住图标本身</p>
    </section>

    <section>
      <h3>完整尺寸</h3>
      <div class="card">
        <SrResult status="success" title="订单提交成功" sub-title="订单号 20261108001，预计 11 月 10 日送达">
          <template #extra>
            <SrButton variant="primary">查看订单</SrButton>
            <SrButton variant="outline">返回列表</SrButton>
          </template>
        </SrResult>
      </div>
      <p class="hint">不传 compact 时图标 72px、标题 20px，适合占满整页的结果页</p>
    </section>

    <section>
      <h3>带额外信息</h3>
      <div class="card">
        <SrResult status="success" title="支付成功" sub-title="款项已到账，可继续下一步操作">
          <div class="detail">
            <div class="detail__row">
              <span class="detail__label">订单号</span>
              <span>20261108001</span>
            </div>
            <div class="detail__row">
              <span class="detail__label">支付金额</span>
              <strong>¥ 12,800.00</strong>
            </div>
            <div class="detail__row">
              <span class="detail__label">支付方式</span>
              <span>对公转账</span>
            </div>
            <div class="detail__row">
              <span class="detail__label">交易时间</span>
              <span>2026-11-08 14:32:18</span>
            </div>
          </div>
          <template #extra>
            <SrButton variant="primary">下载回执</SrButton>
            <SrButton variant="text">返回首页</SrButton>
          </template>
        </SrResult>
      </div>
      <p class="hint">默认插槽放订单摘要、失败原因这类补充信息，会自动套一层浅底容器</p>
    </section>

    <section>
      <h3>自定义图标</h3>
      <div class="grid">
        <div class="card">
          <SrResult icon="lucide:heart" status="success" title="收藏成功" compact />
        </div>
        <div class="card">
          <SrResult icon="lucide:box" status="info" title="已发货" compact />
        </div>
      </div>
      <p class="hint">传 icon 就替换状态图标，颜色仍跟随 status</p>
    </section>

    <section>
      <h3>插槽自定义图标</h3>
      <div class="card">
        <SrResult status="success" title="完成实名认证">
          <template #icon>
            <div class="badge-icon">✓</div>
          </template>
          <template #extra>
            <SrButton variant="primary">继续</SrButton>
          </template>
        </SrResult>
      </div>
      <p class="hint">icon 插槽可以放自定义图形、插画，甚至一张 SVG</p>
    </section>

    <section>
      <h3>状态切换</h3>
      <div class="row" style="margin-bottom: 12px">
        <SrButton
          v-for="s in ['success', 'error', 'warning', 'info']"
          :key="s"
          size="xs"
          :variant="status === s ? 'primary' : 'outline'"
          @click="status = s as 'success'"
        >
          {{ s }}
        </SrButton>
      </div>
      <div class="card">
        <SrResult
          :status="status"
          :title="
            status === 'success'
              ? '操作成功'
              : status === 'error'
                ? '操作失败'
                : status === 'warning'
                  ? '需要确认'
                  : '提示信息'
          "
          sub-title="切换上面按钮看图标与配色如何变化"
          compact
        />
      </div>
    </section>

    <section>
      <h3>嵌在弹窗里</h3>
      <div class="card" style="max-width: 420px; padding: 0">
        <SrResult status="error" title="删除失败" sub-title="该记录被其他数据引用，无法删除" compact>
          <template #extra>
            <SrButton size="sm" variant="outline">取消</SrButton>
            <SrButton size="sm" variant="primary">查看引用</SrButton>
          </template>
        </SrResult>
      </div>
      <p class="hint">compact 缩到 48px 图标，放在弹窗或卡片里不显臃肿</p>
    </section>

    <section>
      <h3>常见文案搭配</h3>
      <div class="stack">
        <div class="card">
          <SrResult status="success" title="注册成功" sub-title="验证邮件已发送到 your@email.com" compact>
            <template #extra>
              <SrTag type="success" size="sm">去邮箱查看</SrTag>
            </template>
          </SrResult>
        </div>
        <div class="card">
          <SrResult
            status="warning"
            title="账号待激活"
            sub-title="点击邮件中的链接完成激活，链接 24 小时内有效"
            compact
          />
        </div>
        <div class="card">
          <SrResult
            status="error"
            title="链接已失效"
            sub-title="该链接已被使用或超过有效期，请重新申请"
            compact
          >
            <template #extra>
              <SrButton size="sm" variant="primary">重新申请</SrButton>
            </template>
          </SrResult>
        </div>
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

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.card {
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail__row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-size: 13px;
}

.detail__label {
  flex: 0 0 72px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--sr-color-success) 14%, transparent);
  color: var(--sr-color-success);
  font-size: 32px;
  font-weight: 600;
}
</style>
