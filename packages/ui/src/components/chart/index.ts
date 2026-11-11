import { srWithInstall } from '../../utils/with-install'

import Chart from './src/chart.vue'

/** 图表（折线 / 柱状 / 面积 / 饼图） */
export const SrChart = srWithInstall(Chart)

export * from './src/chart'
export default SrChart
