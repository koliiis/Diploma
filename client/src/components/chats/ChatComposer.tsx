import type { RefObject } from 'react'

const LINE_HEIGHT_PX = 24
const MAX_ROWS = 5

type ChatComposerProps = {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  isSending: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  isSending,
  textareaRef,
}: ChatComposerProps) {
  const adjustHeight = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const maxHeight = LINE_HEIGHT_PX * MAX_ROWS
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
  }

  return (
    <div className="flex gap-2 border-t p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          requestAnimationFrame(adjustHeight)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder="Напишіть повідомлення..."
        rows={1}
        className="max-h-[120px] flex-1 resize-none overflow-y-auto rounded-lg border border-gray-300 px-4 py-2"
      />

      <button
        type="button"
        onClick={onSend}
        disabled={isSending || !value.trim()}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isSending ? 'Відправлення...' : 'Надіслати'}
      </button>
    </div>
  )
}