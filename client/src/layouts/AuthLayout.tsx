import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f4f6fb] text-[#172033]">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <main className="flex items-center justify-center px-6 py-10">
          <Outlet />
        </main>

        <aside className="hidden bg-[#101d3a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium">
              CampusTalk
            </div>

            <h2 className="mt-8 max-w-md text-4xl font-bold leading-tight">
              Освітній простір для курсів, чатів і комунікації
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
              Система підтримує курси, приватні повідомлення, offline-режим і
              синхронізацію повідомлень після відновлення зʼєднання.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-5">
            <p className="text-sm text-white/70">Дипломний проєкт</p>
            <p className="mt-1 font-semibold">CampusTalk</p>
          </div>
        </aside>
      </div>
    </div>
  )
}