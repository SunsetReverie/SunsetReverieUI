<script setup lang="ts">
import { computed, ref } from 'vue'
import { DEFAULT_EMOJI_PACKAGES, SrButton, SrComment, SrSegmented, SrSwitch, SrTag } from '@sunset-reverie/ui'
import type { SrCommentData, SrCommentSubmitPayload } from '@sunset-reverie/ui'

defineOptions({ name: 'CommentDemo' })

/** 时间基准：用固定值让「几分钟前」稳定可读 */
const now = Date.now()
/** 一分钟 */
const minute = 60 * 1000

/** 当前登录用户 */
const me = {
  id: 'me',
  name: '林深',
  avatar: '',
  isAdmin: true,
  meta: { level: 8 },
}

/** 演示数据 */
const comments = ref<SrCommentData[]>([
  {
    id: 1,
    author: { id: 'u1', name: '苏晚', isAdmin: true, meta: { level: 6 } },
    content: '这套主题的层次感做得很舒服，尤其喜欢卡片上那层高光。[微笑]',
    createdAt: now - 3 * minute,
    likes: 12,
    liked: false,
    meta: { region: '浙江', os: 'macOS', browser: 'Chrome' },
    replies: [
      {
        id: 11,
        author: { id: 'u2', name: '陈屿' },
        content: '同感，暗色模式下也不闷。',
        createdAt: now - 2 * minute,
        likes: 3,
        replyTo: { id: 'u1', name: '苏晚' },
        meta: { region: '广东', os: 'Windows', browser: 'Edge' },
      },
      {
        id: 12,
        author: { id: 'me', name: '林深', isSelf: true },
        content: '高光是玻璃图层带的，换 `gloss` 变量就能调强弱。',
        createdAt: now - minute,
        likes: 1,
        replyTo: { id: 'u2', name: '陈屿' },
      },
      {
        id: 13,
        author: { id: 'u3', name: '阿泠' },
        content: '请问圆角也能单独调吗？',
        createdAt: now - 30 * 1000,
        meta: { region: '北京' },
      },
    ],
  },
  {
    id: 2,
    author: { id: 'u4', name: '周野' },
    content: '评论组件支持表情标记，正文里写 [开心] 就能渲染出来。',
    createdAt: now - 40 * minute,
    likes: 5,
    meta: { region: '四川', os: 'iOS', browser: 'Safari' },
  },
  {
    id: 3,
    author: { id: 'u5', name: '默默' },
    content: '这条已经被删除了，但占位还留着，下面的回复不会失去上下文。',
    createdAt: now - 3 * 60 * minute,
    deleted: true,
  },
  {
    id: 4,
    author: { id: 'me', name: '林深', isSelf: true, isAdmin: true },
    content: '登录用户能看到「删除」，游客没有这个按钮——身份由数据决定，组件不猜。',
    createdAt: now - 26 * 60 * minute,
    likes: 0,
    meta: { region: '上海' },
  },
])

/** 是否登录 */
const loggedIn = ref(true)

/** 当前用户 */
const user = computed(() => (loggedIn.value ? me : null))

/** 分页模式 */
const paginationMode = ref<'pager' | 'more'>('pager')

/** 分页选项 */
const paginationOptions = [
  { label: '页码', value: 'pager' },
  { label: '加载更多', value: 'more' },
]

/** 功能开关 */
const likeable = ref(true)
const replyable = ref(true)
const deletable = ref(true)
const emojiable = ref(true)
const showEditor = ref(true)

/** 加载态 / 空态 */
const loading = ref(false)
const empty = ref(false)

/** 提交中 */
const submitting = ref(false)

/** 最近一次提交 */
const lastPayload = ref<SrCommentSubmitPayload | null>(null)

/** 评论组件实例 */
const commentRef = ref<InstanceType<typeof SrComment> | null>(null)

/** 表情包 */
const emojiPackages = DEFAULT_EMOJI_PACKAGES

/** 展示用的列表：空态开关打开时传空数组 */
const visibleComments = computed(() => (empty.value ? [] : comments.value))

/**
 * 点赞：只改本地数据，真实项目等接口返回
 * @param comment 目标评论
 */
function onLike(comment: SrCommentData): void {
  const liked = !comment.liked
  comment.liked = liked
  comment.likes = Math.max(0, (comment.likes ?? 0) + (liked ? 1 : -1))
}

/**
 * 删除：软删除，保留占位
 * @param comment 目标评论
 */
function onDelete(comment: SrCommentData): void {
  comment.deleted = true
}

/**
 * 提交
 * @param payload 提交载荷
 */
function onSubmit(payload: SrCommentSubmitPayload): void {
  lastPayload.value = payload
  submitting.value = true

  window.setTimeout(() => {
    const comment: SrCommentData = {
      id: Date.now(),
      author: payload.guest
        ? { id: payload.guest.name, name: payload.guest.name, website: payload.guest.website }
        : { id: 'me', name: me.name, isSelf: true, isAdmin: true },
      content: payload.content,
      createdAt: Date.now(),
      likes: 0,
      meta: { region: '本机' },
    }

    // 回复挂到目标下面，顶层评论插到最前
    if (payload.replyTo) {
      const target = comments.value.find(
        (item) => item.id === payload.replyTo?.id || item.replies?.some((r) => r.id === payload.replyTo?.id),
      )
      const parent = target ?? comments.value[0]
      if (parent) {
        parent.replies = [...(parent.replies ?? []), { ...comment, replyTo: payload.replyTo.author }]
      }
    } else {
      comments.value = [comment, ...comments.value]
    }

    submitting.value = false
    // 成功后手动清空：组件不会自动清，失败的提交不该丢掉用户写的内容
    commentRef.value?.clearEditor()
  }, 400)
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础用法</h3>
      <SrComment
        ref="commentRef"
        :comments="visibleComments"
        :user="user"
        :emoji-packages="emojiPackages"
        :likeable="likeable"
        :replyable="replyable"
        :deletable="deletable"
        :emojiable="emojiable"
        :show-editor="showEditor"
        :submitting="submitting"
        :loading="loading"
        @like="onLike"
        @delete="onDelete"
        @submit="onSubmit"
      />
      <p class="hint">
        点赞、删除、提交都只派发事件，数据由宿主改。表情是标记文本（<code>[微笑]</code>），
        正文渲染走片段拼接，全程不用 <code>v-html</code>。
      </p>
      <p v-if="lastPayload" class="hint">
        最近一次提交：{{ lastPayload.content }}（{{ lastPayload.guest ? '游客' : '登录用户' }}）
      </p>
    </section>

    <section>
      <h3>登录态与功能开关</h3>
      <div class="row">
        <span class="row-label">登录</span>
        <SrSwitch v-model="loggedIn" size="sm" />
        <SrTag size="sm">{{ loggedIn ? '林深' : '游客' }}</SrTag>
      </div>
      <div class="row">
        <span class="row-label">点赞</span>
        <SrSwitch v-model="likeable" size="sm" />
        <span class="row-label">回复</span>
        <SrSwitch v-model="replyable" size="sm" />
        <span class="row-label">删除</span>
        <SrSwitch v-model="deletable" size="sm" />
        <span class="row-label">表情</span>
        <SrSwitch v-model="emojiable" size="sm" />
      </div>
      <div class="row">
        <span class="row-label">评论框</span>
        <SrSwitch v-model="showEditor" size="sm" />
        <span class="row-label">加载中</span>
        <SrSwitch v-model="loading" size="sm" />
        <span class="row-label">空态</span>
        <SrSwitch v-model="empty" size="sm" />
      </div>
      <p class="hint">
        关掉登录后表单会多出昵称/邮箱/网址三项，昵称必填；游客态下没有「删除」按钮——
        <code>author.isSelf</code> 由服务端判定，组件不猜。
      </p>
    </section>

    <section>
      <h3>分页与排序</h3>
      <div class="row">
        <SrSegmented v-model="paginationMode" :options="paginationOptions" size="sm" />
        <SrTag size="sm">每页 3 条</SrTag>
      </div>
      <SrComment
        :comments="comments"
        :user="user"
        :pagination="paginationMode"
        :page-size="3"
        :emoji-packages="emojiPackages"
        @like="onLike"
        @delete="onDelete"
        @submit="onSubmit"
      />
      <p class="hint">
        页码模式在前端切片；加载更多模式只抛 <code>load-more</code>，数据由宿主追加， 组件不会自己再切一次。
      </p>
    </section>

    <section>
      <h3>插槽：等级 / 归属地 / 系统 / 浏览器</h3>
      <SrComment
        :comments="comments.slice(0, 2)"
        :user="user"
        :show-editor="false"
        :emoji-packages="emojiPackages"
        @like="onLike"
      >
        <template #comment-level="{ level }">
          <span v-if="level" class="level">Lv.{{ level }}</span>
        </template>
        <template #comment-region="{ region }">
          <span v-if="region" class="meta-tag">{{ region }}</span>
        </template>
        <template #comment-os="{ os }">
          <span v-if="os" class="meta-tag">{{ os }}</span>
        </template>
        <template #comment-footer="{ comment }">
          <p v-if="comment.id === 1" class="foot">这条回复来自「苏晚」的插槽定制</p>
        </template>
      </SrComment>
      <p class="hint">
        具名槽位和通用 <code>meta</code> 槽位并存：常用字段有便捷通道（<code>level</code> /
        <code>region</code>），新字段不至于只能改组件库。
      </p>
    </section>

    <section>
      <h3>独立使用表单</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="loggedIn = !loggedIn">
          切换{{ loggedIn ? '游客' : '登录' }}态
        </SrButton>
      </div>
      <p class="hint">
        表单内部复用 <code>SrTextarea</code>：传了表情包就是富文本模式，编辑时表情内联显示，
        <code>v-model</code> 收到的仍是标记文本。快捷键 <code>Ctrl / ⌘ + Enter</code> 提交。
      </p>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.demo section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hint {
  color: var(--sr-color-text-tertiary);
  font-size: 12.5px;
  line-height: 1.7;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.row-label {
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.level {
  padding: 0 5px;
  border-radius: 4px;
  background: var(--sr-color-primary-alpha-12);
  color: var(--sr-color-primary);
  font-size: 11px;
}

.meta-tag {
  padding: 0 5px;
  border-radius: 4px;
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.foot {
  margin: 6px 0 0;
  color: var(--sr-color-text-quaternary);
  font-size: 12px;
}
</style>
