<script setup lang="ts">
import { computed, ref } from 'vue'
import { SrInput, SrQRCode, SrSegmented, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'QrcodeDemo' })

/** 可编辑内容 */
const text = ref('https://sunset-reverie.dev')

/** 纠错等级 */
const level = ref<'L' | 'M' | 'Q' | 'H'>('M')

/** 状态演示 */
const status = ref<'active' | 'loading' | 'expired'>('active')

/** 错误提示 */
const errorText = ref('')

/** 各等级的可恢复比例说明 */
const levelDesc: Record<string, string> = {
  L: '约 7%',
  M: '约 15%',
  Q: '约 25%',
  H: '约 30%',
}

/** 当前内容字节数 */
const byteLength = computed(() => new TextEncoder().encode(text.value).length)

/**
 * 记录编码错误
 * @param reason 原因
 */
function onError(reason: string): void {
  errorText.value = reason
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础用法</h3>
      <div class="row">
        <SrQRCode :value="text" :size="140" />
        <div class="side">
          <SrInput v-model="text" placeholder="改这里，二维码会实时更新" clearable />
          <p class="hint" style="margin: 6px 0 0">
            {{ byteLength }} 字节 · 纠错等级 {{ level }}（可恢复 {{ levelDesc[level] }}）
          </p>
        </div>
      </div>
      <p class="hint">用 SVG 绘制，放大不会糊；改内容试试，码会跟着重算</p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row" style="align-items: flex-end">
        <div v-for="s in [80, 120, 160, 200]" :key="s" class="size-item">
          <SrQRCode :value="text" :size="s" />
          <span class="label">{{ s }}px</span>
        </div>
      </div>
      <p class="hint">码点数由内容和纠错等级决定，尺寸只负责缩放，不影响可识别性</p>
    </section>

    <section>
      <h3>纠错等级</h3>
      <div class="row" style="align-items: flex-end">
        <div v-for="lv in ['L', 'M', 'Q', 'H']" :key="lv" class="size-item">
          <SrQRCode :value="text" :size="120" :level="lv as 'M'" />
          <span class="label">{{ lv }} · {{ levelDesc[lv] }}</span>
        </div>
      </div>
      <p class="hint">等级越高越抗污损，但同样内容需要的码点更多。中间放图标时用 H，挡住的部分才补得回来</p>
    </section>

    <section>
      <h3>颜色</h3>
      <div class="row">
        <SrQRCode :value="text" :size="120" color="#3e3edc" />
        <SrQRCode :value="text" :size="120" color="#1f7a4d" background-color="#f0fdf4" />
        <SrQRCode :value="text" :size="120" color="#1c2027" background-color="#fef3c7" />
      </div>
      <p class="hint">深色前景 + 浅色背景是必须的，反过来多数扫码器认不出</p>
    </section>

    <section>
      <h3>中心图标</h3>
      <div class="row">
        <div class="size-item">
          <SrQRCode :value="text" :size="140" icon="lucide:heart" level="H" :icon-size="32" />
          <span class="label">level = H</span>
        </div>
        <div class="size-item">
          <SrQRCode :value="text" :size="140" icon="lucide:box" level="H" :icon-size="32" />
          <span class="label">自定义图标</span>
        </div>
      </div>
      <p class="hint">图标会挡住中间一块，所以<b>必须配 H 等级</b>——它可恢复约 30% 的码字</p>
    </section>

    <section>
      <h3>状态</h3>
      <div class="row" style="margin-bottom: 12px">
        <SrSegmented
          v-model="status"
          :options="
            [
              { label: '正常', value: 'active' },
              { label: '加载中', value: 'loading' },
              { label: '已失效', value: 'expired' },
            ] as never
          "
        />
      </div>
      <div class="row">
        <SrQRCode :value="text" :size="140" :status="status" />
        <p class="hint" style="margin: 0; max-width: 260px">
          <code>loading</code> 显示占位；<code>expired</code> 保留码点但盖一层遮罩，适合登录码超时这类场景
        </p>
      </div>
    </section>

    <section>
      <h3>不同内容</h3>
      <div class="row">
        <div class="size-item">
          <SrQRCode value="https://example.com/path?a=1" :size="110" />
          <span class="label">URL</span>
        </div>
        <div class="size-item">
          <SrQRCode value="夕梦 UI 组件库" :size="110" />
          <span class="label">中文</span>
        </div>
        <div class="size-item">
          <SrQRCode value="WIFI:T:WPA;S:SunsetReverie;P:12345678;;" :size="110" level="H" />
          <span class="label">Wi-Fi 配置</span>
        </div>
      </div>
      <p class="hint">中文按 UTF-8 编码，一个汉字占 3 字节，比英文吃容量</p>
    </section>

    <section>
      <h3>容量上限</h3>
      <div class="row">
        <SrQRCode :value="'x'.repeat(200)" :size="110" level="H" @error="onError" />
        <div class="side">
          <SrTag size="sm" type="warning">超出容量</SrTag>
          <p class="hint" style="margin: 6px 0 0">
            最多支持版本 4（约 78 字节）。超长内容会派发
            <code>error</code> 事件并且不渲染码。
            <span v-if="errorText">当前：{{ errorText }}</span>
          </p>
        </div>
      </div>
    </section>

    <section>
      <h3>和图片二维码的区别</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">SrQRCode</span>
          <p class="hint" style="margin: 0">
            内容由前端决定、需要实时变化、不能依赖后端出图的场景。零依赖，几十 KB
          </p>
        </div>
        <div class="card">
          <span class="tag">后端出图 / 第三方接口</span>
          <p class="hint" style="margin: 0">
            内容固定、需要带 Logo 和品牌样式、需要短链或统计。这种更适合服务端生成
          </p>
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

.side {
  flex: 1 1 260px;
  min-width: 240px;
  max-width: 340px;
}

.size-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
}

.label {
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
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
