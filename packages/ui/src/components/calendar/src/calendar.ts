import type { ExtractPropTypes, PropType } from 'vue'

export const calendarProps = {
  /**
   * 选中日期，配合 v-model
   *
   * 格式 `YYYY-MM-DD`，空字符串表示未选。
   */
  modelValue: {
    type: String,
    default: '',
  },
  /** 每周第一天，0 是周日、1 是周一 @default 1 */
  firstDayOfWeek: {
    type: Number,
    default: 1,
  },
  /** 最小可选日期 `YYYY-MM-DD` */
  min: {
    type: String,
    default: '',
  },
  /** 最大可选日期 `YYYY-MM-DD` */
  max: {
    type: String,
    default: '',
  },
  /**
   * 需要标记的日期 @default []
   *
   * 有事件的日期在格子下方显示一个小点。
   */
  marks: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  /** 顶部显示「回到今天」 @default true */
  showToday: {
    type: Boolean,
    default: true,
  },
  /** 格子高度（像素） @default 44 */
  cellHeight: {
    type: Number,
    default: 44,
  },
} as const

export type SrCalendarProps = ExtractPropTypes<typeof calendarProps>
