import { srWithInstall } from '../../utils/with-install'
import ContextMenu from './src/context-menu.vue'

/** 右键菜单 */
export const SrContextMenu = srWithInstall(ContextMenu)

export * from './src/context-menu'
export default SrContextMenu
