<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrCarousel } from '@sunset-reverie/ui'

defineOptions({ name: 'CarouselDemo' })

const basic = ref(0)
const looped = ref(0)
const vertical = ref(0)
const featured = ref(0)
const fadeMode = ref(0)

/** 基础色块 */
const slides = [
  { title: '落日橙', bg: 'linear-gradient(135deg, #ff7a45, #ff9a6b)' },
  { title: '霞紫', bg: 'linear-gradient(135deg, #7a64b5, #9a86cc)' },
  { title: '暮蓝', bg: 'linear-gradient(135deg, #4a6fd4, #6b8fe8)' },
]

/** 文章数据：封面用渐变模拟图片，真实项目换成 img */
const articles = [
  {
    title: '用三层 Token 撑起两套视觉',
    author: '林深',
    date: '11-06',
    cover: 'linear-gradient(135deg, #ff7a45, #ffb26b)',
    tag: '设计系统',
  },
  {
    title: 'SSR 水合不一致的排查清单',
    author: '周夏',
    date: '11-05',
    cover: 'linear-gradient(135deg, #7a64b5, #a78bfa)',
    tag: '工程实践',
  },
  {
    title: '组件库里的动效该怎么收敛',
    author: '陈默',
    date: '11-04',
    cover: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
    tag: '动效',
  },
]

/** 纵向轮播的内容 */
const verticals = [
  { title: '待处理缺陷', value: '12', bg: 'linear-gradient(135deg, #ef4444, #f87171)' },
  { title: '本周发布', value: '6', bg: 'linear-gradient(135deg, #10b981, #34d399)' },
  { title: '组件总数', value: '35', bg: 'linear-gradient(135deg, #3e3edc, #6b6bee)' },
]
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础（自动播放，悬停暂停）</h3>
      <SrCarousel v-model="basic" :items="slides" :height="200" autoplay :interval="3000">
        <template #item="{ item, index }">
          <div class="slide" :style="{ background: item.bg }">
            <strong>{{ item.title }}</strong>
            <span>{{ index + 1 }} / {{ slides.length }}</span>
          </div>
        </template>
      </SrCarousel>
      <p class="hint">当前第 {{ basic + 1 }} 张；可以用鼠标拖动切换，手机上用手指滑</p>
    </section>

    <section>
      <h3>循环播放（末张之后回到第一张）</h3>
      <SrCarousel v-model="looped" :items="slides" :height="160" loop>
        <template #item="{ item, index }">
          <div class="slide" :style="{ background: item.bg }">
            <strong>{{ item.title }}</strong>
            <span>第 {{ index + 1 }} 张，拖到最右会回到第 1 张</span>
          </div>
        </template>
      </SrCarousel>
      <p class="hint">loop 默认就是开启的；关掉后首尾两张的对应箭头会禁用</p>
    </section>

    <section>
      <h3>纵向轮播（direction = vertical）</h3>
      <SrCarousel v-model="vertical" :items="verticals" :height="180" direction="vertical">
        <template #item="{ item }">
          <div class="stat" :style="{ background: item.bg }">
            <span class="stat__value">{{ item.value }}</span>
            <span class="stat__label">{{ item.title }}</span>
          </div>
        </template>
      </SrCarousel>
      <p class="hint">拖动轴、箭头方向、键盘（上下键）都会跟着转；指示器移到右侧竖排</p>
    </section>

    <section>
      <h3>封面内容层（#overlay 插槽）</h3>
      <SrCarousel v-model="featured" :items="articles" :height="240">
        <template #item="{ item }">
          <div class="cover" :style="{ background: item.cover }" />
        </template>

        <template #overlay="{ item }">
          <span class="cover__tag">{{ item.tag }}</span>
          <h4 class="cover__title">{{ item.title }}</h4>
          <div class="cover__meta">
            <span>{{ item.author }}</span>
            <span class="cover__dot">·</span>
            <span>{{ item.date }}</span>
          </div>
        </template>
      </SrCarousel>
      <p class="hint">overlay 是独立插槽，会跟着每张图一起滑动；底部有渐变压暗，浅色封面上的白字也能看清</p>
    </section>

    <section>
      <h3>淡入淡出 + 指示器在外侧</h3>
      <SrCarousel
        v-model="fadeMode"
        :items="articles"
        effect="fade"
        :height="220"
        indicator-position="outside"
      >
        <template #item="{ item }">
          <div class="cover" :style="{ background: item.cover }" />
        </template>

        <template #overlay="{ item }">
          <h4 class="cover__title">{{ item.title }}</h4>
          <div class="cover__meta">{{ item.author }} · {{ item.date }}</div>
        </template>
      </SrCarousel>
    </section>

    <section>
      <h3>关闭拖动 / 关闭触摸</h3>
      <div class="row">
        <div style="flex: 1; min-width: 240px">
          <span class="tag">draggable = false（鼠标拖不动）</span>
          <SrCarousel :items="slides" :height="120" :draggable="false" :autoplay="false">
            <template #item="{ item }">
              <div class="slide" :style="{ background: item.bg }">
                <strong>{{ item.title }}</strong>
              </div>
            </template>
          </SrCarousel>
        </div>

        <div style="flex: 1; min-width: 240px">
          <span class="tag">touchable = false（触摸不响应）</span>
          <SrCarousel :items="slides" :height="120" :touchable="false" :autoplay="false">
            <template #item="{ item }">
              <div class="slide" :style="{ background: item.bg }">
                <strong>{{ item.title }}</strong>
              </div>
            </template>
          </SrCarousel>
        </div>
      </div>
      <p class="hint">两者独立控制：只允许触摸的设备可以关掉鼠标拖动，反之亦然</p>
    </section>

    <section>
      <h3>操作</h3>
      <div class="row">
        <SrButton size="sm" variant="outline" @click="basic = (basic + 1) % slides.length"
          >下一张（外部控制）</SrButton
        >
        <span class="hint">v-model 是双向的，外部也能改</span>
      </div>
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
  margin: 0 0 10px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}
.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
.row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}
.tag {
  display: block;
  margin-bottom: 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 100%;
  color: #fff;
}

.slide strong {
  font-size: 20px;
}
.slide span {
  font-size: 12px;
  opacity: 0.85;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  color: #fff;
}

.stat__value {
  font-size: 34px;
  font-weight: 600;
  line-height: 1;
}
.stat__label {
  font-size: 12px;
  opacity: 0.9;
}

/* 封面：真实项目里换成 <img> 或背景图 */
.cover {
  width: 100%;
  height: 100%;
}

.cover__tag {
  align-self: flex-start;
  margin-bottom: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgb(255 255 255 / 22%);
  font-size: 11px;
}

.cover__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.cover__meta {
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.85;
}

.cover__dot {
  margin: 0 6px;
}
</style>
