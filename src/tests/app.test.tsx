import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'
import { KEYS, loadQuestions } from '../utils/storage'

async function startGame(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Nova partida/ }))
  await user.click(screen.getByRole('button', { name: /Começar a batalha/ }))
}

async function openFirstCell(user: ReturnType<typeof userEvent.setup>) {
  const board = screen.getByRole('group', { name: /Tabuleiro/ })
  await user.click(within(board).getAllByRole('button', { name: /fechada/ })[0])
  await user.click(await screen.findByRole('button', { name: /Ver a questão|Jogar sem risco/ }))
}

describe('tela inicial', () => {
  it('mostra nome, subtítulo e os quatro botões', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Batalha\s*Trigonométrica/i })).toBeInTheDocument()
    expect(screen.getByText('Seno, Cosseno e Tangente')).toBeInTheDocument()
    for (const name of [/Nova partida/, /Continuar partida/, /Como jogar/, /Banco de questões/]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: /Continuar partida/ })).toBeDisabled()
  })

  it('abre "Como jogar" e volta', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Como jogar/ }))
    expect(screen.getByRole('heading', { name: 'Como jogar' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Início/ }))
    expect(screen.getByRole('button', { name: /Nova partida/ })).toBeInTheDocument()
  })
})

describe('configuração', () => {
  it('permite 2 a 6 equipes com nomes editáveis, tempo e eventos', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Nova partida/ }))
    expect(screen.getAllByRole('radio', { name: /^[2-6]$/ })).toHaveLength(5)
    await user.click(screen.getByRole('radio', { name: '5' }))
    expect(screen.getAllByLabelText(/Nome da equipe/)).toHaveLength(5)
    const first = screen.getByLabelText('Nome da equipe 1')
    await user.clear(first)
    await user.type(first, 'Os Catetos')
    for (const t of ['20 s', '30 s', '45 s', '60 s', 'Desligado']) expect(screen.getByRole('radio', { name: t })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Desligado' }))
    await user.click(screen.getByRole('checkbox', { name: /Usar eventos especiais/ }))
    await user.click(screen.getByRole('button', { name: /Começar a batalha/ }))
    const scoreboard = screen.getByRole('region', { name: 'Placar' })
    expect(within(scoreboard).getAllByRole('listitem')).toHaveLength(5)
    expect(within(scoreboard).getByText('Os Catetos')).toBeInTheDocument()
  })

  it('gera nomes automáticos criativos', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Nova partida/ }))
    await user.click(screen.getByRole('radio', { name: '6' }))
    const names = screen.getAllByLabelText(/Nome da equipe/).map((i) => (i as HTMLInputElement).value)
    expect(names).toEqual(['Equipe Seno', 'Equipe Cosseno', 'Equipe Tangente', 'Vetores', 'Pitágoras', 'Hipotenusa'])
  })
})

describe('partida', () => {
  it('tabuleiro começa com 20 casas fechadas, sem revelar valores', async () => {
    const user = userEvent.setup()
    render(<App />)
    await startGame(user)
    const board = screen.getByRole('group', { name: /Tabuleiro/ })
    const cells = within(board).getAllByRole('button')
    expect(cells).toHaveLength(20)
    expect(cells.every((c) => /fechada/.test(c.getAttribute('aria-label') ?? ''))).toBe(true)
    expect(board.textContent).not.toMatch(/\b(100|200|300|400|500)\b/)
  })

  it('turno completo: abre casa, responde, confirma e passa a vez', async () => {
    const user = userEvent.setup()
    render(<App />)
    await startGame(user)
    expect(screen.getByRole('region', { name: 'Placar' }).querySelector('[aria-current="true"]')).toHaveTextContent('Equipe Seno')

    await openFirstCell(user)
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getAllByRole('button', { name: /^Alternativa [A-D]/ })).toHaveLength(4)

    expect(screen.getByRole('button', { name: /Confirmar resposta/ })).toBeDisabled()
    await user.click(within(dialog).getByRole('button', { name: /^Alternativa A/ }))
    await user.click(screen.getByRole('button', { name: /Confirmar resposta/ }))

    const result = await screen.findByRole('status')
    expect(result).toHaveTextContent(/Resposta (correta|incorreta)/)
    expect(result).toHaveTextContent('Resposta certa:')
    const steal = document.querySelector('.steal-options')
    if (steal) await user.click(within(steal as HTMLElement).getByRole('button', { name: /Não roubar/ }))
    await user.click(screen.getByRole('button', { name: /Próxima equipe/ }))
    expect(screen.getByRole('region', { name: 'Placar' }).querySelector('[aria-current="true"]')).toHaveTextContent('Equipe Cosseno')
  })

  it('pedir justificativa mostra a pergunta antes de revelar a resposta', async () => {
    const user = userEvent.setup()
    render(<App />)
    await startGame(user)
    await openFirstCell(user)
    await user.click(screen.getByRole('button', { name: /Pedir justificativa/ }))
    expect(screen.getByText('Explique por que sua equipe escolheu essa estratégia.')).toBeInTheDocument()
    expect(document.querySelector('.result-card')).toBeNull()
  })

  it('pausa pedagógica mantém a questão e mostra perguntas de mediação', async () => {
    const user = userEvent.setup()
    render(<App />)
    await startGame(user)
    await openFirstCell(user)
    const prompt = document.querySelector('.q-prompt')!.textContent
    await user.click(screen.getByRole('button', { name: /Pausa pedagógica/ }))
    expect(screen.getByRole('heading', { name: 'Pausa pedagógica' })).toBeInTheDocument()
    expect(document.querySelector('.q-prompt')!.textContent).toBe(prompt)
    for (const q of ['Quais lados aparecem neste problema?', 'Por que tangente seria mais adequada?', 'Outra equipe resolveu de maneira diferente?']) {
      expect(screen.getByRole('button', { name: q })).toBeInTheDocument()
    }
    await user.click(screen.getByRole('button', { name: /Voltar ao jogo/ }))
    expect(screen.queryByRole('heading', { name: 'Pausa pedagógica' })).not.toBeInTheDocument()
    expect(document.querySelector('.q-prompt')!.textContent).toBe(prompt)
  })

  it('a partida fica salva e pode ser continuada depois de reabrir', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await startGame(user)
    await openFirstCell(user)
    expect(window.localStorage.getItem(KEYS.game)).toBeTruthy()
    first.unmount()

    render(<App />)
    const cont = screen.getByRole('button', { name: /Continuar partida/ })
    expect(cont).toBeEnabled()
    await user.click(cont)
    expect(await screen.findByRole('dialog')).toBeInTheDocument() // volta na questão aberta
  })
})

describe('modo gravação e áudio', () => {
  it('liga e desliga o Modo Gravação', async () => {
    const user = userEvent.setup()
    render(<App />)
    const btn = screen.getByRole('button', { name: /Modo Gravação/ })
    expect(document.documentElement.dataset.recording).toBe('false')
    await user.click(btn)
    expect(document.documentElement.dataset.recording).toBe('true')
    expect(screen.queryByRole('button', { name: /Som:/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Sair do Modo Gravação/ }))
    expect(document.documentElement.dataset.recording).toBe('false')
  })

  it('som começa desligado e a escolha é lembrada', async () => {
    const user = userEvent.setup()
    const a = render(<App />)
    const toggle = screen.getByRole('button', { name: /Som: desligado/ })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)
    expect(screen.getByRole('button', { name: /Som: ligado/ })).toHaveAttribute('aria-pressed', 'true')
    a.unmount()
    render(<App />)
    expect(screen.getByRole('button', { name: /Som: ligado/ })).toBeInTheDocument()
  })
})

describe('banco de questões (tela)', () => {
  it('lista as 30 questões e permite filtrar, desativar e restaurar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Banco de questões/ }))
    const rows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(rows()).toHaveLength(30)
    await user.click(screen.getByRole('radio', { name: 'Nível 3' }))
    expect(rows()).toHaveLength(10)
    await user.click(screen.getByRole('radio', { name: 'Todos' }))

    const first = within(rows()[0]).getByRole('checkbox')
    expect(first).toBeChecked()
    await user.click(first)
    expect(loadQuestions().filter((q) => q.active)).toHaveLength(29)

    await user.click(screen.getByRole('button', { name: /Restaurar questões originais/ }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Restaurar' }))
    expect(loadQuestions().every((q) => q.active)).toBe(true)
  })

  it('cria uma questão personalizada, que fica salva', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Banco de questões/ }))
    await user.click(screen.getByRole('button', { name: /Nova questão/ }))
    const dialog = screen.getByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: /Salvar questão/ }))
    expect(within(dialog).getByRole('alert')).toHaveTextContent(/Escreva o enunciado/)

    await user.type(within(dialog).getByLabelText('Enunciado'), 'Quanto vale sen 30°?')
    const letters = ['A', 'B', 'C', 'D']
    const values = ['0,5', '0,9', '1,0', '1,7']
    for (let i = 0; i < 4; i++) await user.type(within(dialog).getByLabelText(`Texto da alternativa ${letters[i]}`), values[i])
    await user.type(within(dialog).getByLabelText(/Explicação curta/), 'Valor da tabela.')
    await user.click(within(dialog).getByLabelText('Alternativa C é a correta'))
    await user.click(within(dialog).getByRole('button', { name: /Salvar questão/ }))

    const saved = loadQuestions().find((q) => q.prompt === 'Quanto vale sen 30°?')
    expect(saved).toMatchObject({ custom: true, correctIndex: 2, options: values })
    expect(screen.getByText('Quanto vale sen 30°?')).toBeInTheDocument()
  })

  it('edita, duplica e exclui', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Banco de questões/ }))
    const table = screen.getByRole('table')
    const firstRow = () => within(table).getAllByRole('row')[1]

    await user.click(within(firstRow()).getByRole('button', { name: 'Duplicar' }))
    expect(loadQuestions()).toHaveLength(31)

    await user.click(within(firstRow()).getByRole('button', { name: 'Editar' }))
    const dialog = screen.getByRole('dialog')
    const prompt = within(dialog).getByLabelText('Enunciado')
    await user.clear(prompt)
    await user.type(prompt, 'Enunciado editado')
    await user.click(within(dialog).getByRole('button', { name: /Salvar questão/ }))
    expect(loadQuestions().some((q) => q.prompt === 'Enunciado editado')).toBe(true)

    await user.click(within(firstRow()).getByRole('button', { name: 'Excluir' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }))
    expect(loadQuestions()).toHaveLength(30)
  })
})
