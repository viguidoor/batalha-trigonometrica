export type Level = 1 | 2 | 3
export type Category = 'lados' | 'seno' | 'cosseno' | 'tangente'
export type Concept =
  | 'hipotenusa'
  | 'oposto-adjacente'
  | 'escolha-razao'
  | 'montar-relacao'
  | 'calculo'
  | 'contexto'
export type ErrorTag =
  | 'troca-seno-cosseno'
  | 'tangente-indevida'
  | 'razao-invertida'
  | 'confusao-hipotenusa'
  | 'troca-oposto-adjacente'
  | 'erro-calculo'

export type EventType = 'dobro' | 'roubo' | 'escudo' | 'tudo_ou_nada' | 'relampago'

/** Triângulo retângulo desenhado em SVG. Os nomes "hyp/adj/opp" são só dados internos. */
export interface TriangleFigure {
  kind: 'triangle'
  vertices: { right: string; angled: string; other: string }
  angleLabel: string
  sides?: { hyp?: string; adj?: string; opp?: string }
  rotation?: 0 | 1 | 2 | 3
  mirror?: boolean
}

export interface Question {
  id: string
  level: Level
  category: Category
  concept: Concept
  prompt: string
  figure?: TriangleFigure
  options: string[]
  correctIndex: number
  /** Tipo de erro que cada alternativa representa (null = correta ou sem classificação). */
  optionTags?: (ErrorTag | null)[]
  explanation: string
  /** Tempo próprio (segundos). Vazio = tempo da partida. */
  timeSeconds?: number
  /** Pontuação fixa. Vazio = valor da casa. */
  points?: number
  active: boolean
  custom: boolean
}

export interface Team {
  id: number
  name: string
  score: number
  shield: boolean
}

export interface Cell {
  index: number
  points: number
  event: EventType | null
  opened: boolean
  questionId: string | null
  openedBy: number | null
}

export interface GameConfig {
  teamNames: string[]
  /** null = cronômetro desligado */
  timerSeconds: number | null
  events: EventType[]
}

export type Phase = 'choose' | 'reveal' | 'question' | 'result' | 'finished'

export interface TimerState {
  enabled: boolean
  total: number
  remaining: number
  running: boolean
  expired: boolean
}

export interface ResultInfo {
  correct: boolean
  chosenIndex: number | null
  timedOut: boolean
  gained: number
  lost: number
  shieldUsed: boolean
  shieldGained: boolean
  stolen: { fromTeam: number; amount: number; blocked: boolean } | null
  note: string | null
}

export interface AnswerRecord {
  turn: number
  teamId: number
  questionId: string
  level: Level
  category: Category
  concept: Concept
  prompt: string
  event: EventType | null
  correct: boolean
  chosenIndex: number | null
  errorTag: ErrorTag | null
  timedOut: boolean
  justificationRequested: boolean
  points: number
}

export interface GameState {
  version: 1
  id: string
  startedAt: number
  config: GameConfig
  pool: Question[]
  teams: Team[]
  cells: Cell[]
  currentTeam: number
  phase: Phase
  activeCell: number | null
  activeQuestionId: string | null
  basePoints: number
  risk: boolean
  selected: number | null
  justificationShown: boolean
  justificationRequested: boolean
  paused: boolean
  timer: TimerState
  result: ResultInfo | null
  pendingSteal: { amount: number } | null
  records: AnswerRecord[]
  usedQuestionIds: string[]
}
