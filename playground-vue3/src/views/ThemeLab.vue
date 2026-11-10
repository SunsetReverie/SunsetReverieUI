<script setup lang="ts">
import { computed, ref } from 'vue'

import GlassTuner from '../components/GlassTuner.vue'
import { srHighlightCode } from '../utils/highlight'
import {
  SR_PRIMARY_STORAGE_KEY,
  SR_PRESET_STORAGE_KEY,
  SR_STYLE_STORAGE_KEY,
  SR_THEME_PRESETS,
  SR_THEME_STORAGE_KEY,
  SrAlert,
  SrButton,
  SrCard,
  SrCodeBlock,
  SrColorPicker,
  SrDescriptions,
  SrPanel,
  SrProgress,
  SrSegmented,
  SrTag,
  useSrTheme,
  type SrDescriptionItem,
  type SrSegmentedOption,
  type SrSegmentedValue,
  type SrStyleMode,
  type SrThemeMode,
} from '@sunset-reverie/ui'

defineOptions({ name: 'ThemeLab' })

const {
  mode,
  resolved,
  style,
  primary,
  preset,
  systemDark,
  setTheme,
  setStyle,
  setPrimaryColor,
  setPreset,
  resetPrimaryColor,
} = useSrTheme()

/** 明暗三选一：auto 不是第三种主题，而是「跟随系统」的意图 */
const themeOptions: SrSegmentedOption[] = [
  { label: '亮色', value: 'light', icon: 'lucide:sun' },
  { label: '暗色', value: 'dark', icon: 'lucide:moon-star' },
  { label: '跟随系统', value: 'auto' },
]

/** 质感两选一 */
const styleOptions: SrSegmentedOption[] = [
  { label: '扁平 flat', value: 'flat' },
  { label: '玻璃 glass', value: 'glass' },
]

/**
 * Segmented 的值是 string | number，组件状态是联合类型，在这里收口
 * @param value 选中值
 */
function onThemeChange(value: SrSegmentedValue): void {
  setTheme(value as SrThemeMode)
}

/**
 * 切换质感风格
 * @param value 选中值
 */
function onStyleChange(value: SrSegmentedValue): void {
  setStyle(value as SrStyleMode)
}

/** 自定义色初值取当前品牌色，打开面板就能看到现状 */
const customColor = ref('#FF7A45')

/** 取色面板里的预设色，与上方预设主题色同源，不另造一套色板 */
const presetColors = SR_THEME_PRESETS.map((item) => item.primary)

/** 当前预设的完整信息，用于展示文案 */
const currentPreset = computed(() => SR_THEME_PRESETS.find((item) => item.key === preset.value))

/** 主题色的三种来源，README 里也是这个优先级 */
const primarySource = computed(() => {
  if (preset.value) return `预设 ${currentPreset.value?.label ?? preset.value}`
  if (primary.value) return `自定义 ${primary.value}`
  return 'token 默认（落日橙）'
})

/** 顶部状态表 */
const stateItems = computed<SrDescriptionItem[]>(() => [
  { label: '用户意图', value: mode.value },
  { label: '实际生效', value: resolved.value },
  { label: '质感风格', value: style.value },
  { label: '系统偏好', value: systemDark.value ? '暗色' : '亮色' },
  { label: '主题色来源', value: primarySource.value },
])

/** 根元素上的三个属性：整套变量都挂在这上面 */
const rootCode = computed(() => {
  const attrs = [`data-sr-theme="${resolved.value}"`, `data-sr-style="${style.value}"`]
  if (preset.value) attrs.push(`data-sr-primary="${preset.value}"`)
  return `<html\n  ${attrs.join('\n  ')}\n>`
})

/**
 * 读取持久化的偏好
 *
 * 不做成 computed：localStorage 不是响应式数据，靠状态变化触发重新渲染即可。
 * @returns 键值对文本
 */
function readStorage(): string {
  if (typeof window === 'undefined') return '（服务端没有 localStorage，首帧由内联脚本写入）'
  const keys = [SR_THEME_STORAGE_KEY, SR_STYLE_STORAGE_KEY, SR_PRESET_STORAGE_KEY, SR_PRIMARY_STORAGE_KEY]
  return keys.map((key) => `${key} = ${window.localStorage.getItem(key) ?? '（未写入）'}`).join('\n')
}

/** 主色派生的六个变量：一个颜色撑起整套交互层级 */
const scaleTokens = [
  { token: '--sr-color-primary', label: '主色' },
  { token: '--sr-color-primary-hover', label: 'hover' },
  { token: '--sr-color-primary-active', label: 'active' },
  { token: '--sr-color-primary-alpha-25', label: '25%' },
  { token: '--sr-color-primary-alpha-12', label: '12%' },
  { token: '--sr-color-primary-alpha-08', label: '8%' },
]
</script>

<template>
  <div class="lab">
    <SrPanel
      title="当前状态"
      description="主题不是给组件挨个传参，而是根元素上三个属性——整套 CSS 变量由属性选择器接管。"
    >
      <SrDescriptions :items="stateItems" :column="1" border />

      <!-- 与断点实验室一致：代码区固定用暗色 token，不随全局明暗切换 -->
      <div class="lab__grid" data-sr-theme="dark">
        <SrCodeBlock title="index.html" lang="html" :code="rootCode" :highlight="srHighlightCode" />
        <SrCodeBlock title="localStorage" lang="text" :code="readStorage()" :highlight="srHighlightCode" />
      </div>

      <p class="lab__note">
        代码块里是「此刻的真实值」，不是示意：切上面的开关，字符串会跟着变。属性写在
        <code>html</code>
        上是因为滚动条、原生表单控件也要跟着明暗，它们只认根元素的
        <code>color-scheme</code>
        。
      </p>
    </SrPanel>

    <SrPanel title="明暗模式" description="light / dark 是明确指令，auto 是「听系统的」。">
      <div class="lab__toolbar">
        <SrSegmented :model-value="mode" :options="themeOptions" @update:model-value="onThemeChange" />
        <SrTag :type="systemDark ? 'primary' : 'default'">
          系统当前偏好：{{ systemDark ? '暗色' : '亮色' }}
        </SrTag>
      </div>

      <p class="lab__note">
        选 <code>auto</code> 时页面跟着系统走：系统改了，这里立刻跟着变
        <code>systemDark</code>
        的推送，不需要刷新。用户一旦显式选过亮或暗，就不再被系统覆盖——「我选过的，你别替我改」。
      </p>
      <p class="lab__note">
        前述选择存在
        <code>{{ SR_THEME_STORAGE_KEY }}</code>
        里；首帧靠
        <code>index.html</code>
        里的一小段内联脚本还原，否则 SSR 出来的页面会先闪一下默认主题。
      </p>
    </SrPanel>

    <SrPanel title="质感风格" description="flat 与 glass 共用一套语义变量，只换圆角、背景、阴影与模糊。">
      <div class="lab__toolbar">
        <SrSegmented :model-value="style" :options="styleOptions" @update:model-value="onStyleChange" />
      </div>

      <div class="lab__compare">
        <div class="lab__compare-item" data-sr-style="flat">
          <div class="lab__compare-cap">扁平 flat</div>
          <SrCard>
            <div class="preview">
              <div class="preview__label">本月续费</div>
              <div class="preview__value">¥ 24,860</div>
              <SrProgress :percent="62" />
              <div class="preview__actions">
                <SrButton variant="primary" size="sm">查看明细</SrButton>
                <SrTag type="success" round>+12.4%</SrTag>
              </div>
            </div>
          </SrCard>
        </div>

        <div class="lab__compare-item" data-sr-style="glass">
          <div class="lab__compare-cap">玻璃 glass</div>
          <SrCard>
            <div class="preview">
              <div class="preview__label">本月续费</div>
              <div class="preview__value">¥ 24,860</div>
              <SrProgress :percent="62" />
              <div class="preview__actions">
                <SrButton variant="primary" size="sm">查看明细</SrButton>
                <SrTag type="success" round>+12.4%</SrTag>
              </div>
            </div>
          </SrCard>
        </div>
      </div>

      <p class="lab__note">
        两边的标记完全一样，只有外层多了一个
        <code>data-sr-style</code>
        ——玻璃质感不是另一套组件，是同一套组件换了变量。上面这排演示是「强制」的，所以不管当前全局风格是什么，两边都同时在。
      </p>

      <SrAlert
        type="info"
        title="玻璃参数可以调"
        description="下面这几项只对 glass 生效，写在内联变量上实时预览；数值定下来后应写回 token，别留在页面里。"
      />

      <div class="lab__tuner">
        <div class="lab__subsection-title">参数调节 · GlassTuner</div>
        <GlassTuner />
      </div>
    </SrPanel>

    <SrPanel title="主题色" description="预设走属性选择器（SSR 友好），自定义色走内联变量，两者互斥。">
      <div class="lab__swatches">
        <button
          v-for="item in SR_THEME_PRESETS"
          :key="item.key"
          type="button"
          class="swatch"
          :class="{ 'is-active': preset === item.key }"
          :aria-pressed="preset === item.key"
          @click="setPreset(item.key)"
        >
          <span class="swatch__dot" :style="{ background: item.primary }" />
          <span class="swatch__text">
            <span class="swatch__label">{{ item.label }}</span>
            <span class="swatch__mood">{{ item.mood }}</span>
          </span>
        </button>
      </div>

      <div class="lab__custom">
        <div class="lab__custom-head">
          <div class="lab__custom-text">
            <div class="lab__subsection-title">自定义主色 · SrColorPicker</div>
            <p class="lab__custom-hint">
              点色块打开组件库的取色面板：拖动饱和度与色相，或直接点面板底部的预设色。挑好后按「应用到全局」，
              整条派生色阶会跟着重算。
            </p>
          </div>
          <span class="lab__custom-preview" :style="{ background: customColor }" :title="customColor" />
        </div>

        <div class="lab__custom-row">
          <SrColorPicker v-model="customColor" size="lg" :presets="presetColors" />
          <SrButton variant="primary" @click="setPrimaryColor(customColor)">应用到全局</SrButton>
          <SrButton variant="secondary" @click="resetPrimaryColor()">还原默认</SrButton>
        </div>
      </div>

      <p class="lab__note">
        当前来源：{{ primarySource }}。一个颜色会被派生成整条交互层级，下面这几块就是派生结果——不需要手工配
        hover、active 和三层透明底色。
      </p>

      <div class="lab__scale">
        <div v-for="item in scaleTokens" :key="item.token" class="lab__scale-cell">
          <div class="lab__scale-chip" :style="{ background: `var(${item.token})` }" />
          <code class="lab__scale-token">{{ item.label }}</code>
        </div>
      </div>

      <p class="lab__note">
        选预设会清掉内联变量，选自定义色会清掉预设代号——两条路径永远只有一条生效，免得出现「换了色但 hover
        还是旧色」这种半吊子状态。
      </p>
    </SrPanel>

    <SrPanel title="几个容易踩的点" description="都是实际接进去之后遇到过的。">
      <div class="lab__alerts">
        <SrAlert
          type="warning"
          title="写 html，不要只写 body"
          description="原生滚动条、表单控件的明暗只认根元素的 color-scheme。属性挂在 body 上组件能变，系统控件不变，暗色下滚轮轨道会白得刺眼。"
        />
        <SrAlert
          type="warning"
          title="局部作用域只能覆盖，不能清零"
          description="在子树写 data-sr-theme 只会覆盖该子树内的变量；想「回到外层」得写回同一个属性值，删属性不会重新继承——属性没了不等于变量没了。"
        />
        <SrAlert
          type="info"
          title="主题切换要走 setTheme，不要直接改 DOM"
          description="写 DOM 的唯一出口是 applyToDom，它还负责持久化与 color-scheme 同步。手动 setAttribute 会留下「看着变了但存没存」的悬案。"
        />
      </div>
    </SrPanel>
  </div>
</template>

<style lang="less" scoped>
.lab {
  display: grid;
  gap: var(--sr-space-4);
  max-width: 920px;

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

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: var(--sr-space-3);
    margin-top: var(--sr-space-3);
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sr-space-2);
  }

  &__subsection-title {
    color: var(--sr-color-text);
    font-family: var(--sr-font-family-mono);
    font-size: var(--sr-font-size-xs);
    font-weight: var(--sr-font-weight-semibold);
    letter-spacing: 0.04em;
  }

  &__tuner {
    display: grid;
    gap: var(--sr-space-4);
    margin-top: var(--sr-space-4);
    padding: var(--sr-space-4);
    border: 1px solid var(--sr-color-border-subtle);
    border-radius: var(--sr-radius-lg);
    background: var(--sr-color-bg-sunken);
  }

  &__custom {
    display: grid;
    gap: var(--sr-space-4);
    margin-top: var(--sr-space-4);
    padding: var(--sr-space-4);
    border: 1px solid var(--sr-color-border-subtle);
    border-radius: var(--sr-radius-lg);
    background: var(--sr-color-bg-sunken);
  }

  &__custom-head {
    display: flex;
    gap: var(--sr-space-4);
    align-items: flex-start;
    justify-content: space-between;
  }

  &__custom-text {
    display: grid;
    gap: var(--sr-space-2);
    min-width: 0;
  }

  &__custom-hint {
    margin: 0;
    color: var(--sr-color-text-secondary);
    font-size: var(--sr-font-size-sm);
    line-height: 1.8;
  }

  &__custom-preview {
    flex: 0 0 auto;
    width: 56px;
    height: 56px;
    border: 1px solid var(--sr-color-border);
    border-radius: var(--sr-radius-md);
    box-shadow: 0 0 0 3px var(--sr-color-bg-container);
  }

  &__custom-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sr-space-3);
    align-items: center;
  }

  &__compare {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--sr-space-3);
    margin-top: var(--sr-space-3);
  }

  &__compare-item {
    position: relative;
    display: grid;
    gap: var(--sr-space-2);
    align-content: start;
    padding: var(--sr-space-3);
    border-radius: var(--sr-radius-lg);
    // 玻璃要有东西可「透」：素色底上 flat 与 glass 看起来几乎一样，
    // 铺一层渐变后模糊才有对照意义
    background:
      radial-gradient(circle at 18% 22%, var(--sr-color-primary-alpha-25), transparent 58%),
      linear-gradient(125deg, var(--sr-color-info-bg), transparent 72%),
      repeating-linear-gradient(135deg, transparent 0 18px, var(--sr-color-border-subtle) 18px 19px);
  }

  &__compare-cap {
    color: var(--sr-color-text-secondary);
    font-family: var(--sr-font-family-mono);
    font-size: var(--sr-font-size-xs);
    letter-spacing: 0.04em;
  }

  &__swatches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--sr-space-3);
  }

  &__scale {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
    gap: var(--sr-space-2);
    margin-top: var(--sr-space-3);
  }

  &__scale-cell {
    display: grid;
    gap: var(--sr-space-1);
  }

  &__scale-chip {
    height: 46px;
    border: 1px solid var(--sr-color-border);
    border-radius: var(--sr-radius-md);
  }

  &__scale-token {
    color: var(--sr-color-text-tertiary);
    font-family: var(--sr-font-family-mono);
    font-size: 11px;
    text-align: center;
  }

  &__alerts {
    display: grid;
    gap: var(--sr-space-2);
  }
}

.swatch {
  display: flex;
  gap: var(--sr-space-2);
  align-items: center;
  padding: 10px 12px;
  border: 1px solid var(--sr-color-border);
  border-radius: var(--sr-radius-md);
  background: var(--sr-color-bg-container);
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  transition:
    border-color var(--sr-motion-duration-fast) var(--sr-motion-easing-standard),
    box-shadow var(--sr-motion-duration-fast) var(--sr-motion-easing-standard);

  &:hover {
    border-color: var(--sr-color-primary-alpha-25);
  }

  &:focus-visible {
    outline: 2px solid var(--sr-color-primary);
    outline-offset: 2px;
  }

  &.is-active {
    border-color: var(--sr-color-primary);
    box-shadow: 0 0 0 1px var(--sr-color-primary-alpha-25);
  }

  &__dot {
    flex: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 12%);
  }

  &__text {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  &__label {
    color: var(--sr-color-text);
    font-size: var(--sr-font-size-sm);
  }

  &__mood {
    color: var(--sr-color-text-tertiary);
    font-size: var(--sr-font-size-xs);
  }
}

.preview {
  display: grid;
  gap: var(--sr-space-2);

  &__label {
    color: var(--sr-color-text-secondary);
    font-size: var(--sr-font-size-xs);
  }

  &__value {
    color: var(--sr-color-text);
    font-family: var(--sr-font-family-mono);
    font-size: var(--sr-font-size-lg);
    font-weight: 600;
  }

  &__actions {
    display: flex;
    gap: var(--sr-space-2);
    align-items: center;
  }
}
</style>
