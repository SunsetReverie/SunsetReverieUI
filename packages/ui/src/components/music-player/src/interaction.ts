/**
 * 面板交互判定
 *
 * 吸附模式的精简卡片把「点任意空白处」当成展开入口，但卡片里仍嵌着
 * 播放 / 切歌 / 进度 / 展开图标等控件，这些点击必须留给控件自己处理。
 * 判定逻辑单独放出来，方便直接单测，不必挂载整个播放器。
 */

/** 需要保留自身行为的可交互元素 */
const INTERACTIVE_SELECTOR = 'button, input, select, textarea, a, [role="slider"], [contenteditable="true"]'

/**
 * 点击目标是否落在控件上（含控件内部的元素，如图标、文字）
 *
 * @param target 点击事件的 target，可能来自文本节点或非 Element
 * @returns true 表示这是控件自己的点击，整卡不该再接管
 * @throws 无；非 Element 目标一律按「非控件」处理
 */
export function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest(INTERACTIVE_SELECTOR))
}
