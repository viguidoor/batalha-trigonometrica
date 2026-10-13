import { useEffect, useRef } from 'react'
import type { GameState } from '../types'
import { playSound } from '../utils/audio'

/** Toca os efeitos conforme a fase da partida muda. Só age se o som estiver ligado. */
export function useSoundEffects(game: GameState | null, enabled: boolean) {
  const prev = useRef<{ phase: string | null; id: string | null }>({ phase: null, id: null })
  useEffect(() => {
    if (!game) return
    const before = prev.current
    prev.current = { phase: game.phase, id: game.id }
    if (!enabled || before.id !== game.id || before.phase === game.phase) return
    if (game.phase === 'reveal') playSound('open')
    if (game.phase === 'result' && game.result) {
      playSound(game.result.correct ? 'correct' : 'wrong')
      if (game.result.gained > 0) setTimeout(() => playSound('points'), 450)
    }
    if (game.phase === 'finished') playSound('finish')
  }, [game, enabled])
}
