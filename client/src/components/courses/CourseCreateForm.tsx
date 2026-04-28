import {
  buttonPrimaryClass,
  fieldClass,
} from './courseFormClasses'

type CourseCreateFormProps = {
  title: string
  group: string
  description: string
  imageUrl: string
  isCreating: boolean
  onChangeTitle: (v: string) => void
  onChangeGroup: (v: string) => void
  onChangeDescription: (v: string) => void
  onChangeImageUrl: (v: string) => void
  onSubmit: () => void
}

export function CourseCreateForm({
  title,
  group,
  description,
  imageUrl,
  isCreating,
  onChangeTitle,
  onChangeGroup,
  onChangeDescription,
  onChangeImageUrl,
  onSubmit,
}: CourseCreateFormProps) {
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-gray-900">Create course</h2>

      <div className="mt-4 grid gap-3">
        <input
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="Course title"
          className={fieldClass}
        />

        <input
          value={group}
          onChange={(e) => onChangeGroup(e.target.value)}
          placeholder="Group, e.g. CS-21"
          className={fieldClass}
        />

        <textarea
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder="Course description"
          className={fieldClass}
        />

        <input
          value={imageUrl}
          onChange={(e) => onChangeImageUrl(e.target.value)}
          placeholder="Image URL optional"
          className={fieldClass}
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={isCreating}
          className={`${buttonPrimaryClass} disabled:opacity-50`}
        >
          {isCreating ? 'Creating...' : 'Create course'}
        </button>
      </div>
    </div>
  )
}
