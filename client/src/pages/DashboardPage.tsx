import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getChats, type Chat } from '../api/chats'
import { getCourses, type Course } from '../api/courses'
import { useAuthStore } from '../store/authStore'
import { roleInSentence } from '../utils/roleLabels'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const [courses, setCourses] = useState<Course[]>([])
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [coursesData, chatsData] = await Promise.all([
          getCourses(),
          getChats(),
        ])

        setCourses(coursesData)
        setChats(chatsData)
      } catch {
        console.log('Не вдалося завантажити дані панелі керування')
      }
    }

    loadDashboardData()
  }, [])

  const joinedCoursesCount = courses.filter((course) => course.isJoined).length
  const chatsCount = chats.length

  const roleLabel = user?.role ? roleInSentence(user.role) : undefined

  return (
    <div>
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Раді бачити вас знову</p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          {user?.fullName ?? 'Користувач'}
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Ви ввійшли як <span className="font-medium">{roleLabel}</span>.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Курси</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {joinedCoursesCount}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            Курси, до яких ви приєдналися
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Чати</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {chatsCount}
          </p>

          <p className="mt-1 text-sm text-gray-600">Доступні розмови</p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          to="/dashboard/courses"
          className="rounded-xl border border-gray-200 bg-white p-5 no-underline hover:bg-gray-50"
        >
          <h2 className="font-semibold text-gray-900">Переглянути курси</h2>

          <p className="mt-2 text-sm text-gray-600">
            Знаходьте курси за назвою чи групою і приєднуйтесь до їхніх чатів.
          </p>
        </Link>

        <Link
          to="/dashboard/chats"
          className="rounded-xl border border-gray-200 bg-white p-5 no-underline hover:bg-gray-50"
        >
          <h2 className="font-semibold text-gray-900">Відкрити чати</h2>

          <p className="mt-2 text-sm text-gray-600">
            Продовжуйте розмови з викладачами та студентами.
          </p>
        </Link>
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">Робота без з’єднання</h2>

        <p className="mt-2 text-sm text-gray-600">
          CampusTalk зберігає курси, чати та повідомлення локально. Якщо
          зникне інтернет, ви все одно зможете переглядати кешовані дані та
          надсилати повідомлення — вони синхронізуються після відновлення
          з’єднання.
        </p>
      </section>
    </div>
  )
}