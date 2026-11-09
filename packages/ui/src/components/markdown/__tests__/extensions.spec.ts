import { describe, expect, it } from 'vitest'

import type { SrMarkdownExtension } from '../src/extensions'
import { srPreprocess } from '../src/extensions'

/** 内联短代码：{{image id=1}} */
const inlineExt: SrMarkdownExtension = {
  name: 'image',
  inline: /\{\{image\s+id=(\d+)\}\}/g,
  render: (match) => `<span class="ext-image" data-id="${match[1]}"></span>`,
}

/** 块级短代码：::: gallery ... ::: */
const blockExt: SrMarkdownExtension = {
  name: 'gallery',
  block: /^:::\s*gallery\s*\n([\s\S]*?)\n:::\s*$/gm,
  render: (match, ctx) => `<div class="ext-gallery">${ctx.escape(match[1] ?? '')}</div>`,
}

describe('srPreprocess', () => {
  it('没有扩展时原样返回', () => {
    const result = srPreprocess('原文', [])

    expect(result.text).toBe('原文')
    expect(result.matched).toBe(false)
    expect(result.restore('<p>x</p>')).toBe('<p>x</p>')
  })

  it('内联短代码被换成占位符', () => {
    const result = srPreprocess('前面 {{image id=7}} 后面', [inlineExt])

    expect(result.matched).toBe(true)
    expect(result.text).not.toContain('{{image')
    expect(result.text).toContain('前面')
    expect(result.text).toContain('后面')
  })

  it('还原后变回 HTML', () => {
    const result = srPreprocess('{{image id=7}}', [inlineExt])
    const html = result.restore(`<p>${result.text}</p>`)

    expect(html).toBe('<p><span class="ext-image" data-id="7"></span></p>')
  })

  it('多处短代码各自还原', () => {
    const result = srPreprocess('{{image id=1}} 与 {{image id=2}}', [inlineExt])
    const html = result.restore(result.text)

    expect(html).toContain('data-id="1"')
    expect(html).toContain('data-id="2"')
  })

  it('块级围栏整块替换', () => {
    const result = srPreprocess('前\n\n::: gallery\n图A\n图B\n:::\n\n后', [blockExt])

    expect(result.matched).toBe(true)
    expect(result.text).not.toContain(':::')
    expect(result.text).toContain('前')
    expect(result.text).toContain('后')

    const html = result.restore(result.text)
    expect(html).toContain('<div class="ext-gallery">图A\n图B</div>')
  })

  it('块级先于内联执行', () => {
    const order: string[] = []

    const block: SrMarkdownExtension = {
      name: 'b',
      block: /^:::\s*x\s*\n([\s\S]*?)\n:::\s*$/gm,
      render: () => {
        order.push('block')
        return '<div></div>'
      },
    }

    const inline: SrMarkdownExtension = {
      name: 'i',
      inline: /\{\{y\}\}/g,
      render: () => {
        order.push('inline')
        return '<i></i>'
      },
    }

    srPreprocess('::: x\n内容\n:::\n\n{{y}}', [block, inline])
    // 先整块替换，再处理剩下的内联
    expect(order).toEqual(['block', 'inline'])
  })

  it('围栏内的内联短代码被整块吞掉，不会被单独替换', () => {
    const result = srPreprocess('::: gallery\n{{image id=9}}\n:::', [blockExt, inlineExt])

    // 块级已经吃掉整块，内联规则扫不到里面的内容
    const html = result.restore(result.text)
    expect(html).toContain('{{image id=9}}')
    expect(html).not.toContain('ext-image')
  })

  it('上下文提供转义', () => {
    const ext: SrMarkdownExtension = {
      name: 'raw',
      inline: /\{\{raw (.*?)\}\}/g,
      render: (match, ctx) => `<span>${ctx.escape(match[1] ?? '')}</span>`,
    }

    const result = srPreprocess('{{raw <script>}}', [ext])
    const html = result.restore(result.text)

    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('上下文提供地址校验', () => {
    const ext: SrMarkdownExtension = {
      name: 'link',
      inline: /\{\{link (.*?)\}\}/g,
      render: (match, ctx) => `<a href="${ctx.safeUrl(match[1] ?? '')}">x</a>`,
    }

    const bad = srPreprocess('{{link javascript:alert(1)}}', [ext])
    expect(bad.restore(bad.text)).toContain('href="#"')

    const good = srPreprocess('{{link /docs}}', [ext])
    expect(good.restore(good.text)).toContain('href="/docs"')
  })

  it('未命中时不改变文本', () => {
    const result = srPreprocess('普通文本', [inlineExt, blockExt])

    expect(result.text).toBe('普通文本')
    expect(result.matched).toBe(false)
  })

  it('没有捕获组的扩展也能工作', () => {
    const ext: SrMarkdownExtension = {
      name: 'mark',
      inline: /\{\{mark\}\}/g,
      render: () => '<mark>标记</mark>',
    }

    const result = srPreprocess('{{mark}}', [ext])
    expect(result.restore(result.text)).toBe('<mark>标记</mark>')
  })
})
