import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  School,
  MessageCircle,
  Wifi,
  ArrowRight,
} from 'lucide-react'
import { getChats, type Chat } from '../api/chats'
import { useAuthStore } from '../store/authStore'
import { roleInSentence } from '../utils/roleLabels'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [chatsData] = await Promise.all([
          getChats(),
        ])

        setChats(chatsData)
      } catch {
        console.log('Не вдалося завантажити дані панелі керування')
      }
    }

    loadDashboardData()
  }, [])

  const unreadCount = chats.reduce(
    (sum, chat) => sum + (chat.unreadCount ?? 0),
    0,
  )

  const roleLabel = user?.role ? roleInSentence(user.role) : undefined

  return (
    <div>
      <section className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0b67a3]">
              CampusTalk
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight text-[#10182f] sm:text-4xl">
              Вітаємо, {user?.fullName ?? 'Користувач'}!
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
              Ви ввійшли як{' '}
              <span className="font-semibold text-[#10182f]">
                {roleLabel}
              </span>
              . Тут можна переглядати курси, приєднуватися до навчальних чатів
              і продовжувати спілкування без втрати повідомлень.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/dashboard/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b67a3] px-5 py-3 text-sm font-semibold text-white no-underline transition hover:bg-[#095985]"
              >
                Перейти до курсів
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/dashboard/chats"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-solid border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#10182f] no-underline transition hover:bg-gray-50"
              >
                Відкрити чати
                <MessageCircle size={18} />
              </Link>
            </div>
          </div>

          <div className="hidden rounded-3xl bg-[#f4f7fb] p-6 lg:block">
            <div className="flex h-56 items-center justify-center rounded-2xl bg-white">
              <School size={126} className="text-[#0b67a3]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[22px] bg-white p-5 shadow-sm sm:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Непрочитані</p>
            <div className="rounded-xl bg-[#eaf3fb] p-2 text-[#0b67a3]">
              <MessageCircle size={20} />
            </div>
          </div>

          <p className="mt-4 text-4xl font-bold text-[#10182f]">
            {unreadCount}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Нові повідомлення у ваших чатах.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Link
          to="/dashboard/courses"
          className="group rounded-[22px] bg-white p-6 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4 relative">
            <div>
              <h2 className="text-xl font-bold text-[#10182f]">
                Переглянути курси
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Знаходьте курси за назвою або групою, приєднуйтесь до чатів
                курсів і пишіть викладачам напряму.
              </p>
            </div>

            <ArrowRight
              size={26}
              className="text-gray-400 transition group-hover:translate-x-1 absolute right--2 group-hover:text-[#0b67a3]"
            />
          </div>
        </Link>

        <Link
          to="/dashboard/chats"
          className="group rounded-[22px] bg-white p-6 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4 relative">
            <div>
              <h2 className="text-xl font-bold text-[#10182f]">
                Відкрити чати
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Продовжуйте розмови з викладачами та студентами, переглядайте
                вкладення й отримуйте повідомлення в реальному часі.
              </p>
            </div>

            <ArrowRight
              size={26}
              className="text-gray-400 transition group-hover:translate-x-1 absolute right--2 group-hover:text-[#0b67a3]"
            />
          </div>
        </Link>
      </section>

      <section className="mt-6 rounded-[22px] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="rounded-2xl bg-[#eaf3fb] p-3 text-[#0b67a3] w-52px h-52px flex items-center justify-center">
            <Wifi size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#10182f]">
              Робота без з’єднання
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              CampusTalk зберігає курси, чати та повідомлення локально. Якщо
              зникне інтернет, ви зможете переглядати кешовані дані та
              створювати повідомлення — вони синхронізуються після відновлення
              з’єднання.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}