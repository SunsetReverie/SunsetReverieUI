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

      <p style="font-size: 13px; color: var(--sr-color-text-secondary); margin: 0">
        提示气泡使用反色表面（亮色深底、暗色浅底），并与触发元素通过
        <code style="font-family: var(--sr-font-family-mono)">aria-describedby</code> 关联。
      </p>
    </section>
  </div>
</template>
