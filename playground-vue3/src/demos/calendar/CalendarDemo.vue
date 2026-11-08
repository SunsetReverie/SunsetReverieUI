<script setup lang="ts">
import { computed, ref } from 'vue'
import { SrCalendar, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'CalendarDemo' })

/** 当前选中 */
const picked = ref('2026-11-09')

/** 带事件的日期 */
const eventDays = ['2026-11-03', '2026-11-12', '2026-11-18', '2026-11-25']

/** 限定范围 */
const ranged = ref('2026-11-15')

/** 周日开头的星期 */
const sundayFirst = ref('2026-11-01')

/** 本月事件坐标 */
const eventMap: Record<string, string> = {
  '2026-11-03': '需求评审',
  '2026-11-12': '版本发布',
  '2026-11-18': '客户拜访',
  '2026-11-25': '月度复盘',
}

/** 选中日期当天的事件 */
const pickedEvent = computed(() => eventMap[picked.value] ?? '')
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <div class="row">
        <div style="width: 340px">
          <SrCalendar v-model="picked" />
        </div>
        <div class="side">
          <p class="hint" style="margin: 0">
            选中：<code>{{ picked || '未选' }}</code>
          </p>
          <p v-if="pickedEvent" class="hint" style="margin: 6px 0 0">
            当天事件：<SrTag size="sm" type="primary">{{ pickedEvent }}</SrTag>
          </p>
          <p class="hint" style="margin: 10px 0 0">
            它和 DatePicker 的区别：日历常驻显示、不弹层，占一张卡片的位置
          </p>
        </div>
      </div>
    </section>

    <section>
      <h3>日期标记（marks）</h3>
      <div class="row">
        <div style="width: 340px">
          <SrCalendar v-model="picked" :marks="eventDays" />
        </div>
        <p class="hint" style="margin: 0; max-width: 260px">
          有事件的日期下方带一个小点。<code>marks</code> 传日期字符串数组，用于「哪些天有内容」的快速预览。
        </p>
      </div>
    </section>

    <section>
      <h3>可选范围（min / max）</h3>
      <div class="row">
        <div style="width: 340px">
          <SrCalendar v-model="ranged" min="2026-11-10" max="2026-11-20" />
        </div>
        <p class="hint" style="margin: 0; max-width: 260px">
          只允许选 10～20 号，范围外的日期变灰且点了没反应。
        </p>
      </div>
    </section>

    <section>
      <h3>每周起始日</h3>
      <div class="row">
        <div class="cal-item">
          <SrCalendar v-model="picked" :first-day-of-week="1" :show-today="false" :cell-height="38" />
          <span class="label">firstDayOfWeek = 1（周一）</span>
        </div>
        <div class="cal-item">
          <SrCalendar v-model="sundayFirst" :first-day-of-week="0" :show-today="false" :cell-height="38" />
          <span class="label">firstDayOfWeek = 0（周日）</span>
        </div>
      </div>
      <p class="hint">国际化差异：国内习惯周一起，部分海外产品用周日起</p>
    </section>

    <section>
      <h3>格子高度</h3>
      <div class="row">
        <div class="cal-item">
          <SrCalendar v-model="picked" :cell-height="32" :show-today="false" />
          <span class="label">cellHeight = 32</span>
        </div>
        <div class="cal-item">
          <SrCalendar v-model="picked" :cell-height="56" :show-today="false" />
          <span class="label">cellHeight = 56</span>
        </div>
      </div>
      <p class="hint">格子更高时能塞下事件标题，适合当排期表用</p>
    </section>

    <section>
      <h3>本月事件</h3>
      <div class="card">
        <p class="card__title">2026 年 11 月</p>
        <div v-for="(name, date) in eventMap" :key="date" class="event-row">
          <span class="event-date">{{ date.slice(5) }}</span>
          <span class="event-name">{{ name }}</span>
        </div>
      </div>
      <p class="hint">日历负责「哪几天有东西」，具体列表还是要在下面列出来</p>
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

.side {
  flex: 1 1 240px;
  min-width: 220px;
}

.cal-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 300px;
}

.label {
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
  text-align: center;
}

.card {
  padding: 16px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
  max-width: 340px;
}

.card__title {
  margin: 0 0 10px;
  color: var(--sr-color-text);
  font-size: 13px;
  font-weight: 600;
}

.event-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px 0;
  border-top: 1px solid var(--sr-color-border-subtle);
  font-size: 13px;
}

.event-date {
  flex: 0 0 52px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.event-name {
  color: var(--sr-color-text);
}
</style>
