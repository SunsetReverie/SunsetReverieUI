<script setup lang="ts">
import {
  SrEmojiPicker,
  SrSegmented,
  SrTag,
  parseEmojiText,
  buildEmojiMap,
  type SrEmojiItem,
  type SrEmojiPackage,
} from '@sunset-reverie/ui'
import { computed, ref } from 'vue'

defineOptions({ name: 'EmojiPickerDemo' })

/** 最近选中 */
const picked = ref<string[]>([])

/**
 * 选中表情
 * @param item 表情项
 * @param mark 标记文本
 */
function onSelect(item: SrEmojiItem, mark: string): void {
  picked.value = [...picked.value, mark].slice(-12)
}

/** 尺寸 */
const size = ref<'sm' | 'md' | 'lg'>('md')

/** tab 位置 */
const tabPosition = ref<'top' | 'bottom'>('bottom')

/** tab 位置选项 */
const tabOptions = [
  { label: '底部', value: 'bottom' },
  { label: '顶部', value: 'top' },
]

/** 尺寸选项 */
const sizeOptions = [
  { label: '小', value: 'sm' },
  { label: '中', value: 'md' },
  { label: '大', value: 'lg' },
]

/**
 * 造一个图片表情：用内联 SVG，避免依赖外网
 * @param text 图上文字
 * @param bg 底色
 * @returns data URI
 */
function makeImageEmoji(text: string, bg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">
    <rect width="48" height="48" rx="10" fill="${bg}"/>
    <text x="24" y="31" font-size="20" text-anchor="middle" fill="#fff">${text}</text>
  </svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** 自定义表情包：混合字符与图片 */
const customPackages: SrEmojiPackage[] = [
  {
    key: 'doge',
    name: '神烦狗',
    emojis: [
      { name: '得意', url: makeImageEmoji('🐶', '#f0a020') },
      { name: '鄙视', url: makeImageEmoji('😏', '#7c5cff') },
      { name: '震惊', url: makeImageEmoji('😱', '#e5484d') },
      { name: '无语', url: makeImageEmoji('😐', '#6b7280') },
    ],
  },
  {
    key: 'work',
    name: '办公',
    emojis: [
      { name: '收到', char: '👌' },
      { name: '开会', char: '📅' },
      { name: '加班', char: '🌙' },
      { name: '搞定', char: '✅' },
      { name: '摸鱼', char: '🐟' },
      { name: '请假', char: '🏖️' },
    ],
  },
]

/** 标记文本解析演示用的源文本 */
const sourceText = computed(() => {
  const tail = picked.value.join('')
  return tail ? `刚刚点了 ${tail}` : '点上面的表情，这里会按标记文本还原'
})

/** 解析结果 */
const segments = computed(() => parseEmojiText(sourceText.value, buildEmojiMap(customPackages)))
</script>

<template>
  <div class="demo">
    <section>
      <h3>内置表情（五个分类）</h3>
      <div class="row" style="margin-bottom: 12px">
        <SrSegmented v-model="tabPosition" :options="tabOptions" size="sm" />
      </div>
      <div class="panel panel--tall">
        <SrEmojiPicker :tab-position="tabPosition" searchable @select="onSelect" />
      </div>
      <p class="hint">
        不传 <code>packages</code> 时用内置的五个分类，共 130 多个字符表情。
        <code>tab-position</code> 控制分类栏在底部还是顶部；
        <code>searchable</code> 打开搜索框，跨分类按名称过滤。 悬停表情时顶部会显示名称
      </p>
    </section>

    <section>
      <h3>尺寸自定义</h3>
      <div class="row">
        <div class="panel">
          <SrEmojiPicker
            :width="260"
            :height="220"
            :columns="6"
            :packages="customPackages"
            @select="onSelect"
          />
        </div>
        <div class="panel">
          <SrEmojiPicker
            width="100%"
            :min-height="180"
            tab-position="top"
            :packages="customPackages"
            @select="onSelect"
          />
        </div>
      </div>
      <p class="hint">
        左：固定 <code>width=260</code> / <code>height=220</code>，内容区自动填充并内部滚动。
        右：宽度占满父容器、<code>min-height=180</code>、分类栏在顶部。 玻璃模式下组件会去掉边框，改用阴影塑形
      </p>
    </section>

    <section>
      <h3>自定义表情包（字符 + 图片混合）</h3>
      <div class="row">
        <div class="panel panel--wide">
          <SrEmojiPicker :packages="customPackages" :columns="8" @select="onSelect" />
        </div>
        <div class="side">
          <p class="side__title">标记文本还原</p>
          <p class="side__text">
            <template v-for="(seg, i) in segments" :key="i">
              <img v-if="seg.emoji?.url" class="inline-emoji" :src="seg.emoji.url" :alt="seg.emoji.name" />
              <span v-else-if="seg.emoji" class="inline-char">{{ seg.emoji.char }}</span>
              <span v-else>{{ seg.value }}</span>
            </template>
          </p>
          <p class="hint" style="margin-top: 10px">
            用 <code>parseEmojiText</code> 把 <code>[名称]</code> 切成片段。
            编辑器插的是标记，不是表情本身——表情包换了，历史内容不用动
          </p>
        </div>
      </div>
    </section>

    <section>
      <h3>尺寸</h3>
      <SrSegmented v-model="size" :options="sizeOptions" size="sm" />
      <div class="panel" :style="{ maxWidth: size === 'sm' ? '240px' : size === 'lg' ? '360px' : '300px' }">
        <SrEmojiPicker :packages="customPackages" :size="size" :columns="6" @select="onSelect" />
      </div>
    </section>

    <section>
      <h3>选中的标记</h3>
      <div class="row">
        <SrTag v-for="mark in picked" :key="mark" size="sm">{{ mark }}</SrTag>
        <span v-if="!picked.length" class="hint" style="margin: 0">还没选</span>
      </div>
      <p class="hint"><code>select</code> 事件同时给出表情项和标记文本，直接往输入框里插入即可</p>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

h3 {
  margin: 0 0 12px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 1.6;
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--sr-color-bg-sunken);
  font-family: var(--sr-font-family-mono);
  font-size: 11.5px;
}

.panel {
  max-width: 340px;
  padding: 12px;
  border: 1px dashed var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
}

.panel--wide {
  max-width: 340px;
}

.panel--tall {
  max-width: 340px;
}

.row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.side {
  flex: 1 1 240px;
  min-width: 0;
  padding: 12px;
  border: 1px dashed var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
}

.side__title {
  margin: 0 0 8px;
  color: var(--sr-color-text-secondary);
  font-size: 12px;
}

.side__text {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  color: var(--sr-color-text);
  font-size: 13px;
  line-height: 1.8;
}

.inline-emoji {
  width: 22px;
  height: 22px;
  vertical-align: -4px;
}

.inline-char {
  font-size: 16px;
  line-height: 1;
}
</style>
