import { getDefaultQuestions } from '../data/defaultQuestions'
import { ALL_EVENT_TYPES } from '../data/events'
import type { EventType, GameConfig, GameState } from '../types'
import { createGame, gameReducer, getActiveQuestion, type GameAction } from '../utils/engine'
import { seededRng } from '../utils/random'

export function makeGame(overrides: Partial<GameConfig> = {}): GameState {
  const config: GameConfig = { teamNames: ['A', 'B', 'C'], timerSeconds: 30, events: ALL_EVENT_TYPES, ...overrides }
  return createGame(config, getDefaultQuestions(), seededRng(7))
}

export function run(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce(gameReducer, state)
}

/** Troca o evento de uma casa (para testar cada poder de forma isolada). */
export function withEvent(state: GameState, index: number, event: EventType | null, points?: number): GameState {
  return {
    ...state,
    cells: state.cells.map((c) => (c.index === index ? { ...c, event, points: points ?? c.points } : c)),
  }
}

/** Abre a casa e deixa a questão pronta para receber a resposta. */
export function openQuestion(state: GameState, index = 0, risk = false): GameState {
  return run(state, { type: 'SELECT_CELL', index, rand: 0 }, { type: 'CONTINUE_REVEAL', risk })
}

export function answer(state: GameState, correct: boolean): GameState {
  const q = getActiveQuestion(state)!
  const index = correct ? q.correctIndex : (q.correctIndex + 1) % 4
  return run(state, { type: 'SELECT_OPTION', index }, { type: 'CONFIRM' })
}

/** Joga uma rodada inteira (abrir, responder, passar a vez). */
export function playTurn(state: GameState, index: number, correct: boolean): GameState {
  let g = answer(openQuestion(state, index), correct)
  if (g.pendingSteal) g = run(g, { type: 'STEAL', targetId: null }) // o roubo exige uma decisão antes de passar a vez
  return run(g, { type: 'NEXT_TURN' })
}

