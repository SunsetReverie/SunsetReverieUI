<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrUpload, srToast, type SrUploadFile, type SrUploadRequest } from '@sunset-reverie/ui'

defineOptions({ name: 'UploadDemo' })

/**
 * 模拟上传：每 120ms 涨 10%，3% 概率失败
 *
 * 真实项目里换成 fetch / axios，把 onProgress 绑到上传进度事件即可。
 */
const mockRequest: SrUploadRequest = (file, onProgress) =>
  new Promise((resolve, reject) => {
    let percent = 0
    const timer = setInterval(() => {
      percent += 10
      onProgress(Math.min(percent, 100))

      if (percent >= 100) {
        clearInterval(timer)
        if (Math.random() < 0.15) reject(new Error('网络抖动，请重试'))
        else resolve(URL.createObjectURL(file))
      }
    }, 120)
  })

/** 回显的已有文件：服务端只给了 url，没有 raw */
const existing = ref<SrUploadFile[]>([
  {
    uid: 'old-1',
    name: '季度报告.pdf',
    size: 2.3 * 1024 * 1024,
    type: 'application/pdf',
    url: 'https://example.com/report.pdf',
    status: 'success',
    percent: 100,
  },
  {
    uid: 'old-2',
    name: '团队合影.jpg',
    size: 1 * 1024 * 1024,
    type: 'image/jpeg',
    url: 'https://example.com/team.jpg',
    status: 'success',
    percent: 100,
  },
])

/** 单文件场景 */
const singleFiles = ref<SrUploadFile[]>([])

/** 手动模式下的文件列表 */
const manualFiles = ref<SrUploadFile[]>([])
const manualRef = ref<InstanceType<typeof SrUpload>>()

function submitManual(): void {
  const pending = manualFiles.value.filter((file) => file.status === 'ready')
  if (!pending.length) {
    srToast.warning('还没有待上传的文件')
    return
  }
  srToast.success(`模拟提交 ${pending.length} 个文件`)
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础（点击或拖拽，自动上传）</h3>
      <SrUpload :http-request="mockRequest" multiple tip="单个文件不超过 10MB" />
      <p class="hint">拖拽时边框变实线、文案变成「松开即可上传」；上传中显示进度条</p>
    </section>

    <section>
      <h3>数量限制（最多 3 个）</h3>
      <SrUpload :http-request="mockRequest" multiple :max-count="3" tip="达到上限后拖拽区置灰" />
    </section>

    <section>
      <h3>大小与类型限制</h3>
      <div class="grid">
        <div>
          <span class="tag">maxSize = 0.5MB</span>
          <SrUpload :http-request="mockRequest" multiple :max-size="0.5" tip="超过 0.5MB 会被拒绝" />
        </div>
        <div>
          <span class="tag">accept = image/*</span>
          <SrUpload :http-request="mockRequest" multiple accept="image/*" tip="只接受图片" />
        </div>
      </div>
    </section>

    <section>
      <h3>卡片模式（图片缩略图，点击看大图）</h3>
      <SrUpload :http-request="mockRequest" multiple accept="image/*" list-type="card" tip="选几张图片试试" />
      <p class="hint">仅图片会生成缩略图，其它类型显示占位图标</p>
    </section>

    <section>
      <h3>手动上传（autoUpload = false）</h3>
      <SrUpload
        ref="manualRef"
        v-model:files="manualFiles"
        :auto-upload="false"
        multiple
        tip="选完文件后点下面的按钮统一提交"
      />
      <div class="row">
        <SrButton size="sm" variant="primary" @click="submitManual"
          >提交 {{ manualFiles.length }} 个文件</SrButton
        >
        <SrButton size="sm" variant="text" @click="manualRef?.clear()">清空</SrButton>
        <span class="hint">组件只负责收集，提交时机由调用方决定</span>
      </div>
    </section>

    <section>
      <h3>按钮形态（triggerType = button）</h3>
      <div class="grid">
        <div>
          <span class="tag">单文件（multiple = false）</span>
          <SrUpload
            v-model:files="singleFiles"
            :http-request="mockRequest"
            trigger-type="button"
            icon="lucide:box"
          />
        </div>
        <div>
          <span class="tag">按钮文案与图标自定义</span>
          <SrUpload
            :http-request="mockRequest"
            trigger-type="button"
            button-text="上传附件"
            icon="lucide:download"
            multiple
          />
        </div>
      </div>
      <p class="hint">按钮形态适合嵌在表单里；区域形态适合独立的拖拽场景</p>
    </section>

    <section>
      <h3>回显已有文件（编辑页场景）</h3>
      <SrUpload v-model:files="existing" :http-request="mockRequest" multiple tip="这些文件来自服务端" />
      <p class="hint">
        回显的文件没有 raw 字段，组件不会为它们发起上传；成功状态的文件名渲染成链接，可以直接打开
      </p>
    </section>

    <section>
      <h3>自定义图标</h3>
      <div class="grid">
        <div>
          <span class="tag">icon = 'lucide:heart'</span>
          <SrUpload :http-request="mockRequest" icon="lucide:heart" tip="换了个图标" />
        </div>
        <div>
          <span class="tag">icon = ''（不显示图标）</span>
          <SrUpload :http-request="mockRequest" icon="" tip="纯文字拖拽区" />
        </div>
      </div>
      <p class="hint">也可以用 #icon 插槽放任意内容，比传图标名更灵活</p>
    </section>

    <section>
      <h3>禁用</h3>
      <SrUpload disabled tip="禁用状态" />
    </section>

    <section>
      <h3>自定义触发区</h3>
      <SrUpload :http-request="mockRequest" multiple>
        <template #trigger>
          <div class="custom-trigger">
            <span class="custom-trigger__plus">+</span>
            <span>自定义的拖拽区（#trigger 插槽）</span>
          </div>
        </template>
      </SrUpload>
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
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}
.tag {
  display: block;
  margin-bottom: 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.custom-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  border: 1px dashed var(--sr-color-primary);
  border-radius: 10px;
  background: var(--sr-color-primary-alpha-08);
  color: var(--sr-color-primary-text);
  font-size: 13px;
}

.custom-trigger__plus {
  font-size: 18px;
  line-height: 1;
}
</style>
