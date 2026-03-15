import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

type DrawerLinkItemProps = {
  to: string;
  icon?: LucideIcon;
  label: string;
  compact?: boolean;
  isActive?: boolean;
  onNavigate?: () => void;
};

export default function DrawerLinkItem({
  to,
  icon: Icon,
  label,
  compact = false,
  isActive = false,
  onNavigate,
}: DrawerLinkItemProps) {
  return (
    <NavLink
      to={to}
      title={compact ? label : undefined}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
      className={[
        "group flex rounded-xl font-medium transition-colors",
        compact
          ? "flex-col items-center justify-center gap-1 px-1 py-2 text-[10px]"
          : "items-center gap-3 px-3 py-2 text-sm",
        isActive
          ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      ].join(" ")}
    >
      {Icon ? <Icon size={compact ? 16 : 18} className="shrink-0" /> : null}
      <span
        className={
          compact
            ? "max-w-full whitespace-normal text-center leading-tight"
            : "truncate"
        }
      >
        {label}
      </span>
    </NavLink>
  );
}
