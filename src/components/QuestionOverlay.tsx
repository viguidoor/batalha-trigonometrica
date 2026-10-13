import { useEffect, useRef, type Dispatch } from 'react'
import { LEVEL_LABEL } from '../data/labels'
import { EVENT_BY_TYPE } from '../data/events'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { GameState, Question } from '../types'
import type { GameAction } from '../utils/engine'
import { pointsMultiplier } from '../utils/scoring'
import { EventBadge } from './EventBadge'
import { PauseOverlay } from './PauseOverlay'
import { Scoreboard } from './Scoreboard'
import { TimerRing } from './TimerRing'
import { TriangleFigure } from './TriangleFigure'

const LETTERS = ['A', 'B', 'C', 'D']

interface Props {
  game: GameState
  question: Question
  dispatch: Dispatch<GameAction>
}

function optionState(game: GameState, q: Question, i: number): string {
  const revealed = game.phase === 'result'
  if (revealed) {
    if (i === q.correctIndex) return 'is-correct'
    if (i === game.selected) return 'is-wrong'
    return 'is-dim'
  }
  return i === game.selected ? 'is-selected' : ''
}

function optionTag(game: GameState, q: Question, i: number): string | null {
  if (game.phase === 'result') {
    if (i === q.correctIndex) return '✓ Correta'
    if (i === game.selected) return '✗ Escolhida pela equipe'
    return null
  }
  return i === game.selected ? '● Resposta da equipe' : null
}

export function QuestionOverlay({ game, question: q, dispatch }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, true)
  const cell = game.activeCell !== null ? game.cells[game.activeCell] : null
  const team = game.teams[game.currentTeam]
  const result = game.result
  const revealed = game.phase === 'result'
  const mult = cell ? pointsMultiplier(cell.event, game.risk) : 1
  const worth = game.basePoints * mult

  // Teclas A–D / 1–4 escolhem a alternativa (quando não há pausa).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (game.phase !== 'question' || game.paused) return
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return
      const idx = 'abcd'.indexOf(e.key.toLowerCase())
      const num = ['1', '2', '3', '4'].indexOf(e.key)
      const i = idx >= 0 ? idx : num
      if (i >= 0 && i < q.options.length && !e.ctrlKey && !e.metaKey && !e.altKey) dispatch({ type: 'SELECT_OPTION', index: i })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [game.phase, game.paused, q.options.length, dispatch])

  // Ao revelar a resposta o botão "Confirmar" some: leva o foco para a ação seguinte.
  useEffect(() => {
    if (!revealed) return
    const root = ref.current
    const target = root?.querySelector<HTMLElement>('[data-autofocus]:not(:disabled)') ?? root?.querySelector<HTMLElement>('.steal-options button:not(:disabled)')
    target?.focus({ preventScroll: true })
  }, [revealed, game.pendingSteal])

  const timer = game.timer
  const canConfirm = game.selected !== null || timer.expired
  const stealTargets = game.teams.filter((t) => t.id !== game.currentTeam)

  return (
    <div className="overlay question-overlay">
      <div ref={ref} className="question-screen" role="dialog" aria-modal="true" aria-labelledby="q-title" inert={game.paused}>
        <header className="q-top">
          <div className="q-team">
            <span className="eyebrow">Respondendo</span>
            <strong id="q-title">{team.name}</strong>
          </div>
          <div className="q-badges">
            <span className="chip">{LEVEL_LABEL[q.level]}</span>
            <span className="chip chip-points">
              Vale {worth} {worth === 1 ? 'ponto' : 'pontos'}
            </span>
            {cell?.event && <EventBadge event={cell.event} />}
            {game.risk && <span className="chip chip-risk">⚖ Arriscando: dobra ou perde</span>}
            {team.shield && <span className="chip chip-shield">⛨ Escudo ativo</span>}
          </div>
          <TimerRing timer={timer} paused={game.paused} done={revealed} />
        </header>

        <Scoreboard teams={game.teams} currentTeam={game.currentTeam} compact />

        <div className="q-body">
          <div className="q-main">
            <p className="q-prompt">{q.prompt}</p>
            <ul className="q-options" aria-label="Alternativas">
              {q.options.map((opt, i) => {
                const st = optionState(game, q, i)
                const tag = optionTag(game, q, i)
                return (
                  <li key={i}>
                    <button
                      type="button"
                      className={`q-option ${st}`}
                      aria-pressed={game.selected === i}
                      disabled={revealed}
                      onClick={() => dispatch({ type: 'SELECT_OPTION', index: i })}
                    >
                      <span className="q-letter" aria-hidden="true">
                        {LETTERS[i]}
                      </span>
                      <span className="q-text">
                        <span className="sr-only">Alternativa {LETTERS[i]}: </span>
                        {opt}
                      </span>
                      {tag && <span className="q-tag">{tag}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
          {q.figure && (
            <div className="q-figure">
              <TriangleFigure figure={q.figure} />
            </div>
          )}
        </div>

        {game.justificationShown && !revealed && (
          <div className="justify-card" role="note">
            <span aria-hidden="true">🗣</span> Explique por que sua equipe escolheu essa estratégia.
          </div>
        )}

        {revealed && result && (
          <div className={result.correct ? 'result-card is-ok' : 'result-card is-bad'} role="status">
            <div className="result-head">
              <strong>{result.correct ? '✓ Resposta correta!' : result.timedOut ? '⏱ Sem resposta no tempo' : '✗ Resposta incorreta'}</strong>
              <span>
                {result.gained > 0 && `+${result.gained} pontos`}
                {result.lost > 0 && `−${result.lost} pontos`}
                {result.gained === 0 && result.lost === 0 && 'Sem mudança de pontos'}
              </span>
              {result.shieldGained && <span className="chip chip-shield">⛨ Ganhou um escudo</span>}
              {result.stolen && (
                <span className="chip">
                  {result.stolen.blocked
                    ? `⛨ ${game.teams[result.stolen.fromTeam].name} bloqueou o roubo com o escudo`
                    : `⇄ Roubou ${result.stolen.amount} pontos de ${game.teams[result.stolen.fromTeam].name}`}
                </span>
              )}
            </div>
            <p className="result-answer">
              Resposta certa: <strong>{LETTERS[q.correctIndex]}) {q.options[q.correctIndex]}</strong>
            </p>
            <p className="result-explain">{q.explanation}</p>
            {result.note && <p className="result-note">{result.note}</p>}
          </div>
        )}

        {revealed && game.pendingSteal && (
          <div className="steal-panel" role="group" aria-label="Escolher de quem roubar pontos">
            <strong>{EVENT_BY_TYPE.roubo.icon} Roubo: de qual equipe retirar até {game.pendingSteal.amount} pontos?</strong>
            <div className="steal-options">
              {stealTargets.map((t) => (
                <button key={t.id} type="button" className="btn btn-hot" onClick={() => dispatch({ type: 'STEAL', targetId: t.id })} disabled={t.score === 0 && !t.shield}>
                  {t.name} ({t.score} pts){t.shield ? ' ⛨' : ''}
                </button>
              ))}
              <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'STEAL', targetId: null })}>
                Não roubar
              </button>
            </div>
          </div>
        )}

        <footer className="q-controls">
          {!revealed ? (
            <>
              {timer.enabled && (
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => dispatch({ type: 'START_TIMER' })} disabled={timer.running || timer.expired}>
                  ⏱ {timer.running ? 'Cronômetro rodando' : timer.expired ? 'Tempo esgotado' : 'Iniciar cronômetro'}
                </button>
              )}
              <button type="button" className="btn btn-ghost btn-lg" aria-pressed={game.justificationShown} onClick={() => dispatch({ type: 'TOGGLE_JUSTIFICATION' })}>
                🗣 {game.justificationShown ? 'Ocultar justificativa' : 'Pedir justificativa'}
              </button>
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}>
                ⏸ Pausa pedagógica
              </button>
              <button type="button" className="btn btn-primary btn-lg btn-grow" onClick={() => dispatch({ type: 'CONFIRM' })} disabled={!canConfirm}>
                {game.selected === null && timer.expired ? 'Confirmar sem resposta ▶' : 'Confirmar resposta ▶'}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}>
                ⏸ Pausa pedagógica
              </button>
              <button type="button" className="btn btn-primary btn-lg btn-grow" onClick={() => dispatch({ type: 'NEXT_TURN' })} disabled={!!game.pendingSteal} data-autofocus>
                {game.cells.every((c) => c.opened) ? 'Ver resultado final ▶' : 'Próxima equipe ▶'}
              </button>
            </>
          )}
        </footer>
        <div className="sr-only" aria-live="polite">
          {timer.enabled && timer.running && [10, 5, 3].includes(timer.remaining) ? `${timer.remaining} segundos` : ''}
          {timer.expired ? 'Tempo esgotado' : ''}
          {revealed && result ? (result.correct ? 'Resposta correta' : 'Resposta incorreta') : ''}
        </div>
      </div>
      {game.paused && <PauseOverlay onResume={() => dispatch({ type: 'TOGGLE_PAUSE' })} />}
    </div>
  )
}
