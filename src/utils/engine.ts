import type { AnswerRecord, GameConfig, GameState, Question, ResultInfo } from '../types'
import { createBoard, pickQuestion } from './board'
import type { Rng } from './random'
import { basePointsFor, resolveScore } from './scoring'

export type GameAction =
  | { type: 'SELECT_CELL'; index: number; rand: number }
  | { type: 'CONTINUE_REVEAL'; risk?: boolean }
  | { type: 'START_TIMER' }
  | { type: 'TICK' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SELECT_OPTION'; index: number }
  | { type: 'TOGGLE_JUSTIFICATION' }
  | { type: 'CONFIRM' }
  | { type: 'STEAL'; targetId: number | null }
  | { type: 'NEXT_TURN' }

export function createGame(config: GameConfig, pool: Question[], rng: Rng = Math.random): GameState {
  return {
    version: 1,
    id: `g-${Date.now().toString(36)}-${Math.floor(rng() * 1e6).toString(36)}`,
    startedAt: Date.now(),
    config,
    pool: pool.filter((q) => q.active),
    teams: config.teamNames.map((name, id) => ({ id, name, score: 0, shield: false })),
    cells: createBoard(config.events, rng),
    currentTeam: 0,
    phase: 'choose',
    activeCell: null,
    activeQuestionId: null,
    basePoints: 0,
    risk: false,
    selected: null,
    justificationShown: false,
    justificationRequested: false,
    paused: false,
    timer: { enabled: config.timerSeconds !== null, total: config.timerSeconds ?? 0, remaining: config.timerSeconds ?? 0, running: false, expired: false },
    result: null,
    pendingSteal: null,
    records: [],
    usedQuestionIds: [],
  }
}

export function getActiveQuestion(state: GameState): Question | null {
  return state.pool.find((q) => q.id === state.activeQuestionId) ?? null
}

export function isBoardComplete(state: GameState): boolean {
  return state.cells.every((c) => c.opened)
}

function patchTeam(state: GameState, id: number, patch: Partial<GameState['teams'][number]>): GameState['teams'] {
  return state.teams.map((t) => (t.id === id ? { ...t, ...patch } : t))
}

function confirmAnswer(state: GameState): GameState {
  const q = getActiveQuestion(state)
  const cell = state.activeCell === null ? null : state.cells[state.activeCell]
  if (!q || !cell) return state
  const team = state.teams[state.currentTeam]
  const timedOut = state.selected === null
  const correct = state.selected === q.correctIndex
  const score = resolveScore({ base: state.basePoints, event: cell.event, risk: state.risk, correct, shield: team.shield })
  const loss = Math.min(score.loss, team.score)

  const teams = patchTeam(state, team.id, {
    score: team.score + score.gain - loss,
    shield: score.shieldGained ? true : score.shieldUsed ? false : team.shield,
  })

  let pendingSteal: GameState['pendingSteal'] = null
  let note: string | null = null
  if (correct && cell.event === 'roubo') {
    const hasTarget = teams.some((t) => t.id !== team.id && (t.score > 0 || t.shield))
    if (hasTarget) pendingSteal = { amount: state.basePoints }
    else note = 'Nenhuma outra equipe tinha pontos para roubar.'
  }
  if (score.shieldUsed) note = 'O escudo protegeu a equipe da perda de pontos.'

  const result: ResultInfo = {
    correct,
    chosenIndex: state.selected,
    timedOut,
    gained: score.gain,
    lost: loss,
    shieldUsed: score.shieldUsed,
    shieldGained: score.shieldGained,
    stolen: null,
    note,
  }
  const record: AnswerRecord = {
    turn: state.records.length + 1,
    teamId: team.id,
    questionId: q.id,
    level: q.level,
    category: q.category,
    concept: q.concept,
    prompt: q.prompt,
    event: cell.event,
    correct,
    chosenIndex: state.selected,
    errorTag: state.selected === null ? null : (q.optionTags?.[state.selected] ?? null),
    timedOut,
    justificationRequested: state.justificationRequested,
    points: score.gain - loss,
  }
  return {
    ...state,
    teams,
    phase: 'result',
    result,
    pendingSteal,
    paused: false,
    timer: { ...state.timer, running: false },
    records: [...state.records, record],
  }
}

function applySteal(state: GameState, targetId: number | null): GameState {
  if (!state.pendingSteal || !state.result) return state
  if (targetId === null) return { ...state, pendingSteal: null, result: { ...state.result, note: 'A equipe optou por não roubar pontos.' } }
  const target = state.teams.find((t) => t.id === targetId)
  if (!target || targetId === state.currentTeam) return state
  const { amount } = state.pendingSteal
  let teams = state.teams
  let stolen: NonNullable<ResultInfo['stolen']>
  if (target.shield) {
    teams = patchTeam(state, target.id, { shield: false })
    stolen = { fromTeam: target.id, amount: 0, blocked: true }
  } else {
    const taken = Math.min(amount, target.score)
    teams = teams.map((t) => {
      if (t.id === target.id) return { ...t, score: t.score - taken }
      if (t.id === state.currentTeam) return { ...t, score: t.score + taken }
      return t
    })
    stolen = { fromTeam: target.id, amount: taken, blocked: false }
  }
  const records = state.records.map((r, i) =>
    i === state.records.length - 1 ? { ...r, points: r.points + stolen.amount } : r,
  )
  return { ...state, teams, pendingSteal: null, result: { ...state.result, stolen }, records }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_CELL': {
      if (state.phase !== 'choose') return state
      const cell = state.cells[action.index]
      if (!cell || cell.opened) return state
      const q = pickQuestion(state.pool, state.usedQuestionIds, cell, action.rand)
      if (!q) return state
      const total = q.timeSeconds ?? state.config.timerSeconds ?? 0
      return {
        ...state,
        phase: 'reveal',
        activeCell: cell.index,
        activeQuestionId: q.id,
        basePoints: basePointsFor(cell.points, cell.event, q),
        risk: false,
        selected: null,
        justificationShown: false,
        justificationRequested: false,
        paused: false,
        result: null,
        pendingSteal: null,
        cells: state.cells.map((c) => (c.index === cell.index ? { ...c, opened: true, questionId: q.id, openedBy: state.currentTeam } : c)),
        usedQuestionIds: [...state.usedQuestionIds, q.id],
        timer: {
          enabled: state.config.timerSeconds !== null,
          total,
          remaining: total,
          running: false,
          expired: false,
        },
      }
    }
    case 'CONTINUE_REVEAL':
      if (state.phase !== 'reveal') return state
      return { ...state, phase: 'question', risk: action.risk ?? false }
    case 'START_TIMER':
      if (state.phase !== 'question' || state.paused || !state.timer.enabled || state.timer.expired || state.timer.running) return state
      return { ...state, timer: { ...state.timer, running: true } }
    case 'TICK': {
      const t = state.timer
      if (state.phase !== 'question' || state.paused || !t.running) return state
      const remaining = Math.max(0, t.remaining - 1)
      return { ...state, timer: { ...t, remaining, running: remaining > 0, expired: remaining === 0 } }
    }
    case 'TOGGLE_PAUSE':
      if (state.phase !== 'question' && state.phase !== 'result') return state
      return { ...state, paused: !state.paused }
    case 'SELECT_OPTION': {
      const q = getActiveQuestion(state)
      if (state.phase !== 'question' || state.paused || !q) return state
      if (action.index < 0 || action.index >= q.options.length) return state
      return { ...state, selected: action.index }
    }
    case 'TOGGLE_JUSTIFICATION':
      if (state.phase !== 'question' || state.paused) return state
      return { ...state, justificationShown: !state.justificationShown, justificationRequested: true }
    case 'CONFIRM':
      if (state.phase !== 'question' || state.paused) return state
      if (state.selected === null && !state.timer.expired) return state
      return confirmAnswer(state)
    case 'STEAL':
      if (state.phase !== 'result') return state
      return applySteal(state, action.targetId)
    case 'NEXT_TURN': {
      if (state.phase !== 'result' || state.pendingSteal || state.paused) return state
      const done = state.cells.every((c) => c.opened)
      return {
        ...state,
        phase: done ? 'finished' : 'choose',
        currentTeam: (state.currentTeam + 1) % state.teams.length,
        activeCell: null,
        activeQuestionId: null,
        basePoints: 0,
        risk: false,
        selected: null,
        justificationShown: false,
        justificationRequested: false,
        result: null,
      }
    }
    default:
      return state
  }
}
