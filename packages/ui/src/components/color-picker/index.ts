import { srWithInstall } from '../../utils/with-install'
import ColorPicker from './src/color-picker.vue'

/** 颜色选择器 */
export const SrColorPicker = srWithInstall(ColorPicker)

export * from './src/color-picker'
export * from './src/color-utils'
export default SrColorPicker
