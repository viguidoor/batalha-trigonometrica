import { LIGHTNING_BONUS } from '../data/events'
import type { EventType, Question } from '../types'

export interface ScoreInput {
  base: number
  event: EventType | null
  risk: boolean
  correct: boolean
  shield: boolean
}

export interface ScoreOutput {
  gain: number
  loss: number
  shieldUsed: boolean
  shieldGained: boolean
}

/** Pontos-base da questão antes de multiplicadores. */
export function basePointsFor(cellPoints: number, event: EventType | null, question: Question): number {
  if (event === 'relampago') return cellPoints + LIGHTNING_BONUS
  return question.points && question.points > 0 ? question.points : cellPoints
}

export function pointsMultiplier(event: EventType | null, risk: boolean): number {
  let m = 1
  if (event === 'dobro') m *= 2
  if (event === 'tudo_ou_nada' && risk) m *= 2
  return m
}

/** Calcula ganho/perda de uma resposta. A perda real ainda será limitada ao placar da equipe. */
export function resolveScore({ base, event, risk, correct, shield }: ScoreInput): ScoreOutput {
  if (correct) {
    return { gain: base * pointsMultiplier(event, risk), loss: 0, shieldUsed: false, shieldGained: event === 'escudo' }
  }
  if (event === 'tudo_ou_nada' && risk) {
    return shield
      ? { gain: 0, loss: 0, shieldUsed: true, shieldGained: false }
      : { gain: 0, loss: base, shieldUsed: false, shieldGained: false }
  }
  return { gain: 0, loss: 0, shieldUsed: false, shieldGained: false }
}

export function percent(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100)
}
