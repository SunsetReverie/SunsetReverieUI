<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { srComputeFloating, srGetRect } from '../../../utils/floating'
import SrAvatar from '../../avatar/src/avatar.vue'
import SrButton from '../../button/src/button.vue'
import type { SrEmojiItem } from '../../emoji-picker/src/emoji-picker'
import SrEmojiPicker from '../../emoji-picker/src/emoji-picker.vue'
import { buildEmojiMap } from '../../emoji-picker/src/parse'
import SrIcon from '../../icon/src/icon.vue'
import SrInput from '../../input/src/input.vue'
import SrTextarea from '../../textarea/src/textarea.vue'
import { srCountTextareaText } from '../../textarea/src/textarea'
import { commentEditorProps } from './comment'

import type { SrCommentGuestInfo, SrCommentSubmitPayload } from './types'

defineOptions({ name: 'SrCommentEditor' })

const props = defineProps(commentEditorProps)

const emit = defineEmits<{
  /** 通过校验后提交 */
  submit: [payload: SrCommentSubmitPayload]
  /** 取消回复 */
  'cancel-reply': []
}>()

/** 正文（标记文本） */
const content = ref('')

/** 游客昵称 */
const guestName = ref('')

/** 游客邮箱 */
const guestEmail = ref('')

/** 游客网址 */
const guestWebsite = ref('')

/** 校验错误文案 */
const error = ref('')

/** 表情浮层是否打开 */
const emojiOpen = ref(false)

/** 浮层坐标 */
const emojiPos = ref({ top: 0, left: 0 })

/** 文本域实例 */
const textareaRef = ref<InstanceType<typeof SrTextarea> | null>(null)

/** 表情按钮 */
const emojiButtonRef = ref<HTMLElement | null>(null)

/** 表情浮层 */
const emojiPanelRef = ref<HTMLElement | null>(null)

/** 表情查找表：用于统计可见字数 */
const emojiMap = computed(() => (props.emojiPackages.length ? buildEmojiMap(props.emojiPackages) : undefined))

/** 是否游客态 */
const isGuest = computed(() => !props.user)

/** 是否展示游客信息字段 */
const showGuestFields = computed(() => isGuest.value && props.allowGuest)

/** 头像回退文字 */
const displayName = computed(() => props.user?.name || guestName.value || '游')

/** 占位文案 */
const placeholder = computed(() => {
  if (props.replyTo) return `回复 @${props.replyTo.author.name}`
  return props.compact ? '说点什么…' : '友善发言，理性讨论…'
})

/** 提交按钮文案 */
const submitText = computed(() => (props.replyTo ? '回复' : '发表'))

/** 可见字数 */
const count = computed(() => srCountTextareaText(content.value, emojiMap.value))

/** 按钮是否可点：只看正文有无内容，字段留到提交时给具体提示 */
const canSubmit = computed(() => !!content.value.trim() && !props.submitting)

/** 昵称占位 */
const namePlaceholder = computed(() => (props.requireGuestName ? '昵称（必填）' : '昵称（选填）'))

/** 邮箱占位 */
const emailPlaceholder = computed(() =>
  props.requireGuestEmail ? '邮箱（必填，不会公开）' : '邮箱（选填，不会公开）',
)

/** 网址占位 */
const websitePlaceholder = computed(() => (props.requireGuestWebsite ? '网址（必填）' : '网址（选填）'))

/**
 * 定位表情浮层
 *
 * @remarks 空间不足时 `srComputeFloating` 会自己上翻，
 * 这里只负责把算好的坐标写回去。
 */
function updateEmojiPosition(): void {
  const trigger = emojiButtonRef.value
  const panel = emojiPanelRef.value
  if (!trigger || !panel) return

  const result = srComputeFloating({
    reference: srGetRect(trigger),
    floating: { width: panel.offsetWidth || 280, height: panel.offsetHeight || 260 },
    placement: 'bottom-start',
    offset: 6,
    viewport: { width: window.innerWidth, height: window.innerHeight },
  })

  emojiPos.value = { top: result.top, left: result.left }
}

/**
 * 开关表情浮层
 */
async function toggleEmoji(): Promise<void> {
  emojiOpen.value = !emojiOpen.value
  if (!emojiOpen.value) return

  await nextTick()
  updateEmojiPosition()
}

/**
 * 选中表情：插到光标处
 * @param item 表情项
 */
function onEmojiSelect(item: SrEmojiItem): void {
  textareaRef.value?.insertEmoji(item)
  error.value = ''
}

/**
 * 点击外部关闭浮层
 * @param event 指针事件
 *
 * @remarks 必须排除浮层本身，否则点选表情会被判定为「点了外部」而立即关闭。
 */
function onDocumentPointerDown(event: PointerEvent): void {
  if (!emojiOpen.value) return

  const target = event.target as Node | null
  if (!target) return

  if (emojiPanelRef.value?.contains(target) || emojiButtonRef.value?.contains(target)) return

  emojiOpen.value = false
}

/**
 * 编辑器快捷键
 * @param event 键盘事件
 *
 * @remarks `Ctrl/Cmd + Enter` 提交。单独 Enter 留给换行——
 * 评论经常要分段落写，抢走 Enter 会让长回复很难受。
 */
function onEditorKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Enter') return
  if (!event.ctrlKey && !event.metaKey) return
  if (event.isComposing) return

  event.preventDefault()
  submit()
}

/**
 * 提交
 *
 * @remarks 按钮的可点状态只看正文，具体校验放到这里做，
 * 这样「点击后禁用」和「点了告诉你缺什么」不会互相打架。
 */
function submit(): void {
  if (props.submitting) return

  const text = content.value.trim()
  if (!text) {
    error.value = '说点什么再发吧'
    return
  }

  if (count.value > props.maxLength) {
    error.value = `最多 ${props.maxLength} 个字`
    return
  }

  if (showGuestFields.value) {
    if (props.requireGuestName && !guestName.value.trim()) {
      error.value = '请填写昵称'
      return
    }
    if (props.requireGuestEmail && !guestEmail.value.trim()) {
      error.value = '请填写邮箱'
      return
    }
    if (props.requireGuestWebsite && !guestWebsite.value.trim()) {
      error.value = '请填写网址'
      return
    }
    if (guestWebsite.value && !/^https?:\/\//i.test(guestWebsite.value.trim())) {
      error.value = '网址需以 http:// 或 https:// 开头'
      return
    }
  }

  error.value = ''

  const guest: SrCommentGuestInfo | null = showGuestFields.value
    ? {
        name: guestName.value.trim(),
        email: guestEmail.value.trim(),
        website: guestWebsite.value.trim(),
      }
    : null

  emit('submit', { content: text, replyTo: props.replyTo, guest })
}

/**
 * 重置正文
 *
 * @remarks 保留游客填过的昵称/邮箱/网址：同一个人连着发两条很常见，
 * 每次重填一遍身份信息会非常烦人。
 */
function reset(): void {
  content.value = ''
  error.value = ''
  emojiOpen.value = false
}

defineExpose({ reset, focus: () => textareaRef.value?.focus() })

// 切换回复目标时清空正文：旧内容属于上一条回复，留着会被误发
watch(
  () => props.replyTo?.id,
  () => {
    content.value = ''
    error.value = ''
  },
)

// 浮层开着时跟随视口变化，避免滚一下就飘走
watch(emojiOpen, (open) => {
  if (open) {
    window.addEventListener('resize', updateEmojiPosition)
    window.addEventListener('scroll', updateEmojiPosition, true)
    return
  }

  window.removeEventListener('resize', updateEmojiPosition)
  window.removeEventListener('scroll', updateEmojiPosition, true)
})

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  window.removeEventListener('resize', updateEmojiPosition)
  window.removeEventListener('scroll', updateEmojiPosition, true)
})
</script>

<template>
  <div class="sr-comment-editor" :class="{ 'is-compact': compact }" @keydown="onEditorKeydown">
    <!-- 未登录且不允许游客：直接给登录引导，而不是让人写完再提示 -->
    <div v-if="!user && !allowGuest" class="sr-comment-editor__login">
      <slot name="login">
        <p class="sr-comment-editor__login-text">登录后即可参与讨论</p>
        <SrButton size="sm" variant="primary">去登录</SrButton>
      </slot>
    </div>

    <template v-else>
      <div v-if="replyTo" class="sr-comment-editor__reply">
        <span>回复 @{{ replyTo.author.name }}</span>
        <button type="button" class="sr-comment-editor__reply-cancel" @click="emit('cancel-reply')">
          取消
        </button>
      </div>

      <!-- 游客身份行：头像与三项身份信息同排，正文单独一行占满宽度 -->
      <div v-if="showGuestFields" class="sr-comment-editor__guest">
        <SrAvatar
          class="sr-comment-editor__avatar"
          :src="user?.avatar"
          :alt="displayName"
          :size="compact ? 'sm' : 'md'"
        />
        <SrInput
          v-model="guestName"
          :placeholder="namePlaceholder"
          :maxlength="24"
          :size="compact ? 'sm' : 'md'"
        />
        <SrInput
          v-model="guestEmail"
          type="email"
          :placeholder="emailPlaceholder"
          :size="compact ? 'sm' : 'md'"
        />
        <SrInput
          v-if="showGuestWebsite"
          v-model="guestWebsite"
          type="url"
          :placeholder="websitePlaceholder"
          :size="compact ? 'sm' : 'md'"
        />
      </div>

      <div class="sr-comment-editor__main">
        <SrAvatar
          v-if="!showGuestFields"
          class="sr-comment-editor__avatar"
          :src="user?.avatar"
          :alt="displayName"
          :size="compact ? 'sm' : 'md'"
        />

        <div class="sr-comment-editor__field">
          <SrTextarea
            ref="textareaRef"
            v-model="content"
            :placeholder="placeholder"
            :rows="compact ? 2 : 3"
            :max-rows="compact ? 6 : 10"
            :maxlength="maxLength"
            :show-count="!compact"
            :disabled="submitting"
            :emoji-packages="emojiPackages"
            :size="compact ? 'sm' : 'md'"
          />

          <div class="sr-comment-editor__toolbar">
            <button
              v-if="emojiable"
              ref="emojiButtonRef"
              type="button"
              class="sr-comment-editor__tool"
              :class="{ 'is-active': emojiOpen }"
              aria-label="插入表情"
              @click="toggleEmoji"
            >
              <SrIcon name="lucide:smile" :size="16" />
            </button>

            <span class="sr-comment-editor__tip">Ctrl / ⌘ + Enter 发送</span>

            <SrButton
              size="sm"
              variant="primary"
              :loading="submitting"
              :disabled="!canSubmit"
              @click="submit"
            >
              {{ submitText }}
            </SrButton>
          </div>

          <p v-if="error" class="sr-comment-editor__error">{{ error }}</p>
        </div>
      </div>
    </template>

    <Teleport to="body">
      <div
        v-if="emojiOpen"
        ref="emojiPanelRef"
        class="sr-comment-editor__emoji"
        :style="{ top: `${emojiPos.top}px`, left: `${emojiPos.left}px` }"
      >
        <SrEmojiPicker
          :packages="emojiPackages"
          :size="compact ? 'sm' : 'md'"
          :columns="8"
          close-on-select
          @select="onEmojiSelect"
          @close="emojiOpen = false"
        />
      </div>
    </Teleport>
  </div>
</template>
