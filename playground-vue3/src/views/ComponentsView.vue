<script setup lang="ts">
import { ref } from 'vue'

import { SrButton, SrIcon } from '@sunset-reverie/ui'

defineOptions({ name: 'ComponentsView' })

/** 变体清单 */
const variants = ['primary', 'secondary', 'outline', 'text', 'danger'] as const

/** 尺寸清单 */
const sizes = ['xs', 'sm', 'md', 'lg'] as const

/** 演示用图标（同时会被 gen-offline-icons 扫描收录） */
const icons = ['mdi:home', 'mdi:check', 'mdi:magnify', 'mdi:loading', 'ph:sun', 'ph:moon-stars']

/** 加载态演示 */
const loading = ref(false)

/**
 * 触发一次 2 秒的加载态
 * @returns {void}
 */
function triggerLoading(): void {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <div>
    <section class="panel">
      <h2 class="panel__title">按钮变体</h2>
      <p class="panel__desc">
        变体只改 CSS 变量的值，基础结构与交互逻辑完全共用。切到暗色 / 玻璃风格后颜色自动适配。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button v-for="variant in variants" :key="variant" :variant="variant">
          {{ variant }}
        </sr-button>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">尺寸</h2>
      <p class="panel__desc">
        尺寸走内联 CSS 变量，支持按断点分档。下方最后一个按钮的 size 是
        <code style="font-family: var(--sr-font-family-mono)">{ xs: 'sm', md: 'lg' }</code>
        —— 缩放窗口看它切换。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center">
        <sr-button v-for="size in sizes" :key="size" :size="size" variant="primary">
          {{ size }}
        </sr-button>
        <sr-button :size="{ xs: 'sm', md: 'lg' }" variant="outline">响应式尺寸</sr-button>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">状态</h2>
      <p class="panel__desc">
        加载态用 <code style="font-family: var(--sr-font-family-mono)">opacity: 0</code>
        隐藏内容而非移除，宽度因此不会塌陷，避免布局跳动。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button variant="primary" :loading="loading" @click="triggerLoading"> 点我加载 </sr-button>
        <sr-button variant="primary" disabled>禁用</sr-button>
        <sr-button variant="primary" round>胶囊按钮</sr-button>
      </div>

      <div style="margin-top: 12px">
        <sr-button variant="secondary" block>占满整行的按钮</sr-button>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">自定义外观</h2>
      <p class="panel__desc">
        <code style="font-family: var(--sr-font-family-mono)">radius</code> 控制圆角（数字按
        px、字符串原样透传）， <code style="font-family: var(--sr-font-family-mono)">bg</code> 自定义背景色，
        <code style="font-family: var(--sr-font-family-mono)">color</code> 自定义文字色。 hover / active
        以及玻璃辉光都会自动从
        <code style="font-family: var(--sr-font-family-mono)">bg</code> 派生，不用另外传值。 同时给
        <code style="font-family: var(--sr-font-family-mono)">round</code> 和
        <code style="font-family: var(--sr-font-family-mono)">radius</code> 时，以 radius 为准。
      </p>

      <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 8px">
        默认圆角跟随质感：扁平 6px · 玻璃 10px（比其它表面小 2px）
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center">
        <sr-button variant="primary" :radius="0">直角</sr-button>
        <sr-button variant="primary" :radius="4">radius = 4</sr-button>
        <sr-button variant="primary" radius="1rem">radius = 1rem</sr-button>
        <sr-button variant="primary" round>round 胶囊</sr-button>
        <sr-button variant="primary" round :radius="6">round + radius = 6</sr-button>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 14px">
        <sr-button bg="#7A64B5">紫色背景</sr-button>
        <sr-button bg="#2578F5" :radius="16">蓝色 + 大圆角</sr-button>
        <sr-button bg="#2E9B4E" color="#0F1216" :radius="2">绿底深字</sr-button>
        <sr-button variant="outline" bg="#F5456B">variant 被 bg 覆盖</sr-button>
        <sr-button variant="secondary" color="var(--sr-color-danger)">只改文字色</sr-button>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">SrButton Props 速查</h2>
      <p class="panel__desc">当前组件的全部 props。带「新增」标记的是本轮加入的自定义外观能力。</p>

      <table class="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>variant</code></td>
            <td>'primary' | 'secondary' | 'outline' | 'text' | 'danger'</td>
            <td>'secondary'</td>
            <td>视觉变体</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td>SrSize | 按断点分档的对象</td>
            <td>继承全局配置</td>
            <td>xs / sm / md / lg</td>
          </tr>
          <tr>
            <td><code>disabled</code></td>
            <td>boolean</td>
            <td>false</td>
            <td>禁用</td>
          </tr>
          <tr>
            <td><code>loading</code></td>
            <td>boolean</td>
            <td>false</td>
            <td>加载中，保留宽度不塌陷；可用 #loading 换指示器</td>
          </tr>
          <tr>
            <td><code>block</code></td>
            <td>boolean</td>
            <td>false</td>
            <td>占满父容器宽度</td>
          </tr>
          <tr>
            <td><code>round</code></td>
            <td>boolean</td>
            <td>false</td>
            <td>胶囊圆角快捷方式</td>
          </tr>
          <tr class="is-new">
            <td><code>radius</code> <em>新增</em></td>
            <td>number | string</td>
            <td>跟随质感（6 / 10px）</td>
            <td>数字按 px，字符串原样透传；优先于 round</td>
          </tr>
          <tr class="is-new">
            <td><code>bg</code> <em>新增</em></td>
            <td>string</td>
            <td>''</td>
            <td>自定义背景色，hover / active / 辉光自动派生</td>
          </tr>
          <tr class="is-new">
            <td><code>color</code> <em>新增</em></td>
            <td>string</td>
            <td>''</td>
            <td>自定义文字色；单独传也生效</td>
          </tr>
          <tr>
            <td><code>htmlType</code></td>
            <td>'button' | 'submit' | 'reset'</td>
            <td>'button'</td>
            <td>原生 type（避开组件 type 语义）</td>
          </tr>
          <tr>
            <td><code>icon</code></td>
            <td>string</td>
            <td>''</td>
            <td>图标名「集合:图标名」</td>
          </tr>
          <tr>
            <td><code>iconPosition</code></td>
            <td>'left' | 'right'</td>
            <td>'left'</td>
            <td>图标位置</td>
          </tr>
        </tbody>
      </table>

      <p class="panel__desc" style="margin-top: 14px; margin-bottom: 0">
        插槽：<code style="font-family: var(--sr-font-family-mono)">default</code>（文本）、
        <code style="font-family: var(--sr-font-family-mono)">icon</code>（自定义图标）、
        <code style="font-family: var(--sr-font-family-mono)">loading</code>（自定义加载指示器）。
        <code style="font-family: var(--sr-font-family-mono)">$attrs</code> 落到原生 button， 可直接写
        <code style="font-family: var(--sr-font-family-mono)">name</code>、
        <code style="font-family: var(--sr-font-family-mono)">form</code> 等属性。
      </p>
    </section>

    <section class="panel">
      <h2 class="panel__title">图标</h2>
      <p class="panel__desc">
        图标走 Iconify 离线集合，<code style="font-family: var(--sr-font-family-mono)">name</code>
        用「集合:图标名」。下面这些名字会在构建前由子集化脚本收录。
      </p>

      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-bottom: 16px">
        <span
          v-for="icon in icons"
          :key="icon"
          style="display: flex; flex-direction: column; align-items: center; gap: 4px"
        >
          <sr-icon :name="icon" :size="22" :label="icon" />
          <code style="font-size: 10px; color: var(--sr-color-text-tertiary)">{{ icon }}</code>
        </span>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px">
        <sr-button variant="primary" icon="mdi:check">带图标</sr-button>
        <sr-button variant="outline" icon="mdi:close" icon-position="right">图标在右</sr-button>
        <sr-button variant="secondary">
          <template #icon><sr-icon name="mdi:magnify" /></template>
          自定义图标插槽
        </sr-button>
      </div>

      <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap">
        <sr-icon name="ph:sun" :size="28" color="var(--sr-color-primary)" />
        <sr-icon name="mdi:loading" :size="28" spin />
        <sr-icon name="mdi:check" :size="28" rotate="45" />
        <sr-icon name="mdi:check" :size="28" flip="horizontal" />
        <sr-icon name="mdi:home" :size="28" flip="both" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.props-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.props-table th,
.props-table td {
  padding: 7px 10px;
  border-bottom: 1px solid var(--sr-color-border-subtle);
  text-align: left;
  vertical-align: top;
}

.props-table th {
  color: var(--sr-color-text-secondary);
  font-weight: var(--sr-font-weight-medium);
  background: var(--sr-color-bg-sunken);
}

.props-table code {
  font-family: var(--sr-font-family-mono);
  font-size: 12px;
  color: var(--sr-color-primary-text);
}

.props-table tr.is-new {
  background: var(--sr-color-primary-alpha-08);
}

.props-table em {
  padding: 1px 5px;
  border-radius: var(--sr-radius-full);
  background: var(--sr-color-primary);
  color: var(--sr-color-on-primary);
  font-size: 10px;
  font-style: normal;
}
</style>
