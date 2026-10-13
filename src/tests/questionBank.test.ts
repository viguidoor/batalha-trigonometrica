import { describe, expect, it } from 'vitest'
import { getDefaultQuestions } from '../data/defaultQuestions'
import type { Question } from '../types'
import { blankQuestion, countActiveByLevel, duplicateQuestion, removeQuestion, toggleQuestion, upsertQuestion, validateQuestion } from '../utils/questionBank'

const questions = getDefaultQuestions()

// Tabela fornecida aos alunos (uma casa decimal)
const TABLE: Record<string, string> = {
  'sen 30°': '0,5', 'cos 30°': '0,9', 'tg 30°': '0,6',
  'sen 45°': '0,7', 'cos 45°': '0,7', 'tg 45°': '1,0',
  'sen 60°': '0,9', 'cos 60°': '0,5', 'tg 60°': '1,7',
}

describe('banco de questões original', () => {
  it('tem 30 questões: 10 por nível', () => {
    expect(questions).toHaveLength(30)
    for (const level of [1, 2, 3]) expect(questions.filter((q) => q.level === level)).toHaveLength(10)
  })

  it('ids e enunciados são únicos', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(30)
    expect(new Set(questions.map((q) => q.prompt)).size).toBe(30)
  })

  it('toda questão tem 4 alternativas distintas e uma única correta válida', () => {
    for (const q of questions) {
      expect(q.options, q.id).toHaveLength(4)
      expect(new Set(q.options).size, q.id).toBe(4)
      expect(q.correctIndex, q.id).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex, q.id).toBeLessThan(4)
      expect(q.optionTags?.[q.correctIndex] ?? null, q.id).toBeNull()
      expect(q.explanation.length, q.id).toBeGreaterThan(10)
      expect(validateQuestion(q), q.id).toEqual([])
    }
  })

  it('a resposta correta aparece em posições variadas', () => {
    const counts = [0, 1, 2, 3].map((p) => questions.filter((q) => q.correctIndex === p).length)
    for (const c of counts) expect(c).toBeGreaterThanOrEqual(5)
    for (const level of [1, 2, 3]) {
      const positions = new Set(questions.filter((q) => q.level === level).map((q) => q.correctIndex))
      expect(positions.size, `nível ${level}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('distratores carregam o tipo de erro comum que representam', () => {
    for (const q of questions) {
      const tagged = (q.optionTags ?? []).filter(Boolean).length
      expect(tagged, q.id).toBeGreaterThanOrEqual(2)
    }
  })

  it('valores trigonométricos citados batem com a tabela de uma casa decimal', () => {
    const re = /(sen|cos|tg) (\d+)° = (\d+,\d)/g
    let found = 0
    for (const q of questions) {
      for (const m of q.prompt.matchAll(re)) {
        found++
        expect(m[3], `${q.id}: ${m[1]} ${m[2]}°`).toBe(TABLE[`${m[1]} ${m[2]}°`])
      }
    }
    expect(found).toBeGreaterThanOrEqual(18)
  })

  it('níveis 2 e 3 sempre fornecem a razão necessária no enunciado', () => {
    for (const q of questions.filter((x) => x.level >= 2)) expect(q.prompt, q.id).toMatch(/(sen|cos|tg) \d+° = \d+,\d/)
  })

  it('não entrega os nomes dos lados em questões de identificação', () => {
    const forbidden = /hipotenusa|cateto oposto|cateto adjacente/i
    for (const q of questions.filter((x) => x.category === 'lados')) expect(q.prompt, q.id).not.toMatch(forbidden)
    for (const q of questions.filter((x) => x.level === 1)) expect(q.prompt, q.id).not.toMatch(forbidden)
  })

  it('evita conteúdo fora do escopo', () => {
    const out = /arco\s?(seno|cosseno|tangente)|lei dos (senos|cossenos)|círculo trigonométrico|identidade/i
    for (const q of questions) expect(`${q.prompt} ${q.options.join(' ')} ${q.explanation}`, q.id).not.toMatch(out)
  })

  it('figuras: questões de identificação e de cálculo têm triângulo em SVG', () => {
    for (const q of questions.filter((x) => x.level <= 2)) expect(q.figure?.kind, q.id).toBe('triangle')
  })
})

describe('operações do editor', () => {
  const valid = (): Question => ({ ...blankQuestion(1), prompt: 'Enunciado', options: ['a', 'b', 'c', 'd'], correctIndex: 2, explanation: 'Porque sim.' })

  it('validação aponta campos faltando', () => {
    expect(validateQuestion(blankQuestion()).length).toBeGreaterThanOrEqual(3)
    expect(validateQuestion(valid())).toEqual([])
    expect(validateQuestion({ ...valid(), options: ['a', 'a', 'c', 'd'] })).toContain('As alternativas devem ser diferentes entre si.')
    expect(validateQuestion({ ...valid(), timeSeconds: 1 })).toHaveLength(1)
    expect(validateQuestion({ ...valid(), points: -5 })).toHaveLength(1)
  })

  it('criar e editar (upsert)', () => {
    const q = valid()
    const added = upsertQuestion(questions, q)
    expect(added).toHaveLength(31)
    const edited = upsertQuestion(added, { ...q, prompt: 'Outro' })
    expect(edited).toHaveLength(31)
    expect(edited.find((x) => x.id === q.id)?.prompt).toBe('Outro')
  })

  it('duplicar gera novo id e cópia independente', () => {
    const copy = duplicateQuestion(questions[0])
    expect(copy.id).not.toBe(questions[0].id)
    expect(copy.custom).toBe(true)
    copy.options[0] = 'alterada'
    expect(questions[0].options[0]).not.toBe('alterada')
    expect(copy.figure).not.toBe(questions[0].figure)
  })

  it('excluir e ativar/desativar', () => {
    expect(removeQuestion(questions, questions[0].id)).toHaveLength(29)
    const off = toggleQuestion(questions, questions[0].id)
    expect(off[0].active).toBe(false)
    expect(countActiveByLevel(off)).toEqual({ 1: 9, 2: 10, 3: 10 })
    expect(toggleQuestion(off, questions[0].id)[0].active).toBe(true)
  })
})
