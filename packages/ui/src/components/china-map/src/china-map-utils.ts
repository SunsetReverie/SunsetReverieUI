/**
 * 中国地图的几何与数据工具
 *
 * 与 chart-utils 同一思路：坐标与路径计算是纯函数，和 Vue 无关，
 * 拆出来便于单测，也方便以后加下钻（省 → 市）时复用。
 * 不触碰 DOM 与 window，SSR 安全。
 */

/** 地图数据里的一行：省名与数值 */
export interface ChinaMapDatum {
  /** 省名，短名（北京）或全名（北京市）都认 */
  name: string
  /** 数值，用于着色或气泡大小 */
  value: number
}

/** 投影后的一块区域 */
export interface ProjectedRegion {
  /** 短名 */
  name: string
  /** 行政区划代码 */
  adcode: string
  /** SVG 路径 */
  d: string
  /** 标注锚点（已投影到画布坐标） */
  center: [number, number]
}

/** 地图数据的单个区域结构（与生成脚本产出的类型一致） */
export interface ChinaMapGeo {
  /** 短名 */
  name: string
  /** 行政区划代码 */
  adcode: string
  /** 标注锚点（经纬度） */
  center: [number, number]
  /** 多边形 → 环 → 点 */
  rings: number[][][][]
}

/** 南海诸岛的 adcode，用来把它从主图 bbox 里排除、单独画成小图 */
export const SOUTH_SEA_ADCODE = '100000_JD'

/** 省级名称的后缀，归一时去掉 */
const NAME_SUFFIX = /(壮族自治区|回族自治区|维吾尔自治区|特别行政区|自治区|省|市)$/

/**
 * 把省名归一成短名
 *
 * 业务侧常写「北京」「北京市」「内蒙古自治区」三种写法，统一成数据里的短名，
 * 对不上就返回原值（由调用方决定是否忽略）。
 * @param name 原始省名
 * @returns 归一后的短名
 */
export function normalizeName(name: string): string {
  const trimmed = String(name ?? '').trim()
  if (!trimmed) return ''
  // 「内蒙古自治区」先去后缀得「内蒙古」，再处理「广西壮族自治区」这类多段后缀
  return trimmed.replace(NAME_SUFFIX, '').replace(NAME_SUFFIX, '')
}

/**
 * 纬度转墨卡托 y
 *
 * 用于把经纬度投到平面上：x 直接用经度，y 用墨卡托变换，
 * 这样中国地图不会被横向压扁得太过。
 * @param latitude 纬度（度）
 * @returns 墨卡托 y 值
 */
export function mercatorY(latitude: number): number {
  const clamped = Math.max(-85, Math.min(85, latitude))
  return Math.log(Math.tan(Math.PI / 4 + (clamped * Math.PI) / 360))
}

/**
 * 遍历所有区域的点，得到经纬度包围盒（墨卡托后）
 * @param regions 区域列表
 * @param excludeAdcode 需要排除的 adcode（南海诸岛不参与主图取景）
 * @returns 包围盒与跨度；没有点时返回 null
 */
export function boundsOf(
  regions: ChinaMapGeo[],
  excludeAdcode?: string,
): { minX: number; maxX: number; minY: number; maxY: number } | null {
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  let hasPoint = false

  for (const region of regions) {
    if (excludeAdcode && region.adcode === excludeAdcode) continue

    for (const polygon of region.rings) {
      for (const ring of polygon) {
        for (const [lng, lat] of ring) {
          const y = mercatorY(lat)
          if (lng < minX) minX = lng
          if (lng > maxX) maxX = lng
          if (y < minY) minY = y
          if (y > maxY) maxY = y
          hasPoint = true
        }
      }
    }
  }

  return hasPoint ? { minX, maxX, minY, maxY } : null
}

/**
 * 构造投影函数：把经纬度映射到画布上的像素坐标，等比缩放并居中
 * @param bounds 包围盒
 * @param box 目标绘制区域（宽高与上下左右边距）
 * @returns 投影函数
 */
export function createProjection(
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  box: { width: number; height: number; padding: number },
): (lng: number, lat: number) => [number, number] {
  const spanX = Math.max(1e-6, bounds.maxX - bounds.minX)
  const spanY = Math.max(1e-6, bounds.maxY - bounds.minY)
  const usableW = Math.max(0, box.width - box.padding * 2)
  const usableH = Math.max(0, box.height - box.padding * 2)
  const scale = Math.min(usableW / spanX, usableH / spanY)

  const offsetX = box.padding + (usableW - spanX * scale) / 2
  const offsetY = box.padding + (usableH - spanY * scale) / 2

  return (lng, lat) => [
    offsetX + (lng - bounds.minX) * scale,
    // 纬度越大 y 越小，屏幕坐标要翻转
    offsetY + (bounds.maxY - mercatorY(lat)) * scale,
  ]
}

/**
 * 把一块区域的全部多边形转成 SVG 路径
 * @param region 区域数据
 * @param project 投影函数
 * @returns SVG `d` 属性
 */
export function regionPath(
  region: ChinaMapGeo,
  project: (lng: number, lat: number) => [number, number],
): string {
  const parts: string[] = []

  for (const polygon of region.rings) {
    for (const ring of polygon) {
      if (ring.length < 3) continue
      let closed = ''
      for (let index = 0; index < ring.length; index += 1) {
        const [x, y] = project(ring[index][0], ring[index][1])
        closed += `${index === 0 ? 'M' : 'L'} ${Math.round(x * 100) / 100} ${Math.round(y * 100) / 100}`
        if (index !== ring.length - 1) closed += ' '
      }
      parts.push(`${closed} Z`)
    }
  }

  return parts.join(' ')
}

/**
 * 按数值算分级档位
 * @param value 数值
 * @param min 最小值
 * @param max 最大值
 * @param steps 档数 @default 5
 * @returns 0 ~ steps-1 的档位；无数据返回 -1
 */
export function gradeIndex(value: number, min: number, max: number, steps = 5): number {
  if (!Number.isFinite(value)) return -1
  if (max <= min) return steps - 1
  const ratio = (value - min) / (max - min)
  return Math.min(steps - 1, Math.max(0, Math.floor(ratio * steps)))
}

/**
 * 气泡半径：按面积感知的开方缩放，避免大值把其它点压成点
 * @param value 数值
 * @param max 最大数值
 * @param maxRadius 最大半径（px）
 * @param minRadius 最小半径（px） @default 4
 * @returns 半径（px）
 */
export function bubbleRadius(value: number, max: number, maxRadius: number, minRadius = 4): number {
  if (!Number.isFinite(value) || value <= 0 || max <= 0) return 0
  const ratio = Math.min(1, value / max)
  return minRadius + Math.sqrt(ratio) * (maxRadius - minRadius)
}
