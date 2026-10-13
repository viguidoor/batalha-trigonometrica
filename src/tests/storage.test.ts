import { describe, expect, it } from 'vitest'
import { getDefaultQuestions } from '../data/defaultQuestions'
import { clearGame, KEYS, loadGame, loadQuestions, loadSettings, resetQuestions, saveGame, saveQuestions, saveSettings } from '../utils/storage'
import { blankQuestion } from '../utils/questionBank'
import { answer, makeGame, openQuestion, playTurn } from './helpers'

describe('persistência da partida', () => {
  it('não há partida salva no início', () => {
    expect(loadGame()).toBeNull()
  })

  it('salva e recupera o estado idêntico (partida interrompida no meio de uma questão)', () => {
    const g = answer(openQuestion(playTurn(makeGame(), 0, true), 1), true)
    expect(saveGame(g)).toBe(true)
    expect(loadGame()).toEqual(g)
  })

  it('clearGame remove a partida', () => {
    saveGame(makeGame())
    clearGame()
    expect(loadGame()).toBeNull()
  })

  it('ignora dados corrompidos ou de formato inesperado', () => {
    window.localStorage.setItem(KEYS.game, '{não é json')
    expect(loadGame()).toBeNull()
    window.localStorage.setItem(KEYS.game, JSON.stringify({ version: 1, teams: [] }))
    expect(loadGame()).toBeNull()
    window.localStorage.setItem(KEYS.game, JSON.stringify({ ...makeGame(), version: 99 }))
    expect(loadGame()).toBeNull()
  })

  it('configurações: som começa desligado e preferências são mescladas', () => {
    expect(loadSettings().sound).toBeUndefined()
    saveSettings({ sound: true })
    saveSettings({ lastTeamCount: 4 })
    expect(loadSettings()).toMatchObject({ sound: true, lastTeamCount: 4 })
  })
})

describe('persistência do banco de questões', () => {
  it('sem nada salvo, carrega as 30 originais', () => {
    expect(loadQuestions()).toHaveLength(30)
  })

  it('salva e recupera questões personalizadas', () => {
    const custom = { ...blankQuestion(2), prompt: 'Minha questão', options: ['1', '2', '3', '4'], explanation: 'ok' }
    saveQuestions([...getDefaultQuestions(), custom])
    const loaded = loadQuestions()
    expect(loaded).toHaveLength(31)
    expect(loaded.at(-1)).toMatchObject({ prompt: 'Minha questão', custom: true })
  })

  it('banco salvo inválido volta para as originais', () => {
    window.localStorage.setItem(KEYS.questions, JSON.stringify([{ id: 'x' }]))
    expect(loadQuestions()).toHaveLength(30)
  })

  it('restaurar remove as personalizações salvas', () => {
    saveQuestions([blankQuestion(1)])
    expect(resetQuestions()).toHaveLength(30)
    expect(window.localStorage.getItem(KEYS.questions)).toBeNull()
  })
})
