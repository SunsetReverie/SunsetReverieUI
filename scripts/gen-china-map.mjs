#!/usr/bin/env node
/**
 * 中国省级地图数据生成
 *
 * 为什么需要这个脚本：省级边界原始数据 569KB（25240 个点），直接进包会让体积失控。
 * 这里做三件事：
 *   1. 下载（或读取本地）DataV 的省级边界 GeoJSON；
 *   2. Douglas-Peucker 简化到 5km 左右（0.05°），省级展示看不出差别；
 *   3. 名称归一（「内蒙古自治区」→「内蒙古」），让业务侧传「北京」也能对上。
 *
 * 产出是源码文件而不是 JSON：数据要跟着包一起发布，走源码更省一层导出配置。
 * 产物文件不要手改，改数据源后重新执行本脚本。
 *
 * 用法：
 *   pnpm gen:china-map                  # 从 DataV 下载
 *   pnpm gen:china-map --from ./x.json  # 用本地已有的 GeoJSON（离线时）
 *
 * 退出码：0 成功；1 下载或解析失败。
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

/** 仓库根目录 */
const ROOT = resolve(import.meta.dirname, '..')

/** 默认数据源：阿里 DataV 的省级边界（含 34 个省级行政区 + 南海诸岛） */
const SOURCE_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'

/** 输出文件：组件目录下的数据模块 */
const OUTPUT = join(ROOT, 'packages/ui/src/components/china-map/data/china-provinces.ts')

/** 简化容差（度）。0.05° 约 5km，1000px 宽的地图上约 1px，再小就是浪费体积 */
const TOLERANCE = 0.05

/** 坐标保留小数位：3 位约 100m，省级足够 */
const DECIMALS = 3

/**
 * 解析命令行参数
 * @returns {{ from: string | null }} 本地数据文件路径，未指定时为 null
 * @throws {Error} 参数缺少取值时抛出
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const index = args.indexOf('--from')
  if (index === -1) return { from: null }

  const value = args[index + 1]
  if (!value) throw new Error('--from 后面要跟一个 GeoJSON 文件路径')
  return { from: resolve(value) }
}

/**
 * 读取 GeoJSON：优先本地文件，否则从远端下载
 * @param {string | null} from 本地路径
 * @returns {Promise<{ geo: unknown, source: string }>} 解析后的对象与来源描述
 * @throws {Error} 下载失败（HTTP 非 200）或 JSON 解析失败时抛出
 */
async function loadGeo(from) {
  if (from) {
    return { geo: JSON.parse(readFileSync(from, 'utf-8')), source: from }
  }

  const response = await fetch(SOURCE_URL)
  if (!response.ok) throw new Error(`下载失败：HTTP ${response.status} ${SOURCE_URL}`)
  return { geo: await response.json(), source: SOURCE_URL }
}

/**
 * 点到线段的垂距（简化算法的核心度量）
 * @param {number[]} point 待测点
 * @param {number[]} start 线段起点
 * @param {number[]} end 线段终点
 * @returns {number} 垂距（度）
 */
function perpendicularDistance(point, start, end) {
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  if (dx === 0 && dy === 0) return Math.hypot(point[0] - start[0], point[1] - start[1])

  const t = ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)
  const clamped = Math.max(0, Math.min(1, t))
  return Math.hypot(point[0] - (start[0] + clamped * dx), point[1] - (start[1] + clamped * dy))
}

/**
 * Douglas-Peucker 折线简化
 * @param {number[][]} points 原始点列
 * @param {number} tolerance 容差（度）
 * @returns {number[][]} 简化后的点列（保留首尾）
 */
function simplifyRing(points, tolerance) {
  if (points.length <= 4) return points

  let maxDistance = 0
  let index = 0
  const first = points[0]
  const last = points[points.length - 1]

  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = perpendicularDistance(points[i], first, last)
    if (distance > maxDistance) {
      maxDistance = distance
      index = i
    }
  }

  if (maxDistance <= tolerance) return [first, last]

  const left = simplifyRing(points.slice(0, index + 1), tolerance)
  const right = simplifyRing(points.slice(index), tolerance)
  return [...left.slice(0, -1), ...right]
}

/**
 * 去掉行政后缀，得到与业务数据更容易对上的短名
 * @param {string} full 原始名称，如「内蒙古自治区」
 * @returns {string} 短名，如「内蒙古」
 */
function toShortName(full) {
  const name = String(full ?? '').trim()
  if (!name) return '南海诸岛'

  return name.replace(/(壮族自治区|回族自治区|维吾尔自治区|特别行政区|自治区|省|市)$/, '')
}

/**
 * 输出一个保留指定小数位的数字
 * @param {number} value 原始值
 * @returns {number} 四舍五入后的值
 */
function round(value) {
  const factor = 10 ** DECIMALS
  return Math.round(value * factor) / factor
}

/**
 * 处理一个环：简化 + 降精度 + 去掉闭合重复点
 * @param {number[][]} ring 原始环
 * @returns {number[][]} 处理后的环
 */
function processRing(ring) {
  const simplified = simplifyRing(ring, TOLERANCE).map(([lng, lat]) => [round(lng), round(lat)])

  if (simplified.length > 1) {
    const first = simplified[0]
    const last = simplified[simplified.length - 1]
    if (first[0] === last[0] && first[1] === last[1]) simplified.pop()
  }
  return simplified
}

/**
 * 主流程：读取 → 简化 → 归一 → 写文件
 * @returns {Promise<void>}
 * @throws {Error} 数据结构不符合预期时抛出
 */
async function main() {
  const { from } = parseArgs()
  const { geo, source } = await loadGeo(from)

  const features = geo?.features
  if (!Array.isArray(features) || features.length === 0) {
    throw new Error('GeoJSON 里没有 features，数据源可能已变更')
  }

  let pointCount = 0
  const provinces = []

  for (const feature of features) {
    const geometry = feature.geometry
    if (!geometry) continue

    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
    const rings = polygons
      .map((polygon) => polygon.map(processRing).filter((ring) => ring.length >= 3))
      .filter((polygon) => polygon.length > 0)

    if (rings.length === 0) continue

    const name = toShortName(feature.properties?.name)
    const adcode = String(feature.properties?.adcode ?? '')
    const center = feature.properties?.center ?? feature.properties?.centroid ?? [0, 0]

    for (const polygon of rings) {
      for (const ring of polygon) pointCount += ring.length
    }

    provinces.push({
      name,
      adcode,
      center: [round(center[0]), round(center[1])],
      rings,
    })
  }

  // 按 adcode 排序，产物稳定，diff 里不会出现无意义的位置变化
  provinces.sort((a, b) => a.adcode.localeCompare(b.adcode))

  const header = `/**
 * 中国省级边界数据（已简化）
 *
 * 数据来源：阿里 DataV.GeoAtlas 省级边界（${SOURCE_URL}）
 * 生成命令：pnpm gen:china-map（容差 ${TOLERANCE}°，坐标保留 ${DECIMALS} 位小数）
 * 本文件由脚本生成，不要手改。
 *
 * 合规提示：DataV 数据不带地图审图号。库内部使用、公司内网系统一般没有问题；
 * 若要对外发布（公开网站 / 应用商店上架），请改用自然资源部标准地图服务
 * （bzdt.ch.mnr.gov.cn）的底图并注明审图号，或咨询法务确认。
 *
 * 体积：${pointCount} 个点，源码约 __SIZE__KB，gzip 后约 __GZIP__KB。
 * 该文件只被 SrChinaMap 引用，不进主入口，不参与全量体积预算。
 */

/** 一个省级行政区（含南海诸岛）的边界 */
export interface ChinaProvinceGeo {
  /** 短名，如「内蒙古」；南海诸岛为「南海诸岛」 */
  name: string
  /** 行政区划代码；南海诸岛为 100000_JD */
  adcode: string
  /** 名称标注与气泡的锚点 [经度, 纬度] */
  center: [number, number]
  /** 多边形 → 环 → 点；一个省可能有多个不相连的多边形 */
  rings: number[][][][]
}
`

  const body = `export const CHINA_PROVINCES: ChinaProvinceGeo[] = ${JSON.stringify(provinces)}\n`
  const raw = `${header}\n${body}`

  // 注释里写上体积，便于评审时一眼看到这 38KB 花在哪
  const content = raw
    .replace('__SIZE__', (raw.length / 1024).toFixed(0))
    .replace('__GZIP__', (gzipSync(raw).length / 1024).toFixed(0))

  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, content, 'utf-8')

  const rawKb = (content.length / 1024).toFixed(0)
  const gzipKb = (gzipSync(content).length / 1024).toFixed(0)
  console.log(`[gen:china-map] 来源：${source}`)
  console.log(`[gen:china-map] 区域 ${provinces.length} 个，坐标点 ${pointCount} 个`)
  console.log(`[gen:china-map] 产物：${OUTPUT}`)
  console.log(`[gen:china-map] 体积：${rawKb}KB，gzip ${gzipKb}KB`)
}

main().catch((error) => {
  console.error(`[gen:china-map] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
