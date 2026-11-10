<script setup lang="ts">
import {
  DEFAULT_EMOJI_PACKAGES,
  SrButton,
  SrInputNumber,
  SrSegmented,
  SrTag,
  SrTextarea,
} from '@sunset-reverie/ui'
import type { SrEmojiItem, SrTextareaBackgroundPosition } from '@sunset-reverie/ui'
import { computed, ref } from 'vue'

defineOptions({ name: 'TextareaDemo' })

/** 基础内容 */
const basic = ref('')

/** 背景演示内容 */
const withBg = ref('')

/** 富文本内容（v-model 收发的是标记文本） */
const rich = ref('这个输入框能内联渲染表情，[微笑] 这样的标记会被换成表情本身。')

/** 提交结果 */
const submitted = ref('')

/** 背景模式 */
const bgMode = ref<'none' | 'image' | 'text'>('text')

/** 背景模式选项 */
const bgOptions = [
  { label: '无背景', value: 'none' },
  { label: '背景图', value: 'image' },
  { label: '背景文字', value: 'text' },
]

/** 点阵背景图：内联 SVG，不依赖外网 */
const dotPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='3' cy='3' r='1.4' fill='%237c3aed' fill-opacity='0.18'/%3E%3C/svg%3E\")"

/** 背景文字字号 */
const bgTextSize = ref(40)

/** 背景落点 */
const bgPosition = ref<SrTextareaBackgroundPosition>('center')

/** 九宫格选项：只挑最常用的五个 */
const bgPositionOptions = [
  { label: '居中', value: 'center' },
  { label: '左上', value: 'top-left' },
  { label: '右上', value: 'top-right' },
  { label: '左下', value: 'bottom-left' },
  { label: '右下', value: 'bottom-right' },
]

/** 背景图 */
const backgroundImage = computed(() => (bgMode.value === 'image' ? dotPattern : ''))

/** 背景文字 */
const backgroundText = computed(() => (bgMode.value === 'text' ? '说点什么' : ''))

/** 快选表情 */
const emojiPackages = DEFAULT_EMOJI_PACKAGES

/** 面部包前 10 个，够演示一阵子 */
const quickEmojis = DEFAULT_EMOJI_PACKAGES[0]?.emojis.slice(0, 10) ?? []

/** 富文本框实例 */
const richRef = ref<InstanceType<typeof SrTextarea> | null>(null)

/**
 * 插入一个表情
 * @param item 表情项
 */
function pickEmoji(item: SrEmojiItem): void {
  richRef.value?.insertEmoji(item)
}

/**
 * 提交
 * @param value 当前内容
 */
function onSubmit(value: string): void {
  submitted.value = value
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <SrTextarea v-model="basic" placeholder="写点什么……" :maxlength="200" show-count />
      <p class="hint">
        高度随内容自适应，到 <code>maxRows</code> 后转为内部滚动。字数按用户看到的字符算—— 一个表情标记只算 1
        个字。
      </p>
    </section>

    <section>
      <h3>背景图 / 背景文字</h3>
      <div class="row">
        <SrSegmented v-model="bgMode" :options="bgOptions" size="sm" />
        <SrTag size="sm">背景层不挡点击</SrTag>
      </div>
      <div class="row">
        <SrSegmented v-model="bgPosition" :options="bgPositionOptions" size="sm" />
        <SrInputNumber v-model="bgTextSize" :min="12" :max="120" :step="4" size="sm" style="width: 130px" />
        <span class="row-label">字号 px</span>
      </div>
      <SrTextarea
        v-model="withBg"
        :rows="4"
        :background-image="backgroundImage"
        :background-text="backgroundText"
        :background-position="bgPosition"
        :background-text-size="bgTextSize"
        placeholder="背景只是装饰，内容照常输入"
      />
      <p class="hint">
        背景铺在内容下层（<code>pointer-events: none</code>），既不抢焦点也不参与选中。
        <code>backgroundPosition</code> 是九宫格（这里演示五个常用角），图片与文字共用；
        <code>backgroundTextSize</code> 调字号，<code>backgroundSize</code> 调图片尺寸。
      </p>
    </section>

    <section>
      <h3>内联表情（富文本模式）</h3>
      <SrTextarea
        ref="richRef"
        v-model="rich"
        :emoji-packages="emojiPackages"
        :rows="4"
        :maxlength="500"
        show-count
      >
        <template #footer="{ submit }">
          <button
            v-for="item in quickEmojis"
            :key="item.name"
            type="button"
            class="emoji-btn"
            :title="item.name"
            @click="pickEmoji(item)"
          >
            {{ item.char }}
          </button>
          <SrButton size="sm" @click="submit()">发表</SrButton>
        </template>
      </SrTextarea>
      <p class="hint">
        传了 <code>emoji-packages</code> 才进富文本模式：输入区变成 <code>contenteditable</code>， 表情按
        <code>char</code> / <code>url</code> 内联渲染，而 <code>v-model</code> 收发的仍是
        <code>[微笑]</code> 这种标记文本，直接存库就行。
      </p>
      <p class="hint">当前值：{{ rich }}</p>
    </section>

    <section>
      <h3>回车提交</h3>
      <SrTextarea
        v-model="basic"
        :rows="2"
        submit-on-enter
        placeholder="Enter 提交，Shift + Enter 换行"
        @submit="onSubmit"
      >
        <template #footer="{ submit }">
          <SrButton size="sm" variant="primary" @click="submit()">发表</SrButton>
        </template>
      </SrTextarea>
      <p class="hint">最近一次提交：{{ submitted || '（还没提交）' }}</p>
    </section>

    <section>
      <h3>状态与尺寸</h3>
      <SrTextarea v-model="basic" size="sm" :rows="2" placeholder="sm 尺寸" />
      <SrTextarea v-model="basic" size="lg" :rows="3" placeholder="lg 尺寸" />
      <SrTextarea v-model="basic" :rows="2" status="error" placeholder="error 状态" />
      <SrTextarea v-model="basic" :rows="2" disabled placeholder="禁用" />
      <SrTextarea v-model="basic" :rows="2" readonly placeholder="只读" />
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.demo section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hint {
  color: var(--sr-color-text-tertiary);
  font-size: 12.5px;
  line-height: 1.7;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.row-label {
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.emoji-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.16s ease;
}

.emoji-btn:hover {
  background: var(--sr-color-bg-sunken);
}
</style>
