import { srWithInstall } from '../../utils/with-install'
import Checkbox from './src/checkbox.vue'
import CheckboxGroup from './src/checkbox-group.vue'

/** 复选框 */
export const SrCheckbox = srWithInstall(Checkbox)

/** 复选框组 */
export const SrCheckboxGroup = srWithInstall(CheckboxGroup)

export * from './src/checkbox'
export default SrCheckbox
