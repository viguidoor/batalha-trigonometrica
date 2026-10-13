import { useRef } from 'react'
import { EVENT_BY_TYPE } from '../data/events'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { Cell } from '../types'
import { pointsMultiplier } from '../utils/scoring'
import { EventBadge } from './EventBadge'

interface Props {
  cell: Cell
  basePoints: number
  teamName: string
  onContinue: (risk?: boolean) => void
}

/** Casa revelada: mostra valor e evento antes da questão. */
export function RevealOverlay({ cell, basePoints, teamName, onContinue }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref)
  const event = cell.event
  const info = event ? EVENT_BY_TYPE[event] : null
  return (
    <div className="overlay reveal-overlay">
      <div ref={ref} className="reveal-card" role="dialog" aria-modal="true" aria-labelledby="reveal-title">
        <p className="eyebrow">{teamName} abriu a casa {cell.index + 1}</p>
        <h2 id="reveal-title" className="reveal-points">
          <span className="pop-in">{basePoints}</span> <small>pontos</small>
        </h2>
        {info && event && (
          <div className="reveal-event">
            <EventBadge event={event} large />
            <p>{info.description}</p>
            {event === 'dobro' && <p className="reveal-calc">Acertando, vale <strong>{basePoints * pointsMultiplier(event, false)}</strong> pontos.</p>}
            {event === 'relampago' && <p className="reveal-calc">Questão mais simples: {cell.points} + 200 pontos extras.</p>}
            {event === 'roubo' && <p className="reveal-calc">Acertando, a equipe escolhe de quem roubar até {basePoints} pontos.</p>}
            {event === 'tudo_ou_nada' && (
              <p className="reveal-calc">
                Arriscando: acerta e ganha <strong>{basePoints * 2}</strong>; erra e perde <strong>{basePoints}</strong> (o escudo protege).
              </p>
            )}
          </div>
        )}
        <div className="reveal-actions">
          {event === 'tudo_ou_nada' ? (
            <>
              <button type="button" className="btn btn-hot btn-xl" onClick={() => onContinue(true)} data-autofocus>
                ⚖ Arriscar (dobra ou perde)
              </button>
              <button type="button" className="btn btn-ghost btn-xl" onClick={() => onContinue(false)}>
                Jogar sem risco
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary btn-xl" onClick={() => onContinue()} data-autofocus>
              Ver a questão ▶
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
