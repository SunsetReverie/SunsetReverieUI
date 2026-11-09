import { describe, expect, it } from 'vitest'

import { buildEmojiMap } from '../../emoji-picker/src/parse'
import { parseMarkdownBuiltin, srCountMarkdownText } from '../src/builtin-parser'

describe('parseMarkdownBuiltin', () => {
  it('空输入返回空字符串', () => {
    expect(parseMarkdownBuiltin('')).toBe('')
  })

  it('渲染标题', () => {
    const html = parseMarkdownBuiltin('# 一级\n\n### 三级')
    expect(html).toContain('<h1 class="sr-md__h sr-md__h--1">一级</h1>')
    expect(html).toContain('<h3 class="sr-md__h sr-md__h--3">三级</h3>')
  })

  it('渲染段落', () => {
    const html = parseMarkdownBuiltin('一段文字')
    expect(html).toBe('<p class="sr-md__p">一段文字</p>')
  })

  it('段落内的换行变成 br', () => {
    const html = parseMarkdownBuiltin('第一行\n第二行')
    expect(html).toContain('第一行<br />第二行')
  })

  it('渲染无序与有序列表', () => {
    const ul = parseMarkdownBuiltin('- a\n- b')
    expect(ul).toContain('sr-md__list--ul')
    expect(ul).toContain('<li class="sr-md__li">a</li>')

    const ol = parseMarkdownBuiltin('1. a\n2. b')
    expect(ol).toContain('sr-md__list--ol')
  })

  it('渲染引用', () => {
    const html = parseMarkdownBuiltin('> 引用内容')
    expect(html).toContain('<blockquote class="sr-md__quote">')
    expect(html).toContain('引用内容')
  })

  it('渲染分割线', () => {
    expect(parseMarkdownBuiltin('---')).toContain('<hr class="sr-md__hr" />')
  })

  it('渲染表格与对齐', () => {
    const html = parseMarkdownBuiltin('| a | b |\n| :-- | --: |\n| 1 | 2 |')

    expect(html).toContain('sr-md__table')
    expect(html).toContain('text-align: left')
    expect(html).toContain('text-align: right')
    expect(html).toContain('sr-md__td')
  })

  it('渲染代码块并带语言标记', () => {
    const html = parseMarkdownBuiltin('```ts\nconst a = 1\n```')

    expect(html).toContain('data-lang="ts"')
    expect(html).toContain('sr-md__code-lang">ts<')
    // 默认开着色：关键字与数字各包一层 token，文本被 span 切开属正常
    expect(html).toContain('sr-md__tok--kw">const<')
    expect(html).toContain('sr-md__tok--num">1<')
    expect(html).toContain('sr-md__copy')
  })

  it('可以关掉着色、行号与复制按钮', () => {
    const html = parseMarkdownBuiltin('```ts\nconst a = 1\n```', {
      highlight: false,
      lineNumbers: false,
      copy: false,
    })

    expect(html).not.toContain('sr-md__tok')
    expect(html).not.toContain('sr-md__copy')
    expect(html).toContain('const a = 1')
  })

  it('开启行号时每行一个容器', () => {
    const html = parseMarkdownBuiltin('```ts\na\n\nb\n```', { lineNumbers: true })

    // 3 行 → 3 个容器，空行用零宽空格撑住高度
    expect(html.match(/sr-md__code-line/g)).toHaveLength(3)
    expect(html).toContain('&#8203;')
  })

  it('语言标识支持中文与符号，且不会卡死', () => {
    // 曾经的 bug：fence 正则只认 [\w-]，```中文 落到段落分支后被块级判断
    // 打断，但 index 不前进，外层 while 无限循环，整个页面卡死
    for (const lang of ['中文', 'c++', 'C#', '日本語']) {
      const html = parseMarkdownBuiltin('```' + lang + '\ncode\n```')
      expect(html).toContain(`data-lang="${lang}"`)
    }
  })

  it('非法 fence 行降级为段落，不重复消费', () => {
    // 带空格的多词标识不算合法 fence，要退化成普通段落，且不能死循环
    const html = parseMarkdownBuiltin('``` js x')
    expect(html).toContain('sr-md__p')
    expect(html).toContain('``` js x')
  })

  it('渲染行内代码', () => {
    const html = parseMarkdownBuiltin('用 `code` 表示')
    expect(html).toContain('<code class="sr-md__code">code</code>')
  })

  it('渲染强调语法', () => {
    expect(parseMarkdownBuiltin('**粗**')).toContain('<strong>粗</strong>')
    expect(parseMarkdownBuiltin('*斜*')).toContain('<em>斜</em>')
    expect(parseMarkdownBuiltin('~~删~~')).toContain('<del>删</del>')
  })

  it('渲染链接并加安全属性', () => {
    const html = parseMarkdownBuiltin('[站点](https://example.com)')

    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('渲染图片并加懒加载', () => {
    const html = parseMarkdownBuiltin('![图](https://example.com/a.png)')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('alt="图"')
  })

  it('行内代码里的强调符号不被解析', () => {
    const html = parseMarkdownBuiltin('`**不该加粗**`')

    // 星号原样留在 code 里，没有被粗体规则吃掉
    expect(html).toBe('<p class="sr-md__p"><code class="sr-md__code">**不该加粗**</code></p>')
    expect(html).not.toContain('<strong>')
  })

  it('图片优先于链接解析', () => {
    const html = parseMarkdownBuiltin('![a](https://e.com/a.png)')
    expect(html).toContain('<img')
    expect(html).not.toContain('<a class="sr-md__link"')
  })
})

describe('安全', () => {
  it('HTML 标签被转义', () => {
    const html = parseMarkdownBuiltin('<script>alert(1)</script>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('javascript: 链接被拦下并退回原文', () => {
    const html = parseMarkdownBuiltin('[点我](javascript:alert(1))')

    expect(html).not.toContain('href="javascript:')
    // 整段退回原文，而不是留下残缺的「点我)」
    expect(html).toContain('javascript:alert(1)')
  })

  it('data:text/html 图片被拦下', () => {
    const html = parseMarkdownBuiltin('![x](data:text/html,<script>1</script>)')
    expect(html).not.toContain('src="data:text/html')
  })

  it('data:image 图片放行', () => {
    const html = parseMarkdownBuiltin('![x](data:image/png;base64,AAAA)')
    expect(html).toContain('src="data:image/png;base64,AAAA"')
  })

  it('相对路径与锚点放行', () => {
    expect(parseMarkdownBuiltin('[a](/docs/a)')).toContain('href="/docs/a"')
    expect(parseMarkdownBuiltin('[a](#section)')).toContain('href="#section"')
  })

  it('mailto 与 tel 放行', () => {
    expect(parseMarkdownBuiltin('[m](mailto:a@b.com)')).toContain('href="mailto:a@b.com"')
    expect(parseMarkdownBuiltin('[t](tel:10086)')).toContain('href="tel:10086"')
  })

  it('属性里的引号不能逃逸', () => {
    const html = parseMarkdownBuiltin('[a](https://e.com/"onmouseover="alert(1))')
    // 转义后引号变成实体，无法闭合属性
    expect(html).not.toContain('onmouseover="alert')
  })
})

describe('srCountMarkdownText', () => {
  it('剔除语法符号后计数', () => {
    expect(srCountMarkdownText('## 标题')).toBe(2)
    expect(srCountMarkdownText('**粗体**')).toBe(2)
  })

  it('剔除代码块与链接地址', () => {
    expect(srCountMarkdownText('```\ncode\n```')).toBe(0)
    expect(srCountMarkdownText('[文字](https://example.com)')).toBe(2)
  })

  it('不统计空白', () => {
    expect(srCountMarkdownText('   \n\n  ')).toBe(0)
  })
})

describe('表情标记', () => {
  /** 一份最小的表情包：一个字符表情 + 一个图片表情 + 一个坏地址 */
  const map = buildEmojiMap([
    {
      key: 'test',
      name: '测试',
      emojis: [
        { name: '微笑', char: '🙂' },
        { name: '狗头', url: 'https://cdn.example.com/dog.png' },
        { name: '坏图', url: 'javascript:alert(1)' },
      ],
    },
  ])

  it('字符表情直接输出 Unicode，不生成 img', () => {
    const html = parseMarkdownBuiltin('你好[微笑]', { emoji: map })
    expect(html).toContain('🙂')
    expect(html).not.toContain('<img')
  })

  it('图片表情输出 img，地址不安全时退回原文', () => {
    const ok = parseMarkdownBuiltin('[狗头]', { emoji: map })
    expect(ok).toContain('class="sr-md__emoji"')
    expect(ok).toContain('src="https://cdn.example.com/dog.png"')

    const bad = parseMarkdownBuiltin('[坏图]', { emoji: map })
    expect(bad).toContain('[坏图]')
    expect(bad).not.toContain('<img')
  })

  it('未命中、代码块内、链接文字都不当成表情', () => {
    expect(parseMarkdownBuiltin('[不存在]', { emoji: map })).toContain('[不存在]')
    // 代码块里的方括号是代码本身
    const fenced = '```' + '\n' + '[微笑]' + '\n' + '```'
    expect(parseMarkdownBuiltin(fenced, { emoji: map })).not.toContain('🙂')
    // 链接优先：方括号后面跟着 (url) 就是链接
    const link = parseMarkdownBuiltin('[微笑](https://a.com)', { emoji: map })
    expect(link).toContain('sr-md__link')
    expect(link).not.toContain('🙂')
  })

  it('不传表情表时保持原样', () => {
    expect(parseMarkdownBuiltin('[微笑]')).toBe('<p class="sr-md__p">[微笑]</p>')
  })
})
