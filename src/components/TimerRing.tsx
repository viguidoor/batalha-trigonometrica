import type { TimerState } from '../types'

const R = 44
const C = 2 * Math.PI * R

/** Cronômetro circular. Tem texto ("Tempo esgotado", segundos) além da cor. */
export function TimerRing({ timer, paused, done = false }: { timer: TimerState; paused: boolean; done?: boolean }) {
  if (!timer.enabled) {
    return (
      <div className="timer timer-off" role="timer" aria-label="Cronômetro desligado">
        <span className="timer-label">Sem cronômetro</span>
      </div>
    )
  }
  const ratio = timer.total === 0 ? 0 : timer.remaining / timer.total
  const low = timer.remaining <= 5 && (timer.running || timer.expired)
  const state = done ? 'Respondida' : timer.expired ? 'Tempo esgotado' : paused ? 'Pausado' : timer.running ? 'Em contagem' : 'Aguardando'
  return (
    <div className={`timer${low ? ' is-low' : ''}${timer.expired ? ' is-expired' : ''}`} role="timer" aria-label={`Cronômetro: ${timer.remaining} segundos. ${state}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="timer-track" cx="50" cy="50" r={R} />
        <circle className="timer-bar" cx="50" cy="50" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - ratio)} transform="rotate(-90 50 50)" />
      </svg>
      <span className="timer-number" aria-hidden="true">
        {timer.remaining}
      </span>
      <span className="timer-label" aria-hidden="true">
        {state}
      </span>
    </div>
  )
}
