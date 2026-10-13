import { EVENT_BY_TYPE } from '../data/events'
import { TEAM_COLORS } from '../data/teamNames'
import type { Cell, Team } from '../types'

interface Props {
  cells: Cell[]
  teams: Team[]
  disabled: boolean
  onPick: (index: number) => void
}

function describe(cell: Cell, teams: Team[]): string {
  const n = cell.index + 1
  if (!cell.opened) return `Casa ${n}, fechada`
  const who = cell.openedBy !== null ? `, aberta por ${teams[cell.openedBy]?.name}` : ''
  const ev = cell.event ? `, evento ${EVENT_BY_TYPE[cell.event].name}` : ''
  return `Casa ${n}, aberta: ${cell.points} pontos${ev}${who}`
}

/** Tabuleiro 4×5. O valor e o evento ficam escondidos até a casa ser aberta. */
export function Board({ cells, teams, disabled, onPick }: Props) {
  return (
    <div className="board" role="group" aria-label="Tabuleiro com 20 casas">
      {cells.map((cell) => {
        const color = cell.openedBy !== null ? TEAM_COLORS[cell.openedBy % TEAM_COLORS.length] : undefined
        return (
          <button
            key={cell.index}
            type="button"
            className={cell.opened ? 'board-cell is-open' : 'board-cell'}
            disabled={cell.opened || disabled}
            onClick={() => onPick(cell.index)}
            aria-label={describe(cell, teams)}
            style={color ? { ['--team' as string]: color } : undefined}
          >
            {cell.opened ? (
              <>
                <span className="cell-points">{cell.points}</span>
                {cell.event && (
                  <span className="cell-event" aria-hidden="true">
                    {EVENT_BY_TYPE[cell.event].icon}
                  </span>
                )}
                {cell.openedBy !== null && (
                  <span className="cell-owner" aria-hidden="true">
                    E{cell.openedBy + 1}
                  </span>
                )}
              </>
            ) : (
              <>
                <svg className="cell-glyph" viewBox="0 0 48 40" aria-hidden="true">
                  <polygon points="4,36 44,36 4,6" />
                  <path d="M4 26 h10 v10" />
                </svg>
                <span className="cell-number">{cell.index + 1}</span>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
