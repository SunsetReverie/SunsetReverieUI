<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import {
  SrButton,
  SrConfirm,
  SrInput,
  SrModal,
  srConfirm,
  srMessage,
  srNotification,
  srToast,
  type SrToastPosition,
} from '@sunset-reverie/ui'

defineOptions({ name: 'FeedbackView' })

/** 基础弹窗 */
const basicOpen = ref(false)
/** 带操作区 */
const footerOpen = ref(false)
/** 居中 */
const centeredOpen = ref(false)
/** 长内容 */
const longOpen = ref(false)
/** 外层弹窗（用于演示嵌套） */
const outerOpen = ref(false)
/** 内层弹窗 */
const innerOpen = ref(false)
/** 必须做选择 */
const forceChoiceOpen = ref(false)
/** 无头部弹窗 */
const headlessOpen = ref(false)
/** 声明式确认框：一个实例按类型切换 */
const confirmOpen = ref(false)
const confirmType = ref<'primary' | 'warning' | 'danger'>('primary')
const CONFIRM_TEXT = {
  primary: { title: '确认保存？', content: '保存后当前草稿会覆盖线上版本。' },
  warning: { title: '当前配置尚未验证', content: '继续可能使用未经验证的参数，建议先跑一次检查。' },
  danger: { title: '删除项目？', content: '项目及其下所有数据都会被移除，且无法恢复。' },
}
const confirmTitle = computed(() => CONFIRM_TEXT[confirmType.value].title)
const confirmContent = computed(() => CONFIRM_TEXT[confirmType.value].content)
/** 命令式确认框的用户选择 */
const confirmResult = ref('尚未选择')
/** 长内容页数 */
const pages = Array.from({ length: 8 }, (_, index) => index + 1)

/** 位置选项 */
const positions: Array<{ label: string; value: SrToastPosition }> = [
  { label: '上中', value: 'top' },
  { label: '右上', value: 'top-right' },
  { label: '右下', value: 'bottom-right' },
  { label: '下中', value: 'bottom' },
]

/**
 * 弹出指定类型的提示
 * @param type 类型
 */
function showToast(type: 'info' | 'success' | 'warning' | 'error'): void {
  const text = {
    info: '已为你同步最新配置',
    success: '保存成功',
    warning: '当前网络较慢，请稍候',
    error: '请求失败，请检查网络后重试',
  }[type]

  srToast[type](text, { closable: type === 'error' })
}

/** 全局消息类型 */
type FeedbackType = 'info' | 'success' | 'warning' | 'error'

/**
 * 打开声明式确认框
 * @param type 类型
 */
function openConfirm(type: 'primary' | 'warning' | 'danger'): void {
  confirmType.value = type
  confirmOpen.value = true
}

/**
 * 命令式确认：await 用户选择
 */
async function confirmDelete(): Promise<void> {
  const ok = await srConfirm.danger({
    title: '删除这条记录？',
    content: '删除后无法恢复，请确认是否继续。',
    confirmText: '删除',
  })
  confirmResult.value = ok ? '用户选择「删除」' : '用户选择「取消」'
}

/**
 * 命令式确认：onConfirm 返回 Promise 时按钮自动进入加载态
 */
async function confirmWithLoading(): Promise<void> {
  const ok = await srConfirm({
    title: '提交审核',
    content: '点击确认后按钮进入加载态，等异步操作完成才关闭。',
    onConfirm: () => new Promise<void>((resolve) => window.setTimeout(resolve, 1200)),
  })
  confirmResult.value = ok ? '异步操作完成' : '用户取消'
}

/**
 * 命令式确认：隐藏取消按钮
 */
async function confirmNoCancel(): Promise<void> {
  await srConfirm.primary({
    title: '版本更新说明',
    content: '这个确认框没有取消按钮，只能点确认。',
    showCancel: false,
    confirmText: '知道了',
  })
  confirmResult.value = '用户已确认'
}

/**
 * 弹出一条全局消息
 * @param type 类型
 */
function showMessage(type: FeedbackType): void {
  srMessage[type](
    { info: '草稿已自动保存', success: '操作成功', warning: '内容有未保存的改动', error: '提交失败，请重试' }[
      type
    ],
  )
}

/**
 * 弹出一条通知
 * @param type 类型
 */
function showNotification(type: FeedbackType): void {
  srNotification[type]({
    title: { info: '新消息', success: '同步完成', warning: '存储即将满', error: '请求失败' }[type],
    message: '这是一条带标题与描述的通知卡片，默认停留在右上角，可手动关闭。',
  })
}

/**
 * 在指定位置弹出
 * @param position 位置
 */
function showAt(position: SrToastPosition): void {
  srToast('这是一条位置提示', { position, duration: 2500 })
}

/** 连续弹 4 条，演示队列与上限 */
function showBurst(): void {
  srToast.success('第 1 条：已创建')
  srToast.info('第 2 条：正在同步')
  srToast.warning('第 3 条：字段缺失')
  srToast('第 4 条：普通提示')
}

/**
 * 常驻提示（不自动关闭）
 */
function showSticky(): void {
  srToast.warning('这条不会自动消失，请手动关闭', { duration: 0, closable: true })
}

/**
 * 保存并关闭弹窗
 *
 * 拆成函数而不是在模板里写多语句 —— Prettier 会把内联 handler 折行并去掉分号，
 * Vue 编译器就解析不出语句块了（Unexpected token, expected ","）。
 */
function saveConfig(): void {
  footerOpen.value = false
  srToast.success('配置已保存')
}

// 调试便利：?demo=modal / ?demo=toast 自动触发，便于截图与分享复现链接
onMounted(() => {
  const demo = new URLSearchParams(window.location.search).get('demo')
  if (demo === 'modal') basicOpen.value = true
  // duration: 0 常驻，否则无头截图的虚拟时间会直接把它快进掉
  if (demo === 'toast') srToast.success('保存成功', { duration: 0, closable: true })
  if (demo === 'message') srMessage.success('保存成功', { duration: 0 })
  if (demo === 'notification')
    srNotification.success({ title: '保存成功', message: '配置已同步到云端', duration: 0 })
})
</script>

<template>
  <div>
    <SrPanel>
      <h2 class="panel__title">轻提示（命令式）</h2>
      <p class="panel__desc">
        不经过组件树，直接调用
        <code style="font-family: var(--sr-font-family-mono)">srToast.success()</code>。
        首次调用时才创建容器，因此 SSR 阶段完全无副作用。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px">
        <sr-button variant="secondary" @click="showToast('info')">普通提示</sr-button>
        <sr-button variant="secondary" @click="showToast('success')">成功</sr-button>
        <sr-button variant="secondary" @click="showToast('warning')">警告</sr-button>
        <sr-button variant="danger" @click="showToast('error')">错误</sr-button>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button size="sm" variant="outline" @click="showBurst">连续 4 条（队列）</sr-button>
        <sr-button size="sm" variant="outline" @click="showSticky">常驻提示</sr-button>
        <sr-button size="sm" variant="text" @click="srToast.closeAll()">全部关闭</sr-button>
      </div>
    </SrPanel>

    <SrPanel>
      <h2 class="panel__title">提示位置</h2>
      <p class="panel__desc">同一位置的多条提示纵向堆叠，不同位置各自独立分组。</p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button
          v-for="item in positions"
          :key="item.value"
          size="sm"
          variant="secondary"
          @click="showAt(item.value)"
        >
          {{ item.label }}
        </sr-button>
      </div>
    </SrPanel>

    <SrPanel>
      <h2 class="panel__title">弹窗</h2>
      <p class="panel__desc">
        打开时锁定页面滚动、焦点移入内部并循环；Esc
        关闭后焦点归还触发按钮。手机宽度下自动全屏（缩放窗口可验证）。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button variant="primary" @click="basicOpen = true">基础弹窗</sr-button>
        <sr-button variant="secondary" @click="footerOpen = true">带操作区</sr-button>
        <sr-button variant="secondary" @click="centeredOpen = true">垂直居中</sr-button>
        <sr-button variant="secondary" @click="longOpen = true">长内容滚动</sr-button>
        <sr-button variant="outline" @click="outerOpen = true">嵌套弹窗</sr-button>
        <sr-button variant="outline" @click="forceChoiceOpen = true">必须做选择</sr-button>
        <sr-button variant="outline" @click="headlessOpen = true">无头部</sr-button>
      </div>
    </SrPanel>

    <sr-modal v-model="basicOpen" title="基础弹窗" :width="440">
      <p style="margin: 0; line-height: 1.7">
        这是弹窗主体内容。点击遮罩、按 Esc、点右上角关闭按钮都可以关闭。
      </p>
      <p style="margin: 12px 0 0; color: var(--sr-color-text-secondary); line-height: 1.7">
        打开时页面滚动被锁定，关闭后恢复，且不会因为滚动条消失导致内容横向跳动。
      </p>
    </sr-modal>

    <sr-modal v-model="footerOpen" title="编辑配置" :width="520">
      <div style="display: grid; gap: 12px">
        <sr-input placeholder="配置名称" />
        <sr-input type="textarea" :rows="3" placeholder="备注" />
      </div>

      <template #footer>
        <sr-button variant="text" @click="footerOpen = false">取消</sr-button>
        <sr-button variant="primary" @click="saveConfig">保存</sr-button>
      </template>
    </sr-modal>

    <sr-modal v-model="centeredOpen" title="垂直居中" centered :width="380">
      <p style="margin: 0">centered 让面板在视口中垂直居中，适合确认类弹窗。</p>
    </sr-modal>

    <sr-modal v-model="longOpen" title="长内容" :width="560">
      <div v-for="page in pages" :key="page" style="margin-bottom: 14px; line-height: 1.7">
        <strong>第 {{ page }} 段</strong>
        <p style="margin: 4px 0 0; color: var(--sr-color-text-secondary)">
          弹窗面板为三段式布局：头部与底部固定，只有主体区域滚动。这样无论内容多长，关闭按钮和底部操作始终可见。
        </p>
      </div>
    </sr-modal>

    <sr-modal
      v-model="forceChoiceOpen"
      title="必须做选择"
      :width="520"
      :mask-closable="false"
      :closable="false"
      :esc-to-close="false"
    >
      <p style="margin: 0; line-height: 1.8; color: var(--sr-color-text-secondary)">
        点击遮罩不会关闭，也没有关闭按钮，必须通过下方按钮做出选择。
      </p>

      <template #footer>
        <sr-button variant="secondary" @click="forceChoiceOpen = false">放弃</sr-button>
        <sr-button variant="primary" @click="forceChoiceOpen = false">确认</sr-button>
      </template>
    </sr-modal>

    <sr-modal v-model="headlessOpen" :width="560" :closable="false">
      <p style="margin: 0; line-height: 1.8; color: var(--sr-color-text-secondary)">
        没有头部，也没有关闭按钮，宽度由 width 覆盖。
      </p>

      <template #footer>
        <sr-button variant="primary" @click="headlessOpen = false">关闭</sr-button>
      </template>
    </sr-modal>

    <sr-modal v-model="outerOpen" title="外层弹窗" :width="480" centered>
      <p style="margin: 0 0 12px">
        两层都垂直居中、叠在同一位置。点下面的按钮打开内层弹窗，再按 Esc —— 只会关闭内层。
      </p>
      <sr-button variant="primary" @click="innerOpen = true">打开内层</sr-button>

      <sr-modal v-model="innerOpen" title="内层弹窗" centered :width="360">
        <p style="margin: 0">我是内层弹窗。Esc 只关闭我，外层保持打开。</p>
      </sr-modal>
    </sr-modal>
    <SrPanel>
      <h2 class="panel__title">全局消息（命令式）</h2>
      <p class="panel__desc">
        <code style="font-family: var(--sr-font-family-mono)">srMessage</code>
        固定顶部居中、只有一行图标与文案，适合一闪而过的操作结果。最多同时 3 条。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button variant="secondary" @click="showMessage('info')">普通</sr-button>
        <sr-button variant="secondary" @click="showMessage('success')">成功</sr-button>
        <sr-button variant="secondary" @click="showMessage('warning')">警告</sr-button>
        <sr-button variant="danger" @click="showMessage('error')">错误</sr-button>
        <sr-button
          variant="outline"
          @click="srMessage('自定义底色', { backgroundColor: 'rgba(16, 185, 129, 0.18)', duration: 0 })"
        >
          自定义背景色
        </sr-button>
        <sr-button size="sm" variant="text" @click="srMessage.closeAll()">全部关闭</sr-button>
      </div>
    </SrPanel>

    <SrPanel>
      <h2 class="panel__title">通知提醒（命令式）</h2>
      <p class="panel__desc">
        <code style="font-family: var(--sr-font-family-mono)">srNotification</code>
        是带标题与描述的通知卡片，默认落在右上角、停留 4.5 秒、可手动关闭；参数用对象传入。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px">
        <sr-button variant="secondary" @click="showNotification('info')">普通</sr-button>
        <sr-button variant="secondary" @click="showNotification('success')">成功</sr-button>
        <sr-button variant="secondary" @click="showNotification('warning')">警告</sr-button>
        <sr-button variant="danger" @click="showNotification('error')">错误</sr-button>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button
          size="sm"
          variant="outline"
          @click="
            srNotification.info({
              title: '左下角',
              message: 'position 可以指定四角',
              position: 'bottom-left',
            })
          "
        >
          左下角
        </sr-button>
        <sr-button
          size="sm"
          variant="outline"
          @click="
            srNotification({
              title: '自定义底色',
              message: 'backgroundColor 接受任意 CSS 颜色',
              backgroundColor: 'rgba(16, 185, 129, 0.18)',
              duration: 0,
            })
          "
        >
          自定义背景色
        </sr-button>
        <sr-button size="sm" variant="text" @click="srNotification.closeAll()">全部关闭</sr-button>
      </div>
    </SrPanel>

    <SrPanel>
      <h2 class="panel__title">确认框</h2>
      <p class="panel__desc">
        确认框不显示头部与右上角关闭按钮，焦点集中在「做选择」上。图标底色、图标与确认按钮始终同色，
        不会出现红色图标配蓝色按钮。内部复用
        <code style="font-family: var(--sr-font-family-mono)">SrModal</code>
        的遮罩、焦点循环与 Esc 能力。
      </p>

      <h3 style="font-size: 14px; margin: 18px 0 8px">声明式用法（SrConfirm）</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button variant="primary" @click="openConfirm('primary')">普通确认</sr-button>
        <sr-button variant="secondary" @click="openConfirm('warning')">警告确认</sr-button>
        <sr-button variant="danger" @click="openConfirm('danger')">危险确认</sr-button>
      </div>

      <h3 style="font-size: 14px; margin: 18px 0 8px">命令式用法（srConfirm）</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button variant="primary" @click="confirmDelete">删除（await 结果）</sr-button>
        <sr-button variant="secondary" @click="confirmWithLoading">带加载态</sr-button>
        <sr-button variant="secondary" @click="confirmNoCancel">无取消按钮</sr-button>
      </div>
      <p style="margin: 12px 0 0; font-size: 13px; color: var(--sr-color-primary-text)">
        {{ confirmResult }}
      </p>

      <h3 style="font-size: 14px; margin: 18px 0 8px">类型与视觉</h3>
      <p style="margin: 0; font-size: 13px; line-height: 1.9; color: var(--sr-color-text-secondary)">
        <code style="font-family: var(--sr-font-family-mono)">primary</code> 问号图标 + 主色底 +
        主色确认按钮<br />
        <code style="font-family: var(--sr-font-family-mono)">warning</code> 三角警告 + 警告色底 +
        警告色确认按钮<br />
        <code style="font-family: var(--sr-font-family-mono)">danger</code> 感叹号 + 危险色底 + 危险色确认按钮
      </p>

      <h3 style="font-size: 14px; margin: 18px 0 8px">SrConfirm Props / srConfirm Options 速查</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>字段</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>modelValue</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>显示状态，v-model（仅声明式）</td>
          </tr>
          <tr>
            <td><code>type</code></td>
            <td><code>'primary' | 'warning' | 'danger'</code></td>
            <td><code>'primary'</code></td>
            <td>图标、图标底色与确认按钮颜色</td>
          </tr>
          <tr>
            <td><code>title</code> / <code>content</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>标题与说明；命令式直接调用时也可传字符串作为 content</td>
          </tr>
          <tr>
            <td><code>confirmText</code> / <code>cancelText</code></td>
            <td><code>string</code></td>
            <td><code>'确认'</code> / <code>'取消'</code></td>
            <td>按钮文案</td>
          </tr>
          <tr>
            <td><code>showCancel</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>是否显示取消按钮</td>
          </tr>
          <tr>
            <td><code>loading</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>确认按钮加载态，期间禁止关闭（仅声明式）</td>
          </tr>
          <tr>
            <td><code>maskClosable</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>点击遮罩是否按「取消」处理</td>
          </tr>
          <tr>
            <td><code>width</code></td>
            <td><code>number | string</code></td>
            <td><code>420</code></td>
            <td>面板宽度</td>
          </tr>
          <tr>
            <td><code>onConfirm</code></td>
            <td><code>() =&gt; void | Promise&lt;void&gt;</code></td>
            <td><code>—</code></td>
            <td>仅命令式；返回 Promise 时自动 loading，完成后才 resolve(true)</td>
          </tr>
        </tbody>
      </table>
      <p style="margin: 10px 0 0; font-size: 13px; color: var(--sr-color-text-secondary)">
        命令式返回 <code style="font-family: var(--sr-font-family-mono)">Promise&lt;boolean&gt;</code>， 另有
        <code style="font-family: var(--sr-font-family-mono)">srConfirm.primary / .warning / .danger</code>
        快捷方法；同一时刻只保留一个确认框。
      </p>
    </SrPanel>

    <SrConfirm
      v-model="confirmOpen"
      :type="confirmType"
      :title="confirmTitle"
      :content="confirmContent"
      confirm-text="继续"
      @confirm="confirmOpen = false"
    />

    <SrPanel>
      <h2 class="panel__title">反馈组件 Options 速查</h2>
      <p class="panel__desc">
        三个命令式 API 的第二个参数 / 对象参数。三者都提供
        <code style="font-family: var(--sr-font-family-mono)">.close(id)</code> 与
        <code style="font-family: var(--sr-font-family-mono)">.closeAll()</code>， 以及 info / success /
        warning / error 四个快捷方法；
        <code style="font-family: var(--sr-font-family-mono)">duration: 0</code> 表示常驻。
      </p>

      <h3 style="font-size: 14px; margin: 18px 0 8px">srToast(message, options)</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>Option</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>type</code></td>
            <td><code>'info' | 'success' | 'warning' | 'error'</code></td>
            <td><code>'info'</code></td>
            <td>类型与图标</td>
          </tr>
          <tr>
            <td><code>duration</code></td>
            <td><code>number</code></td>
            <td><code>3000</code></td>
            <td>停留毫秒</td>
          </tr>
          <tr>
            <td><code>position</code></td>
            <td><code>6 个方位</code></td>
            <td><code>'top'</code></td>
            <td>上/下 × 左/中/右</td>
          </tr>
          <tr>
            <td><code>closable</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>是否显示关闭按钮</td>
          </tr>
          <tr>
            <td><code>backgroundColor</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>自定义背景色，覆盖预设玻璃底</td>
          </tr>
        </tbody>
      </table>

      <h3 style="font-size: 14px; margin: 18px 0 8px">srMessage(content, options)</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>Option</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>type</code></td>
            <td><code>四个类型</code></td>
            <td><code>'info'</code></td>
            <td>类型与图标</td>
          </tr>
          <tr>
            <td><code>duration</code></td>
            <td><code>number</code></td>
            <td><code>2000</code></td>
            <td>停留毫秒；最多同时 3 条</td>
          </tr>
          <tr>
            <td><code>backgroundColor</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>自定义背景色</td>
          </tr>
        </tbody>
      </table>

      <h3 style="font-size: 14px; margin: 18px 0 8px">srNotification(options)</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>Option</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>title</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>标题</td>
          </tr>
          <tr>
            <td><code>message</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>描述内容</td>
          </tr>
          <tr>
            <td><code>type</code></td>
            <td><code>四个类型</code></td>
            <td><code>'info'</code></td>
            <td>类型与图标</td>
          </tr>
          <tr>
            <td><code>duration</code></td>
            <td><code>number</code></td>
            <td><code>4500</code></td>
            <td>停留毫秒</td>
          </tr>
          <tr>
            <td><code>position</code></td>
            <td><code>top-left / top-right / bottom-left / bottom-right</code></td>
            <td><code>'top-right'</code></td>
            <td>出现的角</td>
          </tr>
          <tr>
            <td><code>closable</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>是否显示关闭按钮</td>
          </tr>
          <tr>
            <td><code>backgroundColor</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>自定义背景色</td>
          </tr>
        </tbody>
      </table>
    </SrPanel>
  </div>
</template>
