import { srWithInstall } from '../../utils/with-install'
import Confirm from './src/confirm.vue'

/** 确认框（声明式） */
export const SrConfirm = srWithInstall(Confirm)

export * from './src/confirm'
export { srConfirm } from './src/confirm-api'
export type { SrConfirmApi } from './src/confirm-api'
export type { SrConfirmItem } from './src/store'
export default SrConfirm
