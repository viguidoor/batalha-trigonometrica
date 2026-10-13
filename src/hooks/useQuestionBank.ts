import { useCallback, useState } from 'react'
import type { Question } from '../types'
import { duplicateQuestion, removeQuestion, toggleQuestion, upsertQuestion } from '../utils/questionBank'
import { loadQuestions, resetQuestions, saveQuestions } from '../utils/storage'

/** Banco de questões editável, salvo em localStorage a cada mudança. */
export function useQuestionBank() {
  const [questions, setQuestions] = useState<Question[]>(() => loadQuestions())

  const commit = useCallback((next: Question[]) => {
    setQuestions(next)
    saveQuestions(next)
  }, [])

  return {
    questions,
    save: (q: Question) => commit(upsertQuestion(questions, q)),
    remove: (id: string) => commit(removeQuestion(questions, id)),
    toggle: (id: string) => commit(toggleQuestion(questions, id)),
    duplicate: (q: Question) => commit([...questions, duplicateQuestion(q)]),
    restore: () => setQuestions(resetQuestions()),
  }
}
