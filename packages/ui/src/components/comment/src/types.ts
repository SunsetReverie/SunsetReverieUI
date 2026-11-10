/**
 * 评论组件的数据契约。
 *
 * @remarks
 * 组件不持有任何业务状态：点赞、删除、提交都只派发事件，
 * 由宿主决定乐观更新还是等接口返回。数据结构也刻意保持扁平，
 * 存库、传输、跨端渲染都是同一份。
 */

/** 评论作者 */
export interface SrCommentAuthor {
  /** 唯一标识，用于「是不是自己」之外的去重与 key */
  id: string | number
  /** 昵称 */
  name: string
  /** 头像地址，不传则用昵称首字 */
  avatar?: string
  /**
   * 个人网址
   *
   * @remarks 有值时昵称渲染成链接。**协议白名单必须由服务端把关**——
   * 前端能绕过，而 `javascript:` 开头的「网址」是可点击的 XSS。
   */
  website?: string
  /**
   * 是否本人
   *
   * @remarks 组件不猜身份：游客模式下所有评论都来自同一浏览器，
   * 按昵称比对必然误判。是否显示「删除」完全看这个字段。
   */
  isSelf?: boolean
  /** 是否作者/管理员，显示对应标识 */
  isAdmin?: boolean
  /** 组件不解释，原样透传给 `meta` 插槽 */
  meta?: Record<string, unknown>
}

/** 一条评论 */
export interface SrCommentData {
  /** 唯一标识 */
  id: string | number
  /** 作者 */
  author: SrCommentAuthor
  /**
   * 正文
   *
   * @remarks 纯文本。表情是标记文本（`[微笑]`），渲染时按表情包反查，
   * **全程不使用 `v-html`**——用户输入由模板自动转义。
   */
  content: string
  /** 创建时间，支持时间戳、日期字符串与 `Date` */
  createdAt: string | number | Date
  /** 点赞数 */
  likes?: number
  /** 当前用户是否已赞 */
  liked?: boolean
  /**
   * 回复
   *
   * @remarks **只支持一层**：回复的回复并入同一层，用 `replyTo` 标注对象。
   * 无限嵌套在窄屏上会把正文挤成一条竖线。
   */
  replies?: SrCommentData[]
  /** 这条回复针对谁，用于正文前的「回复 @某某」 */
  replyTo?: SrCommentAuthor
  /**
   * 软删除标记
   *
   * @remarks 已删除的评论显示占位而不是直接移除，
   * 否则它下面的回复会失去上下文。
   */
  deleted?: boolean
  /** 环境信息（归属地、系统、浏览器等），组件只透传给插槽 */
  meta?: Record<string, unknown>
}

/** 游客填写的身份信息 */
export interface SrCommentGuestInfo {
  /** 昵称 */
  name: string
  /** 邮箱，不会公开 */
  email: string
  /** 网址 */
  website: string
}

/** 提交载荷 */
export interface SrCommentSubmitPayload {
  /** 正文，含表情标记 */
  content: string
  /** 回复目标，顶层评论为 null */
  replyTo: SrCommentData | null
  /** 游客身份，登录用户为 null */
  guest: SrCommentGuestInfo | null
}

/** 排序方式 */
export type SrCommentSort = 'latest' | 'oldest' | 'hottest'

/** 分页方式 */
export type SrCommentPagination = 'none' | 'pager' | 'more'

/** 条目级插槽的作用域 */
export interface SrCommentItemSlotScope {
  /** 当前评论 */
  comment: SrCommentData
  /** 深度，0 为顶层 */
  depth: number
  /** 作者的 `meta`，与评论的 `meta` 分开传，避免同名键互相覆盖 */
  authorMeta: Record<string, unknown>
  /** 评论的 `meta` */
  commentMeta: Record<string, unknown>
  /** 等级（`authorMeta.level` 的便捷通道） */
  level: unknown
  /** 归属地（`commentMeta.region` 的便捷通道） */
  region: unknown
  /** 操作系统 */
  os: unknown
  /** 浏览器 */
  browser: unknown
}
