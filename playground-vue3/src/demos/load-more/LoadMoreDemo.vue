<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrLoadMore } from '@sunset-reverie/ui'

defineOptions({ name: 'LoadMoreDemo' })

const status = ref<'idle' | 'loading' | 'done'>('idle')

function load(): void {
  status.value = 'loading'
  setTimeout(() => {
    status.value = 'done'
  }, 900)
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>三态（点一下看过程）</h3>
      <SrLoadMore :status="status" @load="load" />
      <div class="row">
        <SrButton v-if="status === 'done'" size="xs" variant="text" @click="status = 'idle'">重置</SrButton>
        <span class="hint">当前状态：{{ status }}</span>
      </div>
    </section>

    <section>
      <h3>自定义文案</h3>
      <SrLoadMore status="idle" load-text="加载更多评论" loading-text="正在加载" done-text="已经到底啦" />
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
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}
.hint {
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
