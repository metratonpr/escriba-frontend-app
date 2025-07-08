import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function BackofficeLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => setMobileOpen(!mobileOpen)
  const closeSidebar = () => setMobileOpen(false)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onToggleSidebar={toggleSidebar} />

      {/* Overlay para mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden ${
          mobileOpen ? 'block' : 'hidden'
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar aparece somente no mobile como drawer */}
      <div className="md:hidden">
        <Sidebar isOpen={mobileOpen} onClose={closeSidebar} />
      </div>

      {/* Conteúdo principal ocupa 100% da tela no desktop */}
      <main className="flex-1 mt-8 px-4 sm:px-6 lg:px-8 min-h-0 overflow-y-auto max-w-7xl mx-auto w-full">
  <Outlet />
</main>

      <footer className="bg-white border-t border-gray-200 px-4 py-4 text-sm text-center text-gray-500">
        © {new Date().getFullYear()} Escriba APP - Desenolvido por Iapotech . Todos os direitos reservados.
      </footer>
    </div>
  )
}
