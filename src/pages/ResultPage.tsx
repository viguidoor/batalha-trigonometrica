import type { Page } from '../App'
import { TEAM_COLORS } from '../data/teamNames'
import type { GameState } from '../types'
import { buildReport } from '../utils/report'

const MEDAL = ['🥇', '🥈', '🥉']

export function ResultPage({ game, onNavigate }: { game: GameState; onNavigate: (page: Page) => void }) {
  const report = buildReport(game)
  const top = report.teams.filter((t) => t.rank === 1)
  const ordered = report.teams
  return (
    <main className="page result" id="main">
      <header className="page-head">
        <div>
          <p className="eyebrow">Fim da batalha</p>
          <h1>Resultado final</h1>
        </div>
        <p className="champ" aria-live="polite">
          {top.length > 1 ? `Empate no 1º lugar: ${top.map((t) => t.name).join(' e ')}` : `${top[0]?.name} venceu!`}
        </p>
      </header>

      <ol className="podium">
        {ordered.map((t) => (
          <li key={t.id} className={`podium-card rank-${Math.min(t.rank, 4)}`} style={{ ['--team' as string]: TEAM_COLORS[t.id % TEAM_COLORS.length] }}>
            <span className="podium-rank">
              <span aria-hidden="true">{MEDAL[t.rank - 1] ?? ''}</span> {t.rank}º lugar
            </span>
            <strong className="podium-name">{t.name}</strong>
            <span className="podium-score">
              {t.score} <small>pontos</small>
            </span>
            <dl className="podium-stats">
              <div>
                <dt>Respondidas</dt>
                <dd>{t.total}</dd>
              </div>
              <div>
                <dt>Acertos</dt>
                <dd>{t.correct}</dd>
              </div>
              <div>
                <dt>Erros</dt>
                <dd>{t.wrong}</dd>
              </div>
              <div>
                <dt>Aproveitamento</dt>
                <dd>{t.pct}%</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>

      <p className="muted result-total">
        Turma: {report.totals.total} questões respondidas · {report.totals.correct} acertos · {report.totals.wrong} erros · {report.totals.pct}% de aproveitamento
      </p>

      <footer className="page-actions">
        <button type="button" className="btn btn-primary btn-xl" onClick={() => onNavigate('report')} data-autofocus>
          Resumo da aprendizagem ▶
        </button>
        <button type="button" className="btn btn-secondary btn-xl" onClick={() => onNavigate('setup')}>
          Nova partida
        </button>
        <button type="button" className="btn btn-ghost btn-xl" onClick={() => onNavigate('home')}>
          Início
        </button>
      </footer>
    </main>
  )
}
