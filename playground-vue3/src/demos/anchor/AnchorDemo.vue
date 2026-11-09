<script setup lang="ts">
import { ref } from 'vue'
import { SrAnchor, SrTag, type SrAnchorItem } from '@sunset-reverie/ui'

defineOptions({ name: 'AnchorDemo' })

/** 当前激活项（受控演示用） */
const activeKey = ref('')

/** 演示站的滚动容器不是 window，是内容区 */
const CONTAINER = '.pg__body'

/** 基础目录（两级） */
const basicItems: SrAnchorItem[] = [
  { key: 'a-intro', title: '组件简介' },
  {
    key: 'a-usage',
    title: '快速开始',
    children: [
      { key: 'a-install', title: '安装' },
      { key: 'a-import', title: '引入' },
    ],
  },
  { key: 'a-config', title: '配置项' },
  { key: 'a-faq', title: '常见问题' },
]

/** 三级目录 */
const deepItems: SrAnchorItem[] = [
  {
    key: 'a-deep-1',
    title: '第一章 基础',
    children: [
      {
        key: 'a-deep-1-1',
        title: '1.1 环境准备',
        children: [{ key: 'a-deep-1-1-1', title: '1.1.1 Node 版本' }],
      },
      { key: 'a-deep-1-2', title: '1.2 初始化' },
    ],
  },
  {
    key: 'a-deep-2',
    title: '第二章 进阶',
    children: [{ key: 'a-deep-2-1', title: '2.1 自定义主题' }],
  },
]

/** 折叠演示：数据指向本区块自己的标题 */
const foldItems: SrAnchorItem[] = [
  {
    key: 'fold-a',
    title: '一、安装',
    children: [
      { key: 'fold-a-1', title: '1.1 依赖' },
      { key: 'fold-a-2', title: '1.2 引入' },
    ],
  },
  {
    key: 'fold-b',
    title: '二、配置',
    children: [
      { key: 'fold-b-1', title: '2.1 主题' },
      { key: 'fold-b-2', title: '2.2 国际化' },
    ],
  },
]

/** 折叠演示的展开状态（受控，方便把值显示出来） */
const foldExpanded = ref<string[]>([])

/** 折叠演示的当前项 */
const foldActive = ref('')

/** 是否开启自动展开 */
const autoExpandOn = ref(true)

/** 激活样式 */
const activeVariants = [
  { key: 'line', name: '竖线', desc: '默认，最干净' },
  { key: 'block', name: '底色块', desc: '强调当前项' },
  { key: 'pill', name: '胶囊', desc: '圆润，偏移动端' },
  { key: 'dot', name: '小圆点', desc: '克制，有指示感' },
  { key: 'bold', name: '仅加粗', desc: '最轻，无任何附加' },
] as const

/** 横向目录 */
const flatItems: SrAnchorItem[] = [
  { key: 'a-intro', title: '简介' },
  { key: 'a-usage', title: '快速开始' },
  { key: 'a-config', title: '配置项' },
  { key: 'a-faq', title: '常见问题' },
]
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础用法（吸顶 + 高亮滑块）</h3>
      <p class="hint" style="margin: 0 0 14px">
        右侧目录会跟随滚动高亮当前章节，点击平滑跳转。演示站的内容区是独立滚动容器， 所以传了
        <code>container=".pg__body"</code>
      </p>

      <div class="doc">
        <article class="doc__body">
          <h2 id="a-intro">组件简介</h2>
          <p v-for="i in 3" :key="`intro-${i}`" class="para">
            锚点导航用于长文档的章节跳转。它监听滚动位置，自动高亮当前所在的章节，
            点击标题则平滑滚动到对应位置。这比单纯用 <code>position: sticky</code>
            多做了两件关键的事：<b>知道你在哪</b>与<b>带你去那</b>。
          </p>

          <h2 id="a-usage">快速开始</h2>
          <p v-for="i in 2" :key="`usage-${i}`" class="para">
            先准备好数据，每条包含 <code>key</code>（对应页面里的元素 id）和
            <code>title</code>。有子章节就放进 <code>children</code>，层级不限。
          </p>

          <h3 id="a-install">安装</h3>
          <p v-for="i in 3" :key="`install-${i}`" class="para">
            装完之后在入口引入样式，组件本身零依赖。注意 <code>offsetTop</code>
            要设成固定头栏的高度，否则标题会被遮住一截。
          </p>

          <h3 id="a-import">引入</h3>
          <p v-for="i in 3" :key="`import-${i}`" class="para">
            按需引入即可。如果页面用的是独立滚动容器（比如后台布局里的内容区）， 记得把
            <code>container</code> 传进去，否则监听的是 window、永远不触发。
          </p>

          <h2 id="a-config">配置项</h2>
          <p v-for="i in 4" :key="`config-${i}`" class="para">
            常用的是 <code>offsetTop</code>（滚动偏移）、<code>affix</code>（吸顶）、
            <code>syncHash</code>（写入地址栏）。其中 <code>syncHash</code>
            在前台文章页很实用，分享出去的链接能直接定位到某个章节。
          </p>

          <h2 id="a-faq">常见问题</h2>
          <p v-for="i in 4" :key="`faq-${i}`" class="para">
            如果高亮在两个章节之间反复跳，把 <code>bounds</code> 调大一点；
            如果内容不足一屏、永远高亮第一项，那是正常的——没有可滚动的空间。
          </p>
        </article>

        <aside class="doc__side">
          <SrAnchor
            :items="basicItems"
            :container="CONTAINER"
            :offset-top="24"
            affix
            :affix-offset="78"
            sync-hash
          />
        </aside>
      </div>
    </section>

    <section>
      <h3>三级目录</h3>
      <div class="doc">
        <article class="doc__body">
          <h2 id="a-deep-1">第一章 基础</h2>
          <p v-for="i in 3" :key="`d1-${i}`" class="para">
            层级不限，靠递归渲染。子项激活时父级也会高亮，这样能看出自己在哪个大章节里。
          </p>

          <h3 id="a-deep-1-1">1.1 环境准备</h3>
          <p v-for="i in 3" :key="`d11-${i}`" class="para">
            第三层会再缩进一次，字号也更小一点，层级关系靠间距和字号区分，不加额外符号。
          </p>

          <h4 id="a-deep-1-1-1">1.1.1 Node 版本</h4>
          <p v-for="i in 3" :key="`d111-${i}`" class="para">
            建议 Node 18 以上。低版本缺少一些新的 API，构建时会报错。
          </p>

          <h3 id="a-deep-1-2">1.2 初始化</h3>
          <p v-for="i in 3" :key="`d12-${i}`" class="para">
            初始化之后先跑一次构建，确认基础链路是通的，再开始写业务。
          </p>

          <h2 id="a-deep-2">第二章 进阶</h2>
          <p v-for="i in 3" :key="`d2-${i}`" class="para">进阶部分涉及主题定制与构建优化，可以按需阅读。</p>

          <h3 id="a-deep-2-1">2.1 自定义主题</h3>
          <p v-for="i in 4" :key="`d21-${i}`" class="para">
            主题通过 CSS 变量下发，改一组变量就能整体换色，不需要覆盖组件样式。
          </p>
        </article>

        <aside class="doc__side">
          <SrAnchor :items="deepItems" :container="CONTAINER" :offset-top="24" affix :affix-offset="78" />
        </aside>
      </div>
    </section>

    <section>
      <h3>激活样式（activeVariant）</h3>
      <div class="grid">
        <div v-for="v in activeVariants" :key="v.key" class="variant-card">
          <div class="variant-card__stage">
            <SrAnchor
              :items="flatItems"
              :container="CONTAINER"
              :active-variant="v.key"
              :active-key="'a-usage'"
              :show-marker="false"
              :offset-top="24"
            />
          </div>
          <p class="variant-card__name">{{ v.name }}</p>
          <p class="variant-card__desc">{{ v.desc }}</p>
          <code class="variant-card__code">{{ v.key }}</code>
        </div>
      </div>
      <p class="hint">五种内置样式都由同一组 CSS 变量驱动，所以也能直接覆盖变量做完全自定义（见下一节）</p>
    </section>

    <section>
      <h3>深度自定义（整组变量）</h3>
      <div class="row">
        <div class="themed-anchor">
          <SrAnchor
            :items="basicItems"
            :container="CONTAINER"
            :active-key="'a-usage'"
            :offset-top="24"
            :show-toggle="false"
            collapsible
          />
        </div>
        <div>
          <p class="hint" style="margin: 0 0 8px; max-width: 340px">
            下面这组变量同时改了字号、行距、缩进、竖线粗细与颜色， 组件本身一行没动：
          </p>
          <pre class="code-block">
--sr-anchor-font-size: 15px;
--sr-anchor-font-size-sub: 13px;
--sr-anchor-row-pad-y: 9px;
--sr-anchor-line-gap: 18px;
--sr-anchor-sub-indent: 16px;
--sr-anchor-marker: #7c5cff;
--sr-anchor-marker-width: 4px;
--sr-anchor-color: #6b7280;
--sr-anchor-color-sub: #9ca3af;
--sr-anchor-bg-hover: #f3f0ff;</pre>
        </div>
      </div>
    </section>

    <section>
      <h3>完全自定义激活样式</h3>
      <div class="row">
        <div class="custom-anchor">
          <SrAnchor :items="flatItems" :container="CONTAINER" :active-key="'a-config'" :offset-top="24" />
        </div>
        <div>
          <p class="hint" style="margin: 0 0 8px; max-width: 340px">覆盖这几个变量即可，不需要改组件样式：</p>
          <pre class="code-block">
--sr-anchor-active-color: #fff;
--sr-anchor-active-bg: #1f7a4d;
--sr-anchor-active-weight: 600;
--sr-anchor-active-radius: 6px;
--sr-anchor-indicator-w: 0;</pre>
        </div>
      </div>
    </section>

    <section>
      <h3>折叠 + 自动展开</h3>
      <p class="hint" style="margin: 0 0 12px">
        左边初始是收起的。往下滚这一段正文，经过「1.1 依赖」「2.1 主题」这类子章节时，
        对应的父级会<b>自动展开</b>——这是 <code>auto-expand</code> 的作用，不需要手动点箭头
      </p>

      <div class="row" style="margin-bottom: 10px">
        <SrTag size="sm">当前项：{{ foldActive || '未激活' }}</SrTag>
        <SrTag size="sm">展开中：{{ foldExpanded.join(', ') || '无' }}</SrTag>
        <label class="switch">
          <input v-model="autoExpandOn" type="checkbox" />
          <span>autoExpand</span>
        </label>
      </div>

      <div class="row" style="margin-bottom: 14px; align-items: flex-start">
        <div class="mini-box">
          <span class="tag">箭头在右（toggle-position="right"）</span>
          <SrAnchor
            :items="foldItems"
            :container="CONTAINER"
            :offset-top="24"
            :auto-expand="false"
            :active-key="'fold-a-1'"
            collapsible
            toggle-position="right"
          />
        </div>
        <div class="mini-box">
          <span class="tag">不显示箭头（:show-toggle="false"）</span>
          <SrAnchor
            :items="foldItems"
            :container="CONTAINER"
            :offset-top="24"
            :auto-expand="false"
            :active-key="'fold-a-1'"
            :show-toggle="false"
            collapsible
          />
        </div>
        <p class="hint" style="margin: 0; max-width: 220px">
          两个都是展开态。不显示箭头时仍可通过
          <code>v-model:expanded-keys</code> 控制展开
        </p>
      </div>

      <div class="doc">
        <article class="doc__body doc__body--fold">
          <h4 id="fold-a">一、安装</h4>
          <p v-for="i in 2" :key="`fa-${i}`" class="para">
            安装部分说明依赖与引入方式。现在左侧只展开了父级，子级还在收起的。
          </p>

          <h5 id="fold-a-1">1.1 依赖</h5>
          <p v-for="i in 2" :key="`fa1-${i}`" class="para">
            滚到这一行时，「一、安装」会自动展开，露出「1.1 依赖」并高亮它。
          </p>

          <h5 id="fold-a-2">1.2 引入</h5>
          <p v-for="i in 2" :key="`fa2-${i}`" class="para">继续往下，高亮移到「1.2 引入」，父级保持展开。</p>

          <h4 id="fold-b">二、配置</h4>
          <p v-for="i in 2" :key="`fb-${i}`" class="para">
            进入第二章，第一个父级「一、安装」不会自动收起——展开是累积的， 只有你点箭头才会收回去。
          </p>

          <h5 id="fold-b-1">2.1 主题</h5>
          <p v-for="i in 2" :key="`fb1-${i}`" class="para">
            到这一节时，「二、配置」展开。把上面的 autoExpand 关掉再滚一次，就不会自动开了。
          </p>

          <h5 id="fold-b-2">2.2 国际化</h5>
          <p v-for="i in 3" :key="`fb2-${i}`" class="para">
            最后一节。滚到这里，「二、配置」下的两个子项都已展开。
          </p>
        </article>

        <aside class="doc__side">
          <SrAnchor
            v-model:active-key="foldActive"
            v-model:expanded-keys="foldExpanded"
            :items="foldItems"
            :container="CONTAINER"
            :offset-top="24"
            :auto-expand="autoExpandOn"
            :default-expand-all="false"
            collapsible
            affix
            :affix-offset="78"
          />
        </aside>
      </div>
    </section>

    <section>
      <h3>限制显示层级（maxDepth）</h3>
      <div class="row">
        <div class="side-box">
          <SrAnchor :items="deepItems" :container="CONTAINER" :max-depth="1" :offset-top="24" />
          <p class="hint" style="margin: 6px 0 0; text-align: center">maxDepth = 1</p>
        </div>
        <div class="side-box">
          <SrAnchor :items="deepItems" :container="CONTAINER" :max-depth="2" :offset-top="24" />
          <p class="hint" style="margin: 6px 0 0; text-align: center">maxDepth = 2</p>
        </div>
        <div class="side-box">
          <SrAnchor :items="deepItems" :container="CONTAINER" :offset-top="24" />
          <p class="hint" style="margin: 6px 0 0; text-align: center">不限（默认 0）</p>
        </div>
      </div>
      <p class="hint">目录太长时只显示前两层，内容和层级都能收敛住</p>
    </section>

    <section>
      <h3>横向模式</h3>
      <SrAnchor :items="flatItems" :container="CONTAINER" direction="horizontal" :offset-top="24" />
      <p class="hint">
        <code>direction="horizontal"</code> 时滑块变成底部横条；子级会自动隐藏，
        适合顶部导航。超宽时可以横向滚动。
      </p>
    </section>

    <section>
      <h3>不显示滑块</h3>
      <div class="row">
        <div class="side-box">
          <SrAnchor :items="flatItems" :container="CONTAINER" :show-marker="false" :offset-top="24" />
        </div>
        <p class="hint" style="margin: 0; max-width: 300px">
          <code>:show-marker="false"</code> 只靠文字颜色和底色表达激活态， 更轻，适合目录本身就很显眼的位置
        </p>
      </div>
    </section>

    <section>
      <h3>受控激活项</h3>
      <div class="row">
        <div class="side-box">
          <SrAnchor
            v-model:active-key="activeKey"
            :items="flatItems"
            :container="CONTAINER"
            :offset-top="24"
          />
        </div>
        <div>
          <p class="hint" style="margin: 0 0 6px">
            当前：<SrTag size="sm">{{ activeKey || '未激活' }}</SrTag>
          </p>
          <p class="hint" style="margin: 0; max-width: 320px">
            传了 <code>activeKey</code> 就以外部为准，组件不再自己改。 滚动和点击仍然会派发
            <code>update:activeKey</code>，由你决定是否接受
          </p>
        </div>
      </div>
    </section>

    <section>
      <h3>典型场景：文章页侧边目录</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">前台博客 / 文档站</span>
          <p class="hint" style="margin: 0">右侧吸顶目录 + <code>sync-hash</code> 分享定位，是最常见的组合</p>
        </div>
        <div class="card">
          <span class="tag">后台长表单</span>
          <p class="hint" style="margin: 0">左侧目录分节，配合 <code>offset-top</code> 避开固定头栏</p>
        </div>
        <div class="card">
          <span class="tag">设置页</span>
          <p class="hint" style="margin: 0">横向模式放在顶部，一屏内切换几个设置分组</p>
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

/* 两栏：正文 + 目录 */
.doc {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  gap: 24px;
  align-items: start;
  padding: 16px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.doc__body {
  min-width: 0;
}

.doc__body h2 {
  margin: 18px 0 8px;
  color: var(--sr-color-text);
  font-size: 15px;
  font-weight: var(--sr-font-weight-semibold);
}

.doc__body h2:first-child {
  margin-top: 0;
}

.doc__body h3 {
  margin: 14px 0 6px;
  color: var(--sr-color-text);
  font-size: 13.5px;
  font-weight: var(--sr-font-weight-medium);
}

.doc__body--fold {
  /* 内容短一些，一屏内就能滚完，方便看自动展开 */
  min-height: 900px;
}

.doc__body h4 {
  margin: 12px 0 6px;
  color: var(--sr-color-text-secondary);
  font-size: 12.5px;
  font-weight: var(--sr-font-weight-medium);
}

.para {
  margin: 0 0 10px;
  color: var(--sr-color-text-tertiary);
  font-size: 12.5px;
  line-height: 1.8;
}

.doc__side {
  /* 吸顶的锚点需要这一列自身有高度，否则 sticky 没有活动空间 */
  align-self: stretch;
  min-height: 260px;
}

.row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.side-box {
  width: 200px;
}

.variant-card {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 2px;
  padding: 12px 10px 10px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.variant-card__stage {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  min-height: 130px;
}

.variant-card__name {
  margin: 4px 0 0;
  color: var(--sr-color-text);
  font-size: 12.5px;
  font-weight: var(--sr-font-weight-medium);
}

.variant-card__desc {
  margin: 0;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
  text-align: center;
}

.variant-card__code {
  margin-top: 4px;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-tertiary);
  font-family: var(--sr-font-family-mono);
  font-size: 10.5px;
}

/* 用变量做完全自定义的示例 */
.custom-anchor {
  width: 200px;
}

.custom-anchor :deep(.sr-anchor) {
  --sr-anchor-active-color: #fff;
  --sr-anchor-active-bg: #1f7a4d;
  --sr-anchor-active-weight: 600;
  --sr-anchor-active-radius: 6px;
  /* 深色底时竖线要单独指定，否则还是主色，压在块上很突兀 */
  --sr-anchor-marker: #4ade80;
}

.code-block {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--sr-radius-sm);
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-secondary);
  font-family: var(--sr-font-family-mono);
  font-size: 11px;
  line-height: 1.8;
  white-space: pre;
  overflow-x: auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.card {
  padding: 14px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

/* 整组变量替换，模拟「前台项目接入自己的设计语言」 */
.themed-anchor {
  width: 240px;
}

.themed-anchor :deep(.sr-anchor) {
  --sr-anchor-font-size: 15px;
  --sr-anchor-font-size-sub: 13px;
  --sr-anchor-row-pad-y: 9px;
  --sr-anchor-line-gap: 18px;
  --sr-anchor-sub-indent: 16px;
  --sr-anchor-marker: #7c5cff;
  --sr-anchor-marker-width: 4px;
  --sr-anchor-color: #6b7280;
  --sr-anchor-color-sub: #9ca3af;
  --sr-anchor-bg-hover: #f3f0ff;
}

.mini-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 200px;
}

.mini-box .tag {
  margin-bottom: 0;
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--sr-color-text-tertiary);
  font-family: var(--sr-font-family-mono);
  font-size: 11.5px;
  cursor: pointer;
}

.switch input {
  margin: 0;
  accent-color: var(--sr-color-primary);
}

.tag {
  display: block;
  margin-bottom: 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}
</style>
