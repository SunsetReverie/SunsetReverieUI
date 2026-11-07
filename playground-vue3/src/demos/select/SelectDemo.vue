<script setup lang="ts">
import { ref } from 'vue'
import { SrSelect } from '@sunset-reverie/ui'

defineOptions({ name: 'SelectDemo' })

const single = ref('a')
const multi = ref(['a'])
const searchable = ref('')

const options = [
  { value: 'a', label: '选项 A' },
  { value: 'b', label: '选项 B' },
  { value: 'c', label: '选项 C（禁用）', disabled: true },
  { value: 'd', label: '选项 D' },
]

const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'].map((n) => ({
  value: n,
  label: n,
}))
</script>

<template>
  <div class="demo">
    <section>
      <h3>单选与多选</h3>
      <div class="row">
        <SrSelect v-model="single" :options="options" style="width: 180px" />
        <SrSelect v-model="multi" :options="options" multiple style="width: 280px" />
      </div>
    </section>

    <section>
      <h3>可搜索（自动过滤）</h3>
      <div class="row">
        <SrSelect
          v-model="searchable"
          :options="cities"
          filterable
          placeholder="搜索城市"
          style="width: 180px"
        />
      </div>
    </section>

    <section>
      <h3>可清空与校验态</h3>
      <div class="row">
        <SrSelect v-model="single" :options="options" clearable style="width: 180px" />
        <SrSelect v-model="single" :options="options" status="error" style="width: 180px" />
      </div>
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
  flex-wrap: wrap;
  gap: 10px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}
</style>
