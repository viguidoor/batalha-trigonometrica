import { CATEGORY_ADVICE, CATEGORY_LABEL, CATEGORY_ORDER, CONCEPT_ADVICE, CONCEPT_LABEL, ERROR_TAG_LABEL } from '../data/labels'
import { EVENT_BY_TYPE } from '../data/events'
import type { AnswerRecord, Category, Concept, ErrorTag, GameState } from '../types'
import { percent } from './scoring'

export interface Tally {
  total: number
  correct: number
  wrong: number
  pct: number
}

export interface TeamSummary extends Tally {
  id: number
  name: string
  score: number
  rank: number
}

export interface Report {
  totals: Tally
  teams: TeamSummary[]
  byCategory: (Tally & { category: Category; label: string })[]
  byConcept: (Tally & { concept: Concept; label: string })[]
  errorTags: { tag: ErrorTag; label: string; count: number }[]
  wrongQuestions: { questionId: string; prompt: string; teamName: string; category: Category }[]
  recommendations: string[]
  justificationsRequested: number
}

function tally(records: AnswerRecord[]): Tally {
  const correct = records.filter((r) => r.correct).length
  return { total: records.length, correct, wrong: records.length - correct, pct: percent(correct, records.length) }
}

/** Posição com empate: equipes com a mesma pontuação dividem o mesmo lugar. */
export function rankTeams(teams: GameState['teams']): { id: number; rank: number }[] {
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  return sorted.map((t) => ({ id: t.id, rank: sorted.findIndex((x) => x.score === t.score) + 1 }))
}

export function buildReport(game: GameState): Report {
  const { records } = game
  const ranks = rankTeams(game.teams)
  const teams: TeamSummary[] = game.teams
    .map((t) => ({
      id: t.id,
      name: t.name,
      score: t.score,
      rank: ranks.find((r) => r.id === t.id)?.rank ?? 0,
      ...tally(records.filter((r) => r.teamId === t.id)),
    }))
    .sort((a, b) => a.rank - b.rank || a.id - b.id)

  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABEL[category],
    ...tally(records.filter((r) => r.category === category)),
  }))

  const concepts = Array.from(new Set(records.map((r) => r.concept)))
  const byConcept = concepts
    .map((concept) => ({ concept, label: CONCEPT_LABEL[concept], ...tally(records.filter((r) => r.concept === concept)) }))
    .sort((a, b) => b.wrong - a.wrong || a.pct - b.pct)

  const tagCounts = new Map<ErrorTag, number>()
  for (const r of records) if (r.errorTag) tagCounts.set(r.errorTag, (tagCounts.get(r.errorTag) ?? 0) + 1)
  const errorTags = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, label: ERROR_TAG_LABEL[tag], count }))
    .sort((a, b) => b.count - a.count)

  const wrongQuestions = records
    .filter((r) => !r.correct)
    .map((r) => ({ questionId: r.questionId, prompt: r.prompt, teamName: game.teams[r.teamId]?.name ?? '', category: r.category }))

  return {
    totals: tally(records),
    teams,
    byCategory,
    byConcept,
    errorTags,
    wrongQuestions,
    recommendations: buildRecommendations(byCategory, byConcept, errorTags),
    justificationsRequested: records.filter((r) => r.justificationRequested).length,
  }
}

function buildRecommendations(
  byCategory: Report['byCategory'],
  byConcept: Report['byConcept'],
  errorTags: Report['errorTags'],
): string[] {
  const out: string[] = []
  const categoryHits = byCategory.filter((c) => c.total >= 2 && c.wrong >= 1 && c.pct <= 50).sort((a, b) => a.pct - b.pct)
  for (const c of categoryHits) {
    const text = CATEGORY_ADVICE[c.category]
    if (text) out.push(text)
  }
  for (const c of byConcept.filter((x) => x.wrong >= 1 && x.pct <= 50)) out.push(CONCEPT_ADVICE[c.concept])
  const top = errorTags[0]
  if (top && top.count >= 2) out.push(`Entre as alternativas escolhidas, apareceu com mais frequência: "${top.label}" (${top.count} vezes). Pode valer uma conversa sobre esse tipo de raciocínio.`)
  if (out.length === 0) out.push('Não foram observados indícios relevantes de dificuldade nesta partida. Vale aprofundar com situações-problema novas.')
  out.push('Estes indícios vêm de poucas questões respondidas em grupo e não substituem a observação e a avaliação do professor.')
  return Array.from(new Set(out))
}

function csvCell(value: string | number | boolean): string {
  const s = String(value)
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCSV(game: GameState): string {
  const header = ['turno', 'equipe', 'nivel', 'categoria', 'conceito', 'evento', 'acertou', 'alternativa_escolhida', 'tipo_de_erro', 'tempo_esgotado', 'justificativa_pedida', 'pontos', 'enunciado']
  const rows = game.records.map((r) => [
    r.turn,
    game.teams[r.teamId]?.name ?? '',
    r.level,
    CATEGORY_LABEL[r.category],
    CONCEPT_LABEL[r.concept],
    r.event ? EVENT_BY_TYPE[r.event].name : '',
    r.correct ? 'sim' : 'nao',
    r.chosenIndex === null ? '' : 'ABCD'[r.chosenIndex],
    r.errorTag ? ERROR_TAG_LABEL[r.errorTag] : '',
    r.timedOut ? 'sim' : 'nao',
    r.justificationRequested ? 'sim' : 'nao',
    r.points,
    r.prompt,
  ])
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}

export function toJSONReport(game: GameState): string {
  const report = buildReport(game)
  return JSON.stringify(
    {
      geradoEm: new Date().toISOString(),
      equipes: report.teams,
      totais: report.totals,
      porCategoria: report.byCategory,
      porConceito: report.byConcept,
      tiposDeErro: report.errorTags,
      recomendacoes: report.recommendations,
      respostas: game.records,
    },
    null,
    2,
  )
}

export function downloadText(filename: string, content: string, mime: string) {
  // BOM para o Excel abrir acentos corretamente em CSV.
  const body = mime.includes('csv') ? `﻿${content}` : content
  const url = URL.createObjectURL(new Blob([body], { type: `${mime};charset=utf-8` }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
