// src/components/layout/Header.tsx
import { Menu } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchCurrentUser,
  getStoredToken,
  getStoredUser,
  isAdminUser,
  logout,
  type AuthUser,
} from "../services/authService";
import {
  BACKOFFICE_MAIN_SECTIONS,
  resolveBackofficeSectionByPath,
} from "./drawer/navigation";

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

  return "Usuário";
};

export default function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
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
  const canManageUsers = isAdminUser(user);
  const activeSection = useMemo(
    () => resolveBackofficeSectionByPath(location.pathname),
    [location.pathname]
  );
  const mainNavItems = useMemo(
    () => BACKOFFICE_MAIN_SECTIONS.filter((section) => section.key !== "perfil"),
    []
  );

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
        <Link to="/backoffice/dashboard" className="inline-flex items-center gap-2">
          <img
            src={`${import.meta.env.BASE_URL}images/logo_iapotech.jpg`}
            alt="Grupo LOG"
            className="h-8 w-auto"
          />
          <span className="hidden text-sm font-semibold text-gray-700 sm:inline">Backoffice</span>
        </Link>
        <nav className="hidden items-center gap-2 lg:flex">
          {mainNavItems.map((item) => {
            const isCurrent = activeSection.key === item.key;
            const target = item.items[0]?.to ?? item.to;
            return (
              <NavLink
                key={item.key}
                to={target}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isCurrent
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setDropdownOpen((open) => !open)}
          className="flex items-center focus:outline-none"
          aria-label="Abrir menu do usuário"
        >
          <span className="text-sm text-gray-600 font-medium">{userLabel}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-md z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800 truncate">{userLabel}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail || "Sem e-mail"}</p>
            </div>
            <Link
              to="/backoffice/perfil"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setDropdownOpen(false)}
            >
              Meu perfil
            </Link>
            {canManageUsers && (
              <Link
                to="/backoffice/perfil/usuarios"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Gerenciar usuários
              </Link>
            )}
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

