import { useCallback, useEffect, useState } from 'react'
import { BackgroundDecor } from './components/BackgroundDecor'
import { Modal } from './components/Modal'
import { useGame } from './hooks/useGame'
import { useQuestionBank } from './hooks/useQuestionBank'
import { useSoundEffects } from './hooks/useSoundEffects'
import { GamePage } from './pages/GamePage'
import { HomePage } from './pages/HomePage'
import { HowToPlayPage } from './pages/HowToPlayPage'
import { QuestionBankPage } from './pages/QuestionBankPage'
import { ReportPage } from './pages/ReportPage'
import { ResultPage } from './pages/ResultPage'
import { SetupPage } from './pages/SetupPage'
import type { GameConfig } from './types'
import { createGame } from './utils/engine'
import { loadGame, loadSettings, saveSettings } from './utils/storage'

export type Page = 'home' | 'howto' | 'setup' | 'game' | 'result' | 'report' | 'bank'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [recording, setRecording] = useState(false)
  const [sound, setSound] = useState(() => loadSettings().sound === true)
  const [pendingConfig, setPendingConfig] = useState<GameConfig | null>(null)
  const { game, dispatch, load } = useGame()
  const bank = useQuestionBank()
  useSoundEffects(game, sound)

  useEffect(() => {
    document.documentElement.dataset.recording = String(recording)
  }, [recording])

  const navigate = useCallback((p: Page) => setPage(p), [])

  const toggleSound = () => {
    setSound((s) => {
      saveSettings({ sound: !s })
      return !s
    })
  }

  const begin = (config: GameConfig) => {
    load(createGame(config, bank.questions))
    setPendingConfig(null)
    setPage('game')
  }

  const handleStart = (config: GameConfig) => {
    const existing = game ?? loadGame()
    if (existing && existing.phase !== 'finished' && existing.records.length > 0) setPendingConfig(config)
    else begin(config)
  }

  const handleContinue = () => {
    const g = game ?? loadGame()
    if (!g) return
    if (!game) load(g)
    setPage(g.phase === 'finished' ? 'result' : 'game')
  }

  const saved = game ?? loadGame()
  const needsGame = page === 'game' || page === 'result' || page === 'report'
  const current: Page = needsGame && !game ? 'home' : page
  const overlayOpen = current === 'game' && !!game && game.phase !== 'choose'

  return (
    <div className={recording ? 'app is-recording' : 'app'}>
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <BackgroundDecor />

      {current === 'home' && <HomePage saved={saved} onNavigate={navigate} onContinue={handleContinue} />}
      {current === 'howto' && <HowToPlayPage onNavigate={navigate} />}
      {current === 'setup' && <SetupPage questions={bank.questions} onNavigate={navigate} onStart={handleStart} />}
      {current === 'bank' && <QuestionBankPage bank={bank} onNavigate={navigate} />}
      {current === 'game' && game && <GamePage game={game} dispatch={dispatch} onNavigate={navigate} />}
      {current === 'result' && game && <ResultPage game={game} onNavigate={navigate} />}
      {current === 'report' && game && <ReportPage game={game} onNavigate={navigate} />}

      <div className="toolbar" role="toolbar" aria-label="Opções de exibição" hidden={overlayOpen}>
        <button type="button" className="btn btn-small btn-toolbar" aria-pressed={recording} onClick={() => setRecording((r) => !r)}>
          {recording ? '● Sair do Modo Gravação' : '○ Modo Gravação'}
        </button>
        {!recording && (
          <button type="button" className="btn btn-small btn-toolbar" aria-pressed={sound} onClick={toggleSound}>
            {sound ? '🔊 Som: ligado' : '🔇 Som: desligado'}
          </button>
        )}
      </div>

      {pendingConfig && (
        <Modal
          title="Substituir a partida em andamento?"
          onClose={() => setPendingConfig(null)}
          actions={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setPendingConfig(null)} data-autofocus>
                Voltar
              </button>
              <button type="button" className="btn btn-danger" onClick={() => begin(pendingConfig)}>
                Começar nova partida
              </button>
            </>
          }
        >
          <p>Existe uma partida salva com respostas já registradas. Começar uma nova apaga essa partida.</p>
        </Modal>
      )}
    </div>
  )
}
