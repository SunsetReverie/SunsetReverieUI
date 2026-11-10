import { srWithInstall } from '../../utils/with-install'
import CommentEditor from './src/comment-editor.vue'
import CommentItem from './src/comment-item.vue'
import Comment from './src/comment.vue'

/** 评论 */
export const SrComment = srWithInstall(Comment)

/** 单条评论，可脱离容器单独使用 */
export const SrCommentItem = srWithInstall(CommentItem)

/** 评论表单，可单独用于「快速回复」等场景 */
export const SrCommentEditor = srWithInstall(CommentEditor)

export * from './src/comment'
export * from './src/types'
export * from './src/format'
export default SrComment
