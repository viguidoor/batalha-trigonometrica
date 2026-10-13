import { useEffect, type Dispatch } from 'react'
import type { Page } from '../App'
import { Board } from '../components/Board'
import { Brand } from '../components/Logo'
import { QuestionOverlay } from '../components/QuestionOverlay'
import { RevealOverlay } from '../components/RevealOverlay'
import { Scoreboard } from '../components/Scoreboard'
import type { GameState } from '../types'
import { getActiveQuestion, type GameAction } from '../utils/engine'

interface Props {
  game: GameState
  dispatch: Dispatch<GameAction>
  onNavigate: (page: Page) => void
}

export function GamePage({ game, dispatch, onNavigate }: Props) {
  const team = game.teams[game.currentTeam]
  const opened = game.cells.filter((c) => c.opened).length
  const question = getActiveQuestion(game)
  const cell = game.activeCell !== null ? game.cells[game.activeCell] : null

  // Partida encerrada: segue para o resultado.
  useEffect(() => {
    if (game.phase === 'finished') onNavigate('result')
  }, [game.phase, onNavigate])

  return (
    <main className="page game" id="main">
      <header className="game-top">
        <Brand compact />
        <div className="turn-banner" aria-live="polite">
          <span className="eyebrow">Vez da equipe</span>
          <strong>{team.name}</strong>
          <span className="turn-hint">{game.phase === 'choose' ? 'Escolham uma casa do tabuleiro' : 'Em jogo…'}</span>
        </div>
        <div className="game-progress" aria-label={`${opened} de 20 casas abertas`}>
          <strong>{opened}</strong>/20 casas
        </div>
        <button type="button" className="btn btn-ghost tech-only" onClick={() => onNavigate('home')}>
          ☰ Menu
        </button>
      </header>

      <div className="game-main">
        <Board cells={game.cells} teams={game.teams} disabled={game.phase !== 'choose'} onPick={(index) => dispatch({ type: 'SELECT_CELL', index, rand: Math.random() })} />
        <Scoreboard teams={game.teams} currentTeam={game.currentTeam} />
      </div>

      {game.phase === 'reveal' && cell && <RevealOverlay cell={cell} basePoints={game.basePoints} teamName={team.name} onContinue={(risk) => dispatch({ type: 'CONTINUE_REVEAL', risk })} />}
      {(game.phase === 'question' || game.phase === 'result') && question && <QuestionOverlay game={game} question={question} dispatch={dispatch} />}
    </main>
  )
}
