const FORMULAS = [
  { t: 'sen θ = cat. oposto ÷ hipotenusa', x: 4, y: 12, r: -6 },
  { t: 'cos θ = cat. adjacente ÷ hipotenusa', x: 58, y: 8, r: 4 },
  { t: 'tg θ = cat. oposto ÷ cat. adjacente', x: 30, y: 88, r: -3 },
  { t: 'a² = b² + c²', x: 72, y: 78, r: 7 },
  { t: 'tg θ = sen θ ÷ cos θ', x: 6, y: 62, r: 5 },
  { t: '30° · 45° · 60°', x: 62, y: 40, r: -5 },
]

/** Fundo decorativo: grade, triângulos e fórmulas discretas. Ignorado por leitores de tela. */
export function BackgroundDecor() {
  return (
    <div className="bg-decor" aria-hidden="true">
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-a" />
      <div className="bg-glow bg-glow-b" />
      <svg className="bg-tri bg-tri-a" viewBox="0 0 200 140">
        <polygon points="10,130 190,130 10,20" />
        <path d="M10 108 h22 v22" />
        <path d="M150 130 a40 40 0 0 0 -8 -24" />
      </svg>
      <svg className="bg-tri bg-tri-b" viewBox="0 0 200 140">
        <polygon points="10,130 190,130 190,40" />
        <path d="M190 108 h-22 v22" />
        <path d="M50 130 a40 40 0 0 1 8 -8" />
      </svg>
      {FORMULAS.map((f) => (
        <span key={f.t} className="bg-formula" style={{ left: `${f.x}%`, top: `${f.y}%`, transform: `rotate(${f.r}deg)` }}>
          {f.t}
        </span>
      ))}
    </div>
  )
}
