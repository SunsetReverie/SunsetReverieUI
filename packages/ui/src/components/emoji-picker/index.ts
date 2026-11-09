import { srWithInstall } from '../../utils/with-install'
import EmojiPicker from './src/emoji-picker.vue'

/** 表情选择器 */
export const SrEmojiPicker = srWithInstall(EmojiPicker)

export * from './src/emoji-picker'
export * from './src/parse'
export { DEFAULT_EMOJI_PACKAGES } from './src/data'
export default SrEmojiPicker
