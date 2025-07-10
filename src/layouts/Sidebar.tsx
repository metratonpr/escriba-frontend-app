// src/components/layout/Sidebar.tsx
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={`fixed md:static z-50 inset-y-0 left-0 transform md:transform-none bg-white w-64 border-r border-gray-200 p-4 transition-transform ease-in-out duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Escriba</h2>
        <button
          onClick={onClose}
          className="md:hidden text-gray-600 focus:outline-none"
          aria-label="Fechar menu"
        >
          <X size={24} />
        </button>
      </div>
      <nav className="flex flex-col gap-3">
        <Link
          to="/backoffice/entidades"
          className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          onClick={onClose}
        >
          Empresas
        </Link>
        <Link
          to="/backoffice/equipes"
          className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          onClick={onClose}
        >
          Equipes
        </Link>
        <Link
          to="/backoffice/eventos-acoes"
          className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          onClick={onClose}
        >
          Eventos
        </Link>
        <Link
          to="/backoffice/parametros"
          className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          onClick={onClose}
        >
          Parâmetros
        </Link>
        <Link
          to="/backoffice/secoes"
          className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          onClick={onClose}
        >
          Seções
        </Link>
      </nav>
    </aside>
  )
}
