// src/components/layout/Header.tsx
import { Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchCurrentUser,
  getStoredToken,
  getStoredUser,
  logout,
  type AuthUser,
} from "../services/authService";

type HeaderProps = {
  onToggleSidebar: () => void;
};

const resolveUserLabel = (user: AuthUser | null): string => {
  const name = typeof user?.name === "string" ? user.name.trim() : "";
  if (name) {
    return name;
  }

  const email = typeof user?.email === "string" ? user.email.trim() : "";
  if (email) {
    return email;
  }

  return "Usuario";
};

export default function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!getStoredToken()) {
      setUser(null);
      return;
    }

    const loadUser = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(getStoredUser());
      }
    };

    void loadUser();
  }, []);

  useEffect(() => {
    if (!dropdownOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (dropdownOpen) {
      setUser(getStoredUser());
    }
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logout();
    } catch {
      // silent failure when token is expired
    }

    navigate("/");
  };

  const userLabel = useMemo(() => resolveUserLabel(user), [user]);
  const userEmail = typeof user?.email === "string" ? user.email : "";

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
        <img
          src={`${import.meta.env.BASE_URL}images/logo_iapotech.jpg`}
          alt="Grupo LOG"
          className="h-8 w-auto"
        />
        <nav className="hidden md:flex gap-6 ml-10">
          <Link to="/backoffice/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            Dashboard
          </Link>
          <Link to="/backoffice/dashboard/vencimentos" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            Vencimentos
          </Link>
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
            Parametros
          </Link>
        </nav>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setDropdownOpen((open) => !open)}
          className="flex items-center focus:outline-none"
          aria-label="Abrir menu do usuario"
        >
          <span className="text-sm text-gray-600 font-medium">{userLabel}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-md z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800 truncate">{userLabel}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail || "Sem email"}</p>
            </div>
            <Link
              to="/backoffice/perfil"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setDropdownOpen(false)}
            >
              Meu perfil
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

