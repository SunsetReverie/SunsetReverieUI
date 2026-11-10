<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import {
  SrAlert,
  SrButton,
  SrCheckbox,
  SrDescriptions,
  SrInput,
  SrModal,
  SrPanel,
  SrProgress,
  SrSegmented,
  SrSelect,
  SrSlider,
  SrStatistic,
  SrSwitch,
  SrTable,
  SrTag,
  srToast,
  useSrTheme,
  type SrDescriptionItem,
  type SrSegmentedValue,
  type SrStyleMode,
  type SrTableColumn,
} from '@sunset-reverie/ui'

defineOptions({ name: 'AuditView' })

const { resolved, style, primary, setStyle } = useSrTheme()

/**
 * 切换全局质感风格
 *
 * 只出现在「全局反馈」那块：玻璃风格下弹窗与 toast 的模糊、遮罩要格外看一眼。
 * @param value 选中值
 */
function onStyleChange(value: SrSegmentedValue): void {
  setStyle(value as SrStyleMode)
}

/** 审计对象：两个明暗 × 两种质感的四个组合 */
const combos = [
  { key: 'light-flat', label: '亮色 · 扁平', theme: 'light', style: 'flat' },
  { key: 'light-glass', label: '亮色 · 玻璃', theme: 'light', style: 'glass' },
  { key: 'dark-flat', label: '暗色 · 扁平', theme: 'dark', style: 'flat' },
  { key: 'dark-glass', label: '暗色 · 玻璃', theme: 'dark', style: 'glass' },
] as const

/** 开关矩阵里的勾选状态，与主题无关，只为看到禁用/选中两种态 */
const checked = ref(true)
const switchOn = ref(true)
const sliderValue = ref(45)
const inputValue = ref('与主题无关的输入值')
const selectValue = ref('选项一')

/** 选项列表 */
const selectOptions = [
  { label: '选项一', value: '选项一' },
  { label: '选项二', value: '选项二' },
  { label: '选项三', value: '选项三' },
]

/** 审计依据：这些字段就是判断「能不能用」的标准，不是装饰 */
const ruleItems: SrDescriptionItem[] = [
  { label: '对比度', value: '正文 / 界面文字按 WCAG AA 4.5:1 为目标线' },
  { label: '边界可见', value: '描边、分割线在四色底上都要能看见' },
  { label: '焦点可见', value: '键盘焦点环不得与背景同色' },
  { label: '状态可辨', value: 'primary / success / warning / danger 四态不能被风格吃掉' },
]

/** 表格列：三列宽度之和要塞得进最窄的一张审计卡（约 200px 可用宽） */
const tableColumns: SrTableColumn[] = [
  { key: 'name', title: '组件', minWidth: 72 },
  { key: 'count', title: '实例数', width: 56, align: 'right' },
  { key: 'status', title: '状态', width: 64, align: 'center' },
]

/** 表格数据：四列配色下都要读得清 */
const tableRows = [
  { id: 'button', name: '按钮', count: 12, status: '稳定' },
  { id: 'input', name: '输入框', count: 9, status: '稳定' },
  { id: 'tag', name: '标签', count: 7, status: '待验' },
]

/** 对比度审计结果：按组合分组 */
interface ContrastRow {
  /** 该组合下的读数标签 */
  label: string
  /** 前景色解析结果，用于色块预览 */
  fg: string
  /** 背景色解析结果 */
  bg: string
  /** 对比度比值 */
  ratio: number
  /** 是否达到目标线 */
  pass: boolean
}

/** 四个组合的读数 */
const contrastRows = ref<Record<string, ContrastRow[]>>({})

/** 隐藏的探测容器：把 data 属性挂上去，才能测到该组合解析出的真实颜色 */
const probeHost = ref<HTMLElement | null>(null)

/** 待测的颜色对 */
interface ContrastPair {
  /** 行标题 */
  label: string
  /** WCAG 目标线 */
  target: number
  /** 前景 token，button 类型不填 */
  fg?: string
  /** 背景 token，button 类型不填 */
  bg?: string
  /** 直接读真实主按钮的计算样式：它的实底色由 color-mix 派生，不能只拿 token 猜 */
  button?: boolean
}

/** 待测的颜色对：文字读 token，按钮读真实组件 */
const PAIRS: ContrastPair[] = [
  { label: '正文 / 页面底', fg: '--sr-color-text', bg: '--sr-color-bg-page', target: 4.5 },
  { label: '正文 / 容器', fg: '--sr-color-text', bg: '--sr-color-bg-container', target: 4.5 },
  { label: '次要 / 容器', fg: '--sr-color-text-secondary', bg: '--sr-color-bg-container', target: 4.5 },
  { label: '三级 / 容器', fg: '--sr-color-text-tertiary', bg: '--sr-color-bg-container', target: 4.5 },
  { label: '主按钮文字 / 实底', target: 4.5, button: true },
]

/** 不透明的 RGB 分量 */
type Rgb = [number, number, number]

/** 解析后的颜色，保留 alpha：玻璃态的容器底色是半透明的 */
interface ParsedColor {
  /** RGB 分量 */
  rgb: Rgb
  /** 透明度 0–1 */
  alpha: number
}

/** 1×1 画布的上下文，用来把任意 CSS 颜色转成数值；整个页面复用一份 */
let colorContext: CanvasRenderingContext2D | null = null

/**
 * 把浏览器给回的颜色字符串解析成数值
 *
 * 变量层层嵌套时，直接读自定义属性只能拿到 `var(...)`；而 `color-mix()` 的计算值
 * 可能是 `oklab(...)`、`color(srgb ...)` 或 `rgba(...)`，手写正则逐个适配没完没了。
 * 交给 canvas 的 fillStyle 解析，一次拿到 RGBA 像素，浏览器支持什么格式就都能算。
 * @param value computed style 里的颜色字符串
 * @returns 颜色分量与透明度；无法解析时返回 null
 */
function parseColor(value: string): ParsedColor | null {
  if (!value) return null
  if (!colorContext) {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    colorContext = canvas.getContext('2d', { willReadFrequently: true })
  }
  if (!colorContext) return null

  colorContext.clearRect(0, 0, 1, 1)
  colorContext.fillStyle = value
  colorContext.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = colorContext.getImageData(0, 0, 1, 1).data
  return { rgb: [r, g, b], alpha: a / 255 }
}

/**
 * 把半透明颜色合成到不透明底色上
 *
 * 玻璃态的容器是 `rgba(255,255,255,.72)` 这类颜色，直接拿 RGB 去算会得出
 * 「和扁平态一模一样」的假读数；必须先按页面底色合成，才是人眼看到的颜色。
 * @param fg 上层颜色（可能半透明）
 * @param bg 下层不透明底色
 * @returns 合成后的不透明颜色
 */
function composite(fg: ParsedColor, bg: Rgb): Rgb {
  const alpha = Math.min(Math.max(fg.alpha, 0), 1)
  return [
    Math.round(fg.rgb[0] * alpha + bg[0] * (1 - alpha)),
    Math.round(fg.rgb[1] * alpha + bg[1] * (1 - alpha)),
    Math.round(fg.rgb[2] * alpha + bg[2] * (1 - alpha)),
  ]
}

/**
 * 相对亮度（WCAG 2.x 的定义：先线性化，再按 0.2126 / 0.7152 / 0.0722 加权）
 * @param rgb 颜色分量
 * @returns 0–1 之间的亮度
 */
function luminance([r, g, b]: Rgb): number {
  const channel = (value: number): number => {
    const normalized = value / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/**
 * 对比度（WCAG 公式，永远 ≥ 1）
 * @param fg 前景色
 * @param bg 背景色
 * @returns 比值
 */
function contrast(fg: Rgb, bg: Rgb): number {
  const lighter = Math.max(luminance(fg), luminance(bg))
  const darker = Math.min(luminance(fg), luminance(bg))
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 转回 CSS 颜色字符串，供色块预览用
 * @param rgb 颜色分量
 * @returns rgb() 字符串
 */
function cssRgb([r, g, b]: Rgb): string {
  return `rgb(${r} ${g} ${b})`
}

/**
 * 在指定元素上把 token 解析成具体颜色
 * @param host 挂着 data 属性的容器
 * @param token 变量名
 * @param property 用于解析的属性，颜色与背景不能混用
 * @returns 计算后的颜色字符串
 */
function resolveToken(host: HTMLElement, token: string, property: 'color' | 'background-color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  // 不参与布局，也不参与视觉，只为让浏览器解析变量
  probe.style.cssText += ';position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
  host.appendChild(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

/**
 * 读真实主按钮的文字与实底色
 *
 * 实底色在暗色主题里是 `color-mix(in oklab, ...)` 派生出来的，token 里没有现成答案；
 * 直接取按钮矩阵里的元素，才算的是用户实际看到的那一对颜色。
 * @param theme 明暗
 * @param styleName 质感
 * @returns 计算后的颜色字符串；矩阵未渲染时返回 null
 */
function readButtonColors(theme: string, styleName: string): { fg: string; bg: string } | null {
  const matrix = document.querySelector('.audit__matrix')
  const col = matrix?.querySelector(`.audit__col[data-sr-theme="${theme}"][data-sr-style="${styleName}"]`)
  const button = col?.querySelector('.sr-button--primary')
  if (!button) return null
  const computed = getComputedStyle(button)
  return { fg: computed.color, bg: computed.backgroundColor }
}

/** 采样四个组合的对比度 */
function measure(): void {
  const host = probeHost.value
  if (!host) return

  const next: Record<string, ContrastRow[]> = {}

  for (const combo of combos) {
    const cell = document.createElement('div')
    cell.setAttribute('data-sr-theme', combo.theme)
    cell.setAttribute('data-sr-style', combo.style)
    host.appendChild(cell)

    // 半透明容器底下是页面底色，按它合成一次才有意义
    const page = parseColor(resolveToken(cell, '--sr-color-bg-page', 'background-color'))
    const pageRgb: Rgb = page ? composite(page, [255, 255, 255]) : [255, 255, 255]

    const buttonColors = readButtonColors(combo.theme, combo.style)

    next[combo.key] = PAIRS.map((pair) => {
      const fgValue = pair.button ? (buttonColors?.fg ?? '') : resolveToken(cell, pair.fg ?? '', 'color')
      const bgValue = pair.button
        ? (buttonColors?.bg ?? '')
        : resolveToken(cell, pair.bg ?? '', 'background-color')
      const fgColor = parseColor(fgValue)
      const bgColor = parseColor(bgValue)
      const bgRgb: Rgb = bgColor ? composite(bgColor, pageRgb) : pageRgb
      const fgRgb: Rgb = fgColor ? composite(fgColor, bgRgb) : [0, 0, 0]
      const ratio = fgColor && bgColor ? contrast(fgRgb, bgRgb) : 0
      return {
        label: pair.label,
        fg: cssRgb(fgRgb),
        bg: cssRgb(bgRgb),
        ratio,
        pass: ratio >= pair.target,
      }
    })

    cell.remove()
  }

  contrastRows.value = next
}

onMounted(measure)

// 主色与明暗一变，读数全部作废：这四个组合的取值依赖根元素上的属性
watch([resolved, style, primary], measure, { flush: 'post' })

/** 弹窗开关 */
const modalOpen = ref(false)

/**
 * 演示命令式 toast
 * @returns {void}
 */
function showToast(): void {
  srToast.success('这是一条全局 toast，主题跟随根元素')
}
</script>

<template>
  <div class="audit">
    <SrPanel
      title="这是什么"
      description="四个「明暗 × 质感」组合的并排样张。样式变异只来自两行属性，组件本身一份标记。"
    >
      <SrDescriptions :items="ruleItems" :column="2" border />

      <p class="audit__note">
        每一列的
        <code>data-sr-theme</code>
        、
        <code>data-sr-style</code>
        都是写死在列上的，所以它们和当前页面主题无关——无论你自己切成什么，下面四列始终是这四个组合。这样才有对照价值。
      </p>
    </SrPanel>

    <SrPanel title="按钮" description="四种变体 × 三档尺寸 × 禁用态，再看图标按钮与通栏按钮。">
      <div class="audit__matrix">
        <div
          v-for="combo in combos"
          :key="combo.key"
          class="audit__col"
          :data-sr-theme="combo.theme"
          :data-sr-style="combo.style"
        >
          <div class="audit__col-head">{{ combo.label }}</div>

          <div class="audit__row">
            <SrButton variant="primary" size="sm">主按钮</SrButton>
            <SrButton variant="secondary" size="sm">次要</SrButton>
            <SrButton variant="outline" size="sm">描边</SrButton>
            <SrButton variant="text" size="sm">文字</SrButton>
          </div>

          <div class="audit__row">
            <SrButton variant="primary" size="md">中号</SrButton>
            <SrButton variant="danger" size="md">危险</SrButton>
            <SrButton variant="primary" size="lg">大号</SrButton>
          </div>

          <div class="audit__row">
            <SrButton variant="primary" disabled>禁用</SrButton>
            <SrButton variant="outline" disabled>禁用</SrButton>
          </div>

          <div class="audit__row">
            <SrButton variant="secondary" icon="lucide:settings" size="sm" aria-label="设置" />
            <SrButton variant="text" icon="lucide:code" size="sm" aria-label="查看源码" />
            <SrButton variant="primary" block>通栏按钮</SrButton>
          </div>
        </div>
      </div>
    </SrPanel>

    <SrPanel
      title="表单"
      description="输入、选择、开关、勾选、滑块——原生控件统一收口在这里，同时检查边框与焦点环。"
    >
      <div class="audit__matrix">
        <div
          v-for="combo in combos"
          :key="combo.key"
          class="audit__col"
          :data-sr-theme="combo.theme"
          :data-sr-style="combo.style"
        >
          <div class="audit__col-head">{{ combo.label }}</div>

          <SrInput v-model="inputValue" placeholder="输入点什么" />
          <SrInput model-value="" placeholder="禁用态" disabled />
          <SrSelect v-model="selectValue" :options="selectOptions" />
          <div class="audit__row">
            <span class="audit__field">开关</span>
            <SrSwitch v-model="switchOn" label="开关" />
          </div>
          <SrCheckbox v-model="checked" label="勾选项" />
          <SrSlider v-model="sliderValue" />
        </div>
      </div>
    </SrPanel>

    <SrPanel title="反馈" description="告警、标签、进度：这些颜色最容易被质感吃掉，得单看。">
      <div class="audit__matrix">
        <div
          v-for="combo in combos"
          :key="combo.key"
          class="audit__col"
          :data-sr-theme="combo.theme"
          :data-sr-style="combo.style"
        >
          <div class="audit__col-head">{{ combo.label }}</div>

          <SrAlert type="info" title="信息" description="普通提示，不打断操作。" />
          <SrAlert type="success" title="成功" description="操作已生效。" />
          <SrAlert type="warning" title="注意" description="继续前请确认。" />

          <div class="audit__row">
            <SrTag type="primary" size="sm">主色</SrTag>
            <SrTag type="info" size="sm">信息</SrTag>
            <SrTag type="success" size="sm">成功</SrTag>
            <SrTag type="warning" size="sm">警告</SrTag>
            <SrTag type="danger" size="sm">危险</SrTag>
          </div>

          <div class="audit__row">
            <SrTag type="primary" variant="dark" size="sm">深色</SrTag>
            <SrTag type="success" variant="dark" size="sm">深色</SrTag>
            <SrTag type="danger" variant="dark" size="sm">深色</SrTag>
          </div>

          <SrProgress :percent="30" />
          <SrProgress :percent="100" status="success" />
        </div>
      </div>
    </SrPanel>

    <SrPanel title="数据" description="表格与数值：密度高、留白少，对比度不够会最先在这里暴露。">
      <div class="audit__matrix">
        <div
          v-for="combo in combos"
          :key="combo.key"
          class="audit__col"
          :data-sr-theme="combo.theme"
          :data-sr-style="combo.style"
        >
          <div class="audit__col-head">{{ combo.label }}</div>

          <SrStatistic :value="24860" title="本月续费" prefix="¥" count-up />
          <div class="audit__table">
            <SrTable :data="tableRows" :columns="tableColumns" row-key="id" size="sm" stripe>
              <template #cell-status="{ row }">
                <SrTag :type="row.status === '稳定' ? 'success' : 'warning'" size="sm">{{
                  row.status
                }}</SrTag>
              </template>
            </SrTable>
          </div>
        </div>
      </div>
    </SrPanel>

    <SrPanel
      title="对比度审计"
      description="不是凭眼睛判断：读的是各组合实际解析出的颜色，按 WCAG 公式算比值。"
    >
      <div ref="probeHost" class="audit__probe" aria-hidden="true" />

      <div class="audit__matrix">
        <div v-for="combo in combos" :key="combo.key" class="audit__col">
          <div class="audit__col-head">{{ combo.label }}</div>

          <ul class="audit__pairs">
            <li v-for="row in contrastRows[combo.key] ?? []" :key="row.label" class="audit__pair">
              <span class="audit__pair-swatch" :style="{ background: row.bg }">
                <span :style="{ color: row.fg }">Aa</span>
              </span>
              <span class="audit__pair-label">{{ row.label }}</span>
              <span class="audit__pair-ratio" :class="{ 'is-fail': !row.pass }">{{
                row.ratio.toFixed(2)
              }}</span>
              <SrTag :type="row.pass ? 'success' : 'danger'" size="sm">{{ row.pass ? 'AA' : '未达' }}</SrTag>
            </li>
          </ul>
        </div>
      </div>

      <p class="audit__note">
        目标线是 WCAG AA 的 4.5:1。未达的项未必是 bug：三级文字常用于 12px 辅助信息，低于 4.5
        说明这个槽位不该承载关键内容——把它当警示，而不是当标准去追。
      </p>
      <p class="audit__note">
        文字行把半透明容器按页面底色<strong>合成</strong>后再算（玻璃态容器是
        <code>rgba(…, .72)</code>
        ，不合成会算出「和扁平态一样」的假读数）；按钮行直接取真实主按钮的计算样式，因为暗色下的实底色由
        <code>color-mix(in oklab, …)</code>
        派生，token 里没有现成答案。换主色后读数会重算。
      </p>
    </SrPanel>

    <SrPanel
      title="全局反馈"
      description="弹窗与 toast 挂到 body 上，不在任何一列里——它们靠根元素属性跟随主题。"
    >
      <div class="audit__actions">
        <SrButton variant="primary" @click="modalOpen = true">打开弹窗</SrButton>
        <SrButton variant="secondary" @click="showToast">弹一条 toast</SrButton>
        <SrSegmented
          :model-value="style"
          :options="[
            { label: '扁平', value: 'flat' },
            { label: '玻璃', value: 'glass' },
          ]"
          @update:model-value="onStyleChange"
        />
      </div>

      <SrModal v-model="modalOpen" title="层级检查" width="380px">
        <p class="audit__modal-text">
          弹窗的背景、遮罩、边框各自取值，玻璃风格下还要检查模糊是否透出底层内容造成重影。
        </p>
        <template #footer>
          <SrButton variant="secondary" size="sm" @click="modalOpen = false">取消</SrButton>
          <SrButton variant="primary" size="sm" @click="modalOpen = false">知道了</SrButton>
        </template>
      </SrModal>
    </SrPanel>
  </div>
</template>

<style lang="less" scoped>
.audit {
  display: grid;
  gap: var(--sr-space-4);

  &__note {
    margin: var(--sr-space-3) 0 0;
    color: var(--sr-color-text-secondary);
    font-size: var(--sr-font-size-sm);
    line-height: 1.7;

    code {
      padding: 1px 5px;
      border-radius: var(--sr-radius-sm);
      background: var(--sr-color-bg-sunken);
      color: var(--sr-color-text);
      font-size: 0.92em;
    }
  }

  &__matrix {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(232px, 1fr));
    gap: var(--sr-space-3);
  }

  &__col {
    display: grid;
    gap: var(--sr-space-3);
    align-content: start;
    // grid 子项默认 min-width: auto，表格一宽就会把整列撑破容器
    min-width: 0;
    padding: var(--sr-space-3);
    border: 1px solid var(--sr-color-border);
    border-radius: var(--sr-radius-lg);
    background: var(--sr-color-bg-container);
  }

  &__col-head {
    color: var(--sr-color-text-secondary);
    font-family: var(--sr-font-family-mono);
    font-size: var(--sr-font-size-xs);
    letter-spacing: 0.04em;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sr-space-2);
    align-items: center;
  }

  &__field {
    color: var(--sr-color-text-secondary);
    font-size: var(--sr-font-size-sm);
  }

  &__pairs {
    display: grid;
    gap: var(--sr-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__table {
    min-width: 0;
    // 列宽兜底：极端窄屏时表格自身横滚，不许越出卡片
    overflow-x: auto;
  }

  &__pair {
    display: grid;
    grid-template-columns: 34px 1fr auto auto;
    gap: var(--sr-space-2);
    align-items: center;
  }

  &__pair-swatch {
    display: grid;
    place-items: center;
    width: 34px;
    height: 24px;
    border: 1px solid var(--sr-color-border);
    border-radius: var(--sr-radius-sm);
    font-size: 12px;
    font-weight: 600;
  }

  &__pair-label {
    color: var(--sr-color-text-secondary);
    font-size: var(--sr-font-size-xs);
  }

  &__pair-ratio {
    color: var(--sr-color-text);
    font-family: var(--sr-font-family-mono);
    font-size: var(--sr-font-size-sm);

    &.is-fail {
      color: var(--sr-color-danger);
    }
  }

  &__probe {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    pointer-events: none;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sr-space-2);
    align-items: center;
  }

  &__modal-text {
    margin: 0;
    color: var(--sr-color-text-secondary);
    font-size: var(--sr-font-size-sm);
    line-height: 1.7;
  }
}
</style>
