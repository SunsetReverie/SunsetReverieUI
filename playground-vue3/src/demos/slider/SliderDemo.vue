<script setup lang="ts">
import { computed, ref } from 'vue'
import { SrSlider, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'SliderDemo' })

/** 基础值 */
const basic = ref(30)

/** 区间 */
const range = ref<[number, number]>([20, 70])

/** 温度 */
const temp = ref(22)

/** 不加吸附 */
const smooth = ref(33.3)

/** 纵向 */
const vertical = ref(60)

/** 禁用 */
const disabled = ref(40)

/** 基础文案 */
const basicText = computed(() => `${basic.value}%`)
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础用法</h3>
      <div class="slider-row">
        <SrSlider v-model="basic" />
        <SrTag size="sm">{{ basicText }}</SrTag>
      </div>
      <p class="hint">拖动滑块或点击轨道任意位置；也可以用方向键微调</p>
    </section>

    <section>
      <h3>步长（step）</h3>
      <div class="stack">
        <div class="slider-row">
          <span class="label">step = 1</span>
          <SrSlider :model-value="50" :step="1" />
        </div>
        <div class="slider-row">
          <span class="label">step = 10</span>
          <SrSlider :model-value="50" :step="10" />
        </div>
        <div class="slider-row">
          <span class="label">step = 25 + 间断点</span>
          <SrSlider :model-value="50" :step="25" show-stops />
        </div>
      </div>
      <p class="hint">showStops 在每两个步长之间画一个小点，让「会吸附到哪」变得可见</p>
    </section>

    <section>
      <h3>自定义范围</h3>
      <div class="slider-row">
        <SrSlider v-model="temp" :min="-20" :max="60" :step="1" :format-tooltip="(v: number) => `${v}°C`" />
        <SrTag size="sm">{{ temp }}°C</SrTag>
      </div>
      <p class="hint">min / max 可以是负数；formatTooltip 给数值加单位</p>
    </section>

    <section>
      <h3>区间选择（range）</h3>
      <div class="slider-row">
        <SrSlider v-model="range" range />
        <SrTag size="sm">{{ range[0] }} ~ {{ range[1] }}</SrTag>
      </div>
      <p class="hint">两个滑块不会交叉；拖左边的超过右边时，会自动顶到右边位置</p>
    </section>

    <section>
      <h3>不吸附（step = 0）</h3>
      <div class="slider-row">
        <SrSlider v-model="smooth" :step="0" :format-tooltip="(v: number) => v.toFixed(1)" />
        <SrTag size="sm">{{ smooth.toFixed(1) }}</SrTag>
      </div>
      <p class="hint">关掉 step 后取连续值，适合精度要求高的场景</p>
    </section>

    <section>
      <h3>纵向（vertical）</h3>
      <div class="vertical-wrap">
        <SrSlider v-model="vertical" vertical />
        <SrTag size="sm">{{ vertical }}%</SrTag>
      </div>
      <p class="hint">纵向适合放在侧边当音量、亮度这类控制器</p>
    </section>

    <section>
      <h3>禁用</h3>
      <div class="slider-row">
        <SrSlider v-model="disabled" disabled />
        <SrTag size="sm">{{ disabled }}</SrTag>
      </div>
      <p class="hint">禁用状态下轨道变灰、滑块不可拖动</p>
    </section>

    <section>
      <h3>不显示提示</h3>
      <div class="slider-row">
        <SrSlider :model-value="60" :show-tooltip="false" />
      </div>
      <p class="hint">showTooltip 关掉后拖动不弹数值浮层，适合放在很窄的容器里</p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="stack">
        <div v-for="s in ['xs', 'sm', 'md', 'lg']" :key="s" class="slider-row">
          <span class="label">{{ s }}</span>
          <SrSlider :model-value="45" :size="s as 'sm'" />
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

.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 460px;
}

.label {
  flex: 0 0 110px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.vertical-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 180px;
  padding-left: 4px;
}

/* 滑块自身撑满高度，标签保持居中不拉伸 */
.vertical-wrap :deep(.sr-slider) {
  align-self: stretch;
}
</style>
