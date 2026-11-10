<script setup lang="ts">
import { SrButton } from '@sunset-reverie/ui'

defineOptions({ name: 'EventLog' })

/** 事件日志的属性 */
interface EventLogProps {
  /** 已格式化的事件文本，最新一条排在最前 */
  events: string[]
  /** 标题 */
  title?: string
}

const props = withDefaults(defineProps<EventLogProps>(), {
  title: '事件日志',
})

const emit = defineEmits<{
  /** 请求清空日志 */
  clear: []
}>()
</script>

<template>
  <div class="event-log">
    <div class="event-log__head">
      <span class="event-log__title">{{ props.title }}</span>
      <span class="event-log__count">{{ props.events.length }} 条</span>
      <SrButton size="xs" variant="text" :disabled="!props.events.length" @click="emit('clear')">
        清空
      </SrButton>
    </div>

    <ul v-if="props.events.length" class="event-log__list">
      <li v-for="(event, index) in props.events" :key="`${event}-${index}`" class="event-log__item">
        <span class="event-log__dot" aria-hidden="true"></span>
        <code class="event-log__text">{{ event }}</code>
      </li>
    </ul>
    <p v-else class="event-log__empty">还没有事件，动一下上面的控件</p>
  </div>
</template>

<style scoped>
.event-log {
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px dashed var(--sr-color-border);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-sunken) 60%, transparent);
}

.event-log__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.event-log__title {
  color: var(--sr-color-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.event-log__count {
  margin-right: auto;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.event-log__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 140px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.event-log__item {
  display: flex;
  align-items: baseline;
  gap: 7px;
  min-width: 0;
}

.event-log__dot {
  flex: 0 0 auto;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--sr-color-primary);
}

.event-log__text {
  overflow: hidden;
  color: var(--sr-color-text-secondary);
  font-family: var(--sr-font-family-mono);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-log__empty {
  margin: 0;
  color: var(--sr-color-text-tertiary);
  font-size: 11.5px;
}
</style>
