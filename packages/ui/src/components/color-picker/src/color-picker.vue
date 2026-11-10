<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { srComputeFloating, srGetRect } from '../../../utils/floating'
import SrIcon from '../../icon/src/icon.vue'
import { formatColor, hslToRgb, isSameColor, parseColor, rgbToHsl, toHex, type SrRgba } from './color-utils'
import { colorPickerProps } from './color-picker'

defineOptions({ name: 'SrColorPicker', inheritAttrs: false })

const props = defineProps(colorPickerProps)

const emit = defineEmits<{
  /** 颜色变化 */
  'update:modelValue': [value: string]
  /** 颜色变化（松手或输入完成时） */
  change: [value: string]
  /** 面板显隐 */
  'visible-change': [visible: boolean]
}>()

const config = useSrConfig()

/** 触发器 */
const triggerRef = ref<HTMLElement | null>(null)
/** 面板 */
const panelRef = ref<HTMLElement | null>(null)
/** 饱和度面板 */
const areaRef = ref<HTMLElement | null>(null)
/** 色相条 */
const hueRef = ref<HTMLElement | null>(null)
/** 透明度条 */
const alphaRef = ref<HTMLElement | null>(null)

/** 面板显隐 */
const visible = ref(false)
/** 内部维护的 hsl（拖拽时按 hsl 走，转 rgb 会有精度损失） */
const hue = ref(240)
const sat = ref(70)
const light = ref(55)
/** 透明度 */
const alpha = ref(1)
/** 透明度输入框 */
const alphaInputRef = ref<HTMLInputElement | null>(null)
/** 透明度输入框里的草稿：边输入边格式化会把光标打断 */
const alphaDraft = ref('100')
/** 十六进制输入框的临时文本 */
const hexInput = ref('#3e3edc')
/** 正在拖拽的部件 */
const dragging = ref<'area' | 'hue' | 'alpha' | null>(null)
/** 面板位置 */
const position = ref({ top: 0, left: 0 })

/** 尺寸：自身 > 全局配置 */
const resolvedSize = computed(() => props.size ?? config.value.size)

/** 当前颜色（rgb 形态） */
const current = computed<SrRgba>(() => {
  const rgb = hslToRgb({ h: hue.value, s: sat.value, l: light.value, a: alpha.value })
  return { ...rgb, a: alpha.value }
})

/** 当前颜色的输出字符串 */
const outputValue = computed(() =>
  formatColor(current.value, props.format, props.showAlpha && alpha.value < 1),
)

/** 饱和度面板的纯色背景 */
const pureColor = computed(() => toHex({ ...hslToRgb({ h: hue.value, s: 100, l: 50, a: 1 }), a: 1 }))

/** 透明度条的渐变 */
const alphaGradient = computed(
  () =>
    `linear-gradient(to right, rgba(${current.value.r}, ${current.value.g}, ${current.value.b}, 0), rgb(${current.value.r}, ${current.value.g}, ${current.value.b}))`,
)

/** 是否已有值 */
const hasValue = computed(() => Boolean(props.modelValue))

/**
 * 把外部值同步到内部状态
 * @param value 颜色字符串
 */
function syncFromValue(value: string): void {
  const parsed = parseColor(value)
  if (!parsed) return

  const hsl = rgbToHsl(parsed)
  hue.value = hsl.h
  sat.value = hsl.s
  light.value = hsl.l
  alpha.value = parsed.a
  hexInput.value = toHex(parsed)
}

watch(
  () => props.modelValue,
  (value) => {
    // 自己刚发出去的值不再回灌，否则光标会跳
    if (isSameColor(value, outputValue.value)) return
    syncFromValue(value)
  },
  { immediate: true },
)

// 拖动滑条或外部值变化时同步输入框；正在输入时不抢，否则光标会跳
watch(
  alpha,
  (value) => {
    if (typeof document !== 'undefined' && document.activeElement === alphaInputRef.value) return
    alphaDraft.value = String(Math.round(value * 100))
  },
  { immediate: true },
)

/**
 * 提交一个新值
 * @param emitChange 是否派发 change
 */
function commit(emitChange = false): void {
  const value = outputValue.value
  hexInput.value = toHex(current.value)
  emit('update:modelValue', value)
  if (emitChange) emit('change', value)
}

/**
 * 计算面板位置
 */
function updatePosition(): void {
  if (typeof window === 'undefined') return
  const trigger = triggerRef.value
  if (!trigger) return

  const result = srComputeFloating({
    reference: srGetRect(trigger),
    floating: {
      width: panelRef.value?.offsetWidth ?? 240,
      height: panelRef.value?.offsetHeight ?? 320,
    },
    placement: 'bottom-start',
    offset: 6,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    padding: 8,
  })

  position.value = { top: result.top, left: result.left }
}

/** 打开 */
async function open(): Promise<void> {
  if (props.disabled || visible.value) return

  visible.value = true
  emit('visible-change', true)

  await nextTick()
  updatePosition()
}

/** 关闭 */
function close(): void {
  if (!visible.value) return

  visible.value = false
  emit('visible-change', false)
}

/** 切换 */
function toggle(): void {
  if (visible.value) close()
  else void open()
}

/**
 * 在某个元素内按坐标算比例
 * @param element 目标元素
 * @param event 指针事件
 * @returns 0~1 的横纵比例
 */
function ratioOf(element: HTMLElement | null, event: PointerEvent): { x: number; y: number } {
  if (!element) return { x: 0, y: 0 }
  const rect = element.getBoundingClientRect()

  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / (rect.width || 1))),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / (rect.height || 1))),
  }
}

/**
 * 按指针位置更新对应部件
 * @param part 部件
 * @param event 指针事件
 */
function updateByPointer(part: 'area' | 'hue' | 'alpha', event: PointerEvent): void {
  if (part === 'area') {
    const { x, y } = ratioOf(areaRef.value, event)
    sat.value = Math.round(x * 100)
    light.value = Math.round((1 - y) * 100)
  } else if (part === 'hue') {
    const { x } = ratioOf(hueRef.value, event)
    hue.value = Math.round(x * 360)
  } else {
    const { x } = ratioOf(alphaRef.value, event)
    alpha.value = Math.round(x * 100) / 100
  }

  commit()
}

/**
 * 开始拖拽
 * @param part 部件
 * @param event 指针事件
 */
function startDrag(part: 'area' | 'hue' | 'alpha', event: PointerEvent): void {
  if (props.disabled) return

  dragging.value = part
  event.preventDefault()
  updateByPointer(part, event)

  document.addEventListener('pointermove', onPointerMove, true)
  document.addEventListener('pointerup', onPointerUp, true)
}

/**
 * 拖拽中
 * @param event 指针事件
 */
function onPointerMove(event: PointerEvent): void {
  if (!dragging.value) return
  updateByPointer(dragging.value, event)
}

/** 结束拖拽 */
function onPointerUp(): void {
  if (!dragging.value) return

  dragging.value = null
  document.removeEventListener('pointermove', onPointerMove, true)
  document.removeEventListener('pointerup', onPointerUp, true)
  emit('change', outputValue.value)
}

/**
 * 十六进制输入
 * @param value 输入内容
 */
function onHexInput(value: string): void {
  hexInput.value = value
  const parsed = parseColor(value)
  if (!parsed) return

  const hsl = rgbToHsl(parsed)
  hue.value = hsl.h
  sat.value = hsl.s
  light.value = hsl.l
  alpha.value = parsed.a
  commit()
}

/**
 * 输入透明度百分比
 *
 * 只留数字、最多三位；空串时先不改 alpha，允许用户清空后重输。
 * @param value 输入框文本
 */
function onAlphaInput(value: string): void {
  const digits = value.replace(/\D/g, '').slice(0, 3)
  alphaDraft.value = digits
  if (!digits) return

  alpha.value = Math.min(100, Number(digits)) / 100
  commit()
}

/** 失焦或回车时把草稿归一化（比如输入 150 后回显 100） */
function onAlphaBlur(): void {
  alphaDraft.value = String(Math.round(alpha.value * 100))
}

/**
 * 选预设色
 *
 * 先用原值走一遍格式化，避免「内部存 hsl → 转回 rgb 差 1」：
 * #3e3edc 的 hsl 是 (240, 69%, 55%)，转回来会是 rgb(61, 61, 219)。
 * @param color 颜色
 */
function pickPreset(color: string): void {
  syncFromValue(color)

  const parsed = parseColor(color)
  if (!parsed) return

  const value = formatColor(parsed, props.format, props.showAlpha && parsed.a < 1)
  hexInput.value = toHex(parsed)
  emit('update:modelValue', value)
  emit('change', value)
}

/** 清空 */
function clear(): void {
  emit('update:modelValue', '')
  emit('change', '')
}

/** 点击外部关闭 */
function onDocumentPointerDown(event: PointerEvent): void {
  if (!visible.value) return

  const target = event.target as Node | null
  if (!target) return
  if (triggerRef.value?.contains(target) || panelRef.value?.contains(target)) return
  close()
}

/** Esc 关闭 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && visible.value) {
    close()
    event.stopPropagation()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  document.addEventListener('keydown', onKeydown, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('keydown', onKeydown, true)
  document.removeEventListener('pointermove', onPointerMove, true)
  document.removeEventListener('pointerup', onPointerUp, true)
})

defineExpose({ open, close })
</script>

<template>
  <div
    class="sr-color-picker"
    :class="[
      { 'is-open': visible, 'is-disabled': disabled },
      resolvedSize ? `sr-color-picker--${resolvedSize}` : '',
    ]"
  >
    <div
      ref="triggerRef"
      class="sr-color-picker__trigger"
      role="button"
      :aria-expanded="visible"
      tabindex="0"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
    >
      <!-- 用 backgroundColor 而不是 background 简写：简写会把 CSS 里的棋盘格背景图清掉，
           带透明度的色块就只剩「变淡的纯色」，看不出它是透明的 -->
      <span v-if="hasValue" class="sr-color-picker__swatch" :style="{ backgroundColor: props.modelValue }" />
      <span v-else class="sr-color-picker__swatch sr-color-picker__swatch--empty" />

      <span class="sr-color-picker__value" :class="{ 'is-placeholder': !hasValue }">
        {{ hasValue ? props.modelValue : placeholder }}
      </span>

      <button
        v-if="clearable && hasValue && !disabled"
        class="sr-color-picker__clear"
        type="button"
        aria-label="清空"
        @click.stop="clear"
      >
        <SrIcon name="lucide:x" :size="12" />
      </button>
    </div>

    <Teleport to="body">
      <Transition name="sr-color-picker-panel">
        <div
          v-if="visible"
          ref="panelRef"
          class="sr-color-picker__panel"
          :style="{ top: `${position.top}px`, left: `${position.left}px` }"
        >
          <!-- 饱和度 / 亮度面板 -->
          <div
            ref="areaRef"
            class="sr-color-picker__area"
            :style="{ backgroundColor: pureColor }"
            @pointerdown="startDrag('area', $event)"
          >
            <span class="sr-color-picker__area-cursor" :style="{ left: `${sat}%`, top: `${100 - light}%` }" />
          </div>

          <!-- 色相条 -->
          <div ref="hueRef" class="sr-color-picker__hue" @pointerdown="startDrag('hue', $event)">
            <span class="sr-color-picker__hue-cursor" :style="{ left: `${(hue / 360) * 100}%` }" />
          </div>

          <!-- 透明度条 -->
          <div
            v-if="showAlpha"
            ref="alphaRef"
            class="sr-color-picker__alpha"
            :style="{ '--sr-cp-alpha-gradient': alphaGradient }"
            @pointerdown="startDrag('alpha', $event)"
          >
            <span class="sr-color-picker__alpha-cursor" :style="{ left: `${alpha * 100}%` }" />
          </div>

          <!-- 输入区 -->
          <div class="sr-color-picker__inputs">
            <span class="sr-color-picker__preview" :style="{ backgroundColor: outputValue }" />
            <input
              class="sr-color-picker__hex"
              type="text"
              :value="hexInput"
              spellcheck="false"
              @input="onHexInput(($event.target as HTMLInputElement).value)"
            />

            <!-- 透明度既能拖，也能敲：拖到 37% 这种精确值很难控 -->
            <span v-if="showAlpha" class="sr-color-picker__alpha-field">
              <input
                ref="alphaInputRef"
                class="sr-color-picker__alpha-input"
                type="text"
                inputmode="numeric"
                maxlength="3"
                aria-label="透明度（百分比）"
                :value="alphaDraft"
                @input="onAlphaInput(($event.target as HTMLInputElement).value)"
                @blur="onAlphaBlur"
                @keydown.enter.prevent="onAlphaBlur"
              />
              <span class="sr-color-picker__alpha-unit" aria-hidden="true">%</span>
            </span>
          </div>

          <!-- 预设 -->
          <div v-if="presets.length" class="sr-color-picker__presets">
            <button
              v-for="color in presets"
              :key="color"
              class="sr-color-picker__preset"
              :class="{ 'is-active': isSameColor(color, props.modelValue) }"
              type="button"
              :style="{ background: color }"
              :title="color"
              @click="pickPreset(color)"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
