import { srWithInstall } from '../../utils/with-install'
import DatePicker from './src/date-picker.vue'

/** 日期选择器 */
export const SrDatePicker = srWithInstall(DatePicker)

export * from './src/date-picker'
export * from './src/date-utils'
export default SrDatePicker
