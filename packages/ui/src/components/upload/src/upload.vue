<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import SrProgress from '../../progress/src/progress.vue'
import { uploadProps, type SrUploadFile } from './upload'

defineOptions({ name: 'SrUpload' })

const props = defineProps(uploadProps)

const emit = defineEmits<{
  /** 文件列表变化，配合 v-model:files */
  'update:files': [files: SrUploadFile[]]
  /** 新增或删除时触发 */
  change: [files: SrUploadFile[], file?: SrUploadFile]
  /** 单个文件上传成功 */
  success: [file: SrUploadFile, url?: string]
  /** 单个文件上传失败 */
  error: [file: SrUploadFile, reason: string]
  /** 超出数量上限 */
  exceed: [maxCount: number]
}>()

defineSlots<{
  /** 完全自定义触发区 */
  trigger?: () => unknown
  /** 只替换拖拽区图标 */
  icon?: () => unknown
}>()

/** 当前文件列表：以外部传入的为初始值，之后由组件自己维护 */
const files = ref<SrUploadFile[]>([...props.files])

/** 隐藏的原生 input */
const inputRef = ref<HTMLInputElement>()

/** 是否正拖拽悬停 */
const dragOver = ref(false)

/** 预览中的图片地址 */
const previewUrl = ref('')

/** id 种子 */
let seed = 0

// 外部改了列表（例如编辑页异步拿到已有文件）时同步进来
watch(
  () => props.files,
  (next) => {
    const sameLength = next.length === files.value.length
    const sameIds = next.every((file, index) => file.uid === files.value[index]?.uid)
    if (sameLength && sameIds) return
    files.value = [...next]
  },
)

/** 是否达到数量上限 */
const reachLimit = computed(() => props.maxCount > 0 && files.value.length >= props.maxCount)

/** 拖拽区是否可交互 */
const interactive = computed(() => !props.disabled && !reachLimit.value)

/** 按钮形态 */
const isButton = computed(() => props.triggerType === 'button')

/**
 * 字节数转可读大小
 * @param size 字节
 * @returns 展示文本
 */
function readableSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

/**
 * 判断文件是否匹配 accept
 * @param file 文件
 * @returns 是否允许
 */
function matchAccept(file: File): boolean {
  if (!props.accept) return true

  return props.accept.split(',').some((rule) => {
    const item = rule.trim().toLowerCase()
    if (!item) return false
    if (item.startsWith('.')) return file.name.toLowerCase().endsWith(item)
    if (item.endsWith('/*')) return file.type.startsWith(item.slice(0, -1))
    return file.type.toLowerCase() === item
  })
}

/** 同步给外部 */
function sync(): void {
  emit('update:files', [...files.value])
}

/** 触发选择文件 */
function openPicker(): void {
  if (!interactive.value) return
  inputRef.value?.click()
}

/**
 * 加入文件列表
 *
 * 校验顺序：类型 → 大小 → 数量。先拦掉不可能成功的文件，
 * 免得用户看到列表里出现又立刻消失的条目。
 * @param list 新选的文件
 */
function addFiles(list: FileList | File[]): void {
  const incoming = [...list]
  if (!incoming.length) return

  const accepted: SrUploadFile[] = []

  for (const file of incoming) {
    if (!matchAccept(file)) {
      emit(
        'error',
        { uid: '', name: file.name, size: file.size, type: file.type, status: 'error', percent: 0 },
        '文件类型不符合要求',
      )
      continue
    }

    if (props.maxSize > 0 && file.size > props.maxSize * 1024 * 1024) {
      emit(
        'error',
        { uid: '', name: file.name, size: file.size, type: file.type, status: 'error', percent: 0 },
        `文件超过 ${props.maxSize}MB`,
      )
      continue
    }

    if (props.maxCount > 0 && files.value.length + accepted.length >= props.maxCount) {
      emit('exceed', props.maxCount)
      break
    }

    seed += 1
    accepted.push({
      uid: `sr-upload-${seed}`,
      name: file.name,
      size: file.size,
      type: file.type,
      // 图片用 objectURL 做本地预览；其它类型没有缩略图
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'ready',
      percent: 0,
      raw: file,
    })
  }

  if (!accepted.length) return

  files.value = [...files.value, ...accepted]
  sync()
  emit('change', [...files.value], accepted[0])

  if (props.autoUpload && props.httpRequest) {
    accepted.forEach((item) => void startUpload(item))
  }
}

/**
 * 执行上传
 *
 * 进度来自 httpRequest 的回调；函数抛错即视为失败，列表保留以便重试。
 * @param input 待上传条目
 */
async function startUpload(input: SrUploadFile): Promise<void> {
  // 回显的历史文件只有 url、没有 raw，不该再发一次请求
  if (!props.httpRequest || !input.raw) {
    if (!input.raw && input.status === 'ready') input.status = 'success'
    return
  }

  // 必须操作 files 里的那份：它才是被 Vue 代理过的响应式对象，
  // 直接改外部传入的引用不会触发视图更新
  const file = files.value.find((item) => item.uid === input.uid) ?? input

  file.status = 'uploading'
  file.percent = 0
  file.error = undefined

  try {
    const url = await props.httpRequest(input.raw, (percent) => {
      file.percent = Math.max(0, Math.min(100, Math.round(percent)))
    })

    file.status = 'success'
    file.percent = 100
    if (typeof url === 'string' && url) file.url = url
    emit('success', file, url ?? undefined)
  } catch (error) {
    file.status = 'error'
    file.error = error instanceof Error ? error.message : '上传失败'
    emit('error', file, file.error)
  } finally {
    sync()
  }
}

/**
 * 手动重试
 * @param file 条目
 */
function retry(file: SrUploadFile): void {
  if (props.disabled || !props.httpRequest) return
  void startUpload(file)
}

/**
 * 是否允许移除
 *
 * 上传中的文件不能删：请求还在跑，进度回调会去改一份已不在列表里的数据。
 * @param file 条目
 * @returns 是否可移除
 */
function canRemove(file: SrUploadFile): boolean {
  return !props.disabled && file.status !== 'uploading'
}

/**
 * 移除条目
 * @param file 条目
 */
function remove(file: SrUploadFile): void {
  if (!canRemove(file)) return
  const index = files.value.indexOf(file)
  if (index < 0) return

  if (file.url?.startsWith('blob:')) URL.revokeObjectURL(file.url)
  files.value = files.value.filter((item) => item !== file)
  sync()
  emit('change', [...files.value], file)
}

/** 选择完成 */
function onInputChange(event: Event): void {
  const input = event.target as HTMLInputElement
  if (input.files) addFiles(input.files)
  // 允许重复选择同一个文件
  input.value = ''
}

/** 拖入 */
function onDragOver(event: DragEvent): void {
  if (!interactive.value) return
  event.preventDefault()
  if (props.draggable && !isButton.value) dragOver.value = true
}

/** 拖出 */
function onDragLeave(): void {
  dragOver.value = false
}

/** 放下 */
function onDrop(event: DragEvent): void {
  dragOver.value = false
  if (!interactive.value || !props.draggable || isButton.value) return
  event.preventDefault()

  const dropped = event.dataTransfer?.files
  if (dropped?.length) addFiles(dropped)
}

/** 打开大图预览 */
function preview(file: SrUploadFile): void {
  if (file.type.startsWith('image/') && file.url) previewUrl.value = file.url
}

/**
 * 手动添加（暴露给外部，配合 autoUpload=false）
 * @param list 文件
 */
function submit(list?: File[]): void {
  if (list?.length) addFiles(list)
}

/** 清空列表 */
function clear(): void {
  files.value.forEach((file) => {
    if (file.url?.startsWith('blob:')) URL.revokeObjectURL(file.url)
  })
  files.value = []
  sync()
  emit('change', [])
}

defineExpose({ submit, clear, files })
</script>

<template>
  <div
    class="sr-upload"
    :class="[`sr-upload--${listType}`, `sr-upload--${triggerType}`, { 'is-disabled': disabled }]"
  >
    <input
      ref="inputRef"
      class="sr-upload__input"
      type="file"
      :accept="accept || undefined"
      :multiple="multiple"
      tabindex="-1"
      @change="onInputChange"
    />

    <!-- 按钮形态：紧凑的「+ 选择文件」 -->
    <button
      v-if="isButton"
      class="sr-upload__btn"
      :class="{ 'is-disabled': !interactive }"
      type="button"
      :disabled="!interactive"
      @click="openPicker"
    >
      <slot name="icon">
        <SrIcon v-if="icon" :name="icon" :size="14" />
      </slot>
      {{ reachLimit ? `最多 ${maxCount} 个文件` : buttonText }}
    </button>

    <!-- 区域形态：大块拖拽区 -->
    <div
      v-else
      class="sr-upload__trigger"
      :class="{ 'is-dragover': dragOver, 'is-disabled': !interactive }"
      role="button"
      :tabindex="interactive ? 0 : -1"
      :aria-disabled="!interactive"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <slot name="trigger">
        <slot name="icon">
          <SrIcon v-if="icon && !(draggable && dragOver)" class="sr-upload__icon" :name="icon" :size="22" />
          <SrIcon
            v-else-if="draggable && dragOver"
            class="sr-upload__icon"
            name="lucide:download"
            :size="22"
          />
        </slot>
        <span class="sr-upload__text">
          {{ reachLimit ? `最多 ${maxCount} 个文件` : dragOver ? '松开即可上传' : dragText }}
        </span>
        <span v-if="tip" class="sr-upload__tip">{{ tip }}</span>
      </slot>
    </div>

    <ul v-if="showFileList && files.length" class="sr-upload__list">
      <li v-for="file in files" :key="file.uid" class="sr-upload__item" :class="`is-${file.status}`">
        <button
          v-if="listType === 'card'"
          class="sr-upload__thumb"
          type="button"
          :aria-label="`预览 ${file.name}`"
          @click="preview(file)"
        >
          <img v-if="file.url" :src="file.url" :alt="file.name" />
          <SrIcon v-else name="lucide:box" :size="18" />
        </button>

        <div class="sr-upload__info">
          <!-- 成功且有地址时渲染成链接，回显场景可以直接下载 -->
          <a
            v-if="file.status === 'success' && file.url"
            class="sr-upload__name sr-upload__name--link"
            :href="file.url"
            target="_blank"
            rel="noopener noreferrer"
            :title="file.name"
          >
            {{ file.name }}
          </a>
          <span v-else class="sr-upload__name" :title="file.name">{{ file.name }}</span>

          <span class="sr-upload__meta">
            <template v-if="file.status === 'error'">{{ file.error || '上传失败' }}</template>
            <template v-else>{{ readableSize(file.size) }}</template>
          </span>

          <SrProgress
            v-if="file.status === 'uploading'"
            class="sr-upload__progress"
            :percent="file.percent"
            :stroke-width="3"
            :show-text="false"
          />
        </div>

        <span
          v-if="file.status === 'success'"
          class="sr-upload__status sr-upload__status--ok"
          aria-label="上传成功"
        >
          <SrIcon name="lucide:check" :size="14" />
        </span>
        <button
          v-else-if="file.status === 'error'"
          class="sr-upload__action"
          type="button"
          :disabled="disabled"
          aria-label="重试"
          @click="retry(file)"
        >
          <SrIcon name="lucide:settings" :size="14" />
        </button>

        <button
          class="sr-upload__action"
          type="button"
          :disabled="!canRemove(file)"
          :title="file.status === 'uploading' ? '上传中不可移除' : '移除'"
          aria-label="移除"
          @click="remove(file)"
        >
          <SrIcon name="lucide:x" :size="14" />
        </button>
      </li>
    </ul>
  </div>

  <Teleport to="body">
    <div v-if="previewUrl" class="sr-upload__preview" @click="previewUrl = ''">
      <img :src="previewUrl" alt="预览" />
    </div>
  </Teleport>
</template>
