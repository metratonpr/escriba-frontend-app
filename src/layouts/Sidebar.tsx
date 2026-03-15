import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import DrawerLinkItem from "./drawer/DrawerLinkItem";
import DrawerSection from "./drawer/DrawerSection";
import {
  resolveBackofficeSectionByPath,
  resolveDrawerItemByPath,
} from "./drawer/navigation";
import { isStoredUserAdmin } from "../services/authService";

type SidebarProps = {
  isOpen: boolean;
  compact: boolean;
  onClose: () => void;
  onToggleCompact: () => void;
};

export default function Sidebar({
  isOpen,
  compact,
  onClose,
  onToggleCompact,
}: SidebarProps) {
  const location = useLocation();
  const currentSection = resolveBackofficeSectionByPath(location.pathname);
  const isAdmin = isStoredUserAdmin();
  const visibleItems = currentSection.items.filter(
    (item) => !item.requiresAdmin || isAdmin
  );
  const activeItem = resolveDrawerItemByPath(location.pathname, visibleItems);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-out md:static md:translate-x-0 md:shadow-none ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${compact ? "md:w-24" : "md:w-72"}`}
      aria-label="Menu lateral"
    >
      <header className="flex items-center justify-end border-b border-slate-200 px-3 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleCompact}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 md:inline-flex"
            aria-label="Alternar drawer compacto"
          >
            {compact ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 md:hidden"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <nav className="flex-1 overflow-y-auto p-2">
        <DrawerSection title={currentSection.label} compact={compact}>
          {visibleItems.map((item) => (
            <DrawerLinkItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              compact={compact}
              isActive={item.to === activeItem?.to}
              onNavigate={onClose}
            />
          ))}
        </DrawerSection>
      </nav>
    </aside>
  );
}
