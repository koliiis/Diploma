import { useEffect, type RefObject } from 'react'

export function useStickToBottomOnChange(
  scrollRef: RefObject<HTMLDivElement | null>,
  shouldScrollToBottomRef: RefObject<boolean>,
  isUserNearBottomRef: RefObject<boolean>,
  dependency: unknown,
) {
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    if (shouldScrollToBottomRef.current || isUserNearBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }

    shouldScrollToBottomRef.current = false
  }, [scrollRef, shouldScrollToBottomRef, isUserNearBottomRef, dependency])
}