import type { Category, Concept, ErrorTag, Level } from '../types'

export const CATEGORY_LABEL: Record<Category, string> = {
  lados: 'Identificação de lados',
  seno: 'Seno',
  cosseno: 'Cosseno',
  tangente: 'Tangente',
}
export const CATEGORY_ORDER: Category[] = ['seno', 'cosseno', 'tangente', 'lados']

export const LEVEL_LABEL: Record<Level, string> = {
  1: 'Nível 1 — Fácil',
  2: 'Nível 2 — Médio',
  3: 'Nível 3 — Problemas',
}

export const CONCEPT_LABEL: Record<Concept, string> = {
  hipotenusa: 'Identificar a hipotenusa',
  'oposto-adjacente': 'Distinguir cateto oposto e adjacente ao ângulo',
  'escolha-razao': 'Escolher a razão trigonométrica adequada',
  'montar-relacao': 'Montar a relação entre os lados',
  calculo: 'Calcular o lado desconhecido',
  contexto: 'Interpretar a situação-problema e modelar o triângulo',
}

/** Textos de retomada. Sempre em linguagem de indício, nunca de diagnóstico. */
export const CONCEPT_ADVICE: Record<Concept, string> = {
  hipotenusa: 'Há indício de dificuldade em reconhecer a hipotenusa. Sugere-se retomar que ela é o lado oposto ao ângulo reto.',
  'oposto-adjacente': 'Recomenda-se retomar a relação entre cateto oposto e cateto adjacente, que muda conforme o ângulo escolhido.',
  'escolha-razao': 'A turma apresentou possível dificuldade em decidir qual razão (seno, cosseno ou tangente) usar. Vale retomar: "quais lados aparecem no problema?"',
  'montar-relacao': 'Observou-se indício de dificuldade em montar a razão com numerador e denominador corretos.',
  calculo: 'Há indício de dificuldade na etapa de cálculo (multiplicar ou dividir pelo valor da razão). Sugere-se retomar quando multiplicar e quando dividir.',
  contexto: 'Possível dificuldade em transformar a situação-problema em um triângulo retângulo. Sugere-se retomar o desenho da situação.',
}

export const CATEGORY_ADVICE: Partial<Record<Category, string>> = {
  tangente: 'A turma apresentou indício de maior dificuldade em identificar quando utilizar a tangente.',
  seno: 'Observou-se possível dificuldade em reconhecer quando o seno é a razão adequada (relação entre cateto oposto e hipotenusa).',
  cosseno: 'Observou-se possível dificuldade em reconhecer quando o cosseno é a razão adequada (relação entre cateto adjacente e hipotenusa).',
  lados: 'Há indício de dificuldade em nomear os lados do triângulo em relação ao ângulo destacado.',
}

export const ERROR_TAG_LABEL: Record<ErrorTag, string> = {
  'troca-seno-cosseno': 'Troca entre seno e cosseno',
  'tangente-indevida': 'Uso da tangente quando outra razão era adequada',
  'razao-invertida': 'Razão invertida (numerador e denominador trocados)',
  'confusao-hipotenusa': 'Confusão ao identificar a hipotenusa',
  'troca-oposto-adjacente': 'Troca entre cateto oposto e adjacente',
  'erro-calculo': 'Erro de multiplicação ou divisão',
}

export const MEDIATION_QUESTIONS = [
  'Quais lados aparecem neste problema?',
  'Existe hipotenusa entre as medidas utilizadas?',
  'Qual razão relaciona esses dois lados?',
  'Por que seno seria adequado?',
  'Por que tangente seria mais adequada?',
  'O que aconteceria se invertêssemos a razão?',
  'Outra equipe resolveu de maneira diferente?',
]
