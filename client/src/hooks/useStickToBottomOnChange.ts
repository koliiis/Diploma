import { type MutableRefObject, type RefObject, useEffect } from 'react'

/**
 * When `trigger` (e.g. message count) changes, scrolls `container` to the bottom
 * if `allowScrollRef.current` is true; then resets the flag to true.
 */
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
