import type { Level, Question } from '../types'

export function blankQuestion(level: Level = 1): Question {
  return {
    id: `c-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`,
    level,
    category: 'seno',
    concept: 'calculo',
    prompt: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    active: true,
    custom: true,
  }
}

export function duplicateQuestion(q: Question): Question {
  return {
    ...q,
    id: `c-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`,
    prompt: q.prompt,
    options: [...q.options],
    optionTags: q.optionTags ? [...q.optionTags] : undefined,
    figure: q.figure ? { ...q.figure, vertices: { ...q.figure.vertices }, sides: q.figure.sides ? { ...q.figure.sides } : undefined } : undefined,
    custom: true,
  }
}

/** Retorna a lista de problemas de uma questão (vazia = válida). */
export function validateQuestion(q: Question): string[] {
  const errors: string[] = []
  if (!q.prompt.trim()) errors.push('Escreva o enunciado.')
  if (q.options.length !== 4 || q.options.some((o) => !o.trim())) errors.push('Preencha as 4 alternativas.')
  const normalized = q.options.map((o) => o.trim().toLowerCase())
  if (new Set(normalized).size !== normalized.length) errors.push('As alternativas devem ser diferentes entre si.')
  if (q.correctIndex < 0 || q.correctIndex > 3) errors.push('Escolha a alternativa correta.')
  if (!q.explanation.trim()) errors.push('Escreva uma explicação curta.')
  if (q.timeSeconds !== undefined && (q.timeSeconds < 5 || q.timeSeconds > 600)) errors.push('O tempo deve ficar entre 5 e 600 segundos.')
  if (q.points !== undefined && (q.points < 0 || q.points > 5000)) errors.push('A pontuação deve ficar entre 0 e 5000.')
  return errors
}

export function upsertQuestion(list: Question[], q: Question): Question[] {
  return list.some((x) => x.id === q.id) ? list.map((x) => (x.id === q.id ? q : x)) : [...list, q]
}

export function removeQuestion(list: Question[], id: string): Question[] {
  return list.filter((q) => q.id !== id)
}

export function toggleQuestion(list: Question[], id: string): Question[] {
  return list.map((q) => (q.id === id ? { ...q, active: !q.active } : q))
}

export function countActiveByLevel(list: Question[]): Record<Level, number> {
  const out: Record<Level, number> = { 1: 0, 2: 0, 3: 0 }
  for (const q of list) if (q.active) out[q.level]++
  return out
}
