import { fieldClass } from './courseFormClasses'

type CourseListFiltersProps = {
  searchQuery: string
  showOnlyMine: boolean
  onSearchChange: (v: string) => void
  onShowOnlyMineChange: (v: boolean) => void
}

export function CourseListFilters({
  searchQuery,
  showOnlyMine,
  onSearchChange,
  onShowOnlyMineChange,
}: CourseListFiltersProps) {
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by course title or group..."
          className={`flex-1 ${fieldClass}`}
        />

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showOnlyMine}
            onChange={(e) => onShowOnlyMineChange(e.target.checked)}
          />
          My courses
        </label>
      </div>
    </div>
  )
}
