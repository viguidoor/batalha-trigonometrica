import { TEAM_COLORS } from '../data/teamNames'
import type { Team } from '../types'
import { ScoreValue } from './ScoreValue'

interface Props {
  teams: Team[]
  currentTeam: number
  compact?: boolean
}

/** Placar sempre visível. A equipe da vez é marcada por texto, borda e símbolo (não só por cor). */
export function Scoreboard({ teams, currentTeam, compact = false }: Props) {
  return (
    <section className={compact ? 'scoreboard scoreboard-compact' : 'scoreboard'} aria-label="Placar">
      {!compact && <h2 className="scoreboard-title">Placar</h2>}
      <ol className="score-list">
        {teams.map((t) => {
          const turn = t.id === currentTeam
          return (
            <li
              key={t.id}
              className={turn ? 'score-card is-turn' : 'score-card'}
              style={{ ['--team' as string]: TEAM_COLORS[t.id % TEAM_COLORS.length] }}
              aria-current={turn ? 'true' : undefined}
            >
              <span className="team-badge" aria-hidden="true">
                {t.id + 1}
              </span>
              <span className="score-name">
                {t.name}
                {turn && <span className="turn-tag">▶ Vez desta equipe</span>}
              </span>
              {t.shield && (
                <span className="power-chip" title="Escudo ativo: bloqueia a próxima penalidade">
                  <span aria-hidden="true">⛨</span> Escudo
                </span>
              )}
              <span className="score-points">
                <ScoreValue value={t.score} />
                <span className="sr-only"> pontos</span>
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
