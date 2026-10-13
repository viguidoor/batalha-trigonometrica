# Batalha Trigonométrica — Seno, Cosseno e Tangente

Jogo educacional em equipes para a **1ª série do Ensino Médio**, projetado na TV ou no projetor da sala e controlado **apenas pelo professor**. Os estudantes participam falando; ninguém usa celular ou tablet.

Funciona 100% no navegador: **sem backend, sem banco de dados, sem login, sem serviços pagos e sem API externa**. Depois do primeiro carregamento, continua funcionando sem internet.

> Identidade visual própria (azul escuro, azul elétrico, ciano, amarelo e laranja; triângulos, ângulos e fórmulas ao fundo). O projeto se inspira apenas na *dinâmica* de jogos de tabuleiro de perguntas e respostas em equipes; nome, interface, cores e elementos visuais são originais.

## Objetivo pedagógico

Trabalhar, em avaliação formativa e intervenção pedagógica, o percurso:

> interpretar o problema → identificar os lados → escolher seno, cosseno ou tangente → montar a relação → calcular → justificar

Conteúdos: triângulo retângulo, hipotenusa, cateto oposto e adjacente (em relação a um ângulo), seno, cosseno, tangente, escolha da razão adequada, cálculo de lados e situações-problema simples. O foco **não** é cálculo complexo: não há arco-seno, Lei dos Senos/Cossenos, círculo trigonométrico nem identidades.

Valores fornecidos (uma casa decimal):

| ângulo | sen | cos | tg |
|:--:|:--:|:--:|:--:|
| 30° | 0,5 | 0,9 | 0,6 |
| 45° | 0,7 | 0,7 | 1,0 |
| 60° | 0,9 | 0,5 | 1,7 |

Outros ângulos podem ser usados no editor, desde que o enunciado informe o valor (ex.: “Considere tg 40° = 0,8”).

## Recursos

- **Partida:** 2 a 6 equipes com nomes automáticos editáveis; cronômetro de 20/30/45/60 s ou desligado; tabuleiro 4×5 com 20 casas fechadas e valores secretos (100 a 500).
- **Eventos especiais (opcionais):** Dobro, Roubo, Escudo, Tudo ou Nada e Desafio Relâmpago — cada um pode ser desligado na configuração.
- **Turno:** equipe destacada → escolhe casa → revelação → questão em tela cheia → discussão → cronômetro → alternativa marcada pelo professor → **Pedir justificativa** → **Confirmar resposta** → explicação e placar.
- **Pausa pedagógica:** congela o cronômetro, escurece o fundo, mantém a questão visível e mostra perguntas de mediação; volta ao jogo sem alterar a questão.
- **Banco com 30 questões** (10 fáceis, 10 médias, 10 problemas), com triângulos desenhados em SVG e distratores baseados em erros comuns.
- **Editor de questões:** ver, criar, editar, duplicar, excluir, ativar/desativar, nível, tempo, pontuação, explicação, resposta correta, figura; salvo no navegador; botão *Restaurar questões originais*.
- **Resultado final** (1º, 2º e demais, pontos, respondidas, acertos, erros, %) e **Resumo da aprendizagem** (seno/cosseno/tangente, acertos e erros por categoria, questões erradas, padrões de erro e conceitos que podem precisar de retomada, sempre em linguagem de *indício*).
- **Exportação:** imprimir relatório, CSV e JSON — sem dados pessoais dos estudantes.
- **Modo Gravação:** interface limpa, textos e placar maiores, sem botões técnicos.
- **Áudio opcional** (Web Audio API, gerado na hora; começa **desligado**).
- **Acessibilidade:** contraste alto, foco visível, navegação por teclado, botões grandes, informação nunca só por cor, `aria-label`, regiões e diálogos para leitores de tela, respeito a `prefers-reduced-motion`.

## Tecnologias

React 19 · TypeScript · Vite · CSS moderno (variáveis, grid) · Vitest + Testing Library · Playwright (E2E) · oxlint.

## Instalação e execução

Requer **Node.js 20 ou superior**.

```bash
npm install
```

Desenvolvimento (recarrega ao salvar):

```bash
npm run dev
```

Build de produção (gera a pasta `dist/`):

```bash
npm run build
```

Servir o build localmente (recomendado para usar em sala):

```bash
npm run preview
```

Abra o endereço mostrado no terminal (por padrão `http://localhost:4173`). Na primeira abertura, com internet ou na própria rede local, o navegador guarda o jogo; depois disso ele abre mesmo offline. O conteúdo de `dist/` também pode ser hospedado em qualquer servidor de arquivos estáticos (o `base` é relativo).

> Dica: abra a página uma vez, na sala, antes da aula, para garantir que o jogo ficou em cache.

### Outros comandos

```bash
npm test          # testes unitários e de componentes (Vitest)
npm run lint      # análise estática (oxlint)
npm run test:e2e  # fluxo completo no navegador (Playwright; usa o Edge/Chrome instalado)
```

O E2E usa `channel: 'msedge'`. Para usar o Chrome: `PW_CHANNEL=chrome npm run test:e2e`. Para gerar capturas em `screenshots/`: `SHOTS=1 npm run test:e2e` (rode `npm run build` antes).

## Como usar em sala

1. Conecte o computador à TV/projetor e abra o jogo em tela cheia (`F11`).
2. **Nova partida** → escolha equipes, nomes, tempo e eventos → **Começar a batalha**.
3. A equipe da vez (destacada no placar) escolhe uma casa. Clique nela.
4. Clique em **Ver a questão** (em *Tudo ou Nada*, a equipe decide antes se arrisca).
5. Deixe a equipe discutir em voz alta e clique em **Iniciar cronômetro**.
6. Marque a alternativa que a equipe disser (ou use as teclas **A–D** / **1–4**).
7. Se quiser, clique em **Pedir justificativa**: aparece “Explique por que sua equipe escolheu essa estratégia.”
8. Clique em **Confirmar resposta**. O jogo mostra a correção, a explicação e atualiza o placar.
9. **Próxima equipe**. Ao abrir as 20 casas, o jogo mostra o resultado final e o resumo da aprendizagem.

**Pausa pedagógica** (botão disponível em toda questão): congela o tempo, escurece o fundo e exibe perguntas de mediação (“Quais lados aparecem neste problema?”, “Por que tangente seria mais adequada?” etc.). Clique em uma pergunta para destacá-la em letras grandes; **Voltar ao jogo** (ou `Esc`) retoma exatamente de onde parou.

**Partida interrompida?** O jogo salva automaticamente no navegador. Na tela inicial, **Continuar partida** retoma da última questão.

Roteiros prontos: [`docs/ROTEIRO_AULA.md`](docs/ROTEIRO_AULA.md) (50 minutos) e [`docs/ROTEIRO_GRAVACAO_15MIN.md`](docs/ROTEIRO_GRAVACAO_15MIN.md) (gravação de 15 minutos).

### Regras dos eventos

| Evento | Como funciona |
|---|---|
| **Dobro** | Acertando, a questão vale o dobro. Errar não penaliza. |
| **Roubo** | Acertando, a equipe ganha os pontos e pode retirar até o valor da questão de outra equipe (ou escolher não roubar). Um **escudo** bloqueia o roubo e é consumido. |
| **Escudo** | Acertando, a equipe ganha um escudo que bloqueia a próxima penalidade (roubo sofrido ou perda do Tudo ou Nada). |
| **Tudo ou Nada** | Antes de ver a questão, a equipe decide: arriscar (acerto dobra; erro perde o valor da questão — o placar nunca fica negativo) ou jogar normalmente. |
| **Desafio Relâmpago** | Questão do nível mais simples valendo o valor da casa **+ 200** pontos extras. |

Questões mais difíceis aparecem em casas de valor mais alto (100 → nível 1; 200 → níveis 1–2; 300 → nível 2; 400 → níveis 2–3; 500 → nível 3) e o jogo evita repetir questões enquanto houver novas.

## Como editar as questões

### Pela interface (recomendado)

**Início → Banco de questões.** Ali você pode:

- **Ver** a questão; **Editar**; **Duplicar** (útil para criar variações); **Excluir**;
- **ativar/desativar** com a caixa “Ativa” (questões inativas não entram nas partidas);
- **Nova questão:** nível, categoria (usada no relatório), habilidade principal, enunciado, 4 alternativas (marque a correta), explicação curta, tempo próprio e pontuação fixa (opcionais) e, se quiser, um **triângulo retângulo em SVG** (vértices, ângulo, medidas, rotação e espelhamento — com pré-visualização);
- **Restaurar questões originais**: volta às 30 questões do projeto, apagando personalizações.

As alterações ficam em `localStorage` **deste navegador neste computador**. Para levar o banco a outro computador, use o mesmo navegador/perfil ou edite o arquivo de dados (abaixo).

Boas práticas ao criar questões:

- Sempre informe no enunciado o valor trigonométrico necessário (ex.: “Use sen 30° = 0,5”).
- Em questões de **identificar** hipotenusa/catetos, não escreva esses nomes no enunciado nem na figura — eles devem aparecer apenas como alternativas.
- Faça os distratores representarem erros comuns: seno × cosseno, tangente indevida, razão invertida, confusão com a hipotenusa, oposto × adjacente, erro de multiplicação/divisão.

### Pelo código

As 30 questões originais estão em [`src/data/defaultQuestions.ts`](src/data/defaultQuestions.ts). Cada uma define o enunciado, o triângulo (`tri(...)`), a alternativa correta, três distratores com o **tipo de erro** que representam (usado no relatório) e a posição da resposta certa (`pos`).

## Estrutura do projeto

```
src/
  components/   Board, Scoreboard, QuestionOverlay, PauseOverlay, RevealOverlay,
                TriangleFigure (SVG), TimerRing, QuestionEditor, Modal, ...
  pages/        HomePage, SetupPage, GamePage, ResultPage, ReportPage,
                QuestionBankPage, HowToPlayPage
  data/         questões originais, eventos, rótulos e textos pedagógicos
  hooks/        useGame (estado + persistência + relógio), useQuestionBank,
                useSoundEffects, useFocusTrap
  utils/        engine (regras do jogo), scoring, board, report, storage,
                questionBank, geometry, audio, random
  types/        tipos TypeScript
  styles/       tokens, base, components, game, pages, print
  tests/        testes (Vitest + Testing Library)
e2e/            teste de partida completa (Playwright)
docs/           roteiros da aula e da gravação
public/         service worker (cache offline) e favicon
```

Todas as regras do jogo ficam em **funções puras** (`utils/engine.ts`, `utils/scoring.ts`), o que facilita testar e evoluir.

## Modo Gravação

Botão **Modo Gravação** no canto inferior direito (em qualquer tela). Ao ativar:

- esconde o menu, o botão de som e informações técnicas;
- aumenta todos os textos e o placar;
- mantém só o essencial na tela, para uma gravação limpa.

Para sair, clique em **Sair do Modo Gravação** (fica discreto no canto e ganha destaque ao passar o mouse). Veja [`docs/ROTEIRO_GRAVACAO_15MIN.md`](docs/ROTEIRO_GRAVACAO_15MIN.md).

## Privacidade

Nada sai do navegador. O jogo não coleta dados pessoais; os relatórios contêm apenas nomes de **equipes** e respostas. Use nomes de equipe, não de estudantes. O `localStorage` guarda apenas: a partida em andamento, o banco de questões editado e preferências simples (som, última configuração).

## Testes

```bash
npm test
```

Cobrem: cálculo de pontuação, mudança de equipe, respostas certas/erradas, poderes (dobro, roubo, escudo, tudo ou nada, relâmpago), cronômetro e pausa, final da partida, persistência, relatório e exportações, banco de questões (30 questões, tabela de valores, ausência dos nomes dos lados nos enunciados de identificação, posição das respostas), geometria dos triângulos SVG e fluxos de tela com Testing Library. O teste Playwright joga uma partida completa, exporta CSV/JSON e valida a pausa pedagógica e a retomada da partida.

## Limitações conhecidas

- O banco editado fica no `localStorage` do navegador (não sincroniza entre computadores; limpar dados do navegador apaga as personalizações).
- O modo offline depende de abrir o jogo uma vez com acesso ao servidor para o navegador guardar os arquivos (service worker). Abrir `index.html` direto do disco (`file://`) não é suportado pelos navegadores para aplicações com módulos; use `npm run preview` ou um servidor estático.
- Os valores trigonométricos são arredondados em uma casa decimal por escolha pedagógica (ex.: cos 30° = 0,9); o jogo não usa calculadora.
- O relatório oferece *indícios* a partir de poucas questões respondidas em grupo; não substitui a avaliação do professor.
