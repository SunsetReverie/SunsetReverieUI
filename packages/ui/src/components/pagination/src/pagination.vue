<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import type { SrSize } from '../../../types/config'
import SrInput from '../../input/src/input.vue'
import SrSelect from '../../select/src/select.vue'
import { paginationProps } from './pagination'

defineOptions({ name: 'SrPagination' })

const props = defineProps(paginationProps)

const emit = defineEmits<{
  'update:modelValue': [page: number]
  'update:pageSize': [pageSize: number]
  /** 页码或每页条数变化 */
  change: [page: number, pageSize: number]
  /** 每页条数变化 */
  'size-change': [pageSize: number]
}>()

const config = useSrConfig()

/** 最终尺寸 */
const resolvedSize = computed<SrSize>(() => props.size ?? config.value.size)

/** 总页数，至少 1 页 */
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / Math.max(1, props.pageSize))))

/** 内部页码：未绑定 v-model 时也能翻页 */
const innerPage = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    innerPage.value = value
  },
)

// 数据变少后可能停在空页，回落到最后一页
watch(pageCount, (total) => {
  if (innerPage.value > total) innerPage.value = total
})

/** 页码列表，超过 7 页时用省略号收拢 */
const pageList = computed<(number | '...')[]>(() => {
  const total = pageCount.value
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)

  const pages: (number | '...')[] = [1]
  const start = Math.max(2, innerPage.value - 1)
  const end = Math.min(total - 1, innerPage.value + 1)
  if (start > 2) pages.push('...')
  for (let index = start; index <= end; index += 1) pages.push(index)
  if (end < total - 1) pages.push('...')
  pages.push(total)
  return pages
})

/** 每页条数的下拉选项 */
const sizerOptions = computed(() =>
  props.pageSizeOptions.map((value) => ({ value, label: `${value} 条/页` })),
)

/** 跳页输入框的临时值 */
const jumpValue = ref('')

/**
 * 翻页
 * @param page 目标页码
 */
function go(page: number): void {
  if (props.disabled) return
  const next = Math.min(Math.max(1, page), pageCount.value)
  if (next === innerPage.value) return
  innerPage.value = next
  emit('update:modelValue', next)
  emit('change', next, props.pageSize)
}

/**
 * 切换每页条数：页数重置回第一页，避免落在越界的页上
 * @param value 新的每页条数
 */
function onSizeChange(value: unknown): void {
  if (props.disabled) return
  const next = Number(value)
  if (!Number.isFinite(next) || next <= 0 || next === props.pageSize) return

  emit('update:pageSize', next)
  emit('size-change', next)
  if (innerPage.value !== 1) {
    innerPage.value = 1
    emit('update:modelValue', 1)
  }
  emit('change', innerPage.value, next)
}

/** 提交跳页 */
function onJump(): void {
  const next = Number.parseInt(jumpValue.value, 10)
  jumpValue.value = ''
  if (Number.isNaN(next)) return
  go(next)
}
</script>

<template>
  <nav
    class="sr-pagination"
    :class="[`sr-pagination--${resolvedSize}`, { 'is-disabled': disabled }]"
    aria-label="分页"
  >
    <span v-if="showTotal" class="sr-pagination__total">共 {{ total }} 条</span>

    <template v-if="simple">
      <button
        class="sr-pagination__btn"
        type="button"
        :disabled="disabled || innerPage <= 1"
        @click="go(innerPage - 1)"
      >
        上一页
      </button>

      <span class="sr-pagination__simple">{{ innerPage }} / {{ pageCount }}</span>

      <button
        class="sr-pagination__btn"
        type="button"
        :disabled="disabled || innerPage >= pageCount"
        @click="go(innerPage + 1)"
      >
        下一页
      </button>
    </template>

    <template v-else>
      <button
        class="sr-pagination__btn"
        type="button"
        :disabled="disabled || innerPage <= 1"
        @click="go(innerPage - 1)"
      >
        上一页
      </button>

      <template v-for="(item, index) in pageList" :key="`${item}-${index}`">
        <span v-if="item === '...'" class="sr-pagination__gap">…</span>
        <button
          v-else
          class="sr-pagination__page"
          :class="{ 'is-active': item === innerPage }"
          type="button"
          :disabled="disabled"
          :aria-current="item === innerPage ? 'page' : undefined"
          @click="go(Number(item))"
        >
          {{ item }}
        </button>
      </template>

      <button
        class="sr-pagination__btn"
        type="button"
        :disabled="disabled || innerPage >= pageCount"
        @click="go(innerPage + 1)"
      >
        下一页
      </button>
    </template>

    <sr-select
      v-if="showSizer && !simple && pageSizeOptions.length > 0"
      class="sr-pagination__sizer"
      :model-value="pageSize"
      :options="sizerOptions"
      :size="resolvedSize"
      :disabled="disabled"
      @update:model-value="onSizeChange"
    />

    <span v-if="showJumper && !simple" class="sr-pagination__jumper" @keydown.enter="onJump">
      跳至
      <sr-input
        v-model="jumpValue"
        class="sr-pagination__jumper-input"
        :size="resolvedSize"
        :disabled="disabled"
        type="text"
        inputmode="numeric"
        aria-label="跳转页码"
      />
      页
    </span>
  </nav>
</template>
