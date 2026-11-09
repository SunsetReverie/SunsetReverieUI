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

.tag {
  display: block;
  margin-bottom: 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}
</style>
