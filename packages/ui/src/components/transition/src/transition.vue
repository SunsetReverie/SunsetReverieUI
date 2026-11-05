<script setup lang="ts">
import { computed } from 'vue'

import { transitionProps } from './transition'

defineOptions({ name: 'SrTransition', inheritAttrs: false })

// 刻意不写 <style> 块：过渡类定义在 styles/base/transitions.less（随 base.css 注入），组件本身不带样式。

const props = defineProps(transitionProps)

/**
 * 显式声明插槽
 *
 * 文档 9.x 要求所有组件用 defineSlots 声明插槽（供 Volar 提示）；
 * 对 SrTransition 还有个额外作用：不声明时 vue-tsc 生成的 d.ts 会引用
 * 未定义的 __VLS_component，导致下游 tsc 解析报语法错误。
 */
defineSlots<{
  /** 默认插槽：需要被过渡的单个元素 */
  default?: () => unknown
}>()

/**
 * 实际使用的过渡类名前缀
 * 关闭动画时传空字符串，配合 :css="false" 让 Vue 跳过类名切换
 * @returns 类名前缀
 */
const transitionName = computed(() => (props.enabled ? `sr-${props.name}` : ''))
</script>

<template>
  <Transition :name="transitionName" :appear="appear" :mode="mode" :css="enabled">
    <slot />
  </Transition>
</template>
