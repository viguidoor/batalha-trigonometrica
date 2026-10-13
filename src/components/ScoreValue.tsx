import { useEffect, useRef, useState } from 'react'

/** Mostra o placar e, quando ele sobe, um "+N" discreto que flutua. */
export function ScoreValue({ value }: { value: number }) {
  const prev = useRef(value)
  const [delta, setDelta] = useState<{ n: number; key: number } | null>(null)

  useEffect(() => {
    const diff = value - prev.current
    prev.current = value
    if (diff === 0) return
    setDelta({ n: diff, key: Date.now() })
    const id = window.setTimeout(() => setDelta(null), 1800)
    return () => window.clearTimeout(id)
  }, [value])

  return (
    <span className={delta && delta.n > 0 ? 'score-value score-up' : 'score-value'} key={delta?.key ?? 'static'}>
      {value}
      {delta && (
        <span className={delta.n > 0 ? 'score-delta up' : 'score-delta down'} aria-hidden="true">
          {delta.n > 0 ? '+' : '−'}
          {Math.abs(delta.n)}
        </span>
      )}
    </span>
  )
}
