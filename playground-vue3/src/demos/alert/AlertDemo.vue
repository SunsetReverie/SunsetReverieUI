<script setup lang="ts">
import { ref } from 'vue'
import { SrAlert, SrButton, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'AlertDemo' })

/** 可关闭的那条是否可以恢复 */
const showAgain = ref(false)

/** 动态内容 */
const dynamic = ref('这条文案会变')

/** 类型列表 */
const TYPES = [
  { type: 'info' as const, label: '通用提示' },
  { type: 'success' as const, label: '操作成功' },
  { type: 'warning' as const, label: '需要注意' },
  { type: 'error' as const, label: '出错了' },
]

/**
 * 换一句文案
 * @param text 新文案
 */
function update(text: string): void {
  dynamic.value = text
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>四种类型</h3>
      <div class="stack">
        <SrAlert
          v-for="item in TYPES"
          :key="item.type"
          :type="item.type"
          :title="item.label"
          description="这里是一段说明文字，用来解释发生了什么、以及下一步该做什么。"
        />
      </div>
    </section>

    <section>
      <h3>只有描述</h3>
      <div class="stack">
        <SrAlert description="单行提示，不带标题，适合轻量说明。" />
        <SrAlert type="success" description="保存成功。" />
      </div>
      <p class="hint">不传 title 时只有一行文字，图标与背景保留</p>
    </section>

    <section>
      <h3>可关闭</h3>
      <div class="stack">
        <SrAlert type="warning" title="这张卡片可以关掉" description="点右侧的 × 试试" closable />
      </div>
      <div class="row" style="margin-top: 10px">
        <SrButton size="xs" variant="outline" @click="showAgain = !showAgain">切换恢复</SrButton>
        <span class="hint" style="margin: 0">{{ showAgain ? '已恢复' : '关闭后不再出现' }}</span>
      </div>
      <div class="stack" style="margin-top: 10px">
        <SrAlert
          v-if="showAgain"
          type="info"
          title="我回来了"
          description="用 v-if 控制即可重新出现"
          closable
        />
      </div>
    </section>

    <section>
      <h3>通栏（banner）</h3>
      <div class="banner-wrap">
        <SrAlert type="warning" banner description="通栏模式贴住容器边缘，适合放在页面顶部横贯一条。" />
      </div>
      <p class="hint">去掉左右边框和圆角，通常配在页面或卡片的顶部</p>
    </section>

    <section>
      <h3>居中（center）</h3>
      <SrAlert
        type="info"
        center
        title="居中排版"
        description="图标、标题、描述纵向排列并整体居中，适合放在空状态或结果页上方。"
      />
    </section>

    <section>
      <h3>隐藏图标</h3>
      <div class="stack">
        <SrAlert
          :show-icon="false"
          title="没有图标"
          description="showIcon 为 false 时只剩文字，适合极简风格。"
        />
      </div>
    </section>

    <section>
      <h3>富内容（插槽）</h3>
      <SrAlert type="error" title="提交失败">
        <p style="margin: 0">服务端返回了 3 个字段错误：</p>
        <ul style="margin: 6px 0 0; padding-left: 18px">
          <li>邮箱格式不正确</li>
          <li>手机号已被占用</li>
          <li>密码强度不足</li>
        </ul>
      </SrAlert>
      <p class="hint">默认插槽可以放列表、链接、按钮组，比纯文本灵活</p>
    </section>

    <section>
      <h3>标题插槽</h3>
      <SrAlert type="success">
        <template #title>
          部署成功
          <SrTag type="success" size="sm" style="margin-left: 6px">v1.2.0</SrTag>
        </template>
        <span
          >用时 42 秒，点击查看<a href="#/c/alert" style="color: var(--sr-color-primary-text)"
            >构建日志</a
          ></span
        >
      </SrAlert>
    </section>

    <section>
      <h3>动态内容</h3>
      <SrAlert :type="dynamic.includes('失败') ? 'error' : 'info'" :description="dynamic" />
      <div class="row" style="margin-top: 10px">
        <SrButton size="xs" variant="outline" @click="update('正在同步数据…')">同步中</SrButton>
        <SrButton size="xs" variant="outline" @click="update('同步完成，共 128 条')">完成</SrButton>
        <SrButton size="xs" variant="outline" @click="update('同步失败：网络超时')">失败</SrButton>
      </div>
      <p class="hint">文案和类型都可以响应式变化，不需要重新挂载</p>
    </section>

    <section>
      <h3>组合：表单顶部提示</h3>
      <div class="card" style="padding: 0; overflow: hidden; max-width: 520px">
        <SrAlert type="warning" banner description="有 2 个必填项还没填，提交前请检查。" />
        <div style="padding: 14px">
          <p class="hint" style="margin: 0">通栏提示贴在卡片顶部，下面是表单内容——这是后台里最常见的组合。</p>
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
  margin: 0 0 10px;
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
  gap: 10px;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.card {
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.banner-wrap {
  max-width: 560px;
  overflow: hidden;
  border-radius: var(--sr-radius-base);
}
</style>
