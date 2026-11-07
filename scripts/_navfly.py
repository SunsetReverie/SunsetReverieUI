"""临时脚本：修折叠浮层的悬停与对齐。用完即删。"""
from pathlib import Path

VUE = Path('packages/ui/src/components/nav/src/nav.vue')
LESS = Path('packages/ui/src/components/nav/style/index.less')

# ---------- 组件逻辑 ----------
s = VUE.read_text(encoding='utf-8')

old_hover = """/** 收起态的悬浮层：当前悬停的父项 */
const hoverKey = ref('')

/** 悬浮层对应的父项 */
const hoverItem = computed(() =>
  props.items.find((item) => item.key === hoverKey.value && item.children?.length),
)

/**
 * 收起态悬停展开子菜单
 * @param item 导航项
 */
function onHover(item: SrNavItem): void {
  if (!props.collapsed) return
  hoverKey.value = item.children?.length ? (item.key ?? '') : ''
}"""

new_hover = """/** 收起态的悬浮层：当前悬停的父项 */
const hoverKey = ref('')

/** 延迟关闭的定时器 */
let closeTimer: ReturnType<typeof setTimeout> | undefined

/** 悬浮层对应的父项 */
const hoverItem = computed(() =>
  props.items.find((item) => item.key === hoverKey.value && item.children?.length),
)

/** 清掉待执行的关闭 */
function clearCloseTimer(): void {
  if (closeTimer === undefined) return
  clearTimeout(closeTimer)
  closeTimer = undefined
}

/**
 * 移入导航项
 *
 * 浮层与图标之间有间隙，鼠标横穿时必然先触发一次 leave。
 * 所以不能在 leave 里立刻清空，否则永远点不到子项。
 * @param item 导航项
 */
function onEnter(item: SrNavItem): void {
  if (!props.collapsed) return
  clearCloseTimer()
  hoverKey.value = item.children?.length ? (item.key ?? '') : ''
}

/** 移出导航项：延时关闭，给鼠标穿过间隙的时间 */
function onLeave(): void {
  if (!props.collapsed) return
  clearCloseTimer()
  closeTimer = setTimeout(() => {
    hoverKey.value = ''
    closeTimer = undefined
  }, 180)
}

/** 移入浮层本身，取消关闭 */
function onFlyoutEnter(): void {
  clearCloseTimer()
}

onScopeDispose(() => {
  clearCloseTimer()
})"""

assert old_hover in s
s = s.replace(old_hover, new_hover, 1)

s = s.replace("import { computed, ref, watch } from 'vue'",
              "import { computed, onScopeDispose, ref, watch } from 'vue'")

# ---------- 模板 ----------
old_entry = """      <div
        v-if="!isGroupHidden(item)"
        class="sr-nav__entry"
        @mouseenter="onHover(item)"
        @mouseleave="onHover({ ...item, children: undefined })"
      >"""
new_entry = """      <div
        v-if="!isGroupHidden(item)"
        class="sr-nav__entry"
        @mouseenter="onEnter(item)"
        @mouseleave="onLeave"
      >"""
assert old_entry in s
s = s.replace(old_entry, new_entry, 1)

old_fly = """        <!-- 收起态：悬停浮层 -->
        <div
          v-if="collapsed && hoverItem && hoverItem.key === item.key"
          class="sr-nav__flyout"
        >
          <span class="sr-nav__flyout-title">{{ hoverItem.label }}</span>
          <button
            v-for="child in hoverItem.children"
            :key="child.key"
            class="sr-nav__item sr-nav__item--child"
            :class="{ 'is-active': child.key === modelValue, 'is-disabled': child.disabled }"
            type="button"
            :disabled="child.disabled || disabled"
            @click="pick(child)"
          >
            <sr-icon v-if="child.icon" class="sr-nav__icon" :name="child.icon" :size="15" />
            <span class="sr-nav__label">{{ child.label }}</span>
          </button>
        </div>"""

new_fly = """        <!-- 收起态：悬停浮层。子项不再重复图标，父项图标已经表达了归属 -->
        <div
          v-if="collapsed && hoverItem && hoverItem.key === item.key"
          class="sr-nav__flyout"
          @mouseenter="onFlyoutEnter"
          @mouseleave="onLeave"
        >
          <span class="sr-nav__flyout-title">{{ hoverItem.label }}</span>
          <button
            v-for="child in hoverItem.children"
            :key="child.key"
            class="sr-nav__item sr-nav__item--child sr-nav__item--plain"
            :class="{ 'is-active': child.key === modelValue, 'is-disabled': child.disabled }"
            type="button"
            :disabled="child.disabled || disabled"
            @click="pick(child)"
          >
            <span class="sr-nav__label">{{ child.label }}</span>
          </button>
        </div>"""
assert old_fly in s
s = s.replace(old_fly, new_fly, 1)
VUE.write_text(s, encoding='utf-8')
print('组件 ✓')

# ---------- 样式 ----------
s = LESS.read_text(encoding='utf-8')

# 浮层：加透明桥接区，让鼠标能平移过去
s = s.replace("""  &__flyout {
    position: absolute;
    top: 0;
    left: calc(100% + 8px);""",
"""  &__flyout {
    position: absolute;
    top: 0;
    left: calc(100% + 6px);""")

s = s.replace("""  &__flyout-title {
    padding: 4px 8px 6px;
    color: var(--sr-color-text-tertiary);
    font-size: 11px;
  }""",
"""  // 透明桥接：浮层左缘与图标之间有一段间隙，用不可见的伪元素盖住，
  // 鼠标横穿时不会离开父项，配合延时关闭才点得到子项
  &__flyout::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: -6px;
    width: 6px;
  }

  &__flyout-title {
    // 与子项左内边距一致，标题和子菜单首字对齐
    padding: 4px 10px 6px;
    color: var(--sr-color-text-tertiary);
    font-size: 11px;
  }""")

# 浮层子项：无图标时左内边距与标题一致
s = s.replace("""  &__item--child {
    height: calc(var(--sr-nav-height) - 4px);
    padding: 0 10px;
    font-size: calc(var(--sr-nav-font) - 1px);
  }""",
"""  &__item--child {
    height: calc(var(--sr-nav-height) - 4px);
    padding: 0 10px;
    font-size: calc(var(--sr-nav-font) - 1px);
  }

  // 浮层里的子项不再带图标，文字与标题左对齐
  &__item--plain {
    gap: 0;
  }""")
LESS.write_text(s, encoding='utf-8')
print('样式 ✓')
