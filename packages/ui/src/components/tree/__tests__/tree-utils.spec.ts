import { describe, expect, it } from 'vitest'

import {
  buildParentMap,
  collectKeys,
  collectSubtreeKeys,
  computeCheckStates,
  findNode,
  flattenTree,
  getHalfCheckedKeys,
  getLeafCheckedKeys,
  toggleCheck,
  type SrTreeNode,
} from '../src/tree-utils'

/** 三层测试树 */
const tree: SrTreeNode[] = [
  {
    key: 'a',
    label: '设计',
    children: [
      { key: 'a1', label: 'Token' },
      {
        key: 'a2',
        label: '组件',
        children: [
          { key: 'a2-1', label: '按钮' },
          { key: 'a2-2', label: '输入框' },
        ],
      },
    ],
  },
  {
    key: 'b',
    label: '工程',
    children: [
      { key: 'b1', label: '构建' },
      { key: 'b2', label: '测试' },
    ],
  },
  { key: 'c', label: '关于' },
]

describe('flattenTree', () => {
  it('全部收起时只显示顶层', () => {
    const rows = flattenTree(tree, [])
    expect(rows.map((row) => row.node.key)).toEqual(['a', 'b', 'c'])
    expect(rows.every((row) => row.level === 0)).toBe(true)
  })

  it('展开父节点后子节点紧跟其后', () => {
    const rows = flattenTree(tree, ['b'])
    expect(rows.map((row) => row.node.key)).toEqual(['a', 'b', 'b1', 'b2', 'c'])
    expect(rows[2]?.level).toBe(1)
  })

  it('多层展开时 level 递增', () => {
    const rows = flattenTree(tree, ['a', 'a2'])
    const keys = rows.map((row) => row.node.key)
    expect(keys).toEqual(['a', 'a1', 'a2', 'a2-1', 'a2-2', 'b', 'c'])
    expect(rows.find((row) => row.node.key === 'a2-1')?.level).toBe(2)
  })

  it('记录父节点 key 与是否有子节点', () => {
    const rows = flattenTree(tree, ['a'])
    const a1 = rows.find((row) => row.node.key === 'a1')
    expect(a1?.parentKey).toBe('a')
    expect(a1?.hasChildren).toBe(false)

    const a = rows.find((row) => row.node.key === 'a')
    expect(a?.hasChildren).toBe(true)
    expect(a?.expanded).toBe(true)
  })
})

describe('collectKeys / findNode / buildParentMap', () => {
  it('收集全部 key', () => {
    expect(collectKeys(tree)).toHaveLength(9)
  })

  it('按 key 找到嵌套节点', () => {
    expect(findNode(tree, 'a2-2')?.label).toBe('输入框')
    expect(findNode(tree, 'nope')).toBeUndefined()
  })

  it('父子索引正确', () => {
    const map = buildParentMap(tree)
    expect(map.get('a2-1')).toBe('a2')
    expect(map.get('a')).toBeUndefined()
    expect(map.get('c')).toBeUndefined()
  })

  it('子树 key 含自身', () => {
    const node = findNode(tree, 'a2')
    expect(collectSubtreeKeys(node!)).toEqual(['a2', 'a2-1', 'a2-2'])
  })
})

describe('computeCheckStates', () => {
  it('未勾选时全是 unchecked', () => {
    const states = computeCheckStates(tree, [])
    expect([...states.values()].every((state) => state === 'unchecked')).toBe(true)
  })

  it('子节点全选时父节点也算选中', () => {
    const states = computeCheckStates(tree, ['b1', 'b2'])
    expect(states.get('b1')).toBe('checked')
    expect(states.get('b')).toBe('checked')
  })

  it('只选一个子节点时父节点半选', () => {
    const states = computeCheckStates(tree, ['b1'])
    expect(states.get('b1')).toBe('checked')
    expect(states.get('b2')).toBe('unchecked')
    expect(states.get('b')).toBe('indeterminate')
  })

  it('深层部分选中会逐层向上传递半选', () => {
    const states = computeCheckStates(tree, ['a2-1'])
    expect(states.get('a2')).toBe('indeterminate')
    expect(states.get('a')).toBe('indeterminate')
  })

  it('叶子节点只看自身', () => {
    const states = computeCheckStates(tree, ['c'])
    expect(states.get('c')).toBe('checked')
  })
})

describe('toggleCheck', () => {
  it('勾选父节点会连带所有子孙', () => {
    const next = toggleCheck(tree, [], findNode(tree, 'a')!, true)
    expect(next.sort()).toEqual(['a', 'a1', 'a2', 'a2-1', 'a2-2'].sort())
  })

  it('取消父节点会连带移除子孙', () => {
    const next = toggleCheck(tree, ['a', 'a1', 'a2', 'a2-1', 'a2-2', 'b1'], findNode(tree, 'a')!, false)
    expect(next).toEqual(['b1'])
  })

  it('选完最后一个子节点后父节点自动选中', () => {
    let checked = toggleCheck(tree, [], findNode(tree, 'b1')!, true)
    expect(checked).toContain('b1')
    expect(checked).not.toContain('b')

    checked = toggleCheck(tree, checked, findNode(tree, 'b2')!, true)
    expect(checked).toContain('b')
  })

  it('取消一个子节点后父节点被移出', () => {
    let checked = toggleCheck(tree, [], findNode(tree, 'b')!, true)
    expect(checked).toContain('b')

    checked = toggleCheck(tree, checked, findNode(tree, 'b1')!, false)
    expect(checked).not.toContain('b')
    expect(checked).toContain('b2')
  })

  it('深层勾选能一路回算到根', () => {
    const checked = toggleCheck(tree, [], findNode(tree, 'a2-1')!, true)
    expect(checked).toContain('a2-1')
    // 还没全选，父级不应被加入
    expect(checked).not.toContain('a2')
    expect(checked).not.toContain('a')
  })
})

describe('getHalfCheckedKeys / getLeafCheckedKeys', () => {
  it('半选只返回部分选中的父节点', () => {
    expect(getHalfCheckedKeys(tree, ['b1'])).toEqual(['b'])
    expect(getHalfCheckedKeys(tree, ['b1', 'b2'])).toEqual([])
  })

  it('叶子视图只保留最末级', () => {
    const checked = ['a', 'a1', 'a2', 'a2-1', 'a2-2', 'b1']
    expect(getLeafCheckedKeys(tree, checked).sort()).toEqual(['a1', 'a2-1', 'a2-2', 'b1'].sort())
  })
})
