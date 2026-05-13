import type { RefObject } from 'react'
import { fileToDataUrl } from '../../utils/fileToDataUrl'
import { PlusIcon } from 'lucide-react'

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
    <div className="border-t border-solid border-gray-100 bg-white p-3">
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedFiles.map((file) => (
            <div
              key={file.url}
              className="rounded-2xl border border-solid border-gray-200 bg-[#f8fafc] p-2"
            >
              {file.type.startsWith('image/') ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-24 w-24 rounded-xl object-cover"
                />
              ) : (
                <p className="max-w-40 truncate text-sm text-gray-600">
                  {file.name}
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  onFilesChange(
                    selectedFiles.filter((item) => item.url !== file.url),
                  )
                }
                className="mt-1 text-xs text-red-600"
              >
                Прибрати
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-solid border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
          <PlusIcon className="h-4 w-4" />
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
            className="hidden"
          />
        </label>

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
          className="max-h-[120px] flex-1 resize-none overflow-y-auto rounded-xl border border-solid border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0b67a3] focus:ring-4 focus:ring-[#0b67a3]/10"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={isSending || (!value.trim() && selectedFiles.length === 0)}
          className="h-11 shrink-0 rounded-xl bg-[#0b67a3] px-4 text-sm font-semibold text-white hover:bg-[#095985] disabled:opacity-50"
        >
          {isSending ? '...' : 'Надіслати'}
        </button>
      </div>
    </div>
  )
}