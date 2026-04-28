import { type MutableRefObject, type RefObject, useEffect } from 'react'

export function useStickToBottomOnChange(
  containerRef: RefObject<HTMLElement | null>,
  allowScrollRef: MutableRefObject<boolean>,
  trigger: number,
) {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (allowScrollRef.current) {
      el.scrollTop = el.scrollHeight
    }
    allowScrollRef.current = true
  }, [containerRef, allowScrollRef, trigger])
}
