<script setup lang="ts">
import { ref } from 'vue'
import { SrImage, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'ImageDemo' })

/**
 * 生成一张纯 SVG 的示例图，避免依赖外网
 * @param from 起始色
 * @param to 结束色
 * @param label 图上文字
 * @returns data URI
 */
function svgImage(from: string, to: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
    </linearGradient></defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <text x="200" y="158" font-family="system-ui,sans-serif" font-size="26" fill="#fff"
      text-anchor="middle">${label}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** 示例图 */
const blueImage = svgImage('#3e3edc', '#8b5cf6', '示例图')
const greenImage = svgImage('#1f7a4d', '#0ea5e9', '风景')
const orangeImage = svgImage('#ff7a45', '#e0b100', '产品图')

/** 加载状态日志 */
const lastEvent = ref('')

/**
 * 记录事件
 * @param name 事件名
 */
function onEvent(name: string): void {
  lastEvent.value = name
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <div class="row">
        <SrImage :src="blueImage" alt="示例图" :width="160" :height="120" radius="8" />
        <div class="side">
          <p class="hint" style="margin: 0">加载完成后才有内容；失败时会显示占位图标 + 替代文本</p>
          <p class="hint" style="margin: 6px 0 0">
            最近事件：<code>{{ lastEvent || '—' }}</code>
          </p>
        </div>
      </div>
    </section>

    <section>
      <h3>尺寸与圆角</h3>
      <div class="row">
        <SrImage :src="greenImage" alt="小图" :width="64" :height="64" :radius="6" />
        <SrImage :src="greenImage" alt="中图" :width="100" :height="100" :radius="12" />
        <SrImage :src="greenImage" alt="圆形" :width="100" :height="100" :radius="'50%'" />
      </div>
      <p class="hint">width / height / radius 传数字按像素，传字符串原样输出（比如 50%）</p>
    </section>

    <section>
      <h3>填充方式（fit）</h3>
      <div class="row">
        <div v-for="f in ['cover', 'contain', 'fill', 'none', 'scale-down']" :key="f" class="fit-item">
          <div class="fit-box">
            <SrImage :src="orangeImage" :alt="f" :fit="f as 'cover'" :width="100" :height="80" />
          </div>
          <span class="label">{{ f }}</span>
        </div>
      </div>
      <p class="hint">
        cover 裁切填满、contain 完整留白、fill 拉伸变形、none 原尺寸居中、scale-down 取 none 与 contain
        中较小的
      </p>
    </section>

    <section>
      <h3>加载失败兜底</h3>
      <div class="row">
        <div class="fit-item">
          <SrImage
            src="/not-exist.png"
            alt="坏图"
            :width="120"
            :height="90"
            radius="6"
            @error="onEvent('error（无兜底）')"
          />
          <span class="label">无兜底</span>
        </div>
        <div class="fit-item">
          <SrImage
            src="/not-exist.png"
            alt="坏图"
            :width="120"
            :height="90"
            radius="6"
            :fallback="blueImage"
            @error="onEvent('error（有兜底）')"
          />
          <span class="label">有兜底图</span>
        </div>
      </div>
      <p class="hint">
        不传 <code>fallback</code> 时显示占位图标；传了就换成兜底图，<code>error</code> 事件仍会派发
      </p>
    </section>

    <section>
      <h3>点击预览</h3>
      <div class="row">
        <SrImage
          :src="blueImage"
          alt="点开看大图"
          :width="140"
          :height="100"
          radius="8"
          preview
          @preview-change="onEvent($event ? 'preview 打开' : 'preview 关闭')"
        />
        <p class="hint" style="margin: 0; max-width: 260px">
          右下角 hover 会出现放大图标；点开后按 Esc、点遮罩、点右上角关闭都能退出
        </p>
      </div>
    </section>

    <section>
      <h3>懒加载</h3>
      <div class="row">
        <SrImage :src="greenImage" alt="懒加载" :width="120" :height="90" radius="6" lazy />
        <p class="hint" style="margin: 0; max-width: 280px">
          用 IntersectionObserver，进入视口才请求图片；环境不支持时直接加载，不会卡死
        </p>
      </div>
      <p class="hint">列表页里给每张图加 lazy，能省掉大量首屏请求</p>
    </section>

    <section>
      <h3>实际场景：列表缩略图</h3>
      <div class="card">
        <div v-for="(item, i) in ['设计规范', '组件文档', '发布记录']" :key="item" class="list-row">
          <SrImage
            :src="i === 0 ? blueImage : i === 1 ? greenImage : orangeImage"
            :alt="item"
            :width="48"
            :height="48"
            radius="6"
            lazy
          />
          <div class="list-main">
            <p class="list-title">{{ item }}</p>
            <p class="list-desc">更新于 11-0{{ i + 1 }}</p>
          </div>
          <SrTag size="sm">{{ i + 1 }}</SrTag>
        </div>
      </div>
      <p class="hint">固定尺寸 + 圆角 + 懒加载，是后台列表里最常见的组合</p>
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
  gap: 16px;
}

.side {
  flex: 1 1 240px;
  min-width: 220px;
}

.fit-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6px;
}

.fit-box {
  padding: 4px;
  border: 1px dashed var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-sm);
}

.label {
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.card {
  padding: 8px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
  max-width: 420px;
}

.list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: var(--sr-radius-sm);
}

.list-row:hover {
  background: var(--sr-color-bg-sunken);
}

.list-main {
  flex: 1 1 auto;
  min-width: 0;
}

.list-title {
  margin: 0;
  color: var(--sr-color-text);
  font-size: 13px;
}

.list-desc {
  margin: 2px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}
</style>
