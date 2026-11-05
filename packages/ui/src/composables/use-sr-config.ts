/**
 * 全局配置的读取与下发
 *
 * 设计要点：
 * 1. 用 provide / inject，支持局部覆盖（如「设置页用 sm 尺寸」）
 * 2. 未找到 provider 时回落到默认配置，组件因此可以独立使用
 * 3. 提供的是 ComputedRef，父级配置变化时子组件自动响应
 */

import { computed, inject, provide, type ComputedRef, type InjectionKey } from 'vue'

import { SR_CONFIG_DEFAULTS, type SrConfig } from '../types/config'

/** 配置注入键 */
export const SR_CONFIG_KEY: InjectionKey<ComputedRef<SrConfig>> = Symbol('sr-config')

/**
 * 读取当前生效的全局配置
 * @returns 配置的只读响应式引用
 */
export function useSrConfig(): ComputedRef<SrConfig> {
  return inject(
    SR_CONFIG_KEY,
    // 默认值包成 computed，保证返回值类型一致（调用方无需区分是否有 provider）
    computed(() => SR_CONFIG_DEFAULTS),
  )
}

/**
 * 下发配置（供 SrConfigProvider 内部使用）
 * @param config 合并后的配置引用
 */
export function provideSrConfig(config: ComputedRef<SrConfig>): void {
  provide(SR_CONFIG_KEY, config)
}
