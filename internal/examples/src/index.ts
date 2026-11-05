/**
 * 示例组件注册表
 *
 * 供 playground-vue3、playground-nuxt4 与 VitePress 文档站共用同一份示例源码，
 * 避免三处各写一份导致漂移（对应规划文档 13.3）。
 */

import type { Component } from 'vue'

/** 键为 `组件名/示例名`，值为动态导入的示例组件 */
export const SR_EXAMPLES: Record<string, () => Promise<Component>> = {
  // W4 起随组件逐个补充，例如：
  // 'button/basic': () => import('./button/basic.vue'),
}

/**
 * 按 key 取示例组件
 * @param key 形如 'button/basic'
 * @returns 示例组件加载函数；不存在时返回 undefined
 */
export function getExample(key: string): (() => Promise<Component>) | undefined {
  return SR_EXAMPLES[key]
}
