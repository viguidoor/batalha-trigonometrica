import { useId, useRef, useState } from 'react'
import { CATEGORY_LABEL, CATEGORY_ORDER, CONCEPT_LABEL, LEVEL_LABEL } from '../data/labels'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { Category, Concept, Level, Question, TriangleFigure as Figure } from '../types'
import { validateQuestion } from '../utils/questionBank'
import { TriangleFigure } from './TriangleFigure'

interface Props {
  initial: Question
  onSave: (q: Question) => void
  onCancel: () => void
}

const DEFAULT_FIGURE: Figure = { kind: 'triangle', vertices: { right: 'C', angled: 'A', other: 'B' }, angleLabel: '30°', sides: {} }
const LETTERS = ['A', 'B', 'C', 'D']

function toNumber(v: string): number | undefined {
  if (v.trim() === '') return undefined
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}

export function QuestionEditor({ initial, onSave, onCancel }: Props) {
  const [q, setQ] = useState<Question>(initial)
  const [errors, setErrors] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  useFocusTrap(ref, true, onCancel)

  const patch = (p: Partial<Question>) => setQ((cur) => ({ ...cur, ...p }))
  const figure = q.figure
  const patchFigure = (p: Partial<Figure>) => setQ((cur) => ({ ...cur, figure: { ...(cur.figure ?? DEFAULT_FIGURE), ...p } }))
  const setOption = (i: number, v: string) => patch({ options: q.options.map((o, j) => (j === i ? v : o)) })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned: Question = { ...q, prompt: q.prompt.trim(), explanation: q.explanation.trim(), options: q.options.map((o) => o.trim()), custom: true }
    const problems = validateQuestion(cleaned)
    setErrors(problems)
    if (problems.length === 0) onSave(cleaned)
  }

  return (
    <div className="modal-backdrop">
      <div ref={ref} className="modal editor" role="dialog" aria-modal="true" aria-labelledby={`${id}-t`}>
        <form onSubmit={submit} noValidate>
          <h2 id={`${id}-t`}>{initial.prompt ? 'Editar questão' : 'Nova questão'}</h2>

          <div className="editor-row">
            <label className="field">
              <span>Nível</span>
              <select value={q.level} onChange={(e) => patch({ level: Number(e.target.value) as Level })}>
                {([1, 2, 3] as Level[]).map((l) => (
                  <option key={l} value={l}>{LEVEL_LABEL[l]}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Categoria (para o relatório)</span>
              <select value={q.category} onChange={(e) => patch({ category: e.target.value as Category })}>
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Habilidade principal</span>
              <select value={q.concept} onChange={(e) => patch({ concept: e.target.value as Concept })}>
                {(Object.keys(CONCEPT_LABEL) as Concept[]).map((c) => (
                  <option key={c} value={c}>{CONCEPT_LABEL[c]}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Enunciado</span>
            <textarea rows={3} value={q.prompt} onChange={(e) => patch({ prompt: e.target.value })} />
          </label>

          <fieldset className="options-editor">
            <legend>Alternativas — marque a correta</legend>
            {q.options.map((o, i) => (
              <div key={i} className="option-row">
                <label className="radio-pill">
                  <input type="radio" name={`${id}-correct`} checked={q.correctIndex === i} onChange={() => patch({ correctIndex: i })} aria-label={`Alternativa ${LETTERS[i]} é a correta`} />
                  <span aria-hidden="true">{LETTERS[i]}</span>
                </label>
                <input type="text" value={o} onChange={(e) => setOption(i, e.target.value)} aria-label={`Texto da alternativa ${LETTERS[i]}`} />
              </div>
            ))}
          </fieldset>

          <label className="field">
            <span>Explicação curta (aparece depois da resposta)</span>
            <textarea rows={2} value={q.explanation} onChange={(e) => patch({ explanation: e.target.value })} />
          </label>

          <div className="editor-row">
            <label className="field">
              <span>Tempo próprio (segundos) — vazio = tempo da partida</span>
              <input type="number" min={5} max={600} value={q.timeSeconds ?? ''} onChange={(e) => patch({ timeSeconds: toNumber(e.target.value) })} />
            </label>
            <label className="field">
              <span>Pontuação fixa — vazio = valor da casa</span>
              <input type="number" min={0} max={5000} step={50} value={q.points ?? ''} onChange={(e) => patch({ points: toNumber(e.target.value) })} />
            </label>
            <label className="check">
              <input type="checkbox" checked={q.active} onChange={(e) => patch({ active: e.target.checked })} />
              <span>Questão ativa</span>
            </label>
          </div>

          <label className="check">
            <input type="checkbox" checked={!!figure} onChange={(e) => setQ((cur) => ({ ...cur, figure: e.target.checked ? DEFAULT_FIGURE : undefined }))} />
            <span>Incluir triângulo retângulo (SVG)</span>
          </label>
          {figure && (
            <div className="figure-editor">
              <div className="figure-fields">
                <div className="editor-row">
                  {(['right', 'angled', 'other'] as const).map((k) => (
                    <label key={k} className="field">
                      <span>{k === 'right' ? 'Vértice do ângulo reto' : k === 'angled' ? 'Vértice do ângulo destacado' : 'Terceiro vértice'}</span>
                      <input type="text" maxLength={2} value={figure.vertices[k]} onChange={(e) => patchFigure({ vertices: { ...figure.vertices, [k]: e.target.value } })} />
                    </label>
                  ))}
                </div>
                <div className="editor-row">
                  <label className="field">
                    <span>Ângulo destacado (ex.: 30° ou α)</span>
                    <input type="text" maxLength={4} value={figure.angleLabel} onChange={(e) => patchFigure({ angleLabel: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Medida do lado maior</span>
                    <input type="text" value={figure.sides?.hyp ?? ''} onChange={(e) => patchFigure({ sides: { ...figure.sides, hyp: e.target.value || undefined } })} />
                  </label>
                  <label className="field">
                    <span>Medida do lado que toca o ângulo destacado e o reto</span>
                    <input type="text" value={figure.sides?.adj ?? ''} onChange={(e) => patchFigure({ sides: { ...figure.sides, adj: e.target.value || undefined } })} />
                  </label>
                  <label className="field">
                    <span>Medida do lado que fica à frente do ângulo destacado</span>
                    <input type="text" value={figure.sides?.opp ?? ''} onChange={(e) => patchFigure({ sides: { ...figure.sides, opp: e.target.value || undefined } })} />
                  </label>
                </div>
                <div className="editor-row">
                  <label className="field">
                    <span>Rotação</span>
                    <select value={figure.rotation ?? 0} onChange={(e) => patchFigure({ rotation: Number(e.target.value) as 0 | 1 | 2 | 3 })}>
                      <option value={0}>0°</option>
                      <option value={1}>90°</option>
                      <option value={2}>180°</option>
                      <option value={3}>270°</option>
                    </select>
                  </label>
                  <label className="check">
                    <input type="checkbox" checked={!!figure.mirror} onChange={(e) => patchFigure({ mirror: e.target.checked })} />
                    <span>Espelhar</span>
                  </label>
                </div>
              </div>
              <div className="figure-preview">
                <TriangleFigure figure={figure} />
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <ul className="form-errors" role="alert">
              {errors.map((er) => (
                <li key={er}>{er}</li>
              ))}
            </ul>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar questão</button>
          </div>
        </form>
      </div>
    </div>
  )
}
