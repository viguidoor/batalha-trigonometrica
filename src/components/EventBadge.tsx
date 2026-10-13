import { EVENT_BY_TYPE } from '../data/events'
import type { EventType } from '../types'

export function EventBadge({ event, large = false }: { event: EventType; large?: boolean }) {
  const info = EVENT_BY_TYPE[event]
  return (
    <span className={large ? `event-badge event-${event} event-large` : `event-badge event-${event}`}>
      <span className="event-icon" aria-hidden="true">
        {info.icon}
      </span>
      {info.name}
    </span>
  )
}
