import { fieldClass } from './courseFormClasses'

type CourseListFiltersProps = {
  searchQuery: string
  showOnlyMine: boolean
  onSearchChange: (v: string) => void
  onShowOnlyMineChange: (v: boolean) => void
  showMyGroupOnly: boolean
  onShowMyGroupOnlyChange: (v: boolean) => void
  canFilterByGroup: boolean
}

export function CourseListFilters({
  searchQuery,
  showOnlyMine,
  onSearchChange,
  onShowOnlyMineChange,
  showMyGroupOnly,
  onShowMyGroupOnlyChange,
  canFilterByGroup,
}: CourseListFiltersProps) {
  return (
    <div className="mt-6 rounded-[22px] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Пошук за назвою курсу чи групою…"
          className={`flex-1 ${fieldClass}`}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showOnlyMine}
              onChange={(e) => onShowOnlyMineChange(e.target.checked)}
            />
            Мої курси
          </label>

          {canFilterByGroup && (
            <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showMyGroupOnly}
                onChange={(e) => onShowMyGroupOnlyChange(e.target.checked)}
              />
              Курси моєї групи
            </label>
          )}
        </div>
      </div>
    </div>
  )
}
