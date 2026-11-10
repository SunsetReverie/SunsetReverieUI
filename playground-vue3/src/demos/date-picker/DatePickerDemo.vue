<script setup lang="ts">
import { computed, ref } from 'vue'
import { SrDatePicker, type SrDatePickerShortcut } from '@sunset-reverie/ui'

defineOptions({ name: 'DatePickerDemo' })

/** 各模式的独立值 */
const single = ref<Date | null>(new Date(2026, 10, 8))
const range = ref<[Date, Date] | null>(null)
const dateTime = ref<Date | null>(null)
const dateTimeRange = ref<[Date, Date] | null>(null)

/** 不带秒的时间 */
const noSeconds = ref<Date | null>(null)

/** 范围限制 */
const bounded = ref<Date | null>(null)
const today = new Date()
const minDate = new Date(today.getFullYear(), today.getMonth(), 1)
const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 0)

/** 禁用周末 */
const weekdayOnly = ref<Date | null>(null)

function disabledWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/** 自定义快捷项 */
const customShortcuts: SrDatePickerShortcut[] = [
  {
    label: '本季度',
    value: () => {
      const now = new Date()
      const quarterStart = Math.floor(now.getMonth() / 3) * 3
      return [new Date(now.getFullYear(), quarterStart, 1), now]
    },
  },
  { label: '今年', value: () => [new Date(new Date().getFullYear(), 0, 1), new Date()] },
  {
    label: '去年全年',
    value: () => {
      const y = new Date().getFullYear() - 1
      return [new Date(y, 0, 1), new Date(y, 11, 31)]
    },
  },
]

const customRange = ref<[Date, Date] | null>(null)

/** 字符串输出 */
// valueFormat 运行时产出 string，但组件类型仍按 Date 声明（库里用断言绕过去了）。
// 这里用 ref 承接 v-model，再用 computed 把展示值收窄成 string，模板无需类型断言
const strModel = ref<Date | [Date, Date] | null>(null)
const strValue = computed<string>(() => {
  const value: unknown = strModel.value
  return typeof value === 'string' ? value : ''
})

/** 表单校验态 */
const statusValue = ref<Date | null>(null)

/** 只读与禁用 */
const readonlyValue = ref<Date | null>(new Date(2026, 10, 8))
</script>

<template>
  <div class="demo">
    <section>
      <h3>单个日期</h3>
      <div class="grid">
        <div>
          <span class="tag">默认（点选即提交）</span>
          <SrDatePicker v-model="single" />
          <p class="hint">当前值：{{ single ? single.toLocaleDateString('zh-CN') : '空' }}</p>
        </div>
        <div>
          <span class="tag">form.stock</span>
          <SrDatePicker v-model="single" :first-day-of-week="0" />
          <p class="hint">firstDayOfWeek = 0（周日开头）</p>
        </div>
      </div>
    </section>

    <section>
      <h3>日期区间</h3>
      <SrDatePicker v-model="range" type="daterange" />
      <p class="hint">
        {{
          range
            ? `${range[0].toLocaleDateString('zh-CN')} ~ ${range[1].toLocaleDateString('zh-CN')}`
            : '点两次选择起止；反向选择会自动交换'
        }}
      </p>
    </section>

    <section>
      <h3>日期 + 时间</h3>
      <div class="grid">
        <div>
          <span class="tag">datetime</span>
          <SrDatePicker v-model="dateTime" type="datetime" />
        </div>
        <div>
          <span class="tag">datetimerange</span>
          <SrDatePicker v-model="dateTimeRange" type="datetimerange" />
        </div>
      </div>
      <p class="hint">带时间时需要点「确定」才提交，避免调完时分秒就关掉面板</p>
    </section>

    <section>
      <h3>时间精度（showSeconds）</h3>
      <div class="grid">
        <div>
          <span class="tag">showSeconds = true（时:分:秒）</span>
          <SrDatePicker v-model="dateTime" type="datetime" />
        </div>
        <div>
          <span class="tag">showSeconds = false（只要时:分）</span>
          <SrDatePicker v-model="noSeconds" type="datetime" :show-seconds="false" />
        </div>
      </div>
      <p class="hint">关掉秒后，值里的秒会被清零，显示格式也自动变成 HH:mm</p>
    </section>

    <section>
      <h3>范围限制（min / max）</h3>
      <SrDatePicker v-model="bounded" :min="minDate" :max="maxDate" />
      <p class="hint">只能选本月 1 号到两个月后；超出的日期置灰并划掉</p>
    </section>

    <section>
      <h3>自定义禁用（disabledDate）</h3>
      <SrDatePicker v-model="weekdayOnly" :disabled-date="disabledWeekend" />
      <p class="hint">这里禁用了周末</p>
    </section>

    <section>
      <h3>快捷选项（可选变体）</h3>
      <SrDatePicker v-model="customRange" type="daterange" :shortcuts="customShortcuts" />
      <p class="hint">
        默认不显示快捷区，传 shortcuts 才出现。value 是函数而不是固定值——快捷项依赖「当前时间」，
        在组件外算会过时
      </p>
    </section>

    <section>
      <h3>默认形态（无快捷区）</h3>
      <SrDatePicker v-model="single" />
      <p class="hint">不传 shortcuts 时面板只有日历本身，与上面那块对比</p>
    </section>

    <section>
      <h3>字符串输出（valueFormat）</h3>
      <SrDatePicker v-model="strModel" value-format="YYYY/MM/DD" />
      <p class="hint">绑定的值：{{ strValue || '空' }}（类型是 string，直接塞给后端接口）</p>
    </section>

    <section>
      <h3>校验态</h3>
      <div class="grid">
        <SrDatePicker v-model="statusValue" status="error" placeholder="必填项" />
        <SrDatePicker v-model="statusValue" status="success" />
      </div>
    </section>

    <section>
      <h3>只读与禁用</h3>
      <div class="grid">
        <SrDatePicker v-model="readonlyValue" readonly />
        <SrDatePicker v-model="readonlyValue" disabled />
      </div>
    </section>

    <section>
      <h3>清除</h3>
      <SrDatePicker v-model="single" />
      <p class="hint">有值时右侧出现清除按钮，点击派发 null</p>
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
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}
.tag {
  display: block;
  margin-bottom: 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}
</style>
