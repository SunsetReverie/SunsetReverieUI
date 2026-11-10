import type { ExtractPropTypes, PropType } from 'vue'

import type { SrEmojiItem, SrEmojiPackage } from '../../emoji-picker/src/emoji-picker'
import type { SrTextareaBackgroundPosition } from '../../textarea/src/textarea'
import type { SrCommentAuthor, SrCommentData, SrCommentPagination, SrCommentSort } from './types'

/** 容器 props */
export const commentProps = {
  /**
   * 顶层评论列表
   *
   * @remarks 组件不排序、不改数组，排序在内部复制后做。
   */
  comments: {
    type: Array as unknown as PropType<SrCommentData[]>,
    default: () => [],
  },
  /**
   * 当前登录用户
   *
   * @remarks 有值是登录态，`null` 是游客态（表单多出昵称/邮箱/网址）。
   * 组件不猜身份，是否显示「删除」看每条评论的 `author.isSelf`。
   */
  user: {
    type: Object as PropType<SrCommentAuthor | null>,
    default: null,
  },
  /**
   * 是否允许游客评论 @default true
   *
   * 关掉且未登录时，表单位置换成登录引导插槽——而不是让人写完再提示登录。
   */
  allowGuest: {
    type: Boolean,
    default: true,
  },
  /** 游客昵称必填 @default true */
  requireGuestName: {
    type: Boolean,
    default: true,
  },
  /** 游客邮箱必填 @default false */
  requireGuestEmail: {
    type: Boolean,
    default: false,
  },
  /** 游客网址必填 @default false */
  requireGuestWebsite: {
    type: Boolean,
    default: false,
  },
  /** 显示游客网址输入框 @default true */
  showGuestWebsite: {
    type: Boolean,
    default: true,
  },
  /** 正文字数上限 @default 500 */
  maxLength: {
    type: Number,
    default: 500,
  },
  /** 初始排序 @default 'latest' */
  sort: {
    type: String as PropType<SrCommentSort>,
    default: 'latest',
  },
  /** 显示排序切换 @default true（列表只有一条时不显示） */
  showSort: {
    type: Boolean,
    default: true,
  },
  /**
   * 分页方式 @default 'none'
   *
   * `pager` 前端切片 + 页码；`more` 只抛 `load-more`，由宿主追加数据。
   */
  pagination: {
    type: String as PropType<SrCommentPagination>,
    default: 'none',
  },
  /** 每页条数 @default 0（按 10 处理） */
  pageSize: {
    type: Number,
    default: 0,
  },
  /** `more` 模式是否还有更多 @default true */
  hasMore: {
    type: Boolean,
    default: true,
  },
  /** `more` 模式加载中 @default false */
  loadingMore: {
    type: Boolean,
    default: false,
  },
  /** 滚到底自动触发 `load-more` @default false */
  autoLoadMore: {
    type: Boolean,
    default: false,
  },
  /** 到底文案 @default '没有更多了' */
  noMoreText: {
    type: String,
    default: '没有更多了',
  },
  /** 列表加载中 @default false */
  loading: {
    type: Boolean,
    default: false,
  },
  /** 提交中，会禁用表单与按钮 @default false */
  submitting: {
    type: Boolean,
    default: false,
  },
  /** 标题 @default '评论' */
  title: {
    type: String,
    default: '评论',
  },
  /** 标题旁显示总数 @default true */
  showCount: {
    type: Boolean,
    default: true,
  },
  /** 允许点赞 @default true */
  likeable: {
    type: Boolean,
    default: true,
  },
  /** 允许回复 @default true */
  replyable: {
    type: Boolean,
    default: true,
  },
  /** 允许删除（还需 `author.isSelf`） @default true */
  deletable: {
    type: Boolean,
    default: true,
  },
  /** 允许插入表情 @default true */
  emojiable: {
    type: Boolean,
    default: true,
  },
  /**
   * 表情包 @default []
   *
   * @remarks 面板选择与正文反查必须是同一份数据，
   * 否则会出现「能选到、发出来却显示成方括号」的割裂。
   */
  emojiPackages: {
    type: Array as unknown as PropType<SrEmojiPackage[]>,
    default: () => [],
  },
  /** 空态文案 @default '还没有评论，来说两句吧' */
  emptyText: {
    type: String,
    default: '还没有评论，来说两句吧',
  },
  /** 是否显示评论框 @default true */
  showEditor: {
    type: Boolean,
    default: true,
  },
  /**
   * 正文框初始行数 @default 0
   *
   * 0 表示按 `compact` 取默认值（回复框 2 行、顶层 3 行）。
   */
  rows: {
    type: Number,
    default: 0,
  },
  /**
   * 自动增高的上限行数 @default 0
   *
   * 0 表示按 `compact` 取默认值（回复框 6 行、顶层 10 行）。
   */
  maxRows: {
    type: Number,
    default: 0,
  },
  /**
   * 正文框背景图
   *
   * @remarks 透传给内部 `SrTextarea`：`url()`、渐变函数或裸地址都行，
   * 裸地址会先校验协议再包成 `url()`。
   */
  backgroundImage: {
    type: String,
    default: '',
  },
  /**
   * 正文框背景文字（水印）
   *
   * @remarks 常见用法是「友善发言」这类提示，或品牌名。
   */
  backgroundText: {
    type: String,
    default: '',
  },
  /** 背景落点 @default 'center' */
  backgroundPosition: {
    type: String as PropType<SrTextareaBackgroundPosition>,
    default: 'center',
  },
  /** 水印字号（px） @default 0，0 表示跟随组件字号 */
  backgroundTextSize: {
    type: Number,
    default: 0,
  },
  /** 水印不透明度 @default 0.06 */
  backgroundTextOpacity: {
    type: Number,
    default: 0.06,
  },
} as const

export type SrCommentProps = ExtractPropTypes<typeof commentProps>

/** 单条评论 props */
export const commentItemProps = {
  /** 评论数据 */
  comment: {
    type: Object as PropType<SrCommentData>,
    required: true,
  },
  /** 深度，0 为顶层 @default 0 */
  depth: {
    type: Number,
    default: 0,
  },
  /** 允许点赞 @default true */
  likeable: {
    type: Boolean,
    default: true,
  },
  /** 允许回复 @default true */
  replyable: {
    type: Boolean,
    default: true,
  },
  /** 允许删除 @default true */
  deletable: {
    type: Boolean,
    default: true,
  },
  /** 折叠时展示的回复条数 @default 2 */
  replyCollapseLimit: {
    type: Number,
    default: 2,
  },
  /** 正在回复的目标 id，命中的条目会高亮并挂载回复表单 @default null */
  replyingId: {
    type: [String, Number] as PropType<string | number | null>,
    default: null,
  },
  /** 表情查找表，由容器算好逐层传下来 @default new Map() */
  emojiMap: {
    type: Object as PropType<Map<string, SrEmojiItem>>,
    default: () => new Map<string, SrEmojiItem>(),
  },
} as const

export type SrCommentItemProps = ExtractPropTypes<typeof commentItemProps>

/** 评论表单 props */
export const commentEditorProps = {
  /** 当前用户，`null` 为游客态 */
  user: {
    type: Object as PropType<SrCommentAuthor | null>,
    default: null,
  },
  /** 允许游客评论 @default true */
  allowGuest: {
    type: Boolean,
    default: true,
  },
  /** 游客昵称必填 @default true */
  requireGuestName: {
    type: Boolean,
    default: true,
  },
  /** 游客邮箱必填 @default false */
  requireGuestEmail: {
    type: Boolean,
    default: false,
  },
  /** 游客网址必填 @default false */
  requireGuestWebsite: {
    type: Boolean,
    default: false,
  },
  /** 显示游客网址输入框 @default true */
  showGuestWebsite: {
    type: Boolean,
    default: true,
  },
  /** 正文字数上限 @default 500 */
  maxLength: {
    type: Number,
    default: 500,
  },
  /** 提交中 @default false */
  submitting: {
    type: Boolean,
    default: false,
  },
  /** 允许插入表情 @default true */
  emojiable: {
    type: Boolean,
    default: true,
  },
  /** 表情包 @default [] */
  emojiPackages: {
    type: Array as unknown as PropType<SrEmojiPackage[]>,
    default: () => [],
  },
  /** 回复目标，不为空时表单进入精简态 @default null */
  replyTo: {
    type: Object as PropType<SrCommentData | null>,
    default: null,
  },
  /** 精简态：回复场景更小更轻 @default false */
  compact: {
    type: Boolean,
    default: false,
  },
  /**
   * 正文框初始行数 @default 0
   *
   * 0 表示按 `compact` 取默认值（回复框 2 行、顶层 3 行）。
   */
  rows: {
    type: Number,
    default: 0,
  },
  /**
   * 自动增高的上限行数 @default 0
   *
   * 0 表示按 `compact` 取默认值（回复框 6 行、顶层 10 行）。
   */
  maxRows: {
    type: Number,
    default: 0,
  },
  /** 正文框背景图，透传给 `SrTextarea` */
  backgroundImage: {
    type: String,
    default: '',
  },
  /** 正文框背景文字（水印） */
  backgroundText: {
    type: String,
    default: '',
  },
  /** 背景落点 @default 'center' */
  backgroundPosition: {
    type: String as PropType<SrTextareaBackgroundPosition>,
    default: 'center',
  },
  /** 水印字号（px） @default 0 */
  backgroundTextSize: {
    type: Number,
    default: 0,
  },
  /** 水印不透明度 @default 0.06 */
  backgroundTextOpacity: {
    type: Number,
    default: 0.06,
  },
} as const

export type SrCommentEditorProps = ExtractPropTypes<typeof commentEditorProps>

/** 排序选项 */
export const COMMENT_SORT_OPTIONS: { label: string; value: SrCommentSort }[] = [
  { label: '最新', value: 'latest' },
  { label: '最早', value: 'oldest' },
  { label: '最热', value: 'hottest' },
]
