import { srWithInstall } from '../../utils/with-install'
import ConfigProvider from './src/config-provider.vue'

/** 全局配置下发容器 */
export const SrConfigProvider = srWithInstall(ConfigProvider)

export * from './src/config-provider'
export default SrConfigProvider
