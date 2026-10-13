import type { TriangleFigure } from '../types'

export interface Pt {
  x: number
  y: number
}

export interface TriangleLayout {
  right: Pt
  angled: Pt
  other: Pt
  viewWidth: number
  viewHeight: number
}

export const VIEW_W = 560
export const VIEW_H = 400
const AVAIL_W = 380
const AVAIL_H = 250

export function parseDegrees(label: string): number {
  const m = /^\s*(\d+(?:[.,]\d+)?)\s*°\s*$/.exec(label)
  const deg = m ? parseFloat(m[1].replace(',', '.')) : 35
  return Math.min(70, Math.max(20, deg))
}

export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y })
export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y })
export const scale = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k })
export const len = (a: Pt) => Math.hypot(a.x, a.y)
export const unit = (a: Pt): Pt => {
  const l = len(a) || 1
  return { x: a.x / l, y: a.y / l }
}
export const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

/** Posiciona o triângulo na área do SVG respeitando o ângulo, a rotação e o espelhamento. */
export function layoutTriangle(figure: TriangleFigure): TriangleLayout {
  const deg = parseDegrees(figure.angleLabel)
  const ratio = Math.tan((deg * Math.PI) / 180)
  // Ângulo reto na origem, cateto adjacente na horizontal, oposto na vertical (y de tela cresce para baixo).
  let pts: Pt[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -ratio },
  ]
  if (figure.mirror) pts = pts.map((p) => ({ x: -p.x, y: p.y }))
  for (let i = 0; i < (figure.rotation ?? 0); i++) pts = pts.map((p) => ({ x: -p.y, y: p.x }))

  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const bw = Math.max(...xs) - minX
  const bh = Math.max(...ys) - minY
  const k = Math.min(AVAIL_W / bw, AVAIL_H / bh)
  const ox = (VIEW_W - bw * k) / 2
  const oy = (VIEW_H - bh * k) / 2
  const [right, angled, other] = pts.map((p) => ({ x: ox + (p.x - minX) * k, y: oy + (p.y - minY) * k }))
  return { right, angled, other, viewWidth: VIEW_W, viewHeight: VIEW_H }
}

export function centroid(l: TriangleLayout): Pt {
  return { x: (l.right.x + l.angled.x + l.other.x) / 3, y: (l.right.y + l.angled.y + l.other.y) / 3 }
}

/** Descrição textual para leitores de tela (não revela os nomes dos lados). */
export function describeTriangle(f: TriangleFigure): string {
  const { right, angled, other } = f.vertices
  const parts = [
    `Triângulo retângulo ${angled}${other}${right}, com ângulo reto no vértice ${right}.`,
    `O ângulo ${f.angleLabel} está destacado no vértice ${angled}.`,
  ]
  if (f.sides?.hyp) parts.push(`O segmento ${angled}${other} mede ${f.sides.hyp}.`)
  if (f.sides?.adj) parts.push(`O segmento ${angled}${right} mede ${f.sides.adj}.`)
  if (f.sides?.opp) parts.push(`O segmento ${right}${other} mede ${f.sides.opp}.`)
  return parts.join(' ')
}
