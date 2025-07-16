// src/components/layout/Header.tsx
import { Menu } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { logout } from '../services/authService'

type HeaderProps = {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // falha silenciosa em caso de token expirado
    }
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between md:px-6 w-full">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-gray-600 focus:outline-none"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Escriba APP</h1>
        <nav className="hidden md:flex gap-6 ml-10">
          <Link to="/backoffice/entidades" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            Empresas
          </Link>
          <Link to="/backoffice/equipes" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            Equipes
          </Link>
          <Link to="/backoffice/eventos-acoes" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            Eventos
          </Link>
          <Link to="/backoffice/parametros" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            Parâmetros
          </Link>
        </nav>
      </div>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 focus:outline-none"
          aria-label="Abrir menu do usuário"
        >
          <span className="text-sm text-gray-500">Usuário</span>
          <img src="https://i.pravatar.cc/32" alt="Avatar" className="rounded-full w-8 h-8 border border-gray-300" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
            <Link
              to="/backoffice/secoes"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setDropdownOpen(false)}
            >
              Seções
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
