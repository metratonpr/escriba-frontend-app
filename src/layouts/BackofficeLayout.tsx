import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DRAWER_COMPACT_KEY = "escriba_drawer_compact";

export default function BackofficeLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compact, setCompact] = useState(() => localStorage.getItem(DRAWER_COMPACT_KEY) === "1");

  const toggleSidebar = () => setMobileOpen((prev) => !prev);
  const closeSidebar = () => setMobileOpen(false);

  const toggleCompact = () => {
    setCompact((prev) => {
      const next = !prev;
      localStorage.setItem(DRAWER_COMPACT_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={mobileOpen}
        compact={compact}
        onClose={closeSidebar}
        onToggleCompact={toggleCompact}
      />

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeSidebar}
          aria-label="Fechar drawer"
        />
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <Header onToggleSidebar={toggleSidebar} />

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        <footer className="border-t border-gray-200 bg-white px-4 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Logwood - SGD - Desenvolvido por Iapotech. Todos os
          direitos reservados.
        </footer>
      </div>
    </div>
  );
}
