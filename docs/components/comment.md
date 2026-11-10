# SrComment 评论

游客与登录双态、一层回复、排序分页、表情标记与插槽定制。数据完全由宿主持有，组件只派发事件。

`comments` 是一棵**两层数组**：顶层评论带 `replies`，回复的回复并入同一层。字段与 JSON 示例见[数据格式](#数据格式)。

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

## 快速上手

最小可用例子——一份数据、一个事件：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const comments = ref([
  {
    id: 1,
    author: { id: 'u1', name: '苏晚' },
    content: '第一条评论[微笑]',
    createdAt: Date.now(),
  },
])
</script>

<template>
  <SrComment :comments="comments" @submit="(payload) => console.log(payload.content)" />
</template>
```

不传 `user` 就是游客态，表单会要求填昵称；登录态传 `:user="{ id, name }"` 即可。表情要生效还得传 `:emoji-packages`（与插入端同一份数据）。

## 交互演示

<!-- 演示用 Date.now() 计算「几分钟前」：SSR 与客户端文案会不同，整块交给客户端渲染 -->
<div class="sr-demo is-block">
  <ClientOnly>
    <template #fallback><p style="margin: 0; color: var(--vp-c-text-3); font-size: 12px">交互演示在浏览器中渲染（相对时间依赖当前时刻）。</p></template>
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px">
      <SrSwitch v-model="loggedIn" size="sm" />
      <span style="color: var(--sr-color-text-tertiary); font-size: 12px">{{ loggedIn ? '登录态：林深' : '游客态：多出昵称/邮箱/网址' }}</span>
    </div>
    <SrComment :comments="comments" :user="user" :emoji-packages="emojiPackages" @like="onLike" @delete="onDelete" />
  </ClientOnly>
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

## 数据格式

`comments` 接收一棵**只有两层**的数组：顶层评论带 `replies`。下面这份示例把字段基本用满，可以直接对照着写接口：

```json
[
  {
    "id": 1,
    "author": {
      "id": "u_1024",
      "name": "苏晚",
      "avatar": "https://cdn.example.com/avatar/1024.png",
      "website": "https://suvian.me",
      "isAdmin": true,
      "meta": { "level": 6 }
    },
    "content": "这套主题的层次感做得很舒服，尤其喜欢卡片上那层高光。[微笑]",
    "createdAt": "2026-11-10T11:57:00+08:00",
    "likes": 12,
    "liked": false,
    "meta": { "region": "浙江", "os": "macOS", "browser": "Chrome" },
    "replies": [
      {
        "id": 11,
        "author": { "id": "u_2048", "name": "陈屿" },
        "content": "同感，暗色模式下也不闷。",
        "createdAt": 1762747020000,
        "likes": 3,
        "replyTo": { "id": "u_1024", "name": "苏晚" },
        "meta": { "region": "广东", "os": "Windows", "browser": "Edge" }
      },
      {
        "id": 12,
        "author": { "id": "u_me", "name": "林深", "isSelf": true },
        "content": "高光是玻璃图层带的。",
        "createdAt": "2026-11-10 11:59:00",
        "replyTo": { "id": "u_2048", "name": "陈屿" }
      }
    ]
  },
  {
    "id": 2,
    "author": { "id": "u_4096", "name": "周野" },
    "content": "这条已经被作者删除了。",
    "createdAt": 1762740000000,
    "deleted": true
  }
]
```

### 评论字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string \| number` | 是 | 唯一标识，列表 key 与事件回传都用它 |
| `author` | `SrCommentAuthor` | 是 | 作者信息 |
| `content` | `string` | 是 | 正文，**纯文本**；表情写成标记 `[微笑]` |
| `createdAt` | `string \| number \| Date` | 是 | 创建时间 |
| `likes` | `number` | 否 | 点赞数，缺省按 0 处理 |
| `liked` | `boolean` | 否 | 当前用户是否已赞，决定爱心是否高亮 |
| `replies` | `SrCommentData[]` | 否 | 回复，**只有顶层评论会读这个字段** |
| `replyTo` | `SrCommentAuthor` | 否 | 这条回复针对谁，渲染成「回复 @某某」 |
| `deleted` | `boolean` | 否 | 软删除，显示占位并隐藏操作区 |
| `meta` | `object` | 否 | 环境信息，组件只透传给插槽 |

### 作者字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string \| number` | 是 | 唯一标识 |
| `name` | `string` | 是 | 昵称；没有头像时用它首字做回退 |
| `avatar` | `string` | 否 | 头像地址 |
| `website` | `string` | 否 | 个人网址，有值时昵称渲染成链接 |
| `isSelf` | `boolean` | 否 | 是否本人，**唯一决定是否显示「删除」** |
| `isAdmin` | `boolean` | 否 | 显示「作者」标识 |
| `meta` | `object` | 否 | 等级等扩展信息 |

### 回复在 JSON 里怎么放

只有一层：回复放在顶层评论的 `replies` 里，**回复的回复也是同一层的元素**，用 `replyTo` 标注它针对谁：

```json
{
  "id": 1,
  "content": "顶层评论",
  "replies": [
    { "id": 11, "content": "回复顶层", "replyTo": { "id": 1, "name": "苏晚" } },
    { "id": 12, "content": "回复 11 楼", "replyTo": { "id": 11, "name": "陈屿" } }
  ]
}
```

挂在回复身上的 `replies` 不会被渲染——无限嵌套在窄屏上会把正文挤成一条竖线。

### meta 里的约定键

`meta` 是自由结构，但下面这几个键组件**认识**，有值就渲染成标签：

| 来源 | 键 | 渲染成 |
| --- | --- | --- |
| `author.meta.level` | `level` | `Lv.6`（主色标签） |
| `comment.meta.region` | `region` | 归属地 |
| `comment.meta.os` | `os` | 操作系统 |
| `comment.meta.browser` | `browser` | 浏览器 |

其他键不渲染，只在 `#comment-meta` / `#comment-footer` 的作用域里可读。

### 时间字段

四种写法都吃，服务端返回什么就传什么：

```json
{ "createdAt": 1762747020000 }
{ "createdAt": 1762747020 }
{ "createdAt": "1762747020000" }
{ "createdAt": "2026-11-10 11:57:00" }
```

10 位数字按秒处理，13 位按毫秒；数字字符串也是按时间戳解析，不会被当成日期字符串。

### 提交载荷

`submit` 事件的载荷固定三块：

```json
{
  "content": "你好[微笑]",
  "replyTo": {
    "id": 1,
    "author": { "id": "u_1024", "name": "苏晚" },
    "content": "这套主题的层次感做得很舒服"
  },
  "guest": null
}
```

| 场景 | `replyTo` | `guest` |
| --- | --- | --- |
| 顶层评论（登录） | `null` | `null` |
| 回复（登录） | 被回复的评论对象 | `null` |
| 游客评论 | `null` 或评论对象 | `{ name, email, website }` |

### 宿主怎么更新数据

组件不改传进去的数组，四个事件都得自己处理：

```vue
<script setup lang="ts">
const comments = ref<SrCommentData[]>([])
const commentRef = ref()

function onLike(comment: SrCommentData) {
  // 乐观更新：先改本地，失败再回滚
  const liked = !comment.liked
  comment.liked = liked
  comment.likes = Math.max(0, (comment.likes ?? 0) + (liked ? 1 : -1))

  api.like(comment.id, liked).catch(() => {
    comment.liked = !liked
    comment.likes = Math.max(0, (comment.likes ?? 0) - (liked ? 1 : -1))
  })
}

function onDelete(comment: SrCommentData) {
  api.remove(comment.id).then(() => {
    // 软删除：保留占位，别把节点摘掉，否则下面的回复没了上下文
    comment.deleted = true
  })
}

async function onSubmit(payload: SrCommentSubmitPayload) {
  const created = await api.create(payload)

  if (payload.replyTo) {
    const parent = comments.value.find(
      (item) =>
        item.id === payload.replyTo!.id || item.replies?.some((r) => r.id === payload.replyTo!.id),
    )
    parent?.replies?.push(created)
  } else {
    comments.value.unshift(created)
  }

  // 成功后才清空表单
  commentRef.value?.clearEditor()
}
</script>
```

### 分页数据怎么给

| 模式 | `comments` 传什么 | 额外处理 |
| --- | --- | --- |
| `pager` | **全量**顶层评论，组件自己切片 | 页码变化派发 `page-change` |
| `more` | 已加载的那部分 | 点「加载更多」派发 `load-more`，宿主追加后更新 `hasMore` |
| `none` | 全量 | 不分页 |

```vue
<!-- 加载更多：追加数据，不要重新切片 -->
<SrComment
  :comments="loaded"
  pagination="more"
  :has-more="loaded.length < total"
  :loading-more="loading"
  @load-more="loadNextPage"
/>
```

### 表情在数据里怎么存

正文存的是**标记文本**，不是 HTML，也不是图片地址：

```json
{ "content": "太可爱了[微笑][狗头]" }
```

渲染时按 `emojiPackages` 反查：`char` 直出字符，`url` 才生成图片。所以换一整套表情包不用动历史数据，只要名称对得上；查不到的标记原样显示，不会吞掉正文。

## 游客与登录

`user` 为 `null` 就是游客态。表单会在正文上方多出一行身份信息，**头像固定在列外**，身份行与正文都缩进在它右侧的同一列里：

```
[头像] [昵称（必填）] [邮箱（选填，不会公开）] [网址（选填）]
       [                正文编辑框                  ]
       [表情]  Ctrl / ⌘ + Enter 发送          [发表]
```

登录态没有身份行，头像仍在同一位置，所以切换身份时正文不会左右跳。

身份行用 flex 等分，`show-guest-website=false` 时剩下两项自动平分；窄屏（< 640px）下每项独占一行。

昵称默认必填：

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

排序条的圆角由 `--sr-comment-sort-radius` 控制（默认 `8px`，不是胶囊；不跟随 `--sr-radius-md` 是避免 glass 下被撑成半圆），未激活项 hover 时有底色反馈。

::: tip 数据要够才看得出效果
页码模式在顶层评论数不超过 `pageSize` 时不渲染分页条；加载更多模式在 `hasMore=false` 时只显示「没有更多了」。演示或联调时至少准备两页数据（比如 23 条 + 每页 5 条），否则会觉得「分页没生效」。
:::

只传 `page-size` 不传 `pagination` 时按 `pager` 处理——否则老代码升级后会一屏铺出几千条。

## 表情渲染

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

## 输入框背景

正文框的背景直接透传给内部 `SrTextarea`，适合放「友善发言」这类水印或品牌背景图：

```vue
<!-- 右下角水印 -->
<SrComment
  :comments="comments"
  background-text="友善发言"
  background-position="bottom-right"
  :background-text-size="44"
/>

<!-- 背景图：url() / 渐变 / 裸地址都行 -->
<SrComment :comments="comments" background-image="url(/assets/paper.png)" />
```

| 属性 | 说明 |
| --- | --- |
| `backgroundImage` | `url()`、渐变函数或裸地址，裸地址会先校验协议 |
| `backgroundText` | 水印文字 |
| `backgroundPosition` | 九宫格，图片与文字共用 |
| `backgroundTextSize` | 水印字号（px），0 跟随组件字号 |
| `backgroundTextOpacity` | 水印不透明度，默认 0.06 |

位置（九宫格）、字号、浓淡都是运行时属性，切主题、切位置不必重建组件。

背景是独立的一层，`pointer-events: none`，不抢焦点、不参与选中——全选复制不会把水印带进正文。回复框同样生效（`compact` 时水印字号会跟着组件字号缩小，除非显式给 `backgroundTextSize`）。

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
| `editor-toolbar` | `insert, submit` | 评论框工具栏，位于表情按钮右侧 |

`Lv.6` / `浙江` / `macOS` / `Chrome` 这些标签**默认就会渲染**——作者的 `meta.level`、评论的 `meta.region / os / browser` 有值就显示，等级自带主色底以区别于其他标签。上面的槽位只是把它们换成自定义样式，不传也能用。

```vue
<SrComment :comments="comments">
  <template #comment-level="{ level }">
    <span class="lv">Lv.{{ level }}</span>
  </template>
</SrComment>
```

`editor-toolbar` 用来往工具栏加自己的按钮，作用域给了 `insert` 与 `submit`：

```vue
<SrComment :comments="comments">
  <template #editor-toolbar="{ insert }">
    <SrDropdown :items="quickReplies" size="sm" placement="top-start" @select="(key) => insert(String(key))">
      <button type="button" aria-label="快捷回复">⚡</button>
    </SrDropdown>
  </template>
</SrComment>
```

`insert(text)` 会把内容插到正文光标处，快捷回复、图片、话题标签、@提醒都走同一个口子。

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
| `rows` | `number` | `0` | 正文框初始行数，0 按 compact 取 2 / 3 |
| `maxRows` | `number` | `0` | 自动增高上限行数，0 按 compact 取 6 / 10 |
| `backgroundImage` | `string` | `''` | 正文框背景图 |
| `backgroundText` | `string` | `''` | 正文框水印文字 |
| `backgroundPosition` | 九宫格 | `'center'` | 背景落点，图片与文字共用 |
| `backgroundTextSize` | `number` | `0` | 水印字号（px），0 跟随组件 |
| `backgroundTextOpacity` | `number` | `0.06` | 水印不透明度 |

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
| `rows` | `number` | `0` | 初始行数，0 按 compact 取 2 / 3 |
| `maxRows` | `number` | `0` | 自动增高上限，0 按 compact 取 6 / 10 |
| `backgroundImage` | `string` | `''` | 正文框背景图 |
| `backgroundText` | `string` | `''` | 正文框水印文字 |
| `backgroundPosition` | 九宫格 | `'center'` | 背景落点 |
| `backgroundTextSize` | `number` | `0` | 水印字号（px） |
| `backgroundTextOpacity` | `number` | `0.06` | 水印不透明度 |

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `submit` | `SrCommentSubmitPayload` | 通过校验 |
| `cancel-reply` | — | 取消回复 |

| 插槽 | 作用域 | 说明 |
| --- | --- | --- |
| `login` | — | 未登录且不允许游客时的登录引导 |
| `toolbar` | `insert, submit` | 工具栏扩展位，位于表情按钮右侧 |

| 暴露方法 | 说明 |
| --- | --- |
| `reset()` | 清空正文，保留游客身份信息 |
| `focus()` | 聚焦正文 |

## 样式接入

```ts
import '@sunset-reverie/ui/components/comment/style.css'
```

## 样式定制

样式分两层，不用改源码：

**组件级变量**（在 `.sr-comment` 或任意祖先上覆盖）：

| 变量 | 默认 | 作用 |
| --- | --- | --- |
| `--sr-comment-gap` | `var(--sr-space-5)` | 头部 / 列表 / 分页之间的间距 |
| `--sr-comment-sort-radius` | `8px` | 排序条圆角，默认**不是胶囊** |

```css
.my-comments {
  --sr-comment-gap: 16px;
  --sr-comment-sort-radius: 4px;   /* 想要更方 */
}

/* 或者直接改类名 */
.my-comments .sr-comment__title { font-size: 15px; }
.my-comments .sr-comment-item__content { line-height: 1.9; }
```

其余尺寸与颜色都走全局设计令牌（`--sr-space-*` / `--sr-color-*` / `--sr-radius-*`），换主题自动跟随；毛玻璃质感下输入框边框会自动压淡一档，不需要单独处理。

排序条在**未激活项上也有 hover 底色**，不是只换文字颜色。

## 常见问题

**删除按钮不显示？**
看 `author.isSelf`。组件不猜身份——游客态下所有评论都来自同一浏览器，按昵称比对必然误判，这个字段要服务端给。

**正文里的 `[微笑]` 原样显示了？**
说明 `emojiPackages` 与插入端不是同一份数据，或名称对不上。查不到的标记会原样保留，不会吞内容。

**分页条没出现？**
顶层评论数不超过 `pageSize` 时不渲染分页条；`more` 模式在 `hasMore=false` 时只显示「没有更多了」。

**提交成功后表单为什么没清空？**
故意的。立刻清空会让失败的提交丢掉用户刚写的内容，成功后自己调 `commentRef.value?.clearEditor()`。

**回复的回复显示在哪？**
并入同一层。把 `replies` 挂到回复身上不会被渲染，只有顶层评论的 `replies` 会渲染。

**排序能按「时间 + 点赞」混合吗？**
`hottest` 只按点赞数，不做时间衰减。要更复杂的规则，自己在宿主排好再传进来，并把 `show-sort` 关掉。

**能改整体配色和间距吗？**
可以，见「样式定制」。颜色全部走设计令牌，换主题自动跟随；间距和排序条圆角有组件级变量。

## 注意事项

- **组件不改传入的数据**。`like` / `delete` 只派发事件，宿主决定乐观更新还是等接口。否则两边各持一份状态，早晚打架。
- **提交后不自动清空表单**。立刻清空会让失败的提交丢掉用户刚写的内容。成功后调 `clearEditor()`；它只清正文，**保留游客填的昵称/邮箱/网址**——同一个人连着发两条很常见。
- **`isSelf` 必须由服务端判定**。组件按字段决定是否显示「删除」，不做昵称比对。
- **软删除保留占位**。`deleted: true` 显示「该评论已被删除」而不是移除，否则它下面的回复会失去上下文。
- **`website` 的协议白名单必须服务端把关**。前端只做 `^https?://` 的防误填，`javascript:` 开头的「网址」是可点击的 XSS。
- **`pager` 才切片**。`more` 模式下组件再切一次的话，用户点了「加载更多」却看不到新内容。
- **自动加载有双重拦截**。`loadingMore` 或 `hasMore=false` 时不再派发，滚动触发的频率很高，不拦能连发十几个请求。
- **切换回复目标会清空正文**。旧内容属于上一条回复，留着会被误发出去。
