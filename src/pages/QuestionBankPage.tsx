import { useMemo, useState } from 'react'
import type { Page } from '../App'
import { Modal } from '../components/Modal'
import { QuestionEditor } from '../components/QuestionEditor'
import { CATEGORY_LABEL, LEVEL_LABEL } from '../data/labels'
import type { useQuestionBank } from '../hooks/useQuestionBank'
import type { Level, Question } from '../types'
import { blankQuestion } from '../utils/questionBank'

type Bank = ReturnType<typeof useQuestionBank>
type Confirm = { kind: 'delete'; q: Question } | { kind: 'restore' } | null

export function QuestionBankPage({ bank, onNavigate }: { bank: Bank; onNavigate: (page: Page) => void }) {
  const [level, setLevel] = useState<Level | 0>(0)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Question | null>(null)
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [preview, setPreview] = useState<Question | null>(null)

  const list = useMemo(() => {
    const term = search.trim().toLowerCase()
    return bank.questions.filter((q) => (level === 0 || q.level === level) && (!term || q.prompt.toLowerCase().includes(term)))
  }, [bank.questions, level, search])

  const activeCount = bank.questions.filter((q) => q.active).length

  return (
    <main className="page bank" id="main">
      <header className="page-head">
        <div>
          <h1>Banco de questões</h1>
          <p className="muted">
            {bank.questions.length} questões · {activeCount} ativas · alterações ficam salvas neste navegador
          </p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn btn-primary" onClick={() => setEditing(blankQuestion(level === 0 ? 1 : level))}>
            + Nova questão
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setConfirm({ kind: 'restore' })}>
            ↺ Restaurar questões originais
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => onNavigate('home')}>
            ← Início
          </button>
        </div>
      </header>

      <div className="bank-filters">
        <fieldset className="seg">
          <legend>Filtrar por nível</legend>
          {([0, 1, 2, 3] as const).map((l) => (
            <label key={l} className={level === l ? 'seg-item is-on' : 'seg-item'}>
              <input type="radio" name="level" checked={level === l} onChange={() => setLevel(l)} />
              {l === 0 ? 'Todos' : `Nível ${l}`}
            </label>
          ))}
        </fieldset>
        <label className="field search">
          <span>Buscar no enunciado</span>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      <div className="table-wrap">
        <table className="table bank-table">
          <thead>
            <tr>
              <th scope="col">Ativa</th>
              <th scope="col">Nível</th>
              <th scope="col">Categoria</th>
              <th scope="col">Enunciado</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map((q) => (
              <tr key={q.id} className={q.active ? '' : 'is-off'}>
                <td>
                  <label className="switch">
                    <input type="checkbox" checked={q.active} onChange={() => bank.toggle(q.id)} aria-label={`${q.active ? 'Desativar' : 'Ativar'} questão: ${q.prompt.slice(0, 40)}`} />
                    <span>{q.active ? 'Sim' : 'Não'}</span>
                  </label>
                </td>
                <td>{q.level}</td>
                <td>{CATEGORY_LABEL[q.category]}</td>
                <td className="prompt-cell">
                  {q.prompt}
                  {q.custom && <span className="chip chip-small">personalizada</span>}
                  {q.figure && <span className="chip chip-small">com figura</span>}
                </td>
                <td className="row-actions">
                  <button type="button" className="btn btn-small btn-ghost" onClick={() => setPreview(q)}>Ver</button>
                  <button type="button" className="btn btn-small btn-ghost" onClick={() => setEditing(q)}>Editar</button>
                  <button type="button" className="btn btn-small btn-ghost" onClick={() => bank.duplicate(q)}>Duplicar</button>
                  <button type="button" className="btn btn-small btn-danger" onClick={() => setConfirm({ kind: 'delete', q })}>Excluir</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">Nenhuma questão encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <QuestionEditor
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={(q) => {
            bank.save(q)
            setEditing(null)
          }}
        />
      )}

      {preview && (
        <Modal title={`${LEVEL_LABEL[preview.level]} · ${CATEGORY_LABEL[preview.category]}`} onClose={() => setPreview(null)} actions={<button type="button" className="btn btn-primary" onClick={() => setPreview(null)}>Fechar</button>}>
          <p className="preview-prompt">{preview.prompt}</p>
          <ol type="A" className="preview-options">
            {preview.options.map((o, i) => (
              <li key={i} className={i === preview.correctIndex ? 'is-correct' : ''}>
                {o} {i === preview.correctIndex && <strong>(correta)</strong>}
              </li>
            ))}
          </ol>
          <p className="muted">{preview.explanation}</p>
        </Modal>
      )}

      {confirm?.kind === 'delete' && (
        <Modal
          title="Excluir questão?"
          onClose={() => setConfirm(null)}
          actions={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm(null)} data-autofocus>Cancelar</button>
              <button type="button" className="btn btn-danger" onClick={() => { bank.remove(confirm.q.id); setConfirm(null) }}>Excluir</button>
            </>
          }
        >
          <p>{confirm.q.prompt}</p>
          <p className="muted">Você pode recuperar as questões originais a qualquer momento em “Restaurar questões originais”.</p>
        </Modal>
      )}

      {confirm?.kind === 'restore' && (
        <Modal
          title="Restaurar questões originais?"
          onClose={() => setConfirm(null)}
          actions={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm(null)} data-autofocus>Cancelar</button>
              <button type="button" className="btn btn-danger" onClick={() => { bank.restore(); setConfirm(null) }}>Restaurar</button>
            </>
          }
        >
          <p>O banco volta às 30 questões originais. As questões criadas ou editadas por você serão removidas.</p>
        </Modal>
      )}
    </main>
  )
}
