import type { RefObject } from 'react'
import toast from 'react-hot-toast'
import { fileToDataUrl } from '../../utils/fileToDataUrl'
import {
  getFileSizeLimitMessage,
  isDataUrlWithinSizeLimit,
  isFileWithinSizeLimit,
} from '../../utils/fileValidation'
import { MAX_FILE_SIZE_LABEL } from '../../config/uploads'
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
  isBlocked?: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
  selectedFiles: Attachment[]
  onFilesChange: (files: Attachment[]) => void
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  isSending,
  isBlocked = false,
  textareaRef,
  selectedFiles,
  onFilesChange,
}: ChatComposerProps) {
  const composerDisabled = isBlocked === true

  const adjustHeight = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const maxHeight = LINE_HEIGHT_PX * MAX_ROWS
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
  }

  return (
    <div className="border-t border-solid border-gray-100 bg-white p-3">
      {composerDisabled && (
        <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Ваш акаунт заблоковано. Ви не можете надсилати повідомлення.
        </p>
      )}

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
        <label
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-solid border-gray-200 bg-white text-gray-600 ${
            composerDisabled
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:bg-gray-50'
          }`}
        >
          <PlusIcon className="h-4 w-4" />
          <input
            type="file"
            multiple
            disabled={composerDisabled}
            onChange={async (e) => {
              if (composerDisabled) return

              const files = Array.from(e.target.files ?? [])
              const validFiles = files.filter((file) => {
                if (!isFileWithinSizeLimit(file)) {
                  toast.error(getFileSizeLimitMessage(file.name))
                  return false
                }

                return true
              })

              if (validFiles.length === 0) {
                e.target.value = ''
                return
              }

              try {
                const attachments = await Promise.all(
                  validFiles.map(async (file) => {
                    const url = await fileToDataUrl(file)

                    if (!isDataUrlWithinSizeLimit(url)) {
                      throw new Error(getFileSizeLimitMessage(file.name))
                    }

                    return {
                      url,
                      name: file.name,
                      type: file.type || 'application/octet-stream',
                    }
                  }),
                )

                onFilesChange([...selectedFiles, ...attachments])
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Не вдалося прочитати файл',
                )
              } finally {
                e.target.value = ''
              }
            }}
            className="hidden"
          />
        </label>

        <textarea
          ref={textareaRef}
          value={value}
          disabled={composerDisabled}
          onChange={(e) => {
            if (composerDisabled) return
            onChange(e.target.value)
            requestAnimationFrame(adjustHeight)
          }}
          onKeyDown={(e) => {
            if (composerDisabled) return
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          placeholder={
            composerDisabled
              ? 'Надсилання повідомлень недоступне'
              : 'Напишіть повідомлення...'
          }
          rows={1}
          className="max-h-[120px] flex-1 resize-none overflow-y-auto rounded-xl border border-solid border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0b67a3] focus:ring-4 focus:ring-[#0b67a3]/10"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={
            composerDisabled ||
            isSending ||
            (!value.trim() && selectedFiles.length === 0)
          }
          className="h-11 shrink-0 rounded-xl bg-[#0b67a3] px-4 text-sm font-semibold text-white hover:bg-[#095985] disabled:opacity-50"
        >
          {isSending ? '...' : 'Надіслати'}
        </button>
      </div>

      {!composerDisabled && (
        <p className="mt-2 text-xs text-gray-400">
          Максимальний розмір одного файлу: {MAX_FILE_SIZE_LABEL}
        </p>
      )}
    </div>
  )
}
