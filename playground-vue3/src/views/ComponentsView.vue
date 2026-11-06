<script setup lang="ts">
import { ref } from 'vue'

import { SrButton, SrIcon, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'ComponentsView' })

/** 变体清单 */
const variants = ['primary', 'secondary', 'outline', 'text', 'success', 'warning', 'danger'] as const

/** 标签语义类型 */
const tagTypes = ['default', 'primary', 'info', 'success', 'warning', 'danger'] as const

/** 可关闭标签的演示数据 */
const closableTags = ref(['设计', '开发', '测试'])

/**
 * 移除一个可关闭标签
 * @param index 下标
 */
function removeClosableTag(index: number): void {
  closableTags.value.splice(index, 1)
}

/** 尺寸清单 */
const sizes = ['xs', 'sm', 'md', 'lg'] as const

/**
 * 图标清单：每个都带中文含义，避免只列名字看不出在演示什么
 * 这些名字会被 gen-offline-icons 扫描并收录进离线集合
 */
const iconCatalog = [
  { name: 'lucide:house', label: '主页' },
  { name: 'lucide:search', label: '搜索' },
  { name: 'lucide:check', label: '确认' },
  { name: 'lucide:circle-check', label: '已完成' },
  { name: 'lucide:x', label: '关闭' },
  { name: 'lucide:circle-x', label: '取消' },
  { name: 'lucide:alert-triangle', label: '警告' },
  { name: 'lucide:info', label: '信息' },
  { name: 'lucide:trash', label: '删除' },
  { name: 'lucide:pencil', label: '编辑' },
  { name: 'lucide:eye', label: '可见' },
  { name: 'lucide:eye-off', label: '隐藏' },
  { name: 'lucide:plus', label: '新增' },
  { name: 'lucide:image', label: '图片' },
  { name: 'lucide:play', label: '播放' },
  { name: 'lucide:music', label: '音乐' },
  { name: 'lucide:download', label: '下载' },
  { name: 'lucide:loader-circle', label: '加载' },
  { name: 'lucide:sun', label: '亮色' },
  { name: 'lucide:moon-star', label: '暗色' },
  { name: 'lucide:settings', label: '设置' },
]

/** 颜色继承演示：图标都不传 color，靠父级 currentColor 上色 */
const colorDemos = [
  { icon: 'lucide:image', color: 'var(--sr-color-info)', label: '蓝色 · 图片' },
  { icon: 'lucide:play', color: 'var(--sr-color-success)', label: '绿色 · 播放' },
  { icon: 'lucide:music', color: 'var(--sr-color-warning)', label: '橙色 · 音乐' },
]

/** 变换演示：每项都有明确说明 */
const transformDemos = [
  { label: 'spin 匀速旋转', name: 'lucide:loader-circle', props: { spin: true } },
  { label: 'rotate 45°', name: 'lucide:plus', props: { rotate: 45 } },
  { label: 'rotate 90°', name: 'lucide:download', props: { rotate: 90 } },
  { label: 'flip 水平', name: 'lucide:pencil', props: { flip: 'horizontal' } },
  { label: 'flip 垂直', name: 'lucide:download', props: { flip: 'vertical' } },
  { label: 'flip 双向', name: 'lucide:play', props: { flip: 'both' } },
] as const

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
      <h2 class="panel__title">标签</h2>
      <p class="panel__desc">
        用于状态、分类、多选值这类短文本标记。一个基色同时驱动浅色与深色两档：
        浅色是淡底深字，深色是实底白字（只压 15% 黑，不会变成近黑的重色块）。
        <code style="font-family: var(--sr-font-family-mono)">color</code> 可直接换基色， 两档派生逻辑照旧。
      </p>

      <div style="display: grid; gap: 10px; margin-bottom: 16px">
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
          <span style="width: 44px; font-size: 12px; color: var(--sr-color-text-tertiary)">浅色</span>
          <SrTag v-for="type in tagTypes" :key="type" :type="type">{{ type }}</SrTag>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
          <span style="width: 44px; font-size: 12px; color: var(--sr-color-text-tertiary)">深色</span>
          <SrTag v-for="type in tagTypes" :key="type" :type="type" variant="dark">
            {{ type }}
          </SrTag>
        </div>
      </div>

      <div class="tag-frost">
        <SrTag type="primary">磨砂</SrTag>
        <SrTag type="success">半透</SrTag>
        <SrTag type="warning">柔光</SrTag>
        <SrTag color="#8b5cf6" variant="dark">深色</SrTag>
        <span class="tag-frost__hint">← 有色背景上才看得出背后被模糊</span>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 16px">
        <SrTag color="#8b5cf6">自定义 #8b5cf6</SrTag>
        <SrTag color="#8b5cf6" variant="dark">深色</SrTag>
        <SrTag color="#0ea5e9" round>#0ea5e9</SrTag>
        <SrTag color="#0ea5e9" variant="dark" round>深色</SrTag>
        <span style="font-size: 12px; color: var(--sr-color-text-tertiary)">← color 自定义基色</span>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 16px">
        <SrTag v-for="size in sizes" :key="size" type="primary" :size="size">{{ size }}</SrTag>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 16px">
        <SrTag type="success" round>稳定</SrTag>
        <SrTag type="warning" round>预览</SrTag>
        <SrTag type="default" round>已归档</SrTag>
        <span style="font-size: 12px; color: var(--sr-color-text-tertiary)">← round 胶囊</span>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
        <SrTag
          v-for="(tag, index) in closableTags"
          :key="tag"
          type="primary"
          closable
          @close="removeClosableTag(index)"
        >
          {{ tag }}
        </SrTag>
        <SrButton
          v-if="closableTags.length < 3"
          size="sm"
          variant="text"
          @click="closableTags = ['设计', '开发', '测试']"
        >
          恢复
        </SrButton>
      </div>

      <h3 style="font-size: 14px; margin: 20px 0 8px">SrTag Props 速查</h3>
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
            <td><code>type</code></td>
            <td><code>'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger'</code></td>
            <td><code>'default'</code></td>
            <td>语义类型，决定底色与文字色</td>
          </tr>
          <tr>
            <td><code>variant</code></td>
            <td><code>'light' | 'dark'</code></td>
            <td><code>'light'</code></td>
            <td>配色深浅；dark 为同色系实底白字</td>
          </tr>
          <tr>
            <td><code>color</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>自定义基色（任意 CSS 颜色），覆盖 type 的基色</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>'xs' | 'sm' | 'md' | 'lg'</code></td>
            <td><code>'md'</code></td>
            <td>尺寸与按钮同为四档，高度 18 / 20 / 24 / 28</td>
          </tr>
          <tr>
            <td><code>closable</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>显示关闭按钮，点击派发 <code>close</code> 且不冒泡</td>
          </tr>
          <tr>
            <td><code>round</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>胶囊圆角</td>
          </tr>
        </tbody>
      </table>
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
            <td>'primary' | 'secondary' | 'outline' | 'text' | 'success' | 'warning' | 'danger'</td>
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
      <h2 class="panel__title">图标清单</h2>
      <p class="panel__desc">
        图标走 Iconify 离线集合，<code style="font-family: var(--sr-font-family-mono)">name</code>
        用「集合:图标名」。构建前由子集化脚本扫描源码收录，未用到的图标不会打进产物。
        下面每个图标都标了用途，鼠标悬停可看完整名称。
      </p>

      <div class="icon-grid">
        <div v-for="item in iconCatalog" :key="item.name" class="icon-card" :title="item.name">
          <sr-icon :name="item.name" :size="24" :label="item.label" />
          <span class="icon-card__label">{{ item.label }}</span>
          <code class="icon-card__name">{{ item.name }}</code>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">颜色（color）与继承</h2>
      <p class="panel__desc">
        不传 <code style="font-family: var(--sr-font-family-mono)">color</code> 时继承父级
        <code style="font-family: var(--sr-font-family-mono)">currentColor</code>，
        因此图标会随父容器、按钮或链接的文字色自动变化。下面三个图标都没有传 color， 颜色全部来自外层元素。
      </p>

      <div class="icon-demo-row">
        <div v-for="demo in colorDemos" :key="demo.label" class="icon-demo" :style="{ color: demo.color }">
          <sr-icon :name="demo.icon" :size="30" :label="demo.label" />
          <span class="icon-demo__label">{{ demo.label }}</span>
        </div>
      </div>

      <div class="icon-demo-row" style="margin-top: 16px">
        <sr-button variant="primary" icon="lucide:plus">继承按钮文字色</sr-button>
        <sr-button variant="success" icon="lucide:check">成功</sr-button>
        <sr-button variant="warning" icon="lucide:alert-triangle">警告</sr-button>
        <sr-button variant="text" icon="lucide:music">文字按钮也继承</sr-button>
      </div>

      <p class="panel__desc" style="margin: 12px 0 0">
        也可以显式指定颜色覆盖继承：
        <sr-icon name="lucide:sun" :size="22" color="var(--sr-color-primary)" label="指定主色" />
        <sr-icon name="lucide:heart" :size="22" color="var(--sr-color-danger)" label="指定危险色" />
      </p>
    </section>

    <section class="panel">
      <h2 class="panel__title">动态图标与变换</h2>
      <p class="panel__desc">
        <code style="font-family: var(--sr-font-family-mono)">spin</code> 是持续旋转动画（加载场景）；
        <code style="font-family: var(--sr-font-family-mono)">rotate</code> 是静态角度；
        <code style="font-family: var(--sr-font-family-mono)">flip</code> 是镜像。
        三者可叠加使用。切到顶栏「动效：无」时 spin 会停止。
      </p>

      <div class="icon-demo-row">
        <div v-for="demo in transformDemos" :key="demo.label" class="icon-demo">
          <sr-icon :name="demo.name" :size="30" v-bind="demo.props" :label="demo.label" />
          <span class="icon-demo__label">{{ demo.label }}</span>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">在按钮中使用</h2>
      <p class="panel__desc">
        按钮的 <code style="font-family: var(--sr-font-family-mono)">icon</code> prop 会自动计算尺寸， 也可用
        <code style="font-family: var(--sr-font-family-mono)">#icon</code> 插槽完全自定义。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button variant="primary" icon="lucide:check">带图标</sr-button>
        <sr-button variant="outline" icon="lucide:x" icon-position="right">图标在右</sr-button>
        <sr-button variant="secondary">
          <template #icon><sr-icon name="lucide:search" /></template>
          自定义图标插槽
        </sr-button>
        <sr-button variant="secondary" :loading="loading" @click="triggerLoading">
          <template #loading><sr-icon name="lucide:loader-circle" :size="18" spin /></template>
          自定义加载指示器
        </sr-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 给标签一块彩色渐变底，才看得出磨砂与半透 */
.tag-frost {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: var(--sr-radius-sm);
  background:
    repeating-linear-gradient(45deg, rgba(255, 138, 76, 0.35) 0 12px, rgba(16, 185, 129, 0.32) 12px 24px),
    var(--sr-color-bg-sunken);
}

.tag-frost__hint {
  font-size: 12px;
  color: var(--sr-color-text-tertiary);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
}

.icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  /* 固定高度 + 隐藏溢出：图标名长短不一，靠内容撑高会让整行卡片被拉伸 */
  height: 100px;
  padding: 10px 6px;
  overflow: hidden;
  border: 1px solid var(--sr-color-border);
  border-radius: var(--sr-radius-base);
  background: var(--sr-color-bg-elevated);
  transition: border-color var(--sr-motion-duration-fast) var(--sr-motion-easing-standard);
}

.icon-card:hover {
  border-color: var(--sr-color-primary);
}

.icon-card__label {
  max-width: 100%;
  font-size: 12px;
  color: var(--sr-color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-card__name {
  /* 最多两行：lucide:alert-triangle 这类长名能完整显示，
     再多就省略，卡片高度始终固定不会互相拉伸 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  max-width: 100%;
  font-family: var(--sr-font-family-mono);
  font-size: 9px;
  line-height: 1.35;
  color: var(--sr-color-text-tertiary);
  overflow: hidden;
  overflow-wrap: anywhere;
}

.icon-demo-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.icon-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 104px;
  padding: 14px 10px;
  border: 1px solid var(--sr-color-border);
  border-radius: var(--sr-radius-base);
  background: var(--sr-color-bg-elevated);
}

.icon-demo__label {
  font-size: 11px;
  color: var(--sr-color-text-secondary);
  text-align: center;
}
</style>
