import type { RefObject } from 'react'
import { fileToDataUrl } from '../../utils/fileToDataUrl'

type Attachment = {
  url: string
  name: string
  type: string
}

const LINE_HEIGHT_PX = 24
const MAX_ROWS = 5

type ChatComposerProps = {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  isSending: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
  selectedFiles: Attachment[]
  onFilesChange: (files: Attachment[]) => void
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  isSending,
  textareaRef,
  selectedFiles,
  onFilesChange,
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
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFiles.map((file) => (
            <div
              key={file.url}
              className="relative rounded-lg border border-gray-200 bg-gray-50 p-2"
            >
              {file.type.startsWith('image/') ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              ) : (
                <p className="max-w-40 truncate text-sm text-gray-600">
                  {file.name}
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  onFilesChange(selectedFiles.filter((item) => item.url !== file.url))
                }
                className="mt-1 text-xs text-red-600"
              >
                Прибрати
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        multiple
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? [])

          const attachments = await Promise.all(
            files.map(async (file) => ({
              url: await fileToDataUrl(file),
              name: file.name,
              type: file.type || 'application/octet-stream',
            })),
          )

          onFilesChange([...selectedFiles, ...attachments])

          e.target.value = ''
        }}
        className="text-sm"
      />

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
        disabled={isSending || (!value.trim() && selectedFiles.length === 0)}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isSending ? 'Відправлення...' : 'Надіслати'}
      </button>
    </div>
  )
}