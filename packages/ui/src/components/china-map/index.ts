import { srWithInstall } from '../../utils/with-install'

import ChinaMap from './src/china-map.vue'

/**
 * 中国省级地图
 *
 * 刻意不放进 `src/index.ts` 的主入口：地图数据 gzip 后约 39KB，
 * 让不用地图的项目白背这份体积不划算。使用方显式引入本子路径才加载：
 * `import { SrChinaMap } from '@sunset-reverie/ui/china-map'`。
 */
export const SrChinaMap = srWithInstall(ChinaMap)

export * from './src/china-map'
export default SrChinaMap
