// src/pages/backoffice/BackofficeLayout.tsx
import { Outlet } from 'react-router-dom'

export default function BackofficeLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 hidden md:block">
        <h2 className="text-xl font-bold mb-4">Menu</h2>
        <nav className="flex flex-col gap-2">
          <a href="/backoffice/empresas" className="hover:underline">Empresas</a>
          <a href="#" className="hover:underline">Colaboradores</a>
          <a href="#" className="hover:underline">Eventos</a>
          <a href="#" className="hover:underline">Parâmetros</a>
          <a href="#" className="hover:underline">Seções</a>
        </nav>
      </aside>
      <div className="flex-1">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Backoffice</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Usuário</span>
            <img src="https://i.pravatar.cc/32" alt="avatar" className="rounded-full w-8 h-8" />
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}