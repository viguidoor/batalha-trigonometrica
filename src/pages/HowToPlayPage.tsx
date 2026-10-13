import type { Page } from '../App'
import { EVENTS } from '../data/events'

const STEPS = [
  ['Escolher uma casa', 'A equipe da vez escolhe uma das 20 casas. O valor (100 a 500) e o evento só aparecem depois de aberta.'],
  ['Discutir em voz alta', 'A questão aparece em tela cheia. A equipe conversa e decide; ninguém usa celular.'],
  ['Cronômetro', 'O professor aperta “Iniciar cronômetro” quando a discussão começar. O tempo pode ser desligado.'],
  ['Responder e justificar', 'O professor marca a alternativa dita pela equipe. Antes de revelar, pode clicar em “Pedir justificativa”.'],
  ['Confirmar', 'Com “Confirmar resposta”, o jogo mostra se está certo, a alternativa correta e uma explicação curta.'],
  ['Próxima equipe', 'Os pontos são atualizados e a vez passa. A partida termina quando as 20 casas forem abertas.'],
]

export function HowToPlayPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <main className="page howto" id="main">
      <header className="page-head">
        <h1>Como jogar</h1>
        <button type="button" className="btn btn-ghost" onClick={() => onNavigate('home')} data-autofocus>
          ← Início
        </button>
      </header>
      <div className="howto-grid">
        <section className="panel" aria-labelledby="h-turn">
          <h2 id="h-turn">Cada turno</h2>
          <ol className="steps">
            {STEPS.map(([t, d]) => (
              <li key={t}>
                <strong>{t}</strong>
                <span>{d}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="panel" aria-labelledby="h-ev">
          <h2 id="h-ev">Eventos especiais</h2>
          <ul className="steps">
            {EVENTS.map((e) => (
              <li key={e.type}>
                <strong>
                  <span aria-hidden="true">{e.icon}</span> {e.name}
                </strong>
                <span>{e.description}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel" aria-labelledby="h-teacher">
          <h2 id="h-teacher">Ferramentas do professor</h2>
          <ul className="steps">
            <li>
              <strong>Pausa pedagógica</strong>
              <span>Congela o cronômetro, escurece o fundo e mostra perguntas de mediação sem alterar a questão.</span>
            </li>
            <li>
              <strong>Modo Gravação</strong>
              <span>Interface limpa, textos maiores e placar ampliado para gravar a aula.</span>
            </li>
            <li>
              <strong>Teclado</strong>
              <span>As teclas A, B, C e D (ou 1 a 4) marcam a alternativa; Esc fecha a pausa pedagógica.</span>
            </li>
            <li>
              <strong>Valores usados nas questões</strong>
              <span>sen 30° = 0,5 · cos 30° = 0,9 · tg 30° = 0,6 · sen 45° = cos 45° = 0,7 · tg 45° = 1,0 · sen 60° = 0,9 · cos 60° = 0,5 · tg 60° = 1,7</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
