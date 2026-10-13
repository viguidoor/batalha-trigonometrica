import { getDefaultQuestions } from '../data/defaultQuestions'
import type { GameState, Question } from '../types'

export const KEYS = {
  game: 'bt:game:v1',
  questions: 'bt:questions:v1',
  settings: 'bt:settings:v1',
} as const

export interface Settings {
  sound: boolean
  lastTeamCount: number
  lastTimer: number | null
  lastEvents: string[]
  teamNames: string[]
}

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function remove(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* sem armazenamento disponível */
  }
}

function isGameState(v: unknown): v is GameState {
  if (!v || typeof v !== 'object') return false
  const g = v as Partial<GameState>
  return g.version === 1 && Array.isArray(g.teams) && Array.isArray(g.cells) && g.cells.length === 20 && Array.isArray(g.pool) && typeof g.phase === 'string'
}

export function saveGame(game: GameState): boolean {
  return write(KEYS.game, game)
}

export function loadGame(): GameState | null {
  const g = read<unknown>(KEYS.game)
  return isGameState(g) ? g : null
}

export function clearGame() {
  remove(KEYS.game)
}

function isQuestion(v: unknown): v is Question {
  if (!v || typeof v !== 'object') return false
  const q = v as Partial<Question>
  return (
    typeof q.id === 'string' &&
    typeof q.prompt === 'string' &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    typeof q.correctIndex === 'number' &&
    q.correctIndex >= 0 &&
    q.correctIndex < 4
  )
}

/** Banco salvo (original + personalizado) ou, na falta dele, as questões originais. */
export function loadQuestions(): Question[] {
  const saved = read<unknown[]>(KEYS.questions)
  if (Array.isArray(saved) && saved.length > 0 && saved.every(isQuestion)) return saved
  return getDefaultQuestions()
}

export function saveQuestions(questions: Question[]): boolean {
  return write(KEYS.questions, questions)
}

export function resetQuestions(): Question[] {
  remove(KEYS.questions)
  return getDefaultQuestions()
}

export function loadSettings(): Partial<Settings> {
  return read<Partial<Settings>>(KEYS.settings) ?? {}
}

export function saveSettings(patch: Partial<Settings>) {
  write(KEYS.settings, { ...loadSettings(), ...patch })
}
