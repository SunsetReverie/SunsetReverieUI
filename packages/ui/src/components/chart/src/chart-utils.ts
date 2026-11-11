/**
 * 图表组件的纯函数工具
 *
 * 独立成文件的原因：这些是坐标与路径的数学计算，与 Vue 渲染无关，
 * 拆出来可以直接单测，也便于后续新增图表类型时复用。
 * 所有函数都不触碰 DOM 与 window，SSR 环境同样安全。
 */

/** 画布上的一个点（像素坐标） */
export interface ChartPoint {
  /** 横坐标 */
  x: number
  /** 纵坐标 */
  y: number
}

/** 保留两位小数，避免 path 里出现过长的浮点数 */
function round(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * 把数值夹到指定区间
 * @param value 原始值
 * @param min 下限
 * @param max 上限
 * @returns 夹取后的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * 算出「好看」的 y 轴刻度
 *
 * 步长取 1 / 2 / 2.5 / 5 / 10 乘以 10 的幂，避免出现 0、3.7、7.4 这种刻度。
 * @param max 数据最大值（非正数时返回 0-1 的兜底刻度）
 * @param count 期望的刻度段数 @default 4
 * @returns 从 0 开始、包含最大值的刻度数组，长度至少为 2
 */
export function niceTicks(max: number, count = 4): number[] {
  if (!Number.isFinite(max) || max <= 0) return [0, 1]

  const rawStep = max / count
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const normalized = rawStep / magnitude
  const niceNormalized =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  const step = niceNormalized * magnitude

  const ticks: number[] = []
  // 多算一格再判断，保证最大值落在刻度上（例如 max=97、step=25 → 0,25,50,75,100）
  for (let index = 0; index <= count + 1; index += 1) {
    const value = step * index
    ticks.push(Number(value.toFixed(6)))
    if (value >= max) break
  }

  return ticks.length > 1 ? ticks : [0, max]
}

/**
 * 刻度文字：过万折算成 k，其余保留原值
 * @param value 刻度值
 * @returns 适合放在轴上的短文本
 */
export function formatTick(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 10000) return `${round(value / 1000)}k`
  if (abs >= 1000) return `${round(value / 1000)}k`
  return String(round(value))
}

/**
 * 生成折线路径
 * @param points 已映射到画布坐标的点
 * @param smooth 是否做平滑 @default true
 * @returns SVG `d` 属性；点为空时返回空字符串
 */
export function linePath(points: ChartPoint[], smooth = true): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${round(points[0].x)} ${round(points[0].y)}`
  if (!smooth) {
    return points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${round(point.x)} ${round(point.y)}`)
      .join(' ')
  }

  // Catmull-Rom 转三次贝塞尔：控制点取相邻点连线的 1/6，视觉上比二次曲线更自然
  let d = `M ${round(points[0].x)} ${round(points[0].y)}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index]
    const p1 = points[index]
    const p2 = points[index + 1]
    const p3 = points[index + 2] ?? p2

    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${round(c1x)} ${round(c1y)}, ${round(c2x)} ${round(c2y)}, ${round(p2.x)} ${round(p2.y)}`
  }
  return d
}

/**
 * 生成面积图路径：折线 + 落到基线的闭合区域
 * @param points 已映射到画布坐标的点
 * @param baseline 基线纵坐标（通常是 x 轴位置）
 * @param smooth 折线部分是否平滑 @default true
 * @returns SVG `d` 属性；点为空时返回空字符串
 */
export function areaPath(points: ChartPoint[], baseline: number, smooth = true): string {
  if (points.length === 0) return ''

  const first = points[0]
  const last = points[points.length - 1]
  return `${linePath(points, smooth)} L ${round(last.x)} ${round(baseline)} L ${round(first.x)} ${round(baseline)} Z`
}

/**
 * 生成饼图 / 环形图的一段弧
 *
 * 角度以 12 点方向为 0、顺时针增加。
 * @param cx 圆心横坐标
 * @param cy 圆心纵坐标
 * @param outerRadius 外半径
 * @param innerRadius 内半径（0 表示实心扇形）
 * @param startAngle 起始角（弧度）
 * @param endAngle 结束角（弧度）
 * @returns SVG `d` 属性
 */
export function arcPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
  const sin = Math.sin
  const cos = Math.cos

  const outerStart = {
    x: round(cx + outerRadius * sin(startAngle)),
    y: round(cy - outerRadius * cos(startAngle)),
  }
  const outerEnd = {
    x: round(cx + outerRadius * sin(endAngle)),
    y: round(cy - outerRadius * cos(endAngle)),
  }

  if (innerRadius <= 0) {
    return `M ${round(cx)} ${round(cy)} L ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} Z`
  }

  const innerEnd = {
    x: round(cx + innerRadius * sin(endAngle)),
    y: round(cy - innerRadius * cos(endAngle)),
  }
  const innerStart = {
    x: round(cx + innerRadius * sin(startAngle)),
    y: round(cy - innerRadius * cos(startAngle)),
  }

  // 外弧顺时针（sweep=1）到终点，连到内弧终点，内弧逆时针（sweep=0）回到起点
  return `M ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y} Z`
}
