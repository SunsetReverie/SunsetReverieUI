<script setup lang="ts">
import { computed } from 'vue'

import SrConfirm from './confirm.vue'
import { resolveConfirm } from './confirm-api'
import { srConfirmItems, srConfirmLoadingIds } from './store'

defineOptions({ name: 'SrConfirmContainer' })

/** 组装模板所需的数据，加载态从独立集合读取 */
const items = computed(() =>
  srConfirmItems.value.map((item) => ({
    id: item.id,
    options: item.options,
    loading: srConfirmLoadingIds.value.has(item.id),
  })),
)
</script>

<template>
  <sr-confirm
    v-for="item in items"
    :key="item.id"
    :model-value="true"
    :type="item.options.type"
    :title="item.options.title"
    :content="item.options.content"
    :confirm-text="item.options.confirmText"
    :cancel-text="item.options.cancelText"
    :show-cancel="item.options.showCancel"
    :mask-closable="item.options.maskClosable"
    :width="item.options.width"
    :loading="item.loading"
    @confirm="resolveConfirm(item.id, true)"
    @cancel="resolveConfirm(item.id, false)"
  />
</template>
