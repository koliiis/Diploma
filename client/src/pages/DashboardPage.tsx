export function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Dashboard
      </h1>

      <p className="mt-8px text-gray-600">
        Вітаємо в системі CampusTalk
      </p>

      <div className="mt-24px grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-16px">
          <h3 className="font-medium text-gray-900">
            Courses
          </h3>
          <p className="mt-4px text-sm text-gray-600">
            Перегляд доступних курсів
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-16px">
          <h3 className="font-medium text-gray-900">
            Chats
          </h3>
          <p className="mt-4px text-sm text-gray-600">
            Перехід до обговорень
          </p>
        </div>
      </div>
    </div>
  )
}