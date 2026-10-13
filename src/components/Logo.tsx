/** Marca original: triângulo retângulo com arco de ângulo e raio de energia. */
export function LogoMark({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#2f6bff" />
        </linearGradient>
      </defs>
      <polygon points="6,56 58,56 6,10" fill="url(#lg1)" />
      <path d="M6 44 h12 v12" fill="none" stroke="#06122e" strokeWidth="3" />
      <path d="M44 56 a22 22 0 0 0 -4 -12" fill="none" stroke="#ffd23f" strokeWidth="3.5" strokeLinecap="round" />
      <polygon points="48,6 38,28 46,28 40,44 58,20 49,20" fill="#ff8a1f" stroke="#06122e" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'brand brand-compact' : 'brand'}>
      <LogoMark size={compact ? 44 : 96} />
      <div>
        <h1 className="brand-title">
          Batalha <span>Trigonométrica</span>
        </h1>
        {!compact && <p className="brand-sub">Seno, Cosseno e Tangente</p>}
      </div>
    </div>
  )
}
