/**
 * 属性透传辅助
 *
 * 组件统一 inheritAttrs: false，再手动把 $attrs 落到语义根元素。
 * class / style 已单独处理时，需要从 $attrs 里剔除，避免重复绑定。
 */

/**
 * 从对象中剔除指定键
 * @param source 源对象
 * @param keys 要剔除的键
 * @returns 剔除后的新对象
 */
export function srOmit<T extends Record<string, unknown>>(
  source: T,
  keys: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(source)) {
    if (!keys.includes(key)) result[key] = source[key]
  }
  return result
}
