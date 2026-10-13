export type SoundName = 'open' | 'correct' | 'wrong' | 'points' | 'finish'

type Note = { f: number; d: number; t?: number; type?: OscillatorType; g?: number }

const SOUNDS: Record<SoundName, Note[]> = {
  open: [{ f: 520, d: 0.08, type: 'triangle' }, { f: 780, d: 0.12, t: 0.07, type: 'triangle' }],
  correct: [{ f: 523, d: 0.12 }, { f: 659, d: 0.12, t: 0.1 }, { f: 784, d: 0.22, t: 0.2 }],
  wrong: [{ f: 220, d: 0.2, type: 'sawtooth', g: 0.12 }, { f: 165, d: 0.3, t: 0.17, type: 'sawtooth', g: 0.12 }],
  points: [{ f: 988, d: 0.07, type: 'square', g: 0.08 }, { f: 1319, d: 0.12, t: 0.07, type: 'square', g: 0.08 }],
  finish: [
    { f: 523, d: 0.15 }, { f: 659, d: 0.15, t: 0.15 }, { f: 784, d: 0.15, t: 0.3 }, { f: 1047, d: 0.4, t: 0.45 },
  ],
}

let ctx: AudioContext | null = null

/** Efeitos gerados na hora pela Web Audio API (sem arquivos, sem direitos autorais). */
export function playSound(name: SoundName) {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    ctx ??= new Ctor()
    if (ctx.state === 'suspended') void ctx.resume()
    const start = ctx.currentTime
    for (const n of SOUNDS[name]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const t0 = start + (n.t ?? 0)
      osc.type = n.type ?? 'sine'
      osc.frequency.value = n.f
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.exponentialRampToValueAtTime(n.g ?? 0.18, t0 + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + n.d)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0)
      osc.stop(t0 + n.d + 0.02)
    }
  } catch {
    /* áudio indisponível: o jogo segue sem som */
  }
}
