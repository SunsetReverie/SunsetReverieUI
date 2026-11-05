import { srWithInstall } from '../../utils/with-install'
import Radio from './src/radio.vue'
import RadioGroup from './src/radio-group.vue'

/** 单选框 */
export const SrRadio = srWithInstall(Radio)

/** 单选框组 */
export const SrRadioGroup = srWithInstall(RadioGroup)

export * from './src/radio'
export default SrRadio
