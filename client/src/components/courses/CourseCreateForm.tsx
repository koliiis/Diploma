import {
  buttonPrimaryClass,
  fieldClass,
} from './courseFormClasses'
import { fileToDataUrl } from '../../utils/fileToDataUrl'
import { Avatar } from '../ui/Avatar'

type CourseCreateFormProps = {
  title: string
  groupsInput: string
  description: string
  imageUrl: string
  isCreating: boolean
  error: string | null
  onChangeTitle: (v: string) => void
  onChangeGroup: (v: string) => void
  onChangeDescription: (v: string) => void
  onChangeImageUrl: (v: string) => void
  onSubmit: () => void
}

export function CourseCreateForm({
  title,
  groupsInput,
  description,
  imageUrl,
  isCreating,
  error,
  onChangeTitle,
  onChangeGroup,
  onChangeDescription,
  onChangeImageUrl,
  onSubmit,
}: CourseCreateFormProps) {
  return (
    <div className="mt-6 rounded-[24px] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#10182f]">Новий курс</h2>
          <p className="mt-1 text-sm text-gray-500">
            Заповніть інформацію про курс і групи, для яких він доступний.
          </p>
        </div>

        <Avatar fullName={title || 'Курс'} avatarUrl={imageUrl} />
      </div>

      <div className="mt-5 grid gap-4">
        <input
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="Назва курсу"
          className={fieldClass}
        />

        <input
          value={groupsInput}
          onChange={(e) => onChangeGroup(e.target.value)}
          placeholder="Групи, наприклад ТР-25, КН-21"
          className={fieldClass}
        />

        <textarea
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder="Опис курсу"
          className={`${fieldClass} min-h-28 resize-none`}
        />

        <label className="rounded-xl border border-dashed border-solid border-gray-300 bg-[#f8fafc] p-4 text-sm text-gray-600">
          <span className="font-semibold text-[#10182f]">
            Обрати зображення курсу
          </span>
          <span className="mt-1 block text-xs text-gray-500">
            PNG або JPG. Зображення буде відображатися в курсі та чаті.
          </span>

          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return

              const dataUrl = await fileToDataUrl(file)
              onChangeImageUrl(dataUrl)
            }}
            className="mt-3 block w-full text-sm"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={isCreating}
          className={`${buttonPrimaryClass} disabled:opacity-50`}
        >
          {isCreating ? 'Створення...' : 'Створити курс'}
        </button>
      </div>
    </div>
  )
}
