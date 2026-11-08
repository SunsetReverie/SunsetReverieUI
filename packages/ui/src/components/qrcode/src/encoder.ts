/**
 * QR 码编码器
 *
 * 只做这三件事，够用于 URL、短文本、Wi-Fi 配置这类日常内容：
 * 1. 字节模式编码（UTF-8）
 * 2. 版本 1~4（最多约 78 字节）
 * 3. 四个纠错等级
 *
 * 没做数字/字母数字模式的压缩——字节模式什么都能编，只是密度低一点。
 */

import { reedSolomon } from './galois'

/** 纠错等级 */
export type SrQrLevel = 'L' | 'M' | 'Q' | 'H'

/** 单块的结构 */
interface BlockSpec {
  /** 数据码字数 */
  data: number
  /** 纠错码字数 */
  ecc: number
}

/** 某个版本 + 等级下的块布局 */
interface VersionSpec {
  /** 数据块列表（多块时要交织） */
  blocks: BlockSpec[]
  /** 对齐图案中心坐标 */
  alignment: number[]
}

/**
 * 版本 × 等级的块结构
 *
 * 数据来自 QR 规范的表 9-3。只列到版本 4——
 * 再大就需要更多的对齐图案和更复杂的交织，收益也不高。
 */
const SPECS: Record<number, Record<SrQrLevel, VersionSpec>> = {
  1: {
    L: { blocks: [{ data: 19, ecc: 7 }], alignment: [] },
    M: { blocks: [{ data: 16, ecc: 10 }], alignment: [] },
    Q: { blocks: [{ data: 13, ecc: 13 }], alignment: [] },
    H: { blocks: [{ data: 9, ecc: 17 }], alignment: [] },
  },
  2: {
    L: { blocks: [{ data: 34, ecc: 10 }], alignment: [6, 18] },
    M: { blocks: [{ data: 28, ecc: 16 }], alignment: [6, 18] },
    Q: { blocks: [{ data: 22, ecc: 22 }], alignment: [6, 18] },
    H: { blocks: [{ data: 16, ecc: 28 }], alignment: [6, 18] },
  },
  3: {
    L: { blocks: [{ data: 55, ecc: 15 }], alignment: [6, 22] },
    M: { blocks: [{ data: 44, ecc: 26 }], alignment: [6, 22] },
    Q: {
      blocks: [
        { data: 17, ecc: 18 },
        { data: 17, ecc: 18 },
      ],
      alignment: [6, 22],
    },
    H: {
      blocks: [
        { data: 13, ecc: 22 },
        { data: 13, ecc: 22 },
      ],
      alignment: [6, 22],
    },
  },
  4: {
    L: { blocks: [{ data: 80, ecc: 20 }], alignment: [6, 26] },
    M: {
      blocks: [
        { data: 32, ecc: 18 },
        { data: 32, ecc: 18 },
      ],
      alignment: [6, 26],
    },
    Q: {
      blocks: [
        { data: 24, ecc: 26 },
        { data: 24, ecc: 26 },
      ],
      alignment: [6, 26],
    },
    H: {
      blocks: [
        { data: 9, ecc: 16 },
        { data: 9, ecc: 16 },
        { data: 9, ecc: 16 },
        { data: 9, ecc: 16 },
      ],
      alignment: [6, 26],
    },
  },
}

/** 纠错等级对应的格式信息编码 */
const LEVEL_BITS: Record<SrQrLevel, number> = { L: 1, M: 0, Q: 3, H: 2 }

/** 支持的最大版本 */
const MAX_VERSION = 4

/**
 * 某个版本 + 等级的数据容量（字节）
 * @param version 版本
 * @param level 纠错等级
 * @returns 可用字节数
 */
export function getCapacity(version: number, level: SrQrLevel): number {
  const spec = SPECS[version]?.[level]
  if (!spec) return 0

  const total = spec.blocks.reduce((sum, block) => sum + block.data, 0)
  // 字节模式下，模式指示符 4 位 + 长度指示 8 位 = 12 位 = 1.5 字节
  return Math.max(0, total - 2)
}

/**
 * 选择能容纳内容的最小版本
 * @param byteLength 内容字节数
 * @param level 纠错等级
 * @returns 版本号，超限返回 0
 */
export function pickVersion(byteLength: number, level: SrQrLevel): number {
  for (let version = 1; version <= MAX_VERSION; version += 1) {
    if (getCapacity(version, level) >= byteLength) return version
  }
  return 0
}

/** 位写入器 */
class BitBuffer {
  /** 已写入的位 */
  bits: number[] = []

  /**
   * 写入若干位
   * @param value 数值
   * @param length 位宽
   */
  put(value: number, length: number): void {
    for (let i = length - 1; i >= 0; i -= 1) {
      this.bits.push((value >>> i) & 1)
    }
  }

  /** 当前位数 */
  get size(): number {
    return this.bits.length
  }

  /**
   * 按字节输出
   * @returns 字节数组
   */
  toBytes(): number[] {
    const bytes: number[] = []
    for (let i = 0; i < this.bits.length; i += 8) {
      let byte = 0
      for (let j = 0; j < 8; j += 1) {
        byte = (byte << 1) | (this.bits[i + j] ?? 0)
      }
      bytes.push(byte)
    }
    return bytes
  }
}

/**
 * 把字符串转成 UTF-8 字节
 * @param text 文本
 * @returns 字节数组
 */
function toUtf8Bytes(text: string): number[] {
  if (typeof TextEncoder !== 'undefined') {
    return Array.from(new TextEncoder().encode(text))
  }

  // 老环境兜底：手动编码
  const bytes: number[] = []
  for (let i = 0; i < text.length; i += 1) {
    let code = text.charCodeAt(i)

    if (code < 0x80) {
      bytes.push(code)
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
    } else if (code >= 0xd800 && code <= 0xdbff) {
      // 代理对：合成一个码点再编 4 字节
      const low = text.charCodeAt(i + 1)
      code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00)
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      )
      i += 1
    } else {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
    }
  }

  return bytes
}

/**
 * 数据编码 + 纠错 + 交织
 * @param text 文本
 * @param version 版本
 * @param level 纠错等级
 * @returns 最终码字序列
 */
function buildCodewords(text: string, version: number, level: SrQrLevel): number[] {
  const spec = SPECS[version]?.[level]
  if (!spec) return []

  const bytes = toUtf8Bytes(text)
  const totalData = spec.blocks.reduce((sum, block) => sum + block.data, 0)

  const buffer = new BitBuffer()
  buffer.put(0b0100, 4) // 字节模式
  buffer.put(bytes.length, version <= 9 ? 8 : 16)
  bytes.forEach((byte) => buffer.put(byte, 8))

  // 结束符最多 4 位
  const capacityBits = totalData * 8
  const terminator = Math.min(4, capacityBits - buffer.size)
  if (terminator > 0) buffer.put(0, terminator)

  // 补齐到字节边界
  while (buffer.size % 8 !== 0) buffer.put(0, 1)

  const dataBytes = buffer.toBytes()

  // 交替填充 0xEC / 0x11 直到填满
  let pad = 0
  while (dataBytes.length < totalData) {
    dataBytes.push(pad % 2 === 0 ? 0xec : 0x11)
    pad += 1
  }

  // 按块切分并计算各自纠错码
  const dataBlocks: number[][] = []
  const eccBlocks: number[][] = []
  let offset = 0

  for (const block of spec.blocks) {
    const chunk = dataBytes.slice(offset, offset + block.data)
    offset += block.data
    dataBlocks.push(chunk)
    eccBlocks.push(reedSolomon(chunk, block.ecc))
  }

  // 交织：先按列取数据码字，再按列取纠错码字
  const result: number[] = []
  const maxData = Math.max(...dataBlocks.map((block) => block.length))

  for (let i = 0; i < maxData; i += 1) {
    for (const block of dataBlocks) {
      if (i < block.length) result.push(block[i] as number)
    }
  }

  const maxEcc = Math.max(...eccBlocks.map((block) => block.length))
  for (let i = 0; i < maxEcc; i += 1) {
    for (const block of eccBlocks) {
      if (i < block.length) result.push(block[i] as number)
    }
  }

  return result
}

/** 掩码规则：8 种，按坐标决定是否翻转 */
type MaskFn = (x: number, y: number) => boolean

const MASKS: MaskFn[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
]

/** 矩阵构建中的功能区域标记 */
type Matrix = Array<Array<boolean | null>>

/**
 * 创建空矩阵
 * @param size 边长
 * @returns 矩阵
 */
function createMatrix(size: number): Matrix {
  return Array.from({ length: size }, () => new Array<boolean | null>(size).fill(null))
}

/**
 * 画三个定位图案（回字形）
 * @param matrix 矩阵
 * @param reserved 功能区域标记
 * @param x 左上角
 * @param y 左上角
 */
function placeFinder(matrix: Matrix, reserved: Matrix, x: number, y: number): void {
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const px = x + dx
      const py = y + dy
      if (px < 0 || py < 0 || px >= matrix.length || py >= matrix.length) continue

      const outer = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6
      const border = dx === 0 || dx === 6 || dy === 0 || dy === 6
      const center = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
      matrix[py]![px] = outer && (border || center)
      reserved[py]![px] = true
    }
  }
}

/**
 * 画对齐图案
 * @param matrix 矩阵
 * @param reserved 功能区域标记
 * @param cx 中心
 * @param cy 中心
 */
function placeAlignment(matrix: Matrix, reserved: Matrix, cx: number, cy: number): void {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const px = cx + dx
      const py = cy + dy
      if (px < 0 || py < 0 || px >= matrix.length || py >= matrix.length) continue
      // 中心点 + 外圈是黑，中间一圈是白
      matrix[py]![px] = Math.max(Math.abs(dx), Math.abs(dy)) !== 1
      reserved[py]![px] = true
    }
  }
}

/**
 * 画时序图案（黑白相间的虚线）
 * @param matrix 矩阵
 * @param reserved 功能区域标记
 */
function placeTiming(matrix: Matrix, reserved: Matrix): void {
  const size = matrix.length

  for (let i = 8; i < size - 8; i += 1) {
    // 横
    if (matrix[6]![i] === null) {
      matrix[6]![i] = i % 2 === 0
      reserved[6]![i] = true
    }
    // 竖
    if (matrix[i]![6] === null) {
      matrix[i]![6] = i % 2 === 0
      reserved[i]![6] = true
    }
  }
}

/**
 * 预留格式信息区域
 * @param reserved 功能区域标记
 */
function reserveFormat(reserved: Matrix): void {
  const size = reserved.length

  for (let i = 0; i < 9; i += 1) {
    if (i !== 6) {
      reserved[8]![i] = true
      reserved[i]![8] = true
    }
  }

  for (let i = 0; i < 8; i += 1) {
    reserved[8]![size - 1 - i] = true
    reserved[size - 1 - i]![8] = true
  }

  // 固定的暗模块
  reserved[size - 8]![8] = true
}

/**
 * 计算格式信息（15 位，BCH(15,5)）
 * @param level 纠错等级
 * @param mask 掩码编号
 * @returns 15 位数值
 */
function formatBits(level: SrQrLevel, mask: number): number {
  const data = (LEVEL_BITS[level] << 3) | mask

  let value = data << 10
  for (let i = 4; i >= 0; i -= 1) {
    if ((value >>> (10 + i)) & 1) {
      value ^= 0b10100110111 << i
    }
  }

  return ((data << 10) | value) ^ 0b101010000010010
}

/**
 * 写入格式信息
 * @param matrix 矩阵
 * @param level 纠错等级
 * @param mask 掩码编号
 */
function placeFormat(matrix: Matrix, level: SrQrLevel, mask: number): void {
  const size = matrix.length
  const bits = formatBits(level, mask)

  /**
   * 取第 i 位（从低位起）
   * @param i 位序
   * @returns 位值
   */
  const bit = (i: number): boolean => ((bits >>> i) & 1) === 1

  // 位序：bit14 是最高位，落在 (8,0)；bit0 是最低位，落在 (0,8)。
  // 第一副本绕着左上定位图案走一圈：
  //   横向 (8,0)→(8,5) 是 bit14→bit9，(8,7) bit8，(8,8) bit7，(7,8) bit6，
  //   纵向 (5,8)→(0,8) 是 bit5→bit0。
  for (let i = 0; i <= 5; i += 1) matrix[8]![i] = bit(14 - i)
  matrix[8]![7] = bit(8)
  matrix[8]![8] = bit(7)
  matrix[7]![8] = bit(6)

  for (let y = 0; y <= 5; y += 1) matrix[y]![8] = bit(y)

  // 第二副本：横向 (size-1)→(size-8) 是 bit14→bit7，
  // 纵向 (size-7)→(size-1) 是 bit6→bit0
  for (let i = 0; i <= 7; i += 1) matrix[8]![size - 1 - i] = bit(14 - i)
  for (let y = size - 7; y <= size - 1; y += 1) matrix[y]![8] = bit(size - 1 - y)

  matrix[size - 8]![8] = true
}

/**
 * 按之字形填入数据
 * @param matrix 矩阵
 * @param reserved 功能区域标记
 * @param codewords 码字
 */
function placeData(matrix: Matrix, reserved: Matrix, codewords: number[]): void {
  const size = matrix.length
  let bitIndex = 0
  const totalBits = codewords.length * 8

  /**
   * 取第 n 个位
   * @param n 位序
   * @returns 位值
   */
  const bitAt = (n: number): boolean => {
    if (n >= totalBits) return false
    const byte = codewords[n >>> 3] as number
    return ((byte >>> (7 - (n & 7))) & 1) === 1
  }

  let upward = true

  for (let right = size - 1; right > 0; right -= 2) {
    // 第 6 列是时序图案，跳过
    if (right === 6) right = 5

    for (let step = 0; step < size; step += 1) {
      const y = upward ? size - 1 - step : step

      for (let offset = 0; offset < 2; offset += 1) {
        const x = right - offset
        if (reserved[y]![x]) continue
        matrix[y]![x] = bitAt(bitIndex)
        bitIndex += 1
      }
    }

    upward = !upward
  }
}

/**
 * 应用掩码
 * @param matrix 矩阵
 * @param reserved 功能区域标记
 * @param mask 掩码编号
 * @returns 新矩阵
 */
function applyMask(matrix: Matrix, reserved: Matrix, mask: number): Matrix {
  const fn = MASKS[mask] as MaskFn
  const size = matrix.length
  const result = matrix.map((row) => [...row])

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (reserved[y]![x]) continue
      if (fn(x, y)) result[y]![x] = !result[y]![x]
    }
  }

  return result
}

/**
 * 评估掩码得分（越低越好）
 * @param matrix 矩阵
 * @returns 分数
 */
function maskScore(matrix: Matrix): number {
  const size = matrix.length
  let score = 0

  // 规则 1：同色连续 5 个以上开始扣分
  const checkLine = (getter: (i: number, j: number) => boolean | null): void => {
    for (let i = 0; i < size; i += 1) {
      let run = 1
      for (let j = 1; j < size; j += 1) {
        if (getter(i, j) === getter(i, j - 1)) {
          run += 1
        } else {
          if (run >= 5) score += run - 2
          run = 1
        }
      }
      if (run >= 5) score += run - 2
    }
  }

  checkLine((i, j) => matrix[i]![j] ?? null)
  checkLine((i, j) => matrix[j]![i] ?? null)

  // 规则 2：2×2 同色块
  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const v = matrix[y]![x]
      if (v === matrix[y]![x + 1] && v === matrix[y + 1]![x] && v === matrix[y + 1]![x + 1]) {
        score += 3
      }
    }
  }

  // 规则 3：类似定位图案的 1:1:3:1:1
  const pattern = [true, false, true, true, true, false, true]
  const matches = (getter: (i: number, j: number) => boolean | null, i: number, j: number): boolean =>
    pattern.every((expected, k) => getter(i, j + k) === expected)

  for (let i = 0; i < size; i += 1) {
    for (let j = 0; j <= size - 7; j += 1) {
      if (matches((a, b) => matrix[a]![b] ?? null, i, j)) score += 40
      if (matches((a, b) => matrix[b]![a] ?? null, i, j)) score += 40
    }
  }

  // 规则 4：黑模块占比偏离 50% 的程度
  let dark = 0
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (matrix[y]![x]) dark += 1
    }
  }
  const ratio = (dark * 100) / (size * size)
  score += Math.floor(Math.abs(ratio - 50) / 5) * 10

  return score
}

/** 编码结果 */
export interface SrQrMatrix {
  /** 模块矩阵，true 表示黑色 */
  modules: boolean[][]
  /** 版本 */
  version: number
  /** 纠错等级 */
  level: SrQrLevel
}

/**
 * 把文本编码成 QR 矩阵
 * @param text 内容
 * @param level 纠错等级
 * @param forceMask 强制指定掩码（调试用；不传则自动选最优）
 * @returns 矩阵，内容超长时返回 null
 */
export function encodeQr(text: string, level: SrQrLevel = 'M', forceMask?: number): SrQrMatrix | null {
  const byteLength = toUtf8Bytes(text).length
  const version = pickVersion(byteLength, level)
  if (!version) return null

  const spec = SPECS[version]?.[level]
  if (!spec) return null

  const size = version * 4 + 17
  const matrix = createMatrix(size)
  const reserved = createMatrix(size)

  // 功能图案
  placeFinder(matrix, reserved, 0, 0)
  placeFinder(matrix, reserved, size - 7, 0)
  placeFinder(matrix, reserved, 0, size - 7)

  const positions = spec.alignment
  for (const cy of positions) {
    for (const cx of positions) {
      // 跳过与定位图案重叠的角
      const atTopLeft = cx === 6 && cy === 6
      const atTopRight = cx === size - 7 && cy === 6
      const atBottomLeft = cx === 6 && cy === size - 7
      if (atTopLeft || atTopRight || atBottomLeft) continue
      placeAlignment(matrix, reserved, cx, cy)
    }
  }

  placeTiming(matrix, reserved)
  reserveFormat(reserved)

  // 填入数据
  const codewords = buildCodewords(text, version, level)
  placeData(matrix, reserved, codewords)

  // 选得分最低的掩码
  let best = 0
  let bestScore = Number.POSITIVE_INFINITY

  if (typeof forceMask === 'number') {
    best = forceMask
  } else {
    for (let mask = 0; mask < 8; mask += 1) {
      const candidate = applyMask(matrix, reserved, mask)
      placeFormat(candidate, level, mask)
      const score = maskScore(candidate)
      if (score < bestScore) {
        bestScore = score
        best = mask
      }
    }
  }

  const final = applyMask(matrix, reserved, best)
  placeFormat(final, level, best)

  return {
    modules: final.map((row) => row.map((cell) => cell === true)),
    version,
    level,
  }
}
