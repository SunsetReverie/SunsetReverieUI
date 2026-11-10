<script setup lang="ts">
import { computed, ref } from 'vue'
import { SrForm, SrFormItem, SrIcon, SrSelect, SrTag, type SrSelectOption } from '@sunset-reverie/ui'

defineOptions({ name: 'SelectDemo' })

/** 基础选项 */
const options: SrSelectOption[] = [
  { value: 'a', label: '选项 A' },
  { value: 'b', label: '选项 B' },
  { value: 'c', label: '选项 C（禁用）', disabled: true },
  { value: 'd', label: '选项 D' },
]

/** 城市 */
const cities: SrSelectOption[] = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'].map(
  (n) => ({
    value: n,
    label: n,
  }),
)

/** 带图标与描述的选项：SrSelectOption 允许附带自定义字段，#option 插槽直接读 */
const roles: SrSelectOption[] = [
  { value: 'owner', label: '所有者', icon: 'lucide:heart' },
  { value: 'editor', label: '编辑者', icon: 'lucide:pencil' },
  { value: 'viewer', label: '查看者', icon: 'lucide:eye' },
]

/** 长列表 */
const longList: SrSelectOption[] = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: `第 ${i + 1} 项数据`,
}))

/** 单选值 */
const single = ref<string | number>('a')

/** 多选值 */
const multi = ref<(string | number)[]>(['a', 'b'])

/** 搜索值 */
const searchable = ref<string | number>('')

/** 搜索关键字（用于展示事件） */
const keyword = ref('')

/** 角色 */
const role = ref<string | number>('editor')

/** 长列表选中 */
const longValue = ref<string | number>(3)

/** 空列表绑定值 */
const emptyValue = ref<string | number>('')

/** 尺寸演示 */
const sizeValue = ref<string | number>('a')

/** 禁用值 */
const disabledValue = ref<string | number>('b')

/** 事件日志 */
const logs = ref<string[]>([])

/** 表单模型 */
const formModel = ref({ city: '' })

/** 表单规则 */
const formRules = {
  city: [{ required: true, message: '请选择城市' }],
}

/**
 * 记录事件
 * @param text 日志内容
 */
function log(text: string): void {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  logs.value = [`${time}  ${text}`, ...logs.value].slice(0, 6)
}

/** 多选展示文案 */
const multiText = computed(() => (multi.value.length ? multi.value.join(', ') : '未选择'))
</script>

<template>
  <div class="demo">
    <section>
      <h3>单选与多选</h3>
      <div class="row">
        <div class="field">
          <span class="label">单选</span>
          <SrSelect v-model="single" :options="options" placeholder="请选择" />
        </div>
        <div class="field">
          <span class="label">多选</span>
          <SrSelect v-model="multi" :options="options" multiple placeholder="可多选" />
        </div>
      </div>
      <p class="hint">当前多选：{{ multiText }}</p>
    </section>

    <section>
      <h3>可搜索（本地过滤）</h3>
      <div class="field">
        <span class="label">搜索城市</span>
        <SrSelect
          v-model="searchable"
          :options="cities"
          filterable
          clearable
          placeholder="输入城市名"
          @search="keyword = $event"
        />
      </div>
      <p class="hint">
        输入关键字：<code>{{ keyword || '（空）' }}</code> —— 过滤在组件内部完成（对 <code>options</code> 的
        label 做 includes 匹配）
      </p>
    </section>

    <section>
      <h3>自定义选项（#option 插槽）</h3>
      <div class="field">
        <span class="label">角色</span>
        <SrSelect v-model="role" :options="roles">
          <template #option="{ option }">
            <span class="opt">
              <SrIcon :name="option.icon ?? ''" :size="14" />
              <span>{{ option.label }}</span>
            </span>
          </template>
        </SrSelect>
      </div>
      <p class="hint">插槽参数是 <code>{ option }</code>，可以加图标、徽标、说明文字</p>
    </section>

    <section>
      <h3>长列表（maxHeight）</h3>
      <div class="row">
        <div class="field">
          <span class="label">默认高度</span>
          <SrSelect v-model="longValue" :options="longList" filterable />
        </div>
        <div class="field">
          <span class="label">maxHeight = 200</span>
          <SrSelect v-model="longValue" :options="longList" :max-height="200" filterable />
        </div>
      </div>
      <p class="hint">60 项数据，超出高度后内部滚动；可搜索时搜索框固定在顶部</p>
    </section>

    <section>
      <h3>空状态文案（emptyText）</h3>
      <div class="row">
        <div class="field">
          <span class="label">默认文案</span>
          <SrSelect v-model="emptyValue" :options="[]" placeholder="没有选项" />
        </div>
        <div class="field">
          <span class="label">自定义文案</span>
          <SrSelect v-model="emptyValue" :options="[]" empty-text="还没有可选的部门" placeholder="没有选项" />
        </div>
      </div>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row">
        <div v-for="s in ['xs', 'sm', 'md', 'lg']" :key="s" class="field">
          <span class="label">{{ s }}</span>
          <SrSelect v-model="sizeValue" :options="options" :size="s as 'sm'" />
        </div>
      </div>
    </section>

    <section>
      <h3>禁用</h3>
      <div class="row">
        <div class="field">
          <span class="label">整体禁用</span>
          <SrSelect v-model="disabledValue" :options="options" disabled />
        </div>
        <div class="field">
          <span class="label">单项禁用（含 C 项）</span>
          <SrSelect v-model="single" :options="options" />
        </div>
      </div>
      <p class="hint">禁用的选项不可点、不可被键盘选中，跳过它自动落到下一项</p>
    </section>

    <section>
      <h3>校验态</h3>
      <div class="row">
        <div class="field">
          <span class="label">error</span>
          <SrSelect v-model="single" :options="options" status="error" />
        </div>
        <div class="field">
          <span class="label">warning</span>
          <SrSelect v-model="single" :options="options" status="warning" />
        </div>
      </div>
    </section>

    <section>
      <h3>事件</h3>
      <div class="row">
        <div class="field">
          <span class="label">打开 / 选择</span>
          <SrSelect
            v-model="single"
            :options="options"
            @change="log(`change: ${$event}`)"
            @visible-change="log(`visible-change: ${$event}`)"
            @search="log(`search: ${$event}`)"
          />
        </div>
        <div class="log">
          <p v-if="!logs.length" class="hint" style="margin: 0">操作上面的选择器，事件会记在这里</p>
          <p v-for="(line, i) in logs" :key="i" class="log__line">{{ line }}</p>
        </div>
      </div>
      <p class="hint">
        <code>change</code> 只带值；<code>visible-change</code> 带布尔；<code>search</code> 带输入的关键字
      </p>
    </section>

    <section>
      <h3>放进表单</h3>
      <div class="card">
        <SrForm :model="formModel" :rules="formRules" label-position="left" :label-width="72">
          <SrFormItem label="城市" prop="city">
            <SrSelect v-model="formModel.city" :options="cities" filterable placeholder="请选择城市" />
          </SrFormItem>
        </SrForm>
      </div>
      <p class="hint">选择器会把 change 通知给 FormItem，所以必填校验、错误态都能自动联动</p>
    </section>

    <section>
      <h3>和 RadioGroup 怎么选</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">SrSelect</span>
          <p class="hint" style="margin: 0">选项多（超过 6 个）、需要搜索、需要多选 —— 收起来省空间</p>
        </div>
        <div class="card">
          <span class="tag">SrRadioGroup</span>
          <div style="display: flex; gap: 8px">
            <SrTag size="sm">选项 A</SrTag>
            <SrTag size="sm" type="primary">选项 B</SrTag>
          </div>
          <p class="hint" style="margin: 8px 0 0">选项少、需要一眼看全 —— 展开更直观</p>
        </div>
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

.row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 200px;
}

.label {
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.opt {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.log {
  flex: 1 1 240px;
  min-width: 240px;
  padding: 10px 12px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: var(--sr-color-bg-sunken);
  font-family: var(--sr-font-family-mono);
  font-size: 11.5px;
  line-height: 1.9;
}

.log__line {
  margin: 0;
  color: var(--sr-color-text-secondary);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.card {
  padding: 14px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.tag {
  display: block;
  margin-bottom: 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}
</style>
