/**
 * 复制文本到剪贴板。
 *
 * @remarks
 * 走两条路，按可靠性从高到低：
 *
 * 1. `navigator.clipboard.writeText` —— 标准 API，但要 **安全上下文**
 *    （HTTPS 或 localhost）。内网 HTTP 部署下它是 `undefined`。
 * 2. `document.execCommand('copy')` —— 已废弃，但仍是 HTTP 环境下
 *    唯一能用的方案。需要先把文本塞进一个真实可选的节点。
 *
 * 只做一件事：返回成功与否。**不弹提示**——提示的形态（toast、
 * 按钮文案变化、图标切换）由调用方决定，工具函数不该替它做主。
 *
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export async function srCopyText(text: string): Promise<boolean> {
  if (!text) return false

  // 第一条路：标准 API
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // 可能是权限被拒，落到下面再试一次
    }
  }

  // 第二条路：临时 textarea + execCommand
  if (typeof document === 'undefined') return false

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text

    /*
     * 必须真正出现在布局里才能被选中。
     * 用 `position: fixed` + `opacity: 0` 而不是 `display: none`
     * 或 `visibility: hidden`——后两者会让元素不可选，
     * execCommand 直接返回 false。
     */
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.top = '0'
    textarea.style.left = '0'
    textarea.style.opacity = '0'
    textarea.style.pointerEvents = 'none'

    document.body.appendChild(textarea)
    textarea.select()
    textarea.setSelectionRange(0, text.length)

    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)

    return ok
  } catch {
    return false
  }
}
