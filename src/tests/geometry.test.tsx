import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TriangleFigure } from '../components/TriangleFigure'
import { getDefaultQuestions } from '../data/defaultQuestions'
import { describeTriangle, layoutTriangle, parseDegrees, VIEW_H, VIEW_W } from '../utils/geometry'

describe('triângulos em SVG', () => {
  it('interpreta o ângulo do rótulo, com limites', () => {
    expect(parseDegrees('30°')).toBe(30)
    expect(parseDegrees('60 °')).toBe(60)
    expect(parseDegrees('α')).toBe(35)
    expect(parseDegrees('5°')).toBe(20)
    expect(parseDegrees('89°')).toBe(70)
  })

  it('todas as figuras do banco cabem na área do SVG, com ângulo reto de 90°', () => {
    for (const q of getDefaultQuestions().filter((x) => x.figure)) {
      const l = layoutTriangle(q.figure!)
      for (const p of [l.right, l.angled, l.other]) {
        expect(p.x, q.id).toBeGreaterThan(40)
        expect(p.x, q.id).toBeLessThan(VIEW_W - 40)
        expect(p.y, q.id).toBeGreaterThan(40)
        expect(p.y, q.id).toBeLessThan(VIEW_H - 40)
      }
      const a = { x: l.angled.x - l.right.x, y: l.angled.y - l.right.y }
      const b = { x: l.other.x - l.right.x, y: l.other.y - l.right.y }
      expect(Math.abs(a.x * b.x + a.y * b.y), q.id).toBeLessThan(1e-6)
    }
  })

  it('o ângulo destacado respeita a medida informada', () => {
    const l = layoutTriangle({ kind: 'triangle', vertices: { right: 'C', angled: 'A', other: 'B' }, angleLabel: '30°' })
    const adj = Math.hypot(l.angled.x - l.right.x, l.angled.y - l.right.y)
    const opp = Math.hypot(l.other.x - l.right.x, l.other.y - l.right.y)
    expect(Math.atan2(opp, adj) * (180 / Math.PI)).toBeCloseTo(30, 5)
  })

  it('mostra vértices, ângulo e medidas, mas nunca os nomes dos lados', () => {
    for (const q of getDefaultQuestions().filter((x) => x.figure)) {
      const { container } = render(<TriangleFigure figure={q.figure!} />)
      const svg = container.querySelector('svg')!
      expect(svg).toBeInTheDocument()
      const text = svg.textContent ?? ''
      expect(text, q.id).toContain(q.figure!.angleLabel)
      expect(text, q.id).toContain(q.figure!.vertices.right)
      expect(`${text} ${svg.getAttribute('aria-label')}`, q.id).not.toMatch(/hipotenusa|cateto/i)
    }
  })

  it('descrição para leitores de tela cita vértices e medidas', () => {
    const d = describeTriangle({ kind: 'triangle', vertices: { right: 'C', angled: 'A', other: 'B' }, angleLabel: '30°', sides: { hyp: '10 cm', opp: 'x' } })
    expect(d).toMatch(/ângulo reto no vértice C/)
    expect(d).toMatch(/AB mede 10 cm/)
  })
})
