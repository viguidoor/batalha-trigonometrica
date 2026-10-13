import { Brand } from '../components/Logo'
import type { GameState } from '../types'
import type { Page } from '../App'

interface Props {
  saved: GameState | null
  onNavigate: (page: Page) => void
  onContinue: () => void
}

export function HomePage({ saved, onNavigate, onContinue }: Props) {
  const opened = saved ? saved.cells.filter((c) => c.opened).length : 0
  return (
    <main className="page home" id="main">
      <Brand />
      <nav className="home-menu" aria-label="Menu principal">
        <button type="button" className="btn btn-primary btn-xl" onClick={() => onNavigate('setup')} data-autofocus>
          ▶ Nova partida
        </button>
        <button type="button" className="btn btn-secondary btn-xl" onClick={onContinue} disabled={!saved}>
          ↻ Continuar partida
          {saved && <small>{saved.phase === 'finished' ? 'partida encerrada — ver resultado' : `${opened} de 20 casas abertas`}</small>}
        </button>
        <button type="button" className="btn btn-ghost btn-xl" onClick={() => onNavigate('howto')}>
          ? Como jogar
        </button>
        <button type="button" className="btn btn-ghost btn-xl" onClick={() => onNavigate('bank')}>
          ☰ Banco de questões
        </button>
      </nav>
      <p className="home-foot">Recurso de avaliação formativa para a 1ª série do Ensino Médio · Razões trigonométricas: resolução de problemas</p>
    </main>
  )
}
