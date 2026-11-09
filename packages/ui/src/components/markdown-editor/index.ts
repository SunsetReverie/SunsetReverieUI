import { srWithInstall } from '../../utils/with-install'
import MarkdownEditor from './src/markdown-editor.vue'

/** Markdown 编辑器 */
export const SrMarkdownEditor = srWithInstall(MarkdownEditor)

export * from './src/markdown-editor'
export default SrMarkdownEditor
