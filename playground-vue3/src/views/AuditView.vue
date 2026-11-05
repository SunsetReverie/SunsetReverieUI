<script setup lang="ts">
import { ref } from 'vue'

import { SrButton, SrIcon, SrInput, SrModal, srToast } from '@sunset-reverie/ui'

defineOptions({ name: 'AuditView' })

/**
 * 四种主题组合
 * 每个格子通过 data-sr-theme / data-sr-style 建立局部主题作用域，
 * 因此一屏就能横向比对 —— 也可顺带验证 token 是否真的支持局部覆盖。
 */
const combos = [
  { key: 'light-flat', theme: 'light', style: 'flat', label: '亮色 · 扁平' },
  { key: 'light-glass', theme: 'light', style: 'glass', label: '亮色 · 玻璃' },
  { key: 'dark-flat', theme: 'dark', style: 'flat', label: '暗色 · 扁平' },
  { key: 'dark-glass', theme: 'dark', style: 'glass', label: '暗色 · 玻璃' },
]

const variants = ['primary', 'secondary', 'outline', 'text', 'danger'] as const
const sizes = ['xs', 'sm', 'md', 'lg'] as const
const icons = ['mdi:home', 'mdi:check', 'mdi:magnify', 'ph:sun', 'ph:moon-stars', 'mdi:loading']

/** 输入框演示值 */
const value = ref('夕梦 UI')

/** 弹窗（受全局主题控制，无法放进局部格子里） */
const modalOpen = ref(false)

/**
 * 分段显示：?section=button|input|icon|feedback
 * 便于逐段截图审查，不传则全部显示
 */
const section = new URLSearchParams(window.location.search).get('section')

/**
 * 判断某一段是否显示
 * @param key 段名
 * @returns 显示返回 true
 */
function show(key: string): boolean {
  return !section || section === key
}
</script>

<template>
  <div>
    <section v-if="show('button')" class="panel">
      <h2 class="panel__title">按钮 · 四组合对照</h2>
      <p class="panel__desc">
        左侧四列分别是「亮/暗 × 扁平/玻璃」。格子内的所有组件都读取该格的 CSS 变量，
        因此可以一屏比对边框、背景、文字对比度与阴影。
      </p>

      <div class="matrix">
        <div
          v-for="combo in combos"
          :key="combo.key"
          class="matrix__col"
          :data-sr-theme="combo.theme"
          :data-sr-style="combo.style"
        >
          <div class="matrix__label">{{ combo.label }}</div>

          <div class="matrix__body">
            <div class="matrix__row">
              <sr-button v-for="variant in variants" :key="variant" :variant="variant" size="sm">
                {{ variant }}
              </sr-button>
            </div>

            <div class="matrix__row">
              <sr-button v-for="size in sizes" :key="size" :size="size" variant="primary">
                {{ size }}
              </sr-button>
            </div>

            <div class="matrix__row">
              <sr-button variant="primary" loading>加载</sr-button>
              <sr-button variant="primary" disabled>禁用</sr-button>
              <sr-button variant="outline" round>胶囊</sr-button>
            </div>

            <sr-button variant="secondary" block icon="mdi:check">整行按钮</sr-button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="show('input')" class="panel">
      <h2 class="panel__title">输入框 · 四组合对照</h2>
      <p class="panel__desc">重点看边框、占位符、字数统计与三种校验态在暗色下的可辨识度。</p>

      <div class="matrix matrix--wide">
        <div
          v-for="combo in combos"
          :key="combo.key"
          class="matrix__col"
          :data-sr-theme="combo.theme"
          :data-sr-style="combo.style"
        >
          <div class="matrix__label">{{ combo.label }}</div>

          <div class="matrix__body">
            <sr-input v-model="value" size="sm" placeholder="常规输入" clearable />
            <sr-input v-model="value" status="error" size="sm" placeholder="错误态" />
            <sr-input v-model="value" status="warning" size="sm" placeholder="警告态" />
            <sr-input v-model="value" status="success" size="sm" placeholder="成功态" />
            <sr-input model-value="不可编辑" size="sm" disabled />
            <sr-input v-model="value" type="password" show-password size="sm" />
            <sr-input v-model="value" :maxlength="20" show-count size="sm" />
            <sr-input v-model="value" type="textarea" :rows="2" size="sm" />
          </div>
        </div>
      </div>
    </section>

    <section v-if="show('icon')" class="panel">
      <h2 class="panel__title">图标 · 四组合对照</h2>
      <p class="panel__desc">图标继承 currentColor，主要看与文字的视觉重量是否匹配。</p>

      <div class="matrix">
        <div
          v-for="combo in combos"
          :key="combo.key"
          class="matrix__col"
          :data-sr-theme="combo.theme"
          :data-sr-style="combo.style"
        >
          <div class="matrix__label">{{ combo.label }}</div>

          <div class="matrix__body">
            <div class="matrix__row">
              <sr-icon v-for="icon in icons" :key="icon" :name="icon" :size="20" />
            </div>

            <!-- size 现在也接受档位，与 SrButton 的 size 是同一个概念 -->
            <div class="matrix__row" style="align-items: baseline">
              <sr-icon name="ph:sun" size="xs" />
              <sr-icon name="ph:sun" size="sm" />
              <sr-icon name="ph:sun" size="md" />
              <sr-icon name="ph:sun" size="lg" color="var(--sr-color-primary)" />
            </div>

            <!-- 具体尺寸仍然可用：数字按 px，带单位字符串原样透传 -->
            <div class="matrix__row" style="align-items: baseline">
              <sr-icon name="ph:moon-stars" :size="14" />
              <sr-icon name="ph:moon-stars" :size="20" />
              <sr-icon name="ph:moon-stars" size="1.6em" />
            </div>

            <div class="matrix__row">
              <sr-icon name="mdi:loading" :size="20" spin />
              <sr-icon name="mdi:check" :size="20" rotate="45" />
              <sr-icon name="mdi:home" :size="20" flip="horizontal" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="show('feedback')" class="panel">
      <h2 class="panel__title">弹窗与轻提示</h2>
      <p class="panel__desc">
        这两个组件用 Teleport 挂到 body，脱离局部主题作用域，只能跟当前全局主题走。
        用顶部按钮切换主题/风格后再触发即可对照。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button variant="primary" @click="modalOpen = true">打开弹窗</sr-button>
        <sr-button variant="secondary" @click="srToast.success('保存成功', { duration: 0, closable: true })">
          成功提示
        </sr-button>
        <sr-button variant="danger" @click="srToast.error('请求失败', { duration: 0, closable: true })">
          错误提示
        </sr-button>
      </div>
    </section>

    <sr-modal v-model="modalOpen" title="弹窗对照" :width="440">
      <div style="display: grid; gap: 12px">
        <sr-input placeholder="弹窗内的输入框" />
        <p style="margin: 0; color: var(--sr-color-text-secondary); line-height: 1.7">
          弹窗面板使用 bg-elevated，阴影用 shadow-xl，暗色下还有额外的阴影补偿。
        </p>
      </div>

      <template #footer>
        <sr-button variant="text" @click="modalOpen = false">取消</sr-button>
        <sr-button variant="primary" @click="modalOpen = false">确定</sr-button>
      </template>
    </sr-modal>
  </div>
</template>

<style scoped>
.matrix {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.matrix--wide {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.matrix__col {
  border: 1px solid var(--sr-color-border);
  border-radius: var(--sr-radius-base);
  overflow: hidden;
}

.matrix__label {
  padding: 6px 10px;
  background: var(--sr-color-bg-sunken);
  border-bottom: 1px solid var(--sr-color-border);
  color: var(--sr-color-text-secondary);
  font-family: var(--sr-font-family-mono);
  font-size: 11px;
}

.matrix__body {
  display: grid;
  gap: 10px;
  padding: 12px;
  background: var(--sr-color-bg-page);
}

.matrix__row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
