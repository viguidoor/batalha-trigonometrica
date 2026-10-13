import { BOARD_VALUES, CELLS_PER_VALUE, EVENTS } from '../data/events'
import type { Cell, EventType, Level, Question } from '../types'
import { shuffle, type Rng } from './random'

export const BOARD_SIZE = BOARD_VALUES.length * CELLS_PER_VALUE
export const BOARD_COLUMNS = 5

/** Cria as 20 casas: valores embaralhados e eventos espalhados nas casas ativas. */
export function createBoard(enabledEvents: EventType[], rng: Rng = Math.random): Cell[] {
  const values = shuffle(
    BOARD_VALUES.flatMap((v) => Array<number>(CELLS_PER_VALUE).fill(v)),
    rng,
  )
  const slots = shuffle(
    Array.from({ length: BOARD_SIZE }, (_, i) => i),
    rng,
  )
  const events: (EventType | null)[] = Array(BOARD_SIZE).fill(null)
  let cursor = 0
  for (const info of EVENTS) {
    if (!enabledEvents.includes(info.type)) continue
    for (let n = 0; n < info.count; n++) events[slots[cursor++]] = info.type
  }
  return values.map((points, index) => ({
    index,
    points,
    event: events[index],
    opened: false,
    questionId: null,
    openedBy: null,
  }))
}

/** Níveis preferidos conforme o valor da casa (mais pontos, mais difícil). */
const LEVELS_BY_POINTS: Record<number, Level[]> = {
  100: [1],
  200: [1, 2],
  300: [2],
  400: [2, 3],
  500: [3],
}

/**
 * Escolhe a questão da casa. Evita repetição enquanto houver questões novas;
 * relâmpago usa sempre o nível mais simples. `rand` ∈ [0,1).
 */
export function pickQuestion(
  pool: Question[],
  usedIds: string[],
  cell: Pick<Cell, 'points' | 'event'>,
  rand: number,
): Question | null {
  const active = pool.filter((q) => q.active)
  if (active.length === 0) return null
  const preferred = cell.event === 'relampago' ? [1 as Level] : (LEVELS_BY_POINTS[cell.points] ?? [1, 2, 3])
  const fresh = active.filter((q) => !usedIds.includes(q.id))
  const stages = [
    fresh.filter((q) => preferred.includes(q.level)),
    fresh,
    active.filter((q) => preferred.includes(q.level)),
    active,
  ]
  const candidates = stages.find((s) => s.length > 0) ?? active
  return candidates[Math.min(candidates.length - 1, Math.floor(rand * candidates.length))]
}
