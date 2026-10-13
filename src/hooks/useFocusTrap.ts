import { useEffect, type RefObject } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const stack: HTMLElement[] = []

/**
 * Mantém o foco do teclado dentro de um diálogo e o devolve ao fechar.
 * Com diálogos empilhados, só o mais recente captura o Tab.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active = true, onEscape?: () => void) {
  useEffect(() => {
    const el = ref.current
    if (!el || !active) return
    const previous = document.activeElement as HTMLElement | null
    stack.push(el)
    const first = el.querySelector<HTMLElement>('[data-autofocus]') ?? el.querySelector<HTMLElement>(FOCUSABLE) ?? el
    first.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== el) return
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
        return
      }
      if (e.key !== 'Tab') return
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement)
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === firstItem || !el.contains(document.activeElement))) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && (document.activeElement === lastItem || !el.contains(document.activeElement))) {
        e.preventDefault()
        firstItem.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      const i = stack.indexOf(el)
      if (i >= 0) stack.splice(i, 1)
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, active])
}
