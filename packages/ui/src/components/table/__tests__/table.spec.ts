import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'

import { SrTable } from '..'
import type { SrTableColumn, SrTableRow } from '..'

/** 列配置 */
const columns: SrTableColumn[] = [
  { key: 'name', title: '名称', sortable: true },
  { key: 'age', title: '年龄', sortable: true, align: 'right' },
  { key: 'city', title: '城市' },
]

/** 行数据 */
const data: SrTableRow[] = [
  { id: 1, name: '张三', age: 30, city: '杭州' },
  { id: 2, name: '李四', age: 24, city: '北京' },
  { id: 3, name: '王五', age: 35, city: '上海' },
]

/**
 * 挂载表格
 * @param props 组件 props
 * @returns 包装器
 */
function mountTable(props: Record<string, unknown> = {}) {
  return mount(SrTable, {
    props: { columns, data, ...props },
    attachTo: document.body,
  })
}

describe('SrTable 渲染', () => {
  it('按列配置渲染表头', () => {
    const wrapper = mountTable()
    const headers = wrapper.findAll('thead th').map((th) => th.text())

    expect(headers).toEqual(['名称', '年龄', '城市'])
    wrapper.unmount()
  })

  it('按字段渲染单元格', () => {
    const wrapper = mountTable()
    const firstRow = wrapper.findAll('tbody tr')[0]

    expect(firstRow.findAll('td').map((td) => td.text())).toEqual(['张三', '30', '杭州'])
    wrapper.unmount()
  })

  it('formatter 可覆盖展示文本', () => {
    const wrapper = mountTable({
      columns: [{ key: 'age', title: '年龄', formatter: (row: SrTableRow) => `${row.age} 岁` }],
    })

    expect(wrapper.findAll('tbody td')[0].text()).toBe('30 岁')
    wrapper.unmount()
  })

  it('具名插槽可自定义单元格', () => {
    const wrapper = mount(SrTable, {
      props: { columns, data },
      slots: {
        'cell-name': ({ row }: { row: SrTableRow }) =>
          h('strong', { class: 'custom-cell' }, row.name as string),
      },
      attachTo: document.body,
    })

    expect(wrapper.findAll('.custom-cell')).toHaveLength(3)
    wrapper.unmount()
  })

  it('空数据展示空状态', () => {
    const wrapper = mountTable({ data: [], emptyText: '没有记录' })

    expect(wrapper.find('.sr-table__empty').text()).toBe('没有记录')
    wrapper.unmount()
  })

  it('loading 时显示遮罩且不渲染空状态', () => {
    const wrapper = mountTable({ data: [], loading: true })

    expect(wrapper.find('.sr-table__loading').exists()).toBe(true)
    expect(wrapper.find('.sr-table__empty').exists()).toBe(false)
    wrapper.unmount()
  })

  it('对齐与省略配置生成对应类名', () => {
    const wrapper = mountTable()

    expect(wrapper.find('thead th.is-right').exists()).toBe(true)

    wrapper.unmount()

    const withEllipsis = mountTable({
      columns: [{ key: 'city', title: '城市', ellipsis: true }],
    })
    expect(withEllipsis.find('tbody td.is-ellipsis').exists()).toBe(true)
    withEllipsis.unmount()
  })
})

describe('SrTable 排序', () => {
  it('点击表头按 asc → desc → 取消 循环', async () => {
    const wrapper = mountTable()
    const header = wrapper.findAll('thead th')[1]

    await header.trigger('click')
    expect(wrapper.emitted('sort-change')?.[0]).toEqual([{ key: 'age', order: 'asc' }])
    expect(header.attributes('aria-sort')).toBe('ascending')

    await header.trigger('click')
    expect(wrapper.emitted('sort-change')?.[1]).toEqual([{ key: 'age', order: 'desc' }])

    await header.trigger('click')
    expect(wrapper.emitted('sort-change')?.[2]).toEqual([{ key: 'age', order: null }])

    wrapper.unmount()
  })

  it('client 模式下真正重排数据', async () => {
    const wrapper = mountTable()

    await wrapper.findAll('thead th')[1].trigger('click')
    await nextTick()

    const ages = wrapper.findAll('tbody tr').map((tr) => Number(tr.findAll('td')[1].text()))

    expect(ages).toEqual([24, 30, 35])

    wrapper.unmount()
  })

  it('空值排在最后', async () => {
    const wrapper = mountTable({
      columns: [{ key: 'age', title: '年龄', sortable: true }],
      data: [
        { id: 1, age: 10 },
        { id: 2, age: null },
        { id: 3, age: 5 },
      ],
    })

    await wrapper.find('thead th').trigger('click')
    await nextTick()

    const values = wrapper.findAll('tbody td').map((td) => td.text())
    expect(values).toEqual(['5', '10', ''])

    wrapper.unmount()
  })

  it('server 模式只派发事件、不改数据顺序', async () => {
    const wrapper = mountTable({ sortMode: 'server' })

    await wrapper.findAll('thead th')[1].trigger('click')
    await nextTick()

    const ages = wrapper.findAll('tbody tr').map((tr) => Number(tr.findAll('td')[1].text()))

    expect(ages).toEqual([30, 24, 35])
    expect(wrapper.emitted('sort-change')).toHaveLength(1)

    wrapper.unmount()
  })

  it('不可排序列点击无效', async () => {
    const wrapper = mountTable()
    // 第三列「城市」未设置 sortable
    await wrapper.findAll('thead th')[2].trigger('click')

    expect(wrapper.emitted('sort-change')).toBeUndefined()
    wrapper.unmount()
  })
})

describe('SrTable 选择', () => {
  it('勾选单行派发 key 集合', async () => {
    const wrapper = mountTable({ selectable: true })

    await wrapper.findAll('tbody input[type="checkbox"]')[1].setValue(true)

    expect(wrapper.emitted('update:selectedKeys')?.[0]).toEqual([[2]])
    wrapper.unmount()
  })

  it('已选行渲染选中态', () => {
    const wrapper = mountTable({ selectable: true, selectedKeys: [1, 3] })

    const rows = wrapper.findAll('tbody tr')
    expect(rows[0].classes()).toContain('is-selected')
    expect(rows[1].classes()).not.toContain('is-selected')
    expect(rows[2].classes()).toContain('is-selected')

    wrapper.unmount()
  })

  it('表头全选与半选', async () => {
    const partial = mountTable({ selectable: true, selectedKeys: [1] })
    const headerBox = partial.find('thead input[type="checkbox"]').element as HTMLInputElement

    // 只选了一行 → 半选
    expect(headerBox.indeterminate).toBe(true)

    await partial.find('thead input[type="checkbox"]').setValue(true)
    expect(partial.emitted('update:selectedKeys')?.[0]).toEqual([[1, 2, 3]])
    partial.unmount()

    const all = mountTable({ selectable: true, selectedKeys: [1, 2, 3] })
    const allBox = all.find('thead input[type="checkbox"]').element as HTMLInputElement
    expect(allBox.indeterminate).toBe(false)
    expect(allBox.checked).toBe(true)
    all.unmount()
  })

  it('点击选择列不会触发行点击', async () => {
    const wrapper = mountTable({ selectable: true })

    await wrapper.find('tbody td.sr-table__cell--select').trigger('click')

    expect(wrapper.emitted('row-click')).toBeUndefined()
    wrapper.unmount()
  })
})

describe('SrTable 其他', () => {
  it('点击行派发 row-click', async () => {
    const wrapper = mountTable()

    await wrapper.findAll('tbody tr')[1].trigger('click')

    expect(wrapper.emitted('row-click')?.[0]?.[1]).toBe(1)
    wrapper.unmount()
  })

  it('展开行渲染额外内容并派发事件', async () => {
    const wrapper = mount(SrTable, {
      props: { columns, data, expandable: true },
      slots: { expand: ({ row }: { row: SrTableRow }) => h('div', { class: 'detail' }, row.name as string) },
      attachTo: document.body,
    })

    expect(wrapper.find('.detail').exists()).toBe(false)

    await wrapper.find('.sr-table__expand-btn').trigger('click')

    expect(wrapper.emitted('update:expandedKeys')?.[0]).toEqual([[1]])
    wrapper.unmount()
  })

  it('响应式卡片视图只在窄屏且挂载后启用', async () => {
    const originalWidth = window.innerWidth
    window.innerWidth = 400

    const wrapper = mountTable({ responsive: true })
    // 首次渲染（模拟 SSR 一致性）仍是表格
    await nextTick()
    await nextTick()

    expect(wrapper.find('.sr-table__cards').exists()).toBe(true)
    expect(wrapper.find('table').exists()).toBe(false)

    wrapper.unmount()
    window.innerWidth = originalWidth
  })

  it('未开启 responsive 时窄屏也保持表格', async () => {
    const originalWidth = window.innerWidth
    window.innerWidth = 400

    const wrapper = mountTable()
    await nextTick()

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('.sr-table__cards').exists()).toBe(false)

    wrapper.unmount()
    window.innerWidth = originalWidth
  })

  it('$attrs 落到根元素', () => {
    const wrapper = mount(SrTable, {
      props: { columns, data },
      attrs: { 'data-test': 'grid' },
      attachTo: document.body,
    })

    expect(wrapper.attributes('data-test')).toBe('grid')
    wrapper.unmount()
  })

  it('空数据时显示图标与文案', () => {
    const wrapper = mount(SrTable, { props: { columns, data: [] }, attachTo: document.body })

    expect(wrapper.find('.sr-table__empty-icon').exists()).toBe(true)
    expect(wrapper.find('.sr-table__empty-text').text()).toBe('暂无数据')

    wrapper.unmount()
  })

  it('emptyIcon 传空串时不渲染图标', () => {
    const wrapper = mount(SrTable, {
      props: { columns, data: [], emptyIcon: '' },
      attachTo: document.body,
    })

    expect(wrapper.find('.sr-table__empty-icon').exists()).toBe(false)

    wrapper.unmount()
  })

  it('固定列按前面列宽累加 left 偏移', () => {
    const fixedColumns: SrTableColumn[] = [
      { key: 'name', title: '名称', width: 100, fixed: 'left' },
      { key: 'age', title: '年龄', width: 80, fixed: 'left' },
      { key: 'city', title: '城市', width: 120 },
      { key: 'ops', title: '操作', width: 90, fixed: 'right' },
    ]

    const wrapper = mount(SrTable, {
      props: { columns: fixedColumns, data, selectable: true },
      attachTo: document.body,
    })

    const headCells = wrapper.findAll('.sr-table__head th')
    // th[0] 是选择列（宽 44px），存在固定列时它也要贴左
    expect(headCells[0]?.attributes('style')).toContain('left: 0px')
    // 第一个固定数据列从 44px 起，第二个从 44 + 100 起
    expect(headCells[1]?.classes()).toContain('is-fixed-left')
    expect(headCells[1]?.attributes('style')).toContain('left: 44px')
    expect(headCells[2]?.classes()).toContain('is-fixed-left')
    expect(headCells[2]?.attributes('style')).toContain('left: 144px')

    // 普通列不带固定类
    expect(headCells[3]?.classes()).not.toContain('is-fixed')

    const last = headCells.at(-1)
    expect(last?.classes()).toContain('is-fixed-right')
    expect(last?.attributes('style')).toContain('right: 0px')

    wrapper.unmount()
  })

  it('分页只渲染当前页数据', () => {
    const wrapper = mount(SrTable, {
      props: { columns, data, pagination: { pageSize: 2 }, page: 1 },
      attachTo: document.body,
    })

    expect(wrapper.findAll('.sr-table__body .sr-table__row')).toHaveLength(2)
    expect(wrapper.find('.sr-table__total').text()).toContain('3')

    wrapper.unmount()
  })

  it('点击页码切换当前页并派发事件', async () => {
    const wrapper = mount(SrTable, {
      props: { columns, data, pagination: { pageSize: 2 } },
      attachTo: document.body,
    })

    const buttons = wrapper.findAll('.sr-table__pager-btn')
    // 上一页 / 1 / 2 / 下一页
    await buttons.at(-1)?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:page')?.[0]).toEqual([2])
    expect(wrapper.emitted('page-change')?.[0]).toEqual([2])
    // 第二页只剩 1 条
    expect(wrapper.findAll('.sr-table__body .sr-table__row')).toHaveLength(1)

    wrapper.unmount()
  })

  it('未开分页时渲染全部数据且不出分页器', () => {
    const wrapper = mountTable()

    expect(wrapper.findAll('.sr-table__body .sr-table__row')).toHaveLength(3)
    expect(wrapper.find('.sr-table__pagination').exists()).toBe(false)

    wrapper.unmount()
  })

  it('懒加载滚动到底部派发 load-more', async () => {
    const wrapper = mount(SrTable, {
      props: { columns, data, lazy: true, maxHeight: 200 },
      attachTo: document.body,
    })

    const scroll = wrapper.find('.sr-table__scroll')
    const el = scroll.element as HTMLElement

    // jsdom 里没有真实布局，手动构造「已滚到底」的度量
    Object.defineProperty(el, 'scrollHeight', { value: 800, configurable: true })
    Object.defineProperty(el, 'clientHeight', { value: 200, configurable: true })
    Object.defineProperty(el, 'scrollTop', { value: 600, configurable: true })

    await scroll.trigger('scroll')
    expect(wrapper.emitted('load-more')).toHaveLength(1)

    // 未到底不触发
    Object.defineProperty(el, 'scrollTop', { value: 100, configurable: true })
    await scroll.trigger('scroll')
    expect(wrapper.emitted('load-more')).toHaveLength(1)

    wrapper.unmount()
  })

  it('没有更多数据时不再派发 load-more', async () => {
    const wrapper = mount(SrTable, {
      props: { columns, data, lazy: true, hasMore: false },
      attachTo: document.body,
    })

    const scroll = wrapper.find('.sr-table__scroll')
    const el = scroll.element as HTMLElement
    Object.defineProperty(el, 'scrollHeight', { value: 800, configurable: true })
    Object.defineProperty(el, 'clientHeight', { value: 200, configurable: true })
    Object.defineProperty(el, 'scrollTop', { value: 600, configurable: true })

    await scroll.trigger('scroll')
    expect(wrapper.emitted('load-more')).toBeUndefined()
    expect(wrapper.find('.sr-table__lazy-text').text()).toContain('没有更多')

    wrapper.unmount()
  })
})
