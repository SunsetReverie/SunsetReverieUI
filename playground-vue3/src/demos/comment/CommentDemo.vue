<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  DEFAULT_EMOJI_PACKAGES,
  SrButton,
  SrComment,
  SrDropdown,
  SrIcon,
  SrInputNumber,
  SrSegmented,
  SrSwitch,
  SrTag,
} from '@sunset-reverie/ui'
import type {
  SrCommentData,
  SrCommentGuestInfo,
  SrCommentSubmitPayload,
  SrTextareaBackgroundPosition,
} from '@sunset-reverie/ui'

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

/** 表情包 */
const emojiPackages = DEFAULT_EMOJI_PACKAGES

/**
 * 快捷回复
 *
 * @remarks `key` 直接存文案，选中后插进正文即可，
 * 不用再维护一层 key → 文案的映射。
 */
const quickReplies = [
  { key: '说得太对了，学到不少', label: '说得太对了，学到不少' },
  { key: '感谢分享，已经收藏了', label: '感谢分享，已经收藏了' },
  { key: '这个方案的取舍讲得很清楚', label: '这个方案的取舍讲得很清楚' },
  { key: '能再展开讲讲吗？', label: '能再展开讲讲吗？' },
]

/** 背景演示模式 */
const bgMode = ref<'none' | 'text' | 'image'>('text')

/** 背景模式选项 */
const bgOptions = [
  { label: '无背景', value: 'none' },
  { label: '水印文字', value: 'text' },
  { label: '背景图', value: 'image' },
]

/** 水印字号 */
const bgTextSize = ref(44)

/** 水印落点 */
const bgPosition = ref<SrTextareaBackgroundPosition>('bottom')

/** 水印透明度 */
const bgTextOpacity = ref(0.06)

/** 九宫格选项：挑最常用的五个 */
const bgPositionOptions = [
  { label: '居中', value: 'center' },
  { label: '左上', value: 'top-left' },
  { label: '右上', value: 'top-right' },
  { label: '左下', value: 'bottom-left' },
  { label: '右下', value: 'bottom-right' },
]

/** 点阵背景图：内联 SVG，不依赖外网 */
const dotPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='3' cy='3' r='1.4' fill='%237c3aed' fill-opacity='0.18'/%3E%3C/svg%3E\")"

/** 背景图 */
const bgImage = computed(() => (bgMode.value === 'image' ? dotPattern : ''))

/** 水印文字 */
const bgText = computed(() => (bgMode.value === 'text' ? '聊两句' : ''))

/**
 * 造一批评论，用于分页与加载更多的演示
 * @param count 条数
 * @returns 评论列表
 */
function makeBatch(count: number): SrCommentData[] {
  const authors = ['苏晚', '陈屿', '阿泠', '周野', '默默', '沈青', '顾言', '白露']
  const texts = [
    '数据够多才看得出分页的效果，每页 5 条。[微笑]',
    '暗色模式下也不闷，层次很清楚。',
    '加载更多一次追加 5 条，配合自动加载也能用。',
    '回复只支持一层，回复的回复并入同一层。',
    '软删除的评论会留占位，下面的回复不会失去上下文。',
    '点赞只派发事件，数据由宿主改。',
  ]

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    author: { id: `u${index % authors.length}`, name: authors[index % authors.length] },
    content: texts[index % texts.length],
    createdAt: now - (index + 1) * 7 * minute,
    likes: (index * 3) % 11,
    meta: { region: ['浙江', '广东', '北京', '四川'][index % 4] },
  }))
}

/** 基础演示数据 */
const comments = ref<SrCommentData[]>([
  {
    id: 1,
    author: { id: 'u1', name: '苏晚', isAdmin: true, meta: { level: 6 } },
    content: '这套主题的层次感做得很舒服，尤其喜欢卡片上那层高光。[微笑]',
    createdAt: now - 3 * minute,
    likes: 12,
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

/** 游客演示数据：作者带 website，昵称会渲染成链接 */
const guestComments = ref<SrCommentData[]>([
  {
    id: 201,
    author: { id: 'g1', name: '路过的猫', website: 'https://example.com/cat' },
    content: '游客也能留言，昵称填了网址就会变链接。[微笑]',
    createdAt: now - 5 * minute,
    likes: 2,
    meta: { region: '江苏' },
  },
  {
    id: 202,
    author: { id: 'g2', name: '夜航船' },
    content: '身份信息只在本地记住，换个浏览器就是新人。',
    createdAt: now - 18 * minute,
    likes: 0,
  },
])

/** 分页演示数据 */
const pageList = makeBatch(23)

/** 加载更多演示数据 */
const moreList = makeBatch(23)

/** 加载更多已展示条数 */
const moreLoaded = ref(5)

/** 加载更多进行中 */
const loadingMore = ref(false)

/** 滚到底自动加载 */
const autoLoadMore = ref(false)

/** 当前页码 */
const pageNo = ref(1)

/** 是否以游客身份浏览 */
const guestMode = ref(false)

/** 基础演示的登录开关 */
const loggedIn = ref(true)

/** 当前用户 */
const user = computed(() => (loggedIn.value ? me : null))

/** 游客态提交后记住的身份 */
const guestInfo = ref<SrCommentGuestInfo | null>(null)

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

/** 基础评论组件实例 */
const commentRef = ref<InstanceType<typeof SrComment> | null>(null)

/** 游客评论组件实例 */
const guestRef = ref<InstanceType<typeof SrComment> | null>(null)

/** 展示用的列表：空态开关打开时传空数组 */
const visibleComments = computed(() => (empty.value ? [] : comments.value))

/** 加载更多分页模式下的可见列表 */
const moreVisible = computed(() => moreList.slice(0, moreLoaded.value))

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
 * 切换页码
 * @param page 新页码
 */
function onPageChange(page: number): void {
  pageNo.value = page
}

/**
 * 加载更多
 *
 * @remarks 模拟一次 600ms 的请求，`loading-more` 期间按钮转圈、
 * 自动加载也会被组件拦下不会重复触发。
 */
function onLoadMore(): void {
  if (loadingMore.value || moreLoaded.value >= moreList.length) return

  loadingMore.value = true
  window.setTimeout(() => {
    moreLoaded.value = Math.min(moreList.length, moreLoaded.value + 5)
    loadingMore.value = false
  }, 600)
}

/**
 * 基础演示提交
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

    if (payload.replyTo) {
      const parent =
        comments.value.find(
          (item) =>
            item.id === payload.replyTo?.id || item.replies?.some((r) => r.id === payload.replyTo?.id),
        ) ?? comments.value[0]

      if (parent) {
        parent.replies = [...(parent.replies ?? []), { ...comment, replyTo: payload.replyTo.author }]
      }
    } else {
      comments.value = [comment, ...comments.value]
    }

    submitting.value = false
    commentRef.value?.clearEditor()
  }, 400)
}

/**
 * 游客演示提交
 * @param payload 提交载荷
 *
 * @remarks 重点看两件事：表单被清空但**昵称/邮箱/网址被保留**，
 * 以及新评论的作者昵称同样能带链接。
 */
function onGuestSubmit(payload: SrCommentSubmitPayload): void {
  submitting.value = true

  window.setTimeout(() => {
    guestInfo.value = payload.guest

    guestComments.value = [
      {
        id: Date.now(),
        author: {
          id: `g-${Date.now()}`,
          name: payload.guest?.name || '匿名',
          website: payload.guest?.website || undefined,
        },
        content: payload.content,
        createdAt: Date.now(),
        likes: 0,
        meta: { region: '本机' },
      },
      ...guestComments.value,
    ]

    submitting.value = false
    guestRef.value?.clearEditor()
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
      <h3>游客评论</h3>
      <div class="row">
        <SrSwitch v-model="guestMode" size="sm" />
        <span class="row-label">以游客身份浏览</span>
        <SrTag size="sm">{{ guestMode ? '游客' : '林深（登录）' }}</SrTag>
      </div>
      <SrComment
        ref="guestRef"
        :comments="guestComments"
        :user="guestMode ? null : me"
        :emoji-packages="emojiPackages"
        :submitting="submitting"
        @like="onLike"
        @delete="onDelete"
        @submit="onGuestSubmit"
      />
      <p class="hint">
        切到游客态后，表单多出昵称 / 邮箱 / 网址三项，昵称必填、邮箱注明「不会公开」。
        提交一条试试：正文清空，但<strong>身份信息会留着</strong>，连着发第二条不用重填。
      </p>
      <p class="hint">
        数据里带 <code>website</code> 的作者，昵称会渲染成链接（带
        <code>rel="nofollow noopener ugc"</code>）；游客态没有「删除」按钮—— 是否本人由服务端给的
        <code>isSelf</code> 决定。
      </p>
      <p v-if="guestInfo" class="hint">
        已记住游客身份：{{ guestInfo.name || '（未填）' }}
        <template v-if="guestInfo.website">，网址 {{ guestInfo.website }}</template>
      </p>
    </section>

    <section>
      <h3>输入框背景（水印 / 背景图）</h3>
      <div class="row">
        <SrSegmented v-model="bgMode" :options="bgOptions" size="sm" />
        <SrInputNumber v-model="bgTextSize" :min="12" :max="120" :step="4" size="sm" style="width: 130px" />
        <span class="row-label">水印字号</span>
      </div>
      <div class="row">
        <SrSegmented v-model="bgPosition" :options="bgPositionOptions" size="sm" />
        <SrInputNumber
          v-model="bgTextOpacity"
          :min="0.02"
          :max="0.3"
          :step="0.02"
          :precision="2"
          size="sm"
          style="width: 130px"
        />
        <span class="row-label">透明度</span>
      </div>
      <SrComment
        :comments="comments.slice(0, 1)"
        :user="user"
        :emoji-packages="emojiPackages"
        :background-image="bgImage"
        :background-text="bgText"
        :background-text-size="bgTextSize"
        :background-text-opacity="bgTextOpacity"
        :background-position="bgPosition"
        @like="onLike"
        @submit="onSubmit"
      />
      <p class="hint">
        背景透传给内部 <code>SrTextarea</code>：<code>backgroundImage</code> 接受 url() / 渐变 / 裸地址，
        <code>backgroundText</code> 是水印，<code>backgroundPosition</code> 走九宫格，<code
          >backgroundTextOpacity</code
        >
        调浓淡。 背景层不参与选中，全选复制不会把水印带走。
      </p>
    </section>

    <section>
      <h3>分页</h3>
      <SrComment
        :comments="pageList"
        :user="user"
        pagination="pager"
        :page-size="5"
        title="全部评论"
        :show-editor="false"
        :emoji-packages="emojiPackages"
        @like="onLike"
        @page-change="onPageChange"
      />
      <p class="hint">
        共 {{ pageList.length }} 条，每页 5 条，当前第 {{ pageNo }} 页。
        页码模式在前端切片，切排序会回到第一页。
      </p>
    </section>

    <section>
      <h3>加载更多</h3>
      <div class="row">
        <SrSwitch v-model="autoLoadMore" size="sm" />
        <span class="row-label">滚到底自动加载</span>
        <SrTag size="sm">{{ moreLoaded }} / {{ moreList.length }}</SrTag>
      </div>
      <SrComment
        :comments="moreVisible"
        :user="user"
        pagination="more"
        title="最新动态"
        :has-more="moreLoaded < moreList.length"
        :loading-more="loadingMore"
        :auto-load-more="autoLoadMore"
        :show-editor="false"
        :emoji-packages="emojiPackages"
        @like="onLike"
        @load-more="onLoadMore"
      />
      <p class="hint">
        初始 5 条，点「加载更多」或开启自动加载（距底部 120px 触发）后追加 5 条。
        <code>loading-more</code> 期间组件会拦下重复触发，请求不会连发。
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
        关掉「评论框」就变成只读列表；关掉「登录」时若再把
        <code>allow-guest</code> 设为 false，表单位置会直接换成登录引导。
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
        <code>Lv.6</code> / <code>浙江</code> / <code>macOS</code> / <code>Chrome</code> 这些标签
        <strong>默认就会渲染</strong>：作者的 <code>meta.level</code>、评论的
        <code>meta.region / os / browser</code> 有值就显示，等级自带主色底以区别于其它标签。
        上面的槽位只是把它们换成自定义样式；具名槽位与通用 <code>meta</code> 槽位并存，
        新字段不至于只能改组件库。
      </p>
    </section>

    <section>
      <h3>工具栏插槽：快捷回复</h3>
      <SrComment
        :comments="comments.slice(0, 1)"
        :user="user"
        :emoji-packages="emojiPackages"
        :show-count="false"
        @like="onLike"
        @submit="onSubmit"
      >
        <template #editor-toolbar="{ insert }">
          <SrDropdown
            :items="quickReplies"
            size="sm"
            placement="top-start"
            @select="(key) => insert(String(key ?? ''))"
          >
            <button type="button" class="quick-reply" aria-label="快捷回复">
              <SrIcon name="lucide:zap" :size="16" />
            </button>
          </SrDropdown>
        </template>
      </SrComment>
      <p class="hint">
        <code>editor-toolbar</code> 插槽落在表情按钮右侧，作用域里有 <code>insert</code> 与
        <code>submit</code>：选中一条快捷回复就插到光标处。换成图片、话题标签、@提醒都是同一个口子。
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

.quick-reply {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: var(--sr-radius-sm);
  background: transparent;
  color: var(--sr-color-text-secondary);
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    color 0.16s ease;
}

.quick-reply:hover {
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-primary);
}

.foot {
  margin: 6px 0 0;
  color: var(--sr-color-text-quaternary);
  font-size: 12px;
}
</style>
