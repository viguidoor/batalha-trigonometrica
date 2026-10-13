import { useRef, useState } from 'react'
import { MEDIATION_QUESTIONS } from '../data/labels'
import { useFocusTrap } from '../hooks/useFocusTrap'

/**
 * Pausa pedagógica: o cronômetro e a questão ficam congelados (a questão permanece visível
 * à esquerda) enquanto o professor conduz perguntas de mediação.
 */
export function PauseOverlay({ onResume }: { onResume: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [focus, setFocus] = useState<number | null>(null)
  useFocusTrap(ref, true, onResume)
  return (
    <div className="overlay pause-overlay">
      <aside ref={ref} className="pause-panel" role="dialog" aria-modal="true" aria-labelledby="pause-title">
        <p className="eyebrow">⏸ Cronômetro pausado</p>
        <h2 id="pause-title">Pausa pedagógica</h2>
        <p className="pause-hint">Escolha uma pergunta para destacar e conduza a conversa. A questão não será alterada.</p>
        {focus !== null && (
          <p className="pause-focus" aria-live="polite">
            {MEDIATION_QUESTIONS[focus]}
          </p>
        )}
        <ul className="pause-list">
          {MEDIATION_QUESTIONS.map((q, i) => (
            <li key={q}>
              <button type="button" className={focus === i ? 'pause-q is-active' : 'pause-q'} aria-pressed={focus === i} onClick={() => setFocus(focus === i ? null : i)}>
                {q}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-primary btn-xl" onClick={onResume} data-autofocus>
          ▶ Voltar ao jogo
        </button>
        <p className="pause-esc">Atalho: tecla Esc</p>
      </aside>
    </div>
  )
}
