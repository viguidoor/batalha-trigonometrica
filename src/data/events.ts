import type { EventType } from '../types'

export interface EventInfo {
  type: EventType
  name: string
  icon: string
  short: string
  description: string
  /** Quantas casas do tabuleiro recebem este evento. */
  count: number
}

export const EVENTS: EventInfo[] = [
  { type: 'dobro', name: 'Dobro', icon: '×2', short: 'Vale o dobro', description: 'A pontuação da questão vale o dobro se a equipe acertar.', count: 2 },
  { type: 'roubo', name: 'Roubo', icon: '⇄', short: 'Rouba pontos', description: 'Quem acerta pode retirar pontos de outra equipe (o escudo bloqueia).', count: 1 },
  { type: 'escudo', name: 'Escudo', icon: '⛨', short: 'Ganha escudo', description: 'Quem acerta ganha um escudo que bloqueia a próxima penalidade.', count: 1 },
  { type: 'tudo_ou_nada', name: 'Tudo ou Nada', icon: '⚖', short: 'Arrisque!', description: 'Antes de ver a questão, a equipe decide: arriscar dobrar ou perder os pontos.', count: 1 },
  { type: 'relampago', name: 'Desafio Relâmpago', icon: '⚡', short: 'Rápida e extra', description: 'Questão mais simples valendo 200 pontos extras.', count: 1 },
]

export const EVENT_BY_TYPE = Object.fromEntries(EVENTS.map((e) => [e.type, e])) as Record<EventType, EventInfo>
export const ALL_EVENT_TYPES: EventType[] = EVENTS.map((e) => e.type)
export const LIGHTNING_BONUS = 200
export const BOARD_VALUES = [100, 200, 300, 400, 500]
export const CELLS_PER_VALUE = 4
