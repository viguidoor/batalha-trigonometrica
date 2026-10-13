import { describe, expect, it } from 'vitest'
import { buildReport, rankTeams, toCSV, toJSONReport } from '../utils/report'
import { getActiveQuestion } from '../utils/engine'
import type { GameState } from '../types'
import { makeGame, openQuestion, playTurn, run, answer } from './helpers'

function finishedGame(pattern: (turn: number) => boolean): GameState {
  let g = makeGame()
  for (let i = 0; i < 20; i++) g = playTurn(g, i, pattern(i))
  return g
}

describe('relatório pedagógico', () => {
  it('conta questões, acertos e erros por categoria', () => {
    const g = finishedGame((t) => t % 2 === 0)
    const r = buildReport(g)
    expect(r.totals).toMatchObject({ total: 20, correct: 10, wrong: 10, pct: 50 })
    const byCat = Object.fromEntries(r.byCategory.map((c) => [c.category, c]))
    const sum = r.byCategory.reduce((n, c) => n + c.total, 0)
    expect(sum).toBe(20)
    for (const c of r.byCategory) expect(c.correct + c.wrong).toBe(c.total)
    expect(byCat.seno.total + byCat.cosseno.total + byCat.tangente.total + byCat.lados.total).toBe(20)
  })

  it('resume por equipe com aproveitamento e posição', () => {
    const g = finishedGame((t) => t % 3 !== 1)
    const r = buildReport(g)
    expect(r.teams).toHaveLength(3)
    expect(r.teams.reduce((n, t) => n + t.total, 0)).toBe(20)
    expect(r.teams[0].rank).toBe(1)
    for (let i = 1; i < r.teams.length; i++) expect(r.teams[i - 1].score).toBeGreaterThanOrEqual(r.teams[i].score)
  })

  it('lista as questões erradas e os padrões de erro', () => {
    const g = finishedGame(() => false)
    const r = buildReport(g)
    expect(r.wrongQuestions).toHaveLength(20)
    expect(r.errorTags.length).toBeGreaterThan(0)
    expect(r.errorTags.reduce((n, t) => n + t.count, 0)).toBeLessThanOrEqual(20)
  })

  it('usa linguagem de indício e nunca de diagnóstico absoluto', () => {
    const r = buildReport(finishedGame(() => false))
    const text = r.recommendations.join(' ').toLowerCase()
    expect(text).toMatch(/indício|possível|recomenda-se|sugere-se/)
    expect(text).not.toMatch(/diagnóstico|incapaz|não sabe|não sabem|sempre errou/)
    expect(r.recommendations.at(-1)).toMatch(/não substituem/)
  })

  it('com todos os acertos, não sugere retomada', () => {
    const r = buildReport(finishedGame(() => true))
    expect(r.recommendations.join(' ')).toMatch(/Não foram observados indícios/)
  })

  it('partida sem respostas não quebra', () => {
    const r = buildReport(makeGame())
    expect(r.totals.total).toBe(0)
    expect(r.byCategory.every((c) => c.total === 0)).toBe(true)
  })

  it('empates dividem a mesma posição', () => {
    const ranks = rankTeams([
      { id: 0, name: 'A', score: 300, shield: false },
      { id: 1, name: 'B', score: 300, shield: false },
      { id: 2, name: 'C', score: 100, shield: false },
    ])
    expect(ranks.map((r) => r.rank)).toEqual([1, 1, 3])
  })

  it('registra o pedido de justificativa', () => {
    let g = openQuestion(makeGame(), 0)
    g = answer(run(g, { type: 'TOGGLE_JUSTIFICATION' }), true)
    expect(buildReport(g).justificationsRequested).toBe(1)
  })
})

describe('exportação', () => {
  it('CSV tem cabeçalho, uma linha por resposta e escapa vírgulas e aspas', () => {
    const g = finishedGame((t) => t % 2 === 0)
    const lines = toCSV(g).split('\n')
    expect(lines[0]).toContain('equipe,nivel,categoria')
    expect(lines.length).toBeGreaterThanOrEqual(21)
    const withComma = toCSV({ ...g, records: [{ ...g.records[0], prompt: 'a, "b"' }] })
    expect(withComma).toContain('"a, ""b"""')
  })

  it('JSON é válido e não traz dados pessoais além dos nomes das equipes', () => {
    const g = finishedGame((t) => t % 2 === 0)
    const data = JSON.parse(toJSONReport(g))
    expect(data.respostas).toHaveLength(20)
    expect(data.equipes).toHaveLength(3)
    expect(Object.keys(data)).not.toContain('alunos')
  })

  it('exemplo de questão ativa existe durante o jogo', () => {
    const g = openQuestion(makeGame(), 0)
    expect(getActiveQuestion(g)).not.toBeNull()
  })
})
