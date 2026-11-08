/**
 * GF(256) 有限域运算与 Reed-Solomon 纠错码
 *
 * QR 码的纠错基于 GF(256)：把每个字节看作多项式系数，
 * 在模一个不可约多项式（x^8 + x^4 + x^3 + x^2 + 1，即 0x11d）下做运算。
 * 乘法和除法都用对数表加速——否则每个字节都要循环 8 次。
 */

/** 本原多项式，QR 码规定用它 */
const PRIMITIVE = 0x11d

/** 指数表：exp[i] = α^i */
const EXP = new Uint8Array(512)

/** 对数表：log[α^i] = i */
const LOG = new Uint8Array(256)

// 预处理两张表，之后乘法就是一次加法查表
let seed = 1
for (let i = 0; i < 255; i += 1) {
  EXP[i] = seed
  LOG[seed] = i
  seed <<= 1
  if (seed & 0x100) seed ^= PRIMITIVE
}

// 后半段复制一份，省掉取模运算
for (let i = 255; i < 512; i += 1) {
  EXP[i] = EXP[i - 255] as number
}

/**
 * 有限域乘法
 * @param a 操作数
 * @param b 操作数
 * @returns 乘积
 */
export function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return EXP[(LOG[a] as number) + (LOG[b] as number)] as number
}

/**
 * 有限域幂
 * @param base 底数
 * @param power 指数
 * @returns 结果
 */
function gfPow(base: number, power: number): number {
  return EXP[((LOG[base] as number) * power) % 255] as number
}

/**
 * 生成多项式
 *
 * (x - α^0)(x - α^1)...(x - α^(degree-1))，展开后系数从高次到低次。
 * @param degree 纠错码字数
 * @returns 系数数组
 */
function generatorPoly(degree: number): number[] {
  let poly = [1]

  for (let i = 0; i < degree; i += 1) {
    const next = new Array<number>(poly.length + 1).fill(0)
    const root = gfPow(2, i)

    for (let j = 0; j < poly.length; j += 1) {
      next[j] = (next[j] as number) ^ (poly[j] as number)
      next[j + 1] = (next[j + 1] as number) ^ gfMul(poly[j] as number, root)
    }

    poly = next
  }

  return poly
}

/**
 * 计算纠错码字
 *
 * 把数据多项式乘以 x^degree，再对生成多项式取余，余数就是纠错码。
 * @param data 数据码字
 * @param degree 纠错码字数
 * @returns 纠错码字
 */
export function reedSolomon(data: number[], degree: number): number[] {
  const gen = generatorPoly(degree)
  const result = new Array<number>(degree).fill(0)

  for (const byte of data) {
    const factor = byte ^ (result[0] as number)

    result.shift()
    result.push(0)

    for (let i = 0; i < degree; i += 1) {
      result[i] = (result[i] as number) ^ gfMul(gen[i + 1] as number, factor)
    }
  }

  return result
}
