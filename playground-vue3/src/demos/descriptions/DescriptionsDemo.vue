<script setup lang="ts">
import { computed, ref } from 'vue'
import { SrButton, SrDescriptions, SrTag, type SrDescriptionItem } from '@sunset-reverie/ui'

defineOptions({ name: 'DescriptionsDemo' })

/** 尺寸档位：写在脚本里让 TS 推成字面量类型，模板里不需要类型断言 */
const sizes = ['sm', 'md', 'lg'] as const

/** 基础信息 */
const basicItems: SrDescriptionItem[] = [
  { label: '姓名', value: '林深' },
  { label: '工号', value: 'SR-2026-018' },
  { label: '部门', value: '设计工程' },
  { label: '职级', value: 'P7' },
  { label: '入职时间', value: '2024-03-12' },
  { label: '状态', value: '在职' },
]

/** 带跨列的 */
const spanItems: SrDescriptionItem[] = [
  { label: '订单号', value: '20261108001' },
  { label: '下单时间', value: '2026-11-08 14:32' },
  { label: '支付方式', value: '对公转账' },
  { label: '收货地址', value: '浙江省杭州市西湖区文三路 100 号 A 座 1801 室', span: 3 },
  { label: '备注', value: '工作日送达，提前电话联系', span: 3 },
]

/** 列数 */
const column = ref(3)

/** 边框模式 */
const bordered = ref(false)

/** 大屏订单信息 */
const orderItems = computed<SrDescriptionItem[]>(() => [
  { label: '订单编号', value: 'SR2026110800012' },
  { label: '客户', value: '夕梦科技' },
  { label: '金额', value: '¥ 128,000.00' },
  { label: '状态', value: '已支付' },
])
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础用法</h3>
      <SrDescriptions :items="basicItems" />
      <p class="hint">默认 3 列，字段名后面自动跟冒号，不用手写</p>
    </section>

    <section>
      <h3>列数与边框</h3>
      <div class="row" style="margin-bottom: 14px">
        <span class="label">列数</span>
        <SrButton
          v-for="c in [1, 2, 3, 4]"
          :key="c"
          size="xs"
          :variant="column === c ? 'primary' : 'outline'"
          @click="column = c"
        >
          {{ c }}
        </SrButton>
        <SrButton size="xs" :variant="bordered ? 'primary' : 'outline'" @click="bordered = !bordered">
          {{ bordered ? '带边框' : '无边框' }}
        </SrButton>
      </div>
      <SrDescriptions :items="basicItems" :column="column" :border="bordered" />
      <p class="hint">边框模式是表格观感，字段名有独立底色，信息密度更高</p>
    </section>

    <section>
      <h3>跨列（span）</h3>
      <SrDescriptions :items="spanItems" :column="3" border />
      <p class="hint">地址和备注给 span: 3 占满整行，避免长文本挤在窄格里反复换行</p>
    </section>

    <section>
      <h3>上下排（direction = vertical）</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">无边框</span>
          <SrDescriptions :items="basicItems.slice(0, 4)" :column="2" direction="vertical" />
        </div>
        <div class="card">
          <span class="tag">带边框</span>
          <SrDescriptions :items="basicItems.slice(0, 4)" :column="2" direction="vertical" border />
        </div>
      </div>
      <p class="hint">字段名在上、值在下，适合值很长或者列数少的情况</p>
    </section>

    <section>
      <h3>固定字段名宽度</h3>
      <div class="stack">
        <div v-for="w in [60, 90, 120]" :key="w" class="size-row">
          <span class="size-row__label">{{ w }}px</span>
          <SrDescriptions :items="basicItems.slice(0, 4)" :column="2" :label-width="w" />
        </div>
      </div>
      <p class="hint">不传时按内容自适应；固定宽度能让多行字段名左对齐，看着更齐</p>
    </section>

    <section>
      <h3>标题与操作</h3>
      <SrDescriptions :items="orderItems" :column="4" title="订单详情">
        <template #extra>
          <div class="row">
            <SrTag type="success" size="sm">已支付</SrTag>
            <SrButton size="xs" variant="outline">导出</SrButton>
          </div>
        </template>
      </SrDescriptions>
      <p class="hint">extra 插槽放在右上角，通常放状态标签或操作按钮</p>
    </section>

    <section>
      <h3>自定义值（插槽）</h3>
      <SrDescriptions :items="basicItems.slice(0, 4)" :column="2">
        <template #value="{ item }">
          <SrTag v-if="item.label === '状态'" type="success" size="sm">{{ item.value }}</SrTag>
          <strong v-else-if="item.label === '姓名'" style="color: var(--sr-color-primary-text)">
            {{ item.value }}
          </strong>
          <span v-else>{{ item.value }}</span>
        </template>
      </SrDescriptions>
      <p class="hint">value 插槽能按字段渲染不同内容，比如状态用标签、金额加粗</p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="stack">
        <div v-for="s in sizes" :key="s" class="size-row">
          <span class="size-row__label">{{ s }}</span>
          <SrDescriptions :items="basicItems.slice(0, 3)" :column="3" :size="s" border />
        </div>
      </div>
    </section>

    <section>
      <h3>组合：详情页卡片</h3>
      <div class="card">
        <SrDescriptions :items="orderItems" :column="2" title="基本信息">
          <template #extra>
            <SrButton size="xs" variant="text">编辑</SrButton>
          </template>
        </SrDescriptions>

        <div class="divider" />

        <SrDescriptions
          :items="[
            { label: '创建人', value: '林深' },
            { label: '创建时间', value: '2026-11-08 10:12' },
            { label: '最后修改', value: '2026-11-08 14:30' },
            { label: '备注', value: '客户要求月底前交付', span: 2 },
          ]"
          :column="2"
          title="其他信息"
        />
      </div>
      <p class="hint">一个卡片里放两组 Descriptions，用分隔线断开——详情页最常见的排法</p>
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

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.label {
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}

.card {
  padding: 14px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.tag {
  display: block;
  margin-bottom: 12px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.size-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.size-row__label {
  flex: 0 0 56px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 22px;
}

.divider {
  height: 1px;
  margin: 16px 0;
  background: var(--sr-color-border-subtle);
}
</style>
