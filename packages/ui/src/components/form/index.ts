import { srWithInstall } from '../../utils/with-install'
import Form from './src/form.vue'
import FormItem from './src/form-item.vue'

/** 表单 */
export const SrForm = srWithInstall(Form)

/** 表单项 */
export const SrFormItem = srWithInstall(FormItem)

export * from './src/form'
export default SrForm
