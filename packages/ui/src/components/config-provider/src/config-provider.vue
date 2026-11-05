<script setup lang="ts">
import { computed } from 'vue'

import { provideSrConfig, useSrConfig } from '../../../composables/use-sr-config'
import type { SrConfig } from '../../../types/config'
import { configProviderProps } from './config-provider'

defineOptions({ name: 'SrConfigProvider', inheritAttrs: false })

const props = defineProps(configProviderProps)

/** 上层配置（无 provider 时为默认值） */
const parent = useSrConfig()

/**
 * 合并配置：显式传入的字段覆盖上层，未传的字段继承
 * @returns 合并后的配置
 */
const merged = computed<SrConfig>(() => ({
  ...parent.value,
  ...(props.size ? { size: props.size } : {}),
  ...(props.zIndex !== undefined ? { zIndex: props.zIndex } : {}),
}))

provideSrConfig(merged)
</script>

<template>
  <!--
    不渲染额外 DOM：配置只是上下文，不应该影响布局。
    因此本组件没有 src/style/index.less —— 构建脚本会为它产出占位 CSS，
    保证 resolver 引用的 components/config-provider/style.css 路径有效。
  -->
  <slot />
</template>
