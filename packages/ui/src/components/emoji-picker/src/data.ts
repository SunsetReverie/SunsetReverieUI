/**
 * 内置字符表情包。
 *
 * @remarks 只提供字符表情，不打包任何图片——图片表情包由宿主按需传入。
 * 这三个包的作用是「不配置也能用」，正式项目通常要换成自己的表情包。
 */

import type { SrEmojiPackage } from './emoji-picker'

/** 常用：把 `[名称]` 挂在日常词汇上，写正文时更容易想到用它 */
const common: SrEmojiPackage = {
  key: 'common',
  name: '常用',
  emojis: [
    { name: '微笑', char: '🙂' },
    { name: '开心', char: '😄' },
    { name: '大笑', char: '😂' },
    { name: '喜欢', char: '😍' },
    { name: '思考', char: '🤔' },
    { name: '无语', char: '😑' },
    { name: '累', char: '😪' },
    { name: '哭', char: '😭' },
    { name: '生气', char: '😤' },
    { name: '惊讶', char: '😮' },
    { name: '酷', char: '😎' },
    { name: '嘘', char: '🤫' },
  ],
}

/** 手势与强调：正文里用来加强语气 */
const gesture: SrEmojiPackage = {
  key: 'gesture',
  name: '手势',
  emojis: [
    { name: '赞', char: '👍' },
    { name: '踩', char: '👎' },
    { name: '好的', char: '👌' },
    { name: '鼓掌', char: '👏' },
    { name: '加油', char: '💪' },
    { name: '祈祷', char: '🙏' },
    { name: '打招呼', char: '👋' },
    { name: '指上方', char: '☝️' },
  ],
}

/** 符号：状态标记，比文字更醒目 */
const symbol: SrEmojiPackage = {
  key: 'symbol',
  name: '符号',
  emojis: [
    { name: '完成', char: '✅' },
    { name: '错误', char: '❌' },
    { name: '警告', char: '⚠️' },
    { name: '疑问', char: '❓' },
    { name: '感叹', char: '❗' },
    { name: '火', char: '🔥' },
    { name: '星标', char: '⭐' },
    { name: '爱心', char: '❤️' },
    { name: '庆祝', char: '🎉' },
    { name: '礼物', char: '🎁' },
    { name: '灯泡', char: '💡' },
    { name: '置顶', char: '📌' },
  ],
}

/** 内置表情包 */
export const DEFAULT_EMOJI_PACKAGES: SrEmojiPackage[] = [common, gesture, symbol]
