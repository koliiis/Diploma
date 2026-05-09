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
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-gray-900">Новий курс</h2>

      <div className="mt-4 grid gap-3">
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

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <textarea
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder="Опис курсу"
          className={fieldClass}
        />

        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return

            const dataUrl = await fileToDataUrl(file)
            onChangeImageUrl(dataUrl)
          }}
          className={fieldClass}
        />

        <Avatar
          fullName={title}
          avatarUrl={imageUrl}
        />

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
