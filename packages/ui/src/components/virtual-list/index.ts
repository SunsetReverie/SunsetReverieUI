import { srWithInstall } from '../../utils/with-install'
import VirtualList from './src/virtual-list.vue'

/** 虚拟列表 */
export const SrVirtualList = srWithInstall(VirtualList)

export * from './src/virtual-list'
export default SrVirtualList
