import { srWithInstall } from '../../utils/with-install'
import Transition from './src/transition.vue'

/** 过渡封装组件 */
export const SrTransition = srWithInstall(Transition)

export * from './src/transition'
export default SrTransition
