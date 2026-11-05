<script setup lang="ts">
import { computed } from 'vue'

import { transitionProps } from './transition'

defineOptions({ name: 'SrTransition', inheritAttrs: false })

const props = defineProps(transitionProps)

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

<!--
  过渡类定义在 styles/base/transitions.less（随 base.css 一起注入）。
  组件本身不带样式，避免样式与 JS 耦合。
-->
