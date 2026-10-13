import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { getDefaultQuestions } from '../src/data/defaultQuestions'

const SHOTS = process.env.SHOTS === '1'
const questions = getDefaultQuestions()

async function shot(page: Page, name: string) {
  if (!SHOTS) return
  mkdirSync('screenshots', { recursive: true })
  await page.waitForTimeout(700) // deixa as animações de entrada terminarem
  await page.screenshot({ path: `screenshots/${name}.png` })
}

test('partida completa: configurar, jogar 20 casas, resultado, relatório e exportação', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Batalha/ })).toBeVisible()
  await shot(page, '01-inicio')

  await page.getByRole('button', { name: /Nova partida/ }).click()
  await expect(page.getByRole('heading', { name: 'Configurar a partida' })).toBeVisible()
  await shot(page, '02-configuracao')
  await page.getByRole('button', { name: /Começar a batalha/ }).click()

  const cells = page.getByRole('group', { name: /Tabuleiro/ }).getByRole('button')
  await expect(cells).toHaveCount(20)
  await shot(page, '03-tabuleiro')

  let correctShot = false
  for (let turn = 0; turn < 20; turn++) {
    await page.locator('.board-cell:not(:disabled)').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /Ver a questão|Jogar sem risco/ }).click()

    const prompt = (await page.locator('.q-prompt').innerText()).trim()
    const q = questions.find((x) => x.prompt === prompt)
    expect(q, `questão encontrada: ${prompt}`).toBeTruthy()

    if (turn === 0) {
      await shot(page, '04-questao')
      await page.getByRole('button', { name: /Iniciar cronômetro/ }).click()
      await page.getByRole('button', { name: /Pedir justificativa/ }).click()
      await expect(page.getByText('Explique por que sua equipe escolheu essa estratégia.')).toBeVisible()
      await shot(page, '04b-justificativa')
      await page.getByRole('button', { name: /Ocultar justificativa/ }).click()
      await page.getByRole('button', { name: /Pausa pedagógica/ }).click()
      await expect(page.getByRole('heading', { name: 'Pausa pedagógica' })).toBeVisible()
      await page.getByRole('button', { name: 'Quais lados aparecem neste problema?' }).click()
      await shot(page, '05-pausa-pedagogica')
      await page.getByRole('button', { name: /Voltar ao jogo/ }).click()
      await expect(page.locator('.q-prompt')).toHaveText(prompt)
    }

    // 2 de cada 3 turnos acertam; o restante erra de propósito.
    const wantCorrect = turn % 3 !== 1
    const index = wantCorrect ? q!.correctIndex : (q!.correctIndex + 1) % 4
    await page.locator('.q-option').nth(index).click()
    await page.getByRole('button', { name: /Confirmar resposta/ }).click()
    await expect(page.locator('.result-card')).toBeVisible()
    await expect(page.locator('.result-card')).toContainText(wantCorrect ? 'Resposta correta' : 'Resposta incorreta')
    if (wantCorrect && !correctShot) {
      correctShot = true
      await shot(page, '06-resposta-correta')
    }
    if (!wantCorrect && turn === 1) await shot(page, '06b-resposta-incorreta')

    const steal = page.locator('.steal-options')
    if (await steal.isVisible()) await steal.getByRole('button', { name: /Não roubar/ }).click()

    if (turn === 5) {
      // o placar aparece também no tabuleiro; captura depois de fechar a questão
      await page.getByRole('button', { name: /Próxima equipe/ }).click()
      await shot(page, '07-placar')
      continue
    }
    await page.getByRole('button', { name: /Próxima equipe|Ver resultado final/ }).click()
  }

  await expect(page.getByRole('heading', { name: 'Resultado final' })).toBeVisible()
  await shot(page, '08-resultado-final')

  await page.getByRole('button', { name: /Resumo da aprendizagem/ }).click()
  await expect(page.getByRole('heading', { name: 'Resumo da aprendizagem' })).toBeVisible()
  await shot(page, '09-relatorio')

  const [csv] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Exportar CSV/ }).click()])
  expect(csv.suggestedFilename()).toMatch(/\.csv$/)
  const [json] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Exportar JSON/ }).click()])
  expect(json.suggestedFilename()).toMatch(/\.json$/)
})

test('pausa pedagógica congela o cronômetro e não altera a questão', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Nova partida/ }).click()
  await page.getByRole('button', { name: /Começar a batalha/ }).click()
  await page.locator('.board-cell:not(:disabled)').first().click()
  await page.getByRole('button', { name: /Ver a questão|Jogar sem risco/ }).click()
  const prompt = await page.locator('.q-prompt').innerText()
  await page.getByRole('button', { name: /Iniciar cronômetro/ }).click()
  await page.waitForTimeout(2200)
  await page.getByRole('button', { name: /Pausa pedagógica/ }).click()
  const frozen = await page.locator('.timer-number').innerText()
  await page.waitForTimeout(2200)
  expect(await page.locator('.timer-number').innerText()).toBe(frozen)
  await page.keyboard.press('Escape')
  await expect(page.locator('.q-prompt')).toHaveText(prompt)
  await page.waitForTimeout(2200)
  expect(await page.locator('.timer-number').innerText()).not.toBe(frozen)
})

test('continuar partida após recarregar a página', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Nova partida/ }).click()
  await page.getByRole('button', { name: /Começar a batalha/ }).click()
  await page.locator('.board-cell:not(:disabled)').first().click()
  await page.getByRole('button', { name: /Ver a questão|Jogar sem risco/ }).click()
  await page.locator('.q-option').first().click()
  await page.getByRole('button', { name: /Confirmar resposta/ }).click()
  await page.getByRole('button', { name: /Próxima equipe/ }).click()
  await page.reload()
  await page.getByRole('button', { name: /Continuar partida/ }).click()
  await expect(page.locator('.board-cell.is-open')).toHaveCount(1)
})

test('modo gravação e banco de questões (capturas)', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Modo Gravação/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-recording', 'true')
  await page.getByRole('button', { name: /Nova partida/ }).click()
  await page.getByRole('button', { name: /Começar a batalha/ }).click()
  await page.locator('.board-cell:not(:disabled)').nth(2).click()
  await page.getByRole('button', { name: /Ver a questão|Jogar sem risco/ }).click()
  await page.locator('.q-option').first().click()
  await shot(page, '10-modo-gravacao-questao')
  await page.getByRole('button', { name: /Confirmar resposta/ }).click()
  const steal = page.locator('.steal-options')
  if (await steal.isVisible()) await steal.getByRole('button', { name: /Não roubar/ }).click()
  await page.getByRole('button', { name: /Próxima equipe/ }).click()
  await shot(page, '10b-modo-gravacao-tabuleiro')
  await page.getByRole('button', { name: /Sair do Modo Gravação/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-recording', 'false')

  await page.goto('/')
  await page.getByRole('button', { name: /Banco de questões/ }).click()
  await expect(page.getByRole('heading', { name: 'Banco de questões' })).toBeVisible()
  await shot(page, '11-banco-de-questoes')
  await page.getByRole('button', { name: /Nova questão/ }).click()
  await shot(page, '12-editor-de-questao')
})

test('continua funcionando sem internet depois do primeiro carregamento', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  // espera o service worker assumir o controle da página e guardar os arquivos
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: /Batalha/ })).toBeVisible()
  await page.getByRole('button', { name: /Nova partida/ }).click()
  await page.getByRole('button', { name: /Começar a batalha/ }).click()
  await expect(page.locator('.board-cell')).toHaveCount(20)
  await context.setOffline(false)
})
