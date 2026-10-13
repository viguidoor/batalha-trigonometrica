import { useCallback, useEffect, useReducer } from 'react'
import type { GameState } from '../types'
import { gameReducer, type GameAction } from '../utils/engine'
import { clearGame, saveGame } from '../utils/storage'

type RootAction = GameAction | { type: 'LOAD'; game: GameState } | { type: 'CLEAR' }

function rootReducer(state: GameState | null, action: RootAction): GameState | null {
  if (action.type === 'LOAD') {
    const g = action.game
    // Ao retomar, o cronômetro e a pausa voltam parados: o professor decide quando seguir.
    return { ...g, paused: false, timer: { ...g.timer, running: false } }
  }
  if (action.type === 'CLEAR') return null
  return state ? gameReducer(state, action) : state
}

/** Estado da partida + persistência automática em localStorage + relógio do cronômetro. */
export function useGame() {
  const [game, dispatch] = useReducer(rootReducer, null)

  useEffect(() => {
    if (game) saveGame(game)
  }, [game])

  const running = !!game && game.timer.running && !game.paused && game.phase === 'question'
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => window.clearInterval(id)
  }, [running])

  const load = useCallback((g: GameState) => dispatch({ type: 'LOAD', game: g }), [])
  const discard = useCallback(() => {
    clearGame()
    dispatch({ type: 'CLEAR' })
  }, [])

  return { game, dispatch, load, discard }
}
