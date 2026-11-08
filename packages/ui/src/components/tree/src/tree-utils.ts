/**
 * 树工具
 *
 * 全部是纯函数：扁平化、父子联动、半选计算都放这里，不掺 DOM 与响应式。
 * 树的难点几乎都在状态推导上（勾一个节点要连带子孙、还要算出祖先的半选），
 * 单独抽出来才能测透。
 */

/** 节点 key */
export type SrTreeKey = string | number

/**
 * 拖放位置
 *
 * - before：放到目标节点之前（同级）
 * - inside：放进目标节点内部（成为子节点）
 * - after：放到目标节点之后（同级）
 */
export type SrTreeDropType = 'before' | 'inside' | 'after'

/** 树节点 */
export interface SrTreeNode {
  /** 唯一标识 */
  key: SrTreeKey
  /** 显示文本 */
  label: string
  /** 图标名 */
  icon?: string
  /** 禁用：不可选中也不可勾选 */
  disabled?: boolean
  /** 子节点 */
  children?: SrTreeNode[]
  /** 强制标记为叶子（没有 children 且不希望显示展开箭头时用） */
  isLeaf?: boolean
  /** 允许业务挂任意字段 */
  [field: string]: unknown
}

/** 扁平化后的行 */
export interface SrFlatNode {
  /** 原始节点 */
  node: SrTreeNode
  /** 层级，从 0 开始 */
  level: number
  /** 父节点 key */
  parentKey?: SrTreeKey
  /** 是否有子节点 */
  hasChildren: boolean
  /** 是否展开 */
  expanded: boolean
}

/**
 * 把树按展开状态压平
 *
 * 只输出「可见」的行：父节点收起时整棵子树都不出现。
 * 虚拟滚动需要的正是一维的可见行列表。
 * @param data 树数据
 * @param expandedKeys 已展开的 key
 * @param level 起始层级
 * @param parentKey 父 key
 * @returns 扁平列表
 */
export function flattenTree(
  data: SrTreeNode[],
  expandedKeys: SrTreeKey[],
  level = 0,
  parentKey?: SrTreeKey,
): SrFlatNode[] {
  const expanded = new Set(expandedKeys)
  const rows: SrFlatNode[] = []

  for (const node of data) {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0
    const isExpanded = expanded.has(node.key)

    rows.push({ node, level, parentKey, hasChildren, expanded: isExpanded })

    if (hasChildren && isExpanded) {
      rows.push(...flattenTree(node.children ?? [], expandedKeys, level + 1, node.key))
    }
  }

  return rows
}

/**
 * 收集所有 key
 * @param data 树数据
 * @returns key 列表
 */
export function collectKeys(data: SrTreeNode[]): SrTreeKey[] {
  const keys: SrTreeKey[] = []
  const walk = (nodes: SrTreeNode[]): void => {
    for (const node of nodes) {
      keys.push(node.key)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(data)
  return keys
}

/**
 * 找到某个 key 对应的节点
 * @param data 树数据
 * @param key 目标 key
 * @returns 节点或 undefined
 */
export function findNode(data: SrTreeNode[], key: SrTreeKey): SrTreeNode | undefined {
  for (const node of data) {
    if (node.key === key) return node
    if (node.children?.length) {
      const found = findNode(node.children, key)
      if (found) return found
    }
  }
  return undefined
}

/**
 * 收集某个节点及其全部后代的 key
 * @param node 节点
 * @returns key 列表（含自身）
 */
export function collectSubtreeKeys(node: SrTreeNode): SrTreeKey[] {
  const keys: SrTreeKey[] = [node.key]
  for (const child of node.children ?? []) {
    keys.push(...collectSubtreeKeys(child))
  }
  return keys
}

/**
 * 建立「子 → 父」索引
 * @param data 树数据
 * @returns 映射表
 */
export function buildParentMap(
  data: SrTreeNode[],
  parent?: SrTreeKey,
): Map<SrTreeKey, SrTreeKey | undefined> {
  const map = new Map<SrTreeKey, SrTreeKey | undefined>()

  for (const node of data) {
    map.set(node.key, parent)
    if (node.children?.length) {
      for (const [childKey, childParent] of buildParentMap(node.children, node.key)) {
        map.set(childKey, childParent)
      }
    }
  }

  return map
}

/** 勾选状态 */
export type SrTreeCheckState = 'checked' | 'indeterminate' | 'unchecked'

/**
 * 计算每个节点的勾选状态
 *
 * 规则：
 * - 所有子节点都选中 → 父节点选中
 * - 部分选中 → 父节点半选
 * - 都没有 → 未选
 *
 * 叶子节点只看自身是否在选中集合里。
 * @param data 树数据
 * @param checkedKeys 已勾选的 key
 * @returns key 到状态的映射
 */
export function computeCheckStates(
  data: SrTreeNode[],
  checkedKeys: SrTreeKey[],
): Map<SrTreeKey, SrTreeCheckState> {
  const checked = new Set(checkedKeys)
  const states = new Map<SrTreeKey, SrTreeCheckState>()

  const walk = (nodes: SrTreeNode[]): boolean => {
    let allChecked = true
    let anyChecked = false

    for (const node of nodes) {
      const children = node.children ?? []
      const hasChildren = children.length > 0

      if (!hasChildren) {
        const isChecked = checked.has(node.key)
        states.set(node.key, isChecked ? 'checked' : 'unchecked')
        if (isChecked) anyChecked = true
        else allChecked = false
        continue
      }

      const childAllChecked = walk(children)
      // 自身可能被单独勾选（父子不关联的场景由调用方决定是否使用该结果）
      const selfChecked = checked.has(node.key)

      if (selfChecked || childAllChecked) {
        states.set(node.key, 'checked')
        anyChecked = true
      } else {
        const childStates = children.map((child) => states.get(child.key))
        const hasPartial = childStates.some((state) => state === 'checked' || state === 'indeterminate')
        states.set(node.key, hasPartial ? 'indeterminate' : 'unchecked')
        if (hasPartial) anyChecked = true
        else allChecked = false
      }
    }

    return allChecked && anyChecked
  }

  walk(data)
  return states
}

/**
 * 勾选 / 取消某个节点
 *
 * 父子联动时：勾上要连带子孙，取消要连带子孙；
 * 之后还要回算祖先——子节点全选则父节点也选中、部分选中则父节点半选。
 * @param data 树数据
 * @param checkedKeys 当前已勾选
 * @param target 目标节点
 * @param isChecked 目标是否要变成选中
 * @returns 新的勾选集合
 */
export function toggleCheck(
  data: SrTreeNode[],
  checkedKeys: SrTreeKey[],
  target: SrTreeNode,
  isChecked: boolean,
): SrTreeKey[] {
  const set = new Set(checkedKeys)
  const subtreeKeys = collectSubtreeKeys(target)

  if (isChecked) {
    subtreeKeys.forEach((key) => set.add(key))
  } else {
    subtreeKeys.forEach((key) => set.delete(key))
  }

  // 回算祖先：逐层向上，全选则加入、否则移除
  const parentMap = buildParentMap(data)
  let cursor = parentMap.get(target.key)

  while (cursor !== undefined) {
    const parentNode = findNode(data, cursor)
    if (!parentNode) break

    const children = parentNode.children ?? []
    const allChecked = children.every((child) => set.has(child.key))

    if (allChecked) set.add(parentNode.key)
    else set.delete(parentNode.key)

    cursor = parentMap.get(cursor)
  }

  return [...set]
}

/**
 * 取出半选状态的 key
 * @param data 树数据
 * @param checkedKeys 已勾选
 * @returns 半选 key 列表
 */
export function getHalfCheckedKeys(data: SrTreeNode[], checkedKeys: SrTreeKey[]): SrTreeKey[] {
  const states = computeCheckStates(data, checkedKeys)
  return [...states.entries()].filter(([, state]) => state === 'indeterminate').map(([key]) => key)
}

/**
 * 只在叶子层面记录勾选（去掉父节点）
 *
 * `check` 事件里带上它，业务方通常只关心「选了哪些具体项」。
 * @param data 树数据
 * @param checkedKeys 已勾选
 * @returns 叶子 key 列表
 */
export function getLeafCheckedKeys(data: SrTreeNode[], checkedKeys: SrTreeKey[]): SrTreeKey[] {
  const set = new Set(checkedKeys)
  const keys: SrTreeKey[] = []

  const walk = (nodes: SrTreeNode[]): void => {
    for (const node of nodes) {
      if (node.children?.length) walk(node.children)
      else if (set.has(node.key)) keys.push(node.key)
    }
  }

  walk(data)
  return keys
}

/**
 * 判断某个 key 是否是另一个 key 的后代
 *
 * 拖拽时用来防止「把父节点拖进自己的子树」，那会让树变成环。
 * @param data 树数据
 * @param ancestorKey 祖先 key
 * @param key 待判断的 key
 * @returns 是否是后代
 */
export function isDescendant(data: SrTreeNode[], ancestorKey: SrTreeKey, key: SrTreeKey): boolean {
  const ancestor = findNode(data, ancestorKey)
  if (!ancestor?.children?.length) return false

  return collectSubtreeKeys(ancestor).includes(key) && ancestorKey !== key
}

/**
 * 深拷贝一棵树
 *
 * 拖拽要生成新对象才能触发响应式更新；直接改原数组里的 children 不会让视图刷新。
 * @param data 树数据
 * @returns 新树
 */
export function cloneTree(data: SrTreeNode[]): SrTreeNode[] {
  return data.map((node) => ({
    ...node,
    children: node.children ? cloneTree(node.children) : undefined,
  }))
}

/**
 * 从树里移除一个节点
 * @param data 树数据（会被直接修改，调用前先 clone）
 * @param key 目标 key
 * @returns 被移除的节点，找不到返回 undefined
 */
export function removeNode(data: SrTreeNode[], key: SrTreeKey): SrTreeNode | undefined {
  for (let index = 0; index < data.length; index += 1) {
    const node = data[index]
    if (!node) continue

    if (node.key === key) {
      data.splice(index, 1)
      return node
    }

    if (node.children?.length) {
      const removed = removeNode(node.children, key)
      if (removed) return removed
    }
  }

  return undefined
}

/**
 * 把节点插入到目标附近
 * @param data 树数据（会被直接修改）
 * @param targetKey 目标节点 key
 * @param node 待插入节点
 * @param type 插入位置
 * @returns 是否插入成功
 */
export function insertNode(
  data: SrTreeNode[],
  targetKey: SrTreeKey,
  node: SrTreeNode,
  type: SrTreeDropType,
): boolean {
  for (let index = 0; index < data.length; index += 1) {
    const target = data[index]
    if (!target) continue

    if (target.key === targetKey) {
      if (type === 'before') data.splice(index, 0, node)
      else if (type === 'after') data.splice(index + 1, 0, node)
      else {
        target.children = [...(target.children ?? []), node]
        return true
      }
      return true
    }

    if (target.children?.length && insertNode(target.children, targetKey, node, type)) {
      return true
    }
  }

  return false
}

/**
 * 移动节点
 *
 * 完整流程：深拷贝 → 摘出 → 插入。用拷贝而不是原地改，
 * 是因为父组件通常直接把 data 传进来，原地改会污染外部数据。
 * @param data 树数据
 * @param dragKey 被拖的 key
 * @param dropKey 目标 key
 * @param type 放置位置
 * @returns 新的树；不合法时返回 null
 */
export function moveNode(
  data: SrTreeNode[],
  dragKey: SrTreeKey,
  dropKey: SrTreeKey,
  type: SrTreeDropType,
): SrTreeNode[] | null {
  if (dragKey === dropKey) return null
  // 拖进自己的子树会成环
  if (isDescendant(data, dragKey, dropKey)) return null

  const next = cloneTree(data)
  const node = removeNode(next, dragKey)
  if (!node) return null

  const ok = insertNode(next, dropKey, node, type)
  return ok ? next : null
}
