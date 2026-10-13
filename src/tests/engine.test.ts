import { describe, expect, it } from 'vitest'
import { BOARD_VALUES } from '../data/events'
import { createBoard, pickQuestion } from '../utils/board'
import { gameReducer, getActiveQuestion, isBoardComplete } from '../utils/engine'
import { seededRng } from '../utils/random'
import { getDefaultQuestions } from '../data/defaultQuestions'
import { answer, makeGame, openQuestion, playTurn, run, withEvent } from './helpers'

describe('tabuleiro', () => {
  it('tem 20 casas fechadas com 4 de cada valor', () => {
    const cells = createBoard(['dobro'], seededRng(1))
    expect(cells).toHaveLength(20)
    expect(cells.every((c) => !c.opened)).toBe(true)
    for (const v of BOARD_VALUES) expect(cells.filter((c) => c.points === v)).toHaveLength(4)
  })

  it('distribui os eventos ativados e nenhum outro', () => {
    const all = createBoard(['dobro', 'roubo', 'escudo', 'tudo_ou_nada', 'relampago'], seededRng(2))
    const counts = (t: string) => all.filter((c) => c.event === t).length
    expect([counts('dobro'), counts('roubo'), counts('escudo'), counts('tudo_ou_nada'), counts('relampago')]).toEqual([2, 1, 1, 1, 1])
    expect(createBoard([], seededRng(2)).every((c) => c.event === null)).toBe(true)
    expect(createBoard(['roubo'], seededRng(2)).filter((c) => c.event).length).toBe(1)
  })

  it('escolhe questões do nível adequado e evita repetição', () => {
    const pool = getDefaultQuestions()
    expect(pickQuestion(pool, [], { points: 100, event: null }, 0)!.level).toBe(1)
    expect(pickQuestion(pool, [], { points: 500, event: null }, 0.5)!.level).toBe(3)
    expect(pickQuestion(pool, [], { points: 500, event: 'relampago' }, 0.5)!.level).toBe(1)
    const used = pool.filter((q) => q.level === 3).map((q) => q.id)
    expect(pickQuestion(pool, used, { points: 500, event: null }, 0)!.level).not.toBe(3)
  })

  it('ignora questões desativadas e funciona com poucas questões', () => {
    const pool = getDefaultQuestions().map((q, i) => ({ ...q, active: i === 0 }))
    expect(pickQuestion(pool, [pool[0].id], { points: 300, event: null }, 0.9)!.id).toBe(pool[0].id)
    expect(pickQuestion(pool.map((q) => ({ ...q, active: false })), [], { points: 100, event: null }, 0)).toBeNull()
  })
})

describe('turnos e mudança de equipe', () => {
  it('começa na equipe 1, em "escolher casa"', () => {
    const g = makeGame()
    expect(g.currentTeam).toBe(0)
    expect(g.phase).toBe('choose')
    expect(g.teams.map((t) => t.score)).toEqual([0, 0, 0])
  })

  it('fluxo completo: casa → revelação → questão → resultado → próxima equipe', () => {
    let g = makeGame()
    g = run(g, { type: 'SELECT_CELL', index: 3, rand: 0 })
    expect(g.phase).toBe('reveal')
    expect(g.cells[3].opened).toBe(true)
    g = run(g, { type: 'CONTINUE_REVEAL' })
    expect(g.phase).toBe('question')
    g = answer(g, true)
    expect(g.phase).toBe('result')
    g = run(g, { type: 'NEXT_TURN' })
    expect(g.phase).toBe('choose')
    expect(g.currentTeam).toBe(1)
  })

  it('a vez volta à primeira equipe depois da última', () => {
    let g = makeGame()
    for (let i = 0; i < 3; i++) g = playTurn(g, i, true)
    expect(g.currentTeam).toBe(0)
  })

  it('não reabre casa já aberta nem abre casa fora da fase de escolha', () => {
    let g = makeGame()
    g = openQuestion(g, 0)
    expect(gameReducer(g, { type: 'SELECT_CELL', index: 1, rand: 0 })).toBe(g)
    g = run(answer(g, true), { type: 'NEXT_TURN' })
    expect(gameReducer(g, { type: 'SELECT_CELL', index: 0, rand: 0 })).toBe(g)
  })

  it('não repete questões nas 20 casas (banco de 30)', () => {
    let g = makeGame()
    for (let i = 0; i < 20; i++) g = playTurn(g, i, true)
    expect(new Set(g.usedQuestionIds).size).toBe(20)
  })
})

describe('respostas corretas e incorretas', () => {
  it('acerto soma o valor da casa à equipe da vez', () => {
    let g = withEvent(makeGame(), 0, null, 300)
    g = answer(openQuestion(g, 0), true)
    expect(g.teams[0].score).toBe(g.basePoints)
    expect(g.result?.correct).toBe(true)
    expect(g.records).toHaveLength(1)
    expect(g.records[0].correct).toBe(true)
  })

  it('erro não soma pontos e registra o tipo de erro da alternativa escolhida', () => {
    let g = withEvent(makeGame(), 0, null, 300)
    g = openQuestion(g, 0)
    const q = getActiveQuestion(g)!
    const wrong = q.options.findIndex((_, i) => i !== q.correctIndex && q.optionTags?.[i])
    g = run(g, { type: 'SELECT_OPTION', index: wrong }, { type: 'CONFIRM' })
    expect(g.teams[0].score).toBe(0)
    expect(g.result?.correct).toBe(false)
    expect(g.records[0].errorTag).toBe(q.optionTags![wrong])
  })

  it('só confirma com alternativa marcada (ou tempo esgotado)', () => {
    const g = openQuestion(makeGame(), 0)
    expect(run(g, { type: 'CONFIRM' }).phase).toBe('question')
  })

  it('tempo esgotado permite confirmar sem resposta, contada como erro', () => {
    let g = openQuestion(makeGame({ timerSeconds: 20 }), 0)
    g = run(g, { type: 'START_TIMER' })
    for (let i = 0; i < 20; i++) g = run(g, { type: 'TICK' })
    expect(g.timer.expired).toBe(true)
    g = run(g, { type: 'CONFIRM' })
    expect(g.result?.timedOut).toBe(true)
    expect(g.result?.correct).toBe(false)
    expect(g.records[0].timedOut).toBe(true)
  })

  it('pedir justificativa fica registrado', () => {
    let g = openQuestion(makeGame(), 0)
    g = run(g, { type: 'TOGGLE_JUSTIFICATION' })
    expect(g.justificationShown).toBe(true)
    g = answer(g, true)
    expect(g.records[0].justificationRequested).toBe(true)
  })
})

describe('cronômetro e pausa pedagógica', () => {
  it('só conta depois de iniciado e para em zero', () => {
    let g = openQuestion(makeGame({ timerSeconds: 20 }), 0)
    expect(run(g, { type: 'TICK' }).timer.remaining).toBe(20)
    g = run(g, { type: 'START_TIMER' }, { type: 'TICK' }, { type: 'TICK' })
    expect(g.timer.remaining).toBe(18)
  })

  it('cronômetro desligado não conta nem inicia', () => {
    const g = openQuestion(makeGame({ timerSeconds: null }), 0)
    expect(g.timer.enabled).toBe(false)
    expect(run(g, { type: 'START_TIMER' }).timer.running).toBe(false)
  })

  it('pausa congela o tempo e bloqueia respostas, sem alterar a questão', () => {
    let g = openQuestion(makeGame(), 0)
    const questionId = g.activeQuestionId
    g = run(g, { type: 'START_TIMER' }, { type: 'TICK' }, { type: 'SELECT_OPTION', index: 1 }, { type: 'TOGGLE_PAUSE' })
    const frozen = g
    g = run(g, { type: 'TICK' }, { type: 'TICK' }, { type: 'SELECT_OPTION', index: 2 }, { type: 'CONFIRM' })
    expect(g.timer.remaining).toBe(frozen.timer.remaining)
    expect(g.selected).toBe(1)
    expect(g.phase).toBe('question')
    g = run(g, { type: 'TOGGLE_PAUSE' })
    expect(g.paused).toBe(false)
    expect(g.activeQuestionId).toBe(questionId)
    expect(g.selected).toBe(1)
    expect(run(g, { type: 'TICK' }).timer.remaining).toBe(frozen.timer.remaining - 1)
  })

  it('tempo próprio da questão tem prioridade', () => {
    const game = makeGame()
    const pool = game.pool.map((q) => ({ ...q, timeSeconds: 45 }))
    const g = run({ ...game, pool }, { type: 'SELECT_CELL', index: 0, rand: 0 })
    expect(g.timer.total).toBe(45)
  })
})

describe('poderes e eventos', () => {
  it('dobro: acerto vale o dobro', () => {
    let g = withEvent(makeGame(), 0, 'dobro', 200)
    g = answer(openQuestion(g, 0), true)
    expect(g.teams[0].score).toBe(400)
  })

  it('relâmpago: valor da casa + 200 extras', () => {
    let g = withEvent(makeGame(), 0, 'relampago', 100)
    g = answer(openQuestion(g, 0), true)
    expect(getActiveQuestion(g)!.level).toBe(1)
    expect(g.teams[0].score).toBe(300)
  })

  it('escudo: acerto concede o escudo', () => {
    let g = withEvent(makeGame(), 0, 'escudo', 100)
    g = answer(openQuestion(g, 0), true)
    expect(g.teams[0].shield).toBe(true)
    expect(g.result?.shieldGained).toBe(true)
  })

  it('tudo ou nada arriscado: erro tira os pontos (sem ficar negativo)', () => {
    let g = withEvent(makeGame(), 0, null, 500)
    g = playTurn(g, 0, true)
    g = playTurn(g, 1, true)
    g = playTurn(g, 2, true)
    const before = g.teams[0].score
    g = withEvent(g, 3, 'tudo_ou_nada', 300)
    g = answer(openQuestion(g, 3, true), false)
    expect(g.teams[0].score).toBe(Math.max(0, before - 300))
    expect(g.result?.lost).toBe(Math.min(before, 300))
  })

  it('tudo ou nada arriscado: acerto dobra', () => {
    let g = withEvent(makeGame(), 0, 'tudo_ou_nada', 300)
    g = answer(openQuestion(g, 0, true), true)
    expect(g.teams[0].score).toBe(600)
  })

  it('tudo ou nada: o escudo absorve a perda e some', () => {
    let g = makeGame()
    g = { ...g, teams: g.teams.map((t) => (t.id === 0 ? { ...t, score: 500, shield: true } : t)) }
    g = withEvent(g, 0, 'tudo_ou_nada', 400)
    g = answer(openQuestion(g, 0, true), false)
    expect(g.teams[0].score).toBe(500)
    expect(g.teams[0].shield).toBe(false)
    expect(g.result?.shieldUsed).toBe(true)
  })

  describe('roubo', () => {
    const setup = (scores: number[], shields: boolean[] = [false, false, false]) => {
      let g = makeGame()
      g = { ...g, teams: g.teams.map((t, i) => ({ ...t, score: scores[i], shield: shields[i] })) }
      g = withEvent(g, 0, 'roubo', 300)
      return answer(openQuestion(g, 0), true)
    }

    it('acerto abre a escolha de alvo e transfere os pontos', () => {
      let g = setup([0, 1000, 50])
      expect(g.pendingSteal).not.toBeNull()
      expect(run(g, { type: 'NEXT_TURN' }).phase).toBe('result') // precisa decidir antes
      const amount = g.pendingSteal!.amount
      g = run(g, { type: 'STEAL', targetId: 1 })
      expect(g.teams[1].score).toBe(1000 - amount)
      expect(g.teams[0].score).toBe(amount + amount)
      expect(g.result?.stolen).toEqual({ fromTeam: 1, amount, blocked: false })
      expect(g.pendingSteal).toBeNull()
    })

    it('não rouba mais do que o alvo tem', () => {
      let g = setup([0, 100, 0])
      g = run(g, { type: 'STEAL', targetId: 1 })
      expect(g.teams[1].score).toBe(0)
      expect(g.result?.stolen?.amount).toBe(100)
    })

    it('escudo do alvo bloqueia o roubo e é consumido', () => {
      let g = setup([0, 800, 0], [false, true, false])
      g = run(g, { type: 'STEAL', targetId: 1 })
      expect(g.teams[1].score).toBe(800)
      expect(g.teams[1].shield).toBe(false)
      expect(g.result?.stolen?.blocked).toBe(true)
    })

    it('pode optar por não roubar', () => {
      let g = setup([0, 800, 0])
      g = run(g, { type: 'STEAL', targetId: null })
      expect(g.pendingSteal).toBeNull()
      expect(g.teams[1].score).toBe(800)
      expect(run(g, { type: 'NEXT_TURN' }).phase).toBe('choose')
    })

    it('sem pontos para roubar, segue sem escolha', () => {
      const g = setup([0, 0, 0])
      expect(g.pendingSteal).toBeNull()
    })

    it('erro no roubo não abre escolha', () => {
      let g = makeGame()
      g = { ...g, teams: g.teams.map((t) => ({ ...t, score: 500 })) }
      g = answer(openQuestion(withEvent(g, 0, 'roubo', 300), 0), false)
      expect(g.pendingSteal).toBeNull()
    })

    it('não é possível roubar de si mesmo', () => {
      const g = setup([0, 500, 500])
      expect(run(g, { type: 'STEAL', targetId: 0 }).pendingSteal).not.toBeNull()
    })
  })
})

describe('final da partida', () => {
  it('termina quando as 20 casas estão abertas', () => {
    let g = makeGame()
    for (let i = 0; i < 19; i++) g = playTurn(g, i, i % 2 === 0)
    expect(isBoardComplete(g)).toBe(false)
    expect(g.phase).toBe('choose')
    g = playTurn(g, 19, true)
    expect(isBoardComplete(g)).toBe(true)
    expect(g.phase).toBe('finished')
    expect(g.records).toHaveLength(20)
  })

  it('depois de finalizada, ações de jogo não mudam o estado', () => {
    let g = makeGame()
    for (let i = 0; i < 20; i++) g = playTurn(g, i, true)
    expect(gameReducer(g, { type: 'SELECT_CELL', index: 0, rand: 0 })).toBe(g)
    expect(gameReducer(g, { type: 'NEXT_TURN' })).toBe(g)
  })
})
