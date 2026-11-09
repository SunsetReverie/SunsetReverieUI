/**
 * Markdown 渲染的地址校验。
 *
 * @remarks
 * HTML 转义只能挡住 `<>`，挡不住 `[点我](javascript:alert(1))` ——
 * 那里面根本没有尖括号。协议白名单是独立的一道闸门。
 */

/** 允许的协议 */
const SAFE_PROTOCOLS = /^(https?:|mailto:|tel:)/i

/**
 * 相对路径、锚点、协议相对地址。
 *
 * @remarks 以 `/` `#` `?` `.` 开头的都算站内地址，不需要协议校验。
 */
const RELATIVE_PATH = /^[/#?.]/

/**
 * 判断链接地址是否安全。
 *
 * @param url 待校验地址
 * @returns 是否放行
 */
export function srIsSafeUrl(url: string): boolean {
  const trimmed = url.trim()

  if (!trimmed) return false
  if (RELATIVE_PATH.test(trimmed)) return true
  // 形如 `docs/intro` 这种不含协议的相对路径
  if (/^[\w-]+(\.[\w-]+)*\//.test(trimmed)) return true

  return SAFE_PROTOCOLS.test(trimmed)
}

/**
 * 判断图片地址是否安全。
 *
 * @remarks 比链接多放开一种：`data:image/*`。
 * 内联小图标、雪碧图常用这种形式。但 **`data:text/html` 必须拦住**——
 * 它能在某些上下文里执行脚本。
 * @param url 待校验地址
 * @returns 是否放行
 */
export function srIsSafeImageUrl(url: string): boolean {
  const trimmed = url.trim()

  if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml|avif);/i.test(trimmed)) return true
  if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml|avif),/i.test(trimmed)) return true

  return srIsSafeUrl(trimmed)
}

/**
 * HTML 转义。
 *
 * @param text 原始文本
 * @returns 转义结果
 */
export function srEscapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
