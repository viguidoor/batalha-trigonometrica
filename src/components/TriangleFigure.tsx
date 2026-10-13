import type { TriangleFigure as Figure } from '../types'
import { add, centroid, describeTriangle, layoutTriangle, mid, scale, sub, unit, type Pt } from '../utils/geometry'

const UNKNOWN = /^[a-z]$/i

function SideLabel({ text, at }: { text: string; at: Pt }) {
  const unknown = UNKNOWN.test(text.trim())
  return (
    <text x={at.x} y={at.y} className={unknown ? 'fig-side fig-unknown' : 'fig-side'} textAnchor="middle" dominantBaseline="central">
      {text}
    </text>
  )
}

/** Triângulo retângulo em SVG. Nunca escreve os nomes dos lados: o aluno deve identificá-los. */
export function TriangleFigure({ figure }: { figure: Figure }) {
  const l = layoutTriangle(figure)
  const c = centroid(l)
  const { right, angled, other } = l
  const out = (p: Pt, d: number) => add(p, scale(unit(sub(p, c)), d))
  const sideOut = (a: Pt, b: Pt, d: number) => {
    const m = mid(a, b)
    return add(m, scale(unit(sub(m, c)), d))
  }

  // Marca do ângulo reto
  const u1 = unit(sub(angled, right))
  const u2 = unit(sub(other, right))
  const s = 18
  const rightMark = `M ${right.x + u1.x * s} ${right.y + u1.y * s} L ${right.x + (u1.x + u2.x) * s} ${right.y + (u1.y + u2.y) * s} L ${right.x + u2.x * s} ${right.y + u2.y * s}`

  // Arco do ângulo destacado
  const v1 = unit(sub(right, angled))
  const v2 = unit(sub(other, angled))
  const r = 46
  const a1 = add(angled, scale(v1, r))
  const a2 = add(angled, scale(v2, r))
  const sweep = v1.x * v2.y - v1.y * v2.x > 0 ? 1 : 0
  const bis = unit(add(v1, v2))
  const half = Math.acos(Math.max(-1, Math.min(1, v1.x * v2.x + v1.y * v2.y))) / 2
  // Quanto mais fechado o ângulo, mais longe o rótulo fica do vértice para não tocar nas linhas.
  const angleText = add(angled, scale(bis, Math.min(112, Math.max(r + 24, 34 / Math.sin(half)))))

  const { sides, vertices } = figure
  return (
    <svg className="triangle-figure" viewBox={`0 0 ${l.viewWidth} ${l.viewHeight}`} role="img" aria-label={describeTriangle(figure)}>
      <polygon className="fig-body" points={`${right.x},${right.y} ${angled.x},${angled.y} ${other.x},${other.y}`} />
      <path className="fig-sector" d={`M ${angled.x} ${angled.y} L ${a1.x} ${a1.y} A ${r} ${r} 0 0 ${sweep} ${a2.x} ${a2.y} Z`} />
      <path className="fig-right" d={rightMark} />
      <path className="fig-arc" d={`M ${a1.x} ${a1.y} A ${r} ${r} 0 0 ${sweep} ${a2.x} ${a2.y}`} />
      <text x={angleText.x} y={angleText.y} className="fig-angle" textAnchor="middle" dominantBaseline="central">
        {figure.angleLabel}
      </text>
      {[
        [vertices.right, right],
        [vertices.angled, angled],
        [vertices.other, other],
      ].map(([name, p]) => {
        const at = out(p as Pt, 26)
        return (
          <text key={name as string} x={at.x} y={at.y} className="fig-vertex" textAnchor="middle" dominantBaseline="central">
            {name as string}
          </text>
        )
      })}
      {sides?.hyp && <SideLabel text={sides.hyp} at={sideOut(angled, other, 30)} />}
      {sides?.adj && <SideLabel text={sides.adj} at={sideOut(angled, right, 28)} />}
      {sides?.opp && <SideLabel text={sides.opp} at={sideOut(right, other, 28)} />}
    </svg>
  )
}
