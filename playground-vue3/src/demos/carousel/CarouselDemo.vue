<script setup lang="ts">
import { ref } from 'vue'
import { SrCarousel } from '@sunset-reverie/ui'

defineOptions({ name: 'CarouselDemo' })

const slideA = ref(0)
const slideB = ref(0)

const slides = [
  { title: '落日橙', bg: 'linear-gradient(135deg, #ff7a45, #ff9a6b)' },
  { title: '霞紫', bg: 'linear-gradient(135deg, #7a64b5, #9a86cc)' },
  { title: '暮蓝', bg: 'linear-gradient(135deg, #4a6fd4, #6b8fe8)' },
]
</script>

<template>
  <div class="demo">
    <section>
      <h3>slide + 自动播放（悬停暂停）</h3>
      <SrCarousel v-model="slideA" :items="slides" :height="190" autoplay :interval="3000">
        <template #item="{ item, index }">
          <div class="slide" :style="{ background: item.bg }">
            <strong>{{ item.title }}</strong>
            <span>{{ index + 1 }} / {{ slides.length }}</span>
          </div>
        </template>
      </SrCarousel>
      <p class="hint">当前第 {{ slideA + 1 }} 张</p>
    </section>

    <section>
      <h3>fade + 不循环 + 指示器在外侧</h3>
      <SrCarousel
        v-model="slideB"
        :items="slides"
        effect="fade"
        :height="190"
        :loop="false"
        indicator-position="outside"
      >
        <template #item="{ item, index }">
          <div class="slide" :style="{ background: item.bg }">
            <strong>{{ item.title }}</strong>
            <span>{{ index + 1 }} / {{ slides.length }}（到末张停止）</span>
          </div>
        </template>
      </SrCarousel>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 22px;
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
</style>
