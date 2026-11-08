<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import SrIcon from '../../icon/src/icon.vue'
import { transferProps, type SrTransferItem, type SrTransferValue } from './transfer'

defineOptions({ name: 'SrTransfer', inheritAttrs: false })

const props = defineProps(transferProps)

const emit = defineEmits<{
  /** 右侧值变化 */
  'update:modelValue': [value: SrTransferValue[]]
  /** 值变化，附带移动方向 */
  change: [value: SrTransferValue[], direction: 'left' | 'right']
}>()

const config = useSrConfig()

/** 左侧勾选 */
const leftChecked = ref<SrTransferValue[]>([])
/** 右侧勾选 */
const rightChecked = ref<SrTransferValue[]>([])
/** 左侧搜索词 */
const leftKeyword = ref('')
/** 右侧搜索词 */
const rightKeyword = ref('')

/** 尺寸：自身 > 全局配置 */
const resolvedSize = computed(() => props.size ?? config.value.size)

/** 右侧值集合 */
const selectedSet = computed(() => new Set(props.modelValue))

/**
 * 按「是否已选」把数据分成两堆
 *
 * 两侧顺序都跟 `data` 保持一致，所以移动后不会乱跳。
 */
const leftItems = computed(() => props.data.filter((item) => !selectedSet.value.has(item.value)))
const rightItems = computed(() => props.data.filter((item) => selectedSet.value.has(item.value)))

/**
 * 按关键字过滤
 * @param list 列表
 * @param keyword 关键字
 * @returns 过滤结果
 */
function filterItems(list: SrTransferItem[], keyword: string): SrTransferItem[] {
  const needle = keyword.trim().toLowerCase()
  if (!needle) return list
  return list.filter((item) => item.label.toLowerCase().includes(needle))
}

/** 过滤后的两侧列表 */
const leftFiltered = computed(() => filterItems(leftItems.value, leftKeyword.value))
const rightFiltered = computed(() => filterItems(rightItems.value, rightKeyword.value))

/**
 * 某一侧是否可移动
 * @param checked 勾选集合
 * @param list 该侧列表
 * @returns 是否可以点按钮
 */
function canMove(checked: SrTransferValue[], list: SrTransferItem[]): boolean {
  if (props.disabled) return false
  return checked.some((value) => list.some((item) => item.value === value && !item.disabled))
}

/** 能否右移 */
const canToRight = computed(() => canMove(leftChecked.value, leftItems.value))
/** 能否左移 */
const canToLeft = computed(() => canMove(rightChecked.value, rightItems.value))

/**
 * 某一侧的全选状态
 * @param checked 勾选集合
 * @param list 该侧列表
 * @returns 'all' | 'none' | 'partial'
 */
function checkState(checked: SrTransferValue[], list: SrTransferItem[]): 'all' | 'none' | 'partial' {
  const enabled = list.filter((item) => !item.disabled)
  if (!enabled.length) return 'none'

  const hit = enabled.filter((item) => checked.includes(item.value))
  if (hit.length === 0) return 'none'
  if (hit.length === enabled.length) return 'all'
  return 'partial'
}

/**
 * 切换单项勾选
 * @param side 哪一侧
 * @param item 项
 */
function toggleItem(side: 'left' | 'right', item: SrTransferItem): void {
  if (props.disabled || item.disabled) return

  const target = side === 'left' ? leftChecked : rightChecked
  const index = target.value.indexOf(item.value)

  if (index >= 0) target.value = target.value.filter((value) => value !== item.value)
  else target.value = [...target.value, item.value]
}

/**
 * 全选 / 取消全选
 * @param side 哪一侧
 */
function toggleAll(side: 'left' | 'right'): void {
  if (props.disabled) return

  const list = side === 'left' ? leftItems.value : rightItems.value
  const target = side === 'left' ? leftChecked : rightChecked
  const enabled = list.filter((item) => !item.disabled).map((item) => item.value)

  const allChecked = enabled.every((value) => target.value.includes(value))
  target.value = allChecked ? [] : enabled
}

/**
 * 移动
 * @param direction 方向
 */
function move(direction: 'left' | 'right'): void {
  const checked = direction === 'right' ? leftChecked.value : rightChecked.value
  const source = direction === 'right' ? leftItems.value : rightItems.value
  const movable = checked.filter((value) => source.some((item) => item.value === value && !item.disabled))

  if (!movable.length) return

  const set = new Set(props.modelValue)
  if (direction === 'right') movable.forEach((value) => set.add(value))
  else movable.forEach((value) => set.delete(value))

  // 按 data 的顺序输出，避免右侧顺序随点击变化
  const next = props.data.filter((item) => set.has(item.value)).map((item) => item.value)

  emit('update:modelValue', next)
  emit('change', next, direction)

  if (direction === 'right') leftChecked.value = []
  else rightChecked.value = []
}

/** 数据变化时清掉已不存在的勾选 */
watch(
  () => props.data,
  () => {
    const valid = new Set(props.data.map((item) => item.value))
    leftChecked.value = leftChecked.value.filter((value) => valid.has(value))
    rightChecked.value = rightChecked.value.filter((value) => valid.has(value))
  },
  { deep: true },
)
</script>

<template>
  <div
    class="sr-transfer"
    :class="[{ 'is-disabled': disabled }, resolvedSize ? `sr-transfer--${resolvedSize}` : '']"
  >
    <!-- 左：待选 -->
    <div class="sr-transfer__panel">
      <div class="sr-transfer__header">
        <label class="sr-transfer__check">
          <input
            type="checkbox"
            :checked="checkState(leftChecked, leftItems) === 'all'"
            :indeterminate.prop="checkState(leftChecked, leftItems) === 'partial'"
            :disabled="disabled"
            @change="toggleAll('left')"
          />
          <span class="sr-transfer__title">{{ titles[0] }}</span>
        </label>
        <span class="sr-transfer__count">{{ leftChecked.length }} / {{ leftItems.length }}</span>
      </div>

      <div v-if="filterable" class="sr-transfer__filter">
        <SrIcon name="lucide:search" :size="13" />
        <input v-model="leftKeyword" class="sr-transfer__input" type="text" placeholder="搜索" />
      </div>

      <div class="sr-transfer__list" :style="{ height: `${height}px` }">
        <label
          v-for="item in leftFiltered"
          :key="item.value"
          class="sr-transfer__item"
          :class="{ 'is-disabled': item.disabled || disabled }"
        >
          <input
            type="checkbox"
            :checked="leftChecked.includes(item.value)"
            :disabled="disabled || item.disabled"
            @change="toggleItem('left', item)"
          />
          <span class="sr-transfer__label">{{ item.label }}</span>
        </label>

        <p v-if="!leftFiltered.length" class="sr-transfer__empty">{{ emptyText }}</p>
      </div>
    </div>

    <!-- 中间操作 -->
    <div class="sr-transfer__actions">
      <button
        class="sr-transfer__btn"
        type="button"
        :disabled="!canToRight"
        aria-label="移到右侧"
        @click="move('right')"
      >
        <SrIcon name="lucide:chevron-right" :size="14" />
      </button>
      <button
        class="sr-transfer__btn"
        type="button"
        :disabled="!canToLeft"
        aria-label="移到左侧"
        @click="move('left')"
      >
        <SrIcon name="lucide:chevron-left" :size="14" />
      </button>
    </div>

    <!-- 右：已选 -->
    <div class="sr-transfer__panel">
      <div class="sr-transfer__header">
        <label class="sr-transfer__check">
          <input
            type="checkbox"
            :checked="checkState(rightChecked, rightItems) === 'all'"
            :indeterminate.prop="checkState(rightChecked, rightItems) === 'partial'"
            :disabled="disabled"
            @change="toggleAll('right')"
          />
          <span class="sr-transfer__title">{{ titles[1] }}</span>
        </label>
        <span class="sr-transfer__count">{{ rightChecked.length }} / {{ rightItems.length }}</span>
      </div>

      <div v-if="filterable" class="sr-transfer__filter">
        <SrIcon name="lucide:search" :size="13" />
        <input v-model="rightKeyword" class="sr-transfer__input" type="text" placeholder="搜索" />
      </div>

      <div class="sr-transfer__list" :style="{ height: `${height}px` }">
        <label
          v-for="item in rightFiltered"
          :key="item.value"
          class="sr-transfer__item"
          :class="{ 'is-disabled': item.disabled || disabled }"
        >
          <input
            type="checkbox"
            :checked="rightChecked.includes(item.value)"
            :disabled="disabled || item.disabled"
            @change="toggleItem('right', item)"
          />
          <span class="sr-transfer__label">{{ item.label }}</span>
        </label>

        <p v-if="!rightFiltered.length" class="sr-transfer__empty">{{ emptyText }}</p>
      </div>
    </div>
  </div>
</template>
