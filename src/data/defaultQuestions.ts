import type { Category, Concept, ErrorTag, Level, Question, TriangleFigure } from '../types'

type Wrong = [text: string, tag: ErrorTag | null]

interface Spec {
  id: string
  level: Level
  category: Category
  concept: Concept
  prompt: string
  figure?: TriangleFigure
  correct: string
  wrong: [Wrong, Wrong, Wrong]
  /** Posição (0 a 3) da alternativa correta. Varia de propósito entre as questões. */
  pos: 0 | 1 | 2 | 3
  explanation: string
}

function build(s: Spec): Question {
  const options = s.wrong.map((w) => w[0])
  const tags: (ErrorTag | null)[] = s.wrong.map((w) => w[1])
  options.splice(s.pos, 0, s.correct)
  tags.splice(s.pos, 0, null)
  return {
    id: s.id,
    level: s.level,
    category: s.category,
    concept: s.concept,
    prompt: s.prompt,
    figure: s.figure,
    options,
    correctIndex: s.pos,
    optionTags: tags,
    explanation: s.explanation,
    active: true,
    custom: false,
  }
}

/** Triângulo retângulo: lados hyp = angled–other, adj = angled–right, opp = right–other. */
function tri(
  right: string,
  angled: string,
  other: string,
  angleLabel: string,
  sides?: TriangleFigure['sides'],
  extra?: Pick<TriangleFigure, 'rotation' | 'mirror'>,
): TriangleFigure {
  return { kind: 'triangle', vertices: { right, angled, other }, angleLabel, sides, ...extra }
}

const SPECS: Spec[] = [
  // ───────────── Nível 1 — Fácil: identificação ─────────────
  {
    id: 'n1-01', level: 1, category: 'lados', concept: 'hipotenusa', pos: 2,
    prompt: 'No triângulo retângulo da figura, como é chamado o lado AB?',
    figure: tri('C', 'A', 'B', 'α'),
    correct: 'Hipotenusa',
    wrong: [['Cateto adjacente a α', 'confusao-hipotenusa'], ['Cateto oposto a α', 'confusao-hipotenusa'], ['Altura do triângulo', null]],
    explanation: 'O lado AB é o maior lado e fica à frente do ângulo reto (em C). Esse lado é a hipotenusa, qualquer que seja o ângulo agudo escolhido.',
  },
  {
    id: 'n1-02', level: 1, category: 'lados', concept: 'oposto-adjacente', pos: 0,
    prompt: 'Em relação ao ângulo α, o lado BC é chamado de:',
    figure: tri('C', 'A', 'B', 'α'),
    correct: 'Cateto oposto a α',
    wrong: [['Cateto adjacente a α', 'troca-oposto-adjacente'], ['Hipotenusa', 'confusao-hipotenusa'], ['Não é possível identificar', null]],
    explanation: 'O lado BC está "de frente" para o ângulo α (em A), sem tocá-lo. Por isso é o cateto oposto a α.',
  },
  {
    id: 'n1-03', level: 1, category: 'lados', concept: 'oposto-adjacente', pos: 3,
    prompt: 'Em relação ao ângulo β, o lado PR é chamado de:',
    figure: tri('R', 'P', 'Q', 'β', undefined, { mirror: true }),
    correct: 'Cateto adjacente a β',
    wrong: [['Cateto oposto a β', 'troca-oposto-adjacente'], ['Hipotenusa', 'confusao-hipotenusa'], ['Não é possível identificar', null]],
    explanation: 'O lado PR toca o ângulo β (em P) e forma o ângulo reto. Ele é o cateto adjacente a β; a hipotenusa é PQ.',
  },
  {
    id: 'n1-04', level: 1, category: 'lados', concept: 'oposto-adjacente', pos: 1,
    prompt: 'Agora o ângulo destacado é θ, no vértice B. Em relação a θ, o lado AC é chamado de:',
    figure: tri('C', 'B', 'A', 'θ', undefined, { rotation: 1 }),
    correct: 'Cateto oposto a θ',
    wrong: [['Cateto adjacente a θ', 'troca-oposto-adjacente'], ['Hipotenusa', 'confusao-hipotenusa'], ['Não é possível identificar', null]],
    explanation: 'Os nomes dos catetos dependem do ângulo escolhido. Em relação a θ (em B), o lado AC fica de frente para o ângulo: é o cateto oposto.',
  },
  {
    id: 'n1-05', level: 1, category: 'seno', concept: 'montar-relacao', pos: 3,
    prompt: 'Em relação ao ângulo α, a razão BC/AB representa:',
    figure: tri('C', 'A', 'B', 'α'),
    correct: 'sen α',
    wrong: [['cos α', 'troca-seno-cosseno'], ['tg α', 'tangente-indevida'], ['o inverso de sen α', 'razao-invertida']],
    explanation: 'BC é o cateto oposto a α e AB é a hipotenusa. Cateto oposto ÷ hipotenusa é o seno: sen α = BC/AB.',
  },
  {
    id: 'n1-06', level: 1, category: 'cosseno', concept: 'montar-relacao', pos: 0,
    prompt: 'Em relação ao ângulo α, a razão AC/AB representa:',
    figure: tri('C', 'A', 'B', 'α', undefined, { mirror: true }),
    correct: 'cos α',
    wrong: [['sen α', 'troca-seno-cosseno'], ['tg α', 'tangente-indevida'], ['o inverso de cos α', 'razao-invertida']],
    explanation: 'AC é o cateto adjacente a α e AB é a hipotenusa. Cateto adjacente ÷ hipotenusa é o cosseno: cos α = AC/AB.',
  },
  {
    id: 'n1-07', level: 1, category: 'tangente', concept: 'montar-relacao', pos: 2,
    prompt: 'Em relação ao ângulo θ, a razão QR/PR representa:',
    figure: tri('R', 'P', 'Q', 'θ', undefined, { rotation: 1 }),
    correct: 'tg θ',
    wrong: [['sen θ', 'troca-seno-cosseno'], ['cos θ', 'troca-seno-cosseno'], ['o inverso de tg θ', 'razao-invertida']],
    explanation: 'QR é o cateto oposto a θ e PR é o cateto adjacente. Cateto oposto ÷ cateto adjacente é a tangente: tg θ = QR/PR.',
  },
  {
    id: 'n1-08', level: 1, category: 'seno', concept: 'escolha-razao', pos: 1,
    prompt: 'Na figura queremos descobrir x. Qual razão de α relaciona os lados x e 10 cm?',
    figure: tri('C', 'A', 'B', 'α', { hyp: '10 cm', opp: 'x' }),
    correct: 'sen α',
    wrong: [['cos α', 'troca-seno-cosseno'], ['tg α', 'tangente-indevida'], ['Nenhuma: falta uma medida', null]],
    explanation: 'x é o cateto oposto a α e 10 cm é a hipotenusa. A razão entre cateto oposto e hipotenusa é o seno.',
  },
  {
    id: 'n1-09', level: 1, category: 'cosseno', concept: 'escolha-razao', pos: 3,
    prompt: 'Na figura queremos descobrir x. Qual razão de α relaciona os lados x e 12 cm?',
    figure: tri('C', 'A', 'B', 'α', { hyp: '12 cm', adj: 'x' }, { rotation: 2 }),
    correct: 'cos α',
    wrong: [['sen α', 'troca-seno-cosseno'], ['tg α', 'tangente-indevida'], ['Nenhuma: falta uma medida', null]],
    explanation: 'x é o cateto adjacente a α e 12 cm é a hipotenusa. A razão entre cateto adjacente e hipotenusa é o cosseno.',
  },
  {
    id: 'n1-10', level: 1, category: 'tangente', concept: 'escolha-razao', pos: 0,
    prompt: 'Na figura queremos descobrir x. Qual razão de α relaciona os lados 5 m e x?',
    figure: tri('C', 'A', 'B', 'α', { opp: '5 m', adj: 'x' }, { mirror: true, rotation: 3 }),
    correct: 'tg α',
    wrong: [['sen α', 'confusao-hipotenusa'], ['cos α', 'confusao-hipotenusa'], ['Nenhuma: falta uma medida', null]],
    explanation: 'Os dois lados dados e pedidos são catetos: 5 m é o oposto e x é o adjacente. Sem hipotenusa no problema, a razão adequada é a tangente.',
  },

  // ───────────── Nível 2 — Médio: cálculo de lados ─────────────
  {
    id: 'n2-01', level: 2, category: 'seno', concept: 'montar-relacao', pos: 1,
    prompt: 'Considere sen 30° = 0,5. Na figura, o lado dado mede 10 cm. Qual é o valor de x?',
    figure: tri('C', 'A', 'B', '30°', { hyp: '10 cm', opp: 'x' }),
    correct: '5 cm',
    wrong: [['20 cm', 'razao-invertida'], ['9 cm', 'troca-seno-cosseno'], ['10,5 cm', 'erro-calculo']],
    explanation: 'x é o cateto oposto e 10 é a hipotenusa: sen 30° = x/10. Logo x = 10 · 0,5 = 5 cm.',
  },
  {
    id: 'n2-02', level: 2, category: 'cosseno', concept: 'calculo', pos: 3,
    prompt: 'Considere cos 60° = 0,5. Na figura, o lado dado mede 12 cm. Qual é o valor de x?',
    figure: tri('C', 'A', 'B', '60°', { hyp: '12 cm', adj: 'x' }, { mirror: true }),
    correct: '6 cm',
    wrong: [['24 cm', 'razao-invertida'], ['10,8 cm', 'troca-seno-cosseno'], ['12,5 cm', 'erro-calculo']],
    explanation: 'x é o cateto adjacente e 12 é a hipotenusa: cos 60° = x/12. Logo x = 12 · 0,5 = 6 cm.',
  },
  {
    id: 'n2-03', level: 2, category: 'tangente', concept: 'montar-relacao', pos: 0,
    prompt: 'Considere tg 60° = 1,7. Na figura, o lado dado mede 10 m. Qual é o valor de x?',
    figure: tri('C', 'A', 'B', '60°', { adj: '10 m', opp: 'x' }),
    correct: '17 m',
    wrong: [['5,9 m', 'razao-invertida'], ['11,7 m', 'erro-calculo'], ['9 m', 'confusao-hipotenusa']],
    explanation: 'x é o cateto oposto e 10 m é o cateto adjacente: tg 60° = x/10. Logo x = 10 · 1,7 = 17 m.',
  },
  {
    id: 'n2-04', level: 2, category: 'seno', concept: 'calculo', pos: 2,
    prompt: 'Considere sen 45° = 0,7. Na figura, o lado dado mede 20 m. Qual é o valor de x?',
    figure: tri('C', 'A', 'B', '45°', { hyp: '20 m', opp: 'x' }, { rotation: 1 }),
    correct: '14 m',
    wrong: [['28,6 m', 'razao-invertida'], ['20,7 m', 'erro-calculo'], ['20 m', 'tangente-indevida']],
    explanation: 'x é o cateto oposto e 20 é a hipotenusa: sen 45° = x/20. Logo x = 20 · 0,7 = 14 m.',
  },
  {
    id: 'n2-05', level: 2, category: 'cosseno', concept: 'montar-relacao', pos: 3,
    prompt: 'Considere cos 30° = 0,9. Na figura, o lado dado mede 20 cm. Qual é o valor de x?',
    figure: tri('C', 'A', 'B', '30°', { hyp: '20 cm', adj: 'x' }),
    correct: '18 cm',
    wrong: [['22,2 cm', 'razao-invertida'], ['10 cm', 'troca-seno-cosseno'], ['12 cm', 'tangente-indevida']],
    explanation: 'x é o cateto adjacente e 20 é a hipotenusa: cos 30° = x/20. Logo x = 20 · 0,9 = 18 cm.',
  },
  {
    id: 'n2-06', level: 2, category: 'seno', concept: 'calculo', pos: 1,
    prompt: 'Considere sen 30° = 0,5. Na figura, o lado dado mede 6 cm. Qual é o valor de x?',
    figure: tri('C', 'A', 'B', '30°', { hyp: 'x', opp: '6 cm' }, { mirror: true }),
    correct: '12 cm',
    wrong: [['3 cm', 'razao-invertida'], ['5,5 cm', 'erro-calculo'], ['6,7 cm', 'troca-seno-cosseno']],
    explanation: 'Agora a incógnita é a hipotenusa: sen 30° = 6/x. Então 0,5 · x = 6 e x = 6 ÷ 0,5 = 12 cm.',
  },
  {
    id: 'n2-07', level: 2, category: 'tangente', concept: 'montar-relacao', pos: 0,
    prompt: 'Considere tg 30° = 0,6. Na figura, o lado dado mede 9 m. Qual é o valor de x?',
    figure: tri('C', 'A', 'B', '30°', { opp: '9 m', adj: 'x' }, { rotation: 2 }),
    correct: '15 m',
    wrong: [['5,4 m', 'razao-invertida'], ['9,6 m', 'erro-calculo'], ['18 m', 'troca-seno-cosseno']],
    explanation: 'x é o cateto adjacente: tg 30° = 9/x. Então 0,6 · x = 9 e x = 9 ÷ 0,6 = 15 m.',
  },
  {
    id: 'n2-08', level: 2, category: 'cosseno', concept: 'calculo', pos: 2,
    prompt: 'Considere cos 60° = 0,5. Na figura, o lado dado mede 7 cm. Qual é o valor de x?',
    figure: tri('C', 'A', 'B', '60°', { hyp: 'x', adj: '7 cm' }),
    correct: '14 cm',
    wrong: [['3,5 cm', 'razao-invertida'], ['6,5 cm', 'erro-calculo'], ['7,8 cm', 'troca-seno-cosseno']],
    explanation: 'A incógnita é a hipotenusa: cos 60° = 7/x. Então 0,5 · x = 7 e x = 7 ÷ 0,5 = 14 cm.',
  },
  {
    id: 'n2-09', level: 2, category: 'seno', concept: 'montar-relacao', pos: 1,
    prompt: 'Considere sen 60° = 0,9. Na figura, o lado dado mede 27 m. Qual é o valor de x?',
    figure: tri('C', 'A', 'B', '60°', { hyp: 'x', opp: '27 m' }, { rotation: 3 }),
    correct: '30 m',
    wrong: [['24,3 m', 'razao-invertida'], ['27,9 m', 'erro-calculo'], ['13,5 m', 'troca-seno-cosseno']],
    explanation: 'A incógnita é a hipotenusa: sen 60° = 27/x. Então 0,9 · x = 27 e x = 27 ÷ 0,9 = 30 m.',
  },
  {
    id: 'n2-10', level: 2, category: 'cosseno', concept: 'calculo', pos: 3,
    prompt: 'Considere cos 30° = 0,9. Na figura, o lado dado mede 8 cm. Qual é o valor de x?',
    figure: tri('C', 'A', 'B', '30°', { hyp: '8 cm', adj: 'x' }, { mirror: true, rotation: 1 }),
    correct: '7,2 cm',
    wrong: [['4 cm', 'troca-seno-cosseno'], ['8,9 cm', 'razao-invertida'], ['4,8 cm', 'tangente-indevida']],
    explanation: 'x é o cateto adjacente e 8 é a hipotenusa: cos 30° = x/8. Logo x = 8 · 0,9 = 7,2 cm.',
  },

  // ───────────── Nível 3 — Problemas contextualizados ─────────────
  {
    id: 'n3-01', level: 3, category: 'tangente', concept: 'contexto', pos: 3,
    prompt: 'Quando os raios solares formam 45° com o solo, a sombra de um prédio mede 30 m. Qual é a altura do prédio? (Use tg 45° = 1,0.)',
    figure: tri('C', 'A', 'B', '45°', { adj: '30 m', opp: 'h' }),
    correct: '30 m',
    wrong: [['21 m', 'troca-seno-cosseno'], ['42,9 m', 'razao-invertida'], ['15 m', 'erro-calculo']],
    explanation: 'Altura e sombra são os catetos: tg 45° = h/30. Logo h = 30 · 1,0 = 30 m.',
  },
  {
    id: 'n3-02', level: 3, category: 'seno', concept: 'contexto', pos: 0,
    prompt: 'Uma escada de 6 m está apoiada em uma parede e forma 60° com o chão. A que altura da parede a escada toca? (Use sen 60° = 0,9.)',
    figure: tri('C', 'A', 'B', '60°', { hyp: '6 m', opp: 'h' }, { mirror: true }),
    correct: '5,4 m',
    wrong: [['3 m', 'troca-seno-cosseno'], ['6,7 m', 'razao-invertida'], ['10,2 m', 'tangente-indevida']],
    explanation: 'A escada é a hipotenusa e a altura é o cateto oposto ao ângulo: sen 60° = h/6. Logo h = 6 · 0,9 = 5,4 m.',
  },
  {
    id: 'n3-03', level: 3, category: 'cosseno', concept: 'contexto', pos: 2,
    prompt: 'Uma rampa de 5 m de comprimento forma 30° com o solo. Qual é a distância horizontal que ela cobre no chão? (Use cos 30° = 0,9.)',
    figure: tri('C', 'A', 'B', '30°', { hyp: '5 m', adj: 'x' }),
    correct: '4,5 m',
    wrong: [['2,5 m', 'troca-seno-cosseno'], ['5,6 m', 'razao-invertida'], ['3 m', 'tangente-indevida']],
    explanation: 'A rampa é a hipotenusa e a distância no chão é o cateto adjacente: cos 30° = x/5. Logo x = 5 · 0,9 = 4,5 m.',
  },
  {
    id: 'n3-04', level: 3, category: 'cosseno', concept: 'escolha-razao', pos: 1,
    prompt: 'Um cabo de aço de 10 m liga o topo de um poste ao solo e forma 60° com o chão. Qual razão permite achar a distância x da base do poste ao ponto de fixação, e qual é essa distância? (Use cos 60° = 0,5.)',
    figure: tri('C', 'A', 'B', '60°', { hyp: '10 m', adj: 'x' }, { rotation: 2 }),
    correct: 'Cosseno: x = 5 m',
    wrong: [['Seno: x = 9 m', 'troca-seno-cosseno'], ['Cosseno: x = 20 m', 'razao-invertida'], ['Tangente: x = 17 m', 'tangente-indevida']],
    explanation: 'O cabo é a hipotenusa e x é o cateto adjacente ao ângulo de 60°. Usa-se o cosseno: x = 10 · 0,5 = 5 m.',
  },
  {
    id: 'n3-05', level: 3, category: 'tangente', concept: 'escolha-razao', pos: 0,
    prompt: 'A 20 m do pé de uma árvore, uma pessoa vê o topo sob ângulo de elevação de 30°. Desprezando a altura da pessoa, qual razão usar e qual é a altura da árvore? (Use tg 30° = 0,6.)',
    figure: tri('C', 'A', 'B', '30°', { adj: '20 m', opp: 'h' }),
    correct: 'Tangente: h = 12 m',
    wrong: [['Seno: h = 10 m', 'confusao-hipotenusa'], ['Tangente: h = 33,3 m', 'razao-invertida'], ['Cosseno: h = 18 m', 'troca-seno-cosseno']],
    explanation: 'Os dois lados envolvidos são catetos: a distância (adjacente) e a altura (oposto). Usa-se a tangente: h = 20 · 0,6 = 12 m.',
  },
  {
    id: 'n3-06', level: 3, category: 'seno', concept: 'contexto', pos: 3,
    prompt: 'Uma pipa está presa a uma linha esticada de 50 m, que forma 45° com o solo. Qual é a altura da pipa em relação ao solo? (Use sen 45° = 0,7.)',
    figure: tri('C', 'A', 'B', '45°', { hyp: '50 m', opp: 'h' }, { mirror: true, rotation: 1 }),
    correct: '35 m',
    wrong: [['71,4 m', 'razao-invertida'], ['50 m', 'tangente-indevida'], ['25 m', 'erro-calculo']],
    explanation: 'A linha é a hipotenusa e a altura é o cateto oposto: sen 45° = h/50. Logo h = 50 · 0,7 = 35 m.',
  },
  {
    id: 'n3-07', level: 3, category: 'tangente', concept: 'contexto', pos: 1,
    prompt: 'Um observador a 12 m da base de uma torre vê o topo sob ângulo de elevação de 60°. Qual é a altura da torre, desprezando a altura do observador? (Use tg 60° = 1,7.)',
    figure: tri('C', 'A', 'B', '60°', { adj: '12 m', opp: 'h' }),
    correct: '20,4 m',
    wrong: [['7,1 m', 'razao-invertida'], ['10,8 m', 'confusao-hipotenusa'], ['13,7 m', 'erro-calculo']],
    explanation: 'Distância e altura são os catetos: tg 60° = h/12. Logo h = 12 · 1,7 = 20,4 m.',
  },
  {
    id: 'n3-08', level: 3, category: 'seno', concept: 'escolha-razao', pos: 2,
    prompt: 'Uma rampa de acesso deve vencer um desnível de 1,5 m e formar 30° com o solo. Qual razão permite achar o comprimento x da rampa, e qual é esse comprimento? (Use sen 30° = 0,5.)',
    figure: tri('C', 'A', 'B', '30°', { hyp: 'x', opp: '1,5 m' }, { rotation: 3 }),
    correct: 'Seno: x = 3 m',
    wrong: [['Seno: x = 0,75 m', 'razao-invertida'], ['Cosseno: x = 1,35 m', 'troca-seno-cosseno'], ['Tangente: x = 0,9 m', 'tangente-indevida']],
    explanation: 'O desnível é o cateto oposto e a rampa é a hipotenusa. Usa-se o seno: sen 30° = 1,5/x, então x = 1,5 ÷ 0,5 = 3 m.',
  },
  {
    id: 'n3-09', level: 3, category: 'cosseno', concept: 'contexto', pos: 0,
    prompt: 'Um cabo é fixado no solo a 9 m da base de uma antena vertical e forma 60° com o solo. Qual é o comprimento do cabo? (Use cos 60° = 0,5.)',
    figure: tri('C', 'A', 'B', '60°', { adj: '9 m', hyp: 'x' }, { mirror: true }),
    correct: '18 m',
    wrong: [['4,5 m', 'razao-invertida'], ['15,3 m', 'tangente-indevida'], ['10 m', 'troca-seno-cosseno']],
    explanation: 'A distância é o cateto adjacente e o cabo é a hipotenusa: cos 60° = 9/x. Então x = 9 ÷ 0,5 = 18 m.',
  },
  {
    id: 'n3-10', level: 3, category: 'seno', concept: 'contexto', pos: 3,
    prompt: 'Um avião decola e percorre 800 m em linha reta, formando 30° com a pista. Qual altura ele atingiu? (Use sen 30° = 0,5.)',
    figure: tri('C', 'A', 'B', '30°', { hyp: '800 m', opp: 'h' }),
    correct: '400 m',
    wrong: [['1.600 m', 'razao-invertida'], ['720 m', 'troca-seno-cosseno'], ['480 m', 'tangente-indevida']],
    explanation: 'O percurso é a hipotenusa e a altura é o cateto oposto: sen 30° = h/800. Logo h = 800 · 0,5 = 400 m.',
  },
]

export function getDefaultQuestions(): Question[] {
  return SPECS.map(build)
}

export const DEFAULT_QUESTION_IDS = SPECS.map((s) => s.id)
