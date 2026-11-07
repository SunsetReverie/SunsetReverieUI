import { srWithInstall } from '../../utils/with-install'
import Progress from './src/progress.vue'

/** 进度条 */
export const SrProgress = srWithInstall(Progress)

export * from './src/progress'
export default SrProgress
