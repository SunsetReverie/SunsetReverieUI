# SrComment 评论

游客与登录双态、一层回复、排序分页、表情标记与插槽定制。数据完全由宿主持有，组件只派发事件。

<script setup>
import { computed, ref } from 'vue'
import { DEFAULT_EMOJI_PACKAGES, SrComment } from '@sunset-reverie/ui'

const now = Date.now()
const minute = 60 * 1000

const me = { id: 'me', name: '林深', isAdmin: true, meta: { level: 8 } }

const comments = ref([
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
    content: '评论正文支持表情标记，写 [开心] 就能渲染出来。',
    createdAt: now - 40 * minute,
    likes: 5,
    meta: { region: '四川', os: 'iOS', browser: 'Safari' },
  },
  {
    id: 3,
    author: { id: 'u5', name: '默默' },
    content: '这条已被删除，但占位保留，下面的回复不会失去上下文。',
    createdAt: now - 3 * 60 * minute,
    deleted: true,
  },
])

const loggedIn = ref(true)
const user = computed(() => (loggedIn.value ? me : null))
const emojiPackages = DEFAULT_EMOJI_PACKAGES

function onLike(comment) {
  const liked = !comment.liked
  comment.liked = liked
  comment.likes = Math.max(0, (comment.likes ?? 0) + (liked ? 1 : -1))
}

function onDelete(comment) {
  comment.deleted = true
}
</script>

## 交互演示

<div class="sr-demo">
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px">
    <SrSwitch v-model="loggedIn" size="sm" />
    <span style="color: var(--sr-color-text-tertiary); font-size: 12px">
      {{ loggedIn ? '登录态：林深' : '游客态：多出昵称/邮箱/网址' }}
    </span>
  </div>
  <SrComment
    :comments="comments"
    :user="user"
    :emoji-packages="emojiPackages"
    @like="onLike"
    @delete="onDelete"
  />
</div>

```vue
<SrComment
  :comments="comments"
  :user="user"
  :emoji-packages="packages"
  @like="onLike"
  @delete="onDelete"
  @submit="onSubmit"
/>
```

组件**不持有业务状态**：点赞、删除、提交都只派发事件，改数据的是宿主。这样乐观更新还是等接口返回，由业务自己决定，不会出现两边各持一份状态互相打架。

## 数据结构

```ts
interface SrCommentData {
  id: string | number
  author: SrCommentAuthor
  content: string                 // 纯文本，表情是标记（[微笑]）
  createdAt: string | number | Date
  likes?: number
  liked?: boolean
  replies?: SrCommentData[]       // 只支持一层
  replyTo?: SrCommentAuthor       // 回复目标，用于「回复 @某某」
  deleted?: boolean               // 软删除
  meta?: Record<string, unknown>  // 归属地/系统/浏览器等
}

interface SrCommentAuthor {
  id: string | number
  name: string
  avatar?: string
  website?: string                // 有值时昵称渲染成链接
  isSelf?: boolean                // 是否本人，决定显示「删除」
  isAdmin?: boolean               // 显示「作者」标识
  meta?: Record<string, unknown>
}
```

`createdAt` 三种写法都吃：时间戳（10 位按秒处理）、日期字符串、`Date`。

## 游客与登录

`user` 为 `null` 就是游客态，表单会多出昵称/邮箱/网址三项，昵称默认必填：

```vue
<!-- 游客可评论 -->
<SrComment :comments="comments" :user="null" />

<!-- 只允许登录用户：未登录直接给登录引导，而不是写完再提示 -->
<SrComment :comments="comments" :user="null" :allow-guest="false" />

<!-- 游客也要求填邮箱，且不显示网址 -->
<SrComment :comments="comments" :user="null" require-guest-email :show-guest-website="false" />
```

是否显示「删除」看每条评论的 `author.isSelf`，**组件不猜身份**——游客模式下所有评论都来自同一浏览器，按昵称比对必然误判。

## 回复与层级

回复只做**一层**：回复的回复并入同一层，用 `replyTo` 标注对象。无限嵌套在窄屏上会把正文挤成一条竖线。

```vue
<SrComment
  :comments="comments"
  :user="user"
  reply-collapse-limit="2"
  @submit="onSubmit"
/>
```

点击「回复」后，顶层评论框隐藏，回复框挂到目标条目下方；超过 `replyCollapseLimit` 条自动折叠，可展开/收起。

## 排序与分页

```vue
<!-- 页码：前端切片 -->
<SrComment :comments="comments" pagination="pager" :page-size="5" @page-change="load" />

<!-- 加载更多：只抛事件，数据由宿主追加 -->
<SrComment
  :comments="comments"
  pagination="more"
  :has-more="hasMore"
  :loading-more="loadingMore"
  auto-load-more
  @load-more="loadMore"
/>
```

排序有 `latest` / `oldest` / `hottest`（只按点赞数，不做时间衰减）。切换排序会回到第一页。

::: tip 数据要够才看得出效果
页码模式在顶层评论数不超过 `pageSize` 时不渲染分页条；加载更多模式在 `hasMore=false` 时只显示「没有更多了」。演示或联调时至少准备两页数据（比如 23 条 + 每页 5 条），否则会觉得「分页没生效」。
:::

只传 `page-size` 不传 `pagination` 时按 `pager` 处理——否则老代码升级后会一屏铺出几千条。

## 表情

`emoji-packages` 同时用于**表单插入**和**正文反查**，必须是同一份：

```vue
<SrComment :comments="comments" :emoji-packages="packages" />
```

正文渲染的管线是「切分 → 逐片段拼接」：

| 片段 | 渲染 |
| --- | --- |
| 文本 | `<span>`，由 Vue 自动转义 |
| 表情（有 `url`） | `<img class="sr-comment-item__emoji">` |
| 表情（有 `char`） | 直接输出字符 |

**全程不使用 `v-html`**，这是评论正文的安全底线。查不到的 `[名称]` 原样保留，不会吞掉正文。

## 插槽

| 名称 | 作用域 | 说明 |
| --- | --- | --- |
| `login` | — | 未登录且 `allow-guest=false` 时的登录引导 |
| `empty` | — | 空态 |
| `comment-avatar` | `comment, depth, authorMeta, commentMeta…` | 头像 |
| `comment-meta` | 同上 | 整块头部信息（会盖掉下面几个具名槽位） |
| `comment-level` | `level` 等 | 等级标识 |
| `comment-region` | `region` 等 | 归属地 |
| `comment-os` | `os` 等 | 操作系统 |
| `comment-browser` | `browser` 等 | 浏览器 |
| `comment-actions` | 同上 | 操作区（点赞/回复/删除） |
| `comment-footer` | 同上 | 条目底部 |

```vue
<SrComment :comments="comments">
  <template #comment-level="{ level }">
    <span class="lv">Lv.{{ level }}</span>
  </template>
</SrComment>
```

具名槽位与通用 `meta` 槽位并存：常用字段有便捷通道，新字段不至于只能改组件库。

## API

### SrComment

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `comments` | `SrCommentData[]` | `[]` | 顶层评论列表 |
| `user` | `SrCommentAuthor \| null` | `null` | 当前用户，`null` 为游客态 |
| `allowGuest` | `boolean` | `true` | 是否允许游客评论 |
| `requireGuestName` | `boolean` | `true` | 游客昵称必填 |
| `requireGuestEmail` | `boolean` | `false` | 游客邮箱必填 |
| `requireGuestWebsite` | `boolean` | `false` | 游客网址必填 |
| `showGuestWebsite` | `boolean` | `true` | 显示网址输入框 |
| `maxLength` | `number` | `500` | 正文字数上限 |
| `sort` | `'latest' \| 'oldest' \| 'hottest'` | `'latest'` | 初始排序 |
| `showSort` | `boolean` | `true` | 显示排序切换 |
| `pagination` | `'none' \| 'pager' \| 'more'` | `'none'` | 分页方式 |
| `pageSize` | `number` | `0` | 每页条数，0 按 10 |
| `hasMore` | `boolean` | `true` | `more` 模式是否还有更多 |
| `loadingMore` | `boolean` | `false` | `more` 模式加载中 |
| `autoLoadMore` | `boolean` | `false` | 滚到底自动加载 |
| `noMoreText` | `string` | `'没有更多了'` | 到底文案 |
| `loading` | `boolean` | `false` | 列表加载中 |
| `submitting` | `boolean` | `false` | 提交中 |
| `title` | `string` | `'评论'` | 标题 |
| `showCount` | `boolean` | `true` | 显示总数 |
| `likeable` | `boolean` | `true` | 允许点赞 |
| `replyable` | `boolean` | `true` | 允许回复 |
| `deletable` | `boolean` | `true` | 允许删除（还需 `author.isSelf`） |
| `emojiable` | `boolean` | `true` | 允许插入表情 |
| `emojiPackages` | `SrEmojiPackage[]` | `[]` | 表情包，表单与正文共用 |
| `emptyText` | `string` | `'还没有评论，来说两句吧'` | 空态文案 |
| `showEditor` | `boolean` | `true` | 是否显示评论框 |

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `submit` | `SrCommentSubmitPayload` | 表单通过校验 |
| `like` | `comment` | 点赞 / 取消点赞 |
| `delete` | `comment` | 请求删除 |
| `sort-change` | `sort` | 排序变化 |
| `page-change` | `page` | 页码变化 |
| `load-more` | — | `more` 模式请求下一页 |

| 暴露方法 | 说明 |
| --- | --- |
| `clearEditor()` | 清空表单并退出回复态，提交成功后调用 |
| `cancelReply()` | 退出回复态 |

### SrCommentItem

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `comment` | `SrCommentData` | 必填 | 评论数据 |
| `depth` | `number` | `0` | 深度，0 为顶层 |
| `likeable` | `boolean` | `true` | 允许点赞 |
| `replyable` | `boolean` | `true` | 允许回复 |
| `deletable` | `boolean` | `true` | 允许删除 |
| `replyCollapseLimit` | `number` | `2` | 折叠时展示的回复条数 |
| `replyingId` | `string \| number \| null` | `null` | 正在回复的目标 id |
| `emojiMap` | `Map<string, SrEmojiItem>` | `new Map()` | 表情查找表 |

### SrCommentEditor

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `user` | `SrCommentAuthor \| null` | `null` | 当前用户 |
| `allowGuest` | `boolean` | `true` | 允许游客评论 |
| `requireGuestName` | `boolean` | `true` | 昵称必填 |
| `requireGuestEmail` | `boolean` | `false` | 邮箱必填 |
| `requireGuestWebsite` | `boolean` | `false` | 网址必填 |
| `showGuestWebsite` | `boolean` | `true` | 显示网址 |
| `maxLength` | `number` | `500` | 字数上限 |
| `submitting` | `boolean` | `false` | 提交中 |
| `emojiable` | `boolean` | `true` | 允许插入表情 |
| `emojiPackages` | `SrEmojiPackage[]` | `[]` | 表情包 |
| `replyTo` | `SrCommentData \| null` | `null` | 回复目标，进入精简态 |
| `compact` | `boolean` | `false` | 精简样式 |

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `submit` | `SrCommentSubmitPayload` | 通过校验 |
| `cancel-reply` | — | 取消回复 |

| 暴露方法 | 说明 |
| --- | --- |
| `reset()` | 清空正文，保留游客身份信息 |
| `focus()` | 聚焦正文 |

## 样式接入

```ts
import '@sunset-reverie/ui/components/comment/style.css'
```

## 注意事项

- **组件不改传入的数据**。`like` / `delete` 只派发事件，宿主决定乐观更新还是等接口。否则两边各持一份状态，早晚打架。
- **提交后不自动清空表单**。立刻清空会让失败的提交丢掉用户刚写的内容。成功后调 `clearEditor()`；它只清正文，**保留游客填的昵称/邮箱/网址**——同一个人连着发两条很常见。
- **`isSelf` 必须由服务端判定**。组件按字段决定是否显示「删除」，不做昵称比对。
- **软删除保留占位**。`deleted: true` 显示「该评论已被删除」而不是移除，否则它下面的回复会失去上下文。
- **`website` 的协议白名单必须服务端把关**。前端只做 `^https?://` 的防误填，`javascript:` 开头的「网址」是可点击的 XSS。
- **`pager` 才切片**。`more` 模式下组件再切一次的话，用户点了「加载更多」却看不到新内容。
- **自动加载有双重拦截**。`loadingMore` 或 `hasMore=false` 时不再派发，滚动触发的频率很高，不拦能连发十几个请求。
- **切换回复目标会清空正文**。旧内容属于上一条回复，留着会被误发出去。
