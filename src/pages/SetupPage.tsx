import { useState } from 'react'
import { ALL_EVENT_TYPES, EVENTS } from '../data/events'
import { DEFAULT_TEAM_NAMES, TIMER_OPTIONS } from '../data/teamNames'
import type { Page } from '../App'
import type { EventType, GameConfig, Question } from '../types'
import { countActiveByLevel } from '../utils/questionBank'
import { loadSettings, saveSettings } from '../utils/storage'

interface Props {
  questions: Question[]
  onNavigate: (page: Page) => void
  onStart: (config: GameConfig) => void
}

export function SetupPage({ questions, onNavigate, onStart }: Props) {
  const [saved] = useState(loadSettings)
  const [count, setCount] = useState(saved.lastTeamCount && saved.lastTeamCount >= 2 && saved.lastTeamCount <= 6 ? saved.lastTeamCount : 3)
  const [names, setNames] = useState<string[]>(() => DEFAULT_TEAM_NAMES.map((n, i) => saved.teamNames?.[i] || n))
  const [timer, setTimer] = useState<number | null>(saved.lastTimer === undefined ? 30 : saved.lastTimer)
  const [events, setEvents] = useState<EventType[]>(() => (saved.lastEvents ? (saved.lastEvents as EventType[]) : ALL_EVENT_TYPES))

  const byLevel = countActiveByLevel(questions)
  const totalActive = byLevel[1] + byLevel[2] + byLevel[3]
  const canStart = totalActive > 0

  const toggleEvent = (t: EventType) => setEvents((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))
  const masterOn = events.length > 0

  const start = () => {
    const teamNames = names.slice(0, count).map((n, i) => n.trim() || DEFAULT_TEAM_NAMES[i])
    saveSettings({ lastTeamCount: count, lastTimer: timer, lastEvents: events, teamNames: names.map((n, i) => n.trim() || DEFAULT_TEAM_NAMES[i]) })
    onStart({ teamNames, timerSeconds: timer, events })
  }

  return (
    <main className="page setup" id="main">
      <header className="page-head">
        <h1>Configurar a partida</h1>
        <button type="button" className="btn btn-ghost" onClick={() => onNavigate('home')}>
          ← Início
        </button>
      </header>

      <div className="setup-grid">
        <section className="panel" aria-labelledby="s-teams">
          <h2 id="s-teams">1. Equipes</h2>
          <fieldset className="seg">
            <legend>Quantidade de equipes</legend>
            {[2, 3, 4, 5, 6].map((n) => (
              <label key={n} className={count === n ? 'seg-item is-on' : 'seg-item'}>
                <input type="radio" name="teams" checked={count === n} onChange={() => setCount(n)} />
                {n}
              </label>
            ))}
          </fieldset>
          <div className="name-list">
            {Array.from({ length: count }, (_, i) => (
              <label key={i} className="field">
                <span>Nome da equipe {i + 1}</span>
                <input
                  type="text"
                  value={names[i]}
                  maxLength={24}
                  onChange={(e) => setNames((cur) => cur.map((n, j) => (j === i ? e.target.value : n)))}
                />
              </label>
            ))}
          </div>
          <p className="muted">Use nomes de equipes, não de estudantes: o relatório não coleta dados pessoais.</p>
        </section>

        <section className="panel" aria-labelledby="s-time">
          <h2 id="s-time">2. Tempo por questão</h2>
          <fieldset className="seg">
            <legend>Cronômetro</legend>
            {TIMER_OPTIONS.map((s) => (
              <label key={s} className={timer === s ? 'seg-item is-on' : 'seg-item'}>
                <input type="radio" name="timer" checked={timer === s} onChange={() => setTimer(s)} />
                {s} s
              </label>
            ))}
            <label className={timer === null ? 'seg-item is-on' : 'seg-item'}>
              <input type="radio" name="timer" checked={timer === null} onChange={() => setTimer(null)} />
              Desligado
            </label>
          </fieldset>
          <p className="muted">O cronômetro só começa quando você clicar em “Iniciar cronômetro”, depois da discussão da equipe.</p>

          <h2 id="s-events">3. Eventos especiais</h2>
          <label className="check master">
            <input type="checkbox" checked={masterOn} onChange={() => setEvents(masterOn ? [] : ALL_EVENT_TYPES)} />
            <span>Usar eventos especiais no tabuleiro</span>
          </label>
          <ul className="event-config">
            {EVENTS.map((e) => (
              <li key={e.type}>
                <label className="check">
                  <input type="checkbox" checked={events.includes(e.type)} onChange={() => toggleEvent(e.type)} />
                  <span>
                    <strong>
                      <span aria-hidden="true">{e.icon}</span> {e.name}
                    </strong>
                    <small>{e.description}</small>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="setup-foot">
        <p className={canStart ? 'muted' : 'warn'}>
          {canStart
            ? `Questões ativas: ${byLevel[1]} fáceis · ${byLevel[2]} médias · ${byLevel[3]} problemas${totalActive < 20 ? ' — com menos de 20, algumas se repetirão.' : '.'}`
            : 'Não há questões ativas. Ative ao menos uma no Banco de questões.'}
        </p>
        <button type="button" className="btn btn-primary btn-xl" onClick={start} disabled={!canStart}>
          Começar a batalha ▶
        </button>
      </footer>
    </main>
  )
}
