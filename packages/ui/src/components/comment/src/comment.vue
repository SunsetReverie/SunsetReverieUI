<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import SrButton from '../../button/src/button.vue'
import SrEmpty from '../../empty/src/empty.vue'
import { buildEmojiMap } from '../../emoji-picker/src/parse'
import SrLoading from '../../loading/src/loading.vue'
import SrPagination from '../../pagination/src/pagination.vue'
import CommentEditor from './comment-editor.vue'
import CommentItem from './comment-item.vue'
import { COMMENT_SORT_OPTIONS, commentProps } from './comment'

import type { SrCommentData, SrCommentSort, SrCommentSubmitPayload } from './types'

defineOptions({ name: 'SrComment' })

const props = defineProps(commentProps)

const emit = defineEmits<{
  /** 表单通过校验，宿主应在这里发请求 */
  submit: [payload: SrCommentSubmitPayload]
  /** 点赞 / 取消点赞 */
  like: [comment: SrCommentData]
  /** 删除 */
  delete: [comment: SrCommentData]
  /** 排序变化 */
  'sort-change': [sort: SrCommentSort]
  /** 页码变化 */
  'page-change': [page: number]
  /** `more` 模式请求下一页 */
  'load-more': []
}>()

/** 当前排序 */
const currentSort = ref<SrCommentSort>(props.sort)

/** 当前页码 */
const currentPage = ref(1)

/** 正在回复的评论 */
const replyingComment = ref<SrCommentData | null>(null)

/** 表单实例 */
const editorRef = ref<InstanceType<typeof CommentEditor> | null>(null)

/** 加载更多的触发点 */
const loadMoreRef = ref<HTMLElement | null>(null)

/** 自动加载观察器 */
let observer: IntersectionObserver | null = null

/**
 * 表情查找表
 *
 * @remarks 在容器算一次再逐层传下去。让几十个条目各遍历一遍表情包建表，
 * 纯属浪费。
 */
const emojiMap = computed(() => (props.emojiPackages.length ? buildEmojiMap(props.emojiPackages) : new Map()))

/** 实际每页条数 */
const effectivePageSize = computed(() => (props.pageSize > 0 ? props.pageSize : 10))

/**
 * 实际分页方式
 *
 * @remarks 只传了 `pageSize` 没传 `pagination` 时按 `pager` 处理，
 * 否则老代码升级后会一屏铺出几千条。
 */
const effectivePagination = computed(() => {
  if (props.pagination !== 'none') return props.pagination
  return props.pageSize > 0 ? 'pager' : 'none'
})

/** 排序后的列表（复制再排，不动 props） */
const sortedComments = computed<SrCommentData[]>(() => {
  const list = [...props.comments]

  if (currentSort.value === 'oldest') {
    return list.reverse()
  }

  if (currentSort.value === 'hottest') {
    // 热度只看点赞数：简单规则更容易向用户解释
    return list.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
  }

  return list
})

/** 总页数 */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedComments.value.length / effectivePageSize.value)),
)

/**
 * 当前展示的列表
 *
 * @remarks 只有 `pager` 才切片；`more` 模式再切一次，
 * 用户点了「加载更多」却看不到新内容是常见坑。
 */
const pagedComments = computed(() =>
  effectivePagination.value === 'pager'
    ? sortedComments.value.slice(
        (currentPage.value - 1) * effectivePageSize.value,
        currentPage.value * effectivePageSize.value,
      )
    : sortedComments.value,
)

/** 总条数：含回复，否则数字明显偏小 */
const totalCount = computed(() =>
  props.comments.reduce((sum, item) => sum + 1 + (item.replies?.length ?? 0), 0),
)

/** 是否显示排序切换 */
const showSortBar = computed(() => props.showSort && props.comments.length > 1)

/**
 * 切换排序
 * @param sort 排序方式
 */
function changeSort(sort: SrCommentSort): void {
  if (currentSort.value === sort) return

  currentSort.value = sort
  currentPage.value = 1
  emit('sort-change', sort)
}

/**
 * 页码变化
 * @param page 新页码
 */
function onPageChange(page: number): void {
  currentPage.value = page
  emit('page-change', page)
}

/**
 * 进入回复态
 * @param comment 回复目标
 */
function startReply(comment: SrCommentData): void {
  replyingComment.value = comment
}

/** 退出回复态 */
function cancelReply(): void {
  replyingComment.value = null
}

/**
 * 表单提交
 * @param payload 提交载荷
 *
 * @remarks 不在这里清空表单：立刻清空会让失败的提交丢掉用户刚写的内容。
 * 宿主成功后调 `clearEditor()`。
 */
function onSubmit(payload: SrCommentSubmitPayload): void {
  emit('submit', payload)
}

/** 清空表单并退出回复态 */
function clearEditor(): void {
  editorRef.value?.reset()
  replyingComment.value = null
}

/** 请求加载更多 */
function requestLoadMore(): void {
  // 滚动自动加载会高频触发，不拦一道能连发十几个请求
  if (props.loadingMore || !props.hasMore) return
  emit('load-more')
}

/** 重建观察器 */
function setupObserver(): void {
  observer?.disconnect()
  observer = null

  if (!props.autoLoadMore || effectivePagination.value !== 'more') return
  if (typeof IntersectionObserver === 'undefined') return

  const target = loadMoreRef.value
  if (!target) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) requestLoadMore()
    },
    { rootMargin: '120px' },
  )
  observer.observe(target)
}

defineExpose({ clearEditor, cancelReply })

watch(
  () => props.sort,
  (value) => {
    currentSort.value = value
    currentPage.value = 1
  },
)

// 数据变少导致页码越界时回退，否则会停在空白页
watch(totalPages, (max) => {
  if (currentPage.value > max) currentPage.value = max
})

watch(
  [() => props.autoLoadMore, effectivePagination, loadMoreRef, () => props.hasMore],
  () => nextTick(setupObserver),
  { immediate: true },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <section class="sr-comment">
    <header class="sr-comment__header">
      <h3 class="sr-comment__title">{{ title }}</h3>
      <span v-if="showCount" class="sr-comment__count">{{ totalCount }}</span>

      <div v-if="showSortBar" class="sr-comment__sorts">
        <button
          v-for="option in COMMENT_SORT_OPTIONS"
          :key="option.value"
          type="button"
          class="sr-comment__sort"
          :class="{ 'is-active': currentSort === option.value }"
          @click="changeSort(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </header>

    <div v-if="showEditor && !replyingComment" class="sr-comment__editor">
      <CommentEditor
        ref="editorRef"
        :user="user"
        :allow-guest="allowGuest"
        :require-guest-name="requireGuestName"
        :require-guest-email="requireGuestEmail"
        :require-guest-website="requireGuestWebsite"
        :show-guest-website="showGuestWebsite"
        :max-length="maxLength"
        :submitting="submitting"
        :emojiable="emojiable"
        :emoji-packages="emojiPackages"
        @submit="onSubmit"
      >
        <template #login><slot name="login" /></template>
      </CommentEditor>
    </div>

    <SrLoading v-if="loading" class="sr-comment__loading" text="加载评论中" />

    <ul v-else-if="pagedComments.length" class="sr-comment__list">
      <CommentItem
        v-for="item in pagedComments"
        :key="item.id"
        :comment="item"
        :likeable="likeable"
        :replyable="replyable"
        :deletable="deletable"
        :replying-id="replyingComment?.id ?? null"
        :emoji-map="emojiMap"
        @like="emit('like', $event)"
        @reply="startReply"
        @delete="emit('delete', $event)"
      >
        <template #avatar="s"><slot name="comment-avatar" v-bind="s" /></template>
        <template #meta="s"><slot name="comment-meta" v-bind="s" /></template>
        <template #level="s"><slot name="comment-level" v-bind="s" /></template>
        <template #region="s"><slot name="comment-region" v-bind="s" /></template>
        <template #os="s"><slot name="comment-os" v-bind="s" /></template>
        <template #browser="s"><slot name="comment-browser" v-bind="s" /></template>
        <template #actions="s"><slot name="comment-actions" v-bind="s" /></template>
        <template #footer="s"><slot name="comment-footer" v-bind="s" /></template>

        <template #editor="{ comment }">
          <div v-if="replyingComment?.id === comment.id" class="sr-comment__reply-editor">
            <CommentEditor
              compact
              :reply-to="comment"
              :user="user"
              :allow-guest="allowGuest"
              :require-guest-name="requireGuestName"
              :require-guest-email="requireGuestEmail"
              :require-guest-website="requireGuestWebsite"
              :show-guest-website="showGuestWebsite"
              :max-length="maxLength"
              :submitting="submitting"
              :emojiable="emojiable"
              :emoji-packages="emojiPackages"
              @submit="onSubmit"
              @cancel-reply="cancelReply"
            >
              <template #login><slot name="login" /></template>
            </CommentEditor>
          </div>
        </template>
      </CommentItem>
    </ul>

    <slot v-else name="empty">
      <SrEmpty :description="emptyText" />
    </slot>

    <div v-if="effectivePagination === 'pager' && totalPages > 1" class="sr-comment__pager">
      <SrPagination
        :model-value="currentPage"
        :total="sortedComments.length"
        :page-size="effectivePageSize"
        :show-total="false"
        :show-sizer="false"
        :show-jumper="false"
        size="sm"
        @update:model-value="onPageChange"
      />
    </div>

    <div v-if="effectivePagination === 'more'" ref="loadMoreRef" class="sr-comment__more">
      <SrButton v-if="hasMore" size="sm" :loading="loadingMore" @click="requestLoadMore"> 加载更多 </SrButton>
      <span v-else class="sr-comment__no-more">{{ noMoreText }}</span>
    </div>
  </section>
</template>
