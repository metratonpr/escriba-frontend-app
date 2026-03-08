import type { ReactNode } from "react";

type DrawerSectionProps = {
  title?: string;
  compact?: boolean;
  children: ReactNode;
};

export default function DrawerSection({ title, compact = false, children }: DrawerSectionProps) {
  return (
    <div className="grid gap-1">
      {!compact && title ? (
        <small className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </small>
      ) : null}
      {children}
    </div>
  );
}
