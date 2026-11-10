<script setup lang="ts">
import { computed, ref } from 'vue'

import { parseEmojiText } from '../../emoji-picker/src/parse'
import SrAvatar from '../../avatar/src/avatar.vue'
import SrIcon from '../../icon/src/icon.vue'
import { commentItemProps } from './comment'
import { srFormatDateTime, srFormatRelativeTime } from './format'

import type { SrCommentData, SrCommentItemSlotScope } from './types'

defineOptions({ name: 'SrCommentItem' })

const props = defineProps(commentItemProps)

const emit = defineEmits<{
  /** 点赞 / 取消点赞 */
  like: [comment: SrCommentData]
  /** 请求回复 */
  reply: [comment: SrCommentData]
  /** 请求删除 */
  delete: [comment: SrCommentData]
}>()

defineSlots<{
  /** 替换头像 */
  avatar?: (scope: SrCommentItemSlotScope) => unknown
  /** 等级标识 */
  level?: (scope: SrCommentItemSlotScope) => unknown
  /** 归属地 */
  region?: (scope: SrCommentItemSlotScope) => unknown
  /** 操作系统 */
  os?: (scope: SrCommentItemSlotScope) => unknown
  /** 浏览器 */
  browser?: (scope: SrCommentItemSlotScope) => unknown
  /** 整块头部信息（覆盖上面几个具名槽位） */
  meta?: (scope: SrCommentItemSlotScope) => unknown
  /** 操作区（点赞 / 回复 / 删除） */
  actions?: (scope: SrCommentItemSlotScope) => unknown
  /** 条目底部 */
  footer?: (scope: SrCommentItemSlotScope) => unknown
  /**
   * 回复表单挂载点
   *
   * @remarks 必须带作用域：容器要靠 `comment.id` 判断这条要不要挂表单，
   * 否则每个条目都会渲染一份。
   */
  editor?: (scope: SrCommentItemSlotScope) => unknown
}>()

/** 是否展开全部回复 */
const expanded = ref(false)

/** 插槽作用域：`authorMeta` 与 `commentMeta` 分开传，避免同名键互相覆盖 */
const scope = computed<SrCommentItemSlotScope>(() => ({
  comment: props.comment,
  depth: props.depth,
  authorMeta: props.comment.author.meta ?? {},
  commentMeta: props.comment.meta ?? {},
  level: (props.comment.author.meta ?? {}).level,
  region: (props.comment.meta ?? {}).region,
  os: (props.comment.meta ?? {}).os,
  browser: (props.comment.meta ?? {}).browser,
}))

/**
 * 正文片段
 *
 * @remarks 切分而不是替换成 HTML 字符串：模板逐片段渲染，
 * 用户输入由 Vue 自动转义，**全程不碰 `v-html`**。
 */
const segments = computed(() => parseEmojiText(props.comment.content, props.emojiMap))

/** 相对时间 */
const relativeTime = computed(() => srFormatRelativeTime(props.comment.createdAt))

/** 完整时间，挂到 `title` 上 */
const fullTime = computed(() => srFormatDateTime(props.comment.createdAt))

/** 只有顶层评论才渲染回复，避免无限嵌套 */
const replies = computed<SrCommentData[]>(() => (props.depth === 0 ? (props.comment.replies ?? []) : []))

/** 当前可见的回复 */
const visibleReplies = computed(() =>
  expanded.value ? replies.value : replies.value.slice(0, props.replyCollapseLimit),
)

/** 被折叠的条数 */
const hiddenCount = computed(() => replies.value.length - visibleReplies.value.length)

/** 是否可折叠（回复数超过阈值才算） */
const collapsible = computed(() => replies.value.length > props.replyCollapseLimit)

/** 是否正在被回复 */
const isReplying = computed(() => props.replyingId === props.comment.id)

/** 点赞数展示：0 时显示「赞」而不是「0」 */
const likeText = computed(() => (props.comment.likes ? String(props.comment.likes) : '赞'))

/** 是否显示删除 */
const canDelete = computed(() => props.deletable && !!props.comment.author.isSelf && !props.comment.deleted)

/**
 * 点赞
 */
function onLike(): void {
  emit('like', props.comment)
}

/**
 * 回复
 */
function onReply(): void {
  emit('reply', props.comment)
}

/**
 * 删除
 */
function onDelete(): void {
  emit('delete', props.comment)
}
</script>

<template>
  <li
    class="sr-comment-item"
    :class="{
      'is-reply': depth > 0,
      'is-deleted': comment.deleted,
      'is-replying': isReplying,
    }"
  >
    <slot name="avatar" v-bind="scope">
      <SrAvatar
        class="sr-comment-item__avatar"
        :src="comment.author.avatar"
        :alt="comment.author.name"
        :size="depth > 0 ? 'sm' : 'md'"
      />
    </slot>

    <div class="sr-comment-item__body">
      <header class="sr-comment-item__header">
        <slot name="meta" v-bind="scope">
          <a
            v-if="comment.author.website"
            class="sr-comment-item__name"
            :href="comment.author.website"
            target="_blank"
            rel="nofollow noopener ugc"
          >
            {{ comment.author.name }}
          </a>
          <span v-else class="sr-comment-item__name">{{ comment.author.name }}</span>

          <span v-if="comment.author.isAdmin" class="sr-comment-item__badge">作者</span>

          <time class="sr-comment-item__time" :title="fullTime">{{ relativeTime }}</time>

          <slot name="level" v-bind="scope">
            <span v-if="scope.level" class="sr-comment-item__tag sr-comment-item__tag--level">
              Lv.{{ scope.level }}
            </span>
          </slot>
          <slot name="region" v-bind="scope">
            <span v-if="scope.region" class="sr-comment-item__tag">{{ scope.region }}</span>
          </slot>
          <slot name="os" v-bind="scope">
            <span v-if="scope.os" class="sr-comment-item__tag">{{ scope.os }}</span>
          </slot>
          <slot name="browser" v-bind="scope">
            <span v-if="scope.browser" class="sr-comment-item__tag">{{ scope.browser }}</span>
          </slot>
        </slot>
      </header>

      <!-- 软删除：保留占位，否则下面的回复会失去上下文 -->
      <p v-if="comment.deleted" class="sr-comment-item__deleted">该评论已被删除</p>

      <p v-else class="sr-comment-item__content">
        <span v-if="comment.replyTo" class="sr-comment-item__reply-to">
          回复 @{{ comment.replyTo.name }}：
        </span>
        <template v-for="(segment, index) in segments" :key="index">
          <img
            v-if="segment.type === 'emoji' && segment.emoji?.url"
            class="sr-comment-item__emoji"
            :src="segment.emoji.url"
            :alt="segment.value"
            :title="segment.value"
            loading="lazy"
          />
          <span v-else-if="segment.type === 'emoji'" :title="segment.value">
            {{ segment.emoji?.char }}
          </span>
          <template v-else>{{ segment.value }}</template>
        </template>
      </p>

      <div v-if="!comment.deleted" class="sr-comment-item__actions">
        <slot name="actions" v-bind="scope">
          <button
            v-if="likeable"
            type="button"
            class="sr-comment-item__action"
            :class="{ 'is-liked': comment.liked }"
            @click="onLike"
          >
            <SrIcon name="lucide:heart" :size="14" />
            <span>{{ likeText }}</span>
          </button>

          <button v-if="replyable" type="button" class="sr-comment-item__action" @click="onReply">
            <SrIcon name="lucide:message-circle" :size="14" />
            <span>回复</span>
          </button>

          <button v-if="canDelete" type="button" class="sr-comment-item__action is-danger" @click="onDelete">
            <SrIcon name="lucide:trash-2" :size="14" />
            <span>删除</span>
          </button>
        </slot>
      </div>

      <slot name="editor" v-bind="scope" />

      <div v-if="replies.length" class="sr-comment-item__replies">
        <CommentItem
          v-for="reply in visibleReplies"
          :key="reply.id"
          :comment="reply"
          :depth="depth + 1"
          :likeable="likeable"
          :replyable="replyable"
          :deletable="deletable"
          :replying-id="replyingId"
          :emoji-map="emojiMap"
          @like="emit('like', $event)"
          @reply="emit('reply', $event)"
          @delete="emit('delete', $event)"
        >
          <!-- 插槽逐层透传：不传的话「宿主定制了样式，但回复里没生效」 -->
          <template #avatar="s"><slot name="avatar" v-bind="s" /></template>
          <template #level="s"><slot name="level" v-bind="s" /></template>
          <template #region="s"><slot name="region" v-bind="s" /></template>
          <template #os="s"><slot name="os" v-bind="s" /></template>
          <template #browser="s"><slot name="browser" v-bind="s" /></template>
          <template #meta="s"><slot name="meta" v-bind="s" /></template>
          <template #actions="s"><slot name="actions" v-bind="s" /></template>
          <template #footer="s"><slot name="footer" v-bind="s" /></template>
        </CommentItem>

        <button v-if="collapsible" type="button" class="sr-comment-item__more" @click="expanded = !expanded">
          {{ expanded ? '收起回复' : `展开另外 ${hiddenCount} 条回复` }}
        </button>
      </div>

      <slot name="footer" v-bind="scope" />
    </div>
  </li>
</template>
