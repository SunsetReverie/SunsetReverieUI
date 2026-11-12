/**
 * 浮层层级栈
 *
 * 之前每个浮层各自写死一个 z-index 常量（popover 1050、抽屉 2101、弹窗 3002 起步），
 * 导致三类问题：抽屉里的下拉被抽屉盖住、全局提示被弹窗盖住、
 * 弹窗每开一次层级 +1 越开越高。
 *
 * 这里把「同一类浮层」放进一条栈：按家族分配基数，同族每多开一个 +10，
 * 关闭时归还。层级关系因此变成可预测的相对顺序：
 *
 * ```
 * 基础内容 < 抽屉(2000) < 弹窗(3000) < popover(4000) < 全局提示(5000+)
 * ```
 *
 * popover 高于弹窗，是为了「弹窗/抽屉内部触发下拉」也能显示在最上层；
 * 全局提示再高一层，保证任何浮层里触发的 toast 都可见。
 */

/** 已分配的层级 */
interface ZLayer {
  /** 家族名，如同一类浮层共享基数 */
  family: string
  /** 实际分配到的 z-index */
  z: number
}

/** 同族浮层的递增步长 */
const STEP = 10

/** 当前已分配的层级（按分配顺序） */
const layers: ZLayer[] = []

/**
 * 申请一个层级
 *
 * 同族已存在时在基数上依次 +10，保证后打开的在上面；
 * 关闭后归还，避免「开关多次层级无限增长」。
 * @param family 家族名，如 `modal` / `drawer`
 * @param base 家族基数
 * @returns 分配到的 z-index
 */
export function srAllocZIndex(family: string, base: number): number {
  const used = layers.filter((layer) => layer.family === family).length
  const z = base + used * STEP
  layers.push({ family, z })
  return z
}

/**
 * 归还层级
 * @param z 之前分配到的值；未分配过则忽略
 * @returns {void}
 */
export function srFreeZIndex(z: number): void {
  const index = layers.findIndex((layer) => layer.z === z)
  if (index >= 0) layers.splice(index, 1)
}

/**
 * 当前已分配的最高层级
 * @returns 最高 z-index；没有任何浮层时为 0
 */
export function srTopZIndex(): number {
  return layers.reduce((max, layer) => Math.max(max, layer.z), 0)
}

/**
 * 全局提示的层级
 *
 * 永远高于当前所有浮层：即使弹窗连开多层，toast / message / notification / confirm
 * 也要盖在最上面，否则「提交失败但看不到原因」。
 * @param base 提示家族基数 @default 5000
 * @returns 建议的 z-index
 */
export function srNoticeZIndex(base = 5000): number {
  return Math.max(base, srTopZIndex() + 100)
}
