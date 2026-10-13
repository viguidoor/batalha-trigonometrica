import { describe, expect, it } from 'vitest'
import { getDefaultQuestions } from '../data/defaultQuestions'
import { basePointsFor, percent, pointsMultiplier, resolveScore } from '../utils/scoring'

const base = { base: 300, event: null, risk: false, shield: false } as const

describe('cálculo de pontuação', () => {
  it('acerto simples vale o valor da casa', () => {
    expect(resolveScore({ ...base, correct: true })).toEqual({ gain: 300, loss: 0, shieldUsed: false, shieldGained: false })
  })

  it('erro simples não tira pontos', () => {
    expect(resolveScore({ ...base, correct: false })).toEqual({ gain: 0, loss: 0, shieldUsed: false, shieldGained: false })
  })

  it('dobro: acerto vale o dobro; erro não penaliza', () => {
    expect(resolveScore({ ...base, event: 'dobro', correct: true }).gain).toBe(600)
    expect(resolveScore({ ...base, event: 'dobro', correct: false }).loss).toBe(0)
  })

  it('tudo ou nada arriscando: dobra no acerto e perde o valor no erro', () => {
    expect(resolveScore({ ...base, event: 'tudo_ou_nada', risk: true, correct: true }).gain).toBe(600)
    expect(resolveScore({ ...base, event: 'tudo_ou_nada', risk: true, correct: false }).loss).toBe(300)
  })

  it('tudo ou nada sem arriscar vale o normal e não perde nada', () => {
    expect(resolveScore({ ...base, event: 'tudo_ou_nada', risk: false, correct: true }).gain).toBe(300)
    expect(resolveScore({ ...base, event: 'tudo_ou_nada', risk: false, correct: false }).loss).toBe(0)
  })

  it('escudo protege da perda do tudo ou nada e é consumido', () => {
    const r = resolveScore({ ...base, event: 'tudo_ou_nada', risk: true, correct: false, shield: true })
    expect(r).toEqual({ gain: 0, loss: 0, shieldUsed: true, shieldGained: false })
  })

  it('evento escudo concede o escudo ao acertar, e não ao errar', () => {
    expect(resolveScore({ ...base, event: 'escudo', correct: true }).shieldGained).toBe(true)
    expect(resolveScore({ ...base, event: 'escudo', correct: false }).shieldGained).toBe(false)
  })

  it('multiplicadores', () => {
    expect(pointsMultiplier(null, false)).toBe(1)
    expect(pointsMultiplier('dobro', true)).toBe(2)
    expect(pointsMultiplier('tudo_ou_nada', true)).toBe(2)
    expect(pointsMultiplier('tudo_ou_nada', false)).toBe(1)
  })

  it('pontos-base: valor da casa, questão com pontuação fixa e relâmpago (+200)', () => {
    const q = getDefaultQuestions()[0]
    expect(basePointsFor(200, null, q)).toBe(200)
    expect(basePointsFor(200, null, { ...q, points: 450 })).toBe(450)
    expect(basePointsFor(100, 'relampago', q)).toBe(300)
  })

  it('percentual', () => {
    expect(percent(0, 0)).toBe(0)
    expect(percent(1, 3)).toBe(33)
    expect(percent(2, 2)).toBe(100)
  })
})
