import { srWithInstall } from '../../utils/with-install'
import Markdown from './src/markdown.vue'

/** Markdown 渲染器 */
export const SrMarkdown = srWithInstall(Markdown)

export * from './src/markdown'
export * from './src/extensions'
export * from './src/sanitize'
export { parseMarkdownBuiltin, srCountMarkdownText } from './src/builtin-parser'
export default SrMarkdown
