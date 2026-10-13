import type { Page } from '../App'
import { CATEGORY_LABEL } from '../data/labels'
import type { GameState } from '../types'
import { buildReport, downloadText, toCSV, toJSONReport, type Tally } from '../utils/report'

function Bar({ t }: { t: Tally }) {
  return (
    <span className="bar" aria-hidden="true">
      <span className="bar-ok" style={{ width: `${t.total ? (t.correct / t.total) * 100 : 0}%` }} />
      <span className="bar-bad" style={{ width: `${t.total ? (t.wrong / t.total) * 100 : 0}%` }} />
    </span>
  )
}

export function ReportPage({ game, onNavigate }: { game: GameState; onNavigate: (page: Page) => void }) {
  const r = buildReport(game)
  const date = new Date(game.startedAt)
  const stamp = date.toISOString().slice(0, 10)
  return (
    <main className="page report" id="main">
      <header className="page-head no-print">
        <div>
          <p className="eyebrow">Avaliação formativa</p>
          <h1>Resumo da aprendizagem</h1>
        </div>
        <div className="head-actions">
          <button type="button" className="btn btn-ghost" onClick={() => onNavigate(game.phase === 'finished' ? 'result' : 'game')}>
            ← Voltar
          </button>
        </div>
      </header>
      <h1 className="print-only">Batalha Trigonométrica — Resumo da aprendizagem ({date.toLocaleDateString('pt-BR')})</h1>

      <div className="report-grid">
        <section className="panel" aria-labelledby="r-cat">
          <h2 id="r-cat">Questões por razão trigonométrica</h2>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Categoria</th>
                <th scope="col">Questões</th>
                <th scope="col">Acertos</th>
                <th scope="col">Erros</th>
                <th scope="col">Aproveitamento</th>
              </tr>
            </thead>
            <tbody>
              {r.byCategory.map((c) => (
                <tr key={c.category}>
                  <th scope="row">{c.label}</th>
                  <td>{c.total}</td>
                  <td>{c.correct}</td>
                  <td>{c.wrong}</td>
                  <td className="pct-cell">
                    <Bar t={c} />
                    {c.total ? `${c.pct}%` : '—'}
                  </td>
                </tr>
              ))}
              <tr className="total-row">
                <th scope="row">Total</th>
                <td>{r.totals.total}</td>
                <td>{r.totals.correct}</td>
                <td>{r.totals.wrong}</td>
                <td>{r.totals.total ? `${r.totals.pct}%` : '—'}</td>
              </tr>
            </tbody>
          </table>
          <p className="muted">Pedidos de justificativa durante a partida: {r.justificationsRequested}.</p>
        </section>

        <section className="panel" aria-labelledby="r-rec">
          <h2 id="r-rec">Conceitos que podem precisar de retomada</h2>
          <ul className="advice">
            {r.recommendations.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="panel" aria-labelledby="r-con">
          <h2 id="r-con">Desempenho por habilidade</h2>
          {r.byConcept.length === 0 ? (
            <p className="muted">Nenhuma questão respondida ainda.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Habilidade</th>
                  <th scope="col">Acertos</th>
                  <th scope="col">Erros</th>
                </tr>
              </thead>
              <tbody>
                {r.byConcept.map((c) => (
                  <tr key={c.concept}>
                    <th scope="row">{c.label}</th>
                    <td>{c.correct}</td>
                    <td>{c.wrong}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {r.errorTags.length > 0 && (
            <>
              <h3>Padrões nas alternativas escolhidas</h3>
              <ul className="advice">
                {r.errorTags.map((t) => (
                  <li key={t.tag}>
                    {t.label}: {t.count} {t.count === 1 ? 'ocorrência' : 'ocorrências'}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="panel" aria-labelledby="r-err">
          <h2 id="r-err">Questões que tiveram erros</h2>
          {r.wrongQuestions.length === 0 ? (
            <p className="muted">Nenhuma questão errada nesta partida.</p>
          ) : (
            <ol className="wrong-list">
              {r.wrongQuestions.map((w) => (
                <li key={w.questionId}>
                  <span>{w.prompt}</span>
                  <small>
                    {w.teamName} · {CATEGORY_LABEL[w.category]}
                  </small>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <footer className="page-actions no-print">
        <button type="button" className="btn btn-primary btn-lg" onClick={() => window.print()}>
          🖨 Imprimir relatório
        </button>
        <button type="button" className="btn btn-secondary btn-lg" onClick={() => downloadText(`batalha-trigonometrica-${stamp}.csv`, toCSV(game), 'text/csv')}>
          ⬇ Exportar CSV
        </button>
        <button type="button" className="btn btn-secondary btn-lg" onClick={() => downloadText(`batalha-trigonometrica-${stamp}.json`, toJSONReport(game), 'application/json')}>
          ⬇ Exportar JSON
        </button>
        <button type="button" className="btn btn-ghost btn-lg" onClick={() => onNavigate('home')}>
          Início
        </button>
      </footer>
    </main>
  )
}
