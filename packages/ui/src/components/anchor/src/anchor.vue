<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import SrAnchorItemRow from './anchor-item.vue'
import { anchorProps, type SrAnchorItem } from './anchor'

defineOptions({ name: 'SrAnchor', inheritAttrs: false })

const props = defineProps(anchorProps)

const emit = defineEmits<{
  /** 激活项变化 */
  'update:activeKey': [key: string]
  /** 激活项变化（含用户点击和滚动触发） */
  change: [key: string, item: SrAnchorItem]
  /** 点击了某一项 */
  click: [key: string, item: SrAnchorItem, event: MouseEvent]
  /** 展开集合变化 */
  'update:expandedKeys': [keys: string[]]
  /** 折叠状态切换 */
  toggle: [key: string, expanded: boolean]
}>()

/** 根节点 */
const rootRef = ref<HTMLElement | null>(null)

/** 内部维护的激活项（非受控时使用） */
const innerActive = ref('')

/**
 * 内部维护的展开集合
 *
 * 默认全部展开——目录本来就该一眼看到全貌，
 * 折叠是「内容太长时才收起来」的手段。
 */
const innerExpanded = ref<Set<string>>(new Set())

/** 当前展开集合（受控优先） */
const expandedSet = computed(() => new Set(props.expandedKeys ?? Array.from(innerExpanded.value)))

/** 各锚点的目标元素 */
const targets = new Map<string, HTMLElement>()

/** 各锚点相对滚动容器顶部的距离 */
const offsets = ref<Record<string, number>>({})

/** 所有链接元素，key → 元素 */
const linkRefs = new Map<string, HTMLElement>()

/** 激活项对应链接元素，用于定位滑块 */
const activeLink = ref<HTMLElement | null>(null)

/** 滑块样式 */
const markerStyle = ref<Record<string, string>>({ opacity: '0' })

/** 滚动容器（null 表示 window） */
let scrollEl: HTMLElement | null = null

/** 滚动节流标记 */
let ticking = false

/** 尺寸观察器 */
let resizeObserver: ResizeObserver | null = null

/**
 * 扁平化锚点，带上层级
 * @param list 原始列表
 * @param depth 当前层级
 * @returns 扁平结果
 */
function flatten(list: SrAnchorItem[], depth = 0): Array<SrAnchorItem & { depth: number }> {
  return list.flatMap((item) => [
    { ...item, depth },
    ...(item.children?.length ? flatten(item.children, depth + 1) : []),
  ])
}

/** 全部锚点（含层级） */
const flatItems = computed(() => flatten(props.items))

/** 当前激活项 */
const currentKey = computed(() => props.activeKey ?? innerActive.value)

/**
 * 激活项的祖先链
 *
 * 子项激活时父项也要有高亮，否则用户看不出自己在哪个大章节里。
 */
const activePath = computed(() => {
  const path = new Set<string>()
  if (!currentKey.value) return path

  /**
   * 深度优先找目标，找到时把路径上的 key 都记下来
   * @param list 当前层
   * @returns 是否命中
   */
  const walk = (list: SrAnchorItem[]): boolean =>
    list.some((item) => {
      if (item.key === currentKey.value) {
        path.add(item.key)
        return true
      }
      if (item.children?.length && walk(item.children)) {
        path.add(item.key)
        return true
      }
      return false
    })

  walk(props.items)
  return path
})

/**
 * 取元素相对滚动容器顶部的距离
 *
 * 不能直接用 offsetTop：它会受定位祖先影响，
 * 而 getBoundingClientRect 是相对视口的，换算回容器坐标最稳。
 * @param el 目标元素
 * @returns 距离
 */
function measureTop(el: HTMLElement): number {
  if (!scrollEl) {
    return el.getBoundingClientRect().top + window.scrollY
  }

  const rect = scrollEl.getBoundingClientRect()
  return el.getBoundingClientRect().top - rect.top + scrollEl.scrollTop
}

/**
 * 重新测量所有锚点位置
 *
 * 先统一收集 DOM 再统一读取，避免边读边写造成的反复重排。
 */
function measure(): void {
  const next: Record<string, number> = {}

  for (const item of flatItems.value) {
    let el = targets.get(item.key)

    // 目标可能在组件挂载后才渲染出来，第一次找不到就现查
    if (!el) {
      const found = document.getElementById(item.key)
      if (found) {
        targets.set(item.key, found)
        el = found
      }
    }

    if (el) next[item.key] = measureTop(el)
  }

  offsets.value = next
  updateMarker()
}

/**
 * 判定当前应该在哪个章节
 */
function updateActive(): void {
  const keys = flatItems.value.map((item) => item.key).filter((key) => key in offsets.value)
  if (!keys.length) return

  const containerTop = scrollEl ? scrollEl.scrollTop : window.scrollY
  // 判定线：容器顶部 + 偏移，标题越过这条线就算「已进入」
  const line = containerTop + props.offsetTop + props.bounds

  let active = ''

  for (const key of keys) {
    const top = offsets.value[key] ?? 0
    if (top <= line) active = key
    else break
  }

  // 滚到底部时，最后几节可能永远越不过判定线，兜底成最后一个。
  // 但前提是「内容真的超过一屏」——否则 scrollHeight 和视口差不多，
  // 上面的比较恒为真，会把最后一项错当成激活项。
  const scrollHeight = scrollEl ? scrollEl.scrollHeight : document.documentElement.scrollHeight
  const clientHeight = scrollEl ? scrollEl.clientHeight : window.innerHeight
  const canScroll = scrollHeight > clientHeight + 2

  const atBottom =
    canScroll && (scrollEl ? scrollEl.scrollTop : window.scrollY) + clientHeight >= scrollHeight - 2

  if (atBottom) active = keys[keys.length - 1] ?? active

  // 页面在顶部时，即使第一条还没到判定线也要选中它
  if (!active && containerTop <= props.offsetTop + props.bounds) active = keys[0] ?? ''

  setActive(active)
}

/** 收集所有带子项的 key */
function collectParents(list: SrAnchorItem[], out: string[] = []): string[] {
  for (const item of list) {
    if (item.children?.length) {
      out.push(item.key)
      collectParents(item.children, out)
    }
  }
  return out
}

// 默认展开：跟着 items 走，数据异步到达时也能正确展开
watch(
  () => props.items,
  (list) => {
    if (!props.collapsible || !props.defaultExpandAll) return
    if (props.expandedKeys !== undefined) return

    innerExpanded.value = new Set(collectParents(list))
  },
  { immediate: true, deep: true },
)

// 自动展开：滚到子章节时，把它所在的父级打开。
// 要 immediate，否则「初始就带 activeKey」的场景不会展开
watch(
  activePath,
  (path) => {
    if (!props.collapsible || !props.autoExpand) return

    const parents = new Set(collectParents(props.items))
    const next = new Set(expandedSet.value)
    let changed = false

    for (const key of path) {
      // 只展开「有子项的祖先」，叶子本身不需要展开
      if (!parents.has(key) || next.has(key)) continue
      next.add(key)
      changed = true
    }

    if (!changed) return

    if (props.expandedKeys === undefined) innerExpanded.value = next
    emit('update:expandedKeys', Array.from(next))
  },
  { immediate: true },
)

/**
 * 切换某个父级的折叠状态
 * @param key 父级 key
 */
function toggle(key: string): void {
  const next = new Set(expandedSet.value)

  if (next.has(key)) next.delete(key)
  else next.add(key)

  if (props.expandedKeys === undefined) innerExpanded.value = next

  emit('update:expandedKeys', Array.from(next))
  emit('toggle', key, next.has(key))

  // 折叠会让上面的项整体上移，位置要重测
  nextTick(() => {
    measure()
    updateMarker()
  })
}

/**
 * 设置激活项
 * @param key 目标 key
 */
function setActive(key: string): void {
  if (key === currentKey.value) {
    updateMarker()
    return
  }

  if (props.activeKey === undefined) innerActive.value = key

  const item = flatItems.value.find((entry) => entry.key === key)
  emit('update:activeKey', key)
  if (item) emit('change', key, item)
  updateMarker()
}

/**
 * 让滑块对齐当前项
 *
 * 不用 `offsetTop`：它是相对最近的定位祖先算的，而每个 `__item`
 * 都是 relative，所以永远是 0。用两个矩形的差值最稳。
 */
function updateMarker(): void {
  if (!props.showMarker) return

  const el = activeLink.value
  const root = rootRef.value

  if (!el || !root) {
    markerStyle.value = { opacity: '0' }
    return
  }

  const rootRect = root.getBoundingClientRect()
  const rect = el.getBoundingClientRect()

  markerStyle.value =
    props.direction === 'horizontal'
      ? {
          opacity: '1',
          left: `${rect.left - rootRect.left}px`,
          width: `${rect.width}px`,
          top: 'auto',
          height: '',
        }
      : {
          opacity: '1',
          top: `${rect.top - rootRect.top}px`,
          left: `${rect.left - rootRect.left}px`,
          height: `${rect.height}px`,
          width: '',
        }
}

/**
 * 滚动到某个锚点
 * @param key 目标 key
 * @param smooth 是否平滑滚动
 */
function scrollToKey(key: string, smooth = props.smooth): void {
  const el = targets.get(key) ?? document.getElementById(key)
  if (!el) return

  targets.set(key, el)
  const top = Math.max(0, measureTop(el) - props.offsetTop)
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto'

  if (scrollEl) scrollEl.scrollTo({ top, behavior })
  else window.scrollTo({ top, behavior })
}

/**
 * 点击锚点
 * @param item 锚点项
 * @param event 鼠标事件
 */
function onClick(item: SrAnchorItem, event: MouseEvent): void {
  // 给了外部链接就交回浏览器，只发事件
  if (item.href) {
    emit('click', item.key, item, event)
    return
  }

  event.preventDefault()
  scrollToKey(item.key)
  emit('click', item.key, item, event)

  if (props.syncHash && typeof history !== 'undefined') {
    history.replaceState(null, '', `#${item.key}`)
  }
}

/** 滚动处理，用 rAF 节流 */
function onScroll(): void {
  if (ticking) return
  ticking = true

  requestAnimationFrame(() => {
    ticking = false
    updateActive()
  })
}

/**
 * 窗口尺寸变化后位置全变了，重新测
 */
function onResize(): void {
  measure()
  updateActive()
}

/**
 * 收集链接元素，用于滑块定位
 * @param el 链接元素
 * @param key 对应 key
 */
function setLinkRef(el: Element | null, key: string): void {
  if (!el) return

  // 全部记下来：模板 ref 只在挂载/更新时回调，
  // 激活项变化时不会重新触发，所以不能只存当前那一个
  linkRefs.set(key, el as HTMLElement)

  if (key === currentKey.value) {
    activeLink.value = el as HTMLElement
    nextTick(updateMarker)
  }
}

// 激活项切换时从缓存里取对应元素，再让滑块跟过去
watch(currentKey, async (key) => {
  await nextTick()
  const el = linkRefs.get(key)
  if (el) activeLink.value = el
  updateMarker()
})

onMounted(async () => {
  // 解析滚动容器
  scrollEl =
    typeof props.container === 'string'
      ? (document.querySelector(props.container) as HTMLElement | null)
      : (props.container ?? null)

  const listener = scrollEl ?? window
  listener.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)

  // 等一帧，让同页渲染的标题都进 DOM
  await nextTick()
  measure()
  updateActive()

  // 带 hash 进来时自动定位（前台文章分享链接的常见需求）
  const hash = decodeURIComponent(window.location.hash.slice(1))
  if (hash && flatItems.value.some((item) => item.key === hash)) {
    requestAnimationFrame(() => scrollToKey(hash, false))
  }

  // 图片加载、折叠内容展开都会改变高度，重新测量
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(onResize)
    const target = scrollEl ?? document.documentElement
    resizeObserver.observe(target)
  }

  window.addEventListener('hashchange', onHashChange)
})

/**
 * 地址栏 hash 变化（浏览器前进后退）时跟随
 */
function onHashChange(): void {
  const hash = decodeURIComponent(window.location.hash.slice(1))
  if (hash && flatItems.value.some((item) => item.key === hash)) {
    scrollToKey(hash)
  }
}

onBeforeUnmount(() => {
  const listener = scrollEl ?? window
  listener.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('hashchange', onHashChange)
  resizeObserver?.disconnect()
  resizeObserver = null
})

// 数据变了要重新测量
watch(
  () => props.items,
  async () => {
    await nextTick()
    measure()
    updateActive()
  },
  { deep: true },
)

/** 根样式（吸顶偏移） */
const rootStyle = computed(() => (props.affix ? { top: `${props.affixOffset}px` } : undefined))
</script>

<template>
  <nav
    ref="rootRef"
    class="sr-anchor"
    :class="[`sr-anchor--${direction}`, `sr-anchor--active-${activeVariant}`, { 'is-affix': affix }]"
    :style="rootStyle"
    :aria-label="ariaLabel"
  >
    <span v-if="showMarker" class="sr-anchor__marker" :style="markerStyle" aria-hidden="true" />

    <ul class="sr-anchor__list">
      <SrAnchorItemRow
        v-for="item in items"
        :key="item.key"
        :item="item"
        :depth="0"
        :active-path="activePath"
        :current-key="currentKey"
        :set-link-ref="setLinkRef"
        :max-depth="maxDepth"
        :collapsible="collapsible"
        :expanded-keys="expandedSet"
        :toggle="toggle"
        @click="onClick"
      />
    </ul>
  </nav>
</template>
