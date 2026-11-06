<script setup lang="ts">
import { ref } from 'vue'

import {
  SrAvatar,
  SrBadge,
  SrBreadcrumb,
  SrButton,
  SrCard,
  SrDrawer,
  SrDropdown,
  SrEmpty,
  SrPanel,
  SrTabs,
  SrTag,
} from '@sunset-reverie/ui'

defineOptions({ name: 'DisplayView' })

/** 标签页配置 */
const tabs = [
  { key: 'overview', label: '概览' },
  { key: 'config', label: '配置' },
  { key: 'log', label: '日志' },
]

/** 可关闭的标签页 */
const closableTabs = ref([
  { key: 'a', label: '基础组件' },
  { key: 'b', label: '表单组件' },
  { key: 'c', label: '数据展示' },
])

/** 当前标签页 */
const activeTab = ref('overview')

/** 面包屑 */
const crumbs = [{ label: '首页', href: '#', icon: 'lucide:house' }, { label: '组件' }, { label: '展示组件' }]

/** 折叠面包屑 */
const longCrumbs = [
  { label: '工作台', href: '#' },
  { label: '项目' },
  { label: '夕梦 UI' },
  { label: '组件库' },
  { label: '展示组件' },
]

/** 纯文字菜单：全部不带图标，最简洁 */
const textMenu = [
  { key: 'view', label: '查看详情' },
  { key: 'export', label: '导出' },
  { key: 'copy', label: '复制链接' },
]

/** 带图标菜单：每项都有图标，不会一有一没有 */
const iconMenu = [
  { key: 'edit', label: '编辑', icon: 'lucide:pencil' },
  { key: 'download', label: '下载', icon: 'lucide:download' },
  { key: 'delete', label: '删除', icon: 'lucide:trash' },
]

/** 分组菜单：每组内部图标保持一致 */
const groupedMenu = [
  { group: '编辑', key: 'rename', label: '重命名', icon: 'lucide:pencil' },
  { group: '编辑', key: 'copy', label: '复制副本', icon: 'lucide:download' },
  { group: '编辑', key: 'move', label: '移动到…', icon: 'lucide:chevron-right' },
  { group: '危险', key: 'delete', label: '删除', icon: 'lucide:trash', danger: true, divided: true },
]

/** 状态菜单：选中项 + 禁用项 + 危险项 */
const stateMenu = [
  { key: 'pin', label: '置顶', icon: 'lucide:chevron-up', selected: true },
  { key: 'unpin', label: '取消置顶', icon: 'lucide:chevron-down' },
  { key: 'share', label: '分享给他人', icon: 'lucide:download', disabled: true },
  { key: 'delete', label: '删除', icon: 'lucide:trash', danger: true, divided: true },
]

/** 面板折叠状态 */
const panelOpen = ref(true)

/** 禁用项演示的面包屑 */
const disabledCrumbs = [
  { label: '首页', href: '#', icon: 'lucide:house' },
  { label: '已归档项目', disabled: true },
  { label: '详情' },
]

/** 抽屉开关 */
const drawerRight = ref(false)
const drawerLeft = ref(false)
const drawerTop = ref(false)
const drawerSm = ref(false)
const drawerLg = ref(false)

/** 下拉选择结果 */
const lastAction = ref('—')

/**
 * 关闭标签页
 * @param key 标签 key
 */
function onTabClose(key: string): void {
  closableTabs.value = closableTabs.value.filter((tab) => tab.key !== key)
}

/**
 * 下拉菜单选中
 * @param key 菜单项 key
 */
function onMenuSelect(key: string): void {
  lastAction.value = key
}
</script>

<template>
  <div class="display-page">
    <SrPanel title="卡片" description="容器型组件：头部 / 主体 / 底部三段，内边距与描边都可调。">
      <h3 class="sub-title">基础</h3>
      <div class="card-grid">
        <SrCard title="组件覆盖率" subtitle="近 7 天">
          <p style="margin: 0; font-size: 26px; font-weight: 600">86.4%</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: var(--sr-color-text-tertiary)">较上周 +3.2%</p>
        </SrCard>

        <SrCard title="待处理缺陷">
          <p style="margin: 0; font-size: 26px; font-weight: 600">12</p>
          <template #footer>
            <SrButton size="sm" variant="text">查看全部</SrButton>
          </template>
        </SrCard>

        <SrCard>
          <p class="muted" style="margin: 0">无标题时头部整块不渲染，适合纯内容卡片。</p>
        </SrCard>
      </div>

      <h3 class="sub-title">悬停与描边</h3>
      <div class="card-grid">
        <SrCard title="可悬停" hoverable>
          <p class="muted">鼠标悬停时上浮并高亮描边。触摸设备不会触发悬停，因此不会出现假反馈。</p>
        </SrCard>

        <SrCard title="无描边" :bordered="false">
          <p class="muted">去掉描边，改由一层浅阴影区分层级。</p>
        </SrCard>
      </div>

      <h3 class="sub-title">内边距</h3>
      <div class="card-stack">
        <SrCard title="padding = none" padding="none">
          <div class="flush-block">内容区无内边距，适合自带间距的图表或图片</div>
        </SrCard>

        <SrCard title="padding = sm" padding="sm">
          <p class="muted">紧凑内边距，适合信息密度高的列表卡片。</p>
        </SrCard>

        <SrCard title="padding = lg" padding="lg">
          <p class="muted">宽松内边距，适合营销位或详情页。</p>
        </SrCard>
      </div>

      <h3 class="sub-title">三段式插槽（header / extra / footer）</h3>
      <div class="card-grid">
        <SrCard>
          <template #header>
            <div style="display: flex; align-items: center; gap: 10px">
              <span class="card-swatch" />
              <span style="font-weight: 600; font-size: 15px">自定义 header</span>
            </div>
          </template>

          <template #extra>
            <SrTag type="primary">extra</SrTag>
          </template>

          <p class="muted">header、extra 与下方的 footer 均可独立使用，互不依赖。</p>

          <template #footer>
            <SrButton size="sm" variant="outline">取消</SrButton>
            <SrButton size="sm" variant="primary">确认</SrButton>
          </template>
        </SrCard>
      </div>
    </SrPanel>

    <SrPanel
      v-model="panelOpen"
      title="分区面板"
      description="比 Card 更轻，只负责标题与内容分区，支持折叠。点标题试试。"
      collapsible
    >
      <p style="margin: 0; font-size: 13px">
        面板默认可折叠，收起时内容用 v-show 隐藏，DOM 保留，切换不丢状态。
      </p>
    </SrPanel>

    <SrPanel title="徽标与头像" description="展示型标记，用于状态角标与用户标识。">
      <div style="display: flex; flex-direction: column; gap: 20px">
        <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
          <SrBadge :value="8">
            <span class="demo-block">消息</span>
          </SrBadge>
          <SrBadge :value="120">
            <span class="demo-block">通知</span>
          </SrBadge>
          <SrBadge dot>
            <span class="demo-block">更新</span>
          </SrBadge>
          <SrBadge :value="0" show-zero>
            <span class="demo-block">已读</span>
          </SrBadge>
          <SrBadge :value="3" type="success" />
          <SrBadge :value="5" type="warning" />
        </div>

        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap">
          <SrBadge status="success" text="运行中" />
          <SrBadge status="warning" text="待审核" />
          <SrBadge status="danger" text="已停用" />
          <SrBadge status="processing" text="部署中" />
          <span class="muted">← status 状态点模式</span>
        </div>

        <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap">
          <SrAvatar alt="林深" />
          <SrAvatar alt="周夏" size="sm" />
          <SrAvatar alt="陈默" size="lg" />
          <SrAvatar icon="lucide:settings" shape="square" />
          <SrAvatar alt="苏白" :size="52" />
          <SrAvatar color="#8b5cf6" alt="自定义" />
          <SrAvatar src="https://i.pravatar.cc/80?img=12" alt="远程" size="lg" />
        </div>

        <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap">
          <SrAvatar alt="林深" />
          <SrAvatar alt="周夏" />
          <SrAvatar alt="陈默" />
          <SrAvatar alt="苏白" />
          <SrAvatar alt="顾言" />
          <span class="muted">← 底色按名字自动取，同一个人始终同色</span>
        </div>
      </div>
    </SrPanel>

    <SrPanel title="空状态" description="图标 + 描述 + 可选操作区。">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px">
        <SrEmpty />

        <SrEmpty description="没有匹配的组件" size="sm">
          <template #action>
            <SrButton size="sm" variant="outline">清空筛选</SrButton>
          </template>
        </SrEmpty>

        <SrEmpty description="换个关键词试试" icon="lucide:search" />
      </div>

      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 16px;
        "
      >
        <SrEmpty bordered description="虚线框占位，适合表格或画布" size="sm" />
        <SrEmpty
          image="https://illustrations.popsy.co/amber/box.svg"
          description="image 用插图替代图标"
          size="sm"
        />
      </div>
    </SrPanel>

    <SrPanel title="面包屑" description="支持自定义分隔符，超出条目数自动折叠。">
      <div style="display: flex; flex-direction: column; gap: 14px">
        <SrBreadcrumb :items="crumbs" />
        <SrBreadcrumb :items="longCrumbs" :max-items="4" separator="›" />
        <SrBreadcrumb :items="crumbs" separator-icon="lucide:chevron-right" />
        <SrBreadcrumb :items="disabledCrumbs" />
      </div>
    </SrPanel>

    <SrPanel
      title="标签页"
      description="四种外观加垂直方向，支持可关闭与懒加载。同一组数据换 type 就能切换形态。"
    >
      <div style="display: flex; flex-direction: column; gap: 26px">
        <div>
          <h3 class="sub-title">line（默认）</h3>
          <SrTabs v-model="activeTab" :items="tabs">
            <template #panel-overview>
              <p class="muted">概览内容：当前激活 {{ activeTab }}</p>
            </template>
            <template #panel-config>
              <p class="muted">配置内容</p>
            </template>
            <template #panel-log>
              <p class="muted">日志内容</p>
            </template>
          </SrTabs>
        </div>

        <div>
          <h3 class="sub-title">card（连接式卡片）</h3>
          <SrTabs :items="tabs" type="card" :model-value="'config'">
            <template #panel="{ item }">
              <p class="muted">{{ item.label }} 的面板，选中项与内容区连成一片。</p>
            </template>
          </SrTabs>
        </div>

        <div>
          <h3 class="sub-title">segment（分段控件）</h3>
          <SrTabs :items="tabs" type="segment" :model-value="'overview'">
            <template #panel="{ item }">
              <p class="muted">{{ item.label }} 的面板，背板内浮起，适合少量互斥项。</p>
            </template>
          </SrTabs>
        </div>

        <div>
          <h3 class="sub-title">pill（软标签）</h3>
          <SrTabs :items="tabs" type="pill" :model-value="'log'">
            <template #panel="{ item }">
              <p class="muted">{{ item.label }} 的面板，小圆角加主色淡底。</p>
            </template>
          </SrTabs>
        </div>

        <div>
          <h3 class="sub-title">pill（深色背景）</h3>
          <div class="dark-stage" data-sr-theme="dark">
            <SrTabs :items="tabs" type="pill" :model-value="'config'">
              <template #panel="{ item }">
                <p class="muted">{{ item.label }} 的面板，深色主题下自动换色。</p>
              </template>
            </SrTabs>
          </div>
        </div>

        <div>
          <h3 class="sub-title">bordered=false（去掉背板与边框）</h3>
          <p class="muted" style="margin-bottom: 10px">
            嵌在已有容器里时，用 <code>bordered</code> 关掉背板和边框，只留文字与选中底色。
          </p>
          <SrTabs :items="tabs" type="segment" :bordered="false" :model-value="'overview'">
            <template #panel="{ item }">
              <p class="muted">{{ item.label }} 的面板，没有背板。</p>
            </template>
          </SrTabs>
        </div>

        <div>
          <h3 class="sub-title">可关闭</h3>
          <SrTabs :items="closableTabs" closable @close="onTabClose">
            <template #panel="{ item }">
              <p class="muted">{{ item.label }} 的面板，点标签上的 × 可关闭。</p>
            </template>
          </SrTabs>
        </div>

        <div>
          <h3 class="sub-title">垂直方向</h3>
          <SrTabs :items="tabs" direction="vertical" :model-value="'overview'" style="height: 160px">
            <template #panel="{ item }">
              <p class="muted">{{ item.label }} 的竖排布局，指示器改为右侧竖线。</p>
            </template>
          </SrTabs>
        </div>
      </div>
    </SrPanel>

    <SrPanel
      title="下拉菜单"
      description="四种菜单形态：纯文字、纯图标、分组、带状态。触发方式支持点击与悬停。"
    >
      <div class="menu-row">
        <div class="menu-item">
          <span class="menu-label">纯文字菜单</span>
          <SrDropdown :items="textMenu" @select="onMenuSelect">
            <SrButton variant="outline" size="sm">更多操作</SrButton>
          </SrDropdown>
        </div>

        <div class="menu-item">
          <span class="menu-label">带图标菜单</span>
          <SrDropdown :items="iconMenu" @select="onMenuSelect">
            <SrButton variant="outline" size="sm">文件操作</SrButton>
          </SrDropdown>
        </div>

        <div class="menu-item">
          <span class="menu-label">分组菜单</span>
          <SrDropdown :items="groupedMenu" @select="onMenuSelect">
            <SrButton variant="outline" size="sm">编辑</SrButton>
          </SrDropdown>
        </div>

        <div class="menu-item">
          <span class="menu-label">选中 / 禁用 / 危险</span>
          <SrDropdown :items="stateMenu" @select="onMenuSelect">
            <SrButton variant="outline" size="sm">状态示例</SrButton>
          </SrDropdown>
        </div>
      </div>

      <div class="menu-row">
        <div class="menu-item">
          <span class="menu-label">悬停触发</span>
          <SrDropdown :items="textMenu" trigger="hover" @select="onMenuSelect">
            <SrButton variant="text" size="sm">鼠标移上来</SrButton>
          </SrDropdown>
        </div>

        <div class="menu-item">
          <span class="menu-label">右对齐</span>
          <SrDropdown :items="textMenu" placement="bottom-end" @select="onMenuSelect">
            <SrButton variant="outline" size="sm">贴右边</SrButton>
          </SrDropdown>
        </div>

        <div class="menu-item">
          <span class="menu-label">大尺寸</span>
          <SrDropdown :items="iconMenu" size="lg" @select="onMenuSelect">
            <SrButton variant="outline" size="sm">宽松密度</SrButton>
          </SrDropdown>
        </div>

        <div class="menu-item">
          <span class="menu-label">禁用</span>
          <SrDropdown :items="textMenu" disabled>
            <SrButton variant="outline" size="sm" disabled>不可用</SrButton>
          </SrDropdown>
        </div>
      </div>

      <p class="muted" style="margin-top: 14px">
        最近选择：<SrTag type="default">{{ lastAction }}</SrTag>
      </p>
    </SrPanel>

    <SrPanel title="抽屉" description="四个方向滑出，打开时锁定页面滚动，支持 Esc 与遮罩关闭。">
      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <SrButton size="sm" variant="primary" @click="drawerRight = true">右侧</SrButton>
        <SrButton size="sm" variant="outline" @click="drawerLeft = true">左侧</SrButton>
        <SrButton size="sm" variant="outline" @click="drawerTop = true">顶部</SrButton>
        <SrButton size="sm" variant="outline" @click="drawerSm = true">size = sm（320）</SrButton>
        <SrButton size="sm" variant="outline" @click="drawerLg = true">size = lg（600）</SrButton>
      </div>

      <SrDrawer v-model="drawerRight" title="筛选条件" subtitle="">
        <p style="margin: 0 0 12px">从右侧滑出，宽度可传 size 调整。</p>
        <SrEmpty description="这里放筛选表单" size="sm" />
        <template #footer>
          <SrButton size="sm" variant="text" @click="drawerRight = false">取消</SrButton>
          <SrButton size="sm" variant="primary" @click="drawerRight = false">应用</SrButton>
        </template>
      </SrDrawer>

      <SrDrawer v-model="drawerLeft" title="详情" placement="left" :size="320">
        <p style="margin: 0">左侧抽屉，宽度 320px。</p>
      </SrDrawer>

      <SrDrawer v-model="drawerTop" title="批量操作" placement="top" :size="220">
        <p style="margin: 0">顶部抽屉，高度 220px。</p>
      </SrDrawer>

      <SrDrawer v-model="drawerSm" title="窄抽屉" size="sm">
        <p style="margin: 0">size 传预设 sm，宽度 320px。</p>
      </SrDrawer>

      <SrDrawer v-model="drawerLg" title="宽抽屉" size="lg" :z-index="2400">
        <p style="margin: 0">size 传预设 lg，宽度 600px；同时用 z-index 抬高层级。</p>
      </SrDrawer>
    </SrPanel>

    <SrPanel title="Props 速查" description="九个展示与容器组件的关键配置。">
      <h3 class="props-title">SrCard</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>title</code> / <code>subtitle</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>头部标题与副标题</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>'xs' | 'sm' | 'md' | 'lg'</code></td>
            <td><code>'md'</code></td>
            <td>内边距档位</td>
          </tr>
          <tr>
            <td><code>bordered</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>显示外边框</td>
          </tr>
          <tr>
            <td><code>hoverable</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>悬停上浮</td>
          </tr>
        </tbody>
      </table>

      <h3 class="props-title">SrPanel</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>title</code> / <code>description</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>标题与说明</td>
          </tr>
          <tr>
            <td><code>collapsible</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>点击头部折叠</td>
          </tr>
          <tr>
            <td><code>modelValue</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>展开状态，支持 v-model</td>
          </tr>
          <tr>
            <td><code>flush</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>去掉内边距</td>
          </tr>
        </tbody>
      </table>

      <h3 class="props-title">SrBadge</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>value</code></td>
            <td><code>string | number</code></td>
            <td><code>''</code></td>
            <td>显示内容</td>
          </tr>
          <tr>
            <td><code>max</code></td>
            <td><code>number</code></td>
            <td><code>99</code></td>
            <td>数字上限，超出显示 max+</td>
          </tr>
          <tr>
            <td><code>dot</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>只显示圆点</td>
          </tr>
          <tr>
            <td><code>type</code></td>
            <td><code>'primary' | 'success' | 'warning' | 'danger' | 'info'</code></td>
            <td><code>'danger'</code></td>
            <td>颜色</td>
          </tr>
          <tr>
            <td><code>showZero</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>值为 0 时也显示</td>
          </tr>
        </tbody>
      </table>

      <h3 class="props-title">SrAvatar</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>src</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>图片地址，失败回退文字</td>
          </tr>
          <tr>
            <td><code>alt</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>替代文案，同时作为回退文字</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>'xs' | 'sm' | 'md' | 'lg' | number</code></td>
            <td><code>'md'</code></td>
            <td>尺寸，数字按 px</td>
          </tr>
          <tr>
            <td><code>shape</code></td>
            <td><code>'circle' | 'square'</code></td>
            <td><code>'circle'</code></td>
            <td>形状</td>
          </tr>
          <tr>
            <td><code>icon</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>回退图标，优先于文字</td>
          </tr>
        </tbody>
      </table>

      <h3 class="props-title">SrEmpty</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>description</code></td>
            <td><code>string</code></td>
            <td><code>'暂无数据'</code></td>
            <td>描述文案</td>
          </tr>
          <tr>
            <td><code>icon</code></td>
            <td><code>string</code></td>
            <td><code>'lucide:inbox'</code></td>
            <td>图标，空串则不显示</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>'xs' | 'sm' | 'md' | 'lg'</code></td>
            <td><code>'md'</code></td>
            <td>尺寸档位</td>
          </tr>
        </tbody>
      </table>

      <h3 class="props-title">SrBreadcrumb</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>items</code></td>
            <td><code>{ label, href?, icon? }[]</code></td>
            <td><code>[]</code></td>
            <td>条目，末项自动标记当前页</td>
          </tr>
          <tr>
            <td><code>separator</code></td>
            <td><code>string</code></td>
            <td><code>'/'</code></td>
            <td>分隔符</td>
          </tr>
          <tr>
            <td><code>maxItems</code></td>
            <td><code>number</code></td>
            <td><code>0</code></td>
            <td>超出则中间折叠，0 不折叠</td>
          </tr>
        </tbody>
      </table>

      <h3 class="props-title">SrTabs</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>modelValue</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>激活的 key，支持 v-model</td>
          </tr>
          <tr>
            <td><code>items</code></td>
            <td><code>{ key, label, icon?, disabled?, closable? }[]</code></td>
            <td><code>[]</code></td>
            <td>标签配置</td>
          </tr>
          <tr>
            <td><code>type</code></td>
            <td><code>'line' | 'card'</code></td>
            <td><code>'line'</code></td>
            <td>外观</td>
          </tr>
          <tr>
            <td><code>closable</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>全部可关闭</td>
          </tr>
          <tr>
            <td><code>lazy</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>未激活过的面板不渲染</td>
          </tr>
        </tbody>
      </table>
      <p class="props-note">
        面板内容用 <code>#panel-&lt;key&gt;</code> 具名插槽提供，也可用 <code>#panel</code> 统一渲染。
      </p>

      <h3 class="props-title">SrDropdown</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>类型</th>
            <th>默认</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>items</code></td>
            <td><code>{ key, label, icon?, disabled?, divided?, group? }[]</code></td>
            <td><code>[]</code></td>
            <td>菜单项</td>
          </tr>
          <tr>
            <td><code>trigger</code></td>
            <td><code>'click' | 'hover'</code></td>
            <td><code>'click'</code></td>
            <td>触发方式</td>
          </tr>
          <tr>
            <td><code>placement</code></td>
            <td><code>SrPlacement</code></td>
            <td><code>'bottom-start'</code></td>
            <td>弹出位置</td>
          </tr>
          <tr>
            <td><code>minWidth</code></td>
            <td><code>string | number</code></td>
            <td><code>160</code></td>
            <td>菜单最小宽度</td>
          </tr>
          <tr>
            <td><code>disabled</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>禁用</td>
          </tr>
        </tbody>
      </table>

      <h3 class="props-title">SrDrawer</h3>
      <table class="props-table">
        <thead>
          <tr>
            <th>Prop</th>
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
            <td>是否打开，支持 v-model</td>
          </tr>
          <tr>
            <td><code>placement</code></td>
            <td><code>'left' | 'right' | 'top' | 'bottom'</code></td>
            <td><code>'right'</code></td>
            <td>滑出方向</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>string | number</code></td>
            <td><code>''</code></td>
            <td>左右为宽度、上下为高度</td>
          </tr>
          <tr>
            <td><code>title</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>标题，留空不渲染头部</td>
          </tr>
          <tr>
            <td><code>maskClosable</code> / <code>escToClose</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>遮罩关闭 / Esc 关闭</td>
          </tr>
          <tr>
            <td><code>lockScroll</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>打开时锁定页面滚动</td>
          </tr>
        </tbody>
      </table>
    </SrPanel>
  </div>
</template>

<style scoped>
/* 面板自身不带外边距，间距由页面容器统一给 */
.display-page {
  display: flex;
  flex-direction: column;
  gap: var(--sr-space-4);
}

.demo-block {
  display: inline-block;
  padding: 2px 10px;
  border: 1px solid var(--sr-color-border);
  border-radius: var(--sr-radius-sm);
  font-size: 13px;
}

/* 局部深色舞台：挂 data-sr-theme 后内部 token 整体切到暗色 */
.dark-stage {
  padding: 18px;
  border-radius: 14px;
  background: var(--sr-color-bg-elevated);
}

/* 下拉演示：每个触发器配一行说明，避免按钮挤成一排看不出区别 */
.menu-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 28px;
}

.menu-row + .menu-row {
  margin-top: 18px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-label {
  font-size: 12px;
  color: var(--sr-color-text-tertiary);
  white-space: nowrap;
}

.sub-title {
  margin: 22px 0 10px;
  font-size: 14px;
  font-weight: 600;
}

.sub-title:first-child {
  margin-top: 0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.card-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* padding="none" 时内容区贴边，用它演示 */
.flush-block {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 68px;
  background: linear-gradient(120deg, var(--sr-color-primary-alpha-12), var(--sr-color-primary-alpha-08));
  color: var(--sr-color-primary-text);
  font-size: 13px;
}

.card-swatch {
  width: 20px;
  height: 20px;
  border-radius: var(--sr-radius-sm);
  background: var(--sr-color-primary);
}

.muted {
  margin: 0;
  font-size: 13px;
  color: var(--sr-color-text-tertiary);
}

.props-title {
  margin: 20px 0 8px;
  font-size: 14px;
  font-weight: 600;
}

.props-title:first-child {
  margin-top: 0;
}

.props-note {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--sr-color-text-tertiary);
}
</style>
