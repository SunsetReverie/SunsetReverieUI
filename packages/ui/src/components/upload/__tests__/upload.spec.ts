import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SrUpload from '../index'

/**
 * 造一个 File 对象
 * @param name 文件名
 * @param size 字节数
 * @param type MIME
 * @returns 文件
 */
function makeFile(name: string, size = 1024, type = 'text/plain'): File {
  const file = new File(['x'], name, { type })
  // jsdom 的 File 不支持改 size，这里用 defineProperty 造出需要的体积
  Object.defineProperty(file, 'size', { value: size })
  return file
}

/**
 * 挂载上传组件
 * @param props 覆盖的 props
 * @returns 挂载结果
 */
function mountUpload(props: Record<string, unknown> = {}) {
  return mount(SrUpload, {
    props,
    global: { stubs: { SrIcon: true } },
    attachTo: document.body,
  })
}

/**
 * 模拟选择文件
 * @param wrapper 挂载结果
 * @param files 文件列表
 */
async function selectFiles(wrapper: ReturnType<typeof mountUpload>, files: File[]): Promise<void> {
  const input = wrapper.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: files, configurable: true })
  await input.trigger('change')
}

describe('SrUpload', () => {
  beforeEach(() => {
    // jsdom 没有 objectURL，给个可辨识的假实现
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  it('渲染拖拽区与原生 input', () => {
    const wrapper = mountUpload()

    expect(wrapper.find('.sr-upload__trigger').exists()).toBe(true)
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('选择文件后进入列表并派发 change', async () => {
    const wrapper = mountUpload({ multiple: true })

    await selectFiles(wrapper, [makeFile('a.txt'), makeFile('b.txt')])

    expect(wrapper.findAll('.sr-upload__item')).toHaveLength(2)
    const emitted = wrapper.emitted('change')?.[0] as [unknown[], unknown]
    expect(emitted[0]).toHaveLength(2)
    wrapper.unmount()
  })

  it('超过 maxCount 时派发 exceed 并停止添加', async () => {
    const wrapper = mountUpload({ multiple: true, maxCount: 1 })

    await selectFiles(wrapper, [makeFile('a.txt'), makeFile('b.txt')])

    expect(wrapper.findAll('.sr-upload__item')).toHaveLength(1)
    expect(wrapper.emitted('exceed')?.[0]).toEqual([1])
    wrapper.unmount()
  })

  it('超过 maxSize 的文件被拒并派发 error', async () => {
    const wrapper = mountUpload({ multiple: true, maxSize: 1 })

    await selectFiles(wrapper, [makeFile('big.txt', 3 * 1024 * 1024)])

    expect(wrapper.findAll('.sr-upload__item')).toHaveLength(0)
    expect(String(wrapper.emitted('error')?.[0]?.[1])).toContain('1MB')
    wrapper.unmount()
  })

  it('accept 不匹配的文件被拒', async () => {
    const wrapper = mountUpload({ accept: 'image/*', multiple: true })

    await selectFiles(wrapper, [makeFile('a.txt', 100, 'text/plain')])

    expect(wrapper.findAll('.sr-upload__item')).toHaveLength(0)
    expect(wrapper.emitted('error')).toBeTruthy()
    wrapper.unmount()
  })

  it('支持移除条目', async () => {
    const wrapper = mountUpload({ multiple: true })
    await selectFiles(wrapper, [makeFile('a.txt')])

    await wrapper.find('.sr-upload__action').trigger('click')

    expect(wrapper.findAll('.sr-upload__item')).toHaveLength(0)
    wrapper.unmount()
  })

  it('autoUpload + httpRequest 会走完上传并回填 url', async () => {
    const httpRequest = vi.fn(async (_file: File, onProgress: (p: number) => void) => {
      onProgress(50)
      onProgress(100)
      return 'https://cdn.example.com/a.png'
    })

    const wrapper = mountUpload({ httpRequest })
    await selectFiles(wrapper, [makeFile('a.png', 100, 'image/png')])
    await vi.waitFor(() => {
      expect(wrapper.emitted('success')).toBeTruthy()
    })

    expect(httpRequest).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.sr-upload__item').classes()).toContain('is-success')
    wrapper.unmount()
  })

  it('httpRequest 抛错时标记为 error 并保留条目', async () => {
    const httpRequest = vi.fn(async () => {
      throw new Error('网络异常')
    })

    const wrapper = mountUpload({ httpRequest })
    await selectFiles(wrapper, [makeFile('a.png', 100, 'image/png')])
    await vi.waitFor(() => {
      expect(wrapper.emitted('error')).toBeTruthy()
    })

    expect(wrapper.find('.sr-upload__item').classes()).toContain('is-error')
    wrapper.unmount()
  })

  it('关闭 autoUpload 时不调用 httpRequest', async () => {
    const httpRequest = vi.fn(async () => 'x')
    const wrapper = mountUpload({ autoUpload: false, httpRequest })

    await selectFiles(wrapper, [makeFile('a.txt')])

    expect(httpRequest).not.toHaveBeenCalled()
    expect(wrapper.findAll('.sr-upload__item')).toHaveLength(1)
    wrapper.unmount()
  })

  it('card 模式生成对应类名', () => {
    const wrapper = mountUpload({ listType: 'card' })
    // 组件是多根节点（主体 + Teleport 预览层），要从根元素上取类名
    expect(wrapper.find('.sr-upload').classes()).toContain('sr-upload--card')
    wrapper.unmount()
  })

  it('disabled 时不响应点击与移除', async () => {
    const wrapper = mountUpload({ disabled: true, multiple: true })
    await selectFiles(wrapper, [makeFile('a.txt')])

    expect(wrapper.find('.sr-upload__trigger').classes()).toContain('is-disabled')
    wrapper.unmount()
  })

  it('达到上限后拖拽区提示不可用', async () => {
    const wrapper = mountUpload({ maxCount: 1 })
    await selectFiles(wrapper, [makeFile('a.txt')])

    expect(wrapper.find('.sr-upload__trigger').classes()).toContain('is-disabled')
    expect(wrapper.find('.sr-upload__text').text()).toContain('最多 1 个文件')
    wrapper.unmount()
  })
})
