<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  SrButton,
  SrCheckbox,
  SrCheckboxGroup,
  SrRadio,
  SrRadioGroup,
  SrSpinner,
  SrSwitch,
  SrTooltip,
} from '@sunset-reverie/ui'

defineOptions({ name: 'ControlsView' })

/** 单个复选框 */
const agreed = ref(false)
/** 半选 */
const partial = ref(false)
/** 分组复选框 */
const fruits = ref<(string | number)[]>(['apple'])
/** 单选 */
const plan = ref<string | number>('monthly')
/** 开关 */
const notify = ref(true)
const darkMode = ref(false)
const loadingSwitch = ref(false)
const busy = ref(false)

/** 尺寸档位 */
const sizes = ['xs', 'sm', 'md', 'lg'] as const

/** 水果选项 */
const fruitOptions = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '樱桃' },
]

/** 全部选中 / 全不选，用于演示半选的计算来源 */
const allChecked = computed(() => fruits.value.length === fruitOptions.length)

/**
 * 全选切换
 * @param checked 是否全选
 */
function toggleAll(checked: boolean): void {
  fruits.value = checked ? fruitOptions.map((item) => item.value) : []
}

/**
 * 触发一次加载态
 */
function mockSubmit(): void {
  busy.value = true
  window.setTimeout(() => {
    busy.value = false
  }, 1600)
}
</script>

<template>
  <div>
    <section class="panel">
      <h2 class="panel__title">复选框</h2>
      <p class="panel__desc">
        半选状态写入的是 DOM 属性 <code style="font-family: var(--sr-font-family-mono)">indeterminate</code>，
        它没有对应的 HTML attribute，所以只能通过 ref 赋值。下面的「全选」会根据子项自动进入半选。
      </p>

      <div style="display: grid; gap: 14px">
        <sr-checkbox v-model="agreed" label="我已阅读并同意服务条款" />

        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center">
          <sr-checkbox v-model="partial" indeterminate label="半选（手动）" />
          <sr-checkbox :model-value="true" disabled label="禁用且选中" />
          <sr-checkbox :model-value="false" disabled label="禁用未选" />
        </div>

        <div>
          <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 8px">
            分组（已选 {{ fruits.length }} / {{ fruitOptions.length }}）
          </div>

          <sr-checkbox-group v-model="fruits" :class="{ 'is-empty': !fruits.length }">
            <sr-checkbox
              :model-value="allChecked"
              :indeterminate="fruits.length > 0 && !allChecked"
              label="全选"
              @update:model-value="toggleAll"
            />
            <sr-checkbox
              v-for="item in fruitOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </sr-checkbox-group>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">单选框</h2>
      <p class="panel__desc">
        同组内的原生 radio 共享 name，保证浏览器层面的互斥；换组不会互相干扰（未指定 name 时自动生成）。
      </p>

      <div style="display: grid; gap: 14px">
        <sr-radio-group v-model="plan">
          <sr-radio value="monthly" label="按月付费" />
          <sr-radio value="yearly" label="按年付费（省 20%）" />
          <sr-radio value="once" label="一次性买断" />
        </sr-radio-group>

        <sr-radio-group :model-value="'a'" disabled>
          <sr-radio value="a" label="禁用项 A" />
          <sr-radio value="b" label="禁用项 B" />
        </sr-radio-group>

        <code style="font-size: 12px; color: var(--sr-color-text-secondary)">plan = "{{ plan }}"</code>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">开关</h2>
      <p class="panel__desc">
        用 <code style="font-family: var(--sr-font-family-mono)">&lt;button role="switch"&gt;</code> 承载，
        Enter / Space 由浏览器原生支持，不需要手写键盘分支。
      </p>

      <div style="display: grid; gap: 14px">
        <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center">
          <sr-switch v-model="notify" label="通知" />
          <sr-switch v-model="darkMode" checked-text="夜间" unchecked-text="日间" />
          <sr-switch v-model="loadingSwitch" loading label="加载中" />
          <sr-switch :model-value="true" disabled label="禁用开启" />
          <sr-switch :model-value="false" disabled label="禁用关闭" />
        </div>

        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center">
          <sr-switch v-for="size in sizes" :key="size" :size="size" :model-value="true" />
          <span style="font-size: 12px; color: var(--sr-color-text-secondary)">四档尺寸</span>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">加载指示器</h2>
      <p class="panel__desc">
        两段圆环（底轨 + 1/4 弧），比单段弧更有「在轨道上跑」的观感。 减少动效偏好下降速而非停止 ——
        完全静止会被误认为卡死。
      </p>

      <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center; margin-bottom: 16px">
        <sr-spinner v-for="size in sizes" :key="size" :size="size" :label="`加载中 ${size}`" />
        <sr-spinner :size="24" color="var(--sr-color-success)" label="成功中" />
        <sr-spinner :size="24" color="var(--sr-color-danger)" label="失败重试" />
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button variant="primary" :loading="busy" @click="mockSubmit">
          {{ busy ? '处理中' : '模拟提交' }}
        </sr-button>
        <sr-button variant="secondary" :disabled="busy"> 同组按钮 </sr-button>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">文字提示</h2>
      <p class="panel__desc">
        位置由 <code style="font-family: var(--sr-font-family-mono)">srComputeFloating</code> 计算：
        主轴上放不下会翻到对面，交叉轴超出视口会平移回来。试试把窗口缩到很窄，再悬停最右边的按钮。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px">
        <sr-tooltip content="默认在上方" placement="top">
          <sr-button variant="secondary">上</sr-button>
        </sr-tooltip>

        <sr-tooltip content="下方提示" placement="bottom">
          <sr-button variant="secondary">下</sr-button>
        </sr-tooltip>

        <sr-tooltip content="左侧提示" placement="left">
          <sr-button variant="secondary">左</sr-button>
        </sr-tooltip>

        <sr-tooltip content="右侧提示" placement="right">
          <sr-button variant="secondary">右</sr-button>
        </sr-tooltip>

        <sr-tooltip content="这一条不会显示" disabled>
          <sr-button variant="text">禁用</sr-button>
        </sr-tooltip>

        <sr-tooltip placement="top" :max-width="320">
          <template #content>
            <div style="line-height: 1.6">
              <strong>富文本内容</strong>
              <div style="opacity: 0.8">支持任意节点，而不仅是纯文本。</div>
            </div>
          </template>
          <sr-button variant="outline">富文本</sr-button>
        </sr-tooltip>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px">
        <sr-tooltip content="黑色玻璃（默认）" variant="dark">
          <sr-button variant="secondary">深色</sr-button>
        </sr-tooltip>

        <sr-tooltip content="白色玻璃" variant="light">
          <sr-button variant="secondary">浅色</sr-button>
        </sr-tooltip>

        <sr-tooltip content="自定义背景色" background-color="rgba(16, 185, 129, 0.9)">
          <sr-button variant="outline">自定义</sr-button>
        </sr-tooltip>
      </div>

      <p style="font-size: 13px; color: var(--sr-color-text-secondary); margin: 0">
        玻璃风格下气泡是半透底 + 背景模糊 + 亮边高光，扁平风格自动退回实色。用
        <code style="font-family: var(--sr-font-family-mono)">variant</code> 切换黑 / 白预设， 或用
        <code style="font-family: var(--sr-font-family-mono)">background-color</code> 传任意 CSS 颜色；
        气泡与触发元素通过
        <code style="font-family: var(--sr-font-family-mono)">aria-describedby</code> 关联。
      </p>
    </section>

    <section class="panel">
      <h2 class="panel__title">选择控件 Props 速查</h2>
      <p class="panel__desc">
        本页四个组件的常用 props。<code style="font-family: var(--sr-font-family-mono)">size</code> 不传时继承
        <code style="font-family: var(--sr-font-family-mono)">SrConfigProvider</code> 的全局配置；
        带「组」前缀的 props 属于对应的 Group 组件。
      </p>

      <h3 style="font-size: 14px; margin: 18px 0 8px">SrCheckbox / SrCheckboxGroup</h3>
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
            <td><code>modelValue</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>单独使用时的 v-model</td>
          </tr>
          <tr>
            <td><code>value</code></td>
            <td><code>string | number</code></td>
            <td><code>—</code></td>
            <td>组内选项标识；不传时按独立模式工作（如组内的「全选」框）</td>
          </tr>
          <tr>
            <td><code>indeterminate</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>半选，只影响视觉；优先于选中态</td>
          </tr>
          <tr>
            <td><code>disabled</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>禁用，组级设置会下发给子项</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>文字，也可用默认插槽</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>'xs' | 'sm' | 'md' | 'lg'</code></td>
            <td><code>继承</code></td>
            <td>尺寸，自身优先于组级</td>
          </tr>
          <tr>
            <td><code>name</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>原生 name</td>
          </tr>
          <tr>
            <td><code>（组）modelValue</code></td>
            <td><code>(string | number)[]</code></td>
            <td><code>[]</code></td>
            <td>已选值集合，v-model</td>
          </tr>
          <tr>
            <td><code>（组）disabled</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>整组禁用</td>
          </tr>
        </tbody>
      </table>

      <h3 style="font-size: 14px; margin: 18px 0 8px">SrRadio / SrRadioGroup</h3>
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
            <td><code>modelValue</code></td>
            <td><code>string | number | boolean</code></td>
            <td><code>—</code></td>
            <td>单独使用时的 v-model</td>
          </tr>
          <tr>
            <td><code>value</code></td>
            <td><code>string | number | boolean</code></td>
            <td><code>—</code></td>
            <td>组内选项标识</td>
          </tr>
          <tr>
            <td><code>disabled</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>禁用，组级设置会下发给子项</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>文字，也可用默认插槽</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>'xs' | 'sm' | 'md' | 'lg'</code></td>
            <td><code>继承</code></td>
            <td>尺寸，自身优先于组级</td>
          </tr>
          <tr>
            <td><code>name</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>原生 name；同组自动共享</td>
          </tr>
          <tr>
            <td><code>（组）modelValue</code></td>
            <td><code>string | number | boolean</code></td>
            <td><code>—</code></td>
            <td>当前选中值，v-model</td>
          </tr>
          <tr>
            <td><code>（组）disabled</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>整组禁用</td>
          </tr>
        </tbody>
      </table>

      <h3 style="font-size: 14px; margin: 18px 0 8px">SrSwitch</h3>
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
            <td><code>modelValue</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>开关状态，v-model</td>
          </tr>
          <tr>
            <td><code>disabled</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>禁用</td>
          </tr>
          <tr>
            <td><code>loading</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>加载态，滑块内显示 spinner 且不可交互</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>'xs' | 'sm' | 'md' | 'lg'</code></td>
            <td><code>继承</code></td>
            <td>尺寸；滑轨与滑块等比缩放</td>
          </tr>
          <tr>
            <td><code>checkedText</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>开启时显示的文字</td>
          </tr>
          <tr>
            <td><code>uncheckedText</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>关闭时显示的文字</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>无障碍标签</td>
          </tr>
        </tbody>
      </table>

      <h3 style="font-size: 14px; margin: 18px 0 8px">SrTooltip</h3>
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
            <td><code>content</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>文本内容，也可用 content 插槽放富文本</td>
          </tr>
          <tr>
            <td><code>variant</code></td>
            <td><code>'dark' | 'light'</code></td>
            <td><code>'dark'</code></td>
            <td>黑 / 白玻璃配色预设，不随明暗主题翻转</td>
          </tr>
          <tr>
            <td><code>background-color</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>自定义背景色（任意 CSS 颜色），覆盖 variant 底色</td>
          </tr>
          <tr>
            <td><code>placement</code></td>
            <td><code>SrPlacement</code></td>
            <td><code>'top'</code></td>
            <td>期望方位，空间不足自动翻转</td>
          </tr>
          <tr>
            <td><code>showDelay</code> / <code>hideDelay</code></td>
            <td><code>number</code></td>
            <td><code>120</code> / <code>80</code></td>
            <td>显示 / 隐藏延迟（ms）</td>
          </tr>
          <tr>
            <td><code>offset</code></td>
            <td><code>number</code></td>
            <td><code>8</code></td>
            <td>与触发元素的间距（px）</td>
          </tr>
          <tr>
            <td><code>arrow</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>是否显示小三角</td>
          </tr>
          <tr>
            <td><code>maxWidth</code></td>
            <td><code>number</code></td>
            <td><code>280</code></td>
            <td>气泡最大宽度（px）</td>
          </tr>
          <tr>
            <td><code>disabled</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>禁用后不响应任何交互</td>
          </tr>
          <tr>
            <td><code>closeOnClick</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>点击触发元素时是否关闭</td>
          </tr>
          <tr>
            <td><code>teleportTo</code></td>
            <td><code>string | HTMLElement</code></td>
            <td><code>'body'</code></td>
            <td>挂载目标</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
